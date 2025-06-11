import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Users, AlertTriangle, Clock, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Client, CheckIn } from "@shared/schema";

interface ClientLocation {
  id: number;
  name: string;
  clientId: string;
  status: 'active' | 'warning' | 'offline';
  lastUpdate: string;
  location: any;
  lat: number;
  lng: number;
}

export default function RealTimeMap() {
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  // Get actual client check-in data with locations
  const { data: checkIns = [] } = useQuery<CheckIn[]>({
    queryKey: ['/api/check-ins'],
  });

  // Process real client locations from check-ins
  const clientLocations: ClientLocation[] = clients.map((client: Client) => {
    const lastCheckIn = checkIns
      .filter((ci: CheckIn) => ci.clientId === client.id)
      .sort((a: CheckIn, b: CheckIn) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];
    
    return {
      id: client.id,
      name: client.fullName,
      clientId: client.clientId,
      status: client.isActive ? ((client.missedCheckIns || 0) > 0 ? 'warning' : 'active') : 'offline',
      lastUpdate: lastCheckIn ? new Date(lastCheckIn.createdAt || 0).toLocaleString() : 'No check-ins',
      location: lastCheckIn?.location || null,
      lat: lastCheckIn?.location ? parseFloat(lastCheckIn.location.split(',')[0] || '0') : null,
      lng: lastCheckIn?.location ? parseFloat(lastCheckIn.location.split(',')[1] || '0') : null
    };
  }).filter((client): client is ClientLocation => client.lat !== null && client.lng !== null);

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
            
            {/* Real Client Location Markers */}
            {clientLocations.map((client: ClientLocation, index: number) => {
              // Convert lat/lng to map coordinates (simplified projection)
              const mapX = Math.min(Math.max(((client.lng + 158) * 50), 10), 90);
              const mapY = Math.min(Math.max(((21.5 - client.lat) * 50), 10), 90);
              
              return (
                <div
                  key={client.id}
                  className="absolute"
                  style={{
                    left: `${mapX}%`,
                    top: `${mapY}%`,
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
                  
                  {/* Real Client Info Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                    <div className="font-medium">{client.name}</div>
                    <div className="text-gray-300">ID: {client.clientId}</div>
                    <div className="text-gray-300">Last: {client.lastUpdate}</div>
                    {client.location && (
                      <div className="text-gray-300">GPS: {client.lat?.toFixed(4)}, {client.lng?.toFixed(4)}</div>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
            
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
            
            {/* Real Location Info */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="text-sm font-medium">Live Tracking: {clientLocations.length} clients</div>
              <div className="text-xs text-gray-600">
                {clientLocations.filter((c: ClientLocation) => c.status === 'active').length} active • 
                {clientLocations.filter((c: ClientLocation) => c.status === 'warning').length} warnings • 
                {clientLocations.filter((c: ClientLocation) => c.status === 'offline').length} offline
              </div>
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
              {clientLocations.map((client: ClientLocation) => (
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
                <span className="text-sm">Total Clients</span>
                <span className="font-bold">{clients.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">With GPS Data</span>
                <span className="font-bold">{clientLocations.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Check-ins</span>
                <span className="font-bold text-green-600">
                  {clientLocations.filter((c: ClientLocation) => c.status === 'active').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Requires Attention</span>
                <span className="font-bold text-red-600">
                  {clientLocations.filter((c: ClientLocation) => c.status === 'warning').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}