import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings, 
  Key, 
  Users, 
  Shield, 
  Eye, 
  EyeOff, 
  Save, 
  UserPlus,
  Edit3,
  Trash2
} from "lucide-react";

interface AdminSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StaffMember {
  id: string;
  username: string;
  role: "admin" | "staff";
  lastLogin?: string;
  isActive: boolean;
}

export default function AdminSettings({ isOpen, onClose }: AdminSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [newStaffUsername, setNewStaffUsername] = useState("");
  const [newStaffPassword, setNewStaffPassword] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<"admin" | "staff">("staff");
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Fetch current admin info
  const { data: adminCredentials } = useQuery({
    queryKey: ["/api/admin/credentials"],
    enabled: isOpen,
  });

  // Fetch staff members
  const { data: staffMembers } = useQuery({
    queryKey: ["/api/admin/staff"],
    enabled: isOpen,
  });

  // Change admin password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await apiRequest("PUT", "/api/admin/password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "Your admin password has been changed successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  // Create staff member mutation
  const createStaffMutation = useMutation({
    mutationFn: async (data: { username: string; password: string; role: string }) => {
      const response = await apiRequest("POST", "/api/admin/staff", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Staff Member Created",
        description: "New staff member has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
      setNewStaffUsername("");
      setNewStaffPassword("");
      setNewStaffRole("staff");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Staff",
        description: error.message || "Failed to create staff member",
        variant: "destructive",
      });
    },
  });

  // Update staff password mutation
  const updateStaffPasswordMutation = useMutation({
    mutationFn: async (data: { staffId: string; newPassword: string }) => {
      const response = await apiRequest("PUT", `/api/admin/staff/${data.staffId}/password`, {
        password: data.newPassword
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "Staff member password has been changed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
    },
    onError: (error: any) => {
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to change staff password",
        variant: "destructive",
      });
    },
  });

  // Delete staff member mutation
  const deleteStaffMutation = useMutation({
    mutationFn: async (staffId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/staff/${staffId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Staff Member Removed",
        description: "Staff member has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete staff member",
        variant: "destructive",
      });
    },
  });

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Validation Error",
        description: "New password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  const handleCreateStaff = () => {
    if (!newStaffUsername || !newStaffPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in username and password",
        variant: "destructive",
      });
      return;
    }

    if (newStaffPassword.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    createStaffMutation.mutate({
      username: newStaffUsername,
      password: newStaffPassword,
      role: newStaffRole,
    });
  };

  const handleChangeStaffPassword = (staffMember: StaffMember) => {
    const newPassword = prompt(`Enter new password for ${staffMember.username}:`);
    if (newPassword && newPassword.length >= 6) {
      updateStaffPasswordMutation.mutate({
        staffId: staffMember.id,
        newPassword,
      });
    } else if (newPassword) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStaff = (staffMember: StaffMember) => {
    if (confirm(`Are you sure you want to delete staff member "${staffMember.username}"? This action cannot be undone.`)) {
      deleteStaffMutation.mutate(staffMember.id);
    }
  };

  const staff = (staffMembers as StaffMember[]) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Admin Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Admin Password
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Staff Management
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Settings
            </TabsTrigger>
          </TabsList>

          {/* Admin Password Tab */}
          <TabsContent value="password" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Admin Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={changePasswordMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
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
                  <UserPlus className="w-5 h-5" />
                  Add New Staff Member
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="staffUsername">Username</Label>
                    <Input
                      id="staffUsername"
                      value={newStaffUsername}
                      onChange={(e) => setNewStaffUsername(e.target.value)}
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staffPassword">Password</Label>
                    <Input
                      id="staffPassword"
                      type="password"
                      value={newStaffPassword}
                      onChange={(e) => setNewStaffPassword(e.target.value)}
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staffRole">Role</Label>
                    <select
                      id="staffRole"
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value as "admin" | "staff")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleCreateStaff}
                    disabled={createStaffMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    {createStaffMutation.isPending ? "Creating..." : "Add Staff Member"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Existing Staff */}
            <Card>
              <CardHeader>
                <CardTitle>Existing Staff Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staff.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{member.username}</span>
                            <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                              {member.role}
                            </Badge>
                            {member.isActive && (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                Active
                              </Badge>
                            )}
                          </div>
                          {member.lastLogin && (
                            <p className="text-sm text-gray-500">
                              Last login: {new Date(member.lastLogin).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChangeStaffPassword(member)}
                          disabled={updateStaffPasswordMutation.isPending}
                        >
                          <Key className="w-4 h-4 mr-1" />
                          Change Password
                        </Button>
                        {member.id !== "admin" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteStaff(member)}
                            disabled={deleteStaffMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Session Timeout</h4>
                      <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                    </div>
                    <Badge variant="outline">30 minutes</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Enhanced security for admin accounts</p>
                    </div>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Login Notifications</h4>
                      <p className="text-sm text-gray-500">Email alerts for admin logins</p>
                    </div>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}