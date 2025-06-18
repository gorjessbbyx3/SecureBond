import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  FileText, 
  Scale, 
  Gavel, 
  Building, 
  Search, 
  RefreshCw, 
  Eye, 
  Calendar,
  ExternalLink,
  Filter,
  Download
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CourtDocument {
  name: string;
  caseNumber?: string;
  courtDate?: string;
  courtTime?: string;
  courtLocation?: string;
  caseType?: string;
  charges?: string;
  status?: string;
  source: string;
}

interface RSSFeedResponse {
  success: boolean;
  documents: CourtDocument[];
  categorized?: {
    civil: CourtDocument[];
    criminal: CourtDocument[];
    federal: CourtDocument[];
  };
  totalFound: number;
  breakdown?: {
    civil: number;
    criminal: number;
    federal: number;
  };
  source: string;
  lastUpdated: string;
}

export function RSSDocumentsFeed() {
  const [searchTerm, setSearchTerm] = useState("");
  const [documentType, setDocumentType] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState<CourtDocument | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch RSS documents feed
  const { data: rssData, isLoading, refetch } = useQuery<RSSFeedResponse>({
    queryKey: ["/api/court-documents/rss-feed", { documentType, clientName: searchTerm }],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const refreshFeedMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("GET", `/api/court-documents/rss-feed?documentType=${documentType}&clientName=${searchTerm}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/court-documents/rss-feed"] });
      toast({
        title: "Feed Refreshed",
        description: "RSS documents feed has been updated with latest entries",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh RSS feed",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/court-documents/rss-feed"] });
  };

  const handleDocumentClick = (document: CourtDocument) => {
    setSelectedDocument(document);
    setShowDetailsDialog(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getDocumentTypeIcon = (caseType?: string) => {
    if (caseType?.toLowerCase().includes('civil')) return <Scale className="h-4 w-4" />;
    if (caseType?.toLowerCase().includes('criminal')) return <Gavel className="h-4 w-4" />;
    return <Building className="h-4 w-4" />;
  };

  const getDocumentTypeBadge = (caseType?: string) => {
    if (caseType?.toLowerCase().includes('civil')) 
      return <Badge variant="outline" className="bg-blue-50 text-blue-700">Civil</Badge>;
    if (caseType?.toLowerCase().includes('criminal')) 
      return <Badge variant="outline" className="bg-red-50 text-red-700">Criminal</Badge>;
    return <Badge variant="outline" className="bg-purple-50 text-purple-700">Federal</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* RSS Feed Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">RSS Court Documents Feed</h2>
          <p className="text-muted-foreground">
            Real-time civil, criminal, and federal court documents from Hawaii Federal District Court
          </p>
        </div>
        <Button 
          onClick={() => refreshFeedMutation.mutate()}
          disabled={refreshFeedMutation.isPending}
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshFeedMutation.isPending ? 'animate-spin' : ''}`} />
          Refresh Feed
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Search Client Name</label>
              <Input
                placeholder="Enter client name to search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="w-48">
              <label className="text-sm font-medium mb-2 block">Document Type</label>
              <select 
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Documents</option>
                <option value="civil">Civil Cases</option>
                <option value="criminal">Criminal Cases</option>
                <option value="federal">Federal Cases</option>
              </select>
            </div>
            <Button onClick={handleSearch} size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RSS Feed Statistics */}
      {rssData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Documents</p>
                  <p className="text-2xl font-bold">{rssData.totalFound}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {rssData.breakdown && (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Scale className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Civil Cases</p>
                      <p className="text-2xl font-bold">{rssData.breakdown.civil}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Gavel className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Criminal Cases</p>
                      <p className="text-2xl font-bold">{rssData.breakdown.criminal}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Building className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Federal Cases</p>
                      <p className="text-2xl font-bold">{rssData.breakdown.federal}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Court Documents
            {rssData && (
              <Badge variant="outline" className="ml-auto">
                Last Updated: {formatDate(rssData.lastUpdated)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading RSS feed...</span>
            </div>
          ) : rssData?.documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No court documents found</p>
              <p className="text-sm">Try adjusting your search criteria or refresh the feed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rssData?.documents.map((document, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getDocumentTypeIcon(document.caseType)}
                          <h4 className="font-semibold">{document.name}</h4>
                          {getDocumentTypeBadge(document.caseType)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Case Number:</span>
                            <p>{document.caseNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Court Date:</span>
                            <p>{formatDate(document.courtDate)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Location:</span>
                            <p>{document.courtLocation || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Source:</span>
                            <p>{document.source}</p>
                          </div>
                        </div>
                        
                        {document.charges && (
                          <div className="mt-2">
                            <span className="font-medium text-sm">Charges/Description:</span>
                            <p className="text-sm text-muted-foreground">{document.charges}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDocumentClick(document)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDocument && getDocumentTypeIcon(selectedDocument.caseType)}
              Court Document Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Client Name:</label>
                  <p>{selectedDocument.name}</p>
                </div>
                <div>
                  <label className="font-semibold">Case Number:</label>
                  <p>{selectedDocument.caseNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-semibold">Case Type:</label>
                  <p>{selectedDocument.caseType || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-semibold">Status:</label>
                  <p>{selectedDocument.status || 'Active'}</p>
                </div>
                <div>
                  <label className="font-semibold">Court Date:</label>
                  <p>{formatDate(selectedDocument.courtDate)}</p>
                </div>
                <div>
                  <label className="font-semibold">Court Time:</label>
                  <p>{selectedDocument.courtTime || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <label className="font-semibold">Court Location:</label>
                <p>{selectedDocument.courtLocation || 'N/A'}</p>
              </div>
              
              <div>
                <label className="font-semibold">Source:</label>
                <p>{selectedDocument.source}</p>
              </div>
              
              {selectedDocument.charges && (
                <div>
                  <label className="font-semibold">Charges/Description:</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                    {selectedDocument.charges}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}