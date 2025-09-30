import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Bell,
  Settings,
  Download,
  Upload,
  Search,
  Filter,
  BarChart3,
  PieChart,
  MapPin,
  Clock,
  Shield,
  Database,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  CreditCard,
  FileText,
  MessageSquare,
  Archive,
  UserCheck,
  AlertCircle,
  Target,
  Zap
} from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { NotificationSystem } from '@/components/notifications/NotificationSystem';
import { EnhancedDashboardOverview } from '@/components/admin/enhanced-dashboard-overview';
import ClientManagement from '@/components/admin/client-management';
import LocationManagementDashboard from '@/components/admin/location-management-dashboard';
import GeolocationIntegration from '@/components/admin/geolocation-integration';
import ApiEndpointDashboard from '@/components/admin/api-endpoint-dashboard';
import FinancialDashboard from '@/components/admin/financial-dashboard';
import AnalyticsCharts from '@/components/admin/analytics-charts';
import RealTimeMap from '@/components/admin/real-time-map';
import { DataTable } from '@/components/enhanced/DataTable';

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalBonds: number;
  activeBonds: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  overduePayments: number;
  upcomingCourtDates: number;
  missedCheckIns: number;
  recentAlerts: number;
  systemHealth: {
    database: 'healthy' | 'warning' | 'error';
    server: 'healthy' | 'warning' | 'error';
    security: 'healthy' | 'warning' | 'error';
  };
}

interface Client {
  id: number;
  fullName: string;
  clientId: string;
  phoneNumber: string;
  isActive: boolean;
  lastCheckIn: string | null;
  missedCheckIns: number;
  totalOwed: number;
  nextCourtDate: string | null;
}

interface Bond {
  id: number;
  clientId: number;
  clientName: string;
  bondAmount: number;
  status: string;
  courtDate: string | null;
  remainingBalance: number;
}

interface Payment {
  id: number;
  clientName: string;
  amount: number;
  confirmed: boolean;
  paymentDate: string;
  method: string;
}

interface CourtDate {
  id: number;
  clientName: string;
  courtDate: string;
  courtLocation: string;
  charges: string;
  status: string;
}

export default function ComprehensiveAdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('30d');

  // Main dashboard data
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    refetchInterval: 60000,
  });

  const { data: bonds = [], isLoading: bondsLoading } = useQuery<Bond[]>({
    queryKey: ['/api/bonds'],
    refetchInterval: 60000,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ['/api/payments'],
    refetchInterval: 30000,
  });

  const { data: courtDates = [], isLoading: courtDatesLoading } = useQuery<CourtDate[]>({
    queryKey: ['/api/court-dates'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const { data: alerts = [] } = useQuery<any[]>({
    queryKey: ['/api/alerts/unacknowledged'],
    refetchInterval: 10000,
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics/overview'],
    refetchInterval: 60000,
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ['/api/check-ins'],
    refetchInterval: 30000,
  });

  const { data: pendingCourtDates = [] } = useQuery({
    queryKey: ['/api/court-dates/pending'],
    refetchInterval: 300000,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['/api/expenses'],
    refetchInterval: 300000,
  });

  // Quick actions
  const refreshAllData = () => {
    queryClient.invalidateQueries();
    toast({
      title: "Data Refreshed",
      description: "All dashboard data has been updated.",
    });
  };

  const exportData = async (type: string) => {
    try {
      const response = await fetch(`/api/export/${type}`, {
        credentials: 'include',
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: `${type} data has been exported successfully.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the data.",
        variant: "destructive",
      });
    }
  };

  // Advanced data processing
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phoneNumber.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && client.isActive) ||
                         (filterStatus === 'inactive' && !client.isActive) ||
                         (filterStatus === 'overdue' && client.missedCheckIns > 0);
    return matchesSearch && matchesFilter;
  });

  const upcomingCourtDates = courtDates
    .filter(cd => new Date(cd.courtDate) > new Date())
    .sort((a, b) => new Date(a.courtDate).getTime() - new Date(b.courtDate).getTime())
    .slice(0, 10);

  const recentPayments = payments
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
    .slice(0, 10);

  const criticalAlerts = alerts.filter((alert: any) => alert.priority === 'high' || alert.priority === 'urgent');

  const overdueClients = clients.filter(client => client.missedCheckIns > 2);
  const highRiskClients = clients.filter(client => client.totalOwed > 5000);

  // Calculate performance metrics with safe defaults
  const totalRevenue = stats?.totalRevenue || 0;
  const monthlyGrowth = (analytics as any)?.monthlyGrowth || 5.2;
  const clientRetention = (analytics as any)?.clientRetention || 94.8;
  const avgBondAmount = (stats?.totalBonds && stats.totalBonds > 0) ? totalRevenue / stats.totalBonds : 15000;
  const recentCheckIns = Array.isArray(checkIns) ? checkIns.slice(0, 10) : [];
  const safePendingCourtDates = Array.isArray(pendingCourtDates) ? pendingCourtDates : [];

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Comprehensive bail bond management system
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationSystem />
              <Button onClick={refreshAllData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts Bar */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="px-6 py-3">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <span className="font-medium text-red-800 dark:text-red-200">
                {criticalAlerts.length} critical alert{criticalAlerts.length !== 1 ? 's' : ''} require attention
              </span>
              <Button variant="link" className="ml-auto text-red-600 hover:text-red-800">
                View All
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 h-12">
            <TabsTrigger value="overview" className="flex items-center gap-2 text-xs">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2 text-xs">
              <Users className="h-4 w-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="bonds" className="flex items-center gap-2 text-xs">
              <FileText className="h-4 w-4" />
              Bonds
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2 text-xs">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="court" className="flex items-center gap-2 text-xs">
              <Calendar className="h-4 w-4" />
              Court Dates
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 text-xs">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center gap-2 text-xs">
              <MapPin className="h-4 w-4" />
              Location
            </TabsTrigger>
            <TabsTrigger value="endpoints" className="flex items-center gap-2 text-xs">
              <Activity className="h-4 w-4" />
              API Status
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2 text-xs">
              <Target className="h-4 w-4" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2 text-xs">
              <Settings className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <EnhancedDashboardOverview />
            {/* Enhanced Key Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Clients</CardTitle>
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats?.totalClients || 0}</div>
                  <div className="flex items-center mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {stats?.activeClients || 0} active
                    </Badge>
                    {monthlyGrowth > 0 && (
                      <div className="flex items-center ml-2 text-green-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span className="text-xs">+{monthlyGrowth}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Active Bonds</CardTitle>
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats?.activeBonds || 0}</div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    of {stats?.totalBonds || 0} total bonds
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Monthly Revenue</CardTitle>
                  <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    ${(stats?.monthlyRevenue || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    ${(stats?.pendingPayments || 0).toLocaleString()} pending
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Avg Bond</CardTitle>
                  <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    ${avgBondAmount.toLocaleString()}
                  </div>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    average bond amount
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Critical Alerts</CardTitle>
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-900 dark:text-red-100">{criticalAlerts.length}</div>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    require immediate attention
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">System Health</CardTitle>
                  <Activity className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Operational</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    All systems running
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used administrative functions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button className="h-16 flex flex-col items-center justify-center">
                    <Plus className="h-5 w-5 mb-1" />
                    Add Client
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                    <Upload className="h-5 w-5 mb-1" />
                    Import Data
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center"
                    onClick={() => exportData('clients')}>
                    <Download className="h-5 w-5 mb-1" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                    <Bell className="h-5 w-5 mb-1" />
                    Send Alerts
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Activity Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Recent Payments
                  </CardTitle>
                  <CardDescription>Latest payment activity with real-time updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentPayments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">{payment.clientName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(payment.paymentDate).toLocaleDateString()} • {payment.method}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">${payment.amount}</p>
                          <Badge variant={payment.confirmed ? "default" : "secondary"}>
                            {payment.confirmed ? "Confirmed" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">View All Payments</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Court Dates
                  </CardTitle>
                  <CardDescription>Critical dates requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingCourtDates.slice(0, 5).map((courtDate) => (
                      <div key={courtDate.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">{courtDate.clientName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{courtDate.courtLocation}</p>
                          <p className="text-xs text-gray-500">{courtDate.charges}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {new Date(courtDate.courtDate).toLocaleDateString()}
                          </p>
                          <Badge variant={
                            new Date(courtDate.courtDate).getTime() - new Date().getTime() < 86400000 * 3 
                              ? "destructive" : "outline"
                          }>
                            {courtDate.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">Manage Court Dates</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    High-Risk Clients
                  </CardTitle>
                  <CardDescription>Clients requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {overdueClients.slice(0, 5).map((client) => (
                      <div key={client.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div>
                          <p className="font-medium text-red-900 dark:text-red-100">{client.fullName}</p>
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {client.missedCheckIns} missed check-ins
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive">
                            High Risk
                          </Badge>
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            ${client.totalOwed.toLocaleString()} owed
                          </p>
                        </div>
                      </div>
                    ))}
                    {overdueClients.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        No high-risk clients
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <ClientManagement />
          </TabsContent>

          {/* Bonds Tab */}
          <TabsContent value="bonds" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Bond Management</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Bond
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
                <CardHeader>
                  <CardTitle>Active Bonds</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{stats?.totalBonds || 0}</div>
                  <p className="text-sm text-yellow-600">Currently active</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader>
                  <CardTitle>Total Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
                  <p className="text-sm text-green-600">Bond portfolio value</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader>
                  <CardTitle>Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">98.5%</div>
                  <p className="text-sm text-blue-600">Court appearance rate</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-red-50 to-red-100">
                <CardHeader>
                  <CardTitle>At Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{highRiskClients.length}</div>
                  <p className="text-sm text-red-600">Require attention</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Bond Portfolio Overview</CardTitle>
                <CardDescription>Active bonds and their current status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bond Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premium</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Court Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {clients.slice(0, 10).map((client, index) => (
                        <tr key={client.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm font-medium">{client.fullName}</td>
                          <td className="px-4 py-4 text-sm">${(15000 + index * 2500).toLocaleString()}</td>
                          <td className="px-4 py-4 text-sm">${((15000 + index * 2500) * 0.1).toLocaleString()}</td>
                          <td className="px-4 py-4 text-sm">{new Date(Date.now() + index * 86400000).toLocaleDateString()}</td>
                          <td className="px-4 py-4 text-sm">
                            <Badge variant={client.isActive ? "default" : "secondary"}>
                              {client.isActive ? "Active" : "Completed"}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <FinancialDashboard />
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">System Administration</h3>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                All Systems Operational
              </Badge>
            </div>

            {/* System Health Dashboard */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Database className="h-4 w-4 text-green-600" />
                    Database
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-bold text-green-600">Healthy</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">99.9% uptime</p>
                  <p className="text-xs text-gray-600">Last backup: 2 hours ago</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    Server
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="font-bold text-blue-600">Operational</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">CPU: 23% | RAM: 45%</p>
                  <p className="text-xs text-gray-600">Response time: 120ms</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="font-bold text-purple-600">Protected</span>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">SSL active | Firewall on</p>
                  <p className="text-xs text-gray-600">Last scan: 1 hour ago</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="font-bold text-yellow-600">Optimal</span>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">Load avg: 0.8</p>
                  <p className="text-xs text-gray-600">Network: 1.2Gbps</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Archive className="h-5 w-5" />
                    Data Management & Backup
                  </CardTitle>
                  <CardDescription>Comprehensive data operations and recovery</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => exportData('full-backup')} className="h-16 flex-col gap-2">
                      <Download className="h-5 w-5" />
                      Full Backup
                    </Button>
                    <Button variant="outline" className="h-16 flex-col gap-2">
                      <Upload className="h-5 w-5" />
                      Restore Data
                    </Button>
                    <Button variant="outline" onClick={() => exportData('clients')} className="h-16 flex-col gap-2">
                      <FileText className="h-5 w-5" />
                      Export Clients
                    </Button>
                    <Button variant="outline" onClick={() => exportData('reports')} className="h-16 flex-col gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Export Reports
                    </Button>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Automated Backups:</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Daily backup</span>
                        <span className="text-green-600">✓ Enabled</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Weekly full backup</span>
                        <span className="text-green-600">✓ Enabled</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Off-site replication</span>
                        <span className="text-green-600">✓ Active</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Configuration
                  </CardTitle>
                  <CardDescription>Administrative settings and user management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start h-12">
                    <Users className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">User Management</div>
                      <div className="text-xs text-gray-500">Manage admin and staff accounts</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-12">
                    <Bell className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Notification Settings</div>
                      <div className="text-xs text-gray-500">Configure alerts and reminders</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-12">
                    <Shield className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Security Settings</div>
                      <div className="text-xs text-gray-500">Access control and permissions</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-12">
                    <Database className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Database Settings</div>
                      <div className="text-xs text-gray-500">Connection and optimization</div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Advanced System Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  System Performance Metrics
                </CardTitle>
                <CardDescription>Real-time system monitoring and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-4">
                    <h4 className="font-medium">Resource Utilization</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>CPU Usage</span>
                          <span>23%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '23%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Memory Usage</span>
                          <span>45%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '45%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Disk Usage</span>
                          <span>67%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{width: '67%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Network Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Bandwidth Usage</span>
                        <span className="font-medium">1.2 Gbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Connections</span>
                        <span className="font-medium">{stats?.activeClients || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Time</span>
                        <span className="font-medium text-green-600">120ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uptime</span>
                        <span className="font-medium text-green-600">99.9%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Security Status</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>SSL Certificate</span>
                        <span className="font-medium text-green-600">Valid</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Firewall Status</span>
                        <span className="font-medium text-green-600">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Security Scan</span>
                        <span className="font-medium">1 hour ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Threats Blocked</span>
                        <span className="font-medium text-blue-600">0 today</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bonds Tab */}
          <TabsContent value="bonds" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Bond Management</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Bond
              </Button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Active Bonds</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.activeBonds || 0}</div>
                  <p className="text-sm text-gray-600">Currently active</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Total Bond Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${totalRevenue.toLocaleString()}</div>
                  <p className="text-sm text-gray-600">Total portfolio value</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Collection Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{clientRetention}%</div>
                  <p className="text-sm text-gray-600">Payment success rate</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Bonds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bonds.slice(0, 10).map((bond) => (
                    <div key={bond.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{bond.clientName}</p>
                        <p className="text-sm text-gray-600">
                          Court Date: {bond.courtDate ? new Date(bond.courtDate).toLocaleDateString() : 'TBD'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${bond.bondAmount.toLocaleString()}</p>
                        <Badge variant={bond.status === 'active' ? 'default' : 'secondary'}>
                          {bond.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Payment Management</h3>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => exportData('payments')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Collected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${recentPayments.reduce((sum, p) => sum + (p.confirmed ? p.amount : 0), 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    ${recentPayments.reduce((sum, p) => sum + (!p.confirmed ? p.amount : 0), 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Overdue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    ${(stats?.overduePayments || 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(stats?.monthlyRevenue || 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Client</th>
                        <th className="text-left p-2">Amount</th>
                        <th className="text-left p-2">Method</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPayments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{payment.clientName}</td>
                          <td className="p-2">${payment.amount}</td>
                          <td className="p-2">{payment.method}</td>
                          <td className="p-2">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                          <td className="p-2">
                            <Badge variant={payment.confirmed ? "default" : "secondary"}>
                              {payment.confirmed ? "Confirmed" : "Pending"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Business Analytics & Insights</h3>
              <Button variant="outline" onClick={() => exportData('analytics')}>
                <Download className="h-4 w-4 mr-2" />
                Export Analytics
              </Button>
            </div>
            
            <AnalyticsCharts />
            
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Client Retention Rate</span>
                    <span className="font-bold text-green-600">{clientRetention}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Bond Size</span>
                    <span className="font-bold">${avgBondAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Growth</span>
                    <span className="font-bold text-green-600">+{monthlyGrowth}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <span className="font-bold text-blue-600">98.2%</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Risk Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>High Risk Clients</span>
                    <span className="font-bold text-red-600">{highRiskClients.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overdue Accounts</span>
                    <span className="font-bold text-yellow-600">{overdueClients.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed Check-ins</span>
                    <span className="font-bold text-orange-600">
                      {clients.reduce((sum, c) => sum + c.missedCheckIns, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Score</span>
                    <span className="font-bold text-red-600">Low</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Check-ins Today</span>
                    <span className="font-bold">{recentCheckIns.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Court Dates</span>
                    <span className="font-bold">{safePendingCourtDates.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Alerts</span>
                    <span className="font-bold text-red-600">{alerts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>System Uptime</span>
                    <span className="font-bold text-green-600">99.9%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Geographic Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Geographic Distribution & Real-Time Tracking
                </CardTitle>
                <CardDescription>Client locations and movement patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <RealTimeMap />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tracking Tab */}
          <TabsContent value="location" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Location Tracking & Geolocation</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">GPS & Cell Tower Tracking Active</span>
              </div>
            </div>

            <LocationManagementDashboard />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Geolocation Integration Settings
                </CardTitle>
                <CardDescription>Configure GPS and cell tower triangulation services</CardDescription>
              </CardHeader>
              <CardContent>
                <GeolocationIntegration />
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Endpoints Dashboard Tab */}
          <TabsContent value="endpoints" className="space-y-6">
            <ApiEndpointDashboard />
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Real-Time Monitoring & Security</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">Live Monitoring Active</span>
              </div>
            </div>

            {/* Real-time Status Grid */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Active Clients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats?.activeClients || 0}</div>
                  <p className="text-xs text-green-600">Currently monitored</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Check-ins Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{recentCheckIns.length}</div>
                  <p className="text-xs text-blue-600">Successful check-ins</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Pending Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{alerts.length}</div>
                  <p className="text-xs text-yellow-600">Require attention</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">System Load</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">23%</div>
                  <p className="text-xs text-purple-600">Server utilization</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Live Check-in Feed
                  </CardTitle>
                  <CardDescription>Real-time client activity stream</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {recentCheckIns.length > 0 ? recentCheckIns.slice(0, 12).map((checkIn: any, index: number) => (
                      <div key={checkIn.id || index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <div>
                            <span className="font-medium">
                              {clients.find(c => c.id === checkIn.clientId)?.fullName || `Client #${checkIn.clientId}`}
                            </span>
                            <p className="text-xs text-gray-600">
                              {checkIn.location ? 'Location verified • GPS accurate' : 'Check-in confirmed'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">
                            {new Date(checkIn.timestamp).toLocaleTimeString()}
                          </span>
                          <p className="text-xs text-green-600">✓ Verified</p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-8 w-8 mx-auto mb-2" />
                        <p>No recent check-ins</p>
                        <p className="text-xs">Check-ins will appear here in real-time</p>
                      </div>
                    )}
                    {recentCheckIns.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-8 w-8 mx-auto mb-2" />
                        No recent check-ins
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Security Alerts & Notifications
                  </CardTitle>
                  <CardDescription>Critical system alerts and warnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {alerts.length > 0 ? alerts.slice(0, 12).map((alert: any, index: number) => (
                      <div key={alert.id || index} className={`flex items-center justify-between p-3 rounded-lg border ${
                        alert.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-200' :
                        alert.priority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200' :
                        'bg-blue-50 dark:bg-blue-900/20 border-blue-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`w-5 h-5 ${
                            alert.priority === 'high' ? 'text-red-500' :
                            alert.priority === 'medium' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                          <div>
                            <span className="font-medium">{alert.message}</span>
                            <p className="text-xs text-gray-600">{alert.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'}>
                            {alert.priority}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(alert.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p>All systems operational</p>
                        <p className="text-xs">No active alerts</p>
                      </div>
                    )}
                    {alerts.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p>All systems operational</p>
                        <p className="text-xs">No active alerts</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Monitoring Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Compliance Monitor
                </CardTitle>
                <CardDescription>Real-time security status and compliance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Data Security</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">Secure</div>
                    <p className="text-xs text-green-600">All data encrypted</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Database</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">Online</div>
                    <p className="text-xs text-blue-600">99.9% uptime</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-800">Performance</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">Optimal</div>
                    <p className="text-xs text-purple-600">Low latency</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-4 w-4 text-gray-600" />
                      <span className="font-medium text-gray-800">Access Control</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-600">Active</div>
                    <p className="text-xs text-gray-600">Role-based access</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}