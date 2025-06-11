import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

interface BrandingSettings {
  companyName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  favicon: string;
}

interface BrandingContextType {
  branding: BrandingSettings;
  updateBranding: (settings: Partial<BrandingSettings>) => void;
  isLoading: boolean;
}

const defaultBranding: BrandingSettings = {
  companyName: "Bail Bond Services",
  logo: "",
  primaryColor: "#2563eb",
  secondaryColor: "#64748b",
  logoUrl: "",
  favicon: ""
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);

  // Fetch company configuration for branding
  const { data: companyConfig, isLoading } = useQuery({
    queryKey: ["/api/admin/company-configuration/1"], // Default company ID
    retry: false,
  });

  useEffect(() => {
    if (companyConfig) {
      setBranding({
        companyName: companyConfig.companyName || defaultBranding.companyName,
        logo: companyConfig.logo || defaultBranding.logo,
        primaryColor: companyConfig.customSettings?.branding?.primaryColor || defaultBranding.primaryColor,
        secondaryColor: companyConfig.customSettings?.branding?.secondaryColor || defaultBranding.secondaryColor,
        logoUrl: companyConfig.customSettings?.branding?.logoUrl || defaultBranding.logoUrl,
        favicon: companyConfig.customSettings?.branding?.favicon || defaultBranding.favicon
      });

      // Apply dynamic CSS variables for colors
      const root = document.documentElement;
      root.style.setProperty('--primary-color', companyConfig.customSettings?.branding?.primaryColor || defaultBranding.primaryColor);
      root.style.setProperty('--secondary-color', companyConfig.customSettings?.branding?.secondaryColor || defaultBranding.secondaryColor);
    }
  }, [companyConfig]);

  const updateBranding = (settings: Partial<BrandingSettings>) => {
    setBranding(prev => ({ ...prev, ...settings }));
    
    // Update CSS variables if colors changed
    if (settings.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    }
    if (settings.secondaryColor) {
      document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor);
    }
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, isLoading }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}