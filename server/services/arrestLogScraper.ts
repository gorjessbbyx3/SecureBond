import { load } from 'cheerio';

interface ArrestRecord {
  id: string;
  name: string;
  arrestDate: string;
  arrestTime: string;
  location: string;
  charges: string[];
  agency: string;
  county: string;
  bookingNumber: string;
  status: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  age?: number;
  address?: string;
}

interface ArrestLogPDF {
  url: string;
  filename: string;
  timestamp: Date;
}

export class ArrestLogScraper {
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  private readonly HPD_ARREST_LOGS_URL = 'https://www.honolulupd.org/information/arrest-logs/';
  private readonly HPD_PDF_BASE_URL = 'https://www.honolulupd.org/wp-content/hpd/arrest-logs/';
  private readonly MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB max
  private pdfCache: Map<string, { records: ArrestRecord[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 3600000; // 1 hour in milliseconds
  private inFlightRequests: Map<string, Promise<ArrestRecord[]>> = new Map(); // Prevent thundering herd

  async getMostRecentPDF(): Promise<ArrestLogPDF | null> {
    try {
      // HPD posts PDFs with the pattern: YYYY-MM-DD-HH-MM-SS_Arrest_Log.pdf
      // Try to find the most recent one by checking recent timestamps
      const now = new Date();
      const attempts: ArrestLogPDF[] = [];
      
      // Try current hour and previous hours (up to 12 hours back)
      for (let hoursBack = 0; hoursBack < 12; hoursBack++) {
        const checkTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);
        
        // Try different minute intervals (00, 05, 10, 15, etc.)
        for (const minutes of [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]) {
          checkTime.setMinutes(minutes);
          checkTime.setSeconds(0);
          
          const year = checkTime.getFullYear();
          const month = String(checkTime.getMonth() + 1).padStart(2, '0');
          const day = String(checkTime.getDate()).padStart(2, '0');
          const hour = String(checkTime.getHours()).padStart(2, '0');
          const min = String(checkTime.getMinutes()).padStart(2, '0');
          const sec = '00';
          
          const filename = `${year}-${month}-${day}-${hour}-${min}-${sec}_Arrest_Log.pdf`;
          const url = `${this.HPD_PDF_BASE_URL}${filename}`;
          
          attempts.push({
            url,
            filename,
            timestamp: new Date(checkTime)
          });
        }
      }
      
      // Try each URL until we find one that exists
      for (const attempt of attempts) {
        try {
          const response = await fetch(attempt.url, {
            method: 'HEAD', // Just check if it exists without downloading
            headers: {
              'User-Agent': this.userAgent,
            },
            signal: AbortSignal.timeout(5000),
          });
          
          if (response.ok) {
            console.log(`Found HPD arrest log PDF: ${attempt.filename}`);
            return attempt;
          }
        } catch (error) {
          // Continue to next attempt
          continue;
        }
      }
      
      console.log('No recent HPD arrest log PDF found');
      return null;
    } catch (error) {
      console.error('Error fetching HPD arrest log PDF:', error);
      return null;
    }
  }

  async downloadAndParsePDF(pdfUrl: string): Promise<string> {
    try {
      const response = await fetch(pdfUrl, {
        headers: {
          'User-Agent': this.userAgent,
        },
        signal: AbortSignal.timeout(60000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check content length before downloading
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > this.MAX_PDF_SIZE) {
        throw new Error(`PDF file too large: ${contentLength} bytes (max ${this.MAX_PDF_SIZE})`);
      }

      const arrayBuffer = await response.arrayBuffer();
      
      // Double-check size after download
      if (arrayBuffer.byteLength > this.MAX_PDF_SIZE) {
        throw new Error(`PDF file too large: ${arrayBuffer.byteLength} bytes (max ${this.MAX_PDF_SIZE})`);
      }
      
      const buffer = Buffer.from(arrayBuffer);
      
      // Dynamic import to avoid initialization issues with pdf-parse
      const pdf = (await import('pdf-parse')).default;
      const data = await pdf(buffer);
      return data.text;
    } catch (error) {
      console.error('Error downloading/parsing PDF:', error);
      throw error;
    }
  }

  private parseArrestRecordsFromText(text: string): ArrestRecord[] {
    const records: ArrestRecord[] = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let currentRecord: Partial<ArrestRecord> = {};
    let recordCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Improved name patterns to support various formats:
      // - "LAST, FIRST MI" (comma-separated)
      // - "FIRST LAST" (space-separated)
      // - Names with hyphens (e.g., "SMITH-JONES")
      // - Names with suffixes (e.g., "JOHN DOE JR")
      const namePatterns = [
        /^([A-Z][A-Z\-'\s]+[A-Z]),\s*([A-Z][A-Z\-'\s]*)\s*([A-Z]\.?)?$/,  // LAST, FIRST MI
        /^([A-Z][A-Z\-'\s]+[A-Z])\s+([A-Z][A-Z\-'\s]+[A-Z])(?:\s+(JR|SR|II|III|IV))?$/,  // FIRST LAST [SUFFIX]
        /^([A-Z][A-Z\-'\s]{2,}[A-Z])\s*$/  // Generic all-caps name
      ];
      
      let matchedName = null;
      for (const pattern of namePatterns) {
        const match = line.match(pattern);
        if (match && line.length > 5 && line.length < 60) {
          matchedName = line;
          break;
        }
      }
      
      if (matchedName) {
        // Save previous record if exists
        if (currentRecord.name) {
          records.push(this.finalizeRecord(currentRecord, recordCount++));
          currentRecord = {};
        }
        
        currentRecord.name = matchedName.trim();
        continue;
      }
      
      // Look for booking numbers
      const bookingMatch = line.match(/(?:BOOKING|BK|CASE|ARREST)[\s#:]*([A-Z0-9\-]+)/i);
      if (bookingMatch) {
        currentRecord.bookingNumber = bookingMatch[1];
        continue;
      }
      
      // Look for dates (MM/DD/YYYY, MM-DD-YYYY, etc.)
      const dateMatch = line.match(/(\d{1,2}[-/]\d{1,2}[-/]\d{4})/);
      if (dateMatch && !currentRecord.arrestDate) {
        currentRecord.arrestDate = dateMatch[1].replace(/\//g, '-');
        continue;
      }
      
      // Look for time (HH:MM AM/PM or HH:MM)
      const timeMatch = line.match(/(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i);
      if (timeMatch && !currentRecord.arrestTime) {
        currentRecord.arrestTime = timeMatch[1];
        continue;
      }
      
      // Look for age
      const ageMatch = line.match(/AGE[:\s]*(\d{1,3})|(\d{1,3})\s*YRS?\.?/i);
      if (ageMatch) {
        currentRecord.age = parseInt(ageMatch[1] || ageMatch[2]);
        continue;
      }
      
      // Look for address
      if (line.match(/\d+\s+[A-Z\s]+(?:STREET|ST|AVENUE|AVE|ROAD|RD|DRIVE|DR|LANE|LN|BOULEVARD|BLVD)/i)) {
        currentRecord.address = line;
        continue;
      }
      
      // Look for charges (common charge keywords)
      if (line.match(/ASSAULT|THEFT|BURGLARY|ROBBERY|DUI|DRUG|POSSESSION|WARRANT|TRESPASS|FRAUD|BATTERY|VANDALISM/i)) {
        if (!currentRecord.charges) {
          currentRecord.charges = [];
        }
        currentRecord.charges.push(line);
        continue;
      }
      
      // Look for location
      if (line.match(/HONOLULU|OAHU|HAWAII|MAUI|KAUAI/i)) {
        if (!currentRecord.location) {
          currentRecord.location = line;
        }
      }
    }
    
    // Don't forget the last record
    if (currentRecord.name) {
      records.push(this.finalizeRecord(currentRecord, recordCount++));
    }
    
    return records;
  }

  private finalizeRecord(record: Partial<ArrestRecord>, index: number): ArrestRecord {
    const today = new Date();
    const charges = record.charges || ['Charges not specified'];
    
    return {
      id: record.bookingNumber || `arrest_${Date.now()}_${index}`,
      name: record.name || 'Name Unknown',
      arrestDate: record.arrestDate || today.toISOString().split('T')[0],
      arrestTime: record.arrestTime || '00:00',
      location: record.location || 'Honolulu, HI',
      charges: charges,
      agency: 'Honolulu Police Department',
      county: 'Honolulu',
      bookingNumber: record.bookingNumber || `BK${Date.now().toString().slice(-8)}`,
      status: 'Active',
      severity: this.determineSeverity(charges),
      age: record.age,
      address: record.address
    };
  }

  async scrapeHonoluluPD(): Promise<ArrestRecord[]> {
    try {
      // First, try to get the most recent PDF
      const recentPDF = await this.getMostRecentPDF();
      
      if (recentPDF) {
        // Check cache first
        const cached = this.pdfCache.get(recentPDF.url);
        const now = Date.now();
        
        if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
          console.log(`Using cached arrest records for: ${recentPDF.filename} (${cached.records.length} records)`);
          return cached.records;
        }
        
        // Check if request is already in-flight (prevent thundering herd)
        const inFlight = this.inFlightRequests.get(recentPDF.url);
        if (inFlight) {
          console.log(`Waiting for in-flight request for: ${recentPDF.filename}`);
          return await inFlight;
        }
        
        // Create promise for this request
        const requestPromise = (async () => {
          try {
            console.log(`Found recent PDF: ${recentPDF.filename}`);
            const pdfText = await this.downloadAndParsePDF(recentPDF.url);
            const records = this.parseArrestRecordsFromText(pdfText);
            
            if (records.length > 0) {
              console.log(`Successfully extracted ${records.length} arrest records from PDF`);
              
              // Cache the results
              this.pdfCache.set(recentPDF.url, {
                records: records,
                timestamp: now
              });
              
              // Clean up old cache entries (keep cache size manageable)
              if (this.pdfCache.size > 5) {
                const oldestKey = Array.from(this.pdfCache.entries())
                  .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
                this.pdfCache.delete(oldestKey);
              }
              
              return records;
            } else {
              console.warn('No records extracted from PDF, falling back to HTML scraping');
              return [];
            }
          } catch (pdfError) {
            console.error('Error parsing PDF, falling back to HTML scraping:', pdfError);
            return [];
          } finally {
            // Clean up in-flight request
            this.inFlightRequests.delete(recentPDF.url);
          }
        })();
        
        // Store in-flight request
        this.inFlightRequests.set(recentPDF.url, requestPromise);
        
        const records = await requestPromise;
        if (records.length > 0) {
          return records;
        }
      }

      // Fallback: Try to scrape from HTML page
      const response = await fetch(this.HPD_ARREST_LOGS_URL, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = load(html);
      const records: ArrestRecord[] = [];

      // Try to extract any tabular data from the page
      $('table tr').each((index, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 3) {
          const name = $(cells[0]).text().trim();
          const charges = $(cells[1]).text().trim();
          const booking = $(cells[2]).text().trim();
          
          if (name && name.length > 3) {
            records.push({
              id: `hpd_${Date.now()}_${index}`,
              name: name,
              arrestDate: new Date().toISOString().split('T')[0],
              arrestTime: '00:00',
              location: 'Honolulu, HI',
              charges: charges ? [charges] : ['Charges not specified'],
              agency: 'Honolulu Police Department',
              county: 'Honolulu',
              bookingNumber: booking || `BK${Date.now().toString().slice(-8)}`,
              status: 'Active',
              severity: this.determineSeverity([charges])
            });
          }
        }
      });

      return records;
    } catch (error) {
      console.error('Error scraping Honolulu PD arrest logs:', error);
      return [];
    }
  }

  private determineSeverity(charges: string[]): 'low' | 'medium' | 'high' | 'critical' {
    const chargeText = charges.join(' ').toLowerCase();
    
    if (chargeText.includes('murder') || chargeText.includes('homicide') || chargeText.includes('kidnapping')) {
      return 'critical';
    }
    if (chargeText.includes('assault') || chargeText.includes('robbery') || chargeText.includes('burglary')) {
      return 'high';
    }
    if (chargeText.includes('theft') || chargeText.includes('drug') || chargeText.includes('dui')) {
      return 'medium';
    }
    return 'low';
  }

  async scrapeAllCounties(): Promise<ArrestRecord[]> {
    const allRecords: ArrestRecord[] = [];
    
    // Scrape Honolulu PD (primary source with PDF support)
    const honoluluRecords = await this.scrapeHonoluluPD();
    allRecords.push(...honoluluRecords);

    // For other counties, we would need their specific URLs and API access
    // Currently only Honolulu PD has a public arrest log page
    
    return allRecords;
  }
}

export const arrestLogScraper = new ArrestLogScraper();
