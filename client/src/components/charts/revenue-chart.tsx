import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function RevenueChart() {
  const { data: revenueData } = useQuery({
    queryKey: ["/api/analytics/revenue"],
  });

  const { data: payments } = useQuery({
    queryKey: ["/api/payments"],
  });

  // Calculate revenue metrics from real payment data
  const calculateMetrics = () => {
    if (!payments || !Array.isArray(payments)) {
      return {
        totalRevenue: 0,
        monthlyRevenue: 0,
        weeklyRevenue: 0,
        recentPayments: []
      };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    const monthlyPayments = payments.filter((payment: any) => 
      new Date(payment.paymentDate) >= startOfMonth && payment.status === 'confirmed'
    );

    const weeklyPayments = payments.filter((payment: any) => 
      new Date(payment.paymentDate) >= startOfWeek && payment.status === 'confirmed'
    );

    const totalRevenue = payments
      .filter((payment: any) => payment.status === 'confirmed')
      .reduce((sum: number, payment: any) => sum + payment.amount, 0);

    const monthlyRevenue = monthlyPayments
      .reduce((sum: number, payment: any) => sum + payment.amount, 0);

    const weeklyRevenue = weeklyPayments
      .reduce((sum: number, payment: any) => sum + payment.amount, 0);

    return {
      totalRevenue,
      monthlyRevenue,
      weeklyRevenue,
      recentPayments: payments
        .filter((payment: any) => payment.status === 'confirmed')
        .sort((a: any, b: any) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
        .slice(0, 5)
    };
  };

  const metrics = calculateMetrics();

  // Generate monthly revenue data for the last 6 months
  const generateMonthlyData = () => {
    if (!payments || !Array.isArray(payments)) return [];

    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthlyPayments = payments.filter((payment: any) => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate >= monthDate && paymentDate < nextMonth && payment.status === 'confirmed';
      });

      const monthRevenue = monthlyPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0);

      months.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue: monthRevenue,
        payments: monthlyPayments.length
      });
    }

    return months;
  };

  const monthlyData = generateMonthlyData();
  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue));

  return (
    <div className="space-y-6">
      {/* Revenue Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.weeklyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 text-sm font-medium">{month.month}</div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">${month.revenue.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{month.payments} payments</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.recentPayments.length > 0 ? (
              metrics.recentPayments.map((payment: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Bond Payment</p>
                    <p className="text-xs text-gray-500">
                      Client ID: {payment.clientId} • {new Date(payment.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">${payment.amount.toLocaleString()}</div>
                    <Badge variant="default" className="text-xs">
                      {payment.method}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 text-center py-4">
                No recent payments found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}