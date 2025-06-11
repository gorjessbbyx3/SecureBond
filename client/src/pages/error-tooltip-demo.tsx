import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { useErrorContext } from "@/hooks/useErrorContext";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

export default function ErrorTooltipDemo() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { addError, removeError, clearErrors, hasErrors } = useErrorContext();

  const simulateValidationErrors = () => {
    clearErrors();
    
    // Add various types of errors to demonstrate tooltips
    addError("email", {
      code: "INVALID_EMAIL",
      message: "Please enter a valid email address",
      field: "email",
      context: "The email format should include @ symbol and domain",
      severity: "error",
      suggestions: [
        "Check for typos in your email address",
        "Ensure you include @domain.com",
        "Try a different email format"
      ],
      relatedEndpoint: "/api/auth/register",
      timestamp: new Date()
    });

    addError("password", {
      code: "WEAK_PASSWORD",
      message: "Password does not meet security requirements",
      field: "password",
      context: "Passwords must be at least 8 characters with mixed case, numbers, and symbols",
      severity: "warning",
      suggestions: [
        "Use at least 8 characters",
        "Include uppercase and lowercase letters",
        "Add numbers and special symbols",
        "Avoid common dictionary words"
      ],
      relatedEndpoint: "/api/auth/register",
      timestamp: new Date()
    });

    addError("confirmPassword", {
      code: "PASSWORD_MISMATCH",
      message: "Passwords do not match",
      field: "confirmPassword",
      context: "The confirmation password must exactly match your chosen password",
      severity: "error",
      suggestions: [
        "Re-type your password carefully",
        "Check for caps lock",
        "Ensure both fields match exactly"
      ],
      relatedEndpoint: "/api/auth/register",
      timestamp: new Date()
    });
  };

  const simulateNetworkError = () => {
    clearErrors();
    
    addError("email", {
      code: "NETWORK_ERROR",
      message: "Unable to verify email address",
      field: "email",
      context: "Network connection issue prevented email verification",
      severity: "error",
      suggestions: [
        "Check your internet connection",
        "Try again in a moment",
        "Contact support if issue persists"
      ],
      relatedEndpoint: "/api/auth/check-email",
      timestamp: new Date()
    });
  };

  const simulateSuccess = () => {
    clearErrors();
    
    addError("email", {
      code: "SUCCESS",
      message: "Email address is valid and available",
      field: "email",
      context: "This email can be used for registration",
      severity: "info",
      suggestions: [],
      relatedEndpoint: "/api/auth/check-email",
      timestamp: new Date()
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Contextual Error Tooltip Demo
            </CardTitle>
            <CardDescription>
              This demo showcases the contextual error explanation tooltip system. 
              Hover over fields with errors to see detailed guidance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Demo Form */}
            <form className="space-y-4">
              <EnhancedInput
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  removeError("email");
                }}
                placeholder="user@example.com"
                errorKey="email"
                helperText="Enter your email for account registration"
                required
              />

              <EnhancedInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  removeError("password");
                }}
                placeholder="Enter a secure password"
                errorKey="password"
                helperText="Must be at least 8 characters with mixed case and numbers"
                required
              />

              <EnhancedInput
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  removeError("confirmPassword");
                }}
                placeholder="Re-enter your password"
                errorKey="confirmPassword"
                helperText="Must match your password exactly"
                required
              />
            </form>

            {/* Demo Controls */}
            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">Test Error Scenarios</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  onClick={simulateValidationErrors}
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  Show Validation Errors
                </Button>

                <Button
                  onClick={simulateNetworkError}
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  Show Network Error
                </Button>

                <Button
                  onClick={simulateSuccess}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Show Success State
                </Button>

                <Button
                  onClick={clearErrors}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Info className="h-4 w-4" />
                  Clear All Errors
                </Button>
              </div>
            </div>

            {/* Status Display */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Error Context Status:</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  hasErrors() 
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" 
                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                }`}>
                  {hasErrors() ? "Errors Present" : "No Errors"}
                </span>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                How to Test:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Click "Show Validation Errors" to see different error types</li>
                <li>• Hover over input fields to see contextual tooltips</li>
                <li>• Start typing in fields to automatically clear errors</li>
                <li>• Test different error severities (error, warning, info)</li>
                <li>• View detailed suggestions and guidance in tooltips</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}