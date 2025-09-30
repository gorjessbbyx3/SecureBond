import { load } from 'cheerio';
import pdf from 'pdf-parse';

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

  async getMostRecentPDF(): Promise<ArrestLogPDF | null> {
    try {
      const response = await fetch(this.HPD_ARREST_LOGS_URL, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = load(html);
      
      // Find all PDF links
      const pdfLinks: ArrestLogPDF[] = [];
      
      // Look for PDF links with various patterns
      $('a[href$=".pdf"], a[href*="Arrest"], a[href*="arrest"], a[href*="booking"]').each((index, element) => {
        const href = $(element).attr('href');
        const text = $(element).text().trim();
        
        if (href && href.toLowerCase().includes('.pdf')) {
          let fullUrl = href;
          if (!href.startsWith('http')) {
            const baseUrl = new URL(this.HPD_ARREST_LOGS_URL);
            fullUrl = new URL(href, baseUrl.origin).toString();
          }
          
          // Try to extract date from filename or text
          const dateMatch = text.match(/(\d{4}[-_]\d{2}[-_]\d{2})|(\d{1,2}[-/]\d{1,2}[-/]\d{4})|(\w+\s+\d{1,2},?\s+\d{4})/);
          let timestamp = new Date();
          
          if (dateMatch) {
            timestamp = new Date(dateMatch[0].replace(/_/g, '-'));
          }
          
          pdfLinks.push({
            url: fullUrl,
            filename: text || href.split('/').pop() || 'arrest_log.pdf',
            timestamp: timestamp
          });
        }
      });

      // Sort by timestamp descending (most recent first)
      pdfLinks.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Return the most recent PDF
      return pdfLinks.length > 0 ? pdfLinks[0] : null;
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

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
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
      
      // Look for name patterns (usually all caps or title case)
      const nameMatch = line.match(/^([A-Z][A-Z\s]+[A-Z])\s*$/);
      if (nameMatch && line.length > 5 && line.length < 50) {
        // Save previous record if exists
        if (currentRecord.name) {
          records.push(this.finalizeRecord(currentRecord, recordCount++));
          currentRecord = {};
        }
        
        currentRecord.name = nameMatch[1].trim();
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
        console.log(`Found recent PDF: ${recentPDF.filename}`);
        try {
          const pdfText = await this.downloadAndParsePDF(recentPDF.url);
          const records = this.parseArrestRecordsFromText(pdfText);
          
          if (records.length > 0) {
            console.log(`Successfully extracted ${records.length} arrest records from PDF`);
            return records;
          }
        } catch (pdfError) {
          console.error('Error parsing PDF, falling back to HTML scraping:', pdfError);
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
