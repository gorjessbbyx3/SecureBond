import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function AnalyticsCharts() {
  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics/overview'],
  });

  const { data: payments } = useQuery({
    queryKey: ['/api/payments'],
  });

  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });

  // Revenue trend data
  const revenueData = [
    { month: 'Jan', revenue: 45000, expenses: 12000 },
    { month: 'Feb', revenue: 52000, expenses: 15000 },
    { month: 'Mar', revenue: 48000, expenses: 13000 },
    { month: 'Apr', revenue: 61000, expenses: 16000 },
    { month: 'May', revenue: 55000, expenses: 14000 },
    { month: 'Jun', revenue: 67000, expenses: 18000 },
  ];

  // Client status distribution
  const clientStatusData = [
    { name: 'Active', value: 24, color: '#10b981' },
    { name: 'Inactive', value: 6, color: '#6b7280' },
    { name: 'Overdue', value: 3, color: '#f59e0b' },
    { name: 'Missing', value: 1, color: '#ef4444' },
  ];

  // Daily check-ins
  const checkInData = [
    { day: 'Mon', checkIns: 18 },
    { day: 'Tue', checkIns: 22 },
    { day: 'Wed', checkIns: 19 },
    { day: 'Thu', checkIns: 25 },
    { day: 'Fri', checkIns: 21 },
    { day: 'Sat', checkIns: 16 },
    { day: 'Sun', checkIns: 14 },
  ];

  // Payment methods
  const paymentMethodData = [
    { method: 'Bank Transfer', amount: 125000, count: 45 },
    { method: 'Cash', amount: 89000, count: 67 },
    { method: 'Credit Card', amount: 156000, count: 123 },
    { method: 'Check', amount: 43000, count: 28 },
  ];

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
                    <p className="text-2xl font-bold">$328,000</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">+12.5% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                    <p className="text-2xl font-bold">$240,000</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">+8.2% profit margin</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Bond Amount</p>
                    <p className="text-2xl font-bold">$42,500</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    AVG
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">-3.1% from last month</span>
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
                <CardDescription>Current status of all clients</CardDescription>
              </CardHeader>
              <CardContent>
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
                    <Badge variant="secondary">24</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="font-medium">Overdue Check-ins</span>
                    </div>
                    <Badge variant="outline">3</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">New This Month</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">7</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-medium">High Risk</span>
                    </div>
                    <Badge variant="destructive">1</Badge>
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentMethodData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="method" type="category" width={100} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}