import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MapPin, DollarSign, Calendar, AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface QuickActionsBarProps {
  clientId: number;
  emergencyContact?: string;
  nextPaymentDue?: string;
  nextCourtDate?: string;
}

export function QuickActionsBar({ clientId, emergencyContact, nextPaymentDue, nextCourtDate }: QuickActionsBarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const checkInMutation = useMutation({
    mutationFn: async () => {
      // Get current location
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const checkInData = {
                clientId,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                checkInTime: new Date().toISOString()
              };
              await apiRequest("POST", "/api/check-ins", checkInData);
              resolve(checkInData);
            },
            (error) => reject(error)
          );
        } else {
          reject(new Error("Geolocation not supported"));
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/check-ins"] });
      toast({
        title: "Check-in successful",
        description: "Your location has been recorded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Check-in failed",
        description: error.message || "Unable to record your location. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEmergencyContact = () => {
    if (emergencyContact) {
      window.location.href = `tel:${emergencyContact}`;
    }
  };

  return (
    <Card className="sticky top-4 z-10 shadow-lg border-2 border-blue-200 dark:border-blue-800">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2 justify-center md:justify-between items-center">
          {/* Emergency Contact */}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEmergencyContact}
            className="gap-2"
            data-testid="button-emergency-contact"
          >
            <AlertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Emergency</span>
          </Button>

          {/* Quick Check-in */}
          <Button
            variant="default"
            size="sm"
            onClick={() => checkInMutation.mutate()}
            disabled={checkInMutation.isPending}
            className="gap-2 bg-green-600 hover:bg-green-700"
            data-testid="button-quick-checkin"
          >
            <MapPin className="h-4 w-4" />
            {checkInMutation.isPending ? "Checking in..." : "Check In"}
          </Button>

          {/* Make Payment */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("#payments")}
            className="gap-2"
            data-testid="button-make-payment"
          >
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">
              {nextPaymentDue ? `Due: ${new Date(nextPaymentDue).toLocaleDateString()}` : "Pay Now"}
            </span>
            <span className="sm:hidden">Pay</span>
          </Button>

          {/* View Court Dates */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("#court-dates")}
            className="gap-2"
            data-testid="button-court-dates"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">
              {nextCourtDate ? `Next: ${new Date(nextCourtDate).toLocaleDateString()}` : "Court Dates"}
            </span>
            <span className="sm:hidden">Court</span>
          </Button>

          {/* Contact Bondsman */}
          <a href="tel:8089473977" className="contents">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              data-testid="button-contact-bondsman"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Contact</span>
            </Button>
          </a>
        </div>

        {/* Info Bar */}
        <div className="mt-3 pt-3 border-t text-xs text-center text-muted-foreground">
          <div className="flex flex-wrap justify-center gap-4">
            {nextPaymentDue && (
              <span>Next Payment: <strong>{new Date(nextPaymentDue).toLocaleDateString()}</strong></span>
            )}
            {nextCourtDate && (
              <span>Next Court: <strong>{new Date(nextCourtDate).toLocaleDateString()}</strong></span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
