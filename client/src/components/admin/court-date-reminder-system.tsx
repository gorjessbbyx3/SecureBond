import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCourtDateSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar,
  Clock,
  AlertTriangle,
  Bell,
  Plus,
  Search,
  Eye,
  Settings,
  Mail,
  Phone
} from "lucide-react";

const courtDateFormSchema = z.object({
  clientId: z.number(),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  courtLocation: z.string().min(1, "Court location is required"),
  caseType: z.string().optional(),
  caseNumber: z.string().optional(),
  judge: z.string().optional(),
  notes: z.string().optional(),
  reminderDays: z.number().min(1, "Reminder days must be at least 1").max(30, "Maximum 30 days"),
  isActive: z.boolean().default(true),
});

type CourtDateFormData = z.infer<typeof courtDateFormSchema>;

interface CourtDate {
  id: number;
  clientId: number;
  clientName?: string;
  date: string;
  time?: string;
  courtLocation: string;
  caseType?: string;
  caseNumber?: string;
  judge?: string;
  notes?: string;
  reminderDays: number;
  isActive: boolean;
  createdAt: string;
}

interface ReminderNotification {
  id: string;
  courtDateId: number;
  clientId: number;
  clientName: string;
  courtDate: string;
  courtLocation: string;
  daysUntil: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'upcoming' | 'overdue' | 'today';
  isAcknowledged: boolean;
}

export default function CourtDateReminderSystem() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourtDate, setEditingCourtDate] = useState<CourtDate | null>(null);
  const [selectedView, setSelectedView] = useState<'all' | 'upcoming' | 'overdue' | 'today'>('upcoming');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CourtDateFormData>({
    resolver: zodResolver(courtDateFormSchema),
    defaultValues: {
      clientId: 0,
      date: "",
      time: "",
      courtLocation: "",
      caseType: "",
      caseNumber: "",
      judge: "",
      notes: "",
      reminderDays: 7,
      isActive: true,
    },
  });

  // Fetch court dates and clients
  const { data: courtDates, isLoading: courtDatesLoading } = useQuery({
    queryKey: ["/api/court-dates"],
  });

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: reminders, isLoading: remindersLoading } = useQuery({
    queryKey: ["/api/court-dates/reminders"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Mutations
  const createCourtDateMutation = useMutation({
    mutationFn: async (data: CourtDateFormData) => {
      const response = await apiRequest("POST", "/api/court-dates", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/court-dates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/court-dates/reminders"] });
      setIsFormOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Court date created successfully with automated reminders",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create court date",
        variant: "destructive",
      });
    },
  });

  const updateCourtDateMutation = useMutation({
    mutationFn: async (data: CourtDateFormData & { id: number }) => {
      const { id, ...updateData } = data;
      const response = await apiRequest("PATCH", `/api/court-dates/${id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/court-dates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/court-dates/reminders"] });
      setIsFormOpen(false);
      setEditingCourtDate(null);
      form.reset();
      toast({
        title: "Success",
        description: "Court date updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update court date",
        variant: "destructive",
      });
    },
  });

  const acknowledgeReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const response = await apiRequest("PATCH", `/api/court-dates/reminders/${reminderId}/acknowledge`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/court-dates/reminders"] });
      toast({
        title: "Success",
        description: "Reminder acknowledged",
      });
    },
  });

  const handleSubmit = (data: CourtDateFormData) => {
    if (editingCourtDate) {
      updateCourtDateMutation.mutate({ ...data, id: editingCourtDate.id });
    } else {
      createCourtDateMutation.mutate(data);
    }
  };

  const handleEdit = (courtDate: CourtDate) => {
    setEditingCourtDate(courtDate);
    form.reset({
      clientId: courtDate.clientId,
      date: courtDate.date.split('T')[0], // Extract date part
      time: courtDate.time || "",
      courtLocation: courtDate.courtLocation,
      caseType: courtDate.caseType || "",
      caseNumber: courtDate.caseNumber || "",
      judge: courtDate.judge || "",
      notes: courtDate.notes || "",
      reminderDays: courtDate.reminderDays,
      isActive: courtDate.isActive,
    });
    setIsFormOpen(true);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'today':
        return <Badge className="bg-orange-500">Today</Badge>;
      case 'upcoming':
        return <Badge variant="default">Upcoming</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredCourtDates = courtDates ? courtDates.filter((courtDate: CourtDate) =>
    courtDate.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    courtDate.courtLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    courtDate.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const filteredReminders = reminders ? reminders.filter((reminder: ReminderNotification) => {
    if (selectedView === 'all') return true;
    return reminder.type === selectedView;
  }) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Court Date Reminder System</h2>
          <p className="text-muted-foreground">Automated tracking and notifications for legal deadlines</p>
        </div>
        <Button onClick={() => {
          setEditingCourtDate(null);
          form.reset();
          setIsFormOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Court Date
        </Button>
      </div>

      {/* Active Reminders Panel */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Bell className="mr-2 w-5 h-5" />
              Active Reminders
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={selectedView === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('all')}
              >
                All
              </Button>
              <Button
                variant={selectedView === 'overdue' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('overdue')}
              >
                Overdue
              </Button>
              <Button
                variant={selectedView === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('today')}
              >
                Today
              </Button>
              <Button
                variant={selectedView === 'upcoming' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('upcoming')}
              >
                Upcoming
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {remindersLoading ? (
            <div className="text-center py-4">Loading reminders...</div>
          ) : filteredReminders.length > 0 ? (
            <div className="space-y-3">
              {filteredReminders.map((reminder: ReminderNotification) => (
                <div key={reminder.id} className={`p-4 rounded-lg border ${
                  reminder.priority === 'critical' ? 'border-red-500 bg-red-50' :
                  reminder.priority === 'high' ? 'border-orange-500 bg-orange-50' :
                  'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{reminder.clientName}</h4>
                        {getPriorityBadge(reminder.priority)}
                        {getTypeBadge(reminder.type)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {new Date(reminder.courtDate).toLocaleDateString()} at {reminder.courtLocation}
                      </p>
                      <p className="text-sm font-medium">
                        {reminder.type === 'overdue' ? `${Math.abs(reminder.daysUntil)} days overdue` :
                         reminder.type === 'today' ? 'Court date is today!' :
                         `${reminder.daysUntil} days remaining`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeReminderMutation.mutate(reminder.id)}
                        disabled={reminder.isAcknowledged}
                      >
                        {reminder.isAcknowledged ? 'Acknowledged' : 'Acknowledge'}
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No {selectedView === 'all' ? '' : selectedView} reminders at this time
            </div>
          )}
        </CardContent>
      </Card>

      {/* Court Dates Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 w-5 h-5" />
              Court Dates Management
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search court dates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {courtDatesLoading ? (
            <div className="text-center py-4">Loading court dates...</div>
          ) : filteredCourtDates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 border-b">Client</th>
                    <th className="text-left p-3 border-b">Date & Time</th>
                    <th className="text-left p-3 border-b">Location</th>
                    <th className="text-left p-3 border-b">Case Info</th>
                    <th className="text-left p-3 border-b">Reminder</th>
                    <th className="text-left p-3 border-b">Status</th>
                    <th className="text-left p-3 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourtDates.map((courtDate: CourtDate) => (
                    <tr key={courtDate.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{courtDate.clientName}</td>
                      <td className="p-3">
                        <div>
                          <p>{new Date(courtDate.date).toLocaleDateString()}</p>
                          {courtDate.time && <p className="text-sm text-gray-600">{courtDate.time}</p>}
                        </div>
                      </td>
                      <td className="p-3">{courtDate.courtLocation}</td>
                      <td className="p-3">
                        <div>
                          {courtDate.caseType && <p className="text-sm">{courtDate.caseType}</p>}
                          {courtDate.caseNumber && <p className="text-sm text-gray-600">#{courtDate.caseNumber}</p>}
                          {courtDate.judge && <p className="text-sm text-gray-600">Judge: {courtDate.judge}</p>}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{courtDate.reminderDays} days</Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={courtDate.isActive ? "default" : "secondary"}>
                          {courtDate.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(courtDate)}
                          >
                            <Settings className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No court dates found. Add a court date to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Court Date Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCourtDate ? "Edit Court Date" : "Add New Court Date"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <FormControl>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients?.map((client: any) => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reminderDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reminder Days Before</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="30" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="courtLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Court Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., District Court Room 3A" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="caseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Type</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Criminal, Civil" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="caseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., CR-2024-001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="judge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judge</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Hon. John Smith" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Additional notes or instructions..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCourtDateMutation.isPending || updateCourtDateMutation.isPending}>
                  {editingCourtDate ? "Update" : "Create"} Court Date
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}