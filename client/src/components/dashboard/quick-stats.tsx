import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  Calendar, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface QuickStatsProps {
  role?: "admin" | "staff" | "client";
}

export default function QuickStats({ role = "admin" }: QuickStatsProps) {
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentActivity } = useQuery({
    queryKey: ["/api/dashboard/recent-activity"],
  });

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts/unacknowledged"],
  });

  const { data: payments } = useQuery({
    queryKey: ["/api/payments"],
  });

  const { data: courtDates } = useQuery({
    queryKey: ["/api/court-dates"],
  });

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Calculate real trends from actual data
  const calculateTrends = () => {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Client growth trend
    const currentMonthClients = (clients as any[])?.filter(c => 
      new Date(c.createdAt) >= currentMonth
    ).length || 0;
    const totalClients = (clients as any[])?.length || 0;
    const clientGrowth = totalClients > 0 ? ((currentMonthClients / totalClients) * 100) : 0;
    
    // Revenue trend calculation
    const currentMonthPayments = (payments as any[])?.filter(p => 
      new Date(p.paymentDate) >= currentMonth && p.status === 'confirmed'
    ) || [];
    const lastMonthPayments = (payments as any[])?.filter(p => {
      const date = new Date(p.paymentDate);
      return date >= lastMonth && date < currentMonth && p.status === 'confirmed';
    }) || [];
    
    const currentRevenue = currentMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const lastRevenue = lastMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const revenueGrowth = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;
    
    // Court dates today
    const todayCourtDates = (courtDates as any[])?.filter(cd => {
      const courtDate = new Date(cd.courtDate);
      return courtDate.toDateString() === today.toDateString();
    }).length || 0;
    
    // Active alerts count
    const activeAlertsCount = (alerts as any[])?.length || 0;
    
    return {
      clientGrowth: clientGrowth > 0 ? `+${clientGrowth.toFixed(1)}%` : `${clientGrowth.toFixed(1)}%`,
      revenueGrowth: revenueGrowth > 0 ? `+${revenueGrowth.toFixed(1)}%` : `${revenueGrowth.toFixed(1)}%`,
      todayCourtDates: todayCourtDates > 0 ? `${todayCourtDates} today` : "None today",
      activeAlerts: activeAlertsCount > 0 ? `${activeAlertsCount} active` : "All resolved"
    };
  };

  const trends = calculateTrends();

  const statsData = [
    {
      title: "Total Clients",
      value: (stats as any)?.totalClients || 0,
      icon: Users,
      trend: trends.clientGrowth,
      trendUp: trends.clientGrowth.startsWith('+'),
      description: "Active clients in system"
    },
    {
      title: "Monthly Revenue",
      value: `$${((stats as any)?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      trend: trends.revenueGrowth,
      trendUp: trends.revenueGrowth.startsWith('+'),
      description: "Revenue this month"
    },
    {
      title: "Upcoming Courts",
      value: (stats as any)?.upcomingCourtDates || 0,
      icon: Calendar,
      trend: trends.todayCourtDates,
      trendUp: false,
      description: "Court dates this week"
    },
    {
      title: "Active Alerts",
      value: (alerts as any[])?.length || 0,
      icon: AlertTriangle,
      trend: trends.activeAlerts,
      trendUp: trends.activeAlerts === "All resolved",
      description: "Requiring attention"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <div className={`flex items-center ${stat.trendUp ? 'text-green-600' : 'text-blue-600'}`}>
                  {stat.trendUp ? 
                    <TrendingUp className="h-3 w-3 mr-1" /> : 
                    <Clock className="h-3 w-3 mr-1" />
                  }
                  {stat.trend}
                </div>
                <span>•</span>
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(recentActivity as any[])?.slice(0, 4).map((activity: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'payment' ? 'bg-green-500' :
                    activity.type === 'alert' ? 'bg-red-500' :
                    activity.type === 'court' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
                <Badge variant={
                  activity.type === 'payment' ? 'default' :
                  activity.type === 'alert' ? 'destructive' :
                  'secondary'
                }>
                  {activity.type}
                </Badge>
              </div>
            )) || (
              <div className="text-sm text-gray-500 text-center py-4">
                No recent activity to display
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}