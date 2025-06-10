import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, User, Phone, MapPin, Calendar, DollarSign, Car, Users, 
  Briefcase, FileText, AlertTriangle, CheckCircle, Clock, Plus, Edit2, Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function ClientDetails() {
  const [, params] = useRoute("/client/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const clientId = params?.id ? parseInt(params.id) : null;

  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [isAddingFamily, setIsAddingFamily] = useState(false);
  const [isAddingEmployment, setIsAddingEmployment] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Fetch client data
  const { data: client, isLoading } = useQuery({
    queryKey: ["/api/clients", clientId],
    enabled: !!clientId,
  });

  const { data: bonds = [] } = useQuery({
    queryKey: ["/api/clients", clientId, "bonds"],
    enabled: !!clientId,
  });

  const { data: courtDates = [] } = useQuery({
    queryKey: ["/api/clients", clientId, "court-dates"],
    enabled: !!clientId,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["/api/clients", clientId, "payments"],
    enabled: !!clientId,
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["/api/clients", clientId, "check-ins"],
    enabled: !!clientId,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["/api/clients", clientId, "vehicles"],
    enabled: !!clientId,
  });

  const { data: family = [] } = useQuery({
    queryKey: ["/api/clients", clientId, "family"],
    enabled: !!clientId,
  });

  const { data: employment = [] } = useQuery({
    queryKey: ["/api/clients", clientId, "employment"],
    enabled: !!clientId,
  });

  const { data: files = [] } = useQuery({
    queryKey: ["/api/clients", clientId, "files"],
    enabled: !!clientId,
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["/api/clients", clientId, "locations"],
    enabled: !!clientId,
  });

  const { data: paymentSummary } = useQuery({
    queryKey: ["/api/clients", clientId, "payment-summary"],
    enabled: !!clientId,
  });

  // Add vehicle mutation
  const addVehicleMutation = useMutation({
    mutationFn: async (vehicleData: any) => {
      return apiRequest(`/api/clients/${clientId}/vehicles`, "POST", vehicleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients", clientId, "vehicles"] });
      setIsAddingVehicle(false);
      toast({ title: "Vehicle Added", description: "Vehicle information has been added successfully." });
    },
  });

  // Add family member mutation
  const addFamilyMutation = useMutation({
    mutationFn: async (familyData: any) => {
      return apiRequest(`/api/clients/${clientId}/family`, "POST", familyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients", clientId, "family"] });
      setIsAddingFamily(false);
      toast({ title: "Family Member Added", description: "Family member has been added successfully." });
    },
  });

  // Add employment mutation
  const addEmploymentMutation = useMutation({
    mutationFn: async (employmentData: any) => {
      return apiRequest(`/api/clients/${clientId}/employment`, "POST", employmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients", clientId, "employment"] });
      setIsAddingEmployment(false);
      toast({ title: "Employment Added", description: "Employment information has been added successfully." });
    },
  });

  if (isLoading || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading client details...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (client: any) => {
    if (client.isActive) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  const activeBonds = bonds.filter((bond: any) => bond.isActive);
  const totalBondAmount = activeBonds.reduce((sum: number, bond: any) => sum + parseFloat(bond.amount || "0"), 0);
  const upcomingCourtDates = courtDates.filter((court: any) => new Date(court.courtDate) > new Date() && !court.completed);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => setLocation("/admin")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{client.fullName}</h1>
            <p className="text-slate-600">Client ID: {client.clientId}</p>
          </div>
          <div className="ml-auto">
            {getStatusBadge(client)}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Active Bonds</p>
                  <p className="text-2xl font-bold text-slate-900">${totalBondAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Upcoming Court Dates</p>
                  <p className="text-2xl font-bold text-slate-900">{upcomingCourtDates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Check-ins</p>
                  <p className="text-2xl font-bold text-slate-900">{checkIns.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Payments</p>
                  <p className="text-2xl font-bold text-slate-900">{payments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bonds">Bonds</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="court">Court Dates</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="family">Family</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                        <Label className="text-slate-600">Phone</Label>
                        <p>{client.phoneNumber}</p>
                      </div>
                    )}
                    {client.dateOfBirth && (
                      <div>
                        <Label className="text-slate-600">Date of Birth</Label>
                        <p>{new Date(client.dateOfBirth).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</p>
                      </div>
                    )}
                    {client.address && (
                      <div className="col-span-2">
                        <Label className="text-slate-600">Address</Label>
                        <p>{client.address}</p>
                      </div>
                    )}
                    {client.emergencyContact && (
                      <div>
                        <Label className="text-slate-600">Emergency Contact</Label>
                        <p>{client.emergencyContact}</p>
                      </div>
                    )}
                    {client.emergencyPhone && (
                      <div>
                        <Label className="text-slate-600">Emergency Phone</Label>
                        <p>{client.emergencyPhone}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {checkIns.length > 0 ? (
                      checkIns.slice(0, 5).map((checkIn: any) => (
                        <div key={checkIn.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="text-sm font-medium">Check-in completed</p>
                            <p className="text-xs text-slate-500">
                              {new Date(checkIn.checkInTime).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Vehicle Information</h3>
              <Dialog open={isAddingVehicle} onOpenChange={setIsAddingVehicle}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Vehicle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Vehicle</DialogTitle>
                  </DialogHeader>
                  <VehicleForm 
                    onSubmit={(data) => addVehicleMutation.mutate(data)}
                    isLoading={addVehicleMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicles.length > 0 ? (
                vehicles.map((vehicle: any) => (
                  <Card key={vehicle.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Car className="h-5 w-5 text-blue-500 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</h4>
                          <p className="text-sm text-slate-600">License: {vehicle.licensePlate}</p>
                          <p className="text-sm text-slate-600">Color: {vehicle.color}</p>
                          {vehicle.vin && (
                            <p className="text-xs text-slate-500">VIN: {vehicle.vin}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-slate-500">
                  <Car className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>No vehicles registered</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Family Tab */}
          <TabsContent value="family" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Family Members</h3>
              <Dialog open={isAddingFamily} onOpenChange={setIsAddingFamily}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Family Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Family Member</DialogTitle>
                  </DialogHeader>
                  <FamilyForm 
                    onSubmit={(data) => addFamilyMutation.mutate(data)}
                    isLoading={addFamilyMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {family.length > 0 ? (
                family.map((member: any) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-green-500 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-slate-600">Relationship: {member.relationship}</p>
                          {member.phoneNumber && (
                            <p className="text-sm text-slate-600">Phone: {member.phoneNumber}</p>
                          )}
                          {member.address && (
                            <p className="text-sm text-slate-500">{member.address}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-slate-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>No family members listed</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Employment Tab */}
          <TabsContent value="employment" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Employment Information</h3>
              <Dialog open={isAddingEmployment} onOpenChange={setIsAddingEmployment}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Employment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Employment</DialogTitle>
                  </DialogHeader>
                  <EmploymentForm 
                    onSubmit={(data) => addEmploymentMutation.mutate(data)}
                    isLoading={addEmploymentMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {employment.length > 0 ? (
                employment.map((job: any) => (
                  <Card key={job.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-5 w-5 text-purple-500 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-medium">{job.jobTitle} at {job.companyName}</h4>
                          <p className="text-sm text-slate-600">Start Date: {new Date(job.startDate).toLocaleDateString()}</p>
                          {job.endDate && (
                            <p className="text-sm text-slate-600">End Date: {new Date(job.endDate).toLocaleDateString()}</p>
                          )}
                          {job.salary && (
                            <p className="text-sm text-slate-600">Salary: ${job.salary.toLocaleString()}</p>
                          )}
                          {job.supervisorName && (
                            <p className="text-sm text-slate-500">Supervisor: {job.supervisorName}</p>
                          )}
                          {job.workPhone && (
                            <p className="text-sm text-slate-500">Work Phone: {job.workPhone}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>No employment information available</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Payment Summary */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Total Payments:</span>
                      <span className="font-bold text-green-600">
                        ${paymentSummary?.totalAmount?.toLocaleString() || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Confirmed:</span>
                      <span className="font-medium">
                        ${paymentSummary?.confirmedAmount?.toLocaleString() || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Pending:</span>
                      <span className="font-medium text-orange-600">
                        ${paymentSummary?.pendingAmount?.toLocaleString() || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Last Payment:</span>
                      <span className="text-sm">
                        {paymentSummary?.lastPaymentDate 
                          ? new Date(paymentSummary.lastPaymentDate).toLocaleDateString()
                          : "No payments"
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Payments */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {payments.slice(0, 10).map((payment: any) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">${payment.amount}</p>
                          <p className="text-sm text-slate-600">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-500">Method: {payment.paymentMethod}</p>
                        </div>
                        <Badge variant={payment.confirmed ? "default" : "secondary"}>
                          {payment.confirmed ? "Confirmed" : "Pending"}
                        </Badge>
                      </div>
                    ))}
                    {payments.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <DollarSign className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p>No payments recorded</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top 5 Locations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Top 5 Check-in Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {locations.slice(0, 5).map((location: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{location.address || "Unknown Location"}</p>
                            <p className="text-sm text-slate-600">
                              {location.city}, {location.state}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{location.count}</p>
                          <p className="text-xs text-slate-500">check-ins</p>
                        </div>
                      </div>
                    ))}
                    {locations.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <MapPin className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p>No location data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Location Map Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Location Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-slate-500">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p>Interactive map visualization</p>
                      <p className="text-sm">Coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Location History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Location History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checkIns.slice(0, 15).map((checkIn: any) => (
                    <div key={checkIn.id} className="flex items-center gap-3 p-3 border rounded">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <div className="flex-1">
                        <p className="font-medium">{checkIn.location || "Location not recorded"}</p>
                        <p className="text-sm text-slate-600">
                          {new Date(checkIn.checkInTime).toLocaleString()}
                        </p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Court Documents & Files</h3>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Upload Document
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Document Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Document Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="text-sm">Court Orders</span>
                      <Badge variant="secondary">0</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="text-sm">Bail Agreements</span>
                      <Badge variant="secondary">0</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="text-sm">Payment Records</span>
                      <Badge variant="secondary">0</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="text-sm">ID Documents</span>
                      <Badge variant="secondary">0</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="text-sm">Other</span>
                      <Badge variant="secondary">0</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Documents */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Recent Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {files.length > 0 ? (
                    <div className="space-y-3">
                      {files.map((file: any) => (
                        <div key={file.id} className="flex items-center gap-3 p-3 border rounded">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div className="flex-1">
                            <p className="font-medium">{file.fileName}</p>
                            <p className="text-sm text-slate-600">
                              Uploaded {new Date(file.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-medium mb-2">No Documents Yet</p>
                      <p className="text-sm mb-4">Upload court documents, agreements, and other files</p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Upload First Document
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Document Search & Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Document Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <Input placeholder="Search documents..." className="flex-1" />
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Documents</SelectItem>
                      <SelectItem value="court">Court Orders</SelectItem>
                      <SelectItem value="bail">Bail Agreements</SelectItem>
                      <SelectItem value="payment">Payment Records</SelectItem>
                      <SelectItem value="id">ID Documents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-slate-600">
                  Document management system with search, categorization, and version control coming soon.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bonds Tab */}
          <TabsContent value="bonds">
            <Card>
              <CardHeader>
                <CardTitle>Bond Information</CardTitle>
              </CardHeader>
              <CardContent>
                {bonds.length > 0 ? (
                  <div className="space-y-4">
                    {bonds.map((bond: any) => (
                      <div key={bond.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">Bond #{bond.bondNumber}</h4>
                            <p className="text-sm text-slate-600">Amount: ${bond.amount}</p>
                            <p className="text-sm text-slate-600">Status: {bond.status}</p>
                          </div>
                          <Badge variant={bond.isActive ? "default" : "secondary"}>
                            {bond.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No bonds found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="court">
            <Card>
              <CardHeader>
                <CardTitle>Court Dates</CardTitle>
              </CardHeader>
              <CardContent>
                {courtDates.length > 0 ? (
                  <div className="space-y-4">
                    {courtDates.map((court: any) => (
                      <div key={court.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{court.courtType}</h4>
                            <p className="text-sm text-slate-600">
                              Date: {new Date(court.courtDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-slate-600">Location: {court.courtLocation}</p>
                            {court.charges && (
                              <p className="text-sm text-slate-600">Charges: {court.charges}</p>
                            )}
                          </div>
                          <Badge variant={court.completed ? "secondary" : "default"}>
                            {court.completed ? "Completed" : "Upcoming"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No court dates scheduled</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle>Documents & Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>File management system coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {checkIns.map((checkIn: any) => (
                    <div key={checkIn.id} className="flex items-center gap-3 p-3 border rounded">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Check-in completed</p>
                        <p className="text-sm text-slate-600">
                          {new Date(checkIn.checkInTime).toLocaleString()}
                        </p>
                        {checkIn.location && (
                          <p className="text-sm text-slate-500">Location: {checkIn.location}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}

// Form components for adding information
function VehicleForm({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
    vin: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="make">Make</Label>
          <Input
            id="make"
            value={formData.make}
            onChange={(e) => setFormData({ ...formData, make: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="licensePlate">License Plate</Label>
          <Input
            id="licensePlate"
            value={formData.licensePlate}
            onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="vin">VIN (Optional)</Label>
          <Input
            id="vin"
            value={formData.vin}
            onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
          />
        </div>
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Adding..." : "Add Vehicle"}
      </Button>
    </form>
  );
}

function FamilyForm({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phoneNumber: "",
    address: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="relationship">Relationship</Label>
        <Select 
          value={formData.relationship} 
          onValueChange={(value) => setFormData({ ...formData, relationship: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select relationship" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="spouse">Spouse</SelectItem>
            <SelectItem value="parent">Parent</SelectItem>
            <SelectItem value="child">Child</SelectItem>
            <SelectItem value="sibling">Sibling</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Adding..." : "Add Family Member"}
      </Button>
    </form>
  );
}

function EmploymentForm({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    startDate: "",
    endDate: "",
    salary: "",
    supervisorName: "",
    workPhone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input
            id="jobTitle"
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date (if applicable)</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="salary">Salary</Label>
          <Input
            id="salary"
            type="number"
            value={formData.salary}
            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="supervisorName">Supervisor Name</Label>
          <Input
            id="supervisorName"
            value={formData.supervisorName}
            onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="workPhone">Work Phone</Label>
        <Input
          id="workPhone"
          value={formData.workPhone}
          onChange={(e) => setFormData({ ...formData, workPhone: e.target.value })}
        />
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Adding..." : "Add Employment"}
      </Button>
    </form>
  );
}