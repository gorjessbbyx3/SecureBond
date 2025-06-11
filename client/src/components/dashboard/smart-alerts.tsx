import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Calendar,
  Phone,
  CheckCircle,
  X,
  Eye
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SmartAlerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts/unacknowledged"],
  });

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: checkIns } = useQuery({
    queryKey: ["/api/checkins"],
  });

  const { data: courtDates } = useQuery({
    queryKey: ["/api/court-dates"],
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      return await apiRequest("POST", `/api/alerts/${alertId}/acknowledge`, {
        acknowledgedBy: "current-user"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/unacknowledged"] });
      toast({
        title: "Alert Acknowledged",
        description: "Alert has been marked as handled.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to acknowledge alert. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Only use authentic alerts from API - no mock data generation
  const allAlerts = (Array.isArray(alerts) ? alerts : []).sort((a: any, b: any) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority as keyof typeof priorityOrder] || 1) - 
           (priorityOrder[a.priority as keyof typeof priorityOrder] || 1);
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'missed-checkin': return Clock;
      case 'court-reminder': return Calendar;
      case 'risk-alert': return AlertTriangle;
      case 'location': return MapPin;
      default: return AlertTriangle;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Smart Alerts
          </div>
          <Badge variant="destructive">
            {allAlerts.filter((alert: any) => alert.priority === 'high').length} high priority
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {allAlerts.length > 0 ? (
            allAlerts.map((alert: any, index: number) => {
              const AlertIcon = getAlertIcon(alert.type);
              return (
                <div 
                  key={alert.id || index} 
                  className={`p-4 rounded-lg border-l-4 ${getPriorityColor(alert.priority)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <AlertIcon className="h-5 w-5 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge variant={
                            alert.priority === 'high' ? 'destructive' :
                            alert.priority === 'medium' ? 'secondary' : 'default'
                          }>
                            {alert.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{new Date(alert.timestamp || alert.createdAt).toLocaleString()}</span>
                          {alert.clientId && (
                            <span>Client ID: {alert.clientId}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {alert.actionRequired && (
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      )}
                      {alert.id && typeof alert.id === 'number' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                          disabled={acknowledgeAlertMutation.isPending}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">All Clear!</p>
              <p className="text-sm">No active alerts at this time.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}