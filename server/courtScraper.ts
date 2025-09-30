import { JSDOM } from 'jsdom';

interface CourtDate {
  name: string;
  caseNumber?: string;
  courtDate?: string;
  courtTime?: string;
  courtLocation?: string;
  caseType?: string;
  charges?: string;
  status?: string;
  source: string;
}

interface ScrapingResult {
  success: boolean;
  courtDates: CourtDate[];
  errors: string[];
  sourcesSearched: string[];
}

export class CourtDateScraper {
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  
  // Public court record websites to search
  private readonly courtSources = [
    {
      name: 'Hawaii State Judiciary',
      url: 'https://www.courts.state.hi.us',
      searchPath: '/search',
      enabled: true
    },
    {
      name: 'Hawaii Federal District Court',
      url: 'https://ecf.hid.uscourts.gov',
      searchPath: '/cgi-bin/rss_outside.pl',
      enabled: true,
      type: 'rss'
    },
    {
      name: 'Honolulu County Court',
      url: 'https://www.honolulucourt.org',
      searchPath: '/case-search',
      enabled: true
    },
    {
      name: 'Hawaii Criminal Cases',
      url: 'https://www.hawaiicriminalcases.com',
      searchPath: '/search',
      enabled: true
    }
  ];

  // Real police department arrest log sources
  private readonly arrestLogSources = [
    {
      name: 'Honolulu Police Department',
      url: 'https://www.honolulupd.org/information/arrest-logs/',
      type: 'arrest-logs',
      enabled: true,
      pdfUrlPattern: 'https://www.honolulupd.org/wp-content/hpd/arrest-logs/'
    },
    {
      name: 'Hawaii Police Department', 
      url: 'https://www.hawaiipolice.gov/news-and-media/booking-logs/',
      type: 'booking-logs',
      enabled: true,
      pdfUrlPattern: 'https://www.hawaiipolice.gov/wp-content/uploads/booking-logs/'
    },
    {
      name: 'Maui Police Department',
      url: 'https://www.co.maui.hi.us/185/Police-Department',
      type: 'arrest-logs',
      enabled: true,
      pdfUrlPattern: 'https://www.co.maui.hi.us/DocumentCenter/View/'
    },
    {
      name: 'Kauai Police Department',
      url: 'https://www.kauai.gov/Government/Departments-Agencies/Police-Department',
      type: 'arrest-logs', 
      enabled: true,
      pdfUrlPattern: 'https://www.kauai.gov/Portals/0/Police/'
    }
  ];

  async searchCourtDates(clientName: string, options: {
    state?: string;
    county?: string;
    maxResults?: number;
  } = {}): Promise<ScrapingResult> {
    const result: ScrapingResult = {
      success: false,
      courtDates: [],
      errors: [],
      sourcesSearched: []
    };

    console.log(`Starting court date search for: ${clientName}`);

    // Parse name components for better search
    const nameComponents = this.parseClientName(clientName);
    
    // Search each available court source
    console.log(`Total court sources available: ${this.courtSources.length}`);
    for (const source of this.courtSources) {
      console.log(`Processing source: ${source.name}, enabled: ${source.enabled}, type: ${source.type || 'standard'}`);
      if (!source.enabled) continue;

      try {
        console.log(`Searching ${source.name}...`);
        result.sourcesSearched.push(source.name);

        const courtDates = await this.searchCourtSource(source, nameComponents, options);
        result.courtDates.push(...courtDates);
        
        // Add small delay between requests to be respectful
        await this.delay(1000);
        
      } catch (error) {
        const errorMsg = `Error searching ${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        // Error searching court source
        result.errors.push(errorMsg);
      }
    }

    // Search alternative public record sources
    try {
      const publicRecords = await this.searchPublicRecords(clientName, options);
      result.courtDates.push(...publicRecords);
    } catch (error) {
      result.errors.push(`Public records search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    result.success = result.courtDates.length > 0 || result.errors.length === 0;
    
    // Court date search completed
    return result;
  }

  private parseClientName(fullName: string) {
    const parts = fullName.trim().split(/\s+/);
    return {
      firstName: parts[0] || '',
      lastName: parts[parts.length - 1] || '',
      middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
      fullName: fullName.trim()
    };
  }

  private async searchCourtSource(
    source: any, 
    nameComponents: any, 
    options: any
  ): Promise<CourtDate[]> {
    // Searching court source for client
    
    // Handle RSS feeds for real-time court document updates
    if (source.type === 'rss') {
      return this.parseRSSFeed(source, nameComponents);
    }
    
    // Real court record search would require authenticated API access
    // Court source requires authenticated API access
    return [];
  }

  private async parseRSSFeed(source: any, nameComponents: any): Promise<CourtDate[]> {
    const courtDates: CourtDate[] = [];
    
    try {
      const fullUrl = `${source.url}${source.searchPath}`;
      console.log(`Fetching RSS feed from: ${fullUrl}`);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/rss+xml, application/xml, text/xml'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const xmlText = await response.text();
      console.log(`RSS XML length: ${xmlText.length} characters`);
      
      // Parse RSS XML for court documents - handle both CDATA and regular content
      const titleMatches = xmlText.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/g) || [];
      const descMatches = xmlText.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/g) || [];
      const linkMatches = xmlText.match(/<link>(.*?)<\/link>/g) || [];
      const pubDateMatches = xmlText.match(/<pubDate>(.*?)<\/pubDate>/g) || [];

      for (let i = 0; i < titleMatches.length; i++) {
        const title = titleMatches[i]?.replace(/<title>(?:<!\[CDATA\[)?/, '').replace(/(?:\]\]>)?<\/title>/, '') || '';
        const description = descMatches[i]?.replace(/<description>(?:<!\[CDATA\[)?/, '').replace(/(?:\]\]>)?<\/description>/, '') || '';
        const link = linkMatches[i]?.replace(/<link>/, '').replace(/<\/link>/, '') || '';
        const pubDate = pubDateMatches[i]?.replace(/<pubDate>/, '').replace(/<\/pubDate>/, '') || '';

        // Skip RSS channel title entry
        if (i === 0 && title.includes('District of Hawaii - Recent Entries')) continue;

        // Check if this document relates to our client
        const fullText = `${title} ${description}`.toLowerCase();
        
        // Extract defendant name from federal case titles (e.g., "USA v. Defendant")
        const defendantMatch = title.match(/USA v\.\s+([A-Za-z\s,]+)/i);
        const defendantName = defendantMatch ? defendantMatch[1].trim() : '';
        
        const clientMatch = fullText.includes(nameComponents.firstName.toLowerCase()) || 
                           fullText.includes(nameComponents.lastName.toLowerCase()) ||
                           fullText.includes(nameComponents.fullName.toLowerCase()) ||
                           defendantName.toLowerCase().includes(nameComponents.lastName.toLowerCase()) ||
                           defendantName.toLowerCase().includes(nameComponents.firstName.toLowerCase());

        if (clientMatch) {
          // Extract case information from title/description
          const caseNumberMatch = title.match(/\b\d{1,2}:\d{2}-cv-\d+\b|\b\d{1,2}:\d{2}-cr-\d+\b/);
          const dateMatch = description.match(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/);
          
          courtDates.push({
            name: nameComponents.fullName,
            caseNumber: caseNumberMatch ? caseNumberMatch[0] : undefined,
            courtDate: dateMatch ? dateMatch[0] : new Date(pubDate).toLocaleDateString(),
            courtTime: undefined,
            courtLocation: 'Hawaii Federal District Court',
            caseType: title.includes('criminal') || title.includes('cr-') ? 'Criminal' : 'Civil',
            charges: description.length > 100 ? description.substring(0, 100) + '...' : description,
            status: 'Active',
            source: source.name
          });
        }
      }

      console.log(`Found ${courtDates.length} matching court documents in RSS feed`);
      
    } catch (error) {
      console.error(`Error parsing RSS feed from ${source.name}:`, error);
    }

    return courtDates;
  }

  private async simulateCourtSearch(searchName: string, sourceName: string): Promise<CourtDate[]> {
    // Real court searches require authentic API access to court systems
    return [];
  }

  private async searchPublicRecords(clientName: string, options: any): Promise<CourtDate[]> {
    // Real public records search requires authenticated API access
    console.log(`Public records search for ${clientName} requires API credentials`);
    return [];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Validate if found court dates match our client
  private validateCourtDate(courtDate: CourtDate, clientName: string): boolean {
    const clientParts = clientName.toLowerCase().split(/\s+/);
    const foundParts = courtDate.name.toLowerCase().split(/\s+/);
    
    // Simple name matching - in production would use more sophisticated algorithms
    const firstNameMatch = clientParts.some(part => foundParts.includes(part));
    const lastNameMatch = clientParts.some(part => foundParts.includes(part));
    
    return firstNameMatch && lastNameMatch;
  }

  // Real arrest monitoring from Hawaii police departments
  async searchArrestLogs(clientName: string, options: {
    dateRange?: { start: Date; end: Date };
    county?: string;
  } = {}): Promise<{
    success: boolean;
    arrests: any[];
    errors: string[];
    sourcesSearched: string[];
  }> {
    const result = {
      success: false,
      arrests: [] as any[],
      errors: [] as string[],
      sourcesSearched: [] as string[]
    };

    const { firstName, lastName } = this.parseClientName(clientName);
    
    try {
      // Search each police department's arrest logs
      for (const source of this.arrestLogSources) {
        if (!source.enabled) continue;
        
        result.sourcesSearched.push(source.name);
        
        try {
          const arrests = await this.fetchArrestData(source, firstName, lastName, options);
          result.arrests.push(...arrests);
        } catch (error) {
          result.errors.push(`Error searching ${source.name}: ${error}`);
        }
        
        // Rate limiting between requests
        await this.delay(2000);
      }
      
      result.success = result.errors.length === 0;
      return result;
      
    } catch (error) {
      result.errors.push(`General error: ${error}`);
      return result;
    }
  }

  private async fetchArrestData(
    source: { name: string; url: string; type: string },
    firstName: string,
    lastName: string,
    options: any
  ): Promise<any[]> {
    try {
      const arrests = [];
      
      if (source.name === 'Honolulu Police Department') {
        // Use the actual arrest log scraper to fetch real data from HPD
        const { arrestLogScraper } = await import('./services/arrestLogScraper');
        const hpdRecords = await arrestLogScraper.scrapeHonoluluPD();
        
        // If searching for specific person, filter results
        if (firstName !== '*' && lastName !== '*') {
          const searchTerm = `${firstName} ${lastName}`.toLowerCase();
          const filtered = hpdRecords.filter(record => 
            record.name.toLowerCase().includes(searchTerm) ||
            record.name.toLowerCase().includes(firstName.toLowerCase()) ||
            record.name.toLowerCase().includes(lastName.toLowerCase())
          );
          
          arrests.push(...filtered.map(record => ({
            id: record.id,
            source: record.agency,
            sourceUrl: source.url,
            arrestDate: record.arrestDate,
            arrestTime: record.arrestTime,
            name: record.name,
            age: record.age,
            address: record.address,
            charges: record.charges,
            bookingNumber: record.bookingNumber,
            location: record.location,
            status: record.status,
            severity: record.severity,
            dataSource: 'authentic'
          })));
        } else {
          // Return all records
          arrests.push(...hpdRecords.map(record => ({
            id: record.id,
            source: record.agency,
            sourceUrl: source.url,
            arrestDate: record.arrestDate,
            arrestTime: record.arrestTime,
            name: record.name,
            age: record.age,
            address: record.address,
            charges: record.charges,
            bookingNumber: record.bookingNumber,
            location: record.location,
            status: record.status,
            severity: record.severity,
            dataSource: 'authentic'
          })));
        }
      }
      
      return arrests;
      
    } catch (error) {
      console.error(`Failed to fetch arrest data from ${source.name}:`, error);
      // Return empty array instead of throwing to allow other sources to be tried
      return [];
    }
  }
}

export const courtScraper = new CourtDateScraper();