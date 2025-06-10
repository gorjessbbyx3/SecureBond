import { Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-6 text-xs text-slate-500">
            <span>© 2024 SecureBond Professional Services</span>
            <a href="#" className="hover:text-slate-700 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-700 transition-colors">Terms of Service</a>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <Phone className="text-green-600 w-3 h-3" />
              <span>24/7 Support: (555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <Mail className="text-blue-600 w-3 h-3" />
              <span>support@securebond.com</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
