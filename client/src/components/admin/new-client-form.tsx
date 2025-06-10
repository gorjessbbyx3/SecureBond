import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface ClientFormData {
  fullName: string;
  clientId: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  courtLocation?: string;
  charges?: string;
  isActive: boolean;
  missedCheckIns: number;
}

interface NewClientFormProps {
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
  editingClient?: any;
}

export default function NewClientForm({ onSubmit, onCancel, isLoading, editingClient }: NewClientFormProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<ClientFormData>({
    fullName: editingClient?.fullName || "",
    clientId: editingClient?.clientId || "",
    phoneNumber: editingClient?.phoneNumber || "",
    address: editingClient?.address || "",
    dateOfBirth: editingClient?.dateOfBirth || "",
    emergencyContact: editingClient?.emergencyContact || "",
    emergencyPhone: editingClient?.emergencyPhone || "",
    courtLocation: editingClient?.courtLocation || "",
    charges: editingClient?.charges || "",
    isActive: editingClient?.isActive ?? true,
    missedCheckIns: editingClient?.missedCheckIns || 0,
  });

  const handleInputChange = (field: keyof ClientFormData, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.clientId.trim()) {
      toast({
        title: "Validation Error",
        description: "Client ID is required",
        variant: "destructive",
      });
      return false;
    }

    if (formData.clientId.length < 3) {
      toast({
        title: "Validation Error",
        description: "Client ID must be at least 3 characters",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    onSubmit(formData);
  };

  return (
    <div className="space-y-3">
      {/* Required Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="fullName" className="text-sm">Full Name *</Label>
          <Input
            id="fullName"
            placeholder="Enter full name"
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            className="h-9"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="clientId" className="text-sm">Client ID *</Label>
          <Input
            id="clientId"
            placeholder="e.g., SB123456"
            value={formData.clientId}
            onChange={(e) => handleInputChange("clientId", e.target.value)}
            className="h-9"
          />
        </div>
      </div>

      {/* Contact Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="phoneNumber" className="text-sm">Phone Number</Label>
          <Input
            id="phoneNumber"
            placeholder="(808) 555-1234"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            className="h-9"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="dateOfBirth" className="text-sm">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            className="h-9"
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1">
        <Label htmlFor="address" className="text-sm">Address</Label>
        <Input
          id="address"
          placeholder="Enter address"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          className="h-9"
        />
      </div>

      {/* Emergency Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="emergencyContact" className="text-sm">Emergency Contact</Label>
          <Input
            id="emergencyContact"
            placeholder="Contact name"
            value={formData.emergencyContact}
            onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
            className="h-9"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="emergencyPhone" className="text-sm">Emergency Phone</Label>
          <Input
            id="emergencyPhone"
            placeholder="(808) 555-1234"
            value={formData.emergencyPhone}
            onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
            className="h-9"
          />
        </div>
      </div>

      {/* Legal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="courtLocation" className="text-sm">Court Location</Label>
          <Input
            id="courtLocation"
            placeholder="Court location"
            value={formData.courtLocation}
            onChange={(e) => handleInputChange("courtLocation", e.target.value)}
            className="h-9"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="charges" className="text-sm">Charges</Label>
          <Input
            id="charges"
            placeholder="Legal charges"
            value={formData.charges}
            onChange={(e) => handleInputChange("charges", e.target.value)}
            className="h-9"
          />
        </div>
      </div>

      {/* Active Status */}
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <Label className="text-sm font-medium">Active Status</Label>
          <p className="text-xs text-muted-foreground">Client is currently active</p>
        </div>
        <Switch
          checked={formData.isActive}
          onCheckedChange={(checked) => handleInputChange("isActive", checked)}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          size="sm"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          size="sm"
        >
          {isLoading ? "Creating..." : editingClient ? "Update Client" : "Create Client"}
        </Button>
      </div>
    </div>
  );
}