import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Server, Database, Activity, Settings, LogOut, AlertTriangle, CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function MaintenanceDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Mock system stats
  const systemStats = {
    serverStatus: "operational",
    databaseStatus: "operational",
    lastBackup: "2024-01-10T02:00:00Z",
    uptime: "99.9%",
    activeUsers: 15,
    storageUsed: "45%",
  };

  const getStatusBadge = (status: string) => {
    if (status === "operational") {
      return <Badge className="bg-green-100 text-green-800">Operational</Badge>;
    }
    return <Badge variant="destructive">Down</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Maintenance Portal" subtitle="System Administration" />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">System Maintenance</h1>
            <p className="text-slate-600">Monitor and maintain system operations</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="flex items-center">
            <LogOut className="mr-2 w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Server className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Server Status</p>
                  <div className="mt-1">
                    {getStatusBadge(systemStats.serverStatus)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Database Status</p>
                  <div className="mt-1">
                    {getStatusBadge(systemStats.databaseStatus)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">System Uptime</p>
                  <p className="text-2xl font-bold text-slate-900">{systemStats.uptime}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Active Users</p>
                  <p className="text-2xl font-bold text-slate-900">{systemStats.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
            <TabsTrigger value="backups">Backups</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 w-5 h-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Server Response Time</span>
                    <Badge className="bg-green-100 text-green-800">Good</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Storage Usage</span>
                    <span className="text-sm text-slate-600">{systemStats.storageUsed}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Maintenance */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Maintenance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Database backup completed</p>
                        <p className="text-xs text-slate-500">
                          {new Date(systemStats.lastBackup).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Security updates applied</p>
                        <p className="text-xs text-slate-500">January 8, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium">Scheduled maintenance</p>
                        <p className="text-xs text-slate-500">January 15, 2024 - 2:00 AM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                  <div>[2024-01-10 14:30:15] INFO: Client login successful - User: SB123456</div>
                  <div>[2024-01-10 14:29:42] INFO: Payment processed - Amount: $500.00</div>
                  <div>[2024-01-10 14:28:33] INFO: Database backup initiated</div>
                  <div>[2024-01-10 14:25:12] INFO: Check-in recorded - Client: SB789012</div>
                  <div>[2024-01-10 14:20:05] WARN: High memory usage detected - 85%</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backups">
            <Card>
              <CardHeader>
                <CardTitle>Database Backups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Daily Backup</p>
                      <p className="text-sm text-slate-500">
                        Last run: {new Date(systemStats.lastBackup).toLocaleString()}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Success</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Weekly Backup</p>
                      <p className="text-sm text-slate-500">Last run: January 7, 2024</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Success</Badge>
                  </div>
                  <Button className="w-full">
                    <Database className="mr-2 w-4 h-4" />
                    Create Manual Backup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 w-4 h-4" />
                    Configure Email Notifications
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="mr-2 w-4 h-4" />
                    Database Maintenance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="mr-2 w-4 h-4" />
                    Performance Monitoring
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
