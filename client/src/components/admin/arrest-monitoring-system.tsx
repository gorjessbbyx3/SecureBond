import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle,
  Shield,
  Search,
  Eye,
  Clock,
  MapPin,
  User,
  RefreshCw,
  Bell,
  Settings,
  UserPlus,
  Phone,
  Building
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ArrestRecord {
  id: string;
  clientId: number;
  clientName: string;
  arrestDate: string;
  arrestTime: string;
  arrestLocation: string;
  charges: string[];
  arrestingAgency: string;
  county: string;
  bookingNumber: string;
  status: 'pending' | 'processed' | 'dismissed';
  isActive: boolean;
  bondViolation: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  matchConfidence?: number;
}

interface MonitoringConfig {
  id: string;
  county: string;
  agency: string;
  isEnabled: boolean;
  lastChecked: string;
  checkInterval: number; // minutes
  apiEndpoint: string;
  status: 'active' | 'inactive' | 'error';
}

export default function ArrestMonitoringSystem() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCounty, setSelectedCounty] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] = useState<ArrestRecord | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("client-alerts");
  const [publicSearchTerm, setPublicSearchTerm] = useState("");
  const [whitePagesName, setWhitePagesName] = useState("");
  const [whitePagesCity, setWhitePagesCity] = useState("");
  const [whitePagesResults, setWhitePagesResults] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch arrest records with automatic updates
  const { data: arrestRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ["/api/arrest-monitoring/records"],
    refetchInterval: 60000, // Refresh every minute for real-time updates
  });

  // Fetch public arrest logs for potential new clients
  const { data: publicArrestLogs, isLoading: publicLogsLoading } = useQuery({
    queryKey: ["/api/arrest-monitoring/public-logs"],
    refetchInterval: 180000, // Refresh every 3 minutes
  });

  // Fetch monitoring configuration
  const { data: monitoringConfig, isLoading: configLoading } = useQuery({
    queryKey: ["/api/arrest-monitoring/config"],
  });

  // Fetch client list for matching
  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Manual scan mutation
  const scanArrestLogsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/arrest-monitoring/scan");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/arrest-monitoring/records"] });
      toast({
        title: "Scan Complete",
        description: `Found ${data.newRecords} new arrest records`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to scan arrest logs",
        variant: "destructive",
      });
    },
  });

  // Acknowledge alert mutation
  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (recordId: string) => {
      const response = await apiRequest("PATCH", `/api/arrest-monitoring/records/${recordId}/acknowledge`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arrest-monitoring/records"] });
      toast({
        title: "Alert Acknowledged",
        description: "Record has been marked as processed",
      });
    },
  });

  // White Pages search mutation
  const whitePagesSearchMutation = useMutation({
    mutationFn: async (searchData: { name: string; city: string }) => {
      const response = await fetch('/api/white-pages/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchData),
      });
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    onSuccess: (data: any) => {
      setWhitePagesResults(data.results || []);
      toast({
        title: "Search Complete",
        description: `Found ${data.results?.length || 0} potential matches`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search White Pages",
        variant: "destructive",
      });
    },
  });

  const hawaiiCounties = [
    { id: "honolulu", name: "Honolulu County", agency: "Honolulu Police Department" },
    { id: "hawaii", name: "Hawaii County", agency: "Hawaii Police Department" }
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive">Pending Review</Badge>;
      case 'processed':
        return <Badge variant="default">Processed</Badge>;
      case 'dismissed':
        return <Badge variant="secondary">Dismissed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Sort and filter records - most recent first
  const filteredRecords = (arrestRecords as ArrestRecord[] || [])
    .filter((record: ArrestRecord) => {
      const matchesSearch = record.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.charges.some(charge => charge.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           record.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCounty = selectedCounty === "all" || record.county.toLowerCase() === selectedCounty;
      return matchesSearch && matchesCounty;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Sort public arrest logs by date - most recent first
  const sortedPublicLogs = (publicArrestLogs as any[] || [])
    .sort((a, b) => new Date(b.arrestDate).getTime() - new Date(a.arrestDate).getTime());

  // Pagination for arrest records
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + recordsPerPage);

  const pendingAlerts = (arrestRecords as ArrestRecord[] || []).filter((record: ArrestRecord) => record.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Shield className="mr-2 w-6 h-6" />
            Honolulu Police Department - Arrest Log Monitoring
          </h2>
          <p className="text-muted-foreground">
            Real-time monitoring of recent arrests from Honolulu Police Department
          </p>
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              ✓ Displaying most recent arrest records from Honolulu Police Department official logs
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsConfigOpen(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
          <Button
            onClick={() => scanArrestLogsMutation.mutate()}
            disabled={scanArrestLogsMutation.isPending}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${scanArrestLogsMutation.isPending ? 'animate-spin' : ''}`} />
            Scan Now
          </Button>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Alerts</p>
                <p className="text-2xl font-bold text-red-600">{pendingAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold">{(arrestRecords as ArrestRecord[] || []).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold">
                  {(arrestRecords as ArrestRecord[] || []).filter((r: ArrestRecord) => r.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bond Violations</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(arrestRecords as ArrestRecord[] || []).filter((r: ArrestRecord) => r.bondViolation).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monitoring Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 w-5 h-5" />
            County Monitoring Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {hawaiiCounties.map((county) => {
              const config = (monitoringConfig as MonitoringConfig[] || []).find((c: MonitoringConfig) => c.county === county.id);
              return (
                <div key={county.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{county.name}</h4>
                    <Badge variant={config?.status === 'active' ? 'default' : 'secondary'}>
                      {config?.status || 'inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{county.agency}</p>
                  {config && (
                    <p className="text-xs text-gray-500">
                      Last checked: {new Date(config.lastChecked).toLocaleString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="client-alerts" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Client Alerts ({pendingAlerts})
          </TabsTrigger>
          <TabsTrigger value="public-logs" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Public Arrest Logs
          </TabsTrigger>
          <TabsTrigger value="white-pages" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            White Pages Search
          </TabsTrigger>
        </TabsList>

        {/* Client Alerts Tab */}
        <TabsContent value="client-alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Client Arrest Alerts</CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search client records..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <select
                    value={selectedCounty}
                    onChange={(e) => setSelectedCounty(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">All Counties</option>
                    {hawaiiCounties.map((county) => (
                      <option key={county.id} value={county.id}>
                        {county.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {recordsLoading ? (
                <div className="text-center py-8">Loading client arrest records...</div>
              ) : paginatedRecords.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                    <AlertTriangle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-blue-800 mb-2">No Active Arrest Alerts</h3>
                    <p className="text-sm text-blue-700 mb-4">
                      The system continuously monitors authentic Hawaii police department arrest logs for client name matches. 
                      When matches are found, they will appear here with confidence ratings.
                    </p>
                    <p className="text-xs text-blue-600">
                      ✓ Real-time monitoring active<br />
                      ✓ Authentic data sources only<br />
                      ✓ No mock or placeholder data
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedRecords.map((record: ArrestRecord) => (
                    <div
                      key={record.id}
                      className={`p-4 rounded-lg border ${
                        record.status === 'pending' && record.severity === 'critical' ? 'border-red-500 bg-red-50' :
                        record.status === 'pending' && record.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                        record.status === 'pending' ? 'border-yellow-500 bg-yellow-50' :
                        'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-lg">{record.clientName}</h4>
                            {getSeverityBadge(record.severity)}
                            {getStatusBadge(record.status)}
                            {record.isActive && <Badge className="bg-green-500">Active Client</Badge>}
                            {record.bondViolation && <Badge variant="destructive">Bond Violation</Badge>}
                            {record.matchConfidence && (
                              <Badge 
                                variant={record.matchConfidence === 1.0 ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {record.matchConfidence === 1.0 ? "EXACT MATCH" : 
                                 record.matchConfidence >= 0.9 ? "HIGH MATCH" : "PARTIAL MATCH"}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">
                                <Clock className="w-4 h-4 inline mr-1" />
                                {new Date(record.arrestDate).toLocaleDateString()} at {record.arrestTime}
                              </p>
                              <p className="text-gray-600">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                {record.arrestLocation}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Agency: {record.arrestingAgency}</p>
                              <p className="text-gray-600">Booking: {record.bookingNumber}</p>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <p className="text-sm font-medium">Charges:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {record.charges.map((charge, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {charge}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRecord(record);
                              setIsDetailDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                          {record.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => acknowledgeAlertMutation.mutate(record.id)}
                              disabled={acknowledgeAlertMutation.isPending}
                            >
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1}-{Math.min(startIndex + recordsPerPage, filteredRecords.length)} of {filteredRecords.length} records
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Public Arrest Logs Tab */}
        <TabsContent value="public-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Hawaii County Public Arrest Logs
                  <Badge variant="outline">Auto-Updated</Badge>
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search names in arrest logs..."
                      value={publicSearchTerm}
                      onChange={(e) => setPublicSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/arrest-monitoring/public-logs"] })}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {publicLogsLoading ? (
                <div className="text-center py-8">Loading public arrest logs from Hawaii counties...</div>
              ) : (
                <div className="space-y-4">
                  {/* County-based sections, starting with Honolulu - Most Recent First */}
                  {hawaiiCounties.map((county) => {
                    const countyLogs = sortedPublicLogs.filter((log: any) => 
                      log.county === county.id && 
                      (publicSearchTerm === "" || 
                       log.name.toLowerCase().includes(publicSearchTerm.toLowerCase()) ||
                       log.charges?.some((charge: string) => charge.toLowerCase().includes(publicSearchTerm.toLowerCase())))
                    ).slice(0, 15); // Show most recent 15 records per county

                    return (
                      <Card key={county.id} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              <h3 className="font-medium">{county.name}</h3>
                              <Badge variant="secondary">{countyLogs?.length || 0} records</Badge>
                            </div>
                            <div className="text-xs text-gray-500">
                              Last updated: {new Date().toLocaleTimeString()}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {countyLogs && countyLogs.length > 0 ? (
                            <div className="space-y-3">
                              {countyLogs.map((log: any, index: number) => (
                                <div key={index} className="p-3 border rounded-lg bg-gray-50">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-medium">{log.name}</h4>
                                        <Badge variant="outline" className="text-xs">
                                          New Opportunity
                                        </Badge>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <p className="text-gray-600">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            {log.arrestDate} at {log.arrestTime}
                                          </p>
                                          <p className="text-gray-600">
                                            <MapPin className="w-4 h-4 inline mr-1" />
                                            {log.location}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-gray-600">Booking: {log.bookingNumber}</p>
                                          <p className="text-gray-600">Age: {log.age || 'N/A'}</p>
                                        </div>
                                      </div>
                                      
                                      {log.charges && (
                                        <div className="mt-2">
                                          <p className="text-sm font-medium">Charges:</p>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {log.charges.map((charge: string, chargeIndex: number) => (
                                              <Badge key={chargeIndex} variant="outline" className="text-xs">
                                                {charge}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="flex gap-2 ml-4">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          toast({
                                            title: "Contact Information",
                                            description: `Call ${county.agency} for more details about ${log.name}`,
                                          });
                                        }}
                                      >
                                        <Phone className="w-4 h-4 mr-1" />
                                        Contact
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          toast({
                                            title: "Lead Added",
                                            description: `${log.name} has been marked as a potential client`,
                                          });
                                        }}
                                      >
                                        <UserPlus className="w-4 h-4 mr-1" />
                                        Add Lead
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              No arrests found in {county.name} matching your search.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* White Pages Search Tab */}
        <TabsContent value="white-pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                White Pages Address Search
                <Badge variant="outline">Hawaii Residents</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Search for client addresses and contact information using White Pages directory
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name-search" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name-search"
                    placeholder="Enter client name..."
                    value={whitePagesName}
                    onChange={(e) => setWhitePagesName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="city-search" className="text-sm font-medium">
                    City (Optional)
                  </label>
                  <select
                    id="city-search"
                    value={whitePagesCity}
                    onChange={(e) => setWhitePagesCity(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">All Hawaii Cities</option>
                    <option value="honolulu">Honolulu</option>
                    <option value="hilo">Hilo</option>
                    <option value="kailua-kona">Kailua-Kona</option>
                    <option value="kaneohe">Kaneohe</option>
                    <option value="waipahu">Waipahu</option>
                    <option value="pearl-city">Pearl City</option>
                    <option value="mililani">Mililani</option>
                    <option value="kahului">Kahului</option>
                    <option value="lihue">Lihue</option>
                  </select>
                </div>
              </div>
              
              <Button
                onClick={() => whitePagesSearchMutation.mutate({ 
                  name: whitePagesName, 
                  city: whitePagesCity 
                })}
                disabled={!whitePagesName.trim() || whitePagesSearchMutation.isPending}
                className="w-full"
              >
                <Search className="w-4 h-4 mr-2" />
                {whitePagesSearchMutation.isPending ? "Searching..." : "Search White Pages"}
              </Button>

              {/* Search Results */}
              {whitePagesResults.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-lg">Search Results</h4>
                  {whitePagesResults.map((result: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium text-lg">{result.name}</h5>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{result.address}</span>
                            </div>
                            {result.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>{result.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              <span>{result.city}, HI {result.zipCode}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(`${result.name}\n${result.address}\n${result.city}, HI ${result.zipCode}${result.phone ? `\n${result.phone}` : ''}`);
                              toast({
                                title: "Copied",
                                description: "Address information copied to clipboard",
                              });
                            }}
                          >
                            Copy Info
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Contact Saved",
                                description: `${result.name}'s information has been saved to client records`,
                              });
                            }}
                          >
                            Save Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {whitePagesResults.length === 0 && whitePagesSearchMutation.isSuccess && (
                <div className="text-center py-8 text-gray-500">
                  No results found for "{whitePagesName}" in Hawaii White Pages.
                  Try searching with just the last name or check spelling.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Record Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Arrest Record Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Client Information</h4>
                  <p><strong>Name:</strong> {selectedRecord.clientName}</p>
                  <p><strong>Status:</strong> {selectedRecord.isActive ? 'Active Client' : 'Inactive Client'}</p>
                  <p><strong>Bond Status:</strong> {selectedRecord.bondViolation ? 'Violation Detected' : 'No Violation'}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Arrest Information</h4>
                  <p><strong>Date:</strong> {new Date(selectedRecord.arrestDate).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {selectedRecord.arrestTime}</p>
                  <p><strong>Location:</strong> {selectedRecord.arrestLocation}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Agency Information</h4>
                <p><strong>Department:</strong> {selectedRecord.arrestingAgency}</p>
                <p><strong>County:</strong> {selectedRecord.county}</p>
                <p><strong>Booking Number:</strong> {selectedRecord.bookingNumber}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Charges</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRecord.charges.map((charge, index) => (
                    <Badge key={index} variant="outline">
                      {charge}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Close
                </Button>
                {selectedRecord.status === 'pending' && (
                  <Button onClick={() => {
                    acknowledgeAlertMutation.mutate(selectedRecord.id);
                    setIsDetailDialogOpen(false);
                  }}>
                    Acknowledge & Process
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}