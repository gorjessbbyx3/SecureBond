import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, AlertTriangle, Clock, Navigation, Shield, Smartphone } from "lucide-react";
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

interface CellTowerData {
  mcc: number;  // Mobile Country Code
  mnc: number;  // Mobile Network Code
  lac: number;  // Location Area Code
  cid: number;  // Cell ID
}

export default function RealTimeLocationTracker() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [cellTowerData, setCellTowerData] = useState<CellTowerData>({
    mcc: 310, // US Mobile Country Code
    mnc: 260, // T-Mobile (example)
    lac: 0,
    cid: 0
  });

  // Fetch real-time client locations
  const { data: locations = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/client-locations/real-time'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Track client location mutation
  const trackLocationMutation = useMutation({
    mutationFn: async ({ clientId, locationData }: { clientId: string; locationData: any }) => {
      const response = await apiRequest("POST", `/api/clients/${clientId}/location`, { locationData });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Location Tracked",
        description: "Client location has been successfully recorded."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/client-locations/real-time'] });
    },
    onError: () => {
      toast({
        title: "Tracking Failed",
        description: "Unable to track location. Check API credentials.",
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
          description: "Client detected outside Hawaii jurisdiction!",
          variant: "destructive"
        });
      }
    }
  });

  const handleCellTowerTracking = () => {
    if (!selectedClient) {
      toast({
        title: "Select Client",
        description: "Please select a client to track.",
        variant: "destructive"
      });
      return;
    }

    trackLocationMutation.mutate({
      clientId: selectedClient,
      locationData: cellTowerData
    });
  };

  const handleGPSTracking = () => {
    if (!selectedClient) {
      toast({
        title: "Select Client",
        description: "Please select a client to track.",
        variant: "destructive"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const gpsData = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        
        trackLocationMutation.mutate({
          clientId: selectedClient,
          locationData: gpsData
        });

        // Check geofence
        geofenceCheckMutation.mutate({
          clientId: selectedClient,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Real-Time Location Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Client Selection and Manual Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="client-select">Select Client to Track</Label>
              <Input
                id="client-select"
                placeholder="Enter Client ID"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={handleGPSTracking}
                  disabled={trackLocationMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  Track GPS
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCellTowerTracking}
                  disabled={trackLocationMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Smartphone className="h-4 w-4" />
                  Track Cell Tower
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Cell Tower Parameters</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="mcc" className="text-xs">MCC</Label>
                  <Input
                    id="mcc"
                    type="number"
                    placeholder="310"
                    value={cellTowerData.mcc}
                    onChange={(e) => setCellTowerData(prev => ({ ...prev, mcc: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="mnc" className="text-xs">MNC</Label>
                  <Input
                    id="mnc"
                    type="number"
                    placeholder="260"
                    value={cellTowerData.mnc}
                    onChange={(e) => setCellTowerData(prev => ({ ...prev, mnc: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="lac" className="text-xs">LAC</Label>
                  <Input
                    id="lac"
                    type="number"
                    placeholder="801"
                    value={cellTowerData.lac}
                    onChange={(e) => setCellTowerData(prev => ({ ...prev, lac: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cid" className="text-xs">Cell ID</Label>
                  <Input
                    id="cid"
                    type="number"
                    placeholder="86355"
                    value={cellTowerData.cid}
                    onChange={(e) => setCellTowerData(prev => ({ ...prev, cid: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Location tracking requires active RapidAPI subscription for cell tower geolocation. 
              Configure RAPIDAPI_KEY environment variable with valid credentials.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Real-Time Location Feed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Client Locations</CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <Clock className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading location data...
            </div>
          ) : locations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent location data available. Start tracking clients to see real-time updates.
            </div>
          ) : (
            <div className="space-y-3">
              {locations.map((location: LocationData, index: number) => (
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
    </div>
  );
}