import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Upload, CreditCard, AlertCircle } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PaymentFormData } from "@/lib/types";

interface PaymentUploadProps {
  clientId: number;
}

export default function PaymentUpload({ clientId }: PaymentUploadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // Fetch client payments
  const { data: payments, isLoading } = useQuery({
    queryKey: ["/api/clients", clientId, "payments"],
  });

  const paymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData & { clientId: number }) => {
      const response = await apiRequest("POST", "/api/payments", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Payment Submitted",
        description: "Your payment has been submitted for confirmation.",
      });
      setAmount("");
      setPaymentMethod("");
      setNotes("");
      setReceiptFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/clients", clientId, "payments"] });
    },
    onError: (error) => {
      toast({
        title: "Payment Submission Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please enter amount and payment method.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, you would upload the file first and get a URL
    const receiptImageUrl = receiptFile ? "uploaded-receipt-url" : undefined;

    paymentMutation.mutate({
      clientId,
      amount,
      paymentMethod,
      receiptImageUrl,
      notes: notes || undefined,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setReceiptFile(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Submission Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 w-5 h-5" />
            Submit Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Field */}
            <div>
              <Label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-2">
                Payment Amount *
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="text-slate-400 w-4 h-4" />
                </div>
                <Input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Method *
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_deposit">Bank Deposit</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cashapp">CashApp</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="comp">Comp</SelectItem>
                  <SelectItem value="creditcard">Credit Card</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="venmo">Venmo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Receipt Upload */}
            <div>
              <Label htmlFor="receipt" className="block text-sm font-medium text-slate-700 mb-2">
                Receipt Photo (Optional)
              </Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="mt-4">
                    <label htmlFor="receipt" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-slate-900">
                        Upload receipt photo
                      </span>
                      <span className="mt-2 block text-xs text-slate-500">
                        PNG, JPG up to 5MB
                      </span>
                    </label>
                    <input
                      id="receipt"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  {receiptFile && (
                    <div className="mt-2 text-sm text-green-600">
                      Selected: {receiptFile.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes Field */}
            <div>
              <Label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional payment information..."
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={paymentMutation.isPending}
            >
              {paymentMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting Payment...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 w-4 h-4" />
                  Submit Payment
                </>
              )}
            </Button>
          </form>

          {/* Important Notice */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-yellow-600 mt-1 w-4 h-4" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 mb-1">Important</h4>
                <p className="text-xs text-yellow-700">
                  Payments require confirmation by the bondsman. You will be notified once your payment is processed.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-slate-500 mt-2">Loading payment history...</p>
            </div>
          ) : (payments as any[] || []).length > 0 ? (
            <div className="space-y-4">
              {(payments as any[] || []).map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">${payment.amount}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(payment.paymentDate).toLocaleDateString()} • {payment.paymentMethod}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    payment.confirmed 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.confirmed ? 'Confirmed' : 'Pending'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">No payments recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
