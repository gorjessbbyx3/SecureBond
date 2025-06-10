import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Bell,
  Users,
  ExternalLink
} from "lucide-react";

interface CourtReminder {
  id: number;
  courtDate: string;
  courtTime?: string;
  courtLocation?: string;
  clientName: string;
  clientId: string;
  daysUntil: number;
  charges?: string;
  remindersSent: number;
}

interface OverdueCourtDate {
  id: number;
  courtDate: string;
  clientName: string;
  clientId: string;
  daysOverdue: number;
  charges?: string;
}

export default function CourtReminders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: upcomingReminders, isLoading: upcomingLoading } = useQuery({
    queryKey: ["/api/court-reminders/upcoming"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: overdueCourtDates, isLoading: overdueLoading } = useQuery({
    queryKey: ["/api/court-reminders/overdue"],
    refetchInterval: 30000,
  });

  const confirmReminderMutation = useMutation({
    mutationFn: async (reminderId: number) => {
      const response = await apiRequest("POST", `/api/court-reminders/${reminderId}/confirm`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/court-reminders/upcoming"] });
      toast({
        title: "Reminder Confirmed",
        description: "Court date reminder has been acknowledged",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm reminder",
        variant: "destructive",
      });
    },
  });

  const sendManualReminderMutation = useMutation({
    mutationFn: async (courtDateId: number) => {
      const response = await apiRequest("POST", `/api/court-reminders/${courtDateId}/send-manual`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder Sent",
        description: "Manual court date reminder has been sent",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reminder",
        variant: "destructive",
      });
    },
  });

  const getPriorityBadge = (daysUntil: number) => {
    if (daysUntil === 0) return <Badge variant="destructive">Today</Badge>;
    if (daysUntil === 1) return <Badge variant="destructive">Tomorrow</Badge>;
    if (daysUntil <= 3) return <Badge variant="secondary">Urgent</Badge>;
    if (daysUntil <= 7) return <Badge variant="outline">Upcoming</Badge>;
    return <Badge variant="outline">{daysUntil} days</Badge>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "Time TBD";
    return timeStr;
  };

  if (upcomingLoading || overdueLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 w-5 h-5" />
                Loading...
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming (30 days)</p>
                <p className="text-2xl font-bold">{upcomingReminders?.length || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">
                  {upcomingReminders?.filter((r: CourtReminder) => r.daysUntil <= 7).length || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueCourtDates?.length || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Court Dates Alert */}
      {overdueCourtDates && overdueCourtDates.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{overdueCourtDates.length} overdue court date(s)</strong> require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Court Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="mr-2 w-5 h-5" />
                Upcoming Court Dates
              </div>
              <Badge variant="outline">{upcomingReminders?.length || 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!upcomingReminders || upcomingReminders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No upcoming court dates</p>
            ) : (
              upcomingReminders.map((reminder: CourtReminder) => (
                <div key={reminder.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{reminder.clientName}</h4>
                        <Badge variant="outline" className="text-xs">{reminder.clientId}</Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 w-4 h-4" />
                        {formatDate(reminder.courtDate)}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 w-4 h-4" />
                        {formatTime(reminder.courtTime)}
                      </div>
                      {reminder.courtLocation && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-1 w-4 h-4" />
                          {reminder.courtLocation}
                        </div>
                      )}
                      {reminder.charges && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Charges:</strong> {reminder.charges}
                        </p>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      {getPriorityBadge(reminder.daysUntil)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Bell className="mr-1 w-4 h-4" />
                      {reminder.remindersSent || 0} reminders sent
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendManualReminderMutation.mutate(reminder.id)}
                        disabled={sendManualReminderMutation.isPending}
                      >
                        Send Reminder
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => confirmReminderMutation.mutate(reminder.id)}
                        disabled={confirmReminderMutation.isPending}
                      >
                        <CheckCircle className="mr-1 w-4 h-4" />
                        Confirm
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Overdue Court Dates */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-red-700">
              <div className="flex items-center">
                <AlertTriangle className="mr-2 w-5 h-5" />
                Overdue Court Dates
              </div>
              <Badge variant="destructive">{overdueCourtDates?.length || 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!overdueCourtDates || overdueCourtDates.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No overdue court dates</p>
            ) : (
              overdueCourtDates.map((overdue: OverdueCourtDate) => (
                <div key={overdue.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-red-900">{overdue.clientName}</h4>
                        <Badge variant="outline" className="text-xs">{overdue.clientId}</Badge>
                      </div>
                      <div className="flex items-center text-sm text-red-700">
                        <Calendar className="mr-1 w-4 h-4" />
                        {formatDate(overdue.courtDate)}
                      </div>
                      {overdue.charges && (
                        <p className="text-sm text-red-700">
                          <strong>Charges:</strong> {overdue.charges}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">
                        {overdue.daysOverdue} day{overdue.daysOverdue !== 1 ? 's' : ''} overdue
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-3 border-t border-red-200 mt-3">
                    <Button size="sm" variant="destructive">
                      <ExternalLink className="mr-1 w-4 h-4" />
                      Take Action
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}