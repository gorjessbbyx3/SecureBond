import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, DollarSign, Calendar, AlertTriangle, LogOut, TrendingUp } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ClientManagement from "@/components/admin/client-management";
import FinancialDashboard from "@/components/admin/financial-dashboard";

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

  // Mock dashboard stats
  const stats = {
    totalClients: 45,
    activeClients: 42,
    upcomingCourtDates: 8,
    pendingPayments: 12,
    totalRevenue: 125000,
    pendingAlerts: 3,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Admin Portal" subtitle="Bondsman Administration" />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600">Manage clients, payments, and operations</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="flex items-center">
            <LogOut className="mr-2 w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Clients</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalClients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Upcoming Court Dates</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.upcomingCourtDates}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Pending Alerts</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.pendingAlerts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" onClick={() => setActiveTab("clients")}>
                    <Users className="mr-2 w-4 h-4" />
                    Add New Client
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("financial")}>
                    <TrendingUp className="mr-2 w-4 h-4" />
                    View Financial Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("alerts")}>
                    <AlertTriangle className="mr-2 w-4 h-4" />
                    Review Alerts
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Payment confirmed</p>
                        <p className="text-xs text-slate-500">John Smith - $500</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">New client added</p>
                        <p className="text-xs text-slate-500">Sarah Johnson</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Missed check-in alert</p>
                        <p className="text-xs text-slate-500">Mike Davis</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clients">
            <ClientManagement />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialDashboard />
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Court Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-500">Court calendar view coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-500">No pending alerts at this time.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
