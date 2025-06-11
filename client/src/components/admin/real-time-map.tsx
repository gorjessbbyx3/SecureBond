import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Users, AlertTriangle, Clock, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function RealTimeMap() {
  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
  });

  // Mock GPS locations for demonstration
  const clientLocations = [
    { id: 1, name: "John Doe", lat: 21.3099, lng: -157.8581, status: "active", lastUpdate: "2 min ago" },
    { id: 2, name: "Jane Smith", lat: 21.2787, lng: -157.8262, status: "warning", lastUpdate: "15 min ago" },
    { id: 3, name: "Mike Johnson", lat: 21.3891, lng: -157.9712, status: "active", lastUpdate: "5 min ago" },
    { id: 4, name: "Sarah Wilson", lat: 21.3045, lng: -158.0001, status: "offline", lastUpdate: "2 hrs ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Navigation className="h-4 w-4 mr-2" />
            Live Tracking
          </Button>
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            All Clients
          </Button>
          <Button variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alerts Only
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600 font-medium">Live GPS Tracking</span>
        </div>
      </div>

      {/* Map Placeholder with Client Locations */}
      <Card>
        <CardContent className="p-0">
          <div className="relative bg-gradient-to-br from-blue-50 to-green-50 h-96 rounded-lg overflow-hidden">
            {/* Map Grid Background */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />
            
            {/* Client Location Markers */}
            {clientLocations.map((client, index) => (
              <div
                key={client.id}
                className="absolute"
                style={{
                  left: `${20 + (index * 20)}%`,
                  top: `${30 + (index * 15)}%`,
                }}
              >
                <div className="relative group cursor-pointer">
                  <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse ${
                    client.status === 'active' ? 'bg-green-500' :
                    client.status === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  
                  {/* Pulse Animation */}
                  <div className={`absolute inset-0 w-4 h-4 rounded-full animate-ping ${
                    client.status === 'active' ? 'bg-green-400' :
                    client.status === 'warning' ? 'bg-yellow-400' :
                    'bg-red-400'
                  }`}></div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                    <div className="font-medium">{client.name}</div>
                    <div className="text-gray-300">Last: {client.lastUpdate}</div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Map Legend */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="text-sm font-medium mb-2">Live Status</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Active ({clientLocations.filter(c => c.status === 'active').length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Warning ({clientLocations.filter(c => c.status === 'warning').length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Offline ({clientLocations.filter(c => c.status === 'offline').length})</span>
                </div>
              </div>
            </div>
            
            {/* Location Info */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="text-sm font-medium">Honolulu, HI</div>
              <div className="text-xs text-gray-600">Real-time GPS tracking active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Location List */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Active Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientLocations.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      client.status === 'active' ? 'bg-green-500 animate-pulse' :
                      client.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <div className="font-medium text-sm">{client.name}</div>
                      <div className="text-xs text-gray-600">
                        GPS: {client.lat.toFixed(4)}, {client.lng.toFixed(4)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                      {client.status}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">{client.lastUpdate}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Location Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Coverage Area</span>
                <span className="font-bold">25 sq miles</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Distance</span>
                <span className="font-bold">2.3 miles</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Hotspots</span>
                <span className="font-bold">Downtown, Airport</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Update Frequency</span>
                <span className="font-bold text-green-600">30 seconds</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}