import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, X, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  confirmed: boolean;
  createdAt: string;
}

export function NotificationSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/notifications', user?.id],
    queryFn: () => api.get<Notification[]>('/api/notifications'),
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      api.patch(`/api/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const confirmNotificationMutation = useMutation({
    mutationFn: (notificationId: number) => 
      api.patch(`/api/notifications/${notificationId}/confirm`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Notification confirmed",
        description: "The notification has been acknowledged.",
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.patch('/api/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "All notifications marked as read",
      });
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) return null;

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className="relative"
        onClick={() => {/* Toggle notifications dropdown */}}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      <div className="absolute right-0 top-full mt-2 w-96 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-50">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <Card key={notification.id} className={`m-2 ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getIcon(notification.type)}
                      <CardTitle className="text-sm">{notification.title}</CardTitle>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      {!notification.confirmed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmNotificationMutation.mutate(notification.id)}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}