import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Check, CheckCheck, Calendar, AlertTriangle, DollarSign, UserX, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Notification } from "@shared/schema";

export function EnhancedNotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications/user/demo-user"],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ["/api/notifications/user/demo-user/unread"],
    refetchInterval: 15000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/notifications/${id}/read`, "PATCH");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Notification marked as read",
        description: "The notification has been marked as read.",
      });
    },
  });

  const confirmNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/notifications/${id}/confirm`, "PATCH");
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      const notification = notifications.find((n: Notification) => n.id === id);
      toast({
        title: "Court Date Confirmed",
        description: `You have confirmed receipt of: ${notification?.title}`,
        variant: "default",
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'court_reminder':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'payment_due':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'arrest_alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'check_in_missed':
        return <UserX className="h-4 w-4 text-orange-500" />;
      case 'bond_expiring':
        return <Clock className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const requiresConfirmation = (notification: Notification) => {
    return notification.type === 'court_reminder' && !notification.confirmed;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Notifications
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        
        <ScrollArea className="max-h-96">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No notifications yet
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification: Notification) => (
                <Card
                  key={notification.id}
                  className={`m-2 cursor-pointer transition-colors ${
                    !notification.read 
                      ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            <Badge
                              className={`text-xs ${getPriorityColor(notification.priority)}`}
                              variant="outline"
                            >
                              {notification.priority}
                            </Badge>
                            {notification.confirmed && (
                              <CheckCheck className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(notification.createdAt.toString())}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            {requiresConfirmation(notification) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmNotificationMutation.mutate(notification.id);
                                }}
                                disabled={confirmNotificationMutation.isPending}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Confirm
                              </Button>
                            )}
                            
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsReadMutation.mutate(notification.id);
                                }}
                                disabled={markAsReadMutation.isPending}
                              >
                                Mark Read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
                setIsOpen(false);
              }}
            >
              Refresh Notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}