import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Database, Mail, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SystemConfiguration() {
  const [systemConfig, setSystemConfig] = useState({
    storage: {
      type: "local",
      backupEnabled: true,
      retentionDays: 30
    },
    email: {
      provider: "sendgrid",
      enabled: false
    },
    security: {
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      requireMFA: false
    },
    features: {
      courtReminders: true,
      arrestMonitoring: true,
      paymentProcessing: true,
      documentGeneration: true
    }
  });

  const { toast } = useToast();

  const handleSaveConfig = () => {
    toast({
      title: "Configuration Saved",
      description: "System configuration has been updated successfully.",
    });
  };

  const updateConfig = (section: string, field: string, value: any) => {
    setSystemConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Configuration</h2>
          <p className="text-gray-600">Configure system settings and preferences</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Local Storage Active
        </Badge>
      </div>

      <Tabs defaultValue="storage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Storage Configuration
              </CardTitle>
              <CardDescription>Manage data storage and backup settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Local File Storage Active</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Your system is configured to use secure local file storage for optimal performance and data control.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Storage Type</Label>
                  <div className="mt-2">
                    <Badge variant="default" className="bg-blue-600">
                      Local File System
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Secure, high-performance local storage
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatic Backups</Label>
                    <p className="text-xs text-gray-500">Create daily data backups</p>
                  </div>
                  <Switch
                    checked={systemConfig.storage.backupEnabled}
                    onCheckedChange={(checked) => updateConfig("storage", "backupEnabled", checked)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="retentionDays">Backup Retention (Days)</Label>
                <Input
                  id="retentionDays"
                  type="number"
                  value={systemConfig.storage.retentionDays}
                  onChange={(e) => updateConfig("storage", "retentionDays", parseInt(e.target.value))}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of days to keep backup files
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>Configure email notifications and delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-gray-500">Enable email delivery for notifications</p>
                </div>
                <Switch
                  checked={systemConfig.email.enabled}
                  onCheckedChange={(checked) => updateConfig("email", "enabled", checked)}
                />
              </div>

              {systemConfig.email.enabled && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Email Configuration Required</h4>
                      <p className="text-sm text-yellow-800 mt-1">
                        To enable email notifications, configure your SendGrid API key in the environment settings.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label>Email Provider</Label>
                <div className="mt-2">
                  <Badge variant="outline">SendGrid</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Reliable email delivery service
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (Hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={systemConfig.security.sessionTimeout}
                    onChange={(e) => updateConfig("security", "sessionTimeout", parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={systemConfig.security.maxLoginAttempts}
                    onChange={(e) => updateConfig("security", "maxLoginAttempts", parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Multi-Factor Authentication</Label>
                  <p className="text-xs text-gray-500">Require MFA for admin accounts</p>
                </div>
                <Switch
                  checked={systemConfig.security.requireMFA}
                  onCheckedChange={(checked) => updateConfig("security", "requireMFA", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Feature Configuration
              </CardTitle>
              <CardDescription>Enable or disable system features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Court Reminders</Label>
                    <p className="text-xs text-gray-500">Automated court date notifications</p>
                  </div>
                  <Switch
                    checked={systemConfig.features.courtReminders}
                    onCheckedChange={(checked) => updateConfig("features", "courtReminders", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Arrest Monitoring</Label>
                    <p className="text-xs text-gray-500">Monitor arrest logs for clients</p>
                  </div>
                  <Switch
                    checked={systemConfig.features.arrestMonitoring}
                    onCheckedChange={(checked) => updateConfig("features", "arrestMonitoring", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Payment Processing</Label>
                    <p className="text-xs text-gray-500">Accept and track payments</p>
                  </div>
                  <Switch
                    checked={systemConfig.features.paymentProcessing}
                    onCheckedChange={(checked) => updateConfig("features", "paymentProcessing", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Document Generation</Label>
                    <p className="text-xs text-gray-500">Generate legal documents</p>
                  </div>
                  <Switch
                    checked={systemConfig.features.documentGeneration}
                    onCheckedChange={(checked) => updateConfig("features", "documentGeneration", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveConfig} className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
}