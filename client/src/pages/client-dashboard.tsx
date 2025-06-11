import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Calendar, DollarSign, MessageSquare, LogOut, Clock, MapPin } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { usePrivacyAcknowledgment } from "@/hooks/usePrivacyAcknowledgment";
import CheckInForm from "@/components/client/check-in-form";
import PaymentUpload from "@/components/client/payment-upload";
import { CourtDateNotifications } from "@/components/client/court-date-notifications";
import { MobileNavigation } from "@/components/mobile/mobile-navigation";
import { MobileCard, MobileStatCard, MobileListItem } from "@/components/mobile/mobile-card";
import InitialPrivacyConsent from "@/components/privacy/InitialPrivacyConsent";
import { BrandedHeader } from "@/components/ui/branded-header";

export default function ClientDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const { isAuthenticated, isLoading } = useAuth();
  const { hasAcknowledged, isLoading: privacyLoading, acknowledgePrivacy } = usePrivacyAcknowledgment();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/client-login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Show loading while checking authentication or privacy status
  if (isLoading || privacyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Handle privacy consent flow
  const handlePrivacyAccept = async () => {
    try {
      const dataTypes = [
        "location_tracking",
        "facial_recognition", 
        "personal_legal_data"
      ];
      await acknowledgePrivacy(dataTypes);
      toast({
        title: "Privacy Policy Acknowledged",
        description: "You can now access the SecureBond system.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to acknowledge privacy policy. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePrivacyDecline = () => {
    toast({
      title: "Privacy Policy Required",
      description: "You must acknowledge our privacy policy to use this system.",
      variant: "destructive"
    });
    setLocation("/client-login");
  };

  // Show privacy consent if not acknowledged
  if (!hasAcknowledged) {
    return (
      <InitialPrivacyConsent
        onAccept={handlePrivacyAccept}
        onDecline={handlePrivacyDecline}
      />
    );
  }

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
    <div className="mobile-dashboard">
      {/* Branded Header */}
      <BrandedHeader title="Client Portal" subtitle="Secure Access to Your Account" />
      
      {/* Mobile Navigation */}
      <MobileNavigation userRole="client" />
      
      <main className="mobile-content">
        <div className="mobile-container">
          {/* Mobile Header Section */}
          <div className="mobile-section">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="mobile-heading text-slate-900">Dashboard</h1>
                <p className="mobile-text text-slate-600">Client ID: {dashboardData.clientId}</p>
              </div>
            </div>
          </div>

          {/* Mobile Overview Cards */}
          <div className="mobile-section">
            <div className="mobile-grid tablet-grid">
              <MobileStatCard
                title="Bond Amount"
                value={parseFloat(dashboardData.bondAmount) > 0 ? `$${dashboardData.bondAmount}` : "No active bonds"}
                icon={<DollarSign className="h-6 w-6" />}
              />
              
              <MobileStatCard
                title="Court Date"
                value={dashboardData.courtDate ? new Date(dashboardData.courtDate).toLocaleDateString() : "No upcoming court dates"}
                icon={<Calendar className="h-6 w-6" />}
              />
              
              <MobileStatCard
                title="Last Check-in"
                value={dashboardData.lastCheckIn ? new Date(dashboardData.lastCheckIn).toLocaleDateString() : "No check-ins yet"}
                icon={<CheckCircle className="h-6 w-6" />}
              />
              
              <MobileStatCard
                title="Next Check-in Due"
                value={dashboardData.nextCheckInDue ? new Date(dashboardData.nextCheckInDue).toLocaleDateString() : "No schedule set"}
                icon={<Clock className="h-6 w-6" />}
              />
            </div>
          </div>

          {/* Main Content Tabs */}
          <div className="mobile-section">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="checkin" className="text-xs">Check-in</TabsTrigger>
                <TabsTrigger value="payments" className="text-xs">Payments</TabsTrigger>
                <TabsTrigger value="messages" className="text-xs">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="mobile-grid">
                  {/* Court Information */}
                  <MobileCard
                    title="Upcoming Court Date"
                    headerAction={<Calendar className="h-5 w-5 text-blue-600" />}
                  >
                    {dashboardData.courtDate ? (
                      <div className="space-y-3">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                          {new Date(dashboardData.courtDate).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Badge>
                        <div className="flex items-center text-slate-600 mobile-text">
                          <Clock className="mr-2 w-4 h-4" />
                          <span>{new Date(dashboardData.courtDate).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}</span>
                        </div>
                        <div className="flex items-center text-slate-600 mobile-text">
                          <MapPin className="mr-2 w-4 h-4" />
                          <span>{dashboardData.courtLocation}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500 text-center py-4 mobile-text">
                        No upcoming court dates scheduled
                      </div>
                    )}
                  </MobileCard>

                  {/* Recent Activity */}
                  <MobileCard title="Recent Activity">
                    <div className="space-y-3">
                      {dashboardData.lastCheckIn ? (
                        <MobileListItem
                          title="Check-in completed"
                          subtitle={new Date(dashboardData.lastCheckIn).toLocaleDateString()}
                          status={{ label: "Complete", variant: "success" }}
                        />
                      ) : (
                        <MobileListItem
                          title="No check-ins yet"
                          subtitle="Complete your first check-in"
                          status={{ label: "Pending", variant: "warning" }}
                        />
                      )}
                      <MobileListItem
                        title="Account created"
                        subtitle={dashboardData.createdAt ? new Date(dashboardData.createdAt).toLocaleDateString() : "Unknown"}
                        status={{ label: "Active", variant: "info" }}
                      />
                    </div>
                  </MobileCard>
                </div>
              </TabsContent>

              <TabsContent value="checkin">
                <div className="mobile-section">
                  <CheckInForm clientId={dashboardData.id} />
                </div>
              </TabsContent>

              <TabsContent value="payments">
                <div className="mobile-section">
                  <PaymentUpload clientId={dashboardData.id} />
                </div>
              </TabsContent>

              <TabsContent value="messages">
                <div className="mobile-section">
                  <MobileCard
                    title="Messages"
                    headerAction={<MessageSquare className="h-5 w-5 text-blue-600" />}
                  >
                    <p className="mobile-text text-slate-500 text-center py-4">No messages at this time.</p>
                  </MobileCard>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
