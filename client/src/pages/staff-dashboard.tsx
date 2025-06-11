import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  LogOut, 
  Bell, 
  Settings, 
  Users, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin,
  Phone,
  Shield,
  Target,
  Activity,
  Eye,
  Search,
  RefreshCw
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function StaffDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [showSettings, setShowSettings] = useState(false);

  // Fetch operational data
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["/api/check-ins"],
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["/api/alerts/unacknowledged"],
  });

  const { data: courtDates = [] } = useQuery({
    queryKey: ["/api/court-dates"],
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      queryClient.clear();
      setLocation("/staff-login");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Calculate operational metrics
  const activeClients = clients.filter((client: any) => client.isActive).length;
  const criticalAlerts = alerts.filter((alert: any) => alert.severity === "critical").length;
  const upcomingCourtDates = courtDates.filter((date: any) => {
    const courtDate = new Date(date.courtDate);
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return courtDate >= now && courtDate <= threeDaysFromNow;
  }).length;

  const recentCheckIns = checkIns.slice(-10);
  const complianceRate = activeClients > 0 ? ((activeClients - criticalAlerts) / activeClients) * 100 : 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Operations Dashboard</h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Staff Portal
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </Header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeClients}</div>
              <p className="text-xs text-muted-foreground">Currently monitoring</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complianceRate.toFixed(1)}%</div>
              <Progress value={complianceRate} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{criticalAlerts}</div>
              <p className="text-xs text-muted-foreground">Requiring attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Court Dates</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{upcomingCourtDates}</div>
              <p className="text-xs text-muted-foreground">Next 3 days</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="monitoring">Client Monitoring</TabsTrigger>
            <TabsTrigger value="alerts">Alerts & Issues</TabsTrigger>
            <TabsTrigger value="reports">Daily Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Check-ins */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Recent Check-ins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentCheckIns.length > 0 ? (
                      recentCheckIns.map((checkIn: any, index: number) => (
                        <div key={checkIn.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">Client ID: {checkIn.clientId}</p>
                            <p className="text-sm text-gray-600">{checkIn.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">{new Date(checkIn.createdAt).toLocaleDateString()}</p>
                            <Badge className="bg-green-100 text-green-800">Completed</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No check-ins recorded</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>GPS Tracking</span>
                      <Badge className="bg-green-100 text-green-800">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Communication System</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Court Integration</span>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Alert System</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-4">
                  <Button className="h-16 flex-col gap-2" variant="outline">
                    <Phone className="h-6 w-6" />
                    Contact Client
                  </Button>
                  <Button className="h-16 flex-col gap-2" variant="outline">
                    <Eye className="h-6 w-6" />
                    View Location
                  </Button>
                  <Button className="h-16 flex-col gap-2" variant="outline">
                    <Calendar className="h-6 w-6" />
                    Schedule Check-in
                  </Button>
                  <Button className="h-16 flex-col gap-2" variant="outline">
                    <RefreshCw className="h-6 w-6" />
                    Refresh Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Compliance Monitoring</CardTitle>
                <CardDescription>Track client adherence to bail conditions and requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-700">{complianceRate.toFixed(1)}%</div>
                      <p className="text-sm text-green-600">Overall Compliance</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-700">{checkIns.length}</div>
                      <p className="text-sm text-blue-600">Total Check-ins Today</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded">
                      <div className="text-2xl font-bold text-orange-700">{alerts.length}</div>
                      <p className="text-sm text-orange-600">Active Issues</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Client Monitoring</CardTitle>
                <CardDescription>Current status and location tracking for all active clients</CardDescription>
              </CardHeader>
              <CardContent>
                {clients.length > 0 ? (
                  <div className="space-y-4">
                    {clients.map((client: any) => (
                      <div key={client.id} className="flex items-center justify-between p-4 border rounded">
                        <div>
                          <h4 className="font-medium">{client.fullName}</h4>
                          <p className="text-sm text-gray-600">ID: {client.clientId}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={client.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {client.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <MapPin className="h-4 w-4 mr-1" />
                            Track
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No clients currently active</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Alerts & Issues</CardTitle>
                <CardDescription>Critical alerts requiring immediate staff attention</CardDescription>
              </CardHeader>
              <CardContent>
                {alerts.length > 0 ? (
                  <div className="space-y-4">
                    {alerts.map((alert: any) => (
                      <div key={alert.id} className="flex items-center justify-between p-4 border-l-4 border-red-500 bg-red-50">
                        <div>
                          <h4 className="font-medium text-red-800">{alert.alertType}</h4>
                          <p className="text-sm text-red-600">{alert.message}</p>
                          <p className="text-xs text-gray-500">{new Date(alert.createdAt).toLocaleString()}</p>
                        </div>
                        <Badge className="bg-red-100 text-red-800">{alert.severity}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No active alerts</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Operations Report</CardTitle>
                <CardDescription>Summary of today's operational activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-3">Check-in Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Completed Check-ins:</span>
                        <span className="font-medium">{checkIns.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Missed Check-ins:</span>
                        <span className="font-medium text-red-600">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Compliance Rate:</span>
                        <span className="font-medium text-green-600">{complianceRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Alert Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Critical Alerts:</span>
                        <span className="font-medium text-red-600">{criticalAlerts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Resolved Issues:</span>
                        <span className="font-medium text-green-600">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending Actions:</span>
                        <span className="font-medium text-orange-600">{alerts.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Staff Settings</DialogTitle>
            <DialogDescription>
              Configure your staff portal preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p>Staff settings configuration interface would be displayed here.</p>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}