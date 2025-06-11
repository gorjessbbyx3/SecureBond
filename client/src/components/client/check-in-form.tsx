import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, MapPin, Clock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CheckInFormData } from "@/lib/types";

interface CheckInFormProps {
  clientId: number;
}

export default function CheckInForm({ clientId }: CheckInFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const checkInMutation = useMutation({
    mutationFn: async (data: CheckInFormData & { clientId: number }) => {
      const response = await apiRequest("POST", "/api/check-ins", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Check-in Successful",
        description: "Your daily check-in has been recorded.",
      });
      setLocation("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["/api/clients", clientId, "check-ins"] });
    },
    onError: (error) => {
      toast({
        title: "Check-in Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkInMutation.mutate({
      clientId,
      location: location || undefined,
      notes: notes || undefined,
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          toast({
            title: "Location Updated",
            description: "Current location has been added to your check-in.",
          });
        },
        (error) => {
          toast({
            title: "Location Access Denied",
            description: "Please enter your location manually.",
            variant: "destructive",
          });
        }
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="mr-2 w-5 h-5" />
          Daily Check-in
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Time Display */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center text-blue-800">
              <Clock className="mr-2 w-4 h-4" />
              <span className="font-medium">Check-in Time: </span>
              <span className="ml-1">{new Date().toLocaleString()}</span>
            </div>
          </div>

          {/* Location Field */}
          <div>
            <Label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-2">
              Current Location (Optional)
            </Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="text-slate-400 w-4 h-4" />
                </div>
                <Input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your current location"
                  className="pl-10"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                className="shrink-0"
              >
                Use GPS
              </Button>
            </div>
          </div>

          {/* Notes Field */}
          <div>
            <Label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information..."
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full btn-primary"
            disabled={checkInMutation.isPending}
          >
            {checkInMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Recording Check-in...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 w-4 h-4" />
                Complete Check-in
              </>
            )}
          </Button>
        </form>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="text-sm font-medium text-slate-900 mb-2">Check-in Requirements</h4>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• Complete your daily check-in by 11:59 PM</li>
            <li>• Location information helps ensure compliance</li>
            <li>• Contact your bondsman if you cannot check-in</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
