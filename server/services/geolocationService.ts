// Using built-in fetch (Node.js 18+)

interface CellTowerLocation {
  mcc: number;  // Mobile Country Code
  mnc: number;  // Mobile Network Code  
  lac: number;  // Location Area Code
  cid: number;  // Cell ID
}

interface GeolocationResponse {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  address?: string;
  error?: string;
}

export class GeolocationService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://cellid-geolocation-api.p.rapidapi.com';

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || 'b259245075msheaa1cce3545af52p113101jsn047c7e7d574f';
  }

  async getCellTowerLocation(cellData: CellTowerLocation): Promise<GeolocationResponse> {
    try {
      const url = `${this.baseUrl}/query?mcc=${cellData.mcc}&mnc=${cellData.mnc}&lac=${cellData.lac}&cid=${cellData.cid}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'cellid-geolocation-api.p.rapidapi.com',
          'x-rapidapi-key': this.apiKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes('not subscribed')) {
          throw new Error('RapidAPI subscription required for geolocation service');
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json() as any;
      
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        address: data.address || `${data.latitude}, ${data.longitude}`
      };
    } catch (error) {
      console.error('Geolocation API error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown geolocation error'
      };
    }
  }

  async getLocationFromGPS(latitude: number, longitude: number): Promise<GeolocationResponse> {
    // For GPS coordinates, we can use reverse geocoding or return the coordinates directly
    return {
      latitude,
      longitude,
      accuracy: 10, // GPS typically has ~10m accuracy
      address: `${latitude}, ${longitude}`
    };
  }

  async validateLocation(latitude: number, longitude: number): Promise<boolean> {
    // Basic validation for Hawaii coordinates
    const hawaiiLatRange = [18.9, 22.5];  // Hawaii latitude range
    const hawaiiLonRange = [-161.0, -154.8]; // Hawaii longitude range
    
    return latitude >= hawaiiLatRange[0] && latitude <= hawaiiLatRange[1] &&
           longitude >= hawaiiLonRange[0] && longitude <= hawaiiLonRange[1];
  }

  async trackClientLocation(clientId: string, locationData: CellTowerLocation | {lat: number, lon: number}): Promise<any> {
    let location: GeolocationResponse;
    
    if ('mcc' in locationData) {
      // Cell tower data
      location = await this.getCellTowerLocation(locationData);
    } else {
      // GPS coordinates
      location = await this.getLocationFromGPS(locationData.lat, locationData.lon);
    }

    if (location.error) {
      throw new Error(location.error);
    }

    // Validate location is within Hawaii (for bail bond jurisdiction)
    if (location.latitude && location.longitude) {
      const isValid = await this.validateLocation(location.latitude, location.longitude);
      
      return {
        clientId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        address: location.address,
        timestamp: new Date().toISOString(),
        withinJurisdiction: isValid,
        source: 'mcc' in locationData ? 'cell_tower' : 'gps'
      };
    }

    throw new Error('Invalid location data received');
  }
}

export const geolocationService = new GeolocationService();