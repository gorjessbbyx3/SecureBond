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
import { Users, Plus, Edit, Trash2, Eye, Key, Search, Filter, MapPin, Calendar, DollarSign, Clock, Phone, User, Home, AlertTriangle } from "lucide-react";
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
  totalOwed: z.string().min(1, "Total amount owed is required"),
  downPayment: z.string().optional(),
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [generatedCredentials, setGeneratedCredentials] = useState<{ clientId: string; password: string } | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false);

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
      totalOwed: "",
      downPayment: "",
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
        totalOwed: parseFloat(data.totalOwed),
        downPayment: data.downPayment ? parseFloat(data.downPayment) : 0,
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
        totalOwed: data.totalOwed ? parseFloat(data.totalOwed) : undefined,
        downPayment: data.downPayment ? parseFloat(data.downPayment) : undefined,
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
      totalOwed: client.totalOwed || "",
      downPayment: client.downPayment || "",
      courtDate: client.courtDate ? new Date(client.courtDate).toISOString().split('T')[0] : "",
      courtLocation: client.courtLocation || "",
      charges: client.charges || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
    form.reset();
  };

  const filteredClients = (clients as Client[])?.filter((client: Client) => {
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
                  <Label htmlFor="totalOwed">Total Amount Owed *</Label>
                  <Input
                    id="totalOwed"
                    type="number"
                    step="0.01"
                    {...form.register("totalOwed")}
                    placeholder="5000.00"
                  />
                  {form.formState.errors.totalOwed && (
                    <p className="text-sm text-red-600">{form.formState.errors.totalOwed.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Amount client owes for bail bond services</p>
                </div>
                <div>
                  <Label htmlFor="downPayment">Down Payment</Label>
                  <Input
                    id="downPayment"
                    type="number"
                    step="0.01"
                    {...form.register("downPayment")}
                    placeholder="1000.00"
                  />
                  <p className="text-xs text-gray-500">Initial payment made (if any)</p>
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
                    <TableHead>Amount Owed</TableHead>
                    <TableHead>Remaining Balance</TableHead>
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
                      <TableCell>
                        {client.totalOwed ? (
                          <span className="font-medium">${parseFloat(client.totalOwed).toLocaleString()}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {client.remainingBalance ? (
                          <span className={`font-medium ${parseFloat(client.remainingBalance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${parseFloat(client.remainingBalance).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
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
                            onClick={() => {
                              setSelectedClient(client);
                              setIsClientDetailsOpen(true);
                            }}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingClient(client);
                              setIsAddDialogOpen(true);
                              handleEdit(client);
                            }}
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

      {/* Client Details Dialog */}
      {selectedClient && (
        <ClientDetailsDialog 
          client={selectedClient}
          isOpen={isClientDetailsOpen}
          onClose={() => {
            setIsClientDetailsOpen(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
}

// Client Details Dialog Component
function ClientDetailsDialog({ client, isOpen, onClose }: {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
}) {
  // Fetch client-specific data
  const { data: payments } = useQuery({
    queryKey: ["/api/clients", client.id, "payments"],
    enabled: isOpen,
  });

  const { data: checkIns } = useQuery({
    queryKey: ["/api/clients", client.id, "checkins"],
    enabled: isOpen,
  });

  const { data: courtDates } = useQuery({
    queryKey: ["/api/clients", client.id, "court-dates"],
    enabled: isOpen,
  });

  const totalPaid = (payments as any[])?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0;
  const checkInCount = (checkIns as any[])?.length || 0;
  const upcomingCourtDates = (courtDates as any[])?.filter(cd => new Date(cd.date) > new Date()).length || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {client.fullName} - Client Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm text-slate-600">Total Paid</p>
                    <p className="text-lg font-semibold">${totalPaid.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-slate-600">Check-ins</p>
                    <p className="text-lg font-semibold">{checkInCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-slate-600">Upcoming Courts</p>
                    <p className="text-lg font-semibold">{upcomingCourtDates}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-slate-600">Missed Check-ins</p>
                    <p className="text-lg font-semibold">{client.missedCheckIns}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-600">Client ID</Label>
                    <p className="font-mono text-sm bg-slate-100 p-2 rounded">{client.clientId}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Full Name</Label>
                    <p className="font-medium">{client.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Phone Number</Label>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-500" />
                      {client.phoneNumber || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Address</Label>
                    <p className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-slate-500" />
                      {client.address || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-600">Bond Amount</Label>
                    <p className="text-lg font-semibold text-blue-600">${parseFloat(client.bondAmount).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Total Owed</Label>
                    <p className="text-lg font-semibold">${client.totalOwed ? parseFloat(client.totalOwed).toLocaleString() : '0'}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Remaining Balance</Label>
                    <p className={`text-lg font-semibold ${client.remainingBalance && parseFloat(client.remainingBalance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${client.remainingBalance ? parseFloat(client.remainingBalance).toLocaleString() : '0'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Status</Label>
                    <div className="mt-1">
                      <Badge variant={client.isActive ? "default" : "secondary"}>
                        {client.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payments && (payments as any[]).length > 0 ? (
                <div className="space-y-2">
                  {(payments as any[]).slice(0, 5).map((payment: any) => (
                    <div key={payment.id} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                      <div>
                        <p className="font-medium">${parseFloat(payment.amount).toLocaleString()}</p>
                        <p className="text-sm text-slate-600">{payment.paymentMethod}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{new Date(payment.createdAt).toLocaleDateString()}</p>
                        <Badge variant={payment.isConfirmed ? "default" : "secondary"}>
                          {payment.isConfirmed ? "Confirmed" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {(payments as any[]).length > 5 && (
                    <p className="text-sm text-slate-500 text-center">
                      And {(payments as any[]).length - 5} more payments...
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">No payment history available</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Check-ins */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Recent Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              {checkIns && (checkIns as any[]).length > 0 ? (
                <div className="space-y-2">
                  {(checkIns as any[]).slice(0, 5).map((checkIn: any) => (
                    <div key={checkIn.id} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                      <div>
                        <p className="font-medium">{checkIn.location || "Location not specified"}</p>
                        <p className="text-sm text-slate-600">{checkIn.notes || "No notes"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{new Date(checkIn.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(checkIn.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(checkIns as any[]).length > 5 && (
                    <p className="text-sm text-slate-500 text-center">
                      And {(checkIns as any[]).length - 5} more check-ins...
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">No check-in history available</p>
              )}
            </CardContent>
          </Card>

          {/* Court Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Court Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {courtDates && (courtDates as any[]).length > 0 ? (
                <div className="space-y-2">
                  {(courtDates as any[]).map((courtDate: any) => (
                    <div key={courtDate.id} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                      <div>
                        <p className="font-medium">{courtDate.courtType || "Court Appearance"}</p>
                        <p className="text-sm text-slate-600">{courtDate.location || "Location TBD"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{new Date(courtDate.date).toLocaleDateString()}</p>
                        <Badge variant={
                          courtDate.status === "attended" ? "default" :
                          courtDate.status === "missed" ? "destructive" :
                          "secondary"
                        }>
                          {courtDate.status || "Pending"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">No court dates scheduled</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
