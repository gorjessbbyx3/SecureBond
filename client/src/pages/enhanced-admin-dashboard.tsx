import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LogOut, Bell, Settings, Download, RefreshCw, AlertTriangle, Target, TrendingUp, BarChart3 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

export default function EnhancedAdminDashboard() {
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
      <Header 
        title="SecureBond Admin" 
        subtitle="Professional Bail Bond Management System" 
      />
      
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
            <EnhancedNotificationCenter />
            
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
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                3
              </Badge>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab("data")}
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
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12 h-12 text-xs overflow-x-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Performance
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="client-analytics" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
              Client Analytics
            </TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              Revenue
            </TabsTrigger>
            <TabsTrigger value="tracking" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Live Tracking
            </TabsTrigger>
            <TabsTrigger value="clients" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Clients
            </TabsTrigger>
            <TabsTrigger value="bulk-upload" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              Bulk Upload
            </TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Financial
            </TabsTrigger>
            <TabsTrigger value="court-dates" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
              Court Dates
            </TabsTrigger>
            <TabsTrigger value="arrest-monitoring" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white">
              Arrest Monitor
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              Data & Backup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <QuickStats role="admin" />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <DashboardStats role="admin" />
              </div>
              <div>
                <SmartAlerts />
              </div>
            </div>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <Button className="h-16 flex-col gap-2" variant="outline">
                    <Bell className="h-6 w-6" />
                    Emergency Contact
                  </Button>
                  <Button className="h-16 flex-col gap-2" variant="outline">
                    <AlertTriangle className="h-6 w-6" />
                    Send Alert
                  </Button>
                  <Button className="h-16 flex-col gap-2" variant="outline">
                    <Download className="h-6 w-6" />
                    Generate Report
                  </Button>
                  <Button className="h-16 flex-col gap-2" variant="outline">
                    <Settings className="h-6 w-6" />
                    System Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceMetrics />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <AnalyticsCharts />
              <TopLocations />
            </div>
          </TabsContent>

          <TabsContent value="client-analytics" className="space-y-6">
            <ClientAnalytics />
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <RevenueChart />
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <RealTimeMap />
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <ClientManagement />
          </TabsContent>

          <TabsContent value="bulk-upload" className="space-y-6">
            <BulkClientUpload />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <FinancialDashboard />
          </TabsContent>

          <TabsContent value="court-dates" className="space-y-6">
            <CourtDateReminderSystem />
          </TabsContent>

          <TabsContent value="arrest-monitoring" className="space-y-6">
            <ArrestMonitoringSystem />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <DataManagement />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}