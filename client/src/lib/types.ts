export interface ClientSession {
  id: number;
  clientId: string;
  fullName: string;
}

export interface AdminSession {
  role: 'admin' | 'maintenance';
}

export interface LoginResponse {
  success: boolean;
  client?: ClientSession;
  role?: string;
}

export interface ClientCredentials {
  clientId: string;
  password: string;
}

export interface AdminCredentials {
  username: string;
  password: string;
  role: 'admin' | 'maintenance';
}

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  upcomingCourtDates: number;
  pendingPayments: number;
  totalRevenue: number;
  totalExpenses: number;
  pendingAmount?: number;
}

export interface CheckInFormData {
  location?: string;
  notes?: string;
}

export interface PaymentFormData {
  amount: string;
  paymentMethod: string;
  receiptImageUrl?: string;
  notes?: string;
}

export interface MessageFormData {
  message: string;
  senderType: 'client' | 'admin' | 'system';
}

export interface Alert {
  id: string | number;
  message: string;
  alertType: string;
  severity: string;
  clientId?: number;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface Notification {
  id: string;
  type: 'alert' | 'payment' | 'checkin' | 'court' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  clientId?: string;
  clientName?: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
}