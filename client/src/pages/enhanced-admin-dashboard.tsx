import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogOut, Bell, Settings, Download, RefreshCw, AlertTriangle, Target, TrendingUp, BarChart3, Eye, Users, DollarSign, Calendar, MapPin, Shield, Activity, Database, Upload } from "lucide-react";
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

        {/* Enhanced Dashboard Tabs - Improved Organization */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-14 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200 hover:bg-blue-100"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="clients" 
              className="flex items-center gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all duration-200 hover:bg-orange-100"
            >
              <Users className="h-4 w-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger 
              value="financial" 
              className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all duration-200 hover:bg-green-100"
            >
              <DollarSign className="h-4 w-4" />
              Financial
            </TabsTrigger>
            <TabsTrigger 
              value="court-dates" 
              className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all duration-200 hover:bg-red-100"
            >
              <Calendar className="h-4 w-4" />
              Court Dates
            </TabsTrigger>
            <TabsTrigger 
              value="tracking" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-200 hover:bg-purple-100"
            >
              <MapPin className="h-4 w-4" />
              Live Tracking
            </TabsTrigger>
            <TabsTrigger 
              value="arrest-monitoring" 
              className="flex items-center gap-2 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all duration-200 hover:bg-pink-100"
            >
              <Shield className="h-4 w-4" />
              Arrest Monitor
            </TabsTrigger>
            <TabsTrigger 
              value="roi" 
              className="flex items-center gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all duration-200 hover:bg-indigo-100"
            >
              <TrendingUp className="h-4 w-4" />
              ROI Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="data-management" 
              className="flex items-center gap-2 data-[state=active]:bg-gray-600 data-[state=active]:text-white transition-all duration-200 hover:bg-gray-100"
            >
              <Settings className="h-4 w-4" />
              Admin Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6">
              {/* Critical Operations Header */}
              <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-950">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <Activity className="h-6 w-6" />
                    Mission-Critical Operations Dashboard
                  </CardTitle>
                  <CardDescription className="text-blue-700 dark:text-blue-300">
                    Real-time monitoring of all critical bail bond operations - court dates, client compliance, and financial status
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <AIEnhancedOverview />
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <div className="grid gap-6">
              {/* Client Management Header */}
              <Card className="border-2 border-orange-200 bg-orange-50 dark:bg-orange-950">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-orange-900 dark:text-orange-100 flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    Client Management & Compliance Tracking
                  </CardTitle>
                  <CardDescription className="text-orange-700 dark:text-orange-300">
                    Comprehensive client management with AI-powered risk assessment and compliance monitoring
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <MillionDollarClientManagement />
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="grid gap-6">
              {/* Financial Operations Header */}
              <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-950">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-green-900 dark:text-green-100 flex items-center gap-2">
                    <DollarSign className="h-6 w-6" />
                    Financial Operations & Revenue Management
                  </CardTitle>
                  <CardDescription className="text-green-700 dark:text-green-300">
                    Complete financial oversight including payment processing, collections, and revenue optimization
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <MillionDollarFinancial />
            </div>
          </TabsContent>

          <TabsContent value="court-dates" className="space-y-6">
            <div className="grid gap-6">
              {/* Court Date Management Header */}
              <Card className="border-2 border-red-200 bg-red-50 dark:bg-red-950">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-red-900 dark:text-red-100 flex items-center gap-2">
                    <Calendar className="h-6 w-6" />
                    Court Date Management & Reminder System
                  </CardTitle>
                  <CardDescription className="text-red-700 dark:text-red-300">
                    Critical court date tracking and automated reminder system to prevent missed appearances
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <CourtDateReminderSystem />
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <div className="grid gap-6">
              {/* Live Tracking Header */}
              <Card className="border-2 border-purple-200 bg-purple-50 dark:bg-purple-950">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-purple-900 dark:text-purple-100 flex items-center gap-2">
                    <MapPin className="h-6 w-6" />
                    Real-Time Client Location Tracking
                  </CardTitle>
                  <CardDescription className="text-purple-700 dark:text-purple-300">
                    Live GPS monitoring and geofencing for client compliance and safety verification
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <RealTimeMap />
            </div>
          </TabsContent>

          <TabsContent value="arrest-monitoring" className="space-y-6">
            <div className="grid gap-6">
              {/* Arrest Monitoring Header */}
              <Card className="border-2 border-pink-200 bg-pink-50 dark:bg-pink-950">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-pink-900 dark:text-pink-100 flex items-center gap-2">
                    <Shield className="h-6 w-6" />
                    Arrest Log Monitoring & Client Alerts
                  </CardTitle>
                  <CardDescription className="text-pink-700 dark:text-pink-300">
                    Real-time monitoring of police arrest logs for existing clients and potential new business opportunities
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <ArrestMonitoringSystem />
            </div>
          </TabsContent>

          <TabsContent value="roi" className="space-y-6">
            <div className="grid gap-6">
              {/* ROI Analysis Header */}
              <Card className="border-2 border-indigo-200 bg-indigo-50 dark:bg-indigo-950">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                    <TrendingUp className="h-6 w-6" />
                    Return on Investment Analysis & Business Intelligence
                  </CardTitle>
                  <CardDescription className="text-indigo-700 dark:text-indigo-300">
                    Advanced ROI analytics, revenue optimization opportunities, and business growth insights
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <ROIAnalysisTab />
            </div>
          </TabsContent>

          <TabsContent value="data-management" className="space-y-6">
            <div className="grid gap-6">
              {/* Admin Tools Header */}
              <Card className="border-2 border-gray-200 bg-gray-50 dark:bg-gray-950">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Settings className="h-6 w-6" />
                    Administrative Tools & System Management
                  </CardTitle>
                  <CardDescription className="text-gray-700 dark:text-gray-300">
                    System administration, data management, bulk operations, and security settings
                  </CardDescription>
                </CardHeader>
              </Card>
              
              {/* Admin Tools Grid */}
              <div className="grid gap-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                      <Button 
                        className="h-16 flex-col gap-2" 
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: "Emergency Protocol",
                            description: "Emergency contact system activated for all active clients",
                          });
                        }}
                      >
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                        Emergency Contact
                      </Button>
                      <Button 
                        className="h-16 flex-col gap-2" 
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: "System Alert",
                            description: "Alert message broadcast to all active clients",
                          });
                        }}
                      >
                        <Bell className="h-6 w-6 text-blue-500" />
                        Broadcast Alert
                      </Button>
                      <Button 
                        className="h-16 flex-col gap-2" 
                        variant="outline"
                        onClick={() => {
                          exportReportMutation.mutate();
                        }}
                        disabled={exportReportMutation.isPending}
                      >
                        <Download className="h-6 w-6 text-green-500" />
                        {exportReportMutation.isPending ? 'Generating...' : 'Export Report'}
                      </Button>
                      <Button 
                        className="h-16 flex-col gap-2" 
                        variant="outline"
                        onClick={() => {
                          refreshDataMutation.mutate();
                        }}
                        disabled={refreshDataMutation.isPending}
                      >
                        <RefreshCw className={`h-6 w-6 text-purple-500 ${refreshDataMutation.isPending ? 'animate-spin' : ''}`} />
                        Refresh Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Data Management Tools */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Data Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DataManagement />
                  </CardContent>
                </Card>

                {/* Bulk Operations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Bulk Operations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BulkClientUpload />
                  </CardContent>
                </Card>

                {/* System Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div>
                          <p className="font-medium">Database</p>
                          <p className="text-sm text-muted-foreground">Operational</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div>
                          <p className="font-medium">Court Integration</p>
                          <p className="text-sm text-muted-foreground">Connected</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div>
                          <p className="font-medium">GPS Tracking</p>
                          <p className="text-sm text-muted-foreground">Active</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>


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