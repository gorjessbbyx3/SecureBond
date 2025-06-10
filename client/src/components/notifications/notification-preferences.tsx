import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Bell, Mail, Smartphone, Clock, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface NotificationPreferencesData {
  id?: number;
  userId: string;
  emailEnabled: boolean;
  courtRemindersEmail: boolean;
  paymentDueEmail: boolean;
  arrestAlertsEmail: boolean;
  bondExpiringEmail: boolean;
  inAppEnabled: boolean;
  courtRemindersInApp: boolean;
  paymentDueInApp: boolean;
  arrestAlertsInApp: boolean;
  bondExpiringInApp: boolean;
  courtReminderDays: number;
  paymentReminderDays: number;
  bondExpiringDays: number;
  soundEnabled: boolean;
  desktopNotifications: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

interface NotificationPreferencesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function NotificationPreferences({ open, onOpenChange, userId }: NotificationPreferencesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['/api/notification-preferences', userId],
    enabled: open,
  });

  const [formData, setFormData] = useState<NotificationPreferencesData>({
    userId,
    emailEnabled: true,
    courtRemindersEmail: true,
    paymentDueEmail: true,
    arrestAlertsEmail: true,
    bondExpiringEmail: true,
    inAppEnabled: true,
    courtRemindersInApp: true,
    paymentDueInApp: true,
    arrestAlertsInApp: true,
    bondExpiringInApp: true,
    courtReminderDays: 3,
    paymentReminderDays: 7,
    bondExpiringDays: 30,
    soundEnabled: true,
    desktopNotifications: false,
    quietHoursEnabled: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
  });

  // Update form data when preferences load
  useEffect(() => {
    if (preferences) {
      setFormData(prev => ({ ...prev, ...preferences }));
    }
  }, [preferences]);

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: NotificationPreferencesData) => {
      const response = await fetch('/api/notification-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notification-preferences'] });
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updatePreferencesMutation.mutate(formData);
  };

  const updateField = (field: keyof NotificationPreferencesData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Configure which notifications you want to receive via email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-enabled" className="text-sm font-medium">
                  Enable Email Notifications
                </Label>
                <Switch
                  id="email-enabled"
                  checked={formData.emailEnabled}
                  onCheckedChange={(checked) => updateField('emailEnabled', checked)}
                />
              </div>

              {formData.emailEnabled && (
                <div className="space-y-3 pl-4 border-l-2 border-muted">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Court Date Reminders</Label>
                    <Switch
                      checked={formData.courtRemindersEmail}
                      onCheckedChange={(checked) => updateField('courtRemindersEmail', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Payment Due Alerts</Label>
                    <Switch
                      checked={formData.paymentDueEmail}
                      onCheckedChange={(checked) => updateField('paymentDueEmail', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Arrest Notifications</Label>
                    <Switch
                      checked={formData.arrestAlertsEmail}
                      onCheckedChange={(checked) => updateField('arrestAlertsEmail', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Bond Expiring Alerts</Label>
                    <Switch
                      checked={formData.bondExpiringEmail}
                      onCheckedChange={(checked) => updateField('bondExpiringEmail', checked)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* In-App Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                In-App Notifications
              </CardTitle>
              <CardDescription>
                Configure which notifications appear in the notification center
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="inapp-enabled" className="text-sm font-medium">
                  Enable In-App Notifications
                </Label>
                <Switch
                  id="inapp-enabled"
                  checked={formData.inAppEnabled}
                  onCheckedChange={(checked) => updateField('inAppEnabled', checked)}
                />
              </div>

              {formData.inAppEnabled && (
                <div className="space-y-3 pl-4 border-l-2 border-muted">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Court Date Reminders</Label>
                    <Switch
                      checked={formData.courtRemindersInApp}
                      onCheckedChange={(checked) => updateField('courtRemindersInApp', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Payment Due Alerts</Label>
                    <Switch
                      checked={formData.paymentDueInApp}
                      onCheckedChange={(checked) => updateField('paymentDueInApp', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Arrest Notifications</Label>
                    <Switch
                      checked={formData.arrestAlertsInApp}
                      onCheckedChange={(checked) => updateField('arrestAlertsInApp', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Bond Expiring Alerts</Label>
                    <Switch
                      checked={formData.bondExpiringInApp}
                      onCheckedChange={(checked) => updateField('bondExpiringInApp', checked)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timing Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timing Preferences
              </CardTitle>
              <CardDescription>
                Configure when you want to receive advance notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Court Reminder</Label>
                  <Select 
                    value={formData.courtReminderDays.toString()} 
                    onValueChange={(value) => updateField('courtReminderDays', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day before</SelectItem>
                      <SelectItem value="2">2 days before</SelectItem>
                      <SelectItem value="3">3 days before</SelectItem>
                      <SelectItem value="7">1 week before</SelectItem>
                      <SelectItem value="14">2 weeks before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Payment Reminder</Label>
                  <Select 
                    value={formData.paymentReminderDays.toString()} 
                    onValueChange={(value) => updateField('paymentReminderDays', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day before</SelectItem>
                      <SelectItem value="3">3 days before</SelectItem>
                      <SelectItem value="7">1 week before</SelectItem>
                      <SelectItem value="14">2 weeks before</SelectItem>
                      <SelectItem value="30">1 month before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Bond Expiring</Label>
                  <Select 
                    value={formData.bondExpiringDays.toString()} 
                    onValueChange={(value) => updateField('bondExpiringDays', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">1 week before</SelectItem>
                      <SelectItem value="14">2 weeks before</SelectItem>
                      <SelectItem value="30">1 month before</SelectItem>
                      <SelectItem value="60">2 months before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sound & Visual Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Sound & Visual Preferences
              </CardTitle>
              <CardDescription>
                Configure audio and visual notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-enabled" className="text-sm font-medium">
                  Enable Notification Sounds
                </Label>
                <Switch
                  id="sound-enabled"
                  checked={formData.soundEnabled}
                  onCheckedChange={(checked) => updateField('soundEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="desktop-notifications" className="text-sm font-medium">
                  Enable Desktop Notifications
                  <Badge variant="secondary" className="ml-2 text-xs">Browser Permission Required</Badge>
                </Label>
                <Switch
                  id="desktop-notifications"
                  checked={formData.desktopNotifications}
                  onCheckedChange={(checked) => updateField('desktopNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="quiet-hours" className="text-sm font-medium">
                    Enable Quiet Hours
                  </Label>
                  <Switch
                    id="quiet-hours"
                    checked={formData.quietHoursEnabled}
                    onCheckedChange={(checked) => updateField('quietHoursEnabled', checked)}
                  />
                </div>

                {formData.quietHoursEnabled && (
                  <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-muted">
                    <div className="space-y-2">
                      <Label className="text-sm">Quiet Hours Start</Label>
                      <Input
                        type="time"
                        value={formData.quietHoursStart}
                        onChange={(e) => updateField('quietHoursStart', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Quiet Hours End</Label>
                      <Input
                        type="time"
                        value={formData.quietHoursEnd}
                        onChange={(e) => updateField('quietHoursEnd', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={updatePreferencesMutation.isPending}
            >
              {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}