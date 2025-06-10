import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, Calendar, DollarSign, MapPin, Phone, AlertTriangle, 
  CheckCircle, Clock, Eye, ArrowLeft 
} from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function ClientPortalPreview() {
  const [, setLocation] = useLocation();
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: selectedClient } = useQuery({
    queryKey: ["/api/clients", selectedClientId],
    enabled: !!selectedClientId,
  });

  const { data: courtDates } = useQuery({
    queryKey: ["/api/clients", selectedClientId, "court-dates"],
    enabled: !!selectedClientId,
  });

  const { data: payments } = useQuery({
    queryKey: ["/api/clients", selectedClientId, "payments"],
    enabled: !!selectedClientId,
  });

  const { data: checkIns } = useQuery({
    queryKey: ["/api/clients", selectedClientId, "check-ins"],
    enabled: !!selectedClientId,
  });

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications", selectedClientId],
    enabled: !!selectedClientId,
  });

  const safeClients = Array.isArray(clients) ? clients : [];
  const safeCourtDates = Array.isArray(courtDates) ? courtDates : [];
  const safePayments = Array.isArray(payments) ? payments : [];
  const safeCheckIns = Array.isArray(checkIns) ? checkIns : [];
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const getStatusBadge = (client: any) => {
    if (!client) return <Badge variant="secondary">No Client Selected</Badge>;
    if (client.isActive) {
      return <Badge variant="default">Active</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  const upcomingCourtDates = safeCourtDates.filter((court: any) => 
    new Date(court.courtDate) > new Date() && !court.completed
  );

  const lastCheckIn = safeCheckIns.length > 0 ? safeCheckIns[safeCheckIns.length - 1] : null;
  const unreadNotifications = safeNotifications.filter((notif: any) => !notif.isRead);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => setLocation("/admin")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Eye className="h-8 w-8 text-blue-600" />
              Client Portal Preview
            </h1>
            <p className="text-slate-600">View the client portal as your clients see it</p>
          </div>
        </div>

        {/* Client Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Client to Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a client to preview their portal..." />
              </SelectTrigger>
              <SelectContent>
                {safeClients.map((client: any) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.fullName} ({client.clientId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedClient ? (
          <>
            {/* Client Portal Simulation */}
            <div className="bg-white border-2 border-blue-200 rounded-lg p-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-400">
                <p className="text-blue-800 font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  You are viewing the client portal as: {selectedClient?.fullName || 'Unknown Client'}
                </p>
              </div>

              {/* Client Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Welcome, {selectedClient?.fullName || 'Unknown Client'}</h2>
                  <p className="text-slate-600">Client ID: {selectedClient?.clientId || 'N/A'}</p>
                </div>
                <div className="text-right">
                  {getStatusBadge(selectedClient)}
                  {unreadNotifications.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadNotifications.length} New Notifications
                    </Badge>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <Calendar className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-600">Upcoming Court Dates</p>
                        <p className="text-2xl font-bold text-slate-900">{upcomingCourtDates.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-600">Total Payments</p>
                        <p className="text-2xl font-bold text-slate-900">{safePayments.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-600">Check-ins</p>
                        <p className="text-2xl font-bold text-slate-900">{safeCheckIns.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Notifications */}
              {unreadNotifications.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Important Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {unreadNotifications.slice(0, 3).map((notification: any) => (
                        <div key={notification.id} className="border-l-4 border-red-400 bg-red-50 p-3 rounded">
                          <p className="font-medium text-red-800">{notification.title}</p>
                          <p className="text-red-700 text-sm">{notification.message}</p>
                          <p className="text-red-600 text-xs mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Court Dates */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Court Dates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingCourtDates.length === 0 ? (
                    <p className="text-slate-600 text-center py-4">No upcoming court dates</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingCourtDates.map((court: any) => (
                        <div key={court.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{court.caseNumber || 'Case #N/A'}</h4>
                            <Badge variant={court.approved ? "default" : "secondary"}>
                              {court.approved ? "Confirmed" : "Pending Approval"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-slate-600">Date:</p>
                              <p className="font-medium">{new Date(court.courtDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-slate-600">Location:</p>
                              <p className="font-medium">{court.courtLocation || 'TBD'}</p>
                            </div>
                          </div>
                          {court.charges && (
                            <div className="mt-2">
                              <p className="text-slate-600 text-sm">Charges:</p>
                              <p className="text-sm">{court.charges}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Last Check-in */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Check-in Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lastCheckIn ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Last Check-in:</span>
                        <span className="font-medium">
                          {new Date(lastCheckIn.checkInTime).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Location:</span>
                        <span className="font-medium">{lastCheckIn.location || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Method:</span>
                        <Badge variant="outline">{lastCheckIn.method || 'Manual'}</Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-600 text-center py-4">No check-ins recorded</p>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Phone:</span>
                      <span className="font-medium">{selectedClient?.phoneNumber || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Address:</span>
                      <span className="font-medium">{selectedClient?.address || 'Not provided'}</span>
                    </div>
                    {selectedClient?.emergencyContact && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Emergency Contact:</span>
                        <span className="font-medium">{selectedClient.emergencyContact}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No Client Selected</h3>
              <p className="text-slate-500">Please select a client from the dropdown above to preview their portal experience.</p>
            </CardContent>
          </Card>
        )}
      </main>
      
      <Footer />
    </div>
  );
}