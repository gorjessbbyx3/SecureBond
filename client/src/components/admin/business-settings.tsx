import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Building2, 
  Users, 
  Target, 
  Settings, 
  Shield, 
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Camera,
  Upload,
  Save,
  Plus,
  Trash2,
  Edit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface BusinessProfile {
  companyName: string;
  licenseNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  description: string;
  operatingHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
}

interface BusinessGoals {
  annualRevenueTarget: number;
  clientGrowthTarget: number;
  retentionRateTarget: number;
  profitMarginTarget: number;
  bondVolumeTarget: number;
  complianceRateTarget: number;
}

interface StaffMember {
  id: number;
  fullName: string;
  email: string;
  role: 'admin' | 'staff' | 'manager';
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

export function BusinessSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    companyName: "SecureBond Services",
    licenseNumber: "BB-2024-001",
    address: "123 Business Center Dr",
    city: "Honolulu",
    state: "Hawaii",
    zipCode: "96813",
    phone: "(808) 555-0123",
    email: "admin@securebond.com",
    website: "www.securebond.com",
    logo: "",
    description: "Professional bail bond services with advanced technology solutions",
    operatingHours: {
      monday: { open: "08:00", close: "18:00", isOpen: true },
      tuesday: { open: "08:00", close: "18:00", isOpen: true },
      wednesday: { open: "08:00", close: "18:00", isOpen: true },
      thursday: { open: "08:00", close: "18:00", isOpen: true },
      friday: { open: "08:00", close: "18:00", isOpen: true },
      saturday: { open: "09:00", close: "17:00", isOpen: true },
      sunday: { open: "10:00", close: "16:00", isOpen: false }
    }
  });

  const [businessGoals, setBusinessGoals] = useState<BusinessGoals>({
    annualRevenueTarget: 2500000,
    clientGrowthTarget: 150,
    retentionRateTarget: 95,
    profitMarginTarget: 75,
    bondVolumeTarget: 500,
    complianceRateTarget: 98
  });

  const [newStaffMember, setNewStaffMember] = useState({
    fullName: "",
    email: "",
    role: "staff" as const,
    permissions: [] as string[]
  });

  const { data: staffMembers = [] } = useQuery<StaffMember[]>({
    queryKey: ["/api/admin/staff"],
  });

  const saveBusinessProfileMutation = useMutation({
    mutationFn: (data: BusinessProfile) => 
      apiRequest("PUT", "/api/admin/business-profile", data),
    onSuccess: () => {
      toast({
        title: "Business Profile Updated",
        description: "Your business profile has been successfully updated.",
      });
    },
  });

  const saveBusinessGoalsMutation = useMutation({
    mutationFn: (data: BusinessGoals) => 
      apiRequest("PUT", "/api/admin/business-goals", data),
    onSuccess: () => {
      toast({
        title: "Business Goals Updated",
        description: "Your business goals have been successfully updated.",
      });
    },
  });

  const createStaffMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest("POST", "/api/admin/staff", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
      setNewStaffMember({ fullName: "", email: "", role: "staff", permissions: [] });
      toast({
        title: "Staff Member Created",
        description: "New staff member has been successfully created.",
      });
    },
  });

  const updateStaffMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PUT", `/api/admin/staff/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
      toast({
        title: "Staff Member Updated",
        description: "Staff member has been successfully updated.",
      });
    },
  });

  const handleSaveProfile = () => {
    saveBusinessProfileMutation.mutate(businessProfile);
  };

  const handleSaveGoals = () => {
    saveBusinessGoalsMutation.mutate(businessGoals);
  };

  const handleCreateStaff = () => {
    if (!newStaffMember.fullName || !newStaffMember.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createStaffMutation.mutate(newStaffMember);
  };

  const handleToggleStaffActive = (staff: StaffMember) => {
    updateStaffMutation.mutate({
      id: staff.id,
      data: { ...staff, isActive: !staff.isActive }
    });
  };

  const availablePermissions = [
    { id: "client_view", label: "View Clients" },
    { id: "client_edit", label: "Edit Clients" },
    { id: "payments_view", label: "View Payments" },
    { id: "payments_edit", label: "Process Payments" },
    { id: "court_dates", label: "Manage Court Dates" },
    { id: "alerts", label: "Manage Alerts" },
    { id: "reports", label: "Generate Reports" },
    { id: "system_settings", label: "System Settings" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business Settings & Configuration</h2>
          <p className="text-gray-600">Manage your business profile, goals, and staff accounts</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Admin Configuration
        </Badge>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Business Profile
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Business Goals
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Staff Management
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System Config
          </TabsTrigger>
        </TabsList>

        {/* Business Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={businessProfile.companyName}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="licenseNumber">License Number *</Label>
                  <Input
                    id="licenseNumber"
                    value={businessProfile.licenseNumber}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, licenseNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={businessProfile.phone}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={businessProfile.email}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Business Address *</Label>
                <Input
                  id="address"
                  value={businessProfile.address}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={businessProfile.city}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={businessProfile.state}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, state: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={businessProfile.zipCode}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, zipCode: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={businessProfile.description}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveProfile} disabled={saveBusinessProfileMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {saveBusinessProfileMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Operating Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(businessProfile.operatingHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-24 capitalize font-medium">{day}</div>
                    <Switch
                      checked={hours.isOpen}
                      onCheckedChange={(checked) => 
                        setBusinessProfile({
                          ...businessProfile,
                          operatingHours: {
                            ...businessProfile.operatingHours,
                            [day]: { ...hours, isOpen: checked }
                          }
                        })
                      }
                    />
                    {hours.isOpen ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) => 
                            setBusinessProfile({
                              ...businessProfile,
                              operatingHours: {
                                ...businessProfile.operatingHours,
                                [day]: { ...hours, open: e.target.value }
                              }
                            })
                          }
                          className="w-32"
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) => 
                            setBusinessProfile({
                              ...businessProfile,
                              operatingHours: {
                                ...businessProfile.operatingHours,
                                [day]: { ...hours, close: e.target.value }
                              }
                            })
                          }
                          className="w-32"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-500">Closed</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Annual Business Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="revenueTarget">Annual Revenue Target</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="revenueTarget"
                      type="number"
                      value={businessGoals.annualRevenueTarget}
                      onChange={(e) => setBusinessGoals({ ...businessGoals, annualRevenueTarget: parseInt(e.target.value) || 0 })}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="clientGrowth">New Clients Target</Label>
                  <Input
                    id="clientGrowth"
                    type="number"
                    value={businessGoals.clientGrowthTarget}
                    onChange={(e) => setBusinessGoals({ ...businessGoals, clientGrowthTarget: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="retentionRate">Client Retention Rate (%)</Label>
                  <Input
                    id="retentionRate"
                    type="number"
                    min="0"
                    max="100"
                    value={businessGoals.retentionRateTarget}
                    onChange={(e) => setBusinessGoals({ ...businessGoals, retentionRateTarget: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="profitMargin">Profit Margin Target (%)</Label>
                  <Input
                    id="profitMargin"
                    type="number"
                    min="0"
                    max="100"
                    value={businessGoals.profitMarginTarget}
                    onChange={(e) => setBusinessGoals({ ...businessGoals, profitMarginTarget: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="bondVolume">Annual Bond Volume</Label>
                  <Input
                    id="bondVolume"
                    type="number"
                    value={businessGoals.bondVolumeTarget}
                    onChange={(e) => setBusinessGoals({ ...businessGoals, bondVolumeTarget: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="complianceRate">Compliance Rate Target (%)</Label>
                  <Input
                    id="complianceRate"
                    type="number"
                    min="0"
                    max="100"
                    value={businessGoals.complianceRateTarget}
                    onChange={(e) => setBusinessGoals({ ...businessGoals, complianceRateTarget: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveGoals} disabled={saveBusinessGoalsMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {saveBusinessGoalsMutation.isPending ? "Saving..." : "Save Goals"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Management Tab */}
        <TabsContent value="staff" className="space-y-6">
          {/* Add New Staff */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Staff Member
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="staffName">Full Name *</Label>
                  <Input
                    id="staffName"
                    value={newStaffMember.fullName}
                    onChange={(e) => setNewStaffMember({ ...newStaffMember, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="staffEmail">Email Address *</Label>
                  <Input
                    id="staffEmail"
                    type="email"
                    value={newStaffMember.email}
                    onChange={(e) => setNewStaffMember({ ...newStaffMember, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="staffRole">Role *</Label>
                  <select
                    id="staffRole"
                    value={newStaffMember.role}
                    onChange={(e) => setNewStaffMember({ ...newStaffMember, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {availablePermissions.map((permission) => (
                    <label key={permission.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newStaffMember.permissions.includes(permission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewStaffMember({
                              ...newStaffMember,
                              permissions: [...newStaffMember.permissions, permission.id]
                            });
                          } else {
                            setNewStaffMember({
                              ...newStaffMember,
                              permissions: newStaffMember.permissions.filter(p => p !== permission.id)
                            });
                          }
                        }}
                      />
                      <span className="text-sm">{permission.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button onClick={handleCreateStaff} disabled={createStaffMutation.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                {createStaffMutation.isPending ? "Creating..." : "Create Staff Account"}
              </Button>
            </CardContent>
          </Card>

          {/* Existing Staff List */}
          <Card>
            <CardHeader>
              <CardTitle>Current Staff Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffMembers.map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium">{staff.fullName}</h4>
                          <p className="text-sm text-gray-600">{staff.email}</p>
                        </div>
                        <Badge variant={staff.role === 'admin' ? 'default' : 'secondary'}>
                          {staff.role}
                        </Badge>
                        <Badge variant={staff.isActive ? 'default' : 'destructive'}>
                          {staff.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">
                          Last login: {staff.lastLogin ? new Date(staff.lastLogin).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStaffActive(staff)}
                      >
                        {staff.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {staffMembers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No staff members found. Create your first staff account above.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Configuration Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Security Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                      <Switch id="twoFactor" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sessionTimeout">Auto-logout (minutes)</Label>
                      <Input type="number" value="30" className="w-20" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auditLogging">Audit Logging</Label>
                      <Switch id="auditLogging" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Notification Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailNotifs">Email Notifications</Label>
                      <Switch id="emailNotifs" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="smsNotifs">SMS Notifications</Label>
                      <Switch id="smsNotifs" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="courtReminders">Court Date Reminders</Label>
                      <Switch id="courtReminders" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-4">Data Backup & Recovery</h4>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Backup Data
                  </Button>
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Audit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}