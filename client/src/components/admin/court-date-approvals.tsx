import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertTriangle, User, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function CourtDateApprovals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingCourtDates = [], isLoading } = useQuery({
    queryKey: ["/api/court-dates/pending"],
  });

  const { data: allClients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  const approveCourtDateMutation = useMutation({
    mutationFn: async (courtDateId: number) => {
      return apiRequest(`/api/court-dates/${courtDateId}/approve`, "PATCH");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/court-dates/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/court-dates"] });
      toast({
        title: "Court Date Approved",
        description: "The court date has been approved and the client will be notified.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve court date",
        variant: "destructive",
      });
    },
  });

  const getClientName = (clientId: number) => {
    if (!Array.isArray(allClients)) return "Unknown Client";
    const client = allClients.find((c: any) => c.id === clientId);
    return client?.fullName || "Unknown Client";
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case "scraped": return "bg-blue-100 text-blue-800";
      case "imported": return "bg-purple-100 text-purple-800";
      case "manual": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Court Date Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-600">Loading pending approvals...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Court Date Approvals
          {Array.isArray(pendingCourtDates) && pendingCourtDates.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {pendingCourtDates.length}
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-slate-600">
          Review and approve court dates before they appear on client pages to prevent confusion with similar names.
        </p>
      </CardHeader>
      <CardContent>
        {!Array.isArray(pendingCourtDates) || pendingCourtDates.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-slate-600">No pending court dates to approve</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Array.isArray(pendingCourtDates) && pendingCourtDates.map((courtDate: any) => (
              <div key={courtDate.id} className="border rounded-lg p-4 bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-500" />
                      <span className="font-medium">{getClientName(courtDate.clientId)}</span>
                      <Badge className={getSourceBadgeColor(courtDate.source || "manual")}>
                        {(courtDate.source || "manual").toUpperCase()}
                      </Badge>
                      {!courtDate.sourceVerified && courtDate.source === "scraped" && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Unverified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(courtDate.courtDate).toLocaleDateString()} at{" "}
                        {new Date(courtDate.courtDate).toLocaleTimeString()}
                      </div>
                      {courtDate.courtLocation && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {courtDate.courtLocation}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Court Type:</span> {courtDate.courtType}
                      </div>
                      {courtDate.caseNumber && (
                        <div>
                          <span className="font-medium">Case Number:</span> {courtDate.caseNumber}
                        </div>
                      )}
                      {courtDate.charges && (
                        <div className="col-span-2">
                          <span className="font-medium">Charges:</span> {courtDate.charges}
                        </div>
                      )}
                      {courtDate.notes && (
                        <div className="col-span-2">
                          <span className="font-medium">Notes:</span> {courtDate.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => approveCourtDateMutation.mutate(courtDate.id)}
                    disabled={approveCourtDateMutation.isPending}
                    className="ml-4"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {approveCourtDateMutation.isPending ? "Approving..." : "Approve"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}