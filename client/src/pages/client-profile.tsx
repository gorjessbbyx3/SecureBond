import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Calendar, MapPin, Phone, User, DollarSign, Scale, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

const clientUpdateSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  bondAmount: z.string().optional(),
  courtDate: z.string().optional(),
  courtLocation: z.string().optional(),
  charges: z.string().optional(),
  isActive: z.boolean(),
});

type ClientUpdateData = z.infer<typeof clientUpdateSchema>;

interface Client {
  id: number;
  clientId: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bondAmount?: string;
  courtDate?: string;
  courtLocation?: string;
  charges?: string;
  isActive: boolean;
  lastCheckIn?: string;
  missedCheckIns: number;
  createdAt: string;
  updatedAt: string;
}

interface CourtDate {
  id: number;
  courtDate: string;
  courtType: string;
  courtLocation?: string;
  caseNumber?: string;
  attendanceStatus: string;
  completed: boolean;
  notes?: string;
}

interface Payment {
  id: number;
  amount: string;
  paymentMethod: string;
  paymentDate: string;
  confirmed: boolean;
  notes?: string;
}

interface CheckIn {
  id: number;
  checkInDate: string;
  location?: string;
  notes?: string;
}

export default function ClientProfile() {
  const [, params] = useRoute("/client/:id");
  const clientId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: client, isLoading } = useQuery({
    queryKey: ['/api/clients', clientId],
    enabled: !!clientId,
  });

  const { data: courtDates = [] } = useQuery({
    queryKey: ['/api/clients', clientId, 'court-dates'],
    enabled: !!clientId,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['/api/clients', clientId, 'payments'],
    enabled: !!clientId,
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ['/api/clients', clientId, 'check-ins'],
    enabled: !!clientId,
  });

  const form = useForm<ClientUpdateData>({
    resolver: zodResolver(clientUpdateSchema),
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
      isActive: true,
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async (data: ClientUpdateData) => {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update client');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', clientId] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Success",
        description: "Client profile updated successfully",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update client profile",
        variant: "destructive",
      });
    },
  });

  const updateCourtStatusMutation = useMutation({
    mutationFn: async ({ courtDateId, status, notes }: { courtDateId: number; status: string; notes?: string }) => {
      const response = await apiRequest(`/api/court-dates/${courtDateId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', clientId, 'court-dates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Success",
        description: "Court attendance status updated",
      });
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading client profile...</div>;
  }

  if (!client) {
    return <div className="p-6">Client not found</div>;
  }

  // Populate form when client data is loaded
  if (client && !form.getValues().fullName) {
    form.reset({
      fullName: client.fullName || "",
      phoneNumber: client.phoneNumber || "",
      address: client.address || "",
      dateOfBirth: client.dateOfBirth ? client.dateOfBirth.split('T')[0] : "",
      emergencyContact: client.emergencyContact || "",
      emergencyPhone: client.emergencyPhone || "",
      bondAmount: client.bondAmount || "",
      courtDate: client.courtDate ? new Date(client.courtDate).toISOString().split('T')[0] : "",
      courtLocation: client.courtLocation || "",
      charges: client.charges || "",
      isActive: client.isActive,
    });
  }

  const onSubmit = (data: ClientUpdateData) => {
    updateClientMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      attended: "bg-green-100 text-green-800", 
      missed: "bg-red-100 text-red-800",
      rescheduled: "bg-blue-100 text-blue-800"
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{client.fullName}</h1>
          <p className="text-muted-foreground">Client ID: {client.clientId}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant={client.isActive ? "default" : "secondary"}>
            {client.isActive ? "Active" : "Inactive"}
          </Badge>
          {client.missedCheckIns > 0 && (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {client.missedCheckIns} Missed Check-ins
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="court-dates">Court Dates</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="check-ins">Check-ins</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Client Information</CardTitle>
                <CardDescription>
                  Manage client profile and status
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        name="bondAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bond Amount</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="25000.00" />
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
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="emergencyContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Phone</FormLabel>
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
                      name="charges"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Charges</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active Status</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              {field.value ? "Client is currently active" : "Client is inactive"}
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={updateClientMutation.isPending}
                      >
                        {updateClientMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <User className="h-4 w-4" />
                        Personal Information
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{client.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          Born: {client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        Contact Information
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm">{client.phoneNumber || "No phone number"}</p>
                        <p className="text-sm text-muted-foreground">
                          Emergency: {client.emergencyContact || "Not provided"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {client.emergencyPhone || "No emergency phone"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        Bond Information
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">
                          {client.bondAmount ? formatCurrency(client.bondAmount) : "Not set"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Status: {client.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {client.address && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        Address
                      </div>
                      <p className="text-sm">{client.address}</p>
                    </div>
                  )}

                  {client.charges && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Scale className="h-4 w-4" />
                        Charges
                      </div>
                      <p className="text-sm">{client.charges}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="court-dates">
          <Card>
            <CardHeader>
              <CardTitle>Court Dates</CardTitle>
              <CardDescription>
                Manage court appearances and attendance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {courtDates.length === 0 ? (
                <p className="text-muted-foreground">No court dates scheduled</p>
              ) : (
                <div className="space-y-4">
                  {courtDates.map((courtDate: CourtDate) => (
                    <div key={courtDate.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">
                            {courtDate.courtType.charAt(0).toUpperCase() + courtDate.courtType.slice(1)}
                          </span>
                          <Badge className={getStatusBadge(courtDate.attendanceStatus)}>
                            {courtDate.attendanceStatus}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCourtStatusMutation.mutate({
                              courtDateId: courtDate.id,
                              status: "attended"
                            })}
                            disabled={courtDate.attendanceStatus === "attended"}
                          >
                            Mark Attended
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCourtStatusMutation.mutate({
                              courtDateId: courtDate.id,
                              status: "missed"
                            })}
                            disabled={courtDate.attendanceStatus === "missed"}
                          >
                            Mark Missed
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Date: {new Date(courtDate.courtDate).toLocaleString()}</p>
                        {courtDate.courtLocation && <p>Location: {courtDate.courtLocation}</p>}
                        {courtDate.caseNumber && <p>Case: {courtDate.caseNumber}</p>}
                        {courtDate.notes && <p>Notes: {courtDate.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                Track all payments and confirmations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-muted-foreground">No payments recorded</p>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment: Payment) => (
                    <div key={payment.id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatCurrency(payment.amount)}</span>
                          <Badge variant={payment.confirmed ? "default" : "secondary"}>
                            {payment.confirmed ? "Confirmed" : "Pending"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>{payment.paymentMethod} • {new Date(payment.paymentDate).toLocaleDateString()}</p>
                          {payment.notes && <p>{payment.notes}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="check-ins">
          <Card>
            <CardHeader>
              <CardTitle>Check-in History</CardTitle>
              <CardDescription>
                View client check-in records and compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checkIns.length === 0 ? (
                <p className="text-muted-foreground">No check-ins recorded</p>
              ) : (
                <div className="space-y-4">
                  {checkIns.map((checkIn: CheckIn) => (
                    <div key={checkIn.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{new Date(checkIn.checkInDate).toLocaleString()}</p>
                          {checkIn.location && (
                            <p className="text-sm text-muted-foreground">Location: {checkIn.location}</p>
                          )}
                        </div>
                      </div>
                      {checkIn.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{checkIn.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}