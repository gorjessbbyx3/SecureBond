import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Eye, MapPin, Camera, Clock, FileText, AlertTriangle } from "lucide-react";

interface DataCollectionNoticeProps {
  onAccept: () => void;
  onDecline: () => void;
  userRole: "client" | "admin" | "staff";
}

export default function DataCollectionNotice({ onAccept, onDecline, userRole }: DataCollectionNoticeProps) {
  const [acknowledgedItems, setAcknowledgedItems] = useState<Record<string, boolean>>({});
  const [showDetails, setShowDetails] = useState(false);

  const dataCollectionItems = [
    {
      id: "location",
      icon: MapPin,
      title: "GPS Location Tracking",
      description: "Real-time location data collected during check-ins and compliance monitoring",
      details: "Your device GPS coordinates are collected when you perform check-ins or when location verification is required for bond compliance. This data is encrypted and used solely for legal compliance monitoring.",
      required: true,
      legalBasis: "Court-ordered monitoring and bail compliance"
    },
    {
      id: "biometric",
      icon: Camera,
      title: "Facial Recognition Data",
      description: "Biometric facial data for identity verification during check-ins",
      details: "Facial recognition technology captures and analyzes your facial features to verify your identity during check-ins. This biometric data is processed locally when possible and encrypted during transmission and storage.",
      required: true,
      legalBasis: "Identity verification for court compliance"
    },
    {
      id: "personal",
      icon: FileText,
      title: "Personal & Legal Information",
      description: "Name, contact details, case information, and legal documentation",
      details: "We collect and process your personal information including full name, address, phone number, email, case numbers, court dates, charges, and related legal documentation necessary for bail bond services.",
      required: true,
      legalBasis: "Bail bond contract fulfillment and legal compliance"
    },
    {
      id: "financial",
      icon: Shield,
      title: "Financial Transaction Data",
      description: "Payment information, banking details, and transaction records",
      details: "Financial information including payment methods, transaction history, and banking details are collected for payment processing and financial record keeping. Payment card data is processed through PCI-compliant systems.",
      required: true,
      legalBasis: "Payment processing and financial record keeping"
    },
    {
      id: "behavioral",
      icon: Eye,
      title: "System Usage Analytics",
      description: "Login times, feature usage, and interaction patterns",
      details: "We monitor your usage of the system including login times, features accessed, and interaction patterns to ensure compliance with monitoring requirements and improve system security.",
      required: false,
      legalBasis: "System security and compliance monitoring"
    },
    {
      id: "communication",
      icon: Clock,
      title: "Communication Records",
      description: "Messages, notifications, and correspondence history",
      details: "All communications through the system including messages, notifications, alerts, and correspondence are recorded and stored for legal compliance and record keeping purposes.",
      required: true,
      legalBasis: "Legal record keeping and compliance documentation"
    }
  ];

  const requiredItems = dataCollectionItems.filter(item => item.required);
  const allRequiredAcknowledged = requiredItems.every(item => acknowledgedItems[item.id]);

  const handleItemToggle = (itemId: string, checked: boolean) => {
    setAcknowledgedItems(prev => ({
      ...prev,
      [itemId]: checked
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Shield className="h-6 w-6 mr-3 text-blue-600" />
            Data Collection & Privacy Notice
          </CardTitle>
          <div className="text-sm text-slate-600">
            <p><strong>Effective Date:</strong> June 11, 2025</p>
            <p><strong>User Role:</strong> {userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 overflow-y-auto max-h-[60vh]">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> This system collects sensitive personal data including biometric information 
              and location data for bail bond compliance monitoring. You must acknowledge each data collection 
              practice before accessing the system.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Data Collection Practices</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </Button>
            </div>

            {dataCollectionItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Checkbox
                        id={item.id}
                        checked={acknowledgedItems[item.id] || false}
                        onCheckedChange={(checked) => handleItemToggle(item.id, checked as boolean)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <label htmlFor={item.id} className="font-medium cursor-pointer">
                          {item.title}
                          {item.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                      
                      {showDetails && (
                        <div className="bg-slate-50 rounded p-3 text-sm">
                          <p className="mb-2">{item.details}</p>
                          <p className="text-slate-500">
                            <strong>Legal Basis:</strong> {item.legalBasis}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Your Data Rights</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Right to access your personal data</li>
              <li>• Right to correct inaccurate information</li>
              <li>• Right to data portability (where applicable)</li>
              <li>• Right to file complaints with supervisory authorities</li>
              <li>• Limited deletion rights (subject to legal retention requirements)</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">Data Sharing & Third Parties</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Court systems and law enforcement (as legally required)</li>
              <li>• Payment processors (for financial transactions)</li>
              <li>• Cloud storage providers (with encryption)</li>
              <li>• Legal counsel (under attorney-client privilege)</li>
              <li>• No data sale to third parties</li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-2">Compliance Standards</h4>
            <div className="text-sm text-red-800 space-y-1">
              <p>• <strong>CJIS Compliance:</strong> Criminal Justice Information Services standards</p>
              <p>• <strong>GDPR/CCPA:</strong> Privacy regulation compliance where applicable</p>
              <p>• <strong>PCI DSS:</strong> Payment card industry security standards</p>
              <p>• <strong>HIPAA:</strong> Health information privacy (where applicable)</p>
            </div>
          </div>
        </CardContent>

        <div className="p-6 border-t bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <p>Contact: gorJessCo@cyberservices.net</p>
              <p>Required items marked with * must be acknowledged</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onDecline}>
                Decline & Exit
              </Button>
              <Button 
                onClick={onAccept} 
                disabled={!allRequiredAcknowledged}
                className="min-w-[120px]"
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