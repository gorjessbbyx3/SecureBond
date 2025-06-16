import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import { X, FileText, AlertTriangle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TermsAcknowledgmentBannerProps {
  onAcknowledge: () => void;
}

export default function TermsAcknowledgmentBanner({ onAcknowledge }: TermsAcknowledgmentBannerProps) {
  const [hasRead, setHasRead] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const acknowledgeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/terms/acknowledge", "POST", {
        version: "2025-06-01",
        userAgent: navigator.userAgent,
      });
    },
    onSuccess: () => {
      toast({
        title: "Terms Acknowledged",
        description: "Thank you for accepting the Terms of Service.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/terms/status"] });
      onAcknowledge();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to acknowledge terms. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAcknowledge = () => {
    if (!hasRead) {
      toast({
        title: "Please confirm",
        description: "You must confirm that you have read the Terms of Service.",
        variant: "destructive",
      });
      return;
    }
    acknowledgeMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full mx-auto">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-amber-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Terms of Service Agreement Required
              </h2>
              
              <p className="text-slate-600 mb-4">
                Before accessing the Aloha Bail Bond management system, you must read and 
                acknowledge our Terms of Service. This agreement outlines important legal 
                information about your use of this application.
              </p>

              <div className="bg-slate-50 p-4 rounded-lg mb-4">
                <h3 className="font-medium text-slate-900 mb-2">Key Points:</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• This application is a digital tool for licensed bail bond companies</li>
                  <li>• It does not provide legal advice or representation</li>
                  <li>• Users are responsible for compliance with all applicable laws</li>
                  <li>• GoJess & Co is not liable for missed court appearances or legal consequences</li>
                </ul>
              </div>

              <div className="flex items-center space-x-3 mb-6">
                <Checkbox 
                  id="terms-read"
                  checked={hasRead}
                  onCheckedChange={(checked) => setHasRead(checked === true)}
                />
                <label htmlFor="terms-read" className="text-sm text-slate-700">
                  I have read and understand the{" "}
                  <Link href="/terms-of-service">
                    <a className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Terms of Service
                    </a>
                  </Link>
                </label>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleAcknowledge}
                  disabled={!hasRead || acknowledgeMutation.isPending}
                  className="flex-1"
                >
                  {acknowledgeMutation.isPending ? "Processing..." : "I Accept the Terms"}
                </Button>
                
                <Link href="/terms-of-service">
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Read Full Terms
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-slate-500 mt-3">
                By clicking "I Accept the Terms", you acknowledge that you have read, 
                understood, and agree to be bound by the Terms of Service.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}