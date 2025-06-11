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
  const recentCheckIns = checkIns.slice(0, 10);

  // Calculate performance metrics
  const totalRevenue = stats?.totalRevenue || 0;
  const monthlyGrowth = analytics?.monthlyGrowth || 0;
  const clientRetention = analytics?.clientRetention || 0;
  const avgBondAmount = stats?.totalBonds > 0 ? totalRevenue / stats.totalBonds : 0;

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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Check-in
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount Owed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredClients.map((client) => (
                        <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {client.fullName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {client.clientId}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={client.isActive ? "default" : "secondary"}>
                              {client.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {client.missedCheckIns > 0 && (
                              <Badge variant="destructive" className="ml-1">
                                {client.missedCheckIns} missed
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client.lastCheckIn 
                              ? new Date(client.lastCheckIn).toLocaleDateString()
                              : "Never"
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            ${(client.totalOwed || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Mail className="h-4 w-4" />
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

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            {/* System Health placeholder - can be expanded */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Monitor system performance and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                    <div className="text-sm font-medium">Database</div>
                    <div className="text-xs text-gray-500">Healthy</div>
                  </div>
                  <div className="text-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                    <div className="text-sm font-medium">Server</div>
                    <div className="text-xs text-gray-500">Operational</div>
                  </div>
                  <div className="text-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                    <div className="text-sm font-medium">Security</div>
                    <div className="text-xs text-gray-500">Protected</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>Backup and export operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={() => exportData('full-backup')}>
                      <Download className="h-4 w-4 mr-2" />
                      Full Backup
                    </Button>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Restore Data
                    </Button>
                    <Button variant="outline" onClick={() => exportData('clients')}>
                      <FileText className="h-4 w-4 mr-2" />
                      Export Clients
                    </Button>
                    <Button variant="outline" onClick={() => exportData('reports')}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Export Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>Administrative settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      User Management
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      Notification Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Security Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      Database Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
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
            <h3 className="text-lg font-semibold">Business Analytics</h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded">
                    <p className="text-gray-500">Revenue chart placeholder</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Client Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded">
                    <p className="text-gray-500">Client distribution chart</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Client Retention Rate</span>
                    <span className="font-bold">{clientRetention}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Bond Size</span>
                    <span className="font-bold">${avgBondAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Growth</span>
                    <span className="font-bold text-green-600">+{monthlyGrowth}%</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Risk Analysis</CardTitle>
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
                    <span>Active Monitoring</span>
                    <span className="font-bold text-blue-600">{stats?.activeClients || 0}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Check-ins Today</span>
                    <span className="font-bold">{recentCheckIns.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Court Dates</span>
                    <span className="font-bold">{pendingCourtDates.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Alerts</span>
                    <span className="font-bold text-red-600">{alerts.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <h3 className="text-lg font-semibold">Real-Time Monitoring</h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Live Check-ins</CardTitle>
                  <CardDescription>Real-time client activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentCheckIns.slice(0, 8).map((checkIn: any, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="font-medium">Client #{checkIn.clientId}</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {new Date(checkIn.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Alerts</CardTitle>
                  <CardDescription>Active monitoring alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alerts.slice(0, 8).map((alert: any, index) => (
                      <div key={index} className={`flex items-center justify-between p-2 rounded ${
                        alert.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20' :
                        alert.priority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                        'bg-blue-50 dark:bg-blue-900/20'
                      }`}>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 ${
                            alert.priority === 'high' ? 'text-red-500' :
                            alert.priority === 'medium' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                          <span className="font-medium">{alert.message}</span>
                        </div>
                        <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'}>
                          {alert.priority}
                        </Badge>
                      </div>
                    ))}
                    {alerts.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        No active alerts
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}