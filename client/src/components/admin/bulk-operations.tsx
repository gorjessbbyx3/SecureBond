import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Send, MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  isActive: boolean;
}

interface BulkOperationsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkOperations({ open, onOpenChange }: BulkOperationsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ action, clientIds }: { action: string; clientIds: number[] }) => {
      return await apiRequest("POST", "/api/admin/bulk-update", {
        action,
        clientIds,
        data: {}
      });
    },
    onSuccess: (data: any) => {
      const successCount = data.results?.filter((r: any) => r.success).length || 0;
      const failCount = data.results?.filter((r: any) => !r.success).length || 0;

      toast({
        title: "Bulk operation completed",
        description: `${successCount} succeeded, ${failCount} failed`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      setSelectedClients([]);
    },
    onError: () => {
      toast({
        title: "Bulk operation failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSelectAll = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map(c => c.id));
    }
  };

  const handleClientToggle = (clientId: number) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleExecute = () => {
    if (!bulkAction || selectedClients.length === 0) {
      toast({
        title: "Invalid operation",
        description: "Please select clients and an action",
        variant: "destructive",
      });
      return;
    }

    bulkUpdateMutation.mutate({ action: bulkAction, clientIds: selectedClients });
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'send-payment-reminder': return 'Send Payment Reminder';
      case 'mark-checkin-overdue': return 'Mark Check-in Overdue';
      case 'send-court-reminder': return 'Send Court Date Reminder';
      case 'update-status': return 'Update Status';
      default: return action;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Bulk Operations
          </DialogTitle>
          <DialogDescription>
            Perform actions on multiple clients simultaneously
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action Selection */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Action</label>
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger data-testid="select-bulk-action">
                      <SelectValue placeholder="Choose bulk action..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="send-payment-reminder">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Send Payment Reminder
                        </div>
                      </SelectItem>
                      <SelectItem value="mark-checkin-overdue">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Mark Check-in Overdue
                        </div>
                      </SelectItem>
                      <SelectItem value="send-court-reminder">
                        <div className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          Send Court Reminder
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {bulkAction && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm">
                      <strong>Selected Action:</strong> {getActionLabel(bulkAction)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This will be applied to {selectedClients.length} selected client(s)
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Client Selection */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Select Clients</label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSelectAll}
                    data-testid="button-select-all"
                  >
                    {selectedClients.length === clients.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>

                <div className="max-h-[300px] overflow-y-auto border rounded-lg">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/50"
                      data-testid={`client-row-${client.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedClients.includes(client.id)}
                          onCheckedChange={() => handleClientToggle(client.id)}
                          data-testid={`checkbox-client-${client.id}`}
                        />
                        <div>
                          <p className="font-medium">{client.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {client.email || client.phone || `ID: ${client.id}`}
                          </p>
                        </div>
                      </div>
                      <Badge variant={client.isActive ? "default" : "secondary"}>
                        {client.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-muted-foreground">
                    {selectedClients.length} of {clients.length} clients selected
                  </p>
                  {selectedClients.length > 0 && bulkAction && (
                    <Button
                      onClick={handleExecute}
                      disabled={bulkUpdateMutation.isPending}
                      className="gap-2"
                      data-testid="button-execute-bulk"
                    >
                      {bulkUpdateMutation.isPending ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Execute for {selectedClients.length} Client(s)
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
