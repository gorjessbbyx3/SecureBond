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
  Shield, 
  Activity, 
  AlertTriangle, 
  Search, 
  Download, 
  Eye, 
  Calendar,
  User,
  MapPin,
  Fingerprint,
  Database,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format, subDays, subHours } from "date-fns";

interface SecurityMetrics {
  failedLogins: number;
  successfulLogins: number;
  biometricVerifications: number;
  locationVerifications: number;
  dataAccessAttempts: number;
  suspiciousActivity: number;
  lastUpdated: Date;
}

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  eventType: string;
  category: string;
  severity: string;
  userId?: string;
  clientId?: number;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  action: string;
  details: Record<string, any>;
  complianceRelevant: boolean;
}

interface ComplianceReport {
  reportId: string;
  generatedAt: Date;
  period: { startDate: Date; endDate: Date };
  summary: {
    totalEvents: number;
    criticalEvents: number;
    complianceRelevantEvents: number;
    categories: Record<string, number>;
  };
  events: AuditLogEntry[];
}

export function SecurityAuditDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchFilters, setSearchFilters] = useState({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    category: '',
    eventType: '',
    severity: '',
    complianceRelevant: '',
    limit: '100',
  });

  // Fetch security metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<SecurityMetrics>({
    queryKey: ["/api/admin/audit/metrics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Search audit logs
  const { data: auditData, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ["/api/admin/audit/logs", searchFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return apiRequest(`/api/admin/audit/logs?${params.toString()}`);
    },
  });

  // Generate compliance report
  const complianceReportMutation = useMutation({
    mutationFn: async ({ startDate, endDate }: { startDate: string; endDate: string }) => {
      return apiRequest(`/api/admin/audit/compliance-report?startDate=${startDate}&endDate=${endDate}`);
    },
    onSuccess: (report: ComplianceReport) => {
      toast({
        title: "Compliance Report Generated",
        description: `Report contains ${report.summary.totalEvents} events with ${report.summary.criticalEvents} critical incidents.`,
      });
      
      // Download report as JSON
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${report.reportId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (error: any) => {
      toast({
        title: "Report Generation Failed",
        description: error.message || "Failed to generate compliance report",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    refetchLogs();
  };

  const generateComplianceReport = () => {
    complianceReportMutation.mutate({
      startDate: searchFilters.startDate,
      endDate: searchFilters.endDate,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AUTHENTICATION': return <User className="h-4 w-4" />;
      case 'BIOMETRIC': return <Fingerprint className="h-4 w-4" />;
      case 'LOCATION': return <MapPin className="h-4 w-4" />;
      case 'DATA_ACCESS': return <Database className="h-4 w-4" />;
      case 'SYSTEM': return <Settings className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Audit Dashboard</h2>
          <p className="text-gray-600">Monitor system security and compliance activities</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Shield className="h-3 w-3 mr-1" />
          Audit Active
        </Badge>
      </div>

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Security Metrics</TabsTrigger>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          {metricsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Successful Logins</p>
                      <p className="text-3xl font-bold text-green-600">{metrics?.successfulLogins || 0}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Failed Login Attempts</p>
                      <p className="text-3xl font-bold text-red-600">{metrics?.failedLogins || 0}</p>
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
                      <p className="text-sm font-medium text-gray-600">Biometric Verifications</p>
                      <p className="text-3xl font-bold text-blue-600">{metrics?.biometricVerifications || 0}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Fingerprint className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">GPS Verifications</p>
                      <p className="text-3xl font-bold text-purple-600">{metrics?.locationVerifications || 0}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Data Access Events</p>
                      <p className="text-3xl font-bold text-indigo-600">{metrics?.dataAccessAttempts || 0}</p>
                    </div>
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <Database className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Suspicious Activity</p>
                      <p className="text-3xl font-bold text-orange-600">{metrics?.suspiciousActivity || 0}</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Activity className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle>Security Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Updated:</span>
                    <span className="text-sm font-medium">
                      {format(new Date(metrics.lastUpdated), 'PPpp')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Login Success Rate</p>
                      <p className="text-lg font-bold text-green-700">
                        {metrics.successfulLogins + metrics.failedLogins > 0
                          ? Math.round((metrics.successfulLogins / (metrics.successfulLogins + metrics.failedLogins)) * 100)
                          : 100}%
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">Security Events Today</p>
                      <p className="text-lg font-bold text-blue-700">
                        {(metrics.biometricVerifications || 0) + (metrics.locationVerifications || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Audit Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={searchFilters.startDate}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={searchFilters.endDate}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={searchFilters.category} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                      <SelectItem value="BIOMETRIC">Biometric</SelectItem>
                      <SelectItem value="LOCATION">Location</SelectItem>
                      <SelectItem value="DATA_ACCESS">Data Access</SelectItem>
                      <SelectItem value="SYSTEM">System</SelectItem>
                      <SelectItem value="COURT_DATE">Court Date</SelectItem>
                      <SelectItem value="PAYMENT">Payment</SelectItem>
                      <SelectItem value="ADMIN_ACTION">Admin Action</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <Select value={searchFilters.severity} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, severity: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Severities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Severities</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSearch} disabled={logsLoading}>
                  <Search className="h-4 w-4 mr-2" />
                  Search Logs
                </Button>
                <Button variant="outline" onClick={() => setSearchFilters({
                  startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
                  endDate: format(new Date(), 'yyyy-MM-dd'),
                  category: '',
                  eventType: '',
                  severity: '',
                  complianceRelevant: '',
                  limit: '100',
                })}>
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit Log Results</CardTitle>
              {auditData && (
                <p className="text-sm text-gray-600">
                  Showing {auditData.logs?.length || 0} of {auditData.total || 0} events
                  {auditData.limited && " (limited)"}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : auditData?.logs?.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {auditData.logs.map((log: AuditLogEntry) => (
                    <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(log.category)}
                          <span className="font-medium">{log.action}</span>
                          {log.complianceRelevant && (
                            <Badge variant="outline" className="text-xs">
                              Compliance
                            </Badge>
                          )}
                        </div>
                        <Badge className={`text-xs ${getSeverityColor(log.severity)}`}>
                          {log.severity}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Time:</strong> {format(new Date(log.timestamp), 'PPpp')}</p>
                        <p><strong>Category:</strong> {log.category}</p>
                        <p><strong>Type:</strong> {log.eventType}</p>
                        {log.userId && <p><strong>User:</strong> {log.userId}</p>}
                        {log.clientId && <p><strong>Client ID:</strong> {log.clientId}</p>}
                        {log.ipAddress && <p><strong>IP:</strong> {log.ipAddress}</p>}
                        
                        {Object.keys(log.details).length > 0 && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                              View Details
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No audit logs found for the selected criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Compliance Reporting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reportStartDate">Report Start Date</Label>
                    <Input
                      id="reportStartDate"
                      type="date"
                      value={searchFilters.startDate}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="reportEndDate">Report End Date</Label>
                    <Input
                      id="reportEndDate"
                      type="date"
                      value={searchFilters.endDate}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={generateComplianceReport}
                  disabled={complianceReportMutation.isPending}
                  className="w-full md:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {complianceReportMutation.isPending ? "Generating..." : "Generate Compliance Report"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Data Retention</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Authentication Logs:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">7 Years</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Biometric Data:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">7 Years</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Location Data:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">7 Years</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Court Records:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">10 Years</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Audit Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Real-time logging</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Tamper-proof storage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Automated retention</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Legal hold support</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Security Alerts & Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Active Monitoring:</strong> The system continuously monitors for suspicious activities including multiple failed logins, unusual access patterns, and security violations.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Failed Login Threshold</h4>
                    <p className="text-sm text-gray-600">5 failed attempts within 15 minutes triggers security alert</p>
                    <Badge variant="outline" className="mt-2 bg-green-50 text-green-700">Active</Badge>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Biometric Verification</h4>
                    <p className="text-sm text-gray-600">All biometric data captures are logged and verified</p>
                    <Badge variant="outline" className="mt-2 bg-green-50 text-green-700">Active</Badge>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">GPS Location Validation</h4>
                    <p className="text-sm text-gray-600">All location data is validated and accuracy tracked</p>
                    <Badge variant="outline" className="mt-2 bg-green-50 text-green-700">Active</Badge>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Data Access Monitoring</h4>
                    <p className="text-sm text-gray-600">High-privilege data access attempts are tracked</p>
                    <Badge variant="outline" className="mt-2 bg-green-50 text-green-700">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}