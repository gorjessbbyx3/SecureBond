import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Info, AlertTriangle, X } from "lucide-react";

interface ErrorTooltipProps {
  error: {
    code?: string;
    message?: string;
    field?: string;
    context?: string;
    severity?: 'error' | 'warning' | 'info';
    suggestions?: string[];
    relatedEndpoint?: string;
    timestamp?: Date;
  };
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showOnHover?: boolean;
  persistent?: boolean;
  className?: string;
}

const errorExplanations = {
  // Authentication errors
  'AUTH_INVALID_CREDENTIALS': {
    title: 'Invalid Login Credentials',
    explanation: 'The username/password combination is incorrect or the account may be disabled.',
    causes: [
      'Incorrect password entered',
      'Username may be case-sensitive',
      'Account may be temporarily locked',
      'Caps Lock might be enabled'
    ],
    solutions: [
      'Verify your username is spelled correctly',
      'Check if Caps Lock is enabled',
      'Try resetting your password',
      'Contact support if account is locked'
    ],
    preventive: 'Use a password manager to avoid typos and keep track of credentials.'
  },
  'AUTH_SESSION_EXPIRED': {
    title: 'Session Expired',
    explanation: 'Your login session has expired for security reasons and you need to authenticate again.',
    causes: [
      'Extended period of inactivity',
      'Security timeout reached',
      'System maintenance occurred',
      'Browser storage was cleared'
    ],
    solutions: [
      'Click the login button to authenticate again',
      'Ensure cookies are enabled in your browser',
      'Save your work before the session expires'
    ],
    preventive: 'Stay active in the system or save your work frequently.'
  },
  'AUTH_INSUFFICIENT_PERMISSIONS': {
    title: 'Access Denied',
    explanation: 'Your account does not have the required permissions to access this feature.',
    causes: [
      'User role lacks necessary permissions',
      'Feature requires higher access level',
      'Account permissions were recently changed'
    ],
    solutions: [
      'Contact your supervisor for access approval',
      'Request permission upgrade from system administrator',
      'Use features available to your current role'
    ],
    preventive: 'Review your role permissions with your administrator.'
  },

  // Client data errors
  'CLIENT_NOT_FOUND': {
    title: 'Client Record Not Found',
    explanation: 'The requested client record does not exist in the system or may have been removed.',
    causes: [
      'Client ID was entered incorrectly',
      'Record was deleted or archived',
      'Database synchronization issue',
      'Typo in search criteria'
    ],
    solutions: [
      'Verify the client ID is correct',
      'Check archived records',
      'Try searching with different criteria',
      'Contact data administrator if record should exist'
    ],
    preventive: 'Double-check client IDs and use the search function to locate records.'
  },
  'CLIENT_DUPLICATE_ID': {
    title: 'Duplicate Client ID',
    explanation: 'A client with this ID already exists in the system. Each client must have a unique identifier.',
    causes: [
      'Client ID is already in use',
      'Previous record was not properly archived',
      'Data import contained duplicates'
    ],
    solutions: [
      'Use a different client ID',
      'Check if existing record should be updated instead',
      'Contact administrator to resolve duplicate records'
    ],
    preventive: 'Always verify client ID availability before creating new records.'
  },

  // Court date errors
  'COURT_DATE_PAST': {
    title: 'Invalid Court Date',
    explanation: 'Court dates cannot be scheduled in the past as they must represent future legal proceedings.',
    causes: [
      'Date was entered incorrectly',
      'Wrong year was selected',
      'System clock may be incorrect'
    ],
    solutions: [
      'Select a future date',
      'Verify the current date is correct',
      'For past court dates, use the historical records section'
    ],
    preventive: 'Always double-check dates before submitting court information.'
  },
  'COURT_DATE_CONFLICT': {
    title: 'Court Date Conflict',
    explanation: 'The client already has a court date scheduled at this time, or there is a conflict with existing appointments.',
    causes: [
      'Multiple court dates at same time',
      'Overlapping appointment schedules',
      'Double-booking occurred'
    ],
    solutions: [
      'Choose a different time slot',
      'Reschedule conflicting appointments',
      'Contact court clerk to resolve scheduling conflicts'
    ],
    preventive: 'Check existing schedules before adding new court dates.'
  },

  // Payment errors
  'PAYMENT_INSUFFICIENT_AMOUNT': {
    title: 'Insufficient Payment Amount',
    explanation: 'The payment amount is less than the minimum required or does not meet the outstanding balance.',
    causes: [
      'Amount is below minimum payment',
      'Calculation error in payment amount',
      'Outstanding fees not included'
    ],
    solutions: [
      'Enter the full amount due',
      'Check minimum payment requirements',
      'Include all applicable fees and charges'
    ],
    preventive: 'Review payment schedules and requirements before processing.'
  },
  'PAYMENT_METHOD_INVALID': {
    title: 'Invalid Payment Method',
    explanation: 'The selected payment method is not accepted or is currently unavailable.',
    causes: [
      'Payment method not supported',
      'Credit card expired or invalid',
      'Bank account information incorrect'
    ],
    solutions: [
      'Select an accepted payment method',
      'Update payment information',
      'Contact financial services for assistance'
    ],
    preventive: 'Keep payment methods up to date and verify acceptance before use.'
  },

  // Check-in errors
  'CHECKIN_LOCATION_INVALID': {
    title: 'Invalid Check-in Location',
    explanation: 'The location provided for check-in is outside the allowed geographic boundaries or cannot be verified.',
    causes: [
      'GPS coordinates are inaccurate',
      'Location is outside permitted area',
      'GPS service is unavailable'
    ],
    solutions: [
      'Enable location services on your device',
      'Move to an approved check-in location',
      'Contact your case manager if location should be valid'
    ],
    preventive: 'Ensure GPS is enabled and check-in from approved locations only.'
  },
  'CHECKIN_TOO_FREQUENT': {
    title: 'Check-in Too Frequent',
    explanation: 'Check-ins are being attempted too frequently. Please wait before the next required check-in time.',
    causes: [
      'Multiple check-in attempts in short time',
      'Check-in schedule requirements not met',
      'System preventing spam check-ins'
    ],
    solutions: [
      'Wait for the next scheduled check-in time',
      'Review your check-in schedule requirements',
      'Contact case manager if urgent check-in is needed'
    ],
    preventive: 'Follow your assigned check-in schedule and avoid unnecessary attempts.'
  },

  // System errors
  'NETWORK_ERROR': {
    title: 'Network Connection Error',
    explanation: 'Unable to connect to the server. This may be due to internet connectivity issues or server maintenance.',
    causes: [
      'Internet connection is unstable',
      'Server is under maintenance',
      'Firewall blocking connection',
      'DNS resolution issues'
    ],
    solutions: [
      'Check your internet connection',
      'Try refreshing the page',
      'Wait a few minutes and try again',
      'Contact IT support if problem persists'
    ],
    preventive: 'Ensure stable internet connection and save work frequently.'
  },
  'VALIDATION_ERROR': {
    title: 'Data Validation Error',
    explanation: 'The information provided does not meet the required format or validation rules.',
    causes: [
      'Required fields are missing',
      'Data format is incorrect',
      'Values exceed maximum limits',
      'Invalid characters used'
    ],
    solutions: [
      'Fill in all required fields',
      'Check data formatting requirements',
      'Remove invalid characters',
      'Ensure values are within acceptable ranges'
    ],
    preventive: 'Review field requirements and use suggested formats.'
  }
};

export default function ErrorTooltip({
  error,
  children,
  position = 'top',
  showOnHover = true,
  persistent = false,
  className
}: ErrorTooltipProps) {
  const [isVisible, setIsVisible] = useState(persistent);
  const [isDismissed, setIsDismissed] = useState(false);

  const errorInfo = errorExplanations[error.code as keyof typeof errorExplanations];
  
  const getSeverityIcon = () => {
    switch (error.severity) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (isDismissed && !persistent) return <>{children}</>;

  return (
    <div 
      className={cn("relative inline-block", className)}
      onMouseEnter={() => showOnHover && setIsVisible(true)}
      onMouseLeave={() => showOnHover && !persistent && setIsVisible(false)}
    >
      {children}
      
      {isVisible && (error.message || error.code) && (
        <div className={cn(
          "absolute z-50 w-80 p-4 bg-white border border-gray-200 rounded-lg shadow-lg",
          "dark:bg-gray-800 dark:border-gray-700",
          getPositionClasses()
        )}>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getSeverityIcon()}
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {errorInfo?.title || error.code || 'Error'}
              </h3>
            </div>
            {!persistent && (
              <button
                onClick={() => setIsDismissed(true)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Error Details */}
          <div className="space-y-3">
            {/* Main Message */}
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {error.message || errorInfo?.explanation}
            </p>

            {/* Context Information */}
            {error.context && (
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                <strong>Context:</strong> {error.context}
              </div>
            )}

            {/* Detailed Explanation */}
            {errorInfo && (
              <div className="space-y-2">
                {errorInfo.causes && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-800 dark:text-gray-200 mb-1">
                      Possible Causes:
                    </h4>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {errorInfo.causes.map((cause, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-gray-400 mt-1">•</span>
                          <span>{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {errorInfo.solutions && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-800 dark:text-gray-200 mb-1">
                      Solutions:
                    </h4>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {errorInfo.solutions.map((solution, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>{solution}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {errorInfo.preventive && (
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <h4 className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Prevention:
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {errorInfo.preventive}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Custom Suggestions */}
            {error.suggestions && (
              <div>
                <h4 className="text-xs font-medium text-gray-800 dark:text-gray-200 mb-1">
                  Suggestions:
                </h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {error.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-blue-500 mt-1">→</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technical Details */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                {error.field && (
                  <span><strong>Field:</strong> {error.field}</span>
                )}
                {error.relatedEndpoint && (
                  <span><strong>Endpoint:</strong> {error.relatedEndpoint}</span>
                )}
                {error.timestamp && (
                  <span><strong>Time:</strong> {formatTimestamp(error.timestamp)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Tooltip Arrow */}
          <div className={cn(
            "absolute w-2 h-2 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 transform rotate-45",
            position === 'top' && "top-full left-1/2 -translate-x-1/2 -mt-1",
            position === 'bottom' && "bottom-full left-1/2 -translate-x-1/2 -mb-1",
            position === 'left' && "left-full top-1/2 -translate-y-1/2 -ml-1",
            position === 'right' && "right-full top-1/2 -translate-y-1/2 -mr-1"
          )} />
        </div>
      )}
    </div>
  );
}