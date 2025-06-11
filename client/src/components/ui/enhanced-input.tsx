import React, { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ErrorTooltip from "@/components/ui/error-tooltip";
import { useErrorContext } from "@/hooks/useErrorContext";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorKey?: string;
  helperText?: string;
  required?: boolean;
  variant?: 'default' | 'error' | 'warning' | 'success';
}

const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ label, errorKey, helperText, required, variant = 'default', className, ...props }, ref) => {
    const { getError } = useErrorContext();
    const error = errorKey ? getError(errorKey) : undefined;
    
    const hasError = error || variant === 'error';
    const hasWarning = variant === 'warning';
    const hasSuccess = variant === 'success';

    const inputVariant = hasError ? 'error' : hasWarning ? 'warning' : hasSuccess ? 'success' : 'default';

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={props.id} className={cn(
            "text-sm font-medium",
            hasError && "text-red-600 dark:text-red-400",
            hasWarning && "text-yellow-600 dark:text-yellow-400"
          )}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
          <ErrorTooltip
            error={error || { message: '', severity: 'error' }}
            position="top"
            showOnHover={!!error}
            persistent={false}
          >
            <Input
              ref={ref}
              className={cn(
                className,
                hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                hasWarning && "border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20",
                hasSuccess && "border-green-500 focus:border-green-500 focus:ring-green-500/20"
              )}
              {...props}
            />
            {hasError && (
              <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
            )}
          </ErrorTooltip>
        </div>

        {helperText && !error && (
          <p className={cn(
            "text-xs",
            hasWarning ? "text-yellow-600 dark:text-yellow-400" : "text-gray-500 dark:text-gray-400"
          )}>
            {helperText}
          </p>
        )}

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {error.message}
          </p>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = "EnhancedInput";

export { EnhancedInput };