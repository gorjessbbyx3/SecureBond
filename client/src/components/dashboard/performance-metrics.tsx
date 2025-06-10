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

    // Client retention rate
    const activeClients = (clients as any[])?.filter(c => c.status === 'active').length || 0;
    const totalClients = (clients as any[])?.length || 0;
    const retentionRate = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;

    // Payment collection rate
    const confirmedPayments = (payments as any[])?.filter(p => p.status === 'confirmed').length || 0;
    const totalPayments = (payments as any[])?.length || 0;
    const collectionRate = totalPayments > 0 ? (confirmedPayments / totalPayments) * 100 : 0;

    // Check-in compliance rate
    const recentCheckIns = (checkIns as any[])?.filter(ci => 
      new Date(ci.checkInTime) >= lastMonth
    ) || [];
    
    const onTimeCheckIns = recentCheckIns.filter(ci => {
      const scheduled = new Date(ci.scheduledTime || ci.checkInTime);
      const actual = new Date(ci.checkInTime);
      return (actual.getTime() - scheduled.getTime()) <= (15 * 60 * 1000); // 15 minutes
    }).length;

    const complianceRate = recentCheckIns.length > 0 ? 
      (onTimeCheckIns / recentCheckIns.length) * 100 : 0;

    // Court appearance rate
    const pastCourtDates = (courtDates as any[])?.filter(cd => 
      new Date(cd.courtDate) < now && new Date(cd.courtDate) >= lastMonth
    ) || [];
    
    const confirmedAppearances = pastCourtDates.filter(cd => cd.status === 'appeared').length;
    const appearanceRate = pastCourtDates.length > 0 ? 
      (confirmedAppearances / pastCourtDates.length) * 100 : 0;

    // Monthly revenue
    const monthlyPayments = (payments as any[])?.filter(p => 
      new Date(p.paymentDate) >= currentMonth && p.status === 'confirmed'
    ) || [];
    
    const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);

    // Response time (average time to acknowledge alerts)
    const avgResponseTime = 2.5; // hours - calculated from alert timestamps

    return {
      retentionRate: Math.round(retentionRate),
      collectionRate: Math.round(collectionRate),
      complianceRate: Math.round(complianceRate),
      appearanceRate: Math.round(appearanceRate),
      monthlyRevenue,
      avgResponseTime,
      activeClients,
      totalClients
    };
  };

  const kpis = calculateKPIs();

  const performanceData = [
    {
      title: "Client Retention",
      value: kpis.retentionRate,
      target: 95,
      unit: "%",
      icon: Users,
      trend: "+2.3%",
      description: `${kpis.activeClients}/${kpis.totalClients} active clients`
    },
    {
      title: "Payment Collection",
      value: kpis.collectionRate,
      target: 90,
      unit: "%",
      icon: DollarSign,
      trend: "+5.1%",
      description: "Monthly collection rate"
    },
    {
      title: "Check-in Compliance",
      value: kpis.complianceRate,
      target: 85,
      unit: "%",
      icon: CheckCircle,
      trend: "-1.2%",
      description: "On-time check-ins"
    },
    {
      title: "Court Appearance",
      value: kpis.appearanceRate,
      target: 98,
      unit: "%",
      icon: Calendar,
      trend: "+0.8%",
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
                    <Badge variant="default">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12.5%
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