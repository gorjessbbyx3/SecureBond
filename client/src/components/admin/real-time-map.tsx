import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Clock, Phone, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ClientLocation {
  id: number;
  clientId: string;
  fullName: string;
  lastCheckIn: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'compliant' | 'overdue' | 'missing';
}

export default function RealTimeMap() {
  const { data: clients, isLoading } = useQuery({
    queryKey: ['/api/clients/locations'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Locations</CardTitle>
          <CardDescription>Real-time tracking and check-in status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const mockClients: ClientLocation[] = [
    {
      id: 1,
      clientId: "SB123456",
      fullName: "John Smith",
      lastCheckIn: "2024-01-10T14:30:00Z",
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: "123 Main St, Anytown, ST 12345"
      },
      status: 'compliant'
    }
  ];

  const clientData = clients || mockClients;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-500';
      case 'overdue': return 'bg-yellow-500';
      case 'missing': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant': return <Badge className="bg-green-100 text-green-800">Compliant</Badge>;
      case 'overdue': return <Badge variant="secondary">Overdue</Badge>;
      case 'missing': return <Badge variant="destructive">Missing</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Client Locations
        </CardTitle>
        <CardDescription>Real-time tracking and check-in status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Placeholder */}
        <div className="relative h-64 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 rounded-lg border-2 border-dashed border-blue-200 dark:border-blue-800 flex items-center justify-center">
          <div className="text-center space-y-2">
            <MapPin className="h-12 w-12 text-blue-400 mx-auto" />
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Interactive Map View</p>
            <p className="text-xs text-blue-500 dark:text-blue-500">GPS tracking integration ready</p>
          </div>
          
          {/* Sample location markers */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Live Client</span>
          </div>
        </div>

        {/* Client List */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Active Clients ({clientData.length})</h4>
          
          {clientData.map((client) => (
            <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(client.status)}`}></div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{client.fullName}</span>
                    <span className="text-xs text-muted-foreground">({client.clientId})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Last check-in: {new Date(client.lastCheckIn).toLocaleString()}
                  </div>
                  {client.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {client.location.address}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusBadge(client.status)}
                <Button variant="ghost" size="sm">
                  <Navigation className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Check Overdue
            </Button>
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Refresh Locations
            </Button>
            <Button variant="outline" size="sm">
              <Navigation className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}