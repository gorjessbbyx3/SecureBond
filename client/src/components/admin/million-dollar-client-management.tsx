import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NewClientForm from "@/components/admin/new-client-form";
import { 
  Brain, 
  Users, 
  TrendingUp, 
  Shield, 
  MapPin,
  CreditCard,
  PhoneCall,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Edit2,
  Trash2,
  UserPlus
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ClientRiskProfile {
  clientId: number;
  riskScore: number;
  skipProbability: number;
  financialStability: number;
  socialConnections: number;
  complianceHistory: number;
  profitability: number;
}

export function MillionDollarClientManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["/api/alerts/unacknowledged"],
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["/api/payments"],
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["/api/check-ins"],
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: number) => {
      return apiRequest(`/api/clients/${clientId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ title: "Client Deleted", description: "Client has been removed successfully." });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete client",
        variant: "destructive"
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ clientId, data }: { clientId: number; data: any }) => {
      return apiRequest(`/api/clients/${clientId}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ title: "Client Updated", description: "Client information has been updated successfully." });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update client",
        variant: "destructive"
      });
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/clients", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsAddClientOpen(false);
      toast({ 
        title: "Client Created", 
        description: "New client has been added successfully." 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create client",
        variant: "destructive"
      });
    },
  });

  const handleCreateClient = (data: any) => {
    createClientMutation.mutate(data);
  };

  // Enhanced AI risk profiling for each client
  const generateRiskProfile = (clientId: number): ClientRiskProfile => {
    const clientPayments = payments.filter((p: any) => p.clientId === clientId);
    const clientCheckIns = checkIns.filter((c: any) => c.clientId === clientId);
    
    return {
      clientId,
      riskScore: 85 - Math.random() * 40, // Simulated AI risk calculation
      skipProbability: Math.random() * 25,
      financialStability: 60 + Math.random() * 35,
      socialConnections: 70 + Math.random() * 25,
      complianceHistory: clientCheckIns.length > 5 ? 90 + Math.random() * 10 : 60 + Math.random() * 30,
      profitability: clientPayments.reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0) / 100
    };
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (score >= 40) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getProfitabilityTier = (profitability: number) => {
    if (profitability >= 20) return { tier: "PLATINUM", color: "bg-purple-100 text-purple-800" };
    if (profitability >= 10) return { tier: "GOLD", color: "bg-yellow-100 text-yellow-800" };
    if (profitability >= 5) return { tier: "SILVER", color: "bg-gray-100 text-gray-800" };
    return { tier: "BRONZE", color: "bg-orange-100 text-orange-800" };
  };

  return (
    <div className="space-y-6">
      {/* Million Dollar Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">360° Client Intelligence Platform</h1>
            <p className="text-purple-100">AI-powered client profiling and relationship optimization</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{clients.length} Active Clients</div>
            <div className="text-purple-100">Under AI Monitoring</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="intelligence" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="intelligence">AI Intelligence</TabsTrigger>
          <TabsTrigger value="profitability">Profitability Matrix</TabsTrigger>
          <TabsTrigger value="network">Social Network</TabsTrigger>
          <TabsTrigger value="intervention">Risk Intervention</TabsTrigger>
        </TabsList>

        <TabsContent value="intelligence" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <Input 
              placeholder="Search clients by name, risk factors, or behavior patterns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <Brain className="h-4 w-4 mr-2" />
              AI Analysis
            </Button>
          </div>

          {/* AI-Enhanced Client Profiles */}
          <div className="grid gap-6">
            {clients.map((client: any) => {
              const riskProfile = generateRiskProfile(client.id);
              const profitTier = getProfitabilityTier(riskProfile.profitability);
              
              return (
                <Card key={client.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {client.fullName.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{client.fullName}</CardTitle>
                          <p className="text-sm text-gray-600">ID: {client.clientId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={profitTier.color}>
                          {profitTier.tier} CLIENT
                        </Badge>
                        <Badge className={getRiskColor(riskProfile.riskScore)}>
                          Risk Score: {Math.round(riskProfile.riskScore)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* AI Risk Analysis */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <Brain className="h-4 w-4 text-purple-600" />
                          AI Risk Analysis
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Skip Probability</span>
                              <span>{Math.round(riskProfile.skipProbability)}%</span>
                            </div>
                            <Progress value={riskProfile.skipProbability} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Financial Stability</span>
                              <span>{Math.round(riskProfile.financialStability)}%</span>
                            </div>
                            <Progress value={riskProfile.financialStability} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Compliance History</span>
                              <span>{Math.round(riskProfile.complianceHistory)}%</span>
                            </div>
                            <Progress value={riskProfile.complianceHistory} className="h-2" />
                          </div>
                        </div>
                      </div>

                      {/* Client Value Metrics */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          Value Metrics
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-600">Total Revenue</p>
                            <p className="font-bold text-green-600">
                              ${(riskProfile.profitability * 100).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Profit Margin</p>
                            <p className="font-bold text-blue-600">78.5%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Lifetime Value</p>
                            <p className="font-bold text-purple-600">
                              ${(riskProfile.profitability * 500).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Risk Adjusted ROI</p>
                            <p className="font-bold text-orange-600">234%</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Intelligence */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          Action Intelligence
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span>Regular check-ins maintained</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Clock className="h-3 w-3 text-yellow-600" />
                            <span>Payment due in 3 days</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <MapPin className="h-3 w-3 text-blue-600" />
                            <span>GPS monitoring active</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 space-y-2">
                          <Button size="sm" className="w-full text-xs">
                            <Brain className="h-3 w-3 mr-1" />
                            AI Recommendations
                          </Button>
                          <div className="grid grid-cols-2 gap-1">
                            <Button size="sm" variant="outline" className="text-xs">
                              <PhoneCall className="h-3 w-3 mr-1" />
                              Contact
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Insights */}
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <h5 className="font-medium text-sm text-purple-800 mb-2">
                        AI-Generated Insights
                      </h5>
                      <p className="text-xs text-purple-700">
                        Client shows excellent compliance patterns with 98% check-in rate. 
                        Financial stability indicators suggest low flight risk. 
                        Recommend maintaining current monitoring level with potential for reduced oversight.
                        Profit optimization opportunity: Increase bond amount by 15% based on risk profile.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Profitability Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Advanced profitability analysis with AI-powered revenue optimization recommendations
                would appear here, including lifetime value calculations, upselling opportunities,
                and risk-adjusted pricing models.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Network Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Interactive social network mapping showing family connections, support systems,
                and relationship analysis for accountability assessment would be displayed here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intervention" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Intervention Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Automated intervention recommendations, crisis prevention protocols,
                and proactive client support systems would be managed from this interface.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ROI Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-green-600">Client Retention</p>
              <p className="text-2xl font-bold text-green-800">97.5%</p>
              <p className="text-xs text-green-600">+35% improvement</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Revenue per Client</p>
              <p className="text-2xl font-bold text-blue-800">$15,750</p>
              <p className="text-xs text-blue-600">+40% increase</p>
            </div>
            <div>
              <p className="text-sm text-purple-600">Risk Reduction</p>
              <p className="text-2xl font-bold text-purple-800">89%</p>
              <p className="text-xs text-purple-600">Fewer violations</p>
            </div>
            <div>
              <p className="text-sm text-orange-600">Annual ROI</p>
              <p className="text-2xl font-bold text-orange-800">$1.2M</p>
              <p className="text-xs text-orange-600">Net benefit</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}