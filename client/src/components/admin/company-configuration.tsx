import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Save, Upload, Globe, Clock, Settings, Users, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CompanyConfiguration, InsertCompanyConfiguration } from "@shared/schema";
import { LogoUpload } from "@/components/admin/logo-upload";

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HST)" },
];

const BUSINESS_TYPES = [
  { value: "bail_bonds", label: "Bail Bonds" },
  { value: "surety", label: "Surety Services" },
  { value: "insurance", label: "Insurance Agency" },
  { value: "legal_services", label: "Legal Services" },
];

interface CompanyConfigurationManagerProps {
  companyId?: number;
}

export function CompanyConfigurationManager({ companyId }: CompanyConfigurationManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch company configuration
  const { data: companyConfig, isLoading } = useQuery<CompanyConfiguration>({
    queryKey: ["/api/admin/company-configuration", companyId],
    enabled: !!companyId,
  });

  // Company configuration form
  const [configForm, setConfigForm] = useState<Partial<InsertCompanyConfiguration>>({
    companyName: "",
    licenseNumber: "",
    state: "",
    address: "",
    city: "",
    zipCode: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    timezone: "America/New_York",
    businessType: "bail_bonds",
    operatingHours: {
      monday: { open: "08:00", close: "18:00", isOpen: true },
      tuesday: { open: "08:00", close: "18:00", isOpen: true },
      wednesday: { open: "08:00", close: "18:00", isOpen: true },
      thursday: { open: "08:00", close: "18:00", isOpen: true },
      friday: { open: "08:00", close: "18:00", isOpen: true },
      saturday: { open: "09:00", close: "17:00", isOpen: true },
      sunday: { open: "10:00", close: "16:00", isOpen: false }
    },
    customSettings: {
      branding: {
        primaryColor: "#2563eb",
        secondaryColor: "#64748b",
        logoUrl: "",
        favicon: ""
      },
      features: {
        courtDateReminders: true,
        smsNotifications: true,
        emailNotifications: true,
        automaticReporting: true,
        clientPortal: true,
        paymentPlans: true
      },
      compliance: {
        dataRetention: 7,
        auditLogging: true,
        encryptionEnabled: true,
        backupFrequency: "daily"
      },
      integrations: {
        accounting: null,
        crm: null,
        payment: null,
        communication: null
      }
    },
    isActive: true
  });

  // Update form when data loads
  useState(() => {
    if (companyConfig) {
      setConfigForm(companyConfig);
    }
  }, [companyConfig]);

  // Mutations
  const createCompanyMutation = useMutation({
    mutationFn: (data: InsertCompanyConfiguration) =>
      apiRequest("POST", "/api/admin/company-configuration", data),
    onSuccess: () => {
      toast({ title: "Company Created", description: "Company configuration has been successfully created." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/company-configuration"] });
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: (data: Partial<InsertCompanyConfiguration>) =>
      apiRequest("PUT", `/api/admin/company-configuration/${companyId}`, data),
    onSuccess: () => {
      toast({ title: "Company Updated", description: "Company configuration has been successfully updated." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/company-configuration", companyId] });
    },
  });

  const handleSave = () => {
    if (!configForm.companyName || !configForm.licenseNumber || !configForm.state) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (companyId) {
      updateCompanyMutation.mutate(configForm);
    } else {
      createCompanyMutation.mutate(configForm as InsertCompanyConfiguration);
    }
  };

  const updateOperatingHours = (day: string, field: string, value: string | boolean) => {
    setConfigForm({
      ...configForm,
      operatingHours: {
        ...configForm.operatingHours,
        [day]: {
          ...configForm.operatingHours?.[day],
          [field]: value
        }
      }
    });
  };

  const updateCustomSettings = (category: string, field: string, value: any) => {
    setConfigForm({
      ...configForm,
      customSettings: {
        ...configForm.customSettings,
        [category]: {
          ...configForm.customSettings?.[category],
          [field]: value
        }
      }
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Company Configuration</h2>
          <p className="text-gray-600">Configure your company profile, branding, and system settings</p>
        </div>
        <Badge variant={companyConfig?.isActive ? "default" : "secondary"}>
          {companyConfig?.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="hours" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Hours
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>Basic company details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={configForm.companyName}
                    onChange={(e) => setConfigForm({ ...configForm, companyName: e.target.value })}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="licenseNumber">License Number *</Label>
                  <Input
                    id="licenseNumber"
                    value={configForm.licenseNumber}
                    onChange={(e) => setConfigForm({ ...configForm, licenseNumber: e.target.value })}
                    placeholder="Enter license number"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Business Address *</Label>
                <Input
                  id="address"
                  value={configForm.address}
                  onChange={(e) => setConfigForm({ ...configForm, address: e.target.value })}
                  placeholder="Enter business address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={configForm.city}
                    onChange={(e) => setConfigForm({ ...configForm, city: e.target.value })}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={configForm.state}
                    onChange={(e) => setConfigForm({ ...configForm, state: e.target.value })}
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={configForm.zipCode}
                    onChange={(e) => setConfigForm({ ...configForm, zipCode: e.target.value })}
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={configForm.phone}
                    onChange={(e) => setConfigForm({ ...configForm, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={configForm.email}
                    onChange={(e) => setConfigForm({ ...configForm, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={configForm.website}
                    onChange={(e) => setConfigForm({ ...configForm, website: e.target.value })}
                    placeholder="Enter website URL"
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={configForm.timezone}
                    onValueChange={(value) => setConfigForm({ ...configForm, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="businessType">Business Type</Label>
                <Select
                  value={configForm.businessType}
                  onValueChange={(value) => setConfigForm({ ...configForm, businessType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={configForm.description}
                  onChange={(e) => setConfigForm({ ...configForm, description: e.target.value })}
                  placeholder="Describe your business"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Branding & Appearance
              </CardTitle>
              <CardDescription>Customize your company's visual identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={configForm.customSettings?.branding?.primaryColor || "#2563eb"}
                      onChange={(e) => updateCustomSettings("branding", "primaryColor", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={configForm.customSettings?.branding?.primaryColor || "#2563eb"}
                      onChange={(e) => updateCustomSettings("branding", "primaryColor", e.target.value)}
                      placeholder="#2563eb"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={configForm.customSettings?.branding?.secondaryColor || "#64748b"}
                      onChange={(e) => updateCustomSettings("branding", "secondaryColor", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={configForm.customSettings?.branding?.secondaryColor || "#64748b"}
                      onChange={(e) => updateCustomSettings("branding", "secondaryColor", e.target.value)}
                      placeholder="#64748b"
                    />
                  </div>
                </div>
              </div>

              <LogoUpload
                logoUrl={configForm.customSettings?.branding?.logoUrl || ""}
                onLogoChange={(url) => updateCustomSettings("branding", "logoUrl", url)}
                companyName={configForm.companyName}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Operating Hours
              </CardTitle>
              <CardDescription>Set your business operating hours for each day</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(configForm.operatingHours || {}).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-24">
                      <span className="font-medium capitalize">{day}</span>
                    </div>
                    <Switch
                      checked={hours.isOpen}
                      onCheckedChange={(checked) => updateOperatingHours(day, "isOpen", checked)}
                    />
                  </div>
                  {hours.isOpen ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={hours.open}
                        onChange={(e) => updateOperatingHours(day, "open", e.target.value)}
                        className="w-32"
                      />
                      <span>to</span>
                      <Input
                        type="time"
                        value={hours.close}
                        onChange={(e) => updateOperatingHours(day, "close", e.target.value)}
                        className="w-32"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-500">Closed</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Features
              </CardTitle>
              <CardDescription>Enable or disable system features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(configForm.customSettings?.features || {}).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <p className="text-sm text-gray-600">
                      {getFeatureDescription(feature)}
                    </p>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => updateCustomSettings("features", feature, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Compliance & Security
              </CardTitle>
              <CardDescription>Configure compliance and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dataRetention">Data Retention (years)</Label>
                <Input
                  id="dataRetention"
                  type="number"
                  min="1"
                  max="20"
                  value={configForm.customSettings?.compliance?.dataRetention || 7}
                  onChange={(e) => updateCustomSettings("compliance", "dataRetention", parseInt(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-medium">Audit Logging</span>
                  <p className="text-sm text-gray-600">Log all system activities for compliance</p>
                </div>
                <Switch
                  checked={configForm.customSettings?.compliance?.auditLogging || false}
                  onCheckedChange={(checked) => updateCustomSettings("compliance", "auditLogging", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-medium">Encryption Enabled</span>
                  <p className="text-sm text-gray-600">Encrypt sensitive data at rest</p>
                </div>
                <Switch
                  checked={configForm.customSettings?.compliance?.encryptionEnabled || false}
                  onCheckedChange={(checked) => updateCustomSettings("compliance", "encryptionEnabled", checked)}
                />
              </div>

              <div>
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Select
                  value={configForm.customSettings?.compliance?.backupFrequency || "daily"}
                  onValueChange={(value) => updateCustomSettings("compliance", "backupFrequency", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={createCompanyMutation.isPending || updateCompanyMutation.isPending}
          className="flex-1"
        >
          <Save className="h-4 w-4 mr-2" />
          {companyId ? "Update Configuration" : "Create Configuration"}
        </Button>
      </div>
    </div>
  );
}

function getFeatureDescription(feature: string): string {
  const descriptions: Record<string, string> = {
    courtDateReminders: "Automatically send reminders for upcoming court dates",
    smsNotifications: "Send SMS notifications to clients and staff",
    emailNotifications: "Send email notifications for important events",
    automaticReporting: "Generate compliance reports automatically",
    clientPortal: "Provide clients with self-service portal access",
    paymentPlans: "Allow clients to set up payment plans for bonds"
  };
  return descriptions[feature] || "Feature configuration option";
}