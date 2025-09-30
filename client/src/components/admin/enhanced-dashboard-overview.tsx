
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  DollarSign, 
  FileText, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  TrendingUp,
  Users
} from 'lucide-react';
import { Link } from 'wouter';

interface ClientActivity {
  id: number;
  fullName: string;
  clientId: string;
  lastCheckIn?: string;
  nextCourtDate?: string;
  pendingPayments: number;
  totalOwed: number;
  documentsCount: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive' | 'warning';
}

export function EnhancedDashboardOverview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('lastActivity');

  // Fetch comprehensive client data
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ['/api/check-ins'],
  });

  const { data: courtDates = [] } = useQuery({
    queryKey: ['/api/court-dates'],
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['/api/payments'],
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['/api/documents'],
  });

  // Process and enrich client data
  const enrichedClients = useMemo(() => {
    return clients.map((client: any) => {
      const clientCheckIns = checkIns.filter((c: any) => c.clientId === client.id);
      const clientCourtDates = courtDates.filter((cd: any) => cd.clientId === client.id);
      const clientPayments = payments.filter((p: any) => p.clientId === client.id);
      const clientDocuments = documents.filter((d: any) => d.clientId === client.id);

      const lastCheckIn = clientCheckIns
        .sort((a: any, b: any) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime())[0];

      const upcomingCourtDates = clientCourtDates
        .filter((cd: any) => new Date(cd.courtDate) > new Date())
        .sort((a: any, b: any) => new Date(a.courtDate).getTime() - new Date(b.courtDate).getTime());

      const pendingPayments = clientPayments.filter((p: any) => !p.confirmed);
      const totalOwed = pendingPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

      // Calculate risk level
      const daysSinceLastCheckIn = lastCheckIn 
        ? Math.floor((Date.now() - new Date(lastCheckIn.checkInTime).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      const daysUntilCourtDate = upcomingCourtDates[0]
        ? Math.floor((new Date(upcomingCourtDates[0].courtDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 999;

      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      let status: 'active' | 'inactive' | 'warning' = 'active';

      if (daysSinceLastCheckIn > 7 || daysUntilCourtDate < 3 || totalOwed > 1000) {
        riskLevel = 'high';
        status = 'warning';
      } else if (daysSinceLastCheckIn > 3 || daysUntilCourtDate < 7 || totalOwed > 500) {
        riskLevel = 'medium';
      }

      if (!client.isActive) {
        status = 'inactive';
      }

      return {
        ...client,
        lastCheckIn: lastCheckIn?.checkInTime,
        nextCourtDate: upcomingCourtDates[0]?.courtDate,
        pendingPayments: pendingPayments.length,
        totalOwed,
        documentsCount: clientDocuments.length,
        riskLevel,
        status,
        daysSinceLastCheckIn,
        daysUntilCourtDate
      };
    });
  }, [clients, checkIns, courtDates, payments, documents]);

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    let filtered = enrichedClients.filter((client: any) => {
      const matchesSearch = client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.clientId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || 
                           (filterStatus === 'high-risk' && client.riskLevel === 'high') ||
                           (filterStatus === 'pending-payments' && client.pendingPayments > 0) ||
                           (filterStatus === 'upcoming-court' && client.daysUntilCourtDate < 7) ||
                           (filterStatus === 'overdue-checkin' && client.daysSinceLastCheckIn > 7);
      
      return matchesSearch && matchesFilter;
    });

    // Sort clients
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'risk':
          const riskOrder = { high: 3, medium: 2, low: 1 };
          return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
        case 'courtDate':
          return a.daysUntilCourtDate - b.daysUntilCourtDate;
        case 'payments':
          return b.totalOwed - a.totalOwed;
        case 'checkIn':
          return b.daysSinceLastCheckIn - a.daysSinceLastCheckIn;
        default:
          return new Date(b.lastCheckIn || 0).getTime() - new Date(a.lastCheckIn || 0).getTime();
      }
    });

    return filtered;
  }, [enrichedClients, searchTerm, filterStatus, sortBy]);

  const getRiskBadge = (riskLevel: string) => {
    const variants = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    };
    return <Badge variant={variants[riskLevel as keyof typeof variants] as any}>{riskLevel.toUpperCase()}</Badge>;
  };

  const getStatusIcon = (client: any) => {
    if (client.status === 'warning') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (client.status === 'inactive') return <Clock className="h-4 w-4 text-gray-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold">{enrichedClients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">
                  {enrichedClients.filter((c: any) => c.riskLevel === 'high').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold">
                  ${enrichedClients.reduce((sum: number, c: any) => sum + c.totalOwed, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Court</p>
                <p className="text-2xl font-bold">
                  {enrichedClients.filter((c: any) => c.daysUntilCourtDate < 7).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Client Activity Dashboard</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="high-risk">High Risk</SelectItem>
                <SelectItem value="pending-payments">Pending Payments</SelectItem>
                <SelectItem value="upcoming-court">Upcoming Court</SelectItem>
                <SelectItem value="overdue-checkin">Overdue Check-in</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastActivity">Last Activity</SelectItem>
                <SelectItem value="risk">Risk Level</SelectItem>
                <SelectItem value="courtDate">Court Date</SelectItem>
                <SelectItem value="payments">Payment Amount</SelectItem>
                <SelectItem value="checkIn">Check-in Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Client List */}
          <div className="space-y-4">
            {clientsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading clients...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No clients found matching your criteria.</p>
              </div>
            ) : (
              filteredClients.map((client: any) => (
                <Card key={client.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {getStatusIcon(client)}
                          <Link href={`/client/${client.id}`}>
                            <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
                              {client.fullName}
                            </h3>
                          </Link>
                          {getRiskBadge(client.riskLevel)}
                          <Badge variant="outline" className="text-xs">
                            ID: {client.clientId}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-gray-600">Last Check-in</p>
                              <p className="font-medium">
                                {client.lastCheckIn 
                                  ? `${client.daysSinceLastCheckIn} days ago`
                                  : 'Never'
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-gray-600">Next Court Date</p>
                              <p className="font-medium">
                                {client.nextCourtDate 
                                  ? `${client.daysUntilCourtDate} days`
                                  : 'None scheduled'
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-gray-600">Pending Payments</p>
                              <p className="font-medium">
                                {client.pendingPayments > 0 
                                  ? `$${client.totalOwed.toLocaleString()}`
                                  : 'Up to date'
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-gray-600">Documents</p>
                              <p className="font-medium">{client.documentsCount} files</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Link href={`/client/${client.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </Link>
                        
                        {client.riskLevel === 'high' && (
                          <Button variant="destructive" size="sm">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Take Action
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
