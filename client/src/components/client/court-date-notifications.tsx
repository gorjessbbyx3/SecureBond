import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Calendar, MapPin, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CourtDateNotificationsProps {
  clientId: number;
}

export function CourtDateNotifications({ clientId }: CourtDateNotificationsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courtDates = [], isLoading } = useQuery({
    queryKey: ["/api/client/court-dates"],
  });

  const { data: notifications = [] } = useQuery({
    queryKey: [`/api/notifications/user/client-${clientId}/unread`],
  });

  const acknowledgeCourtDateMutation = useMutation({
    mutationFn: async (courtDateId: number) => {
      return apiRequest(`/api/client/court-dates/${courtDateId}/acknowledge`, "PATCH", {
        clientId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client/court-dates"] });
      queryClient.invalidateQueries({ queryKey: [`/api/notifications/user/client-${clientId}`] });
      toast({
        title: "Court Date Acknowledged",
        description: "You have successfully acknowledged this court date.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Acknowledgment Failed",
        description: error.message || "Failed to acknowledge court date",
        variant: "destructive",
      });
    },
  });

  // Find court dates that need acknowledgment
  const unacknowledgedCourtDates = courtDates.filter(
    (courtDate: any) => courtDate.adminApproved && !courtDate.clientAcknowledged
  );

  // Find court date approval notifications
  const courtDateNotifications = notifications.filter(
    (notification: any) => notification.type === "court_date_approval"
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Court Date Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-slate-600">Loading notifications...</div>
        </CardContent>
      </Card>
    );
  }

  if (unacknowledgedCourtDates.length === 0 && courtDateNotifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Court Date Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-slate-600">All court dates acknowledged</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Court Date Notifications
          {unacknowledgedCourtDates.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unacknowledgedCourtDates.length} Pending
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-slate-600">
          Please review and acknowledge your court dates below.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {courtDateNotifications.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You have {courtDateNotifications.length} new court date notification(s) that require your attention.
            </AlertDescription>
          </Alert>
        )}

        {unacknowledgedCourtDates.map((courtDate: any) => (
          <div key={courtDate.id} className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Clock className="h-3 w-3 mr-1" />
                    Requires Acknowledgment
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    <Calendar className="h-4 w-4" />
                    {new Date(courtDate.courtDate).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })} at {new Date(courtDate.courtDate).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>

                  {courtDate.courtLocation && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="h-4 w-4" />
                      {courtDate.courtLocation}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Court Type:</span> {courtDate.courtType}
                    </div>
                    {courtDate.caseNumber && (
                      <div>
                        <span className="font-medium">Case Number:</span> {courtDate.caseNumber}
                      </div>
                    )}
                    {courtDate.charges && (
                      <div className="md:col-span-2">
                        <span className="font-medium">Charges:</span> {courtDate.charges}
                      </div>
                    )}
                  </div>

                  {courtDate.notes && (
                    <div className="text-sm bg-white p-2 rounded border">
                      <span className="font-medium">Important Notes:</span> {courtDate.notes}
                    </div>
                  )}
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> By acknowledging this court date, you confirm that you have reviewed 
                    the details and understand your obligation to appear. Please contact your bail bond agent if you 
                    have any questions or concerns.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="ml-4 flex flex-col gap-2">
                <Button
                  onClick={() => acknowledgeCourtDateMutation.mutate(courtDate.id)}
                  disabled={acknowledgeCourtDateMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {acknowledgeCourtDateMutation.isPending ? "Processing..." : "Acknowledge"}
                </Button>
              </div>
            </div>
          </div>
        ))}

        {unacknowledgedCourtDates.length === 0 && (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-medium text-slate-900 mb-2">All Court Dates Acknowledged</h3>
            <p className="text-slate-600">
              You have acknowledged all your approved court dates. Check back here for any new court date notifications.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}