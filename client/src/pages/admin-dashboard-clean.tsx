import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, DollarSign, Calendar, AlertTriangle, LogOut, TrendingUp } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ClientManagement from "@/components/admin/client-management";
import FinancialDashboard from "@/components/admin/financial-dashboard";
import DashboardStats from "@/components/admin/dashboard-stats";
import RealTimeMap from "@/components/admin/real-time-map";
import AnalyticsCharts from "@/components/admin/analytics-charts";
import { CourtDateApprovals } from "@/components/admin/court-date-approvals";
import { MobileNavigation } from "@/components/mobile/mobile-navigation";
import { MobileCard, MobileStatCard, MobileListItem } from "@/components/mobile/mobile-card";

export default function AdminDashboard() {
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

  // Dashboard stats from API
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/dashboard-stats'],
  });

  return (
    <div className="mobile-dashboard">
      {/* Mobile Navigation */}
      <MobileNavigation userRole="admin" />
      
      <main className="mobile-content">
        <div className="mobile-container">
          {/* Mobile Header Section */}
          <div className="mobile-section">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="mobile-heading text-slate-900">Admin Dashboard</h1>
                <p className="mobile-text text-slate-600">Manage clients, payments, and operations</p>
              </div>
            </div>
          </div>

          {/* Mobile Overview Stats */}
          <div className="mobile-section">
            <div className="mobile-grid tablet-grid">
              <MobileStatCard
                title="Total Clients"
                value={stats?.totalClients || "0"}
                icon={<Users className="h-6 w-6" />}
              />
              
              <MobileStatCard
                title="Active Bonds"
                value={stats?.activeBonds || "0"}
                icon={<DollarSign className="h-6 w-6" />}
              />
              
              <MobileStatCard
                title="Total Revenue"
                value={stats?.totalRevenue ? `$${stats.totalRevenue.toLocaleString()}` : "$0"}
                icon={<TrendingUp className="h-6 w-6" />}
              />
              
              <MobileStatCard
                title="Pending Alerts"
                value={stats?.pendingAlerts || "0"}
                icon={<AlertTriangle className="h-6 w-6" />}
              />
            </div>
          </div>

          {/* Main Content Tabs */}
          <div className="mobile-section">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="clients" className="text-xs">Clients</TabsTrigger>
                <TabsTrigger value="financial" className="text-xs">Financial</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="mobile-grid">
                  <MobileCard title="Quick Stats">
                    <DashboardStats />
                  </MobileCard>
                  
                  <MobileCard title="Recent Activity">
                    <AnalyticsCharts />
                  </MobileCard>
                  
                  <MobileCard title="Court Date Approvals">
                    <CourtDateApprovals />
                  </MobileCard>
                </div>
              </TabsContent>

              <TabsContent value="clients">
                <div className="mobile-section">
                  <ClientManagement />
                </div>
              </TabsContent>

              <TabsContent value="financial">
                <div className="mobile-section">
                  <FinancialDashboard />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}