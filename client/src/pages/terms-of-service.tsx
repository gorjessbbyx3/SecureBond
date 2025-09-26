import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, AlertTriangle, Scale, Shield, Users, Gavel, XCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTermsStatus } from "@/hooks/useTermsStatus";
import { useLocation } from "wouter";

const CURRENT_VERSION = "2.0";

export default function TermsOfService() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { hasAcknowledged: hasAcceptedTerms, currentVersion } = useTermsStatus();
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAcceptTerms = async () => {
    if (!user) return;
    
    setIsAccepting(true);
    try {
      // Implementation would go here
      setLocation("/");
    } catch (error) {
      console.error("Failed to accept terms:", error);
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Scale className="h-12 w-12 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
            </div>
            <p className="text-slate-600">Art of Bail Bond Management System</p>
            <p className="text-sm text-slate-500 mt-2">Effective Date: June 11, 2025</p>
            <p className="text-sm text-slate-500">Version: {CURRENT_VERSION}</p>
            <p className="text-sm text-slate-500">Developer: GoJess & Co</p>
            
            {hasAcceptedTerms && (
              <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                <CheckCircle className="h-4 w-4 mr-2" />
                You have accepted these terms
              </div>
            )}
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Important Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-800 font-semibold mb-2">Critical Legal Service</p>
                    <p className="text-yellow-700 text-sm">
                      This system manages bail bond services where compliance failures can result in serious legal consequences, 
                      including arrest warrants and forfeiture of bond amounts. All users must understand their legal obligations 
                      and use this system responsibly.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  1. Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed mb-4">
                  By accessing or using the SecureBond bail bond management system, you agree to comply with 
                  and be bound by these Terms of Service. If you disagree with any part of these terms, 
                  you may not access or use the system.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">
                    <strong>Important:</strong> These terms constitute a legally binding agreement between you and gorJessCo. 
                    Your use of the system indicates your acceptance of these terms and creates legal obligations.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  2. License and Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  You are granted a limited, non-exclusive, non-transferable license to use the system 
                  in accordance with these terms for lawful bail bond management purposes only.
                </p>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">License Restrictions:</h4>
                  <ul className="list-disc list-inside text-slate-700 space-y-1 ml-4">
                    <li>Use is limited to authorized personnel only</li>
                    <li>Account credentials may not be shared or transferred</li>
                    <li>System access is monitored and logged for security purposes</li>
                    <li>Reverse engineering or copying of the system is strictly forbidden</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  3. User Conduct
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">You agree not to:</p>
                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                  <li>Use the system for illegal or abusive purposes</li>
                  <li>Attempt to hack, reverse engineer, or disrupt the system's functionality</li>
                  <li>Upload harmful or fraudulent content</li>
                  <li>Access or attempt to access accounts belonging to other users</li>
                  <li>Violate any court orders, bond conditions, or legal obligations</li>
                  <li>Provide false, misleading, or fraudulent information</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <XCircle className="h-5 w-5 mr-2 text-red-600" />
                  4. Termination
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  We reserve the right to suspend or terminate your access for violations of these terms 
                  or applicable laws, including but not limited to:
                </p>
                <ul className="list-disc list-inside text-slate-700 space-y-1 ml-4">
                  <li>Violation of these Terms of Service</li>
                  <li>Suspected fraudulent or illegal activity</li>
                  <li>Failure to comply with court orders or bond conditions</li>
                  <li>Security concerns or system maintenance requirements</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                  5. Disclaimers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  The system is provided "as is" without warranties of any kind. We specifically disclaim:
                </p>
                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                  <li>Guarantees of error-free or uninterrupted service</li>
                  <li>Accuracy or completeness of third-party data or court information</li>
                  <li>Compatibility with all devices or operating systems</li>
                  <li>Availability during maintenance or technical issues</li>
                </ul>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <p className="text-red-800 text-sm">
                    <strong>Critical Disclaimer:</strong> Users remain solely responsible for compliance with all 
                    legal obligations and court appearances. System failures do not excuse legal non-compliance.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-gray-600" />
                  6. Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  To the extent permitted by law, gorJessCo is not liable for damages arising from the use 
                  or inability to use the system, including but not limited to:
                </p>
                <ul className="list-disc list-inside text-slate-700 space-y-1 ml-4">
                  <li>Lost profits, revenue, or business opportunities</li>
                  <li>Legal consequences from missed court dates or non-compliance</li>
                  <li>Forfeited bond amounts or additional legal fees</li>
                  <li>System downtime or service interruptions</li>
                  <li>Data loss or unauthorized access</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gavel className="h-5 w-5 mr-2 text-blue-600" />
                  7. Governing Law
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  These terms are governed by the laws of the State of Hawaii. All disputes shall be resolved 
                  in the state and federal courts located in Hawaii.
                </p>
                <p className="text-slate-600 text-sm">
                  If any provision of these terms is found unenforceable, the remaining provisions shall remain in full force and effect.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-green-600" />
                  8. Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  For questions about these Terms of Service or system support:
                </p>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-800 font-semibold">gorJessCo</p>
                  <p className="text-slate-700">Email: gorJessCo@cyberservices.net</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {user && !hasAcceptedTerms && (
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Accept Terms to Continue</h3>
                <p className="text-slate-600 mb-4">
                  You must accept these Terms of Service to use the SecureBond system.
                </p>
                <Button 
                  onClick={handleAcceptTerms}
                  disabled={isAccepting}
                  className="px-8 py-2"
                >
                  {isAccepting ? "Processing..." : "I Accept These Terms"}
                </Button>
              </div>
            </div>
          )}

          {!user && (
            <div className="mt-8 text-center">
              <Button 
                onClick={() => setLocation("/")}
                className="px-8 py-2"
              >
                Return to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}