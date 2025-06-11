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
      if ((data as any).role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/staff-dashboard");
      }
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${(data as any).firstName || (data as any).email}!`,
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-20 bg-white bg-opacity-5"></div>
      </div>

      <Header 
        title="Aloha Bail Bond Staff" 
        subtitle="Professional Bail Bond Management System" 
      />
      
      <main className="relative container mx-auto px-4 py-8 flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
              <Users className="h-10 w-10 text-white" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white tracking-wide">
                ALOHA BAIL BOND
              </h1>
              <div className="flex items-center justify-center gap-2">
                <div className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent flex-1"></div>
                <h2 className="text-2xl font-semibold text-white/90 px-4">
                  Staff Portal
                </h2>
                <div className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent flex-1"></div>
              </div>
              <p className="text-white/70 text-lg">
                Professional Bail Bond Management System
              </p>
              
              {/* Security badges */}
              <div className="flex justify-center gap-2 mt-4">
                <Badge variant="outline" className="bg-white/10 border-white/20 text-white/80">
                  <Lock className="h-3 w-3 mr-1" />
                  Secure Access
                </Badge>
                <Badge variant="outline" className="bg-white/10 border-white/20 text-white/80">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  CJIS Compliant
                </Badge>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Users className="h-5 w-5" />
                Staff Login
              </CardTitle>
              <CardDescription className="text-gray-600">
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