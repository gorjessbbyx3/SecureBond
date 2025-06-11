import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Calendar,
  CheckCircle,
  X,
  Eye
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AuthenticAlerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["/api/alerts/unacknowledged"],
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to acknowledge alert. Please try again.",
        variant: "destructive"
      });
    }
  });

  const dismissAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      return await apiRequest("DELETE", `/api/alerts/${alertId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/unacknowledged"] });
      toast({
        title: "Alert Dismissed",
        description: "Alert has been removed.",
      });
    }
  });

  const authenticAlerts = Array.isArray(alerts) ? alerts : [];

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Alerts...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Active Alerts
        </CardTitle>
        <Badge variant="outline">
          {authenticAlerts.length} active
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {authenticAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium">No Active Alerts</p>
            <p className="text-sm">All systems are operating normally</p>
          </div>
        ) : (
          authenticAlerts.map((alert: any) => {
            const IconComponent = getAlertIcon(alert.type);
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getPriorityColor(alert.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <IconComponent className="h-5 w-5 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {alert.priority}
                        </Badge>
                      </div>
                      <p className="text-sm opacity-90">{alert.message}</p>
                      {alert.timestamp && (
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {alert.actionRequired && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                        disabled={acknowledgeAlertMutation.isPending}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissAlertMutation.mutate(alert.id)}
                      disabled={dismissAlertMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}