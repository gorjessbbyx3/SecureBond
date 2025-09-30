import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Shield, UserCircle, Lock as LockIcon, IdCard, Eye, EyeOff, ArrowRight, UserRoundCheck, Wrench, Users, AlertTriangle, Phone, MapPin } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import type { LoginResponse, ClientCredentials } from "@/lib/types";
import logoImage from "@assets/ChatGPT Image Jun 9, 2025, 08_07_36 PM_1749535833870.png";
import headerBgImage from "@assets/1B9B4163-2685-48D8-97EC-A717439897AD_1759220450849.png";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientId, setClientId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const formatHSTTime = () => {
    return currentTime.toLocaleString('en-US', {
      timeZone: 'Pacific/Honolulu',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }) + ' HST';
  };

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

  const navigateToStaffLogin = () => {
    setLocation("/staff-login");
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
          <div className="flex items-center justify-between">
            {/* Lock Icon Dropdown - Top Left */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <LockIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={navigateToAdminLogin} className="cursor-pointer">
                  <UserRoundCheck className="mr-2 h-4 w-4" />
                  <span>Admin Portal</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={navigateToStaffLogin} className="cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Staff Portal</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={navigateToMaintenanceLogin} className="cursor-pointer">
                  <Wrench className="mr-2 h-4 w-4" />
                  <span>Maintenance Portal</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Center - Company Name */}
            <div className="flex-1 text-center flex flex-col items-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-wide">
                ART OF BAIL
              </h1>
              <p className="text-blue-100 text-sm">Professional Bail Bond Services</p>
              <p className="text-blue-200 text-xs mt-1">{formatHSTTime()}</p>
            </div>

            {/* Right - Spacer for balance */}
            <div className="w-10"></div>
          </div>
        </div>
      </header>
      
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Main Sign In Card */}
          <Card className="secure-card overflow-hidden backdrop-blur-sm bg-white/95 shadow-2xl border-2 border-gray-300">
            {/* Card Header */}
            <div className="relative px-8 py-16 text-center overflow-hidden min-h-[240px] bg-gradient-to-b from-slate-800 to-slate-900">
              <div className="absolute inset-0 z-0">
                <img 
                  src={headerBgImage} 
                  alt="Art of Bail - Freedom Starts Here" 
                  className="w-full h-full object-contain opacity-90"
                />
              </div>
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
                        <LockIcon className="text-slate-400 w-4 h-4" />
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

          {/* Call Art of Bail Button */}
          <div className="mt-8">
            {isMobile ? (
              <a href="tel:8089473977" className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Art of Bail
                </Button>
              </a>
            ) : (
              <Card className="bg-white rounded-lg shadow-md border border-slate-200">
                <CardContent className="p-6">
                  <div className="text-center space-y-3">
                    <h3 className="text-lg font-semibold text-slate-900">Need Immediate Assistance?</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center text-slate-700">
                        <Phone className="mr-2 h-4 w-4" />
                        <a href="tel:8089473977" className="text-blue-600 hover:text-blue-800 font-medium">
                          (808) 947-3977
                        </a>
                      </div>
                      <div className="flex items-center justify-center text-slate-700">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span className="text-sm">1136 Union Mall Ste 304, Honolulu, HI 96813</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Company Footer */}
      <footer className="relative z-10 bg-gradient-to-r from-blue-900/90 to-blue-800/90 backdrop-blur-sm border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="text-white">
              <p className="text-sm font-medium">1136 Union Mall Ste 304, Honolulu, HI 96813</p>
              <p className="text-sm mt-1">(808) 947-3977</p>
              <p className="text-sm mt-1">
                <a href="http://artofbailhawaii.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors">
                  artofbailhawaii.com
                </a>
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-blue-100 text-xs">
                © 2024 Art of Bail. Licensed and bonded bail bond services.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
