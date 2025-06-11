import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Settings,
  Mail,
  MessageSquare,
  Users,
  Bell,
  PlayCircle,
  RefreshCw
} from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CourtReminder {
  id: number;
  courtDateId: number;
  reminderType: string;
  scheduledTime: string;
  sent: boolean;
  sentAt?: string;
  notificationId?: number;
  client?: {
    id: number;
    fullName: string;
    phoneNumber?: string;
  };
  courtDate?: {
    id: number;
    courtDate: string;
    courtLocation?: string;
    caseNumber?: string;
  };
}

interface NotificationStats {
  totalReminders: number;
  pendingReminders: number;
  sentReminders: number;
  failedReminders: number;
  upcomingCourtDates: number;
}

export function AutomatedCourtReminders() {
  const [testEmail, setTestEmail] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isTestingSMS, setIsTestingSMS] = useState(false);
  const { toast } = useToast();

  // Fetch notification statistics
  const { data: stats, isLoading: statsLoading } = useQuery<NotificationStats>({
    queryKey: ['/api/admin/notification-stats'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch upcoming reminders
  const { data: reminders, isLoading: remindersLoading } = useQuery<CourtReminder[]>({
    queryKey: ['/api/admin/court-reminders'],
    refetchInterval: 60000 // Refresh every minute
  });

  // Fetch upcoming court dates
  const { data: upcomingDates, isLoading: datesLoading } = useQuery({
    queryKey: ['/api/admin/upcoming-court-dates'],
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  // Test email notification
  const testEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? 'Email Sent' : 'Email Failed',
        description: data.message,
        variant: data.success ? 'default' : 'destructive'
      });
    }
  });

  // Test SMS notification
  const testSMSMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await fetch('/api/admin/test-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? 'SMS Sent' : 'SMS Failed',
        description: data.message,
        variant: data.success ? 'default' : 'destructive'
      });
    }
  });

  // Manual reminder trigger
  const triggerRemindersMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/trigger-reminders', {
        method: 'POST'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Reminders Triggered',
        description: 'Manual reminder check initiated successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/court-reminders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notification-stats'] });
    }
  });

  const handleTestEmail = () => {
    if (!testEmail) return;
    setIsTestingEmail(true);
    testEmailMutation.mutate(testEmail);
    setTimeout(() => setIsTestingEmail(false), 3000);
  };

  const handleTestSMS = () => {
    if (!testPhone) return;
    setIsTestingSMS(true);
    testSMSMutation.mutate(testPhone);
    setTimeout(() => setIsTestingSMS(false), 3000);
  };

  const getReminderTypeColor = (type: string) => {
    switch (type) {
      case 'initial': return 'bg-blue-100 text-blue-800';
      case 'followup_1': return 'bg-yellow-100 text-yellow-800';
      case 'followup_2': return 'bg-orange-100 text-orange-800';
      case 'final': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReminderTypeLabel = (type: string) => {
    switch (type) {
      case 'initial': return '7 Days';
      case 'followup_1': return '3 Days';
      case 'followup_2': return '1 Day';
      case 'final': return 'Same Day';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Automated Court Reminders</h2>
          <p className="text-muted-foreground">
            Monitor and manage automated court date notification system
          </p>
        </div>
        <Button 
          onClick={() => triggerRemindersMutation.mutate()}
          disabled={triggerRemindersMutation.isPending}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${triggerRemindersMutation.isPending ? 'animate-spin' : ''}`} />
          Check Reminders Now
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reminders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.pendingReminders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Scheduled to send
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.sentReminders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Court Dates</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.upcomingCourtDates || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">
              Scheduler running
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reminders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reminders">Scheduled Reminders</TabsTrigger>
          <TabsTrigger value="court-dates">Upcoming Court Dates</TabsTrigger>
          <TabsTrigger value="testing">Notification Testing</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reminders</CardTitle>
              <CardDescription>
                All court date reminders scheduled for delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              {remindersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : !reminders || reminders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No scheduled reminders found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Court Date</TableHead>
                      <TableHead>Reminder Type</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reminders.map((reminder) => (
                      <TableRow key={reminder.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{reminder.client?.fullName}</div>
                            <div className="text-sm text-muted-foreground">
                              {reminder.client?.phoneNumber}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {reminder.courtDate?.courtDate && 
                                new Date(reminder.courtDate.courtDate).toLocaleDateString()
                              }
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {reminder.courtDate?.courtLocation}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getReminderTypeColor(reminder.reminderType)}>
                            {getReminderTypeLabel(reminder.reminderType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(reminder.scheduledTime).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {reminder.sent ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Sent
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="court-dates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Court Dates</CardTitle>
              <CardDescription>
                Court dates that will trigger reminder notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {datesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Court dates will be displayed here when available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Testing
                </CardTitle>
                <CardDescription>
                  Test email notification delivery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-email">Test Email Address</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleTestEmail}
                  disabled={!testEmail || isTestingEmail}
                  className="w-full"
                >
                  {isTestingEmail ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Test Email
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  SMS Testing
                </CardTitle>
                <CardDescription>
                  Test SMS notification delivery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-phone">Test Phone Number</Label>
                  <Input
                    id="test-phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleTestSMS}
                  disabled={!testPhone || isTestingSMS}
                  className="w-full"
                >
                  {isTestingSMS ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Test SMS
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Reminder Settings
              </CardTitle>
              <CardDescription>
                Configure automated reminder timing and delivery options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Bell className="h-4 w-4" />
                <AlertDescription>
                  <strong>Automated System Active:</strong> Court reminders are automatically 
                  scheduled and sent at 7 days, 3 days, 1 day, and same day before court dates.
                  The system checks for pending reminders every 30 minutes.
                </AlertDescription>
              </Alert>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Reminder Schedule</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Initial Reminder</Label>
                    <div className="text-sm text-muted-foreground">7 days before court date</div>
                  </div>
                  <div className="space-y-2">
                    <Label>First Follow-up</Label>
                    <div className="text-sm text-muted-foreground">3 days before court date</div>
                  </div>
                  <div className="space-y-2">
                    <Label>Second Follow-up</Label>
                    <div className="text-sm text-muted-foreground">1 day before court date</div>
                  </div>
                  <div className="space-y-2">
                    <Label>Final Reminder</Label>
                    <div className="text-sm text-muted-foreground">Same day as court date</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Delivery Methods</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Send court reminders via text message
                    </div>
                  </div>
                  <Switch checked={true} disabled />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Send court reminders via email (when available)
                    </div>
                  </div>
                  <Switch checked={true} disabled />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>In-App Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Display reminders in client portal
                    </div>
                  </div>
                  <Switch checked={true} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}