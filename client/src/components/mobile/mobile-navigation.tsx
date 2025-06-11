import { Home, Users, FileText, Settings, Bell, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MobileNavigationProps {
  userRole?: 'admin' | 'staff' | 'client';
  notificationCount?: number;
}

export function MobileNavigation({ userRole = 'client', notificationCount = 0 }: MobileNavigationProps) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getNavigationItems = () => {
    switch (userRole) {
      case 'admin':
        return [
          { icon: Home, label: "Dashboard", href: "/admin-dashboard", active: location === "/admin-dashboard" },
          { icon: Users, label: "Clients", href: "/admin-dashboard", active: location.includes("/client") },
          { icon: FileText, label: "Reports", href: "/admin-dashboard", active: false },
          { icon: Bell, label: "Alerts", href: "/admin-dashboard", active: false, badge: notificationCount },
          { icon: Settings, label: "Settings", href: "/admin-dashboard", active: false },
        ];
      case 'staff':
        return [
          { icon: Home, label: "Dashboard", href: "/staff-dashboard", active: location === "/staff-dashboard" },
          { icon: Users, label: "Clients", href: "/staff-dashboard", active: location.includes("/client") },
          { icon: FileText, label: "Tasks", href: "/staff-dashboard", active: false },
          { icon: Bell, label: "Alerts", href: "/staff-dashboard", active: false, badge: notificationCount },
        ];
      case 'client':
      default:
        return [
          { icon: Home, label: "Dashboard", href: "/client-dashboard", active: location === "/client-dashboard" },
          { icon: FileText, label: "Documents", href: "/client-dashboard", active: false },
          { icon: Bell, label: "Notifications", href: "/client-dashboard", active: false, badge: notificationCount },
          { icon: Settings, label: "Profile", href: "/client-dashboard", active: false },
        ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header md:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-blue-600">Aloha Bail Bond</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="touch-target"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={() => setIsMenuOpen(false)}>
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-blue-600">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMenuOpen(false)}
                  className="touch-target"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`mobile-menu-item ${
                      item.active ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="mobile-nav md:hidden">
        <div className="flex items-center justify-around">
          {navigationItems.slice(0, 4).map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex flex-col items-center space-y-1 p-2 touch-target ${
                  item.active ? 'text-blue-600' : 'text-slate-500'
                }`}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.badge && item.badge > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}