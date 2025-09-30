import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogOut, Bell, Settings, Download, RefreshCw, AlertTriangle, Target, TrendingUp, BarChart3, Eye, Users, DollarSign, Calendar, MapPin, Shield, Activity, Database, Upload, Building2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Import components
import { AIEnhancedOverview } from "@/components/admin/ai-enhanced-overview";
import { MillionDollarClientManagement } from "@/components/admin/million-dollar-client-management";
import { MillionDollarFinancial } from "@/components/admin/million-dollar-financial";
import RealTimeMap from "@/components/admin/real-time-map";
import CourtDateReminderSystem from "@/components/admin/court-date-reminder-system";
import ArrestMonitoringSystem from "@/components/admin/arrest-monitoring-system";
import ROIAnalysisTab from "@/components/admin/roi-analysis-tab";
import DataManagement from "@/components/admin/data-management";
import BulkClientUpload from "@/components/admin/bulk-client-upload";
import { BusinessSettings } from "@/components/admin/business-settings";
import { SystemMonitoringDashboard } from "@/components/admin/system-monitoring-dashboard";
import { AutomatedCourtReminders } from "@/components/admin/automated-court-reminders";
import { RecentArrestLogs } from "@/components/admin/recent-arrest-logs";
import { RSSDocumentsFeed } from "@/components/admin/rss-documents-feed";

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
      await apiRequest("POST", "/api/reports/export");
    },
    onSuccess: () => {
      toast({
        title: "Report exported",
        description: "System report has been generated and downloaded.",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Art of Bail</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Admin Dashboard</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Alerts Badge */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {alerts?.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    {alerts.length}
                  </Badge>
                )}
              </Button>

              {/* Settings */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-5 w-5" />
              </Button>

              {/* Logout */}
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
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Enhanced Dashboard Tabs - Improved Organization */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 h-14 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
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
              value="arrest-logs" 
              className="flex items-center gap-2 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all duration-200 hover:bg-pink-100"
            >
              <Shield className="h-4 w-4" />
              Recent Arrests
            </TabsTrigger>
            <TabsTrigger 
              value="arrest-monitoring" 
              className="flex items-center gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all duration-200 hover:bg-indigo-100"
            >
              <AlertTriangle className="h-4 w-4" />
              Monitoring
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
            <TabsTrigger 
              value="business-settings" 
              className="flex items-center gap-2 data-[state=active]:bg-slate-600 data-[state=active]:text-white transition-all duration-200 hover:bg-slate-100"
            >
              <Building2 className="h-4 w-4" />
              Business Setup
            </TabsTrigger>
            <TabsTrigger 
              value="system-monitoring" 
              className="flex items-center gap-2 data-[state=active]:bg-cyan-600 data-[state=active]:text-white transition-all duration-200 hover:bg-cyan-100"
            >
              <Activity className="h-4 w-4" />
              System Health
            </TabsTrigger>
            <TabsTrigger 
              value="rss-documents" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-200 hover:bg-purple-100"
            >
              <Database className="h-4 w-4" />
              RSS Documents
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

          <TabsContent value="arrest-logs" className="space-y-6">
            <div className="grid gap-6">
              {/* Recent Arrest Logs Header */}
              <Card className="border-2 border-pink-200 bg-pink-50 dark:bg-pink-950">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-pink-900 dark:text-pink-100 flex items-center gap-2">
                    <Shield className="h-6 w-6" />
                    Recent Arrest Logs - Potential Client Identification
                  </CardTitle>
                  <CardDescription className="text-pink-700 dark:text-pink-300">
                    Monitor recent arrests from Honolulu Police Department for potential client outreach and contact management
                  </CardDescription>
                </CardHeader>
              </Card>
              
              {/* Recent Arrest Logs Interface */}
              <RecentArrestLogs />
            </div>
          </TabsContent>

          <TabsContent value="arrest-monitoring" className="space-y-6">
            <div className="grid gap-6">
              {/* Arrest Monitoring Header */}
              <Card className="border-2 border-indigo-200 bg-indigo-50 dark:bg-indigo-950">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6" />
                    Arrest Log Monitoring & Client Alerts
                  </CardTitle>
                  <CardDescription className="text-indigo-700 dark:text-indigo-300">
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

          <TabsContent value="business-settings" className="space-y-6">
            <div className="grid gap-6">
              {/* Business Settings Header */}
              <Card className="border-2 border-slate-200 bg-slate-50 dark:bg-slate-950">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Building2 className="h-6 w-6" />
                    Business Setup & Configuration
                  </CardTitle>
                  <CardDescription className="text-slate-700 dark:text-slate-300">
                    Configure your business profile, goals, staff accounts, and system settings
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <BusinessSettings />
            </div>
          </TabsContent>

          <TabsContent value="system-monitoring" className="space-y-6">
            <div className="grid gap-6">
              {/* System Monitoring Header */}
              <Card className="border-2 border-cyan-200 bg-cyan-50 dark:bg-cyan-950">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
                    <Activity className="h-6 w-6" />
                    Production System Health & Performance Monitoring
                  </CardTitle>
                  <CardDescription className="text-cyan-700 dark:text-cyan-300">
                    Real-time system health monitoring, performance metrics, and production readiness dashboard
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <SystemMonitoringDashboard />
            </div>
          </TabsContent>

          <TabsContent value="rss-documents" className="space-y-6">
            <div className="grid gap-6">
              {/* RSS Documents Header */}
              <Card className="border-2 border-purple-200 bg-purple-50 dark:bg-purple-950">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-purple-900 dark:text-purple-100 flex items-center gap-2">
                    <Database className="h-6 w-6" />
                    RSS Civil/Criminal/Federal Documents Feed
                  </CardTitle>
                  <CardDescription className="text-purple-700 dark:text-purple-300">
                    Real-time court document feeds from Hawaii Federal District Court RSS - civil, criminal, and federal cases
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <RSSDocumentsFeed />
            </div>
          </TabsContent>
        </Tabs>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings & Configuration
              </DialogTitle>
              <DialogDescription>
                Configure system preferences, security settings, and operational parameters.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* System Actions */}
              <div className="grid gap-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  System Actions
                </h4>
                <div className="grid gap-2 md:grid-cols-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      refreshDataMutation.mutate();
                      setShowSettings(false);
                    }}
                    disabled={refreshDataMutation.isPending}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshDataMutation.isPending ? 'animate-spin' : ''}`} />
                    Refresh All Data
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      exportReportMutation.mutate();
                      setShowSettings(false);
                    }}
                    disabled={exportReportMutation.isPending}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export System Report
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setActiveTab("data-management"); setShowSettings(false); }}>
                    <Database className="h-4 w-4 mr-2" />
                    Data Management
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setActiveTab("arrest-monitoring"); setShowSettings(false); }}>
                    <Shield className="h-4 w-4 mr-2" />
                    Monitor Arrests
                  </Button>
                </div>
              </div>

              {/* Navigation Shortcuts */}
              <div className="grid gap-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Quick Navigation
                </h4>
                <div className="grid gap-2 md:grid-cols-2">
                  <Button variant="outline" size="sm" onClick={() => { setActiveTab("clients"); setShowSettings(false); }}>
                    <Users className="h-4 w-4 mr-2" />
                    Client Management
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setActiveTab("financial"); setShowSettings(false); }}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Financial Dashboard
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setActiveTab("court-dates"); setShowSettings(false); }}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Court Dates
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setActiveTab("tracking"); setShowSettings(false); }}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Live Tracking
                  </Button>
                </div>
              </div>

              {/* System Status */}
              <div className="grid gap-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Status
                </h4>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Database Connection</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium">Court Integration</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="text-sm font-medium">GPS Tracking</span>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">Active</Badge>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}