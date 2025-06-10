import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, Plus, Edit, Trash2, Eye, Key, Search, Filter } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const clientFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  bondAmount: z.string().min(1, "Bond amount is required"),
  courtDate: z.string().optional(),
  courtLocation: z.string().optional(),
  charges: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

interface Client {
  id: number;
  clientId: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  bondAmount: string;
  courtDate?: string;
  courtLocation?: string;
  charges?: string;
  isActive: boolean;
  lastCheckIn?: string;
  missedCheckIns: number;
  createdAt: string;
}

export default function ClientManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [generatedCredentials, setGeneratedCredentials] = useState<{ clientId: string; password: string } | null>(null);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      address: "",
      dateOfBirth: "",
      emergencyContact: "",
      emergencyPhone: "",
      bondAmount: "",
      courtDate: "",
      courtLocation: "",
      charges: "",
    },
  });

  // Fetch clients
  const { data: clients, isLoading } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await apiRequest("POST", "/api/clients", {
        ...data,
        bondAmount: parseFloat(data.bondAmount),
        courtDate: data.courtDate ? new Date(data.courtDate).toISOString() : null,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Client Created",
        description: `Client ${data.client.fullName} has been created successfully.`,
      });
      setGeneratedCredentials(data.credentials);
      form.reset();
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Client",
        description: "Please check the information and try again.",
        variant: "destructive",
      });
    },
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ClientFormData> }) => {
      const response = await apiRequest("PUT", `/api/clients/${id}`, {
        ...data,
        bondAmount: data.bondAmount ? parseFloat(data.bondAmount) : undefined,
        courtDate: data.courtDate ? new Date(data.courtDate).toISOString() : undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Client Updated",
        description: "Client information has been updated successfully.",
      });
      setEditingClient(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Client",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Client Deleted",
        description: "Client has been removed from the system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Client",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ClientFormData) => {
    if (editingClient) {
      updateClientMutation.mutate({ id: editingClient.id, data });
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
      courtDate: client.courtDate ? new Date(client.courtDate).toISOString().split('T')[0] : "",
      courtLocation: client.courtLocation || "",
      charges: client.charges || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
    form.reset();
  };

  const filteredClients = clients?.filter((client: Client) => {
    const matchesSearch = client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.clientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && client.isActive) ||
                         (statusFilter === "inactive" && !client.isActive);
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (client: Client) => {
    if (!client.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (client.missedCheckIns > 0) {
      return <Badge variant="destructive">Missed Check-ins: {client.missedCheckIns}</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Client Management</h2>
          <p className="text-slate-600">Manage client accounts and information</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="mr-2 w-4 h-4" />
              Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    {...form.register("fullName")}
                    placeholder="Enter full name"
                  />
                  {form.formState.errors.fullName && (
                    <p className="text-sm text-red-600">{form.formState.errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    {...form.register("phoneNumber")}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  {...form.register("address")}
                  placeholder="Enter full address"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...form.register("dateOfBirth")}
                  />
                </div>
                <div>
                  <Label htmlFor="bondAmount">Bond Amount *</Label>
                  <Input
                    id="bondAmount"
                    type="number"
                    step="0.01"
                    {...form.register("bondAmount")}
                    placeholder="25000.00"
                  />
                  {form.formState.errors.bondAmount && (
                    <p className="text-sm text-red-600">{form.formState.errors.bondAmount.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    {...form.register("emergencyContact")}
                    placeholder="Contact name"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                  <Input
                    id="emergencyPhone"
                    {...form.register("emergencyPhone")}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courtDate">Court Date</Label>
                  <Input
                    id="courtDate"
                    type="datetime-local"
                    {...form.register("courtDate")}
                  />
                </div>
                <div>
                  <Label htmlFor="courtLocation">Court Location</Label>
                  <Input
                    id="courtLocation"
                    {...form.register("courtLocation")}
                    placeholder="District Court Room 3A"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="charges">Charges</Label>
                <Textarea
                  id="charges"
                  {...form.register("charges")}
                  placeholder="List of charges"
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                {editingClient && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={createClientMutation.isPending || updateClientMutation.isPending}
                >
                  {(createClientMutation.isPending || updateClientMutation.isPending) ? (
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
          </DialogContent>
        </Dialog>
      </div>

      {/* Generated Credentials Dialog */}
      {generatedCredentials && (
        <Dialog open={!!generatedCredentials} onOpenChange={() => setGeneratedCredentials(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Key className="mr-2 w-5 h-5" />
                Client Credentials Generated
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  Please save these credentials and provide them to the client:
                </p>
                <div className="space-y-2">
                  <div>
                    <Label className="text-blue-700">Client ID:</Label>
                    <p className="font-mono text-lg">{generatedCredentials.clientId}</p>
                  </div>
                  <div>
                    <Label className="text-blue-700">Password:</Label>
                    <p className="font-mono text-lg">{generatedCredentials.password}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                ⚠️ This is the only time these credentials will be displayed. Make sure to save them securely.
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setGeneratedCredentials(null)}>
                I have saved the credentials
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Search and Filter */}
      <div className="flex space-x-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 w-4 h-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 w-5 h-5" />
            Clients ({filteredClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-500 mt-2">Loading clients...</p>
            </div>
          ) : filteredClients.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Bond Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Check-in</TableHead>
                    <TableHead>Court Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client: Client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-mono">{client.clientId}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.fullName}</p>
                          {client.phoneNumber && (
                            <p className="text-sm text-slate-500">{client.phoneNumber}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>${parseFloat(client.bondAmount).toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(client)}</TableCell>
                      <TableCell>
                        {client.lastCheckIn ? (
                          <span className="text-sm">
                            {new Date(client.lastCheckIn).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {client.courtDate ? (
                          <span className="text-sm">
                            {new Date(client.courtDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(client)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Client</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {client.fullName}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteClientMutation.mutate(client.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">No clients found</h3>
              <p className="mt-1 text-sm text-slate-500">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by adding your first client."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
