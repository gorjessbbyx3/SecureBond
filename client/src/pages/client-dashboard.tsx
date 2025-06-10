import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Calendar, DollarSign, MessageSquare, LogOut, Clock, MapPin } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CheckInForm from "@/components/client/check-in-form";
import PaymentUpload from "@/components/client/payment-upload";
import { CourtDateNotifications } from "@/components/client/court-date-notifications";

export default function ClientDashboard() {
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

  // Fetch actual client data from session/auth
  const { data: clientData, isLoading: clientLoading } = useQuery<any>({
    queryKey: ["/api/auth/client"],
    retry: false,
  });

  const { data: clientBonds = [] } = useQuery<any[]>({
    queryKey: ["/api/client/bonds"],
    enabled: !!clientData?.id,
  });

  const { data: clientCourtDates = [] } = useQuery<any[]>({
    queryKey: ["/api/client/court-dates"],
    enabled: !!clientData?.id,
  });

  const { data: clientCheckIns = [] } = useQuery<any[]>({
    queryKey: ["/api/client/checkins"],
    enabled: !!clientData?.id,
  });

  // Calculate real client dashboard data
  const dashboardData = useMemo(() => {
    if (!clientData) return null;

    const activeBonds = clientBonds.filter((bond: any) => bond.isActive);
    const totalBondAmount = activeBonds.reduce((sum: number, bond: any) => sum + parseFloat(bond.amount || "0"), 0);
    
    const upcomingCourtDates = clientCourtDates.filter((court: any) => 
      new Date(court.courtDate) > new Date() && !court.completed
    ).sort((a: any, b: any) => new Date(a.courtDate).getTime() - new Date(b.courtDate).getTime());
    
    const recentCheckIns = clientCheckIns.sort((a: any, b: any) => 
      new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
    );

    const lastCheckIn = recentCheckIns[0];
    const nextCourtDate = upcomingCourtDates[0];

    return {
      id: clientData.id,
      fullName: clientData.fullName,
      clientId: clientData.clientId,
      bondAmount: totalBondAmount.toFixed(2),
      courtDate: nextCourtDate?.courtDate || null,
      courtLocation: nextCourtDate?.courtLocation || "No upcoming court dates",
      lastCheckIn: lastCheckIn?.checkInTime || null,
      nextCheckInDue: null,
      createdAt: clientData.createdAt,
      isActive: clientData.isActive,
    };
  }, [clientData, clientBonds, clientCourtDates, clientCheckIns]);

  if (clientLoading || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header title={`Welcome, ${dashboardData.fullName}`} subtitle="Client Dashboard" />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Client ID: {dashboardData.clientId}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="flex items-center">
            <LogOut className="mr-2 w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Bond Amount</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {parseFloat(dashboardData.bondAmount) > 0 ? `$${dashboardData.bondAmount}` : "No active bonds"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Court Date</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {dashboardData.courtDate ? new Date(dashboardData.courtDate).toLocaleDateString() : "No upcoming court dates"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Last Check-in</p>
                  <p className="text-sm text-slate-900">
                    {dashboardData.lastCheckIn ? new Date(dashboardData.lastCheckIn).toLocaleDateString() : "No check-ins yet"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Next Check-in Due</p>
                  <p className="text-sm text-slate-900">
                    {dashboardData.nextCheckInDue ? new Date(dashboardData.nextCheckInDue).toLocaleDateString() : "No schedule set"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="checkin">Check-in</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Court Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 w-5 h-5" />
                    Upcoming Court Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.courtDate ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {new Date(dashboardData.courtDate).toLocaleDateString('en-US', { 
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Badge>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <Clock className="mr-2 w-4 h-4" />
                          <span>{new Date(dashboardData.courtDate).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}</span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <MapPin className="mr-2 w-4 h-4" />
                          <span>{dashboardData.courtLocation}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-500 text-center py-4">
                        No upcoming court dates scheduled
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.lastCheckIn ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Check-in completed</p>
                          <p className="text-xs text-slate-500">
                            {new Date(dashboardData.lastCheckIn).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">No check-ins yet</p>
                          <p className="text-xs text-slate-500">Complete your first check-in</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Account created</p>
                        <p className="text-xs text-slate-500">
                          {dashboardData.createdAt ? new Date(dashboardData.createdAt).toLocaleDateString() : "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="checkin">
            <CheckInForm clientId={dashboardData.id} />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentUpload clientId={dashboardData.id} />
          </TabsContent>

          <TabsContent value="notifications">
            <CourtDateNotifications clientId={dashboardData.id} />
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 w-5 h-5" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-500">No messages at this time.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
