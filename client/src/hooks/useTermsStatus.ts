import { useQuery } from "@tanstack/react-query";

export function useTermsStatus() {
  const { data: termsStatus, isLoading } = useQuery({
    queryKey: ["/api/terms/status"],
    retry: false,
  });

  return {
    termsStatus,
    isLoading,
    hasAcknowledged: termsStatus?.acknowledged || false,
    currentVersion: termsStatus?.currentVersion || "2025-06-01",
  };
}