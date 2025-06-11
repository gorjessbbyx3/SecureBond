import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, Calendar, AlertTriangle, TrendingUp, Clock, ExternalLink } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DashboardStats as DashboardStatsType, Alert } from "@/lib/types";

interface DashboardStatsProps {
  role?: 'admin' | 'maintenance' | 'client';
}

export default function DashboardStats({ role = 'admin' }: DashboardStatsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery<DashboardStatsType>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ['/api/alerts/unacknowledged'],
  });

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: payments } = useQuery({
    queryKey: ["/api/payments"],
  });

  const { data: courtDates } = useQuery({
    queryKey: ["/api/court-dates"],
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      return await apiRequest(`/api/alerts/${alertId}/acknowledge`, "PATCH", {
        acknowledgedBy: "admin"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: "Alert Acknowledged",
        description: "The alert has been marked as acknowledged.",
      });
    },
  });

  // Provide default values for stats to prevent type errors
  const calculateTrends = () => {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    // Calculate client growth
    const currentMonthClients = (clients as any[])?.filter(c => 
      new Date(c.createdAt || c.signupDate || now) >= currentMonth
    ).length || 0;
    const lastMonthClients = (clients as any[])?.filter(c => {
      const date = new Date(c.createdAt || c.signupDate || now);
      return date >= twoMonthsAgo && date < lastMonth;
    }).length || 0;
    
    const clientGrowth = lastMonthClients > 0 ? 
      ((currentMonthClients - lastMonthClients) / lastMonthClients) * 100 : 
      (currentMonthClients > 0 ? 100 : 0); // Show 100% if new clients this month

    // Calculate revenue growth
    const currentRevenue = (payments as any[])?.filter(p => 
      new Date(p.paymentDate) >= currentMonth && p.status === 'confirmed'
    ).reduce((sum, p) => sum + p.amount, 0) || 0;

    const lastRevenue = (payments as any[])?.filter(p => {
      const date = new Date(p.paymentDate);
      return date >= twoMonthsAgo && date < lastMonth && p.status === 'confirmed';
    }).reduce((sum, p) => sum + p.amount, 0) || 0;

    const revenueGrowth = lastRevenue > 0 ? 
      ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 
      (currentRevenue > 0 ? 100 : 0); // Show 100% if revenue this month but none last month

    // Calculate court date trends
    const upcomingDates = (courtDates as any[])?.filter(cd => {
      const date = new Date(cd.courtDate);
      const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
      return date >= now && date <= thirtyDaysFromNow;
    }).length || 0;

    const thisWeekDates = (courtDates as any[])?.filter(cd => {
      const date = new Date(cd.courtDate);
      const weekFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
      return date >= now && date <= weekFromNow;
    }).length || 0;

    // Calculate pending payment trends from real data
    const currentPending = (payments as any[])?.filter(p => p.status === 'pending').length || 0;
    
    // Calculate yesterday's pending count from actual historical data
    const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const yesterdayPending = (payments as any[])?.filter(p => {
      const paymentDate = new Date(p.createdAt);
      return p.status === 'pending' && paymentDate.toDateString() === yesterday.toDateString();
    }).length || currentPending;

    const formatTrend = (value: number) => {
      const sign = value >= 0 ? '+' : '';
      return `${sign}${value.toFixed(1)}%`;
    };

    return {
      clientGrowth: formatTrend(clientGrowth),
      revenueGrowth: formatTrend(revenueGrowth),
      courtDatesThisWeek: thisWeekDates,
      pendingReduction: yesterdayPending - currentPending
    };
  };

  const trends = calculateTrends();

  const safeStats = stats || {
    totalClients: 0,
    activeClients: 0,
    upcomingCourtDates: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    pendingAmount: 0
  };

  const safeAlerts: Alert[] = alerts || [];

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
      value: safeStats.totalClients,
      description: `${safeStats.activeClients} active`,
      icon: Users,
      trend: safeStats.totalClients > 0 ? `${trends.clientGrowth} from last month` : "No clients yet",
      color: "text-blue-600",
    },
    {
      title: "Revenue",
      value: `$${safeStats.totalRevenue.toLocaleString()}`,
      description: "This month",
      icon: DollarSign,
      trend: safeStats.totalRevenue > 0 ? `${trends.revenueGrowth} from last month` : "No revenue yet",
      color: "text-green-600",
    },
    {
      title: "Court Dates",
      value: safeStats.upcomingCourtDates,
      description: "Next 30 days",
      icon: Calendar,
      trend: safeStats.upcomingCourtDates > 0 ? `${trends.courtDatesThisWeek} this week` : "No upcoming dates",
      color: "text-orange-600",
    },
    {
      title: "Pending Payments",
      value: safeStats.pendingPayments,
      description: `$${(safeStats.pendingAmount || 0).toLocaleString()} total`,
      icon: AlertTriangle,
      trend: safeStats.pendingPayments > 0 ? `-${trends.pendingReduction} from yesterday` : "No pending payments",
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
      {safeAlerts && safeAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Alerts ({safeAlerts.length})
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Navigate to alerts tab or show alerts modal
                  const alertsTab = document.querySelector('[data-value="alerts"]') as HTMLElement;
                  if (alertsTab) {
                    alertsTab.click();
                  }
                }}
                className="text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {safeAlerts.slice(0, 3).map((alert: any) => (
                <div key={alert.id} className="flex items-center justify-between p-2 rounded border border-red-200 bg-white dark:bg-red-950 hover:bg-red-25 dark:hover:bg-red-900 transition-colors">
                  <span className="text-sm text-red-700 dark:text-red-300 flex-1">{alert.message}</span>
                  <div className="flex items-center gap-2 ml-2">
                    <Badge variant="destructive" className="text-xs">
                      {alert.alertType || alert.type || 'Alert'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        acknowledgeAlertMutation.mutate(alert.id);
                      }}
                      disabled={acknowledgeAlertMutation.isPending}
                      className="h-6 px-2 text-xs text-red-600 hover:text-red-800"
                    >
                      Acknowledge
                    </Button>
                  </div>
                </div>
              ))}
              {safeAlerts.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const alertsTab = document.querySelector('[data-value="alerts"]') as HTMLElement;
                    if (alertsTab) {
                      alertsTab.click();
                    }
                  }}
                  className="w-full text-xs text-red-600 hover:text-red-800"
                >
                  +{safeAlerts.length - 3} more alerts - Click to view all
                </Button>
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