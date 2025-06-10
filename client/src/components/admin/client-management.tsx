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
import NewClientForm from "./new-client-form";
import AdminSettings from "./admin-settings";

const clientFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  clientId: z.string().min(3, "Client ID must be at least 3 characters"),
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
  fullName: string;
  clientId: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  courtLocation?: string;
  charges?: string;
  isActive: boolean;
  missedCheckIns: number;
  createdAt: string;
  updatedAt: string;
}

export default function ClientManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [clientCredentials, setClientCredentials] = useState<{ clientId: string; password: string } | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ clientId: string; password: string } | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

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

  const { data: clients, isLoading } = useQuery({
    queryKey: ["/api/clients"],
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await apiRequest("POST", "/api/clients", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsFormOpen(false);
      setEditingClient(null);
      form.reset();
      
      // Show generated credentials
      setGeneratedCredentials({
        clientId: data.clientId,
        password: data.password
      });
      setIsCredentialsDialogOpen(true);
      
      toast({
        title: "Success",
        description: "Client created successfully",
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
      const response = await apiRequest("PUT", `/api/clients/${id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsFormOpen(false);
      setEditingClient(null);
      form.reset();
      toast({
        title: "Success",
        description: "Client updated successfully",
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
      const response = await apiRequest("DELETE", `/api/clients/${id}`);
      return response.json();
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
      clientId: client.clientId,
      phoneNumber: client.phoneNumber || "",
      address: client.address || "",
      dateOfBirth: client.dateOfBirth || "",
      emergencyContact: client.emergencyContact || "",
      emergencyPhone: client.emergencyPhone || "",
      courtLocation: client.courtLocation || "",
      charges: client.charges || "",
      isActive: client.isActive,
      missedCheckIns: client.missedCheckIns,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      deleteClientMutation.mutate(id);
    }
  };

  const handleAddClient = () => {
    setEditingClient(null);
    form.reset();
    setIsFormOpen(true);
  };

  const handleShowCredentials = async (client: Client) => {
    try {
      const response = await apiRequest("GET", `/api/clients/${client.id}/credentials`);
      const data = await response.json();
      setClientCredentials({
        clientId: data.clientId,
        password: data.password
      });
      setSelectedClient(client);
      setIsCredentialsDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch client credentials",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (client: Client) => {
    setViewingClient(client);
    setIsViewDetailsOpen(true);
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
          <Button onClick={handleAddClient}>
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Search Bar */}
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

      {/* Client List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? "No clients found matching your search." : "No clients found. Add your first client to get started."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{client.fullName}</h3>
                      {getStatusBadge(client)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>ID: {client.clientId}</span>
                      </div>
                      {client.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <span>📞 {client.phoneNumber}</span>
                        </div>
                      )}
                      {client.courtLocation && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{client.courtLocation}</span>
                        </div>
                      )}
                    </div>
                    {client.charges && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Charges:</strong> {client.charges}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(client)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShowCredentials(client)}
                    >
                      <Key className="w-4 h-4 mr-1" />
                      Credentials
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(client)}
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(client.id)}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Client Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? "Edit Client" : "Add New Client"}
            </DialogTitle>
          </DialogHeader>
          <NewClientForm 
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createClientMutation.isPending || updateClientMutation.isPending}
            editingClient={editingClient}
          />
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {generatedCredentials ? "Client Created Successfully!" : "Client Login Credentials"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {generatedCredentials ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm mb-3">
                    New client has been created successfully. Please save these login credentials:
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
                <div className="flex justify-end">
                  <Button onClick={() => {
                    setIsCredentialsDialogOpen(false);
                    setGeneratedCredentials(null);
                  }}>
                    Close
                  </Button>
                </div>
              </>
            ) : clientCredentials && selectedClient ? (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm mb-3">
                    Login credentials for <strong>{selectedClient.fullName}</strong>:
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
                <div className="flex justify-end">
                  <Button onClick={() => {
                    setIsCredentialsDialogOpen(false);
                    setClientCredentials(null);
                    setSelectedClient(null);
                  }}>
                    Close
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Client Details View Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Client Details - {viewingClient?.fullName}
            </DialogTitle>
          </DialogHeader>
          
          {viewingClient && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2">Basic Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Full Name:</span>
                      <span className="font-medium">{viewingClient.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Client ID:</span>
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">{viewingClient.clientId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <div>{getStatusBadge(viewingClient)}</div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date of Birth:</span>
                      <span>{viewingClient.dateOfBirth ? new Date(viewingClient.dateOfBirth).toLocaleDateString() : "Not provided"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span>{viewingClient.phoneNumber || "Not provided"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="text-right">{viewingClient.address || "Not provided"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Emergency Contact:</span>
                      <span>{viewingClient.emergencyContact || "Not provided"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Emergency Phone:</span>
                      <span>{viewingClient.emergencyPhone || "Not provided"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg border-b pb-2">Legal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Court Location:</span>
                    <span>{viewingClient.courtLocation || "Not provided"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Charges:</span>
                    <span className="text-right">{viewingClient.charges || "Not provided"}</span>
                  </div>
                </div>
              </div>

              {/* Activity Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg border-b pb-2">Activity Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{viewingClient.missedCheckIns}</div>
                    <div className="text-sm text-blue-700">Missed Check-ins</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {viewingClient.isActive ? "Active" : "Inactive"}
                    </div>
                    <div className="text-sm text-green-700">Current Status</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {new Date(viewingClient.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-700">Created Date</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDetailsOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDetailsOpen(false);
                    handleEdit(viewingClient);
                  }}
                >
                  Edit Client
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDetailsOpen(false);
                    handleShowCredentials(viewingClient);
                  }}
                >
                  View Credentials
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Admin Settings Dialog */}
      <AdminSettings 
        isOpen={isAdminSettingsOpen}
        onClose={() => setIsAdminSettingsOpen(false)}
      />
    </div>
  );
}