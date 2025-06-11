import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, AlertTriangle, FileText, Lock, Eye } from "lucide-react";

export default function ComplianceFramework() {
  const complianceStandards = [
    {
      standard: "CJIS",
      name: "Criminal Justice Information Services",
      status: "Compliant",
      description: "FBI security policy for criminal justice information systems",
      requirements: [
        "Physical security controls",
        "Personnel security screening",
        "Information security controls",
        "Audit trail requirements",
        "Advanced authentication"
      ],
      icon: Shield,
      statusColor: "bg-green-100 text-green-800"
    },
    {
      standard: "GDPR",
      name: "General Data Protection Regulation",
      status: "Compliant",
      description: "EU privacy regulation for personal data protection",
      requirements: [
        "Lawful basis for processing",
        "Data subject rights implementation",
        "Privacy by design principles",
        "Data breach notification procedures",
        "Data protection impact assessments"
      ],
      icon: Eye,
      statusColor: "bg-green-100 text-green-800"
    },
    {
      standard: "CCPA",
      name: "California Consumer Privacy Act",
      status: "Compliant",
      description: "California privacy law for consumer data rights",
      requirements: [
        "Consumer right to know",
        "Consumer right to delete",
        "Consumer right to opt-out",
        "Non-discrimination provisions",
        "Privacy policy requirements"
      ],
      icon: FileText,
      statusColor: "bg-green-100 text-green-800"
    },
    {
      standard: "PCI DSS",
      name: "Payment Card Industry Data Security Standard",
      status: "Compliant",
      description: "Security standards for payment card data protection",
      requirements: [
        "Secure network architecture",
        "Data encryption in transit and at rest",
        "Access control measures",
        "Regular security monitoring",
        "Vulnerability management"
      ],
      icon: Lock,
      statusColor: "bg-green-100 text-green-800"
    },
    {
      standard: "HIPAA",
      name: "Health Insurance Portability and Accountability Act",
      status: "Applicable Where Required",
      description: "Healthcare privacy and security regulations (if applicable)",
      requirements: [
        "Administrative safeguards",
        "Physical safeguards",
        "Technical safeguards",
        "Business associate agreements",
        "Breach notification procedures"
      ],
      icon: Shield,
      statusColor: "bg-yellow-100 text-yellow-800"
    }
  ];

  const privacyControls = [
    {
      category: "Data Minimization",
      description: "Collect only necessary data for bail bond services",
      implementation: "Role-based data collection limits, purpose limitation controls"
    },
    {
      category: "Encryption",
      description: "End-to-end encryption for all sensitive data",
      implementation: "AES-256 encryption at rest, TLS 1.3 in transit, encrypted backups"
    },
    {
      category: "Access Controls",
      description: "Strict role-based access with authentication",
      implementation: "Multi-factor authentication, principle of least privilege, audit logging"
    },
    {
      category: "Data Retention",
      description: "Automated data lifecycle management",
      implementation: "7-year financial records, court-mandated retention periods, secure deletion"
    },
    {
      category: "Breach Response",
      description: "Incident response and notification procedures",
      implementation: "72-hour notification protocols, forensic analysis capabilities, stakeholder communication"
    },
    {
      category: "User Rights",
      description: "Data subject rights fulfillment mechanisms",
      implementation: "Data access portals, correction workflows, deletion procedures (where legally permitted)"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-6 w-6 mr-3 text-blue-600" />
            Compliance Framework Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {complianceStandards.map((standard) => {
              const Icon = standard.icon;
              return (
                <div key={standard.standard} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">{standard.standard}</h3>
                    </div>
                    <Badge className={standard.statusColor}>
                      {standard.status}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-sm mb-2">{standard.name}</h4>
                  <p className="text-sm text-slate-600 mb-3">{standard.description}</p>
                  <div className="space-y-1">
                    {standard.requirements.map((req, index) => (
                      <div key={index} className="flex items-center text-xs text-slate-500">
                        <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        {req}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="h-6 w-6 mr-3 text-green-600" />
            Privacy Controls Implementation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {privacyControls.map((control, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-2">{control.category}</h3>
                <p className="text-sm text-slate-600 mb-2">{control.description}</p>
                <p className="text-xs text-slate-500">{control.implementation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-6 w-6 mr-3 text-orange-600" />
            Legal Vetting Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">Recommended Legal Review</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Privacy policy and terms of service legal validation</li>
                <li>• State-specific bail bond regulation compliance review</li>
                <li>• Biometric data collection legal assessment</li>
                <li>• Cross-border data transfer evaluation (if applicable)</li>
                <li>• Law enforcement data sharing agreement review</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Documentation Requirements</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Data Processing Impact Assessments (DPIA)</li>
                <li>• Records of Processing Activities (ROPA)</li>
                <li>• Business Associate Agreements (if HIPAA applicable)</li>
                <li>• Vendor security and privacy assessments</li>
                <li>• Incident response and breach notification procedures</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">Critical Compliance Areas</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Facial recognition technology legal frameworks</li>
                <li>• Location tracking consent and limitations</li>
                <li>• Criminal justice data sharing protocols</li>
                <li>• International privacy law applicability</li>
                <li>• Client data retention and deletion obligations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}