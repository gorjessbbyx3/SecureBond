import { useState, useCallback, useContext, createContext } from "react";

export interface ErrorContext {
  code?: string;
  message?: string;
  field?: string;
  context?: string;
  severity?: 'error' | 'warning' | 'info';
  suggestions?: string[];
  relatedEndpoint?: string;
  timestamp?: Date;
}

interface ErrorContextState {
  errors: Map<string, ErrorContext>;
  addError: (key: string, error: ErrorContext) => void;
  removeError: (key: string) => void;
  getError: (key: string) => ErrorContext | undefined;
  clearErrors: () => void;
  hasErrors: () => boolean;
}

const ErrorContextContext = createContext<ErrorContextState | undefined>(undefined);

export function useErrorContext(): ErrorContextState {
  const context = useContext(ErrorContextContext);
  if (!context) {
    throw new Error('useErrorContext must be used within an ErrorContextProvider');
  }
  return context;
}

export function useErrorContextProvider(): ErrorContextState {
  const [errors, setErrors] = useState<Map<string, ErrorContext>>(new Map());

  const addError = useCallback((key: string, error: ErrorContext) => {
    setErrors(prev => new Map(prev.set(key, {
      ...error,
      timestamp: error.timestamp || new Date()
    })));
  }, []);

  const removeError = useCallback((key: string) => {
    setErrors(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const getError = useCallback((key: string) => {
    return errors.get(key);
  }, [errors]);

  const clearErrors = useCallback(() => {
    setErrors(new Map());
  }, []);

  const hasErrors = useCallback(() => {
    return errors.size > 0;
  }, [errors]);

  return {
    errors,
    addError,
    removeError,
    getError,
    clearErrors,
    hasErrors
  };
}

export { ErrorContextContext };

// Error code mapping utility
export function mapApiErrorToContext(
  apiError: any, 
  endpoint?: string, 
  field?: string
): ErrorContext {
  const timestamp = new Date();
  
  // Handle different error response formats
  let code: string;
  let message: string;
  let suggestions: string[] = [];

  if (typeof apiError === 'string') {
    message = apiError;
    code = 'GENERIC_ERROR';
  } else if (apiError?.response?.data) {
    message = apiError.response.data.message || apiError.response.data.error || 'Unknown error';
    code = apiError.response.data.code || `HTTP_${apiError.response.status}`;
  } else if (apiError?.message) {
    message = apiError.message;
    code = apiError.code || 'NETWORK_ERROR';
  } else {
    message = 'An unexpected error occurred';
    code = 'UNKNOWN_ERROR';
  }

  // Map HTTP status codes to specific error codes
  if (apiError?.response?.status) {
    const status = apiError.response.status;
    switch (status) {
      case 401:
        code = message.toLowerCase().includes('session') ? 'AUTH_SESSION_EXPIRED' : 'AUTH_INVALID_CREDENTIALS';
        break;
      case 403:
        code = 'AUTH_INSUFFICIENT_PERMISSIONS';
        break;
      case 404:
        if (field === 'clientId' || message.toLowerCase().includes('client')) {
          code = 'CLIENT_NOT_FOUND';
        }
        break;
      case 409:
        if (message.toLowerCase().includes('duplicate') || message.toLowerCase().includes('exists')) {
          code = 'CLIENT_DUPLICATE_ID';
        }
        break;
      case 422:
        code = 'VALIDATION_ERROR';
        break;
      case 500:
      case 502:
      case 503:
        code = 'NETWORK_ERROR';
        break;
    }
  }

  // Add context-specific suggestions
  if (endpoint) {
    if (endpoint.includes('/auth/')) {
      suggestions.push('Verify your credentials are correct');
      suggestions.push('Check if your account is active');
    } else if (endpoint.includes('/client/')) {
      suggestions.push('Ensure the client record exists');
      suggestions.push('Verify you have permission to access this client');
    } else if (endpoint.includes('/payment/')) {
      suggestions.push('Check payment amount and method');
      suggestions.push('Verify account balance is sufficient');
    }
  }

  return {
    code,
    message,
    field,
    context: getContextFromEndpoint(endpoint),
    severity: getSeverityFromCode(code),
    suggestions: suggestions.length > 0 ? suggestions : undefined,
    relatedEndpoint: endpoint,
    timestamp
  };
}

function getContextFromEndpoint(endpoint?: string): string | undefined {
  if (!endpoint) return undefined;
  
  if (endpoint.includes('/auth/')) return 'User Authentication';
  if (endpoint.includes('/client/')) return 'Client Management';
  if (endpoint.includes('/staff/')) return 'Staff Operations';
  if (endpoint.includes('/admin/')) return 'Administrative Functions';
  if (endpoint.includes('/payment/')) return 'Payment Processing';
  if (endpoint.includes('/court-date/')) return 'Court Date Management';
  if (endpoint.includes('/check-in/')) return 'Check-in System';
  if (endpoint.includes('/monitoring/')) return 'Monitoring & Alerts';
  
  return 'System Operation';
}

function getSeverityFromCode(code: string): 'error' | 'warning' | 'info' {
  if (code.includes('AUTH_INSUFFICIENT_PERMISSIONS')) return 'warning';
  if (code.includes('VALIDATION_ERROR')) return 'warning';
  if (code.includes('DUPLICATE')) return 'warning';
  if (code.includes('NOT_FOUND')) return 'info';
  
  return 'error';
}