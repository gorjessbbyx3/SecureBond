import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, AlertTriangle, Clock, Navigation, Shield, Smartphone, Users, Activity } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LocationData {
  clientId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
  timestamp: string;
  withinJurisdiction: boolean;
  source: 'cell_tower' | 'gps';
}

export default function LocationManagementDashboard() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<string>("");

  // Fetch real-time client locations
  const { data: locations = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/client-locations/real-time'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Track GPS location mutation
  const trackGPSMutation = useMutation({
    mutationFn: async ({ clientId, latitude, longitude }: { clientId: string; latitude: number; longitude: number }) => {
      const response = await apiRequest("POST", `/api/clients/${clientId}/location`, { 
        locationData: { lat: latitude, lon: longitude }
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Location Tracked",
        description: "GPS location recorded successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/client-locations/real-time'] });
    },
    onError: () => {
      toast({
        title: "Tracking Failed",
        description: "Unable to record location.",
        variant: "destructive"
      });
    }
  });

  // Geofence check mutation
  const geofenceCheckMutation = useMutation({
    mutationFn: async ({ clientId, latitude, longitude }: { clientId: string; latitude: number; longitude: number }) => {
      const response = await apiRequest("POST", `/api/admin/geofence/check`, { clientId, latitude, longitude });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.alertCreated) {
        toast({
          title: "Jurisdiction Alert",
          description: "Client detected outside Hawaii jurisdiction",
          variant: "destructive"
        });
      }
    }
  });

  const handleLocationTracking = () => {
    if (!selectedClient) {
      toast({
        title: "Select Client",
        description: "Please enter a client ID to track.",
        variant: "destructive"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        trackGPSMutation.mutate({
          clientId: selectedClient,
          latitude,
          longitude
        });

        geofenceCheckMutation.mutate({
          clientId: selectedClient,
          latitude,
          longitude
        });
      },
      (error) => {
        toast({
          title: "GPS Error",
          description: "Unable to access GPS location.",
          variant: "destructive"
        });
      }
    );
  };

  const getStatusColor = (location: LocationData) => {
    const now = new Date();
    const locationTime = new Date(location.timestamp);
    const minutesAgo = (now.getTime() - locationTime.getTime()) / (1000 * 60);

    if (!location.withinJurisdiction) return "destructive";
    if (minutesAgo > 60) return "secondary";
    if (minutesAgo > 30) return "outline";
    return "default";
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const minutesAgo = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (minutesAgo < 1) return "Just now";
    if (minutesAgo < 60) return `${minutesAgo}m ago`;
    const hoursAgo = Math.floor(minutesAgo / 60);
    return `${hoursAgo}h ago`;
  };

  const jurisdictionViolations = (locations as LocationData[]).filter(loc => !loc.withinJurisdiction);
  const recentActivity = (locations as LocationData[]).filter(loc => {
    const minutesAgo = (new Date().getTime() - new Date(loc.timestamp).getTime()) / (1000 * 60);
    return minutesAgo < 60;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Location Management</h2>
          <p className="text-muted-foreground">
            Real-time client tracking and jurisdiction monitoring
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracked</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(locations as LocationData[]).length}</div>
            <p className="text-xs text-muted-foreground">
              Active location records
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentActivity.length}</div>
            <p className="text-xs text-muted-foreground">
              Updates in last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{jurisdictionViolations.length}</div>
            <p className="text-xs text-muted-foreground">
              Jurisdiction breaches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GPS Tracking</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">
              System operational
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tracking" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tracking">Location Tracking</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="history">Location History</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Manual Location Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="client-id">Client ID</Label>
                  <Input
                    id="client-id"
                    placeholder="Enter Client ID"
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleLocationTracking}
                  disabled={trackGPSMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  Track Current Location
                </Button>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  GPS tracking provides immediate location data. Cell tower tracking requires active RapidAPI subscription.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Client Locations</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading location data...
                </div>
              ) : (locations as LocationData[]).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent location data available. Start tracking clients to see real-time updates.
                </div>
              ) : (
                <div className="space-y-3">
                  {(locations as LocationData[]).map((location: LocationData, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="font-medium">Client {location.clientId}</span>
                          <span className="text-sm text-muted-foreground">
                            {location.address}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(location)}>
                          {location.withinJurisdiction ? "In Jurisdiction" : "VIOLATION"}
                        </Badge>
                        <Badge variant="outline">
                          {location.source === 'gps' ? 'GPS' : 'Cell Tower'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(location.timestamp)}
                        </span>
                        {!location.withinJurisdiction && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Jurisdiction Violations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jurisdictionViolations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No jurisdiction violations detected.
                </div>
              ) : (
                <div className="space-y-3">
                  {jurisdictionViolations.map((violation: LocationData, index: number) => (
                    <div key={index} className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-red-800">Client {violation.clientId}</h4>
                          <p className="text-sm text-red-600">{violation.address}</p>
                          <p className="text-xs text-red-500">
                            Detected {formatTimeAgo(violation.timestamp)}
                          </p>
                        </div>
                        <Badge variant="destructive">VIOLATION</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Location History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(locations as LocationData[])
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((location: LocationData, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border-b">
                      <div>
                        <span className="font-medium">Client {location.clientId}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {location.address}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={location.withinJurisdiction ? "default" : "destructive"}>
                          {location.withinJurisdiction ? "Valid" : "Violation"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(location.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}