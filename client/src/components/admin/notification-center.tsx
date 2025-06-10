import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, AlertTriangle, CheckCircle, Clock, Phone, MapPin, DollarSign, Calendar } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: number;
  type: 'alert' | 'payment' | 'checkin' | 'court' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  clientId?: string;
  clientName?: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
}

export default function NotificationCenter() {
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['/api/notifications'],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await apiRequest("POST", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const handleActionMutation = useMutation({
    mutationFn: async (data: { notificationId: number; action: string }) => {
      await apiRequest("POST", `/api/notifications/${data.notificationId}/action`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Action completed",
        description: "Notification action has been processed.",
      });
    },
  });

  // Mock notifications for demonstration
  const mockNotifications: Notification[] = [
    {
      id: 1,
      type: 'alert',
      priority: 'critical',
      title: 'Client Missing Check-in',
      message: 'John Smith (SB123456) has missed 3 consecutive check-ins',
      clientId: 'SB123456',
      clientName: 'John Smith',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      actionRequired: true,
    },
    {
      id: 2,
      type: 'payment',
      priority: 'high',
      title: 'Payment Received',
      message: 'New payment of $500 received from Maria Garcia',
      clientId: 'SB789012',
      clientName: 'Maria Garcia',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      read: false,
      actionRequired: true,
    },
    {
      id: 3,
      type: 'court',
      priority: 'medium',
      title: 'Upcoming Court Date',
      message: 'Robert Johnson has a court appearance tomorrow at 9:00 AM',
      clientId: 'SB345678',
      clientName: 'Robert Johnson',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: true,
      actionRequired: false,
    },
    {
      id: 4,
      type: 'system',
      priority: 'low',
      title: 'System Update',
      message: 'Monthly backup completed successfully',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      read: true,
      actionRequired: false,
    },
  ];

  const notificationData = notifications || mockNotifications;

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'checkin': return <MapPin className="h-4 w-4" />;
      case 'court': return <Calendar className="h-4 w-4" />;
      case 'system': return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredNotifications = notificationData.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    if (activeTab === "actions") return notification.actionRequired;
    return notification.type === activeTab;
  });

  const unreadCount = notificationData.filter(n => !n.read).length;
  const actionCount = notificationData.filter(n => n.actionRequired).length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Center
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} unread</Badge>
            )}
            {actionCount > 0 && (
              <Badge className="bg-orange-100 text-orange-800">{actionCount} actions</Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Stay updated with real-time alerts and system notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="alert">Alerts</TabsTrigger>
            <TabsTrigger value="payment">Payments</TabsTrigger>
            <TabsTrigger value="court">Court</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      notification.read 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-white border-blue-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                          {getIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {notification.priority}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          
                          {notification.clientName && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Client: {notification.clientName}</span>
                              {notification.clientId && (
                                <span>({notification.clientId})</span>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(notification.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {notification.actionRequired && (
                          <div className="flex gap-1">
                            {notification.type === 'alert' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleActionMutation.mutate({
                                  notificationId: notification.id,
                                  action: 'call'
                                })}
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {notification.type === 'payment' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleActionMutation.mutate({
                                  notificationId: notification.id,
                                  action: 'confirm'
                                })}
                              >
                                Confirm
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredNotifications.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}