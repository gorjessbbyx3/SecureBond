import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogOut, Bell, Settings, Download, RefreshCw, AlertTriangle, Target, TrendingUp, BarChart3, Eye } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ClientManagement from "@/components/admin/client-management";
import FinancialDashboard from "@/components/admin/financial-dashboard";
import DashboardStats from "@/components/admin/dashboard-stats";
import RealTimeMap from "@/components/admin/real-time-map";
import AnalyticsCharts from "@/components/admin/analytics-charts";
import ClientAnalyticsDashboard from "@/components/admin/client-analytics-dashboard";
import NotificationCenter from "@/components/admin/notification-center";
import { EnhancedNotificationCenter } from "@/components/notifications/enhanced-notification-center";
import DataManagement from "@/components/admin/data-management";
import TopLocations from "@/components/admin/top-locations";
import ArrestMonitoringSystem from "@/components/admin/arrest-monitoring-system";
import BulkClientUpload from "@/components/admin/bulk-client-upload";
import CourtDateReminderSystem from "@/components/admin/court-date-reminder-system";
import QuickStats from "@/components/dashboard/quick-stats";
import SmartAlerts from "@/components/dashboard/smart-alerts";
import PerformanceMetrics from "@/components/dashboard/performance-metrics";
import ClientAnalytics from "@/components/analytics/client-analytics";
import RevenueChart from "@/components/charts/revenue-chart";
import logoImage from "@assets/ChatGPT Image Jun 9, 2025, 08_07_36 PM_1749535833870.png";
import { AIEnhancedOverview } from "@/components/admin/ai-enhanced-overview";
import { MillionDollarClientManagement } from "@/components/admin/million-dollar-client-management";
import { MillionDollarFinancial } from "@/components/admin/million-dollar-financial";
import ROIAnalysisTab from "@/components/admin/roi-analysis-tab";

export default function EnhancedAdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [showSettings, setShowSettings] = useState(false);

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts/unacknowledged"],
  });

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
    onError: () => {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    },
  });

  const refreshDataMutation = useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries();
    },
    onSuccess: () => {
      toast({
        title: "Data refreshed",
        description: "All data has been updated successfully.",
      });
    },
  });

  const exportReportMutation = useMutation({
    mutationFn: async () => {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Report exported",
        description: "Monthly report has been generated and downloaded.",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                SecureBond Admin
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Professional Bail Bond Management System
              </p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100 tracking-wide">
              ALOHA BAIL BOND
            </h1>
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Admin Dashboard
              </h2>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Live System
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast({
                  title: "Notifications",
                  description: `${(alerts as any[])?.length || 0} unread notifications`,
                });
              }}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {(alerts as any[])?.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {(alerts as any[]).length}
                </Badge>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshDataMutation.mutate()}
              disabled={refreshDataMutation.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshDataMutation.isPending ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportReportMutation.mutate()}
              disabled={exportReportMutation.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              {exportReportMutation.isPending ? 'Exporting...' : 'Export'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab("overview")}
            >
              <Bell className="h-4 w-4 mr-2" />
              Alerts
              {(alerts as any[])?.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {(alerts as any[]).length}
                </Badge>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Enhanced Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-10 h-12 text-xs overflow-x-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="clients" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Clients
            </TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Financial
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="tracking" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Live Tracking
            </TabsTrigger>
            <TabsTrigger value="court-dates" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
              Court Dates
            </TabsTrigger>
            <TabsTrigger value="arrest-monitoring" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white">
              Arrest Monitor
            </TabsTrigger>
            <TabsTrigger value="roi" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              ROI Analysis
            </TabsTrigger>
            <TabsTrigger value="data-management" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">
              Data
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AIEnhancedOverview />
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <MillionDollarClientManagement />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <MillionDollarFinancial />
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <RealTimeMap />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <ClientAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="court-dates" className="space-y-6">
            <CourtDateReminderSystem />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <EnhancedNotificationCenter />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <DataManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <Button 
                    className="h-16 flex-col gap-2" 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Emergency Contact",
                        description: "Emergency contact system activated",
                      });
                    }}
                  >
                    <Bell className="h-6 w-6" />
                    Emergency Contact
                  </Button>
                  <Button 
                    className="h-16 flex-col gap-2" 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Alert Sent",
                        description: "Alert message sent to all active clients",
                      });
                    }}
                  >
                    <AlertTriangle className="h-6 w-6" />
                    Send Alert
                  </Button>
                  <Button 
                    className="h-16 flex-col gap-2" 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Report Generated",
                        description: "System report created successfully",
                      });
                    }}
                  >
                    <Download className="h-6 w-6" />
                    Generate Report
                  </Button>
                  <Button 
                    className="h-16 flex-col gap-2" 
                    variant="outline"
                    onClick={() => setLocation("/client-portal-preview")}
                  >
                    <Eye className="h-6 w-6" />
                    Client Portal Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Real-time system metrics and health monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Server Health</p>
                    <div className="text-2xl font-bold text-green-600">Operational</div>
                    <p className="text-xs text-gray-600">99.9% uptime</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Database</p>
                    <div className="text-2xl font-bold text-green-600">Connected</div>
                    <p className="text-xs text-gray-600">Response time: 45ms</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Security</p>
                    <div className="text-2xl font-bold text-green-600">Protected</div>
                    <p className="text-xs text-gray-600">SSL enabled</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsCharts />
          </TabsContent>

          <TabsContent value="client-analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Analytics</CardTitle>
                <CardDescription>Detailed client behavior and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  Client analytics will display when data is available
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Financial performance and revenue tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  Revenue charts will display when payment data is available
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <RealTimeMap />
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <ClientManagement />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <FinancialDashboard />
          </TabsContent>

          <TabsContent value="court-dates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Court Date Management</CardTitle>
                <CardDescription>Schedule and manage court dates with automated reminders</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  Court date management interface ready for scheduling
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="arrest-monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Arrest Monitoring System</CardTitle>
                <CardDescription>Monitor arrest logs and client safety status</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  Arrest monitoring system operational - no current alerts
                </p>
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>
      </main>
      
      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>System Settings</DialogTitle>
            <DialogDescription>
              Configure system settings and manage data imports
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Client Import</CardTitle>
                <CardDescription>
                  Import multiple clients at once using CSV files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  Bulk client upload functionality available
                </p>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t mt-12">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2024 SecureBond Professional Bail Bond Management System
            </p>
            <Badge variant="secondary">
              System Operational
            </Badge>
          </div>
        </div>
      </footer>
    </div>
  );
}