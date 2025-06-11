import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Lock, Phone, AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function ClientLogin() {
  const [, setLocation] = useLocation();
  const [clientId, setClientId] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loginMethod, setLoginMethod] = useState<"id" | "phone">("id");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async ({ clientId, password, phoneNumber }: { clientId?: string; password?: string; phoneNumber?: string }) => {
      if (loginMethod === "id") {
        return await apiRequest("/api/client/login", "POST", { clientId, password });
      } else {
        return await apiRequest("/api/client/login-phone", "POST", { phoneNumber, password });
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data);
      setLocation("/client-dashboard");
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.fullName}!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginMethod === "id") {
      if (!clientId || !password) {
        toast({
          title: "Missing Information",
          description: "Please enter both Client ID and password.",
          variant: "destructive",
        });
        return;
      }
      loginMutation.mutate({ clientId, password });
    } else {
      if (!phoneNumber || !password) {
        toast({
          title: "Missing Information",
          description: "Please enter both phone number and password.",
          variant: "destructive",
        });
        return;
      }
      loginMutation.mutate({ phoneNumber, password });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        title="Aloha Bail Bond Client" 
        subtitle="Professional Bail Bond Management System" 
      />
      
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100 tracking-wide">
              ALOHA BAIL BOND
            </h1>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Client Portal
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Access your account information
            </p>
          </div>

          {/* Login Form */}
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Client Login
              </CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Login Method Selection */}
                <div className="space-y-2">
                  <Label>Login Method</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={loginMethod === "id" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLoginMethod("id")}
                      className="flex-1"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Client ID
                    </Button>
                    <Button
                      type="button"
                      variant={loginMethod === "phone" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLoginMethod("phone")}
                      className="flex-1"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Phone Number
                    </Button>
                  </div>
                </div>

                {/* Client ID or Phone Number */}
                {loginMethod === "id" ? (
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input
                      id="clientId"
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="SB123456789A"
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="(808) 555-0123"
                      required
                    />
                  </div>
                )}

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              {/* Help Information */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <p>• Your Client ID starts with "SB" followed by numbers and letters</p>
                  <p>• Your password was provided when you signed your bond contract</p>
                  <p>• Contact us at (808) 555-BAIL if you need assistance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Access Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Are you a staff member?
            </p>
            <Button 
              variant="outline" 
              onClick={() => setLocation("/staff-login")}
              className="w-full"
            >
              Access Staff Portal
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}