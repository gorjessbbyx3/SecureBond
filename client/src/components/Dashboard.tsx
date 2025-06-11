import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Users, DollarSign, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalBonds: number;
  activeBonds: number;
  totalRevenue: number;
  pendingPayments: number;
  upcomingCourtDates: number;
  overdueCheckIns: number;
  recentAlerts: number;
}

export function Dashboard() {
  const { user } = useAuth();
  
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    queryFn: () => api.get('/api/dashboard/stats'),
    enabled: !!user && user.role === 'admin',
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['/api/dashboard/activity'],
    queryFn: () => api.get('/api/dashboard/recent-activity'),
    enabled: !!user && user.role === 'admin',
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" className="mx-auto mt-8" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load dashboard data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No Data Available</AlertTitle>
        <AlertDescription>
          Dashboard statistics are not available at this time.
        </AlertDescription>
      </Alert>
    );
  }

  const clientProgress = stats.totalClients > 0 ? (stats.activeClients / stats.totalClients) * 100 : 0;
  const bondProgress = stats.totalBonds > 0 ? (stats.activeBonds / stats.totalBonds) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
              <span>{stats.activeClients} active</span>
              <Progress value={clientProgress} className="flex-1" />
              <span>{clientProgress.toFixed(0)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bond Contracts</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBonds}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
              <span>{stats.activeBonds} active</span>
              <Progress value={bondProgress} className="flex-1" />
              <span>{bondProgress.toFixed(0)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.pendingPayments.toLocaleString()} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Court Dates</span>
                <Badge variant={stats.upcomingCourtDates > 0 ? "destructive" : "secondary"}>
                  {stats.upcomingCourtDates}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Overdue Check-ins</span>
                <Badge variant={stats.overdueCheckIns > 0 ? "destructive" : "secondary"}>
                  {stats.overdueCheckIns}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Recent Alerts</span>
                <Badge variant={stats.recentAlerts > 0 ? "destructive" : "secondary"}>
                  {stats.recentAlerts}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest updates from your bail bond management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity && Array.isArray(recentActivity) && recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.slice(0, 10).map((activity: any, index: number) => (
                <div key={index} className="flex items-center space-x-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' :
                    activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <span className="flex-1">{activity.message}</span>
                  <span className="text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}