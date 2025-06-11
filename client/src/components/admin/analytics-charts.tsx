import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Client, Payment, Expense } from "@shared/schema";

export default function AnalyticsCharts() {
  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics/overview'],
  });

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ['/api/payments'],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ['/api/expenses'],
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ['/api/check-ins'],
  });

  // Calculate real client status distribution
  const getClientStatusData = () => {
    if (!clients.length) return [];
    
    const statusCounts = {
      active: clients.filter(c => c.isActive && (c.missedCheckIns || 0) === 0).length,
      warning: clients.filter(c => c.isActive && (c.missedCheckIns || 0) > 0 && (c.missedCheckIns || 0) <= 2).length,
      highrisk: clients.filter(c => c.isActive && (c.missedCheckIns || 0) > 2).length,
      inactive: clients.filter(c => !c.isActive).length,
    };

    return [
      { name: 'Active', value: statusCounts.active, color: '#10b981' },
      { name: 'Warning', value: statusCounts.warning, color: '#f59e0b' },
      { name: 'High Risk', value: statusCounts.highrisk, color: '#ef4444' },
      { name: 'Inactive', value: statusCounts.inactive, color: '#6b7280' },
    ].filter(item => item.value > 0);
  };

  // Calculate payment method distribution from real data
  const getPaymentMethodData = () => {
    if (!payments.length) return [];
    
    const methodCounts = payments.reduce((acc, payment) => {
      const method = payment.paymentMethod || 'Other';
      if (!acc[method]) {
        acc[method] = { count: 0, amount: 0 };
      }
      acc[method].count += 1;
      acc[method].amount += parseFloat(payment.amount) || 0;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    return Object.entries(methodCounts).map(([method, data]) => ({
      method,
      amount: data.amount,
      count: data.count,
    }));
  };

  // Calculate monthly revenue trend from real data
  const getRevenueData = () => {
    if (!payments.length && !expenses.length) return [];
    
    const monthlyData: Record<string, { month: string; revenue: number; expenses: number }> = {};
    const currentDate = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const key = date.toLocaleDateString('en-US', { month: 'short' });
      monthlyData[key] = { month: key, revenue: 0, expenses: 0 };
    }

    // Add payment data
    payments.forEach((payment: Payment) => {
      if (payment.confirmed && payment.createdAt) {
        const date = new Date(payment.createdAt);
        const key = date.toLocaleDateString('en-US', { month: 'short' });
        if (monthlyData[key]) {
          monthlyData[key].revenue += parseFloat(payment.amount) || 0;
        }
      }
    });

    // Add expense data
    expenses.forEach((expense: Expense) => {
      if (expense.createdAt) {
        const date = new Date(expense.createdAt);
        const key = date.toLocaleDateString('en-US', { month: 'short' });
        if (monthlyData[key]) {
          monthlyData[key].expenses += parseFloat(expense.amount) || 0;
        }
      }
    });

    return Object.values(monthlyData);
  };

  // Calculate daily check-in data from real check-in records
  const getCheckInData = () => {
    if (!checkIns.length) return [];

    const weekData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      day,
      checkIns: 0
    }));

    // Count check-ins for the past 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    (checkIns as any[]).forEach((checkIn: any) => {
      const checkInDate = new Date(checkIn.createdAt);
      if (checkInDate >= sevenDaysAgo && checkInDate <= now) {
        const dayIndex = checkInDate.getDay();
        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex];
        const dayData = weekData.find(d => d.day === dayName);
        if (dayData) dayData.checkIns++;
      }
    });

    return weekData;
  };

  const clientStatusData = getClientStatusData();
  const paymentMethodData = getPaymentMethodData();
  const revenueData = getRevenueData();
  const checkInData = getCheckInData();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="checkins">Check-ins</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Revenue vs Expenses
                </CardTitle>
                <CardDescription>Monthly comparison over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
                <CardDescription>Revenue growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">
                      ${(analytics as any)?.totalRevenue?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">
                    {payments.filter(p => p.confirmed).length} confirmed payments
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                    <p className="text-2xl font-bold">
                      ${(analytics as any)?.netProfit?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">
                    Revenue minus expenses
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                    <p className="text-2xl font-bold">
                      {clients.filter(c => c.isActive).length}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600">
                    {clients.length} total clients
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Client Status Distribution</CardTitle>
                <CardDescription>Current status breakdown of all clients</CardDescription>
              </CardHeader>
              <CardContent>
                {clientStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={clientStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {clientStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No client data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Statistics</CardTitle>
                <CardDescription>Key metrics and trends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Active Clients</span>
                    </div>
                    <Badge variant="secondary">{clients.filter(c => c.isActive).length}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="font-medium">Warning Status</span>
                    </div>
                    <Badge variant="outline">{clients.filter(c => c.isActive && (c.missedCheckIns || 0) > 0 && (c.missedCheckIns || 0) <= 2).length}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-medium">High Risk</span>
                    </div>
                    <Badge variant="destructive">{clients.filter(c => c.isActive && (c.missedCheckIns || 0) > 2).length}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="font-medium">Inactive</span>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">{clients.filter(c => !c.isActive).length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="checkins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Check-in Activity</CardTitle>
              <CardDescription>Check-in compliance over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={checkInData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="checkIns" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods Analysis</CardTitle>
              <CardDescription>Breakdown by payment method and volume</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentMethodData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={paymentMethodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="method" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                    <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No payment data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}