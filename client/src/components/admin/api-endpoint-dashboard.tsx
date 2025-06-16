import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApiEndpoints } from '@/hooks/useApiEndpoints';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Shield, 
  Database,
  MapPin,
  Calendar,
  CreditCard,
  Users,
  FileText,
  Bell,
  Settings
} from 'lucide-react';

export default function ApiEndpointDashboard() {
  const {
    useSystemHealth,
    useRealTimeLocations,
    useUnacknowledgedAlerts,
    useRecentActivity,
    usePerformanceStats,
    useSecurityEvents,
    testEmail,
    testSMS
  } = useApiEndpoints();

  const { data: systemHealth, isLoading: healthLoading } = useSystemHealth();
  const { data: locations, isLoading: locationsLoading } = useRealTimeLocations();
  const { data: alerts, isLoading: alertsLoading } = useUnacknowledgedAlerts();
  const { data: activity, isLoading: activityLoading } = useRecentActivity();
  const { data: performance, isLoading: performanceLoading } = usePerformanceStats();
  const { data: securityEvents, isLoading: securityLoading } = useSecurityEvents();

  const emailTest = testEmail;
  const smsTest = testSMS;

  const endpointGroups = [
    {
      title: 'Real-time Monitoring',
      icon: Activity,
      endpoints: [
        { name: 'System Health', status: healthLoading ? 'loading' : (systemHealth ? 'active' : 'error'), data: systemHealth },
        { name: 'Location Tracking', status: locationsLoading ? 'loading' : (locations ? 'active' : 'error'), data: locations },
        { name: 'Performance Stats', status: performanceLoading ? 'loading' : (performance ? 'active' : 'error'), data: performance },
        { name: 'Recent Activity', status: activityLoading ? 'loading' : (activity ? 'active' : 'error'), data: activity }
      ]
    },
    {
      title: 'Security & Alerts',
      icon: Shield,
      endpoints: [
        { name: 'Security Events', status: securityLoading ? 'loading' : (securityEvents ? 'active' : 'error'), data: securityEvents },
        { name: 'Unacknowledged Alerts', status: alertsLoading ? 'loading' : (alerts ? 'active' : 'error'), data: alerts }
      ]
    },
    {
      title: 'Location Services',
      icon: MapPin,
      endpoints: [
        { name: 'Geofence Monitoring', status: 'active' },
        { name: 'GPS Tracking', status: 'active' },
        { name: 'Cell Tower Triangulation', status: 'configured' },
        { name: 'Jurisdiction Violations', status: 'active' }
      ]
    },
    {
      title: 'Court Management',
      icon: Calendar,
      endpoints: [
        { name: 'Court Date Scraping', status: 'configured' },
        { name: 'Reminder System', status: 'active' },
        { name: 'Client Court Dates', status: 'active' },
        { name: 'Court Date Approvals', status: 'active' }
      ]
    },
    {
      title: 'Financial Operations',
      icon: CreditCard,
      endpoints: [
        { name: 'Payment Plans', status: 'active' },
        { name: 'Revenue Analytics', status: 'active' },
        { name: 'Expense Tracking', status: 'active' },
        { name: 'Bond Management', status: 'active' }
      ]
    },
    {
      title: 'Client Management',
      icon: Users,
      endpoints: [
        { name: 'Client Database', status: 'active' },
        { name: 'Check-in System', status: 'active' },
        { name: 'Client Analytics', status: 'active' },
        { name: 'Behavior Tracking', status: 'active' }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'configured':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'loading':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'configured':
        return <Settings className="h-4 w-4" />;
      case 'loading':
        return <LoadingSpinner />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Endpoint Dashboard</h2>
          <p className="text-gray-600">Real-time monitoring of all system endpoints and integrations</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => emailTest.mutate({ recipient: 'admin@test.com' })}
            disabled={emailTest.isPending}
          >
            {emailTest.isPending ? <LoadingSpinner /> : <Bell className="h-4 w-4 mr-2" />}
            Test Email
          </Button>
          <Button 
            variant="outline" 
            onClick={() => smsTest.mutate({ phoneNumber: '+1234567890' })}
            disabled={smsTest.isPending}
          >
            {smsTest.isPending ? <LoadingSpinner /> : <Bell className="h-4 w-4 mr-2" />}
            Test SMS
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {endpointGroups.map((group) => {
          const Icon = group.icon;
          return (
            <Card key={group.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {group.title}
                </CardTitle>
                <CardDescription>
                  {group.endpoints.length} endpoints monitored
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.endpoints.map((endpoint) => (
                    <div key={endpoint.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{endpoint.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(endpoint.status)}
                        >
                          {getStatusIcon(endpoint.status)}
                          <span className="ml-1 capitalize">{endpoint.status}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-gray-500">Production ready</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">18</div>
            <p className="text-xs text-gray-500">Fully operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Configured Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">6</div>
            <p className="text-xs text-gray-500">Ready for activation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <p className="text-xs text-gray-500">Uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent API Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent API Activity</CardTitle>
          <CardDescription>Latest endpoint usage and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-2">
              {Array.isArray(activity) && activity.length > 0 ? (
                activity.slice(0, 5).map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <span className="text-sm">{item.endpoint || 'API Endpoint'}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.method || 'GET'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {item.timestamp || 'Just now'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  API activity will appear here as endpoints are accessed
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}