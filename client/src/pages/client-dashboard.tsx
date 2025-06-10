import { useState } from "react";
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

  // Mock client data - in real app this would come from session/auth
  const clientData = {
    id: 1,
    fullName: "John Smith",
    clientId: "SB123456",
    bondAmount: "25000.00",
    courtDate: "2024-02-15T10:00:00Z",
    courtLocation: "District Court Room 3A",
    lastCheckIn: "2024-01-10T14:30:00Z",
    nextCheckInDue: "2024-01-12T23:59:59Z",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title={`Welcome, ${clientData.fullName}`} subtitle="Client Dashboard" />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Client ID: {clientData.clientId}</p>
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
                  <p className="text-2xl font-bold text-slate-900">${clientData.bondAmount}</p>
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
                    {new Date(clientData.courtDate).toLocaleDateString()}
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
                    {new Date(clientData.lastCheckIn).toLocaleDateString()}
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
                    {new Date(clientData.nextCheckInDue).toLocaleDateString()}
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
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {new Date(clientData.courtDate).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Badge>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Clock className="mr-2 w-4 h-4" />
                      <span>{new Date(clientData.courtDate).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <MapPin className="mr-2 w-4 h-4" />
                      <span>{clientData.courtLocation}</span>
                    </div>
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
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Check-in completed</p>
                        <p className="text-xs text-slate-500">
                          {new Date(clientData.lastCheckIn).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Account created</p>
                        <p className="text-xs text-slate-500">January 1, 2024</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="checkin">
            <CheckInForm clientId={clientData.id} />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentUpload clientId={clientData.id} />
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
