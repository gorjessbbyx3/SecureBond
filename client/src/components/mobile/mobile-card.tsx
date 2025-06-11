import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MobileCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  footer?: ReactNode;
  compact?: boolean;
}

export function MobileCard({ 
  title, 
  children, 
  className, 
  headerAction, 
  footer, 
  compact = false 
}: MobileCardProps) {
  return (
    <Card className={cn(
      "mobile-card w-full",
      compact && "p-3",
      className
    )}>
      {title && (
        <CardHeader className={cn(
          "pb-3",
          compact && "pb-2"
        )}>
          <div className="flex items-center justify-between">
            <CardTitle className={cn(
              "mobile-heading",
              compact && "text-base mb-0"
            )}>
              {title}
            </CardTitle>
            {headerAction}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(
        "space-y-3",
        compact && "space-y-2 pt-0"
      )}>
        {children}
      </CardContent>
      {footer && (
        <div className={cn(
          "border-t border-slate-200 p-4",
          compact && "p-3"
        )}>
          {footer}
        </div>
      )}
    </Card>
  );
}

interface MobileStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export function MobileStatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  className 
}: MobileStatCardProps) {
  return (
    <MobileCard compact className={cn("text-center", className)}>
      <div className="space-y-2">
        {icon && (
          <div className="flex justify-center text-blue-600">
            {icon}
          </div>
        )}
        <div>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          <div className="mobile-text text-slate-600">{title}</div>
          {subtitle && (
            <div className="text-xs text-slate-500">{subtitle}</div>
          )}
        </div>
        {trend && (
          <div className={cn(
            "text-xs font-medium",
            trend.positive ? "text-green-600" : "text-red-600"
          )}>
            {trend.positive ? "↗" : "↘"} {trend.value}
          </div>
        )}
      </div>
    </MobileCard>
  );
}

interface MobileListItemProps {
  title: string;
  subtitle?: string;
  value?: string;
  status?: {
    label: string;
    variant: "success" | "warning" | "error" | "info";
  };
  action?: ReactNode;
  onClick?: () => void;
}

export function MobileListItem({ 
  title, 
  subtitle, 
  value, 
  status, 
  action, 
  onClick 
}: MobileListItemProps) {
  const statusColors = {
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <div 
      className={cn(
        "mobile-table-row cursor-pointer hover:bg-slate-50 transition-colors",
        onClick && "active:bg-slate-100"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-slate-900 truncate">{title}</div>
          {subtitle && (
            <div className="mobile-text text-slate-500 truncate">{subtitle}</div>
          )}
        </div>
        <div className="flex items-center space-x-2 ml-3">
          {value && (
            <div className="font-medium text-slate-900">{value}</div>
          )}
          {status && (
            <span className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              statusColors[status.variant]
            )}>
              {status.label}
            </span>
          )}
          {action}
        </div>
      </div>
    </div>
  );
}