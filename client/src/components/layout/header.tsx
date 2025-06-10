import { Shield, Clock } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title = "Aloha Bail Bond", subtitle = "Professional Bail Services" }: HeaderProps) {
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Clock className="text-slate-400 w-4 h-4" />
            <span>24/7 Support Available</span>
          </div>
        </div>
      </div>
    </header>
  );
}
