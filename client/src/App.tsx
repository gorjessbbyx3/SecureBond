import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import ClientDashboard from "@/pages/client-dashboard";
import EnhancedAdminDashboard from "@/pages/enhanced-admin-dashboard";
import MaintenanceDashboard from "@/pages/maintenance-dashboard";
import AdminLogin from "@/pages/admin-login";
import MaintenanceLogin from "@/pages/maintenance-login";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/admin-login" component={AdminLogin} />
          <Route path="/maintenance-login" component={MaintenanceLogin} />
        </>
      ) : (
        <>
          <Route path="/" component={Landing} />
          <Route path="/client-dashboard" component={ClientDashboard} />
          <Route path="/admin-dashboard" component={EnhancedAdminDashboard} />
          <Route path="/admin" component={EnhancedAdminDashboard} />
          <Route path="/maintenance-dashboard" component={MaintenanceDashboard} />
          <Route path="/admin-login" component={AdminLogin} />
          <Route path="/maintenance-login" component={MaintenanceLogin} />
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
