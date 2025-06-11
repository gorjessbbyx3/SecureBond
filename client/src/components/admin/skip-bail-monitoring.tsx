import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Users,
  Target,
  Navigation,
  Shield,
  Clock,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FrequentLocation {
  id: string;
  clientId: number;
  latitude: number;
  longitude: number;
  address?: string;
  visitCount: number;
  firstVisit: Date;
  lastVisit: Date;
  averageStayDuration: number;
  timeSpentTotal: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  locationNotes: string[];
  isHomeBased: boolean;
  isWorkBased: boolean;
  isSuspicious: boolean;
}

interface LocationPattern {
  clientId: number;
  patternType: 'ROUTINE' | 'IRREGULAR' | 'SUSPICIOUS' | 'COMPLIANT';
  analysis: {
    homeBaseLocation?: FrequentLocation;
    workLocation?: FrequentLocation;
    frequentLocations: FrequentLocation[];
    unusualLocations: any[];
    travelRadius: number;
    complianceScore: number;
    riskFactors: string[];
  };
  lastAnalysis: Date;
  predictedNextLocations: Array<{
    location: FrequentLocation;
    probability: number;
    timeWindow: string;
  }>;
}

interface SkipBailRiskAssessment {
  clientId: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
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

export function SkipBailMonitoring() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [riskFilter, setRiskFilter] = useState<string>("");

  // Fetch all clients for selection
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Fetch all risk assessments
  const { data: riskAssessments = [], isLoading: assessmentsLoading } = useQuery<SkipBailRiskAssessment[]>({
    queryKey: ["/api/admin/skip-bail-risk"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch location pattern for selected client
  const { data: locationPattern, isLoading: patternLoading } = useQuery<LocationPattern>({
    queryKey: ["/api/admin/location/patterns", selectedClientId],
    queryFn: async () => {
      if (!selectedClientId) return null;
      return apiRequest(`/api/admin/location/patterns?clientId=${selectedClientId}`);
    },
    enabled: !!selectedClientId,
  });

  // Fetch frequent locations for selected client
  const { data: frequentLocations = [] } = useQuery({
    queryKey: ["/api/admin/location/frequent", selectedClientId],
    queryFn: async () => {
      if (!selectedClientId) return [];
      return apiRequest(`/api/admin/location/frequent/${selectedClientId}?days=30`);
    },
    enabled: !!selectedClientId,
  });

  const generateRiskAssessmentMutation = useMutation({
    mutationFn: async (clientId: string) => {
      return apiRequest(`/api/admin/skip-bail-risk?clientId=${clientId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/skip-bail-risk"] });
      toast({
        title: "Risk Assessment Updated",
        description: "Skip bail risk assessment has been recalculated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Assessment Failed",
        description: error.message || "Failed to update risk assessment",
        variant: "destructive",
      });
    },
  });

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPatternColor = (patternType: string) => {
    switch (patternType) {
      case 'SUSPICIOUS': return 'bg-red-100 text-red-800 border-red-200';
      case 'IRREGULAR': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ROUTINE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLIANT': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredAssessments = riskAssessments.filter(assessment => 
    !riskFilter || assessment.riskLevel === riskFilter
  );

  const riskStats = {
    critical: riskAssessments.filter(a => a.riskLevel === 'CRITICAL').length,
    high: riskAssessments.filter(a => a.riskLevel === 'HIGH').length,
    medium: riskAssessments.filter(a => a.riskLevel === 'MEDIUM').length,
    low: riskAssessments.filter(a => a.riskLevel === 'LOW').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Skip Bail Prevention Monitoring</h2>
          <p className="text-gray-600">Monitor client location patterns and assess skip bail risk</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Shield className="h-3 w-3 mr-1" />
          Active Monitoring
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Risk Overview</TabsTrigger>
          <TabsTrigger value="patterns">Location Patterns</TabsTrigger>
          <TabsTrigger value="individual">Individual Analysis</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Risk Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Critical Risk</p>
                    <p className="text-3xl font-bold text-red-600">{riskStats.critical}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">High Risk</p>
                    <p className="text-3xl font-bold text-orange-600">{riskStats.high}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Medium Risk</p>
                    <p className="text-3xl font-bold text-yellow-600">{riskStats.medium}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Activity className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Low Risk</p>
                    <p className="text-3xl font-bold text-green-600">{riskStats.low}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Assessments List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Skip Bail Risk Assessments</CardTitle>
                <div className="flex gap-2">
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by Risk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Levels</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {assessmentsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : filteredAssessments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAssessments.map((assessment) => {
                    const client = clients.find((c: any) => c.id === assessment.clientId);
                    return (
                      <div key={assessment.clientId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">
                              {client ? client.fullName : `Client ${assessment.clientId}`}
                            </h4>
                            <Badge className={`text-xs ${getRiskColor(assessment.riskLevel)}`}>
                              {assessment.riskLevel} RISK
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              Score: {assessment.riskScore}/100
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateRiskAssessmentMutation.mutate(assessment.clientId.toString())}
                              disabled={generateRiskAssessmentMutation.isPending}
                            >
                              Refresh
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Location Compliance:</span>
                            <div className="font-medium">{assessment.factors.locationCompliance}%</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Pattern Stability:</span>
                            <div className="font-medium">{assessment.factors.patternStability}%</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Home Base:</span>
                            <div className="font-medium">{assessment.factors.homeBaseStability}%</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Unexpected Moves:</span>
                            <div className="font-medium">{assessment.factors.unexpectedMovements}%</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Check-in Rate:</span>
                            <div className="font-medium">{assessment.factors.checkInCompliance}%</div>
                          </div>
                        </div>

                        {assessment.alerts.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-red-600 mb-1">
                              Active Alerts ({assessment.alerts.length}):
                            </p>
                            <div className="space-y-1">
                              {assessment.alerts.slice(0, 2).map((alert, index) => (
                                <p key={index} className="text-xs text-red-600">
                                  • {alert.message}
                                </p>
                              ))}
                              {assessment.alerts.length > 2 && (
                                <p className="text-xs text-gray-500">
                                  +{assessment.alerts.length - 2} more alerts
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {assessment.recommendations.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-blue-600 mb-1">Recommendations:</p>
                            <p className="text-xs text-blue-600">
                              • {assessment.recommendations[0]}
                              {assessment.recommendations.length > 1 && ` (+${assessment.recommendations.length - 1} more)`}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No risk assessments found for the selected criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Location Pattern Analysis</CardTitle>
              <p className="text-sm text-gray-600">
                Analyze movement patterns to detect potential skip bail indicators
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="clientSelect">Select Client</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client: any) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.fullName} ({client.clientId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedClientId && (
                <div className="space-y-6">
                  {patternLoading ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                  ) : locationPattern ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Movement Pattern Analysis</h4>
                        <Badge className={`${getPatternColor(locationPattern.patternType)}`}>
                          {locationPattern.patternType}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">Travel Radius</span>
                            </div>
                            <p className="text-2xl font-bold">{locationPattern.analysis.travelRadius.toFixed(1)} mi</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <BarChart3 className="h-4 w-4 text-green-600" />
                              <span className="font-medium">Compliance Score</span>
                            </div>
                            <p className="text-2xl font-bold">{locationPattern.analysis.complianceScore}%</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="h-4 w-4 text-purple-600" />
                              <span className="font-medium">Frequent Locations</span>
                            </div>
                            <p className="text-2xl font-bold">{locationPattern.analysis.frequentLocations.length}</p>
                          </CardContent>
                        </Card>
                      </div>

                      {locationPattern.analysis.homeBaseLocation && (
                        <Card className="mb-4">
                          <CardContent className="p-4">
                            <h5 className="font-medium mb-2 flex items-center gap-2">
                              <Navigation className="h-4 w-4" />
                              Home Base Location
                            </h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Coordinates:</span>
                                <div className="font-medium">
                                  {locationPattern.analysis.homeBaseLocation.latitude.toFixed(4)}, 
                                  {locationPattern.analysis.homeBaseLocation.longitude.toFixed(4)}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Visits:</span>
                                <div className="font-medium">{locationPattern.analysis.homeBaseLocation.visitCount}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Time Spent:</span>
                                <div className="font-medium">{locationPattern.analysis.homeBaseLocation.timeSpentTotal} min</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Risk Level:</span>
                                <Badge className={`text-xs ${getRiskColor(locationPattern.analysis.homeBaseLocation.riskLevel)}`}>
                                  {locationPattern.analysis.homeBaseLocation.riskLevel}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {locationPattern.analysis.frequentLocations.length > 0 && (
                        <Card>
                          <CardContent className="p-4">
                            <h5 className="font-medium mb-3">Frequent Locations</h5>
                            <div className="space-y-3">
                              {locationPattern.analysis.frequentLocations.slice(0, 5).map((location, index) => (
                                <div key={location.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {location.visitCount} visits • {location.timeSpentTotal} min total
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {location.isHomeBased && (
                                      <Badge variant="outline" className="text-xs">Home</Badge>
                                    )}
                                    {location.isWorkBased && (
                                      <Badge variant="outline" className="text-xs">Work</Badge>
                                    )}
                                    <Badge className={`text-xs ${getRiskColor(location.riskLevel)}`}>
                                      {location.riskLevel}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {locationPattern.analysis.riskFactors.length > 0 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Risk Factors Identified:</strong>
                            <ul className="mt-2 space-y-1">
                              {locationPattern.analysis.riskFactors.map((factor, index) => (
                                <li key={index} className="text-sm">• {factor}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No location pattern data available for this client</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Individual Client Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="individualClientSelect">Select Client for Detailed Analysis</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client: any) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.fullName} ({client.clientId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedClientId && (
                  <div className="flex items-end">
                    <Button
                      onClick={() => generateRiskAssessmentMutation.mutate(selectedClientId)}
                      disabled={generateRiskAssessmentMutation.isPending}
                      className="w-full"
                    >
                      {generateRiskAssessmentMutation.isPending ? "Analyzing..." : "Generate Risk Assessment"}
                    </Button>
                  </div>
                )}
              </div>

              {selectedClientId && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h5 className="font-medium mb-3">Recent Location Data (30 days)</h5>
                        <div className="text-2xl font-bold mb-2">{frequentLocations.length}</div>
                        <p className="text-sm text-gray-600">Total recorded locations</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <h5 className="font-medium mb-3">Check-in Compliance</h5>
                        <div className="text-2xl font-bold mb-2">
                          {frequentLocations.filter((loc: any) => loc.source === 'check_in').length}
                        </div>
                        <p className="text-sm text-gray-600">Verified check-ins</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Skip Bail Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskAssessments
                  .filter(assessment => assessment.alerts.length > 0)
                  .map((assessment) => {
                    const client = clients.find((c: any) => c.id === assessment.clientId);
                    return (
                      <Alert key={assessment.clientId} variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between mb-2">
                            <strong>{client ? client.fullName : `Client ${assessment.clientId}`}</strong>
                            <Badge className={`${getRiskColor(assessment.riskLevel)}`}>
                              {assessment.riskLevel} RISK
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            {assessment.alerts.map((alert, index) => (
                              <p key={index} className="text-sm">
                                <strong>{alert.type}:</strong> {alert.message}
                              </p>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    );
                  })}
                
                {riskAssessments.filter(assessment => assessment.alerts.length > 0).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active skip bail alerts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}