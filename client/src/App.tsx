import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import ClientDashboard from "@/pages/client-dashboard";
import ClientDetails from "@/pages/client-details";
import EnhancedAdminDashboard from "@/pages/enhanced-admin-dashboard";
import StaffDashboard from "@/pages/staff-dashboard";
import MaintenanceDashboard from "@/pages/maintenance-dashboard";
import AdminLogin from "@/pages/admin-login";
import StaffLogin from "@/pages/staff-login";
import ClientLogin from "@/pages/client-login";
import MaintenanceLogin from "@/pages/maintenance-login";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/staff-login" component={StaffLogin} />
      <Route path="/client-login" component={ClientLogin} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/maintenance-login" component={MaintenanceLogin} />
      
      {!isLoading && isAuthenticated && (
        <>
          <Route path="/client-dashboard" component={ClientDashboard} />
          <Route path="/client/:id" component={ClientDetails} />
          <Route path="/staff-dashboard" component={StaffDashboard} />
          <Route path="/admin-dashboard" component={EnhancedAdminDashboard} />
          <Route path="/admin" component={EnhancedAdminDashboard} />
          <Route path="/maintenance-dashboard" component={MaintenanceDashboard} />
        </>
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
