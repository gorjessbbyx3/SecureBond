import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Comprehensive API endpoint integration for production readiness
export const useApiEndpoints = () => {
  const queryClient = useQueryClient();

  // Real-time location tracking
  const useRealTimeLocations = () => {
    return useQuery({
      queryKey: ['/api/admin/client-locations/real-time'],
      refetchInterval: 5000, // Refresh every 5 seconds
    });
  };

  // Geofence violation monitoring
  const useGeofenceCheck = () => {
    return useMutation({
      mutationFn: (clientData: { clientId: string; latitude: number; longitude: number }) =>
        apiRequest(`/api/admin/geofence/check`, {
          method: 'POST',
          body: JSON.stringify(clientData),
        }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/jurisdiction-violations'] });
      },
    });
  };

  // Court scraping configuration
  const useCourtScrapingConfig = () => {
    return useQuery({
      queryKey: ['/api/court-scraping/config'],
    });
  };

  const updateCourtScrapingConfig = useMutation({
    mutationFn: (config: any) =>
      apiRequest(`/api/court-scraping/config`, {
        method: 'PUT',
        body: JSON.stringify(config),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/court-scraping/config'] });
    },
  });

  // Client analytics and behavior tracking
  const useClientBehaviorAnalytics = () => {
    return useQuery({
      queryKey: ['/api/analytics/client-behavior'],
    });
  };

  const useRevenueAnalytics = () => {
    return useQuery({
      queryKey: ['/api/analytics/revenue'],
    });
  };

  // System health monitoring
  const useSystemHealth = () => {
    return useQuery({
      queryKey: ['/api/system/health'],
      refetchInterval: 30000, // Refresh every 30 seconds
    });
  };

  const usePerformanceStats = () => {
    return useQuery({
      queryKey: ['/api/system/performance/stats'],
      refetchInterval: 10000, // Refresh every 10 seconds
    });
  };

  // Security event monitoring
  const useSecurityEvents = () => {
    return useQuery({
      queryKey: ['/api/system/security/events'],
    });
  };

  // Data management operations
  const useDataBackup = () => {
    return useMutation({
      mutationFn: () =>
        apiRequest(`/api/data/backup`, {
          method: 'POST',
        }),
    });
  };

  const useDataExport = () => {
    return useMutation({
      mutationFn: (exportType: string) =>
        apiRequest(`/api/data/export?type=${exportType}`, {
          method: 'GET',
        }),
    });
  };

  // Check-in system
  const useCheckIns = () => {
    return useQuery({
      queryKey: ['/api/check-ins'],
    });
  };

  const createCheckIn = useMutation({
    mutationFn: (checkInData: any) =>
      apiRequest(`/api/check-ins`, {
        method: 'POST',
        body: JSON.stringify(checkInData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/check-ins'] });
    },
  });

  // Court date management
  const useClientCourtDates = (clientId?: string) => {
    return useQuery({
      queryKey: ['/api/client/court-dates', clientId],
      enabled: !!clientId,
    });
  };

  // Payment plan management
  const usePaymentPlans = () => {
    return useQuery({
      queryKey: ['/api/payment-plans'],
    });
  };

  const createPaymentPlan = useMutation({
    mutationFn: (planData: any) =>
      apiRequest(`/api/payment-plans`, {
        method: 'POST',
        body: JSON.stringify(planData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-plans'] });
    },
  });

  // Alert management
  const useUnacknowledgedAlerts = () => {
    return useQuery({
      queryKey: ['/api/alerts/unacknowledged'],
    });
  };

  const acknowledgeAlert = useMutation({
    mutationFn: (alertId: string) =>
      apiRequest(`/api/alerts/${alertId}/acknowledge`, {
        method: 'PUT',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts/unacknowledged'] });
    },
  });

  // Court reminder management
  const useCourtReminders = () => {
    return useQuery({
      queryKey: ['/api/admin/court-reminders'],
    });
  };

  const triggerReminders = useMutation({
    mutationFn: () =>
      apiRequest(`/api/admin/trigger-reminders`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/court-reminders'] });
    },
  });

  // Bond management
  const useClientBonds = (clientId?: string) => {
    return useQuery({
      queryKey: ['/api/client/bonds', clientId],
      enabled: !!clientId,
    });
  };

  const useActiveBonds = () => {
    return useQuery({
      queryKey: ['/api/bonds/active'],
    });
  };

  // Expense tracking
  const useExpenses = () => {
    return useQuery({
      queryKey: ['/api/expenses'],
    });
  };

  const createExpense = useMutation({
    mutationFn: (expenseData: any) =>
      apiRequest(`/api/expenses`, {
        method: 'POST',
        body: JSON.stringify(expenseData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
    },
  });

  // Location pattern analysis
  const useLocationPatterns = () => {
    return useQuery({
      queryKey: ['/api/admin/location/patterns'],
    });
  };

  // Arrest log management
  const usePublicArrestLogs = () => {
    return useQuery({
      queryKey: ['/api/arrest-monitoring/public-logs'],
    });
  };

  const updateArrestLogStatus = useMutation({
    mutationFn: (logData: { logId: string; status: string }) =>
      apiRequest(`/api/arrest-logs/update-status`, {
        method: 'PUT',
        body: JSON.stringify(logData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/arrest-monitoring/public-logs'] });
    },
  });

  // Dashboard activity feed
  const useRecentActivity = () => {
    return useQuery({
      queryKey: ['/api/dashboard/recent-activity'],
      refetchInterval: 15000, // Refresh every 15 seconds
    });
  };

  // Message management
  const useMessages = () => {
    return useQuery({
      queryKey: ['/api/messages'],
    });
  };

  const sendMessage = useMutation({
    mutationFn: (messageData: any) =>
      apiRequest(`/api/messages`, {
        method: 'POST',
        body: JSON.stringify(messageData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
  });

  // Testing endpoints
  const testEmail = useMutation({
    mutationFn: (emailData: { recipient: string }) =>
      apiRequest(`/api/admin/test-email`, {
        method: 'POST',
        body: JSON.stringify(emailData),
      }),
  });

  const testSMS = useMutation({
    mutationFn: (smsData: { phoneNumber: string }) =>
      apiRequest(`/api/admin/test-sms`, {
        method: 'POST',
        body: JSON.stringify(smsData),
      }),
  });

  return {
    // Real-time monitoring
    useRealTimeLocations,
    useGeofenceCheck,
    useSystemHealth,
    usePerformanceStats,
    useSecurityEvents,
    useRecentActivity,

    // Data management
    useDataBackup,
    useDataExport,
    useCheckIns,
    createCheckIn,

    // Analytics
    useClientBehaviorAnalytics,
    useRevenueAnalytics,
    useLocationPatterns,

    // Court management
    useCourtScrapingConfig,
    updateCourtScrapingConfig,
    useClientCourtDates,
    useCourtReminders,
    triggerReminders,

    // Financial management
    usePaymentPlans,
    createPaymentPlan,
    useExpenses,
    createExpense,
    useClientBonds,
    useActiveBonds,

    // Alert management
    useUnacknowledgedAlerts,
    acknowledgeAlert,

    // Communication
    useMessages,
    sendMessage,
    testEmail,
    testSMS,

    // Arrest monitoring
    usePublicArrestLogs,
    updateArrestLogStatus,
  };
};