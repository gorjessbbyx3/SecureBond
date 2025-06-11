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
}

export class ArrestLogScraper {
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

  async scrapeHonoluluPD(): Promise<ArrestRecord[]> {
    try {
      const response = await fetch('https://www.honolulupd.org/information/arrest-logs/', {
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
      const records: ArrestRecord[] = [];

      // Parse arrest log table - adjust selectors based on actual HTML structure
      $('table tr').each((index: number, element: any) => {
        if (index === 0) return; // Skip header row

        const cells = $(element).find('td');
        if (cells.length >= 6) {
          const name = $(cells[0]).text().trim();
          const arrestDate = $(cells[1]).text().trim();
          const arrestTime = $(cells[2]).text().trim();
          const location = $(cells[3]).text().trim();
          const charges = $(cells[4]).text().trim().split(',').map((c: string) => c.trim());
          const bookingNumber = $(cells[5]).text().trim();

          if (name && arrestDate) {
            records.push({
              id: `honolulu-${Date.now()}-${index}`,
              name,
              arrestDate,
              arrestTime: arrestTime || '00:00:00',
              location: location || 'Honolulu County',
              charges,
              agency: 'Honolulu Police Department',
              county: 'Honolulu',
              bookingNumber: bookingNumber || `HPD-${Date.now()}-${index}`,
              status: 'Booked',
              severity: this.determineSeverity(charges)
            });
          }
        }
      });

      return records;
    } catch (error) {
      console.error('Error scraping Honolulu PD arrest logs:', error);
      // Return empty array instead of throwing to maintain system stability
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
    
    // Scrape Honolulu PD (authentic source)
    const honoluluRecords = await this.scrapeHonoluluPD();
    allRecords.push(...honoluluRecords);

    // For other counties, we would need their specific URLs and API access
    // Currently only Honolulu PD has a public arrest log page
    
    return allRecords;
  }
}

export const arrestLogScraper = new ArrestLogScraper();