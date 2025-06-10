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
      {/* Animated Jail Door Background */}
      <div className="fixed inset-0 z-0">
        {/* Dark concrete background */}
        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
        
        {/* Jail door container */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Door frame */}
          <div className="relative w-96 h-[600px] bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-lg shadow-2xl border-4 border-gray-800">
            
            {/* Animated door that slams shut */}
            <div className="jail-door absolute inset-2 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded border-2 border-gray-900 overflow-hidden">
              
              {/* Vertical bars */}
              <div className="absolute inset-0 grid grid-cols-8 gap-2 p-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-gradient-to-b from-gray-600 via-gray-500 to-gray-600 rounded-full shadow-lg border border-gray-400"></div>
                ))}
              </div>
              
              {/* Horizontal bars */}
              <div className="absolute inset-0 flex flex-col justify-evenly px-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-3 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded-full shadow-lg border border-gray-400"></div>
                ))}
              </div>
              
              {/* Lock mechanism */}
              <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                <div className="lock-mechanism w-8 h-8 bg-gradient-to-br from-yellow-600 via-yellow-500 to-yellow-700 rounded-full border-2 border-yellow-800 shadow-lg">
                  <div className="w-3 h-3 bg-yellow-800 rounded-full mx-auto mt-2.5"></div>
                </div>
              </div>
              
              {/* Sound effect waves when door slams */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="sound-effect absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-red-500 rounded-full opacity-0"></div>
                <div className="sound-effect absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-3 border-orange-500 rounded-full opacity-0" style={{animationDelay: '0.1s'}}></div>
                <div className="sound-effect absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-yellow-500 rounded-full opacity-0" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
            
            {/* Heavy duty hinges */}
            <div className="absolute left-0 top-16 w-6 h-12 bg-gradient-to-r from-gray-800 to-gray-600 rounded-r border border-gray-900 shadow-lg"></div>
            <div className="absolute left-0 top-40 w-6 h-12 bg-gradient-to-r from-gray-800 to-gray-600 rounded-r border border-gray-900 shadow-lg"></div>
            <div className="absolute left-0 bottom-40 w-6 h-12 bg-gradient-to-r from-gray-800 to-gray-600 rounded-r border border-gray-900 shadow-lg"></div>
            <div className="absolute left-0 bottom-16 w-6 h-12 bg-gradient-to-r from-gray-800 to-gray-600 rounded-r border border-gray-900 shadow-lg"></div>
          </div>
        </div>
        
        {/* Dramatic lighting effects */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"></div>
      </div>

      <Header />
      
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Main Sign In Card */}
          <Card className="secure-card overflow-hidden backdrop-blur-sm bg-white/95 shadow-2xl border-2 border-gray-300">
            {/* Card Header */}
            <div className="professional-gradient px-8 py-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCircle className="text-white text-2xl w-8 h-8" />
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

      <Footer />
    </div>
  );
}
