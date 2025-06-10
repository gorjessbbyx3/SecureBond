import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, TrendingUp } from "lucide-react";

interface LocationData {
  location: string;
  checkInCount: number;
  uniqueClients: number;
  clientNames: string[];
}

export default function TopLocations() {
  const { data: topLocations = [], isLoading } = useQuery<LocationData[]>({
    queryKey: ['/api/analytics/top-locations'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Check-in Locations</CardTitle>
          <CardDescription>Most frequent client check-in locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading location data...</div>
        </CardContent>
      </Card>
    );
  }

  if (topLocations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Check-in Locations</CardTitle>
          <CardDescription>Most frequent client check-in locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            No location data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Check-in Locations
        </CardTitle>
        <CardDescription>
          Most frequent client check-in locations based on actual data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topLocations.map((location, index) => (
            <div key={location.location} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{location.location}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>{location.checkInCount} check-ins</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{location.uniqueClients} clients</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  {location.clientNames.length > 2 ? (
                    <>
                      {location.clientNames.slice(0, 2).join(", ")} 
                      <br />
                      <span className="text-xs">+{location.clientNames.length - 2} more</span>
                    </>
                  ) : (
                    location.clientNames.join(", ")
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {topLocations.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">
              <strong>Total locations tracked:</strong> {topLocations.length} locations with{" "}
              {topLocations.reduce((sum, loc) => sum + loc.checkInCount, 0)} total check-ins
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}