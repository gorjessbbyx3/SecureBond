import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function TermsOfService() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => setLocation("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Terms of Service</CardTitle>
            <div className="text-center text-slate-600">
              <p><strong>Effective Date:</strong> June 1st, 2025</p>
              <p><strong>Developer:</strong> gorjessbbyCo.</p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 text-slate-700">
            <p>
              This Terms of Service ("Agreement") governs your use of the software application ("Application") 
              developed by gorjessbbyCo. for use by licensed bail bond companies and their clients. By accessing 
              or using the Application, you ("User") agree to be bound by the terms of this Agreement. If you do 
              not agree with these terms, you may not use the Application.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By installing, accessing, or using the Application, the User agrees to comply with and be bound 
                by this Agreement. This includes the Company (bail bond business) and any third-party Clients 
                who interact with the Application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Purpose of the Application</h2>
              <p>
                The Application is intended solely as a digital tool to assist licensed bail bond companies in 
                managing operations such as check-ins, notifications, location tracking, document uploads, and 
                communication. It is not a legal service, nor is it a substitute for professional legal advice 
                or obligations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">3. User Responsibilities</h2>
              <div className="space-y-3">
                <p>
                  <strong>The Company</strong> is responsible for ensuring the Application is used in accordance 
                  with all applicable local, state, and federal laws.
                </p>
                <p>
                  <strong>Clients</strong> are responsible for complying with their own legal obligations, 
                  including but not limited to court appearances, reporting conditions, and communication with 
                  their bail bond agent.
                </p>
                <p>
                  <strong>The Developer</strong> is not responsible for configuring or maintaining the Company's 
                  internal workflows, settings, or policies.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">4. No Legal Advice</h2>
              <p>
                The Application does not provide legal advice, legal representation, or compliance assurance. 
                Any information presented is for administrative convenience only and should not be relied upon 
                as legal guidance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Limitation of Liability</h2>
              <p>
                The Application is provided "as is," without warranties of any kind, express or implied. The 
                Developer makes no guarantees regarding uptime, accuracy, performance, or reliability.
              </p>
              <p className="mt-3">
                By using this Application, both the Company and its Clients agree to the following:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
                <li>
                  The Developer shall not be held liable for any damages, including but not limited to missed 
                  court appearances, arrests, incarceration, lost revenue, legal consequences, or business 
                  disruptions resulting from the use or misuse of the Application.
                </li>
                <li>
                  The Developer is not responsible for any data input errors, missed alerts, or failures in 
                  location tracking, notifications, or submissions.
                </li>
                <li>
                  Use of the Application is entirely at the User's own risk.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Client Acknowledgment</h2>
              <p>Clients using this Application understand that:</p>
              <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
                <li>
                  It is a third-party tool not owned or operated by any government entity.
                </li>
                <li>
                  The Developer is not affiliated with the court system, law enforcement, or the bail bond 
                  company beyond the technical provision of the Application.
                </li>
                <li>
                  Any issues related to bond, court dates, or check-ins must be directed to the bail bond company.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Indemnification</h2>
              <p>
                Users agree to indemnify and hold harmless the Developer from any and all claims, damages, 
                liabilities, costs, or expenses (including attorney's fees) arising from their use or misuse 
                of the Application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Modifications to the Agreement</h2>
              <p>
                The Developer reserves the right to update or modify this Agreement at any time without prior 
                notice. Continued use of the Application after such changes constitutes acceptance of the 
                updated Agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Termination</h2>
              <p>
                The Developer reserves the right to suspend or terminate access to the Application at their 
                discretion, without liability, for any reason including breach of this Agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Governing Law</h2>
              <p>
                This Agreement shall be governed by and construed in accordance with the laws of the State of 
                Hawaii, without regard to its conflict of laws principles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">11. Contact</h2>
              <p>For questions or concerns about this Agreement, please contact:</p>
              <div className="mt-3 p-4 bg-slate-100 rounded-lg">
                <p><strong>Jessica Houtz</strong></p>
                <p>gorjessbbyCo.</p>
              </div>
            </section>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-500 text-center">
                By continuing to use this application, you acknowledge that you have read, understood, 
                and agree to be bound by these Terms of Service.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}