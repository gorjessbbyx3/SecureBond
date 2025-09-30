import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  DollarSign, 
  TrendingUp, 
  Search,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Receipt,
  Filter,
  Download
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Payment {
  id: number;
  clientId: number;
  amount: string;
  paymentMethod: string;
  confirmed: boolean;
  paymentDate: string;
  description?: string;
}

interface Client {
  id: number;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  bondAmount?: string;
}

export function MillionDollarFinancial() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Calculate financial metrics
  const confirmedPayments = payments.filter((payment: Payment) => payment.confirmed === true);
  const pendingPayments = payments.filter((payment: Payment) => payment.confirmed === false);
  
  const totalRevenue = confirmedPayments.reduce((sum: number, payment: Payment) => 
    sum + parseFloat(payment.amount || "0"), 0
  );
  
  const pendingAmount = pendingPayments.reduce((sum: number, payment: Payment) => 
    sum + parseFloat(payment.amount || "0"), 0
  );

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  // Get client name by ID
  const getClientName = (clientId: number) => {
    const client = clients.find((c: Client) => c.id === clientId);
    return client?.fullName || `Client #${clientId}`;
  };

  // Filter payments based on search and status
  const filteredPayments = payments.filter((payment: Payment) => {
    const matchesSearch = searchTerm === "" || 
      getClientName(payment.clientId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "confirmed" && payment.confirmed) ||
      (filterStatus === "pending" && !payment.confirmed);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Client Payment Tracker</h1>
            <p className="text-green-100">Real-time payment monitoring and revenue management</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="text-green-100">Total Revenue Collected</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Confirmed Payments</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-green-600 dark:text-green-400">{confirmedPayments.length} transactions</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending Payments</p>
                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                  {formatCurrency(pendingAmount)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-yellow-600 dark:text-yellow-400">{pendingPayments.length} awaiting confirmation</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Payments</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{payments.length}</p>
              </div>
              <Receipt className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-blue-600 dark:text-blue-400">All time transactions</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Active Clients</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{clients.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-purple-600 dark:text-purple-400">Paying clients</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Tracker */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Payment Transactions
              </CardTitle>
              <CardDescription>Track and manage all client payments</CardDescription>
            </div>
            <Button variant="outline" size="sm" data-testid="button-export-payments">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by client name or payment method..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-payments"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
                data-testid="button-filter-all"
              >
                All
              </Button>
              <Button
                variant={filterStatus === "confirmed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("confirmed")}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-filter-confirmed"
              >
                Confirmed
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("pending")}
                className="bg-yellow-600 hover:bg-yellow-700"
                data-testid="button-filter-pending"
              >
                Pending
              </Button>
            </div>
          </div>

          {/* Payments List */}
          <div className="space-y-3">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="font-medium">No payments found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredPayments.map((payment: Payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                  data-testid={`payment-row-${payment.id}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      payment.confirmed 
                        ? "bg-green-100 dark:bg-green-900" 
                        : "bg-yellow-100 dark:bg-yellow-900"
                    }`}>
                      {payment.confirmed ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-gray-100" data-testid={`text-client-name-${payment.id}`}>
                          {getClientName(payment.clientId)}
                        </p>
                        <Badge 
                          className={payment.confirmed ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"}
                          data-testid={`badge-status-${payment.id}`}
                        >
                          {payment.confirmed ? "Confirmed" : "Pending"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {payment.paymentMethod}
                        </span>
                        {payment.paymentDate && (
                          <span>
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </span>
                        )}
                        {payment.description && (
                          <span className="text-gray-500 dark:text-gray-500">
                            {payment.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100" data-testid={`text-amount-${payment.id}`}>
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary Stats */}
          {filteredPayments.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Showing {filteredPayments.length} of {payments.length} payments
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  Total: {formatCurrency(
                    filteredPayments.reduce((sum: number, p: Payment) => 
                      sum + parseFloat(p.amount || "0"), 0
                    )
                  )}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Payment Methods
          </CardTitle>
          <CardDescription>Revenue breakdown by payment type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from(new Set(payments.map((p: Payment) => p.paymentMethod))).map((method: string) => {
              const methodPayments = payments.filter((p: Payment) => p.paymentMethod === method);
              const methodTotal = methodPayments.reduce((sum: number, p: Payment) => 
                sum + parseFloat(p.amount || "0"), 0
              );
              const percentage = totalRevenue > 0 ? (methodTotal / totalRevenue) * 100 : 0;
              
              return (
                <div key={method} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{method}</span>
                    <div className="text-right">
                      <span className="font-bold">{formatCurrency(methodTotal)}</span>
                      <span className="text-xs text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <span className="text-xs text-gray-500">{methodPayments.length} transactions</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
