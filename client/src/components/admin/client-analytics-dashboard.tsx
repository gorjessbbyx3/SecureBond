import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter } from "recharts";
import { Users, AlertTriangle, TrendingUp, Calendar, MapPin, Clock, DollarSign, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Client, Payment, CheckIn } from "@shared/schema";
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns";

export default function ClientAnalyticsDashboard() {
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ['/api/payments'],
  });

  // Client Risk Analysis
  const getRiskAnalysis = () => {
    const riskLevels = clients.map(client => ({
      name: client.fullName,
      clientId: client.clientId,
      missedCheckIns: client.missedCheckIns || 0,
      riskScore: Math.min(100, (client.missedCheckIns || 0) * 25 + (!client.isActive ? 50 : 0)),
      status: client.isActive ? 'Active' : 'Inactive',
      payments: payments.filter(p => p.clientId === client.id).length,
    }));

    return riskLevels.sort((a, b) => b.riskScore - a.riskScore);
  };

  // Client Payment Behavior Analysis
  const getPaymentBehavior = () => {
    const clientPayments = clients.map(client => {
      const clientPaymentData = payments.filter(p => p.clientId === client.id);
      const totalAmount = clientPaymentData.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const confirmedPayments = clientPaymentData.filter(p => p.confirmed).length;
      const pendingPayments = clientPaymentData.filter(p => !p.confirmed).length;
      
      return {
        clientId: client.clientId,
        name: client.fullName,
        totalAmount,
        paymentCount: clientPaymentData.length,
        confirmedPayments,
        pendingPayments,
        averagePayment: clientPaymentData.length > 0 ? totalAmount / clientPaymentData.length : 0,
        paymentCompliance: clientPaymentData.length > 0 ? (confirmedPayments / clientPaymentData.length) * 100 : 0,
      };
    });

    return clientPayments.filter(c => c.paymentCount > 0).sort((a, b) => b.totalAmount - a.totalAmount);
  };

  // Monthly Client Growth
  const getClientGrowth = () => {
    const monthlyGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const newClients = clients.filter(client => {
        if (!client.createdAt) return false;
        const clientDate = new Date(client.createdAt);
        return clientDate >= monthStart && clientDate <= monthEnd;
      }).length;

      monthlyGrowth.push({
        month: format(date, 'MMM'),
        newClients,
        totalClients: clients.filter(client => {
          if (!client.createdAt) return false;
          return new Date(client.createdAt) <= monthEnd;
        }).length,
      });
    }
    return monthlyGrowth;
  };

  // Geographic Distribution (mock data since location tracking isn't fully implemented)
  const getGeographicData = () => {
    const locations = clients.reduce((acc, client) => {
      if (client.address) {
        const city = client.address.split(',')[1]?.trim() || 'Unknown';
        acc[city] = (acc[city] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(locations).map(([location, count]) => ({
      location,
      count,
      percentage: (count / clients.length) * 100,
    })).sort((a, b) => b.count - a.count).slice(0, 10);
  };

  const riskAnalysis = getRiskAnalysis();
  const paymentBehavior = getPaymentBehavior();
  const clientGrowth = getClientGrowth();
  const geographicData = getGeographicData();

  // Status distribution
  const statusDistribution = [
    { name: 'Active', value: clients.filter(c => c.isActive).length, color: '#10b981' },
    { name: 'Inactive', value: clients.filter(c => !c.isActive).length, color: '#6b7280' },
  ];

  const highRiskClients = clients.filter(c => (c.missedCheckIns || 0) > 2).length;
  const averageRiskScore = riskAnalysis.length > 0 ? riskAnalysis.reduce((sum, c) => sum + c.riskScore, 0) / riskAnalysis.length : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">
                {clients.filter(c => c.isActive).length} active
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold">{highRiskClients}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Activity className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">
                {((highRiskClients / clients.length) * 100).toFixed(1)}% of total
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Risk Score</p>
                <p className="text-2xl font-bold">{averageRiskScore.toFixed(0)}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <Progress value={averageRiskScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Clients</p>
                <p className="text-2xl font-bold">{paymentBehavior.length}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">
                {((paymentBehavior.length / clients.length) * 100).toFixed(1)}% active payers
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="risk" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="payments">Payment Behavior</TabsTrigger>
          <TabsTrigger value="growth">Client Growth</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Client Risk Scores</CardTitle>
                <CardDescription>Risk assessment based on missed check-ins and status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={riskAnalysis.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="clientId" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [value, 'Risk Score']}
                      labelFormatter={(label) => `Client: ${label}`}
                    />
                    <Bar dataKey="riskScore" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>Breakdown of client risk levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Low Risk (0-25)</span>
                    </div>
                    <Badge variant="secondary">
                      {riskAnalysis.filter(c => c.riskScore <= 25).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="font-medium">Medium Risk (26-50)</span>
                    </div>
                    <Badge variant="outline">
                      {riskAnalysis.filter(c => c.riskScore > 25 && c.riskScore <= 50).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="font-medium">High Risk (51-75)</span>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      {riskAnalysis.filter(c => c.riskScore > 50 && c.riskScore <= 75).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-medium">Critical Risk (76+)</span>
                    </div>
                    <Badge variant="destructive">
                      {riskAnalysis.filter(c => c.riskScore > 75).length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Performance</CardTitle>
                <CardDescription>Client payment amounts and compliance rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={paymentBehavior}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="totalAmount" name="Total Amount" />
                    <YAxis dataKey="paymentCompliance" name="Compliance %" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'totalAmount' ? `$${Number(value).toLocaleString()}` : `${Number(value).toFixed(1)}%`,
                        name === 'totalAmount' ? 'Total Amount' : 'Compliance Rate'
                      ]}
                      labelFormatter={(label) => `Client: ${paymentBehavior.find(c => c.totalAmount === label)?.name || 'Unknown'}`}
                    />
                    <Scatter dataKey="totalAmount" fill="#10b981" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Paying Clients</CardTitle>
                <CardDescription>Highest total payment amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentBehavior.slice(0, 8).map((client, index) => (
                    <div key={client.clientId} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">{client.clientId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${client.totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{client.paymentCount} payments</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Growth Trend</CardTitle>
              <CardDescription>New client acquisitions and total client count over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={clientGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="newClients" stroke="#3b82f6" strokeWidth={3} name="New Clients" />
                  <Line type="monotone" dataKey="totalClients" stroke="#10b981" strokeWidth={3} name="Total Clients" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Client Status</CardTitle>
                <CardDescription>Active vs inactive client distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusDistribution.map((entry, index) => (
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
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Client locations by city</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {geographicData.map((location, index) => (
                    <div key={location.location} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{location.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{location.count}</span>
                        <div className="w-16 h-2 bg-muted rounded-full">
                          <div 
                            className="h-2 bg-blue-600 rounded-full" 
                            style={{ width: `${location.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}