import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertCircle, 
  Trash2, 
  UserPlus, 
  UserCog, 
  Phone, 
  Mail, 
  Clock, 
  AlertTriangle 
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ContactInquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  case_details: string;
  urgency_level: 'emergency' | 'urgent' | 'normal';
  created_at: string;
}

interface Staff {
  id: number;
  userId: string;
  employeeId: string;
  position: string;
}

export function ContactInquiries() {
  const { toast } = useToast();
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [assignNotes, setAssignNotes] = useState("");

  const { data: inquiries = [], isLoading } = useQuery<ContactInquiry[]>({
    queryKey: ['/api/inquiries'],
  });

  const { data: staff = [] } = useQuery<Staff[]>({
    queryKey: ['/api/staff'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/inquiries/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
      toast({
        title: "Inquiry deleted",
        description: "The contact inquiry has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete inquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const convertMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/inquiries/${id}/convert`, {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setShowConvertDialog(false);
      toast({
        title: "Client created successfully",
        description: `New client ${data.fullName} created. Client ID: ${data.clientId}, Password: ${data.password}`,
        duration: 10000,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to convert inquiry to client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({ id, staffId, notes }: { id: string; staffId: string; notes: string }) => {
      await apiRequest(`/api/inquiries/${id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ staffId, notes }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      setShowAssignDialog(false);
      setSelectedStaff("");
      setAssignNotes("");
      toast({
        title: "Inquiry assigned",
        description: "The inquiry has been assigned to staff member.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign inquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getUrgencyBadge = (level: string) => {
    switch (level) {
      case 'emergency':
        return <Badge variant="destructive" className="gap-1" data-testid={`badge-urgency-emergency`}><AlertCircle className="h-3 w-3" />Emergency</Badge>;
      case 'urgent':
        return <Badge variant="default" className="gap-1 bg-orange-500" data-testid={`badge-urgency-urgent`}><AlertTriangle className="h-3 w-3" />Urgent</Badge>;
      default:
        return <Badge variant="secondary" data-testid={`badge-urgency-normal`}>Normal</Badge>;
    }
  };

  const handleDelete = (inquiry: ContactInquiry) => {
    if (confirm(`Are you sure you want to delete the inquiry from ${inquiry.name}?`)) {
      deleteMutation.mutate(inquiry.id);
    }
  };

  const handleConvert = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    setShowConvertDialog(true);
  };

  const handleAssign = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    setShowAssignDialog(true);
  };

  const confirmConvert = () => {
    if (selectedInquiry) {
      convertMutation.mutate(selectedInquiry.id);
    }
  };

  const confirmAssign = () => {
    if (selectedInquiry && selectedStaff) {
      assignMutation.mutate({
        id: selectedInquiry.id,
        staffId: selectedStaff,
        notes: assignNotes,
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contact Inquiries</CardTitle>
          <CardDescription>Loading inquiries...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Inquiries
            {inquiries.length > 0 && (
              <Badge variant="secondary" data-testid="badge-inquiry-count">{inquiries.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            New contact form submissions from your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inquiries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-inquiries">
              No new inquiries at this time
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Case Details</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inquiry) => (
                    <TableRow key={inquiry.id} data-testid={`row-inquiry-${inquiry.id}`}>
                      <TableCell className="font-medium" data-testid={`text-name-${inquiry.id}`}>
                        {inquiry.name}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm" data-testid={`text-phone-${inquiry.id}`}>
                            <Phone className="h-3 w-3" />
                            {inquiry.phone}
                          </div>
                          {inquiry.email && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground" data-testid={`text-email-${inquiry.id}`}>
                              <Mail className="h-3 w-3" />
                              {inquiry.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" data-testid={`text-case-${inquiry.id}`}>
                        {inquiry.case_details}
                      </TableCell>
                      <TableCell>
                        {getUrgencyBadge(inquiry.urgency_level)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm" data-testid={`text-time-${inquiry.id}`}>
                          <Clock className="h-3 w-3" />
                          {new Date(inquiry.created_at).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConvert(inquiry)}
                            className="gap-1"
                            data-testid={`button-convert-${inquiry.id}`}
                          >
                            <UserPlus className="h-4 w-4" />
                            <span className="hidden sm:inline">Convert</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssign(inquiry)}
                            className="gap-1"
                            data-testid={`button-assign-${inquiry.id}`}
                          >
                            <UserCog className="h-4 w-4" />
                            <span className="hidden sm:inline">Assign</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(inquiry)}
                            className="gap-1 text-destructive hover:text-destructive"
                            data-testid={`button-delete-${inquiry.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Convert to Client Dialog */}
      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent data-testid="dialog-convert-client">
          <DialogHeader>
            <DialogTitle>Convert to Client</DialogTitle>
            <DialogDescription>
              This will create a new client account from this inquiry and automatically delete the inquiry.
            </DialogDescription>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Name: {selectedInquiry.name}</p>
                <p className="text-sm text-muted-foreground">Phone: {selectedInquiry.phone}</p>
                {selectedInquiry.email && (
                  <p className="text-sm text-muted-foreground">Email: {selectedInquiry.email}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Case Details:</p>
                <p className="text-sm text-muted-foreground">{selectedInquiry.case_details}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConvertDialog(false)}
              data-testid="button-cancel-convert"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmConvert} 
              disabled={convertMutation.isPending}
              data-testid="button-confirm-convert"
            >
              {convertMutation.isPending ? "Converting..." : "Create Client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign to Staff Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent data-testid="dialog-assign-staff">
          <DialogHeader>
            <DialogTitle>Assign to Staff</DialogTitle>
            <DialogDescription>
              Assign this inquiry to a staff member for follow-up.
            </DialogDescription>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Inquiry from: {selectedInquiry.name}</p>
                <p className="text-sm text-muted-foreground">{selectedInquiry.phone}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assign to Staff</label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger data-testid="select-staff">
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.employeeId} - {member.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Add any notes or instructions..."
                  data-testid="textarea-assign-notes"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAssignDialog(false)}
              data-testid="button-cancel-assign"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmAssign} 
              disabled={!selectedStaff || assignMutation.isPending}
              data-testid="button-confirm-assign"
            >
              {assignMutation.isPending ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
