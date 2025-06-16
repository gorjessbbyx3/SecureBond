import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Users, FileText, Mail } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
            </div>
            <p className="text-slate-600">SecureBond Bail Bond Management System</p>
            <p className="text-sm text-slate-500 mt-2">Effective Date: June 11, 2025</p>
            <p className="text-sm text-slate-500">Developer: GoJess & Co</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">
                This Privacy Policy describes how GoJess & Co ("we," "our," or "us") collects, uses, and protects 
                your information when you use the SecureBond bail bond management system. We are committed to 
                protecting your privacy and ensuring the security of your personal information in compliance 
                with applicable laws and regulations.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-green-600" />
                  1. Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Personal Data:</h4>
                    <ul className="list-disc list-inside text-slate-700 space-y-1 ml-4">
                      <li>Name, email address, phone number, and mailing address</li>
                      <li>Government-issued identification for verification purposes</li>
                      <li>Emergency contact information and family member details</li>
                      <li>Employment information and financial details for bond processing</li>
                      <li>Court case information, charges, and legal documentation</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Device and Technical Data:</h4>
                    <ul className="list-disc list-inside text-slate-700 space-y-1 ml-4">
                      <li>Device ID, operating system, and browser information</li>
                      <li>IP address and general location data</li>
                      <li>GPS coordinates for check-in and location tracking services</li>
                      <li>System usage logs and error reports for technical support</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Financial and Payment Data:</h4>
                    <ul className="list-disc list-inside text-slate-700 space-y-1 ml-4">
                      <li>Payment method information and transaction records</li>
                      <li>Bond amounts, payment schedules, and financial obligations</li>
                      <li>Banking information for payment processing (securely encrypted)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  2. How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">We use your information to:</p>
                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                  <li>Process and manage bail bond contracts and related services</li>
                  <li>Authenticate users and maintain secure access to the system</li>
                  <li>Track compliance with bond conditions and court requirements</li>
                  <li>Process payments and manage financial obligations</li>
                  <li>Send notifications about court dates, payment reminders, and system updates</li>
                  <li>Provide location tracking services for compliance monitoring</li>
                  <li>Generate reports and analytics for business operations</li>
                  <li>Communicate with clients regarding their cases and services</li>
                  <li>Comply with legal obligations and law enforcement requests</li>
                  <li>Improve our services and system functionality</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-orange-600" />
                  3. Data Sharing and Disclosure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-slate-700">
                    <strong>We do not sell your personal data.</strong> We only share your information in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                    <li><strong>Court Systems:</strong> Information required for legal proceedings and compliance</li>
                    <li><strong>Law Enforcement:</strong> As required by legal obligation or court order</li>
                    <li><strong>Service Providers:</strong> Trusted third-party services including:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>Payment processors for financial transactions</li>
                        <li>Email services for notifications and communications</li>
                        <li>Cloud storage providers under strict confidentiality agreements</li>
                        <li>Analytics services for system improvement (anonymized data only)</li>
                      </ul>
                    </li>
                    <li><strong>Emergency Situations:</strong> To protect safety and prevent harm</li>
                    <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-red-600" />
                  4. Data Security and Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-slate-700">
                    We implement comprehensive security measures to protect your data:
                  </p>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                    <li><strong>Encryption:</strong> All data is encrypted in transit and at rest using industry-standard protocols</li>
                    <li><strong>Access Controls:</strong> Role-based access with multi-factor authentication</li>
                    <li><strong>Audit Logging:</strong> Complete audit trails of all system access and modifications</li>
                    <li><strong>Regular Security Assessments:</strong> Ongoing vulnerability testing and security reviews</li>
                    <li><strong>Data Backup:</strong> Secure, encrypted backups with disaster recovery procedures</li>
                    <li><strong>Staff Training:</strong> Regular security awareness training for all personnel</li>
                  </ul>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <p className="text-yellow-800 text-sm">
                      <strong>Important:</strong> While we implement robust security measures, no system is 100% secure. 
                      We cannot guarantee absolute security but continuously work to maintain the highest standards.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  5. Your Rights and Choices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-slate-700">You have the following rights regarding your personal data:</p>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                    <li><strong>Access:</strong> Request access to your personal data and information about how it's processed</li>
                    <li><strong>Correction:</strong> Request correction of inaccurate or incomplete personal data</li>
                    <li><strong>Deletion:</strong> Request deletion of your personal data, subject to legal and contractual obligations</li>
                    <li><strong>Portability:</strong> Request a copy of your data in a machine-readable format</li>
                    <li><strong>Restriction:</strong> Request restriction of processing under certain circumstances</li>
                    <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                    <li><strong>Opt-out:</strong> Unsubscribe from non-essential communications</li>
                  </ul>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Note:</strong> Some rights may be limited by legal obligations related to bail bond services 
                      and court requirements. We will explain any limitations when responding to your requests.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  6. Data Retention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-slate-700">We retain your information for the following periods:</p>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                    <li><strong>Active Bonds:</strong> Throughout the duration of the bond period and related legal proceedings</li>
                    <li><strong>Financial Records:</strong> 7 years from the completion of services for tax and legal compliance</li>
                    <li><strong>Court-Related Data:</strong> As required by law and court orders</li>
                    <li><strong>System Logs:</strong> 2 years for security and audit purposes</li>
                    <li><strong>Communication Records:</strong> 3 years from last contact</li>
                  </ul>
                  <p className="text-slate-700 mt-4">
                    Data is securely deleted or anonymized when no longer required, unless legal obligations require longer retention.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  7. Children's Privacy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">
                  The SecureBond system is not intended for users under 18 years of age. We do not knowingly 
                  collect personal information from minors. If we become aware that we have collected personal 
                  information from a minor, we will take steps to delete such information promptly.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-orange-600" />
                  8. Changes to This Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">
                  We may update this Privacy Policy from time to time to reflect changes in our practices, 
                  technology, legal requirements, or other factors. We will notify you of material changes 
                  by email or through the system interface. Continued use of the SecureBond system after 
                  changes become effective constitutes acceptance of the revised policy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-blue-600" />
                  9. Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-slate-700">
                    For questions about this Privacy Policy or to exercise your rights, contact us:
                  </p>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-slate-800 font-semibold">gorJessCo</p>
                    <p className="text-slate-700">Email: gorJessCo@cyberservices.net</p>
                    <p className="text-slate-600 text-sm mt-2">
                      Response time: We will respond to privacy requests within 30 days.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Link href="/">
              <a className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Return to Dashboard
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}