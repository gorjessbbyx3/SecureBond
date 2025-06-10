import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, UserCircle, Lock, IdCard, Eye, EyeOff, ArrowRight, UserRoundCheck, Wrench, AlertTriangle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import type { LoginResponse, ClientCredentials } from "@/lib/types";
import logoImage from "@assets/ChatGPT Image Jun 9, 2025, 08_07_36 PM_1749535833870.png";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientId, setClientId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (credentials: ClientCredentials): Promise<LoginResponse> => {
      const response = await apiRequest("POST", "/api/auth/client-login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Welcome back!",
          description: "Successfully signed into your account.",
        });
        setLocation("/client-dashboard");
      }
    },
    onError: (error) => {
      setLoginError("Invalid credentials. Please check your Client ID and password.");
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
    
    if (!clientId || !password) {
      setLoginError("Please enter both Client ID and password.");
      return;
    }

    loginMutation.mutate({ clientId, password });
  };

  const navigateToAdminLogin = () => {
    setLocation("/admin-login");
  };

  const navigateToMaintenanceLogin = () => {
    setLocation("/maintenance-login");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Jail Cell Window Background - Waikiki Beach View */}
      <div className="fixed inset-0 z-0">
        {/* Hawaii background */}
        <div className="w-full h-full">
          <img 
            src="https://www.limaone.com/wp-content/uploads/iStock-624711274-scaled-1-1707x1707.jpg"
            alt="Hawaii paradise view"
            className="w-full h-full object-cover"
          />
        </div>
        

        

      </div>

      {/* Company Header */}
      <header className="relative z-10 bg-gradient-to-r from-blue-900/90 to-blue-800/90 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="text-center flex flex-col items-center">
              <img 
                src={logoImage} 
                alt="Aloha Bail Bonds Logo" 
                className="h-16 md:h-20 w-auto mb-2 filter drop-shadow-lg grayscale brightness-0 invert"
              />
              <p className="text-blue-100 text-sm">Professional Bail Bond Services</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Main Sign In Card */}
          <Card className="secure-card overflow-hidden backdrop-blur-sm bg-white/95 shadow-2xl border-2 border-gray-300">
            {/* Card Header */}
            <div className="professional-gradient px-8 py-6 text-center">
              <div className="w-24 h-20 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-4 p-3">
                <img 
                  src={logoImage} 
                  alt="Aloha Bail Bonds" 
                  className="h-full w-auto object-contain filter grayscale brightness-0 invert"
                />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Client Portal</h2>
              <p className="text-blue-100 text-sm">Secure access to your account</p>
            </div>

            {/* Card Body */}
            <CardContent className="px-8 py-8">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Client ID Field */}
                  <div>
                    <Label htmlFor="clientId" className="block text-sm font-medium text-slate-700 mb-2">
                      Client ID
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IdCard className="text-slate-400 w-4 h-4" />
                      </div>
                      <Input
                        type="text"
                        id="clientId"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="Enter your Client ID"
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
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="input-secure pr-12"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="text-slate-400 hover:text-slate-600 transition-colors w-4 h-4" />
                        ) : (
                          <Eye className="text-slate-400 hover:text-slate-600 transition-colors w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Help */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label htmlFor="rememberMe" className="text-sm text-slate-600">
                        Remember me
                      </Label>
                    </div>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                      Need help?
                    </a>
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
                        <Shield className="mr-2 w-4 h-4" />
                        Access My Account
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start space-x-3">
                  <Shield className="text-green-600 mt-1 w-4 h-4" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 mb-1">Secure Connection</h4>
                    <p className="text-xs text-slate-600">
                      Your information is protected with bank-level encryption and security protocols.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Access Links */}
          <div className="mt-8 space-y-3">
            {/* Admin Access */}
            <Card className="bg-white rounded-lg shadow-md border border-slate-200">
              <CardContent className="p-4">
                <button
                  onClick={navigateToAdminLogin}
                  className="flex items-center justify-between group hover:bg-slate-50 -m-4 p-4 rounded-lg transition-colors w-full text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                      <UserRoundCheck className="text-slate-600 w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-900">Admin Access</h3>
                      <p className="text-xs text-slate-500">Bondsman administration portal</p>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-400 group-hover:text-slate-600 transition-colors w-4 h-4" />
                </button>
              </CardContent>
            </Card>

            {/* Maintenance Access */}
            <Card className="bg-white rounded-lg shadow-md border border-slate-200">
              <CardContent className="p-4">
                <button
                  onClick={navigateToMaintenanceLogin}
                  className="flex items-center justify-between group hover:bg-slate-50 -m-4 p-4 rounded-lg transition-colors w-full text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                      <Wrench className="text-slate-600 w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-900">System Maintenance</h3>
                      <p className="text-xs text-slate-500">Technical support and system updates</p>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-400 group-hover:text-slate-600 transition-colors w-4 h-4" />
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Company Footer */}
      <footer className="relative z-10 bg-gradient-to-r from-blue-900/90 to-blue-800/90 backdrop-blur-sm border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="text-white">
              <p className="text-sm font-medium">1325 Nuuanu Ave. Ste 214, Honolulu, HI 96817</p>
              <p className="text-sm mt-1">(808) 392-1468</p>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-blue-100 text-xs">
                © 2024 Aloha Bail Bond. Licensed and bonded bail bond services in Hawaii.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
