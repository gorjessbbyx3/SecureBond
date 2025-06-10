import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Settings, 
  Key, 
  Copy, 
  User, 
  DollarSign, 
  Clock, 
  Calendar, 
  AlertTriangle,
  Eye
} from "lucide-react";

const clientFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  courtLocation: z.string().optional(),
  charges: z.string().optional(),
  isActive: z.boolean().default(true),
  missedCheckIns: z.number().default(0),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

interface Client {
  id: number;
  clientId: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  bondAmount: string;
  totalOwed?: string;
  downPayment?: string;
  remainingBalance?: string;
  courtDate?: string;
  courtLocation?: string;
  charges?: string;
  isActive: boolean;
  lastCheckIn?: string;
  missedCheckIns: number;
  createdAt: string;
}

export default function ClientManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ clientId: string; password: string } | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false);
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [clientCredentials, setClientCredentials] = useState<{ clientId: string; password: string } | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      address: "",
      dateOfBirth: "",
      emergencyContact: "",
      emergencyPhone: "",
      courtLocation: "",
      charges: "",
      isActive: true,
      missedCheckIns: 0,
    },
  });

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: adminCredentials } = useQuery({
    queryKey: ["/api/admin/credentials"],
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await apiRequest("/api/clients", "POST", data);
      return response;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setGeneratedCredentials({
        clientId: data.clientId,
        password: data.password
      });
      setIsFormOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Client created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create client",
        variant: "destructive",
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async (data: ClientFormData & { id: number }) => {
      const { id, ...updateData } = data;
      return await apiRequest(`/api/clients/${id}`, "PATCH", updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsFormOpen(false);
      setEditingClient(null);
      form.reset();
      toast({
        title: "Success",
        description: "Client updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update client",
        variant: "destructive",
      });
    },
  });

  const updateCredentialsMutation = useMutation({
    mutationFn: async (data: { role: string; username: string; password: string }) => {
      return await apiRequest("/api/admin/credentials", "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credentials"] });
      toast({
        title: "Success",
        description: "Credentials updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update credentials",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ClientFormData) => {
    if (editingClient) {
      updateClientMutation.mutate({ ...data, id: editingClient.id });
    } else {
      createClientMutation.mutate(data);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    form.reset({
      fullName: client.fullName,
      phoneNumber: client.phoneNumber || "",
      address: client.address || "",
      bondAmount: client.bondAmount,
      dateOfBirth: "",
      emergencyContact: "",
      emergencyPhone: "",
      courtLocation: client.courtLocation || "",
      charges: client.charges || "",
      isActive: client.isActive,
      missedCheckIns: client.missedCheckIns,
    });
    setIsFormOpen(true);
  };

  const handleViewCredentials = async (client: Client) => {
    try {
      const response = await apiRequest(`/api/clients/${client.id}/credentials`);
      setClientCredentials({
        clientId: response.clientId,
        password: response.password
      });
      setIsCredentialsDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch client credentials",
        variant: "destructive",
      });
    }
  };

  const filteredClients = (clients as Client[])?.filter((client: Client) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      client.fullName.toLowerCase().includes(searchLower) ||
      client.clientId.toLowerCase().includes(searchLower) ||
      client.phoneNumber?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const getStatusBadge = (client: Client) => {
    if (!client.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (client.missedCheckIns > 2) {
      return <Badge variant="destructive">High Risk</Badge>;
    }
    if (client.missedCheckIns > 0) {
      return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Client Management</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdminSettingsOpen(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Admin Settings
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingClient(null);
                form.reset();
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingClient ? "Edit Client" : "Add New Client"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bondAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bond Amount</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="courtLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Court Location</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="charges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Charges</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsFormOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createClientMutation.isPending || updateClientMutation.isPending}
                    >
                      {editingClient ? "Update Client" : "Create Client"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search clients by name, ID, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clients ({filteredClients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {clientsLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-sm text-slate-500">Loading clients...</div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">No clients found</p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Client
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Client ID</th>
                    <th className="text-left p-2">Bond Amount</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Missed Check-ins</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client: Client) => (
                    <tr key={client.id} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-medium">{client.fullName}</td>
                      <td className="p-2 font-mono text-sm">{client.clientId}</td>
                      <td className="p-2">${parseFloat(client.bondAmount).toLocaleString()}</td>
                      <td className="p-2">{getStatusBadge(client)}</td>
                      <td className="p-2">
                        <span className={client.missedCheckIns > 0 ? "text-red-600 font-medium" : ""}>
                          {client.missedCheckIns}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(client)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCredentials(client)}
                          >
                            <Key className="w-3 h-3 mr-1" />
                            View Login
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedClient(client);
                              setIsClientDetailsOpen(true);
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Credentials Dialog */}
      {generatedCredentials && (
        <Dialog open={!!generatedCredentials} onOpenChange={() => setGeneratedCredentials(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Key className="mr-2 w-5 h-5" />
                Client Login Credentials
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800 mb-3">
                  Client account created successfully! Share these credentials:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-green-700">Client ID:</Label>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{generatedCredentials.clientId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(generatedCredentials.clientId)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-green-700">Password:</Label>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{generatedCredentials.password}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(generatedCredentials.password)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Save these credentials securely. The client will use them to log into their portal.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Admin Settings Dialog */}
      <Dialog open={isAdminSettingsOpen} onOpenChange={setIsAdminSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Settings className="mr-2 w-5 h-5" />
              Admin Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {adminCredentials && (adminCredentials as any).admin && (adminCredentials as any).maintenance && (
              <div className="space-y-3">
                <h3 className="font-medium">Current Admin Credentials</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="text-sm font-medium">Admin Username:</span>
                    <span className="text-sm">{(adminCredentials as any).admin.username}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="text-sm font-medium">Maintenance Username:</span>
                    <span className="text-sm">{(adminCredentials as any).maintenance.username}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newAdminPassword = prompt("Enter new admin password:");
                      if (newAdminPassword) {
                        updateCredentialsMutation.mutate({
                          role: "admin",
                          username: (adminCredentials as any).admin.username,
                          password: newAdminPassword
                        });
                      }
                    }}
                    disabled={updateCredentialsMutation.isPending}
                  >
                    Update Admin Password
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={() => {
                      const newMaintenancePassword = prompt("Enter new maintenance password:");
                      if (newMaintenancePassword) {
                        updateCredentialsMutation.mutate({
                          role: "maintenance",
                          username: (adminCredentials as any).maintenance.username,
                          password: newMaintenancePassword
                        });
                      }
                    }}
                    disabled={updateCredentialsMutation.isPending}
                  >
                    Update Maintenance Password
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Client Credentials Dialog */}
      <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Key className="mr-2 w-5 h-5" />
              Client Login Credentials
            </DialogTitle>
          </DialogHeader>
          {clientCredentials && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-3">
                  Client login information:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-blue-700">Client ID:</Label>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{clientCredentials.clientId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(clientCredentials.clientId)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-blue-700">Password:</Label>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{clientCredentials.password}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(clientCredentials.password)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Share these credentials with the client for portal access.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}