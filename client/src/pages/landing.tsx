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
      {/* Jail Cell Window Background - Waikiki Beach View */}
      <div className="fixed inset-0 z-0">
        {/* Waikiki Beach background - paradise view */}
        <div className="w-full h-full bg-gradient-to-b from-sky-400 via-sky-300 to-cyan-300">
          {/* Ocean waves */}
          <div className="absolute bottom-0 w-full h-2/3 bg-gradient-to-t from-blue-600 via-blue-400 to-cyan-300">
            <div className="absolute inset-0 opacity-60">
              <div className="waikiki-waves absolute bottom-0 w-full h-20 bg-gradient-to-t from-blue-700 to-transparent"></div>
              <div className="waikiki-waves absolute bottom-16 w-full h-8 bg-gradient-to-t from-blue-500 to-transparent opacity-70"></div>
              <div className="waikiki-waves absolute bottom-32 w-full h-6 bg-gradient-to-t from-blue-400 to-transparent opacity-50"></div>
            </div>
          </div>
          
          {/* Diamond Head silhouette */}
          <div className="absolute bottom-0 right-0 w-96 h-64 bg-gradient-to-t from-green-800 via-green-700 to-green-600 opacity-80" 
               style={{clipPath: 'polygon(0% 100%, 30% 40%, 60% 60%, 100% 100%)'}}>
          </div>
          
          {/* Palm trees with animation */}
          <div className="absolute bottom-0 left-20 w-8 h-48 bg-gradient-to-t from-amber-800 to-amber-700"></div>
          <div className="absolute bottom-36 left-16 w-32 h-4 bg-green-600 rounded-full transform -rotate-12 palm-tree"></div>
          <div className="absolute bottom-32 left-24 w-28 h-4 bg-green-600 rounded-full transform rotate-12 palm-tree"></div>
          
          <div className="absolute bottom-0 right-32 w-6 h-32 bg-gradient-to-t from-amber-800 to-amber-700"></div>
          <div className="absolute bottom-24 right-28 w-24 h-3 bg-green-600 rounded-full transform -rotate-25 palm-tree"></div>
          <div className="absolute bottom-28 right-36 w-20 h-3 bg-green-600 rounded-full transform rotate-20 palm-tree"></div>
          
          {/* Tropical clouds with animation */}
          <div className="absolute top-20 left-1/4 w-32 h-16 bg-white rounded-full opacity-70 tropical-cloud"></div>
          <div className="absolute top-32 right-1/3 w-24 h-12 bg-white rounded-full opacity-60 tropical-cloud"></div>
          <div className="absolute top-16 right-1/4 w-20 h-10 bg-white rounded-full opacity-50 tropical-cloud"></div>
          
          {/* Sunlight rays with animation */}
          <div className="absolute top-10 right-20 w-2 h-48 bg-yellow-300 opacity-30 transform rotate-45 sun-ray"></div>
          <div className="absolute top-16 right-32 w-1 h-32 bg-yellow-300 opacity-20 transform rotate-30 sun-ray"></div>
          <div className="absolute top-12 right-16 w-1 h-40 bg-yellow-300 opacity-25 transform rotate-60 sun-ray"></div>
        </div>
        
        {/* Jail cell window frame and bars overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Window frame - concrete cell wall */}
          <div className="relative w-[800px] h-[600px] bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 shadow-2xl">
            
            {/* Window opening */}
            <div className="absolute inset-8 bg-black/20 shadow-inner">
              
              {/* Heavy prison bars */}
              <div className="absolute inset-0 grid grid-cols-7 gap-4 p-6">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="bg-gradient-to-b from-gray-500 via-gray-400 to-gray-500 rounded-full shadow-2xl border-2 border-gray-600 relative jail-bars">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"></div>
                  </div>
                ))}
              </div>
              
              {/* Horizontal security bars */}
              <div className="absolute inset-0 flex flex-col justify-evenly px-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 rounded-full shadow-2xl border-2 border-gray-600 relative jail-bars">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent rounded-full"></div>
                  </div>
                ))}
              </div>
              
              {/* Window ledge */}
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-800 to-gray-700 border-t-2 border-gray-600"></div>
              
              {/* Cell number plate */}
              <div className="absolute top-4 right-4 bg-yellow-600 text-black font-bold text-xs px-2 py-1 rounded shadow-lg cell-plate">
                ALOHA BAIL BOND
              </div>
            </div>
            
            {/* Window frame depth and shadows */}
            <div className="absolute -inset-2 bg-gradient-to-br from-gray-800 to-gray-900 -z-10 rounded"></div>
            <div className="absolute -inset-4 bg-gradient-to-br from-gray-900 to-black -z-20 rounded-lg"></div>
          </div>
        </div>
        
        {/* Interior cell lighting */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-gray-900/30 to-gray-900/60"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl"></div>
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
