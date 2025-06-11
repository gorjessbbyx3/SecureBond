import { useBranding } from "@/contexts/BrandingContext";
import { Building2 } from "lucide-react";

interface BrandedHeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  className?: string;
}

export function BrandedHeader({ 
  title, 
  subtitle, 
  showLogo = true, 
  className = "" 
}: BrandedHeaderProps) {
  const { branding, isLoading } = useBranding();

  if (isLoading) {
    return (
      <header className={`bg-white border-b border-gray-200 shadow-sm ${className}`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="animate-pulse flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-300 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-32"></div>
                <div className="h-3 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header 
      className={`bg-white border-b border-gray-200 shadow-sm ${className}`}
      style={{ 
        borderBottomColor: branding.primaryColor + '20',
        background: `linear-gradient(135deg, ${branding.primaryColor}05, ${branding.secondaryColor}05)`
      }}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center space-x-4">
          {showLogo && (
            <div className="flex-shrink-0">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={`${branding.companyName} Logo`}
                  className="h-12 w-auto object-contain"
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div 
                className={`${branding.logoUrl ? 'hidden' : 'flex'} h-12 w-12 rounded-lg items-center justify-center`}
                style={{ backgroundColor: branding.primaryColor }}
              >
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </div>
          )}
          <div className="text-center">
            <h1 
              className="text-2xl font-bold tracking-wide"
              style={{ color: branding.primaryColor }}
            >
              {title || branding.companyName}
            </h1>
            {subtitle && (
              <p 
                className="text-sm mt-1"
                style={{ color: branding.secondaryColor }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}