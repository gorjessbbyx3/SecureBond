import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Users, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function StaffLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async ({ email, password, role }: { email: string; password: string; role: string }) => {
      return await apiRequest("/api/staff/login", "POST", { email, password, role });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data);
      
      // Redirect based on role
      if (data.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/staff-dashboard");
      }
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.firstName || data.email}!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please check your email and password.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ email, password, role });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        title="SecureBond Staff" 
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
              Staff Portal
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Access your staff dashboard
            </p>
          </div>

          {/* Login Form */}
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Login
              </CardTitle>
              <CardDescription>
                Enter your credentials to access the staff portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-2">
                  <Label>Access Level</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={role === "staff" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRole("staff")}
                      className="flex-1"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Staff
                    </Button>
                    <Button
                      type="button"
                      variant={role === "admin" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRole("admin")}
                      className="flex-1"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@alohabailbond.com"
                    required
                  />
                </div>

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

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Demo Credentials</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Admin:</span>
                    <code className="text-blue-800">admin@alohabailbond.com / admin123</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Staff:</span>
                    <code className="text-blue-800">staff@alohabailbond.com / staff123</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Access Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Are you a client?
            </p>
            <Button 
              variant="outline" 
              onClick={() => setLocation("/client-login")}
              className="w-full"
            >
              Access Client Portal
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}