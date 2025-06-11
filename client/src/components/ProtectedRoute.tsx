import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingScreen } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Shield, AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'client' | 'maintenance';
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, requiredRole, fallback }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, refetch } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full mx-auto p-6 text-center">
          <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to access this page.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.href = '/'} 
              className="w-full"
            >
              Go to Login
            </Button>
            <Button 
              variant="outline" 
              onClick={() => refetch()} 
              className="w-full"
            >
              Retry Authentication
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full mx-auto p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Insufficient Permissions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have the required permissions to access this page.
            Required role: {requiredRole}, Your role: {user?.role}
          </p>
          <Button 
            onClick={() => window.location.href = '/'} 
            className="w-full"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}