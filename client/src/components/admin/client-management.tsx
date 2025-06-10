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
  clientId: z.string().min(3, "Client ID must be at least 3 characters"),
  phoneNumber: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  emergencyContact: z.string().optional().or(z.literal("")),
  emergencyPhone: z.string().optional().or(z.literal("")),
  courtLocation: z.string().optional().or(z.literal("")),
  charges: z.string().optional().or(z.literal("")),
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      fullName: "",
      clientId: "",
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
      const response = await apiRequest("POST", "/api/clients", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      console.log("Client creation response:", data); // Debug log
      
      if (data && data.clientId && data.password) {
        setGeneratedCredentials({
          clientId: data.clientId,
          password: data.password
        });
        console.log("Generated credentials set:", { clientId: data.clientId, password: data.password });
      } else {
        console.error("Missing credentials in response:", data);
        toast({
          title: "Warning",
          description: "Client created but credentials not available",
          variant: "destructive",
        });
      }
      
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
      return await apiRequest("PATCH", `/api/clients/${id}`, updateData);
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

  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete client",
        variant: "destructive",
      });
    },
  });

  const updateCredentialsMutation = useMutation({
    mutationFn: async (data: { role: string; username: string; password: string }) => {
      return await apiRequest("PATCH", "/api/admin/credentials", data);
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
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    
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
      clientId: client.clientId,
      phoneNumber: client.phoneNumber || "",
      address: client.address || "",
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
      const response = await apiRequest("GET", `/api/clients/${client.id}/credentials`);
      const data = await response.json();
      setClientCredentials({
        clientId: data.clientId,
        password: data.password
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
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client ID</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., SB123456789" />
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
                      type="button"
                      disabled={createClientMutation.isPending || updateClientMutation.isPending}
                      onClick={async () => {
                        const values = form.getValues();
                        
                        // Basic validation
                        if (!values.fullName || values.fullName.trim() === '') {
                          toast({
                            title: "Validation Error",
                            description: "Full name is required",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        if (!values.clientId || values.clientId.trim() === '') {
                          toast({
                            title: "Validation Error", 
                            description: "Client ID is required",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        if (values.clientId.length < 3) {
                          toast({
                            title: "Validation Error",
                            description: "Client ID must be at least 3 characters",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        // Submit the form
                        handleSubmit(values);
                      }}
                    >
                      {createClientMutation.isPending ? "Creating..." : editingClient ? "Update Client" : "Create Client"}
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
                            <Settings className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCredentials(client)}
                          >
                            <Key className="w-3 h-3 mr-1" />
                            Login
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
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setClientToDelete(client);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Delete
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

      {/* Client Details Dialog */}
      <Dialog open={isClientDetailsOpen} onOpenChange={setIsClientDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="mr-2 w-5 h-5" />
                Client Details - {selectedClient?.fullName}
              </div>
              {selectedClient && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingClient(selectedClient);
                      form.reset({
                        fullName: selectedClient.fullName,
                        phoneNumber: selectedClient.phoneNumber || "",
                        address: selectedClient.address || "",
                        dateOfBirth: "",
                        emergencyContact: "",
                        emergencyPhone: "",
                        courtLocation: selectedClient.courtLocation || "",
                        charges: selectedClient.charges || "",
                        isActive: selectedClient.isActive,
                        missedCheckIns: selectedClient.missedCheckIns,
                      });
                      setIsClientDetailsOpen(false);
                      setIsFormOpen(true);
                    }}
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setClientToDelete(selectedClient);
                      setIsDeleteDialogOpen(true);
                      setIsClientDetailsOpen(false);
                    }}
                  >
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedClient && <ClientDetailsContent client={selectedClient} />}
        </DialogContent>
      </Dialog>

      {/* Client Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
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
                        <Input placeholder="(555) 123-4567" {...field} />
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
                      <Input placeholder="Street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emergencyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
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
                        <Input placeholder="Court address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="charges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Charges</FormLabel>
                    <FormControl>
                      <Input placeholder="List of charges" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingClient(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createClientMutation.isPending || updateClientMutation.isPending}
                >
                  {createClientMutation.isPending || updateClientMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingClient ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    editingClient ? "Update Client" : "Create Client"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="mr-2 w-5 h-5 text-red-600" />
              Delete Client
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>{clientToDelete?.fullName}</strong>? 
              This action cannot be undone and will remove all associated data including:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 ml-4">
              <li>Client profile and contact information</li>
              <li>Payment history and records</li>
              <li>Court dates and appearances</li>
              <li>Check-in history</li>
              <li>All associated alerts and messages</li>
            </ul>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setClientToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (clientToDelete) {
                  deleteClientMutation.mutate(clientToDelete.id);
                  setIsDeleteDialogOpen(false);
                  setClientToDelete(null);
                }
              }}
              disabled={deleteClientMutation.isPending}
            >
              {deleteClientMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Delete Client
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Client Details Content Component
function ClientDetailsContent({ client }: { client: Client }) {
  const { data: payments } = useQuery({
    queryKey: ["/api/clients", client.id, "payments"],
  });

  const { data: courtDates } = useQuery({
    queryKey: ["/api/clients", client.id, "court-dates"],
  });

  const { data: checkIns } = useQuery({
    queryKey: ["/api/clients", client.id, "check-ins"],
  });

  const { data: vehicles } = useQuery({
    queryKey: ["/api/clients", client.id, "vehicles"],
  });

  const { data: family } = useQuery({
    queryKey: ["/api/clients", client.id, "family"],
  });

  const { data: employment } = useQuery({
    queryKey: ["/api/clients", client.id, "employment"],
  });

  return (
    <div className="space-y-6">
      {/* Client Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 w-4 h-4" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-slate-600">Full Name</Label>
              <p className="font-medium">{client.fullName}</p>
            </div>
            <div>
              <Label className="text-slate-600">Client ID</Label>
              <p className="font-mono text-sm">{client.clientId}</p>
            </div>
            {client.phoneNumber && (
              <div>
                <Label className="text-slate-600">Phone Number</Label>
                <p>{client.phoneNumber}</p>
              </div>
            )}
            {client.address && (
              <div>
                <Label className="text-slate-600">Address</Label>
                <p>{client.address}</p>
              </div>
            )}
            <div>
              <Label className="text-slate-600">Status</Label>
              <div className="mt-1">
                <Badge variant={client.isActive ? "default" : "secondary"}>
                  {client.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 w-4 h-4" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-slate-600">Bond Amount</Label>
              <p className="text-lg font-semibold text-blue-600">
                ${parseFloat(client.bondAmount).toLocaleString()}
              </p>
            </div>
            {client.totalOwed && (
              <div>
                <Label className="text-slate-600">Total Owed</Label>
                <p className="text-lg font-semibold">
                  ${parseFloat(client.totalOwed).toLocaleString()}
                </p>
              </div>
            )}
            {client.downPayment && (
              <div>
                <Label className="text-slate-600">Down Payment</Label>
                <p className="text-lg font-semibold text-green-600">
                  ${parseFloat(client.downPayment).toLocaleString()}
                </p>
              </div>
            )}
            {client.remainingBalance && (
              <div>
                <Label className="text-slate-600">Remaining Balance</Label>
                <p className={`text-lg font-semibold ${
                  parseFloat(client.remainingBalance) > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  ${parseFloat(client.remainingBalance).toLocaleString()}
                </p>
              </div>
            )}
            <div>
              <Label className="text-slate-600">Missed Check-ins</Label>
              <p className={`font-semibold ${client.missedCheckIns > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {client.missedCheckIns}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Case Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 w-4 h-4" />
            Case Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {client.charges && (
            <div>
              <Label className="text-slate-600">Charges</Label>
              <p>{client.charges}</p>
            </div>
          )}
          {client.courtLocation && (
            <div>
              <Label className="text-slate-600">Court Location</Label>
              <p>{client.courtLocation}</p>
            </div>
          )}
          <div>
            <Label className="text-slate-600">Account Created</Label>
            <p>{new Date(client.createdAt).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Payments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 w-4 h-4" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(payments as any[] || []).length > 0 ? (
            <div className="space-y-2">
              {(payments as any[] || []).map((payment: any) => (
                <div key={payment.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">${parseFloat(payment.amount).toLocaleString()}</p>
                    <p className="text-sm text-slate-600">{payment.paymentMethod}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={payment.isConfirmed ? "default" : "secondary"}>
                      {payment.isConfirmed ? "Confirmed" : "Pending"}
                    </Badge>
                    <p className="text-sm text-slate-600 mt-1">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No payments recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Court Dates Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 w-4 h-4" />
            Court Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(courtDates as any[] || []).length > 0 ? (
            <div className="space-y-2">
              {(courtDates as any[] || []).map((courtDate: any) => (
                <div key={courtDate.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">{courtDate.courtLocation || 'Location TBD'}</p>
                    <p className="text-sm text-slate-600">{courtDate.caseType || 'Case type not specified'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {new Date(courtDate.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-600">{courtDate.time || 'Time TBD'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No court dates scheduled</p>
          )}
        </CardContent>
      </Card>

      {/* Check-ins Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 w-4 h-4" />
            Recent Check-ins
          </CardTitle>
        </CardHeader>
        <CardContent>
          {checkIns && Array.isArray(checkIns) && checkIns.length > 0 ? (
            <div className="space-y-2">
              {checkIns.slice(0, 5).map((checkIn: any) => (
                <div key={checkIn.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">Check-in</p>
                    <p className="text-sm text-slate-600">
                      {checkIn.location || 'Location not recorded'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {new Date(checkIn.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(checkIn.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No check-ins recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 w-4 h-4" />
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vehicles && Array.isArray(vehicles) && vehicles.length > 0 ? (
            <div className="space-y-3">
              {vehicles.map((vehicle: any) => (
                <div key={vehicle.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-600">Vehicle</Label>
                      <p className="font-medium">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                    </div>
                    <div>
                      <Label className="text-slate-600">Color</Label>
                      <p>{vehicle.color || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600">License Plate</Label>
                      <p className="font-mono">{vehicle.licensePlate || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600">VIN</Label>
                      <p className="font-mono text-sm">{vehicle.vin || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No vehicle information recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Employment Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 w-4 h-4" />
            Employment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employment && Array.isArray(employment) && employment.length > 0 ? (
            <div className="space-y-3">
              {employment.map((job: any) => (
                <div key={job.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-600">Employer</Label>
                      <p className="font-medium">{job.employerName || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600">Position</Label>
                      <p>{job.position || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600">Phone</Label>
                      <p>{job.employerPhone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600">Start Date</Label>
                      <p>{job.startDate ? new Date(job.startDate).toLocaleDateString() : 'Not specified'}</p>
                    </div>
                    {job.employerAddress && (
                      <div className="col-span-2">
                        <Label className="text-slate-600">Address</Label>
                        <p>{job.employerAddress}</p>
                      </div>
                    )}
                    {job.salary && (
                      <div>
                        <Label className="text-slate-600">Salary</Label>
                        <p className="font-medium">${parseFloat(job.salary).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No employment information recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Family & Friends Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 w-4 h-4" />
            Family & Friends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {family && Array.isArray(family) && family.length > 0 ? (
            <div className="space-y-3">
              {family.map((member: any) => (
                <div key={member.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-600">Name</Label>
                      <p className="font-medium">{member.name}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600">Relationship</Label>
                      <p>{member.relationship || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600">Phone</Label>
                      <p>{member.phoneNumber || 'Not provided'}</p>
                    </div>
                    {member.address && (
                      <div>
                        <Label className="text-slate-600">Address</Label>
                        <p>{member.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No family or friends information recorded</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}