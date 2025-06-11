import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, MapPin, Camera, AlertTriangle, FileText } from "lucide-react";

interface InitialPrivacyConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

export default function InitialPrivacyConsent({ onAccept, onDecline }: InitialPrivacyConsentProps) {
  const [acknowledgedItems, setAcknowledgedItems] = useState<Record<string, boolean>>({});

  const criticalDataTypes = [
    {
      id: "location_tracking",
      icon: MapPin,
      title: "GPS Location Tracking",
      description: "Your real-time location will be collected during check-ins and compliance monitoring as required by your bail bond agreement.",
      required: true
    },
    {
      id: "facial_recognition",
      icon: Camera,
      title: "Facial Recognition Verification",
      description: "Biometric facial data will be captured to verify your identity during check-ins and system access.",
      required: true
    },
    {
      id: "personal_legal_data",
      icon: FileText,
      title: "Personal & Legal Information",
      description: "Your personal details, case information, court dates, and legal documentation will be processed and stored.",
      required: true
    }
  ];

  const allRequiredAcknowledged = criticalDataTypes.every(item => acknowledgedItems[item.id]);

  const handleItemToggle = (itemId: string, checked: boolean) => {
    setAcknowledgedItems(prev => ({
      ...prev,
      [itemId]: checked
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Shield className="h-6 w-6 mr-3 text-blue-600" />
            Privacy & Data Collection Consent
          </CardTitle>
          <p className="text-sm text-slate-600">Required before accessing the SecureBond system</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> This system collects sensitive biometric and location data 
              for bail bond compliance monitoring. You must acknowledge each data collection practice 
              to proceed.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Data We Collect</h3>
            
            {criticalDataTypes.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={item.id}
                      checked={acknowledgedItems[item.id] || false}
                      onCheckedChange={(checked) => handleItemToggle(item.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <label htmlFor={item.id} className="font-medium cursor-pointer">
                          {item.title}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                      </div>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Your Rights</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Access and review your personal data</li>
              <li>• Request corrections to inaccurate information</li>
              <li>• File complaints with supervisory authorities</li>
              <li>• Contact us at gorJessCo@cyberservices.net for privacy concerns</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">Data Sharing</h4>
            <p className="text-sm text-yellow-800">
              Your data may be shared with court systems, law enforcement, and payment processors 
              as legally required for bail bond compliance. We never sell your personal information.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-2">Compliance Standards</h4>
            <p className="text-sm text-red-800">
              This system operates under CJIS, GDPR/CCPA, PCI DSS, and other applicable 
              privacy and security compliance standards.
            </p>
          </div>
        </CardContent>

        <div className="p-6 border-t bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <p>By accepting, you acknowledge understanding of our data practices</p>
              <p>Contact: gorJessCo@cyberservices.net</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onDecline}>
                Decline & Exit
              </Button>
              <Button 
                onClick={onAccept} 
                disabled={!allRequiredAcknowledged}
                className="min-w-[140px]"
              >
                Accept & Continue
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}