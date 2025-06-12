import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Smartphone, AlertCircle, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GeolocationTestResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  address?: string;
  error?: string;
  source: 'gps' | 'cell_tower';
}

export default function GeolocationIntegration() {
  const { toast } = useToast();
  const [testClient, setTestClient] = useState("TEST001");
  const [cellTowerData, setCellTowerData] = useState({
    mcc: 310, // US Mobile Country Code
    mnc: 260, // T-Mobile
    lac: 12345,
    cid: 67890
  });
  const [testResults, setTestResults] = useState<GeolocationTestResult[]>([]);

  // Test GPS location tracking
  const testGPSMutation = useMutation({
    mutationFn: async () => {
      return new Promise<GeolocationTestResult>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude, accuracy } = position.coords;
              
              const response = await apiRequest("POST", `/api/clients/${testClient}/location`, {
                locationData: { lat: latitude, lon: longitude }
              });
              
              const result = await response.json();
              
              resolve({
                success: true,
                latitude,
                longitude,
                accuracy,
                address: result.address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                source: 'gps'
              });
            } catch (error) {
              reject({
                success: false,
                error: 'Failed to save GPS location',
                source: 'gps'
              });
            }
          },
          (error) => {
            reject({
              success: false,
              error: 'GPS access denied or unavailable',
              source: 'gps'
            });
          }
        );
      });
    },
    onSuccess: (result) => {
      setTestResults(prev => [result, ...prev]);
      toast({
        title: "GPS Test Complete",
        description: `Location tracked: ${result.address}`,
      });
    },
    onError: (error: any) => {
      setTestResults(prev => [error, ...prev]);
      toast({
        title: "GPS Test Failed",
        description: error.error || "GPS tracking failed",
        variant: "destructive"
      });
    }
  });

  // Test cell tower location tracking
  const testCellTowerMutation = useMutation({
    mutationFn: async (): Promise<GeolocationTestResult> => {
      try {
        const response = await apiRequest("POST", `/api/clients/${testClient}/location`, {
          locationData: cellTowerData
        });
        
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        return {
          success: true,
          latitude: result.latitude,
          longitude: result.longitude,
          accuracy: result.accuracy,
          address: result.address,
          source: 'cell_tower'
        };
      } catch (error) {
        throw {
          success: false,
          error: error instanceof Error ? error.message : 'Cell tower tracking failed',
          source: 'cell_tower'
        };
      }
    },
    onSuccess: (result) => {
      setTestResults(prev => [result, ...prev]);
      toast({
        title: "Cell Tower Test Complete",
        description: `Location tracked: ${result.address}`,
      });
    },
    onError: (error: any) => {
      setTestResults(prev => [error, ...prev]);
      toast({
        title: "Cell Tower Test Failed",
        description: error.error || "Cell tower tracking failed",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geolocation Service Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GPS Testing */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">GPS Location Testing</Label>
              <div className="space-y-2">
                <Label htmlFor="test-client">Test Client ID</Label>
                <Input
                  id="test-client"
                  value={testClient}
                  onChange={(e) => setTestClient(e.target.value)}
                  placeholder="TEST001"
                />
              </div>
              <Button
                onClick={() => testGPSMutation.mutate()}
                disabled={testGPSMutation.isPending}
                className="w-full flex items-center gap-2"
              >
                <Navigation className="h-4 w-4" />
                Test GPS Tracking
              </Button>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  GPS tracking is always available and provides immediate location data.
                </AlertDescription>
              </Alert>
            </div>

            {/* Cell Tower Testing */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Cell Tower Location Testing</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="mcc" className="text-xs">MCC</Label>
                  <Input
                    id="mcc"
                    type="number"
                    value={cellTowerData.mcc}
                    onChange={(e) => setCellTowerData(prev => ({ ...prev, mcc: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="mnc" className="text-xs">MNC</Label>
                  <Input
                    id="mnc"
                    type="number"
                    value={cellTowerData.mnc}
                    onChange={(e) => setCellTowerData(prev => ({ ...prev, mnc: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="lac" className="text-xs">LAC</Label>
                  <Input
                    id="lac"
                    type="number"
                    value={cellTowerData.lac}
                    onChange={(e) => setCellTowerData(prev => ({ ...prev, lac: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cid" className="text-xs">Cell ID</Label>
                  <Input
                    id="cid"
                    type="number"
                    value={cellTowerData.cid}
                    onChange={(e) => setCellTowerData(prev => ({ ...prev, cid: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <Button
                onClick={() => testCellTowerMutation.mutate()}
                disabled={testCellTowerMutation.isPending}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Smartphone className="h-4 w-4" />
                Test Cell Tower Tracking
              </Button>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Cell tower tracking requires active RapidAPI subscription for cellid-geolocation-api.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className={`p-3 border rounded-lg ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <Badge variant={result.source === 'gps' ? 'default' : 'outline'}>
                        {result.source === 'gps' ? 'GPS' : 'Cell Tower'}
                      </Badge>
                    </div>
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                  
                  {result.success ? (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-medium">{result.address}</p>
                      <p className="text-xs text-muted-foreground">
                        {result.latitude?.toFixed(6)}, {result.longitude?.toFixed(6)}
                      </p>
                      {result.accuracy && (
                        <p className="text-xs text-muted-foreground">
                          Accuracy: {result.accuracy}m
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-red-600">{result.error}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle>API Configuration Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-green-600" />
              <span>GPS Location Services</span>
            </div>
            <Badge variant="default">Active</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-orange-600" />
              <span>RapidAPI Cell Tower Service</span>
            </div>
            <Badge variant="outline">Subscription Required</Badge>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              To enable cell tower triangulation, subscribe to the cellid-geolocation-api on RapidAPI and ensure the RAPIDAPI_KEY environment variable is configured with an active subscription.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}