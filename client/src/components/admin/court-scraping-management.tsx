import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Search, Trash2, AlertTriangle, Clock, CheckCircle, ExternalLink } from 'lucide-react';

interface CourtDate {
  id: number;
  clientId: number;
  courtDate: string;
  courtLocation: string;
  charges: string;
  caseNumber: string;
  notes: string;
  status: string;
  source: string;
  sourceVerified: boolean;
  approvedBy: string | null;
  clientAcknowledged: boolean;
  createdAt: string;
}

interface Client {
  id: number;
  fullName: string;
  clientId: string;
}

export function CourtScrapingManagement() {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deletingCourtDate, setDeletingCourtDate] = useState<CourtDate | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all clients
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  // Get all court dates
  const { data: courtDates = [] } = useQuery<CourtDate[]>({
    queryKey: ['/api/court-dates'],
  });

  // Get auto-scraped court dates (pending review)
  const autoScrapedCourtDates = courtDates.filter(cd => 
    cd.notes?.includes('Auto-scraped') || cd.notes?.includes('Manual scrape') || 
    cd.source?.includes('Court Records Search')
  );

  // Manual court scraping mutation
  const manualScrapeMutation = useMutation({
    mutationFn: async (clientId: number) => {
      return apiRequest(`/api/clients/${clientId}/scrape-court-history`, {
        method: 'POST'
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Court History Scraped",
        description: `Found ${data.recordsCreated} court records for ${data.client}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/court-dates'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Scraping Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete auto-scraped court record mutation
  const deleteCourtDateMutation = useMutation({
    mutationFn: async ({ id, reason, clientId }: { id: number; reason: string; clientId: number }) => {
      return apiRequest(`/api/court-dates/${id}/auto-scraped`, {
        method: 'DELETE',
        body: { reason, clientId }
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Court Record Deleted",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/court-dates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/alerts/unacknowledged'] });
      setDeleteDialogOpen(false);
      setDeleteReason('');
      setDeletingCourtDate(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteCourtDate = (courtDate: CourtDate) => {
    setDeletingCourtDate(courtDate);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingCourtDate && deleteReason.trim()) {
      deleteCourtDateMutation.mutate({
        id: deletingCourtDate.id,
        reason: deleteReason.trim(),
        clientId: deletingCourtDate.clientId
      });
    }
  };

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.fullName : 'Unknown Client';
  };

  const getStatusBadge = (courtDate: CourtDate) => {
    if (courtDate.status === 'pending') {
      return <Badge variant="outline" className="text-orange-600"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
    }
    if (courtDate.approvedBy) {
      return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Court Record Scraping Management</h2>
          <p className="text-gray-600">Review and manage automatically scraped court records</p>
        </div>
      </div>

      {/* Manual Scraping Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Manual Court History Scraping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Select Client</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={selectedClient || ''}
                  onChange={(e) => setSelectedClient(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">Select a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.fullName} ({client.clientId})
                    </option>
                  ))}
                </select>
              </div>
              <Button 
                onClick={() => selectedClient && manualScrapeMutation.mutate(selectedClient)}
                disabled={!selectedClient || manualScrapeMutation.isPending}
              >
                {manualScrapeMutation.isPending ? 'Scraping...' : 'Scrape Court History'}
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              This will search Hawaii court records for the selected client and create pending records for review.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Scraped Records Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Auto-Scraped Court Records ({autoScrapedCourtDates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {autoScrapedCourtDates.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No auto-scraped court records found.</p>
          ) : (
            <div className="space-y-4">
              {autoScrapedCourtDates.map((courtDate) => (
                <div key={courtDate.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{getClientName(courtDate.clientId)}</h4>
                        {getStatusBadge(courtDate)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Case Number:</span> {courtDate.caseNumber || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Court Date:</span> {new Date(courtDate.courtDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Court Location:</span> {courtDate.courtLocation || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Source:</span> {courtDate.source}
                        </div>
                      </div>
                      {courtDate.charges && (
                        <div className="text-sm">
                          <span className="font-medium">Charges:</span> {courtDate.charges}
                        </div>
                      )}
                      {courtDate.notes && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {courtDate.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCourtDate(courtDate)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Auto-Scraped Court Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {deletingCourtDate && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{getClientName(deletingCourtDate.clientId)}</p>
                <p className="text-sm text-gray-600">Case: {deletingCourtDate.caseNumber || 'N/A'}</p>
                <p className="text-sm text-gray-600">Court: {deletingCourtDate.courtLocation || 'N/A'}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Reason for deletion</label>
              <Textarea
                placeholder="e.g., Incorrect client match, Wrong case number, Duplicate record..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
                disabled={!deleteReason.trim() || deleteCourtDateMutation.isPending}
              >
                {deleteCourtDateMutation.isPending ? 'Deleting...' : 'Delete Record'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}