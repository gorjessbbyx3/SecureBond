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
  Settings
} from "lucide-react";

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

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch arrest records
  const { data: arrestRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ["/api/arrest-monitoring/records"],
    refetchInterval: 300000, // Refresh every 5 minutes
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

  const hawaiiCounties = [
    { id: "honolulu", name: "Honolulu County", agency: "Honolulu Police Department" },
    { id: "hawaii", name: "Hawaii County", agency: "Hawaii Police Department" },
    { id: "maui", name: "Maui County", agency: "Maui Police Department" },
    { id: "kauai", name: "Kauai County", agency: "Kauai Police Department" },
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

  const filteredRecords = arrestRecords ? arrestRecords.filter((record: ArrestRecord) => {
    const matchesSearch = record.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.charges.some(charge => charge.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         record.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCounty = selectedCounty === "all" || record.county.toLowerCase() === selectedCounty;
    return matchesSearch && matchesCounty;
  }) : [];

  const pendingAlerts = arrestRecords ? arrestRecords.filter((record: ArrestRecord) => record.status === 'pending').length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Shield className="mr-2 w-6 h-6" />
            Hawaii Arrest Log Monitoring
          </h2>
          <p className="text-muted-foreground">
            Real-time monitoring of client arrests across all Hawaii counties
          </p>
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
                <p className="text-2xl font-bold">{arrestRecords?.length || 0}</p>
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
                  {arrestRecords ? arrestRecords.filter((r: ArrestRecord) => r.isActive).length : 0}
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
                  {arrestRecords ? arrestRecords.filter((r: ArrestRecord) => r.bondViolation).length : 0}
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
              const config = monitoringConfig?.find((c: MonitoringConfig) => c.county === county.id);
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

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Arrest Records</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search records..."
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
            <div className="text-center py-8">Loading arrest records...</div>
          ) : filteredRecords.length > 0 ? (
            <div className="space-y-3">
              {filteredRecords.map((record: ArrestRecord) => (
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
          ) : (
            <div className="text-center py-8 text-gray-500">
              No arrest records found. The system is actively monitoring for any client appearances in police logs.
            </div>
          )}
        </CardContent>
      </Card>

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