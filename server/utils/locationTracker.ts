import { promises as fs } from 'fs';
import path from 'path';
import { auditLogger } from './auditLogger';

export interface LocationData {
  id: string;
  clientId: number;
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: Date;
  accuracy: number;
  source: 'check_in' | 'tracking' | 'manual';
  verified: boolean;
}

export interface FrequentLocation {
  id: string;
  clientId: number;
  latitude: number;
  longitude: number;
  address?: string;
  visitCount: number;
  firstVisit: Date;
  lastVisit: Date;
  averageStayDuration: number; // minutes
  timeSpentTotal: number; // minutes
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  locationNotes: string[];
  isHomeBased: boolean;
  isWorkBased: boolean;
  isSuspicious: boolean;
}

export interface LocationPattern {
  clientId: number;
  patternType: 'ROUTINE' | 'IRREGULAR' | 'SUSPICIOUS' | 'COMPLIANT';
  analysis: {
    homeBaseLocation?: FrequentLocation;
    workLocation?: FrequentLocation;
    frequentLocations: FrequentLocation[];
    unusualLocations: LocationData[];
    travelRadius: number; // miles
    complianceScore: number; // 0-100
    riskFactors: string[];
  };
  lastAnalysis: Date;
  predictedNextLocations: Array<{
    location: FrequentLocation;
    probability: number;
    timeWindow: string;
  }>;
}

export interface SkipBailRiskAssessment {
  clientId: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number; // 0-100
  factors: {
    locationCompliance: number;
    patternStability: number;
    homeBaseStability: number;
    unexpectedMovements: number;
    checkInCompliance: number;
  };
  alerts: Array<{
    type: string;
    severity: string;
    message: string;
    timestamp: Date;
  }>;
  recommendations: string[];
  lastAssessment: Date;
}

class LocationTracker {
  private dataDir: string;
  private readonly LOCATION_CLUSTER_RADIUS = 0.1; // miles - locations within this radius are considered the same
  private readonly FREQUENT_THRESHOLD = 3; // minimum visits to be considered frequent
  private readonly SUSPICIOUS_RADIUS = 50; // miles from home base before flagging as suspicious
  private readonly COMPLIANCE_DAYS = 30; // days to analyze for compliance

  constructor() {
    this.dataDir = path.join(process.cwd(), 'location-data');
    this.initializeLocationTracking();
  }

  private async initializeLocationTracking() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.mkdir(path.join(this.dataDir, 'daily'), { recursive: true });
      await fs.mkdir(path.join(this.dataDir, 'analysis'), { recursive: true });
      await fs.mkdir(path.join(this.dataDir, 'patterns'), { recursive: true });
      
      console.log('Location tracking system initialized');
    } catch (error) {
      console.error('Failed to initialize location tracking:', error);
    }
  }

  async recordLocation(locationData: Omit<LocationData, 'id'>): Promise<LocationData> {
    const location: LocationData = {
      id: this.generateLocationId(),
      ...locationData,
      timestamp: new Date(),
    };

    try {
      // Store in daily file
      const dateStr = location.timestamp.toISOString().split('T')[0];
      const dailyFile = path.join(this.dataDir, 'daily', `${dateStr}.jsonl`);
      await fs.appendFile(dailyFile, JSON.stringify(location) + '\n');

      // Store in client-specific file
      const clientFile = path.join(this.dataDir, `client-${location.clientId}-locations.jsonl`);
      await fs.appendFile(clientFile, JSON.stringify(location) + '\n');

      // Log for audit trail
      await auditLogger.log({
        eventType: 'LOCATION_RECORDED',
        category: 'LOCATION',
        severity: 'MEDIUM',
        clientId: location.clientId,
        action: 'Location data recorded for analysis',
        details: {
          locationId: location.id,
          coordinates: `${location.latitude}, ${location.longitude}`,
          accuracy: location.accuracy,
          source: location.source,
          verified: location.verified,
        },
        complianceRelevant: true,
      });

      // Trigger pattern analysis if enough data
      setTimeout(() => this.analyzeLocationPatterns(location.clientId), 1000);

      return location;
    } catch (error) {
      console.error('Failed to record location:', error);
      throw error;
    }
  }

  async getClientLocations(clientId: number, daysBack: number = 30): Promise<LocationData[]> {
    try {
      const clientFile = path.join(this.dataDir, `client-${clientId}-locations.jsonl`);
      
      try {
        const data = await fs.readFile(clientFile, 'utf-8');
        const locations = data.trim().split('\n')
          .filter(line => line)
          .map(line => JSON.parse(line) as LocationData);

        const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
        return locations.filter(loc => new Date(loc.timestamp) >= cutoffDate);
      } catch {
        return [];
      }
    } catch (error) {
      console.error('Failed to get client locations:', error);
      return [];
    }
  }

  async analyzeLocationPatterns(clientId: number): Promise<LocationPattern> {
    try {
      const locations = await this.getClientLocations(clientId, this.COMPLIANCE_DAYS);
      
      if (locations.length < 5) {
        // Not enough data for meaningful analysis
        const basicPattern: LocationPattern = {
          clientId,
          patternType: 'IRREGULAR',
          analysis: {
            frequentLocations: [],
            unusualLocations: [],
            travelRadius: 0,
            complianceScore: 50,
            riskFactors: ['Insufficient location data'],
          },
          lastAnalysis: new Date(),
          predictedNextLocations: [],
        };
        
        await this.saveLocationPattern(basicPattern);
        return basicPattern;
      }

      // Cluster locations into frequent areas
      const frequentLocations = await this.identifyFrequentLocations(locations);
      
      // Identify home and work locations
      const homeBase = this.identifyHomeBase(frequentLocations);
      const workLocation = this.identifyWorkLocation(frequentLocations, homeBase);
      
      // Calculate travel radius
      const travelRadius = this.calculateTravelRadius(locations, homeBase);
      
      // Identify unusual locations
      const unusualLocations = this.identifyUnusualLocations(locations, frequentLocations);
      
      // Calculate compliance score
      const complianceScore = this.calculateComplianceScore(locations, frequentLocations, homeBase);
      
      // Identify risk factors
      const riskFactors = this.identifyRiskFactors(locations, frequentLocations, homeBase, travelRadius);
      
      // Determine pattern type
      const patternType = this.determinePatternType(complianceScore, riskFactors, frequentLocations);
      
      // Predict next locations
      const predictedNextLocations = this.predictNextLocations(frequentLocations);

      const pattern: LocationPattern = {
        clientId,
        patternType,
        analysis: {
          homeBaseLocation: homeBase,
          workLocation,
          frequentLocations,
          unusualLocations,
          travelRadius,
          complianceScore,
          riskFactors,
        },
        lastAnalysis: new Date(),
        predictedNextLocations,
      };

      await this.saveLocationPattern(pattern);
      
      // Log analysis completion
      await auditLogger.log({
        eventType: 'LOCATION_ANALYSIS_COMPLETED',
        category: 'LOCATION',
        severity: patternType === 'SUSPICIOUS' ? 'HIGH' : 'MEDIUM',
        clientId,
        action: 'Location pattern analysis completed',
        details: {
          patternType,
          complianceScore,
          travelRadius,
          frequentLocationCount: frequentLocations.length,
          riskFactors,
        },
        complianceRelevant: true,
      });

      return pattern;
    } catch (error) {
      console.error('Failed to analyze location patterns:', error);
      throw error;
    }
  }

  private async identifyFrequentLocations(locations: LocationData[]): Promise<FrequentLocation[]> {
    const clusters: Map<string, LocationData[]> = new Map();
    
    // Group locations by proximity
    for (const location of locations) {
      let assigned = false;
      
      for (const [clusterId, clusterLocations] of clusters) {
        const centerLoc = clusterLocations[0];
        const distance = this.calculateDistance(
          location.latitude, location.longitude,
          centerLoc.latitude, centerLoc.longitude
        );
        
        if (distance <= this.LOCATION_CLUSTER_RADIUS) {
          clusterLocations.push(location);
          assigned = true;
          break;
        }
      }
      
      if (!assigned) {
        clusters.set(this.generateLocationId(), [location]);
      }
    }

    // Convert clusters to frequent locations
    const frequentLocations: FrequentLocation[] = [];
    
    for (const [clusterId, clusterLocations] of clusters) {
      if (clusterLocations.length >= this.FREQUENT_THRESHOLD) {
        const sortedByTime = clusterLocations.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        // Calculate center point
        const avgLat = clusterLocations.reduce((sum, loc) => sum + loc.latitude, 0) / clusterLocations.length;
        const avgLng = clusterLocations.reduce((sum, loc) => sum + loc.longitude, 0) / clusterLocations.length;
        
        // Calculate average stay duration (simplified)
        const averageStayDuration = this.calculateAverageStayDuration(clusterLocations);
        
        const frequentLocation: FrequentLocation = {
          id: clusterId,
          clientId: clusterLocations[0].clientId,
          latitude: avgLat,
          longitude: avgLng,
          address: clusterLocations[0].address,
          visitCount: clusterLocations.length,
          firstVisit: new Date(sortedByTime[0].timestamp),
          lastVisit: new Date(sortedByTime[sortedByTime.length - 1].timestamp),
          averageStayDuration,
          timeSpentTotal: averageStayDuration * clusterLocations.length,
          riskLevel: this.assessLocationRisk(clusterLocations),
          locationNotes: [],
          isHomeBased: false,
          isWorkBased: false,
          isSuspicious: false,
        };
        
        frequentLocations.push(frequentLocation);
      }
    }
    
    return frequentLocations.sort((a, b) => b.visitCount - a.visitCount);
  }

  private identifyHomeBase(frequentLocations: FrequentLocation[]): FrequentLocation | undefined {
    if (frequentLocations.length === 0) return undefined;
    
    // Home base is typically the most visited location with evening/night activity
    const homeCandidate = frequentLocations[0]; // Most frequent location
    homeCandidate.isHomeBased = true;
    
    return homeCandidate;
  }

  private identifyWorkLocation(frequentLocations: FrequentLocation[], homeBase?: FrequentLocation): FrequentLocation | undefined {
    if (frequentLocations.length < 2) return undefined;
    
    // Work location is typically the second most frequent location, different from home
    for (const location of frequentLocations) {
      if (homeBase && this.calculateDistance(
        location.latitude, location.longitude,
        homeBase.latitude, homeBase.longitude
      ) > 1) { // At least 1 mile from home
        location.isWorkBased = true;
        return location;
      }
    }
    
    return undefined;
  }

  private calculateTravelRadius(locations: LocationData[], homeBase?: FrequentLocation): number {
    if (!homeBase || locations.length === 0) return 0;
    
    const distances = locations.map(loc => 
      this.calculateDistance(
        loc.latitude, loc.longitude,
        homeBase.latitude, homeBase.longitude
      )
    );
    
    return Math.max(...distances);
  }

  private identifyUnusualLocations(locations: LocationData[], frequentLocations: FrequentLocation[]): LocationData[] {
    return locations.filter(location => {
      // Check if location is far from any frequent location
      const nearFrequentLocation = frequentLocations.some(freqLoc => 
        this.calculateDistance(
          location.latitude, location.longitude,
          freqLoc.latitude, freqLoc.longitude
        ) <= this.LOCATION_CLUSTER_RADIUS * 2 // Double the cluster radius for unusual detection
      );
      
      return !nearFrequentLocation;
    });
  }

  private calculateComplianceScore(
    locations: LocationData[], 
    frequentLocations: FrequentLocation[], 
    homeBase?: FrequentLocation
  ): number {
    if (locations.length === 0) return 0;
    
    let score = 100;
    
    // Deduct points for unusual patterns
    const unusualCount = locations.length - frequentLocations.reduce((sum, freq) => sum + freq.visitCount, 0);
    score -= (unusualCount / locations.length) * 30;
    
    // Deduct points for large travel radius
    if (homeBase) {
      const maxDistance = Math.max(...locations.map(loc => 
        this.calculateDistance(loc.latitude, loc.longitude, homeBase.latitude, homeBase.longitude)
      ));
      
      if (maxDistance > this.SUSPICIOUS_RADIUS) {
        score -= Math.min(30, (maxDistance - this.SUSPICIOUS_RADIUS) * 2);
      }
    }
    
    // Deduct points for irregular check-in patterns
    const checkInLocations = locations.filter(loc => loc.source === 'check_in');
    if (checkInLocations.length < locations.length * 0.8) {
      score -= 20;
    }
    
    return Math.max(0, Math.round(score));
  }

  private identifyRiskFactors(
    locations: LocationData[], 
    frequentLocations: FrequentLocation[], 
    homeBase?: FrequentLocation,
    travelRadius: number
  ): string[] {
    const riskFactors: string[] = [];
    
    if (travelRadius > this.SUSPICIOUS_RADIUS) {
      riskFactors.push(`Large travel radius: ${travelRadius.toFixed(1)} miles`);
    }
    
    if (frequentLocations.length < 2) {
      riskFactors.push('Limited location history');
    }
    
    if (!homeBase) {
      riskFactors.push('No established home base');
    }
    
    const recentLocations = locations.filter(loc => 
      new Date(loc.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    if (recentLocations.length < 3) {
      riskFactors.push('Insufficient recent location data');
    }
    
    const borderLocations = locations.filter(loc => 
      homeBase && this.calculateDistance(
        loc.latitude, loc.longitude, 
        homeBase.latitude, homeBase.longitude
      ) > 25
    );
    
    if (borderLocations.length > locations.length * 0.2) {
      riskFactors.push('Frequent long-distance travel');
    }
    
    return riskFactors;
  }

  private determinePatternType(
    complianceScore: number, 
    riskFactors: string[], 
    frequentLocations: FrequentLocation[]
  ): 'ROUTINE' | 'IRREGULAR' | 'SUSPICIOUS' | 'COMPLIANT' {
    if (complianceScore >= 85 && riskFactors.length === 0) {
      return 'COMPLIANT';
    } else if (complianceScore >= 70 && frequentLocations.length >= 2) {
      return 'ROUTINE';
    } else if (complianceScore < 50 || riskFactors.length >= 3) {
      return 'SUSPICIOUS';
    } else {
      return 'IRREGULAR';
    }
  }

  private predictNextLocations(frequentLocations: FrequentLocation[]): Array<{
    location: FrequentLocation;
    probability: number;
    timeWindow: string;
  }> {
    return frequentLocations
      .slice(0, 3) // Top 3 most frequent
      .map((location, index) => ({
        location,
        probability: Math.max(0.3, 0.9 - (index * 0.2)),
        timeWindow: index === 0 ? 'Next 24 hours' : `Next ${2 + index} days`,
      }));
  }

  async generateSkipBailRiskAssessment(clientId: number): Promise<SkipBailRiskAssessment> {
    try {
      const pattern = await this.getLocationPattern(clientId);
      const locations = await this.getClientLocations(clientId, this.COMPLIANCE_DAYS);
      
      if (!pattern) {
        return {
          clientId,
          riskLevel: 'MEDIUM',
          riskScore: 50,
          factors: {
            locationCompliance: 50,
            patternStability: 50,
            homeBaseStability: 50,
            unexpectedMovements: 50,
            checkInCompliance: 50,
          },
          alerts: [],
          recommendations: ['Insufficient location data for comprehensive assessment'],
          lastAssessment: new Date(),
        };
      }

      // Calculate risk factors
      const factors = {
        locationCompliance: pattern.analysis.complianceScore,
        patternStability: this.calculatePatternStability(locations),
        homeBaseStability: this.calculateHomeBaseStability(pattern),
        unexpectedMovements: this.calculateUnexpectedMovements(pattern),
        checkInCompliance: this.calculateCheckInCompliance(locations),
      };

      // Calculate overall risk score
      const riskScore = Math.round(
        (factors.locationCompliance * 0.3 +
         factors.patternStability * 0.2 +
         factors.homeBaseStability * 0.2 +
         factors.unexpectedMovements * 0.15 +
         factors.checkInCompliance * 0.15)
      );

      // Determine risk level
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      if (riskScore >= 80) riskLevel = 'LOW';
      else if (riskScore >= 60) riskLevel = 'MEDIUM';
      else if (riskScore >= 40) riskLevel = 'HIGH';
      else riskLevel = 'CRITICAL';

      // Generate alerts
      const alerts = this.generateRiskAlerts(pattern, factors, riskLevel);

      // Generate recommendations
      const recommendations = this.generateRecommendations(pattern, factors, riskLevel);

      const assessment: SkipBailRiskAssessment = {
        clientId,
        riskLevel,
        riskScore,
        factors,
        alerts,
        recommendations,
        lastAssessment: new Date(),
      };

      // Save assessment
      await this.saveRiskAssessment(assessment);

      // Log assessment
      await auditLogger.log({
        eventType: 'SKIP_BAIL_RISK_ASSESSMENT',
        category: 'LOCATION',
        severity: riskLevel === 'CRITICAL' ? 'CRITICAL' : riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
        clientId,
        action: 'Skip bail risk assessment completed',
        details: {
          riskLevel,
          riskScore,
          factors,
          alertCount: alerts.length,
        },
        complianceRelevant: true,
      });

      return assessment;
    } catch (error) {
      console.error('Failed to generate skip bail risk assessment:', error);
      throw error;
    }
  }

  private calculatePatternStability(locations: LocationData[]): number {
    // Analyze consistency of location patterns over time
    if (locations.length < 7) return 30;
    
    const weeklyPatterns = this.groupLocationsByWeek(locations);
    const consistencyScore = this.calculateWeeklyConsistency(weeklyPatterns);
    
    return Math.min(100, consistencyScore);
  }

  private calculateHomeBaseStability(pattern: LocationPattern): number {
    if (!pattern.analysis.homeBaseLocation) return 0;
    
    const homeBase = pattern.analysis.homeBaseLocation;
    const stabilityScore = Math.min(100, (homeBase.visitCount / this.COMPLIANCE_DAYS) * 100);
    
    return stabilityScore;
  }

  private calculateUnexpectedMovements(pattern: LocationPattern): number {
    const unusualCount = pattern.analysis.unusualLocations.length;
    const totalLocations = pattern.analysis.frequentLocations.reduce((sum, freq) => sum + freq.visitCount, 0) + unusualCount;
    
    if (totalLocations === 0) return 50;
    
    const unexpectedRatio = unusualCount / totalLocations;
    return Math.max(0, 100 - (unexpectedRatio * 100));
  }

  private calculateCheckInCompliance(locations: LocationData[]): number {
    const checkInLocations = locations.filter(loc => loc.source === 'check_in');
    const complianceRatio = checkInLocations.length / Math.max(1, locations.length);
    
    return Math.min(100, complianceRatio * 100);
  }

  private generateRiskAlerts(
    pattern: LocationPattern, 
    factors: any, 
    riskLevel: string
  ): Array<{ type: string; severity: string; message: string; timestamp: Date }> {
    const alerts = [];
    const now = new Date();

    if (riskLevel === 'CRITICAL') {
      alerts.push({
        type: 'CRITICAL_RISK',
        severity: 'CRITICAL',
        message: 'Client presents critical skip bail risk based on location patterns',
        timestamp: now,
      });
    }

    if (pattern.analysis.travelRadius > this.SUSPICIOUS_RADIUS) {
      alerts.push({
        type: 'LARGE_TRAVEL_RADIUS',
        severity: 'HIGH',
        message: `Client traveling ${pattern.analysis.travelRadius.toFixed(1)} miles from home base`,
        timestamp: now,
      });
    }

    if (factors.checkInCompliance < 60) {
      alerts.push({
        type: 'LOW_CHECK_IN_COMPLIANCE',
        severity: 'MEDIUM',
        message: 'Client check-in compliance below acceptable threshold',
        timestamp: now,
      });
    }

    if (!pattern.analysis.homeBaseLocation) {
      alerts.push({
        type: 'NO_HOME_BASE',
        severity: 'HIGH',
        message: 'No established home base location identified',
        timestamp: now,
      });
    }

    return alerts;
  }

  private generateRecommendations(
    pattern: LocationPattern, 
    factors: any, 
    riskLevel: string
  ): string[] {
    const recommendations = [];

    if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
      recommendations.push('Increase check-in frequency to daily');
      recommendations.push('Implement GPS ankle monitoring');
      recommendations.push('Require pre-approval for travel beyond 25-mile radius');
    }

    if (!pattern.analysis.homeBaseLocation) {
      recommendations.push('Establish and verify primary residence location');
    }

    if (factors.checkInCompliance < 70) {
      recommendations.push('Provide additional check-in education and support');
    }

    if (pattern.analysis.travelRadius > this.SUSPICIOUS_RADIUS) {
      recommendations.push('Review and approve any travel plans beyond local area');
    }

    if (pattern.patternType === 'SUSPICIOUS') {
      recommendations.push('Conduct in-person verification at frequent locations');
      recommendations.push('Consider motion for increased bond restrictions');
    }

    return recommendations;
  }

  // Utility methods
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private generateLocationId(): string {
    return `loc_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private calculateAverageStayDuration(locations: LocationData[]): number {
    // Simplified calculation - in reality would analyze time gaps
    return Math.round(Math.random() * 120 + 30); // 30-150 minutes
  }

  private assessLocationRisk(locations: LocationData[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    // Simplified risk assessment based on location frequency and verification
    const verifiedCount = locations.filter(loc => loc.verified).length;
    const verificationRatio = verifiedCount / locations.length;
    
    if (verificationRatio >= 0.8) return 'LOW';
    if (verificationRatio >= 0.6) return 'MEDIUM';
    if (verificationRatio >= 0.4) return 'HIGH';
    return 'CRITICAL';
  }

  private groupLocationsByWeek(locations: LocationData[]): LocationData[][] {
    const weeks: LocationData[][] = [];
    const sortedLocations = locations.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let currentWeek: LocationData[] = [];
    let weekStart: Date | null = null;

    for (const location of sortedLocations) {
      const locationDate = new Date(location.timestamp);
      
      if (!weekStart || locationDate.getTime() - weekStart.getTime() > 7 * 24 * 60 * 60 * 1000) {
        if (currentWeek.length > 0) {
          weeks.push(currentWeek);
        }
        currentWeek = [location];
        weekStart = locationDate;
      } else {
        currentWeek.push(location);
      }
    }
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }

  private calculateWeeklyConsistency(weeklyPatterns: LocationData[][]): number {
    if (weeklyPatterns.length < 2) return 50;
    
    // Simplified consistency calculation
    const avgLocationsPerWeek = weeklyPatterns.reduce((sum, week) => sum + week.length, 0) / weeklyPatterns.length;
    const variance = weeklyPatterns.reduce((sum, week) => 
      sum + Math.pow(week.length - avgLocationsPerWeek, 2), 0
    ) / weeklyPatterns.length;
    
    const consistencyScore = Math.max(0, 100 - (variance * 10));
    return Math.min(100, consistencyScore);
  }

  // File operations
  private async saveLocationPattern(pattern: LocationPattern): Promise<void> {
    const patternFile = path.join(this.dataDir, 'patterns', `client-${pattern.clientId}-pattern.json`);
    await fs.writeFile(patternFile, JSON.stringify(pattern, null, 2));
  }

  private async getLocationPattern(clientId: number): Promise<LocationPattern | null> {
    try {
      const patternFile = path.join(this.dataDir, 'patterns', `client-${clientId}-pattern.json`);
      const data = await fs.readFile(patternFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  private async saveRiskAssessment(assessment: SkipBailRiskAssessment): Promise<void> {
    const assessmentFile = path.join(this.dataDir, 'analysis', `client-${assessment.clientId}-risk.json`);
    await fs.writeFile(assessmentFile, JSON.stringify(assessment, null, 2));
  }

  async getRiskAssessment(clientId: number): Promise<SkipBailRiskAssessment | null> {
    try {
      const assessmentFile = path.join(this.dataDir, 'analysis', `client-${clientId}-risk.json`);
      const data = await fs.readFile(assessmentFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async getAllRiskAssessments(): Promise<SkipBailRiskAssessment[]> {
    try {
      const analysisDir = path.join(this.dataDir, 'analysis');
      const files = await fs.readdir(analysisDir);
      const riskFiles = files.filter(file => file.endsWith('-risk.json'));
      
      const assessments = [];
      for (const file of riskFiles) {
        try {
          const data = await fs.readFile(path.join(analysisDir, file), 'utf-8');
          assessments.push(JSON.parse(data));
        } catch (error) {
          console.error(`Failed to read risk assessment file ${file}:`, error);
        }
      }
      
      return assessments.sort((a, b) => {
        const riskOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
      });
    } catch (error) {
      console.error('Failed to get all risk assessments:', error);
      return [];
    }
  }
}

export const locationTracker = new LocationTracker();