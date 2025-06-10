import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function PerformanceMetrics() {
  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: payments } = useQuery({
    queryKey: ["/api/payments"],
  });

  const { data: checkIns } = useQuery({
    queryKey: ["/api/checkins"],
  });

  const { data: courtDates } = useQuery({
    queryKey: ["/api/court-dates"],
  });

  const calculateKPIs = () => {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    // Current month data
    const activeClients = (clients as any[])?.filter(c => c.status === 'active').length || 0;
    const totalClients = (clients as any[])?.length || 0;
    const retentionRate = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;

    // Previous month comparison for retention
    const prevMonthClients = (clients as any[])?.filter(c => 
      new Date(c.createdAt || c.signupDate) < currentMonth
    ).length || 0;
    const retentionTrend = prevMonthClients > 0 ? 
      ((totalClients - prevMonthClients) / prevMonthClients) * 100 : 0;

    // Payment collection rate - current vs previous month
    const currentMonthPayments = (payments as any[])?.filter(p => 
      new Date(p.paymentDate) >= currentMonth
    ) || [];
    const prevMonthPayments = (payments as any[])?.filter(p => 
      new Date(p.paymentDate) >= previousMonth && new Date(p.paymentDate) < lastMonth
    ) || [];

    const currentConfirmed = currentMonthPayments.filter(p => p.status === 'confirmed').length;
    const prevConfirmed = prevMonthPayments.filter(p => p.status === 'confirmed').length;
    
    const collectionRate = currentMonthPayments.length > 0 ? 
      (currentConfirmed / currentMonthPayments.length) * 100 : 0;
    const prevCollectionRate = prevMonthPayments.length > 0 ? 
      (prevConfirmed / prevMonthPayments.length) * 100 : 0;
    const collectionTrend = prevCollectionRate > 0 ? 
      ((collectionRate - prevCollectionRate) / prevCollectionRate) * 100 : 0;

    // Check-in compliance rate with trend
    const currentCheckIns = (checkIns as any[])?.filter(ci => 
      new Date(ci.checkInTime) >= currentMonth
    ) || [];
    const prevCheckIns = (checkIns as any[])?.filter(ci => 
      new Date(ci.checkInTime) >= previousMonth && new Date(ci.checkInTime) < lastMonth
    ) || [];
    
    const currentOnTime = currentCheckIns.filter(ci => {
      const scheduled = new Date(ci.scheduledTime || ci.checkInTime);
      const actual = new Date(ci.checkInTime);
      return (actual.getTime() - scheduled.getTime()) <= (15 * 60 * 1000);
    }).length;

    const prevOnTime = prevCheckIns.filter(ci => {
      const scheduled = new Date(ci.scheduledTime || ci.checkInTime);
      const actual = new Date(ci.checkInTime);
      return (actual.getTime() - scheduled.getTime()) <= (15 * 60 * 1000);
    }).length;

    const complianceRate = currentCheckIns.length > 0 ? 
      (currentOnTime / currentCheckIns.length) * 100 : 0;
    const prevComplianceRate = prevCheckIns.length > 0 ? 
      (prevOnTime / prevCheckIns.length) * 100 : 0;
    const complianceTrend = prevComplianceRate > 0 ? 
      ((complianceRate - prevComplianceRate) / prevComplianceRate) * 100 : 0;

    // Court appearance rate with trend
    const currentCourtDates = (courtDates as any[])?.filter(cd => 
      new Date(cd.courtDate) >= currentMonth && new Date(cd.courtDate) < now
    ) || [];
    const prevCourtDates = (courtDates as any[])?.filter(cd => 
      new Date(cd.courtDate) >= previousMonth && new Date(cd.courtDate) < lastMonth
    ) || [];
    
    const currentAppeared = currentCourtDates.filter(cd => cd.status === 'appeared').length;
    const prevAppeared = prevCourtDates.filter(cd => cd.status === 'appeared').length;
    
    const appearanceRate = currentCourtDates.length > 0 ? 
      (currentAppeared / currentCourtDates.length) * 100 : 0;
    const prevAppearanceRate = prevCourtDates.length > 0 ? 
      (prevAppeared / prevCourtDates.length) * 100 : 0;
    const appearanceTrend = prevAppearanceRate > 0 ? 
      ((appearanceRate - prevAppearanceRate) / prevAppearanceRate) * 100 : 0;

    // Monthly revenue with trend
    const monthlyRevenue = currentMonthPayments
      .filter(p => p.status === 'confirmed')
      .reduce((sum, p) => sum + p.amount, 0);
    const prevMonthRevenue = prevMonthPayments
      .filter(p => p.status === 'confirmed')
      .reduce((sum, p) => sum + p.amount, 0);
    const revenueTrend = prevMonthRevenue > 0 ? 
      ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;

    // Response time calculation from actual data
    const avgResponseTime = (alerts as any[])?.length > 0 ? 
      (alerts as any[]).reduce((total: number, alert: any) => {
        if (alert.acknowledgedAt && alert.createdAt) {
          const responseTime = (new Date(alert.acknowledgedAt).getTime() - new Date(alert.createdAt).getTime()) / (1000 * 60 * 60); // hours
          return total + responseTime;
        }
        return total;
      }, 0) / (alerts as any[]).filter((a: any) => a.acknowledgedAt).length || 0.5 : 0.5; // Default to 0.5 hours if no data

    return {
      retentionRate: Math.round(retentionRate),
      collectionRate: Math.round(collectionRate),
      complianceRate: Math.round(complianceRate),
      appearanceRate: Math.round(appearanceRate),
      monthlyRevenue,
      avgResponseTime,
      activeClients,
      totalClients,
      trends: {
        retention: retentionTrend,
        collection: collectionTrend,
        compliance: complianceTrend,
        appearance: appearanceTrend,
        revenue: revenueTrend
      }
    };
  };

  const kpis = calculateKPIs();

  const formatTrend = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const performanceData = [
    {
      title: "Client Retention",
      value: kpis.retentionRate,
      target: 95,
      unit: "%",
      icon: Users,
      trend: formatTrend(kpis.trends.retention),
      description: `${kpis.activeClients}/${kpis.totalClients} active clients`
    },
    {
      title: "Payment Collection",
      value: kpis.collectionRate,
      target: 90,
      unit: "%",
      icon: DollarSign,
      trend: formatTrend(kpis.trends.collection),
      description: "Monthly collection rate"
    },
    {
      title: "Check-in Compliance",
      value: kpis.complianceRate,
      target: 85,
      unit: "%",
      icon: CheckCircle,
      trend: formatTrend(kpis.trends.compliance),
      description: "On-time check-ins"
    },
    {
      title: "Court Appearance",
      value: kpis.appearanceRate,
      target: 98,
      unit: "%",
      icon: Calendar,
      trend: formatTrend(kpis.trends.appearance),
      description: "Successful appearances"
    }
  ];

  const getPerformanceColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* KPI Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {performanceData.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <div className={`text-2xl font-bold ${getPerformanceColor(metric.value, metric.target)}`}>
                  {metric.value}{metric.unit}
                </div>
                <div className="text-xs text-muted-foreground">
                  / {metric.target}{metric.unit}
                </div>
              </div>
              <div className="mt-2">
                <Progress 
                  value={Math.min((metric.value / metric.target) * 100, 100)} 
                  className="h-2"
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">{metric.description}</p>
                <Badge variant={metric.trend.startsWith('+') ? 'default' : 'destructive'}>
                  {metric.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-medium">Operational Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Average Response Time</p>
                    <p className="text-xs text-gray-500">Alert acknowledgment</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{kpis.avgResponseTime}h</p>
                    <Badge variant="default">Target: Under 3h</Badge>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Monthly Revenue</p>
                    <p className="text-xs text-gray-500">Current month</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${kpis.monthlyRevenue.toLocaleString()}</p>
                    <Badge variant={kpis.trends.revenue >= 0 ? "default" : "destructive"}>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {formatTrend(kpis.trends.revenue)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Risk Indicators</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">Compliance Below Target</p>
                      <p className="text-xs text-gray-500">Check-in rate needs improvement</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Monitor</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Strong Performance</p>
                      <p className="text-xs text-gray-500">Client retention exceeding targets</p>
                    </div>
                  </div>
                  <Badge variant="default">Good</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals and Targets */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { goal: "Increase check-in compliance to 90%", current: kpis.complianceRate, target: 90 },
              { goal: "Maintain 95%+ court appearance rate", current: kpis.appearanceRate, target: 95 },
              { goal: "Achieve 100% payment collection", current: kpis.collectionRate, target: 100 },
              { goal: "Reduce response time to under 2 hours", current: Math.round((3 - kpis.avgResponseTime) * 50), target: 100 }
            ].map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">{goal.goal}</p>
                  <span className="text-sm text-gray-500">
                    {goal.current}% {goal.current >= goal.target ? '✓' : ''}
                  </span>
                </div>
                <Progress value={Math.min(goal.current, 100)} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}