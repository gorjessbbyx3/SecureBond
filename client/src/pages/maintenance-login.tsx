import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wrench, Lock, User, AlertTriangle, ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import type { LoginResponse, AdminCredentials } from "@/lib/types";

export default function MaintenanceLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (credentials: AdminCredentials): Promise<LoginResponse> => {
      const response = await apiRequest("POST", "/api/auth/admin-login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Welcome back!",
          description: "Successfully signed into maintenance portal.",
        });
        setLocation("/maintenance-dashboard");
      }
    },
    onError: (error) => {
      setLoginError("Invalid maintenance credentials. Please try again.");
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    if (!username || !password) {
      setLoginError("Please enter both username and password.");
      return;
    }

    loginMutation.mutate({ username, password, role: 'maintenance' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Maintenance Portal" subtitle="System Administration" />
      
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="secure-card overflow-hidden">
            {/* Card Header */}
            <div className="professional-gradient px-8 py-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="text-white text-2xl w-8 h-8" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">System Maintenance</h2>
              <p className="text-blue-100 text-sm">Technical support and system updates</p>
            </div>

            {/* Card Body */}
            <CardContent className="px-8 py-8">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Username Field */}
                  <div>
                    <Label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                      Username
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="text-slate-400 w-4 h-4" />
                      </div>
                      <Input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter maintenance username"
                        className="input-secure"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <Label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                      Password
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="text-slate-400 w-4 h-4" />
                      </div>
                      <Input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter maintenance password"
                        className="input-secure"
                        required
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {loginError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Sign In Button */}
                  <Button
                    type="submit"
                    className="btn-primary w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Wrench className="mr-2 w-4 h-4" />
                        Access Maintenance Portal
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Back to Client Portal */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setLocation("/")}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center"
                >
                  <ArrowLeft className="mr-1 w-3 h-3" />
                  Back to Client Portal
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
