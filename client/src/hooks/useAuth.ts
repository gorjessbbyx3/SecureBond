import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AuthUser {
  id: string;
  role: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  clientId?: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error, refetch } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('401')) return false;
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", { 
        method: "POST", 
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.clear();
      window.location.href = "/";
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    isAdmin: user?.role === 'admin',
    isClient: user?.role === 'client',
    isMaintenance: user?.role === 'maintenance',
    logout,
    refetch,
    error,
  };
}
