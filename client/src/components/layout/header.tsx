import { Shield, Clock } from "lucide-react";
import { ReactNode } from "react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  children?: ReactNode;
}

export default function Header({ 
  title = "Art of Bail", 
  subtitle = "Professional Bail Services",
  leftSlot,
  rightSlot,
  children
}: HeaderProps) {
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-slate-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {leftSlot ? (
            leftSlot
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h1>
                <p className="text-xs text-slate-500 dark:text-gray-400">{subtitle}</p>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-4">
            {rightSlot && <div className="flex items-center space-x-2">{rightSlot}</div>}
            <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-gray-300">
              <Clock className="text-slate-400 dark:text-gray-400 w-4 h-4" />
              <span>{currentTime}</span>
            </div>
          </div>
        </div>
        {children && (
          <div className="pb-4">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
