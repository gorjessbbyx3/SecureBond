import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Calendar,
  Phone,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function ClientAnalytics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");
  
  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: checkIns } = useQuery({
    queryKey: ["/api/checkins"],
  });

  const { data: courtDates } = useQuery({
    queryKey: ["/api/court-dates"],
  });

  const analyzeClientData = () => {
    if (!clients || !Array.isArray(clients)) {
      return {
        totalClients: 0,
        activeClients: 0,
        complianceRate: 0,
        riskDistribution: { low: 0, medium: 0, high: 0 },
        locationData: [],
        checkInStats: { onTime: 0, late: 0, missed: 0 },
        upcomingCourts: 0
      };
    }

    const now = new Date();
    const timeframes = {
      week: 7,
      month: 30,
      quarter: 90
    };

    const daysBack = timeframes[selectedTimeframe as keyof typeof timeframes];
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Client status analysis
    const activeClients = clients.filter((client: any) => client.status === 'active');
    const totalClients = clients.length;

    // Risk level distribution
    const riskDistribution = clients.reduce((acc: any, client: any) => {
      const risk = client.riskLevel || 'medium';
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, { low: 0, medium: 0, high: 0 });

    // Location analysis
    const locationData = clients.reduce((acc: any, client: any) => {
      const city = client.address?.split(',')[1]?.trim() || 'Unknown';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});

    // Check-in compliance analysis
    const recentCheckIns = checkIns?.filter((checkIn: any) => 
      new Date(checkIn.checkInTime) >= cutoffDate
    ) || [];

    const checkInStats = recentCheckIns.reduce((acc: any, checkIn: any) => {
      const scheduledTime = new Date(checkIn.scheduledTime || checkIn.checkInTime);
      const actualTime = new Date(checkIn.checkInTime);
      const diffMinutes = (actualTime.getTime() - scheduledTime.getTime()) / (1000 * 60);

      if (diffMinutes <= 15) acc.onTime++;
      else if (diffMinutes <= 60) acc.late++;
      else acc.missed++;

      return acc;
    }, { onTime: 0, late: 0, missed: 0 });

    const totalCheckIns = checkInStats.onTime + checkInStats.late + checkInStats.missed;
    const complianceRate = totalCheckIns > 0 ? ((checkInStats.onTime / totalCheckIns) * 100) : 0;

    // Upcoming court dates
    const weekFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    const upcomingCourts = courtDates?.filter((court: any) => {
      const courtDate = new Date(court.courtDate);
      return courtDate >= now && courtDate <= weekFromNow;
    }).length || 0;

    return {
      totalClients,
      activeClients: activeClients.length,
      complianceRate: Math.round(complianceRate),
      riskDistribution,
      locationData: Object.entries(locationData).map(([city, count]) => ({ city, count })),
      checkInStats,
      upcomingCourts
    };
  };

  const analytics = analyzeClientData();

  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Analysis Period:</span>
        {["week", "month", "quarter"].map((timeframe) => (
          <Button
            key={timeframe}
            variant={selectedTimeframe === timeframe ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTimeframe(timeframe)}
            className="capitalize"
          >
            {timeframe}
          </Button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.activeClients} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.complianceRate}%</div>
            <p className="text-xs text-muted-foreground">
              Check-in compliance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Courts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.upcomingCourts}</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.riskDistribution.high}</div>
            <p className="text-xs text-muted-foreground">
              Clients requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Level Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.riskDistribution).map(([risk, count]) => (
              <div key={risk} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant={
                    risk === 'high' ? 'destructive' :
                    risk === 'medium' ? 'secondary' : 'default'
                  }>
                    {risk} risk
                  </Badge>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden w-32">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          risk === 'high' ? 'bg-red-500' :
                          risk === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ 
                          width: analytics.totalClients > 0 ? 
                            `${((count as number) / analytics.totalClients) * 100}%` : '0%' 
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium">{count as number} clients</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Check-in Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Check-in Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analytics.checkInStats.onTime}</div>
              <div className="text-sm text-green-700">On Time</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{analytics.checkInStats.late}</div>
              <div className="text-sm text-yellow-700">Late</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{analytics.checkInStats.missed}</div>
              <div className="text-sm text-red-700">Missed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geographic Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.locationData.slice(0, 5).map((location: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{location.city}</span>
                </div>
                <Badge variant="outline">{location.count} clients</Badge>
              </div>
            ))}
            {analytics.locationData.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-4">
                No location data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}