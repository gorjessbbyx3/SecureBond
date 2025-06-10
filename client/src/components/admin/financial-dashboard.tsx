import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Plus, Edit, Trash2, Check, X, TrendingUp, TrendingDown, Calendar, Receipt, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const expenseFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.string().min(1, "Amount is required"),
  category: z.string().optional(),
  expenseDate: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface Payment {
  id: number;
  clientId: number;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
  receiptImageUrl?: string;
  confirmed: boolean;
  confirmedBy?: string;
  confirmedAt?: string;
  notes?: string;
  client?: {
    fullName: string;
    clientId: string;
  };
}

interface Expense {
  id: number;
  description: string;
  amount: string;
  category?: string;
  expenseDate: string;
  createdBy: string;
  createdAt: string;
}

export default function FinancialDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [activeTab, setActiveTab] = useState("overview");

  const expenseForm = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: "",
      amount: "",
      category: "",
      expenseDate: new Date().toISOString().split('T')[0],
    },
  });

  // Fetch payments
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["/api/payments"],
  });

  // Fetch expenses
  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["/api/expenses"],
  });

  // Confirm payment mutation
  const confirmPaymentMutation = useMutation({
    mutationFn: async ({ id, confirmedBy }: { id: number; confirmedBy: string }) => {
      const response = await apiRequest("PUT", `/api/payments/${id}/confirm`, { confirmedBy });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Confirmed",
        description: "Payment has been confirmed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Confirm Payment",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      const response = await apiRequest("POST", "/api/expenses", {
        ...data,
        amount: parseFloat(data.amount),
        expenseDate: data.expenseDate ? new Date(data.expenseDate).toISOString() : new Date().toISOString(),
        createdBy: "admin", // In real app, get from session
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Expense Added",
        description: "Expense has been recorded successfully.",
      });
      expenseForm.reset();
      setIsExpenseDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Expense",
        description: "Please check the information and try again.",
        variant: "destructive",
      });
    },
  });

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ExpenseFormData> }) => {
      const response = await apiRequest("PUT", `/api/expenses/${id}`, {
        ...data,
        amount: data.amount ? parseFloat(data.amount) : undefined,
        expenseDate: data.expenseDate ? new Date(data.expenseDate).toISOString() : undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Expense Updated",
        description: "Expense has been updated successfully.",
      });
      setEditingExpense(null);
      expenseForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Expense",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Expense Deleted",
        description: "Expense has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Expense",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleExpenseSubmit = (data: ExpenseFormData) => {
    if (editingExpense) {
      updateExpenseMutation.mutate({ id: editingExpense.id, data });
    } else {
      createExpenseMutation.mutate(data);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    expenseForm.reset({
      description: expense.description,
      amount: expense.amount,
      category: expense.category || "",
      expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0],
    });
    setIsExpenseDialogOpen(true);
  };

  const handleCancelExpenseEdit = () => {
    setEditingExpense(null);
    expenseForm.reset();
    setIsExpenseDialogOpen(false);
  };

  // Calculate financial stats
  const totalRevenue = payments?.reduce((sum: number, payment: Payment) => {
    return payment.confirmed ? sum + parseFloat(payment.amount) : sum;
  }, 0) || 0;

  const pendingRevenue = payments?.reduce((sum: number, payment: Payment) => {
    return !payment.confirmed ? sum + parseFloat(payment.amount) : sum;
  }, 0) || 0;

  const totalExpenses = expenses?.reduce((sum: number, expense: Expense) => {
    return sum + parseFloat(expense.amount);
  }, 0) || 0;

  const netProfit = totalRevenue - totalExpenses;

  const pendingPayments = payments?.filter((payment: Payment) => !payment.confirmed) || [];
  const recentPayments = payments?.slice(0, 10) || [];

  const getPaymentStatusBadge = (payment: Payment) => {
    if (payment.confirmed) {
      return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Financial Dashboard</h2>
          <p className="text-slate-600">Monitor payments, expenses, and financial performance</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Expenses</p>
                <p className="text-2xl font-bold text-slate-900">${totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Net Profit</p>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${netProfit.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Pending Revenue</p>
                <p className="text-2xl font-bold text-slate-900">${pendingRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : recentPayments.length > 0 ? (
                  <div className="space-y-3">
                    {recentPayments.slice(0, 5).map((payment: Payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">${parseFloat(payment.amount).toLocaleString()}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(payment.paymentDate).toLocaleDateString()} • {payment.paymentMethod}
                          </p>
                        </div>
                        {getPaymentStatusBadge(payment)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-4">No payments recorded yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                {expensesLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : expenses?.length > 0 ? (
                  <div className="space-y-3">
                    {expenses.slice(0, 5).map((expense: Expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(expense.expenseDate).toLocaleDateString()}
                            {expense.category && ` • ${expense.category}`}
                          </p>
                        </div>
                        <p className="font-semibold text-red-600">-${parseFloat(expense.amount).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-4">No expenses recorded yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          {/* Pending Payments Section */}
          {pendingPayments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Pending Payment Confirmations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingPayments.map((payment: Payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">${parseFloat(payment.amount).toLocaleString()}</p>
                            <p className="text-sm text-slate-600">
                              {new Date(payment.paymentDate).toLocaleDateString()} • {payment.paymentMethod}
                            </p>
                          </div>
                          {payment.receiptImageUrl && (
                            <Button variant="outline" size="sm">
                              <Eye className="w-3 h-3 mr-1" />
                              View Receipt
                            </Button>
                          )}
                        </div>
                        {payment.notes && (
                          <p className="text-sm text-slate-500 mt-2">{payment.notes}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => confirmPaymentMutation.mutate({ id: payment.id, confirmedBy: "admin" })}
                          disabled={confirmPaymentMutation.isPending}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Confirm
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Payments */}
          <Card>
            <CardHeader>
              <CardTitle>All Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-slate-500 mt-2">Loading payments...</p>
                </div>
              ) : payments?.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment: Payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {payment.client ? (
                              <div>
                                <p className="font-medium">{payment.client.fullName}</p>
                                <p className="text-sm text-slate-500">{payment.client.clientId}</p>
                              </div>
                            ) : (
                              <span className="text-slate-400">Unknown</span>
                            )}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${parseFloat(payment.amount).toLocaleString()}
                          </TableCell>
                          <TableCell>{payment.paymentMethod}</TableCell>
                          <TableCell>{getPaymentStatusBadge(payment)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {!payment.confirmed && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => confirmPaymentMutation.mutate({ id: payment.id, confirmedBy: "admin" })}
                                  disabled={confirmPaymentMutation.isPending}
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                              )}
                              {payment.receiptImageUrl && (
                                <Button variant="outline" size="sm">
                                  <Receipt className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-2 text-sm font-medium text-slate-900">No payments found</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Payments will appear here when clients submit them.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          {/* Add Expense Button */}
          <div className="flex justify-end">
            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <Plus className="mr-2 w-4 h-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={expenseForm.handleSubmit(handleExpenseSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Input
                      id="description"
                      {...expenseForm.register("description")}
                      placeholder="Office supplies, utilities, etc."
                    />
                    {expenseForm.formState.errors.description && (
                      <p className="text-sm text-red-600">{expenseForm.formState.errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        {...expenseForm.register("amount")}
                        placeholder="0.00"
                      />
                      {expenseForm.formState.errors.amount && (
                        <p className="text-sm text-red-600">{expenseForm.formState.errors.amount.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={expenseForm.watch("category")}
                        onValueChange={(value) => expenseForm.setValue("category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="office">Office Supplies</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
                          <SelectItem value="legal">Legal Fees</SelectItem>
                          <SelectItem value="travel">Travel</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="expenseDate">Date</Label>
                    <Input
                      id="expenseDate"
                      type="date"
                      {...expenseForm.register("expenseDate")}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    {editingExpense && (
                      <Button type="button" variant="outline" onClick={handleCancelExpenseEdit}>
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={createExpenseMutation.isPending || updateExpenseMutation.isPending}
                    >
                      {(createExpenseMutation.isPending || updateExpenseMutation.isPending) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {editingExpense ? "Updating..." : "Adding..."}
                        </>
                      ) : (
                        editingExpense ? "Update Expense" : "Add Expense"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Expenses Table */}
          <Card>
            <CardHeader>
              <CardTitle>Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {expensesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-slate-500 mt-2">Loading expenses...</p>
                </div>
              ) : expenses?.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense: Expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>
                            {new Date(expense.expenseDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium">{expense.description}</TableCell>
                          <TableCell>
                            {expense.category ? (
                              <Badge variant="outline">{expense.category}</Badge>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="font-semibold text-red-600">
                            -${parseFloat(expense.amount).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditExpense(expense)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this expense? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteExpenseMutation.mutate(expense.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingDown className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-2 text-sm font-medium text-slate-900">No expenses found</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Get started by adding your first expense.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
