import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, Calendar, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface DashboardStatsProps {
  role?: 'admin' | 'maintenance' | 'client';
}

export default function DashboardStats({ role = 'admin' }: DashboardStatsProps) {
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: alerts } = useQuery({
    queryKey: ['/api/alerts/unacknowledged'],
  });

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Clients",
      value: stats.totalClients || 1,
      description: `${stats.activeClients || 1} active`,
      icon: Users,
      trend: "+12% from last month",
      color: "text-blue-600",
    },
    {
      title: "Revenue",
      value: `$${(stats.totalRevenue || 25000).toLocaleString()}`,
      description: "This month",
      icon: DollarSign,
      trend: "+8.2% from last month",
      color: "text-green-600",
    },
    {
      title: "Court Dates",
      value: stats.upcomingCourtDates || 1,
      description: "Next 30 days",
      icon: Calendar,
      trend: "3 this week",
      color: "text-orange-600",
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments || 0,
      description: `$${(stats.pendingAmount || 0).toLocaleString()} total`,
      icon: AlertTriangle,
      trend: "-2 from yesterday",
      color: "text-red-600",
    },
  ];

  if (role === 'client') {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-in Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Current</div>
            <p className="text-xs text-muted-foreground">
              Last check-in: 2 hours ago
            </p>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Court Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Feb 15</div>
            <p className="text-xs text-muted-foreground">
              District Court Room 3A
            </p>
            <Badge variant="outline" className="mt-2">
              10:00 AM
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Paid</div>
            <p className="text-xs text-muted-foreground">
              $25,000 bond amount
            </p>
            <Badge variant="secondary" className="mt-2">
              Current
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts && alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert: any) => (
                <div key={alert.id} className="flex items-center justify-between">
                  <span className="text-sm text-red-700 dark:text-red-300">{alert.message}</span>
                  <Badge variant="destructive">{alert.type}</Badge>
                </div>
              ))}
              {alerts.length > 3 && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  +{alerts.length - 3} more alerts
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}