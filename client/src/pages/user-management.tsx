import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Copy, Eye, EyeOff, Plus, UserPlus, Users, Shield, Key, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Staff {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

interface Client {
  id: number;
  clientId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  accountStatus: string;
  lastLogin: string;
  isActive: boolean;
  createdAt: string;
}

interface UserCredential {
  id: number;
  username: string;
  credentialType: string;
  isActive: boolean;
  passwordResetRequired: boolean;
  lastLogin: string;
  createdAt: string;
}

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState("staff");
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showCredentials, setShowCredentials] = useState<Record<number, boolean>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Staff queries and mutations
  const { data: staff = [], isLoading: loadingStaff } = useQuery({
    queryKey: ["/api/admin/staff"],
  });

  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ["/api/admin/clients"],
  });

  const { data: credentials = [], isLoading: loadingCredentials } = useQuery({
    queryKey: ["/api/admin/user-credentials"],
  });

  const createStaffMutation = useMutation({
    mutationFn: async (staffData: any) => {
      return await apiRequest("/api/admin/staff", {
        method: "POST",
        body: JSON.stringify(staffData),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-credentials"] });
      setShowStaffForm(false);
      toast({
        title: "Staff Member Created",
        description: `${data.staff.firstName} ${data.staff.lastName} has been added with credentials.`,
      });
      
      // Show credentials to admin
      toast({
        title: "Account Credentials Generated",
        description: `Username: ${data.credentials.username} | Temp Password: ${data.credentials.temporaryPassword}`,
        duration: 10000,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create staff member",
        variant: "destructive",
      });
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (clientData: any) => {
      return await apiRequest("/api/admin/clients", {
        method: "POST",
        body: JSON.stringify(clientData),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-credentials"] });
      setShowClientForm(false);
      toast({
        title: "Client Created",
        description: `${data.client.fullName} has been added with portal access.`,
      });
      
      // Show credentials to admin
      toast({
        title: "Client Portal Access Created",
        description: `Client ID: ${data.credentials.clientId} | Username: ${data.credentials.username} | Temp Password: ${data.credentials.temporaryPassword}`,
        duration: 10000,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (username: string) => {
      return await apiRequest("/api/admin/reset-password", {
        method: "POST",
        body: JSON.stringify({ username }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-credentials"] });
      toast({
        title: "Password Reset",
        description: `New temporary password: ${data.temporaryPassword}`,
        duration: 10000,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reset password",
        variant: "destructive",
      });
    },
  });

  const handleStaffSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const staffData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      position: formData.get("position"),
      department: formData.get("department"),
      phone: formData.get("phone"),
      hireDate: formData.get("hireDate"),
      salary: formData.get("salary") ? parseFloat(formData.get("salary") as string) : undefined,
      notes: formData.get("notes"),
    };
    createStaffMutation.mutate(staffData);
  };

  const handleClientSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const clientData = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phoneNumber: formData.get("phoneNumber"),
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
      zipCode: formData.get("zipCode"),
      dateOfBirth: formData.get("dateOfBirth"),
      emergencyContact: formData.get("emergencyContact"),
      emergencyPhone: formData.get("emergencyPhone"),
    };
    createClientMutation.mutate(clientData);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const toggleCredentialVisibility = (id: number) => {
    setShowCredentials(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-gray-600">Create and manage staff accounts and client portal access</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Staff Management
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Client Management
          </TabsTrigger>
          <TabsTrigger value="credentials" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            User Credentials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Staff Members</h2>
            <Dialog open={showStaffForm} onOpenChange={setShowStaffForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Staff Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Staff Member</DialogTitle>
                  <DialogDescription>
                    Add a new staff member and generate their login credentials
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleStaffSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" name="firstName" required />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" name="lastName" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Select name="position" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="agent">Bail Agent</SelectItem>
                          <SelectItem value="receptionist">Receptionist</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Select name="department">
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operations">Operations</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="administration">Administration</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" />
                    </div>
                    <div>
                      <Label htmlFor="hireDate">Hire Date</Label>
                      <Input id="hireDate" name="hireDate" type="date" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="salary">Salary (Optional)</Label>
                    <Input id="salary" name="salary" type="number" step="0.01" />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" name="notes" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowStaffForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createStaffMutation.isPending}>
                      Create Staff Member
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingStaff ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : staff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No staff members found</TableCell>
                    </TableRow>
                  ) : (
                    staff.map((member: Staff) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-mono">{member.employeeId}</TableCell>
                        <TableCell>{member.firstName} {member.lastName}</TableCell>
                        <TableCell>{member.position}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Badge variant={member.isActive ? "default" : "secondary"}>
                            {member.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(member.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Clients</h2>
            <Dialog open={showClientForm} onOpenChange={setShowClientForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Client</DialogTitle>
                  <DialogDescription>
                    Add a new client and generate their portal access credentials
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleClientSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input id="phoneNumber" name="phoneNumber" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" name="state" />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input id="zipCode" name="zipCode" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input id="dateOfBirth" name="dateOfBirth" type="date" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input id="emergencyContact" name="emergencyContact" />
                    </div>
                    <div>
                      <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                      <Input id="emergencyPhone" name="emergencyPhone" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowClientForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createClientMutation.isPending}>
                      Create Client
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingClients ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : clients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No clients found</TableCell>
                    </TableRow>
                  ) : (
                    clients.map((client: Client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-mono">{client.clientId}</TableCell>
                        <TableCell>{client.fullName}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.phoneNumber}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              client.accountStatus === "active" ? "default" :
                              client.accountStatus === "pending" ? "secondary" : "destructive"
                            }
                          >
                            {client.accountStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {client.lastLogin ? new Date(client.lastLogin).toLocaleDateString() : "Never"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credentials" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">User Credentials</h2>
            <p className="text-sm text-gray-600">Manage user access and passwords</p>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Password Reset Required</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingCredentials ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : credentials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No credentials found</TableCell>
                    </TableRow>
                  ) : (
                    credentials.map((credential: UserCredential) => (
                      <TableRow key={credential.id}>
                        <TableCell className="font-mono">{credential.username}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {credential.credentialType.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={credential.isActive ? "default" : "secondary"}>
                            {credential.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={credential.passwordResetRequired ? "destructive" : "default"}>
                            {credential.passwordResetRequired ? "Required" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {credential.lastLogin ? new Date(credential.lastLogin).toLocaleDateString() : "Never"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resetPasswordMutation.mutate(credential.username)}
                              disabled={resetPasswordMutation.isPending}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(credential.username)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}