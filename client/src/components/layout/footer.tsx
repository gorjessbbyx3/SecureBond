import { Phone, Mail } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-6 text-xs text-slate-500">
            <span>© 2025 Aloha Bail Bond - Developed by gorjessbbyCo.</span>
            <Link href="/privacy-policy">
              <a className="hover:text-slate-700 transition-colors">Privacy Policy</a>
            </Link>
            <Link href="/terms-of-service">
              <a className="hover:text-slate-700 transition-colors">Terms of Service</a>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <Mail className="text-blue-600 w-3 h-3" />
              <span>Support: gorJessCo@cyberservices.net</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
