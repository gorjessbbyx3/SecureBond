import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "@/pages/landing";
import ClientDashboard from "@/pages/client-dashboard";
import ClientDetails from "@/pages/client-details";
import AdminDashboard from "@/pages/enhanced-admin-dashboard";
import StaffDashboard from "@/pages/staff-dashboard";
import MaintenanceDashboard from "@/pages/maintenance-dashboard";
import AdminLogin from "@/pages/admin-login";
import StaffLogin from "@/pages/staff-login";
import ClientLogin from "@/pages/client-login";
import MaintenanceLogin from "@/pages/maintenance-login";
import TermsOfService from "@/pages/terms-of-service";
import ClientPortalPreview from "@/pages/client-portal-preview";
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
      <Route path="/terms-of-service" component={TermsOfService} />
      
      {/* Protected routes with role-based access control */}
      <Route path="/client-dashboard">
        <ProtectedRoute requiredRole="client">
          <ClientDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/client/:id">
        <ProtectedRoute>
          <ClientDetails />
        </ProtectedRoute>
      </Route>
      <Route path="/staff-dashboard">
        <ProtectedRoute requiredRole="admin">
          <StaffDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin-dashboard">
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/client-portal-preview">
        <ProtectedRoute>
          <ClientPortalPreview />
        </ProtectedRoute>
      </Route>
      <Route path="/maintenance-dashboard">
        <ProtectedRoute requiredRole="maintenance">
          <MaintenanceDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
