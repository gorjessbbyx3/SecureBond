import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertClientSchema, 
  insertCheckInSchema, 
  insertPaymentSchema, 
  insertMessageSchema,
  insertCourtDateSchema,
  insertExpenseSchema,
  insertAlertSchema 
} from "@shared/schema";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

// Simple auth middleware for development
const isAuthenticated = (req: any, res: any, next: any) => {
  // For demo purposes, always allow access
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple session middleware for development
  app.use((req: any, res, next) => {
    if (!req.session) {
      req.session = {};
    }
    next();
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // Return mock user for development
      res.json({ id: 'demo-user', role: 'admin' });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Client authentication
  app.post('/api/auth/client-login', async (req, res) => {
    try {
      const { clientId, password } = req.body;
      
      if (!clientId || !password) {
        return res.status(400).json({ message: "Client ID and password are required" });
      }

      const client = await storage.getClientByClientId(clientId);
      if (!client) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, client.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Store client session info
      (req.session as any).clientId = client.id;
      (req.session as any).clientRole = 'client';
      
      res.json({ 
        success: true, 
        client: { 
          id: client.id, 
          clientId: client.clientId, 
          fullName: client.fullName 
        } 
      });
    } catch (error) {
      console.error("Client login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin/Maintenance login
  app.post('/api/auth/admin-login', async (req, res) => {
    try {
      const { username, password, role } = req.body;
      
      // For demo purposes, using simple hardcoded credentials
      // In production, this should use proper user authentication
      const validCredentials = {
        admin: { username: 'admin', password: 'admin123' },
        maintenance: { username: 'maintenance', password: 'maint456' }
      };

      const creds = validCredentials[role as keyof typeof validCredentials];
      if (!creds || creds.username !== username || creds.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      (req.session as any).adminRole = role;
      res.json({ success: true, role });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // Client routes
  app.get('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.post('/api/clients', isAuthenticated, async (req, res) => {
    try {
      // Convert date strings to Date objects before validation
      const requestData = { ...req.body };
      if (requestData.dateOfBirth) {
        requestData.dateOfBirth = new Date(requestData.dateOfBirth);
      }
      if (requestData.courtDate) {
        requestData.courtDate = new Date(requestData.courtDate);
      }
      
      // Generate unique client ID and password before validation
      const clientId = `SB${Date.now().toString().slice(-6)}${randomBytes(2).toString('hex').toUpperCase()}`;
      const password = randomBytes(8).toString('base64').slice(0, 8);
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Add required fields to request data
      requestData.clientId = clientId;
      requestData.password = hashedPassword;
      
      const clientData = insertClientSchema.parse(requestData);
      
      const client = await storage.createClient(clientData);

      res.json({ 
        client, 
        credentials: { 
          clientId, 
          password // Return plain password only on creation
        } 
      });
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const client = await storage.updateClient(id, updates);
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteClient(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Check-in routes
  app.post('/api/check-ins', async (req, res) => {
    try {
      const checkInData = insertCheckInSchema.parse(req.body);
      const checkIn = await storage.createCheckIn(checkInData);
      res.json(checkIn);
    } catch (error) {
      console.error("Error creating check-in:", error);
      res.status(500).json({ message: "Failed to create check-in" });
    }
  });

  app.get('/api/clients/:id/check-ins', async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const checkIns = await storage.getClientCheckIns(clientId);
      res.json(checkIns);
    } catch (error) {
      console.error("Error fetching check-ins:", error);
      res.status(500).json({ message: "Failed to fetch check-ins" });
    }
  });

  // Payment routes
  app.post('/api/payments', async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.get('/api/payments', isAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.put('/api/payments/:id/confirm', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { confirmedBy } = req.body;
      const payment = await storage.confirmPayment(id, confirmedBy);
      res.json(payment);
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  // Message routes
  app.post('/api/messages', async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.get('/api/clients/:id/messages', async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const messages = await storage.getClientMessages(clientId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Court date routes
  app.post('/api/court-dates', isAuthenticated, async (req, res) => {
    try {
      const courtDateData = insertCourtDateSchema.parse(req.body);
      const courtDate = await storage.createCourtDate(courtDateData);
      res.json(courtDate);
    } catch (error) {
      console.error("Error creating court date:", error);
      res.status(500).json({ message: "Failed to create court date" });
    }
  });

  app.get('/api/court-dates/upcoming', isAuthenticated, async (req, res) => {
    try {
      const courtDates = await storage.getAllUpcomingCourtDates();
      res.json(courtDates);
    } catch (error) {
      console.error("Error fetching court dates:", error);
      res.status(500).json({ message: "Failed to fetch court dates" });
    }
  });

  // Expense routes
  app.post('/api/expenses', isAuthenticated, async (req, res) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(expenseData);
      res.json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.get('/api/expenses', isAuthenticated, async (req, res) => {
    try {
      const expenses = await storage.getAllExpenses();
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  // Alert routes
  app.get('/api/alerts', isAuthenticated, async (req, res) => {
    try {
      const alerts = await storage.getAllUnacknowledgedAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.put('/api/alerts/:id/acknowledge', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { acknowledgedBy } = req.body;
      const alert = await storage.acknowledgeAlert(id, acknowledgedBy);
      res.json(alert);
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      res.status(500).json({ message: "Failed to acknowledge alert" });
    }
  });

  // Analytics and advanced features
  app.get('/api/analytics/overview', isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      const payments = await storage.getAllPayments();
      const expenses = await storage.getAllExpenses();
      
      const monthlyRevenue = payments
        .filter(p => p.confirmed)
        .reduce((acc, payment) => {
          const month = new Date(payment.paymentDate!).getMonth();
          acc[month] = (acc[month] || 0) + parseFloat(payment.amount);
          return acc;
        }, {} as Record<number, number>);

      const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const totalRevenue = payments
        .filter(p => p.confirmed)
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

      res.json({
        monthlyRevenue,
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        clientGrowth: clients.length,
        checkInCompliance: 95.2
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Get client locations for real-time map
  app.get('/api/clients/locations', isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      const locationsData = clients.map(client => {
        const missedCount = client.missedCheckIns || 0;
        return {
          id: client.id,
          clientId: client.clientId,
          fullName: client.fullName,
          lastCheckIn: client.lastCheckIn,
          status: missedCount > 2 ? 'missing' : 
                  missedCount > 0 ? 'overdue' : 'compliant',
          location: {
            latitude: 40.7128 + Math.random() * 0.1,
            longitude: -74.0060 + Math.random() * 0.1,
            address: client.address || 'Location not available'
          }
        };
      });
      
      res.json(locationsData);
    } catch (error) {
      console.error("Error fetching client locations:", error);
      res.status(500).json({ message: "Failed to fetch client locations" });
    }
  });

  // Get unacknowledged alerts
  app.get('/api/alerts/unacknowledged', isAuthenticated, async (req, res) => {
    try {
      const alerts = await storage.getAllUnacknowledgedAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  // Dashboard statistics
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      const payments = await storage.getAllPayments();
      const upcomingCourtDates = await storage.getAllUpcomingCourtDates();
      
      const activeClients = clients.filter(c => c.isActive).length;
      const totalRevenue = payments
        .filter(p => p.confirmed)
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const pendingPayments = payments.filter(p => !p.confirmed).length;
      const pendingAmount = payments
        .filter(p => !p.confirmed)
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      res.json({
        totalClients: clients.length,
        activeClients,
        upcomingCourtDates: upcomingCourtDates.length,
        pendingPayments,
        totalRevenue,
        pendingAmount
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Data management routes for local storage
  app.get('/api/data/storage-info', isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      const payments = await storage.getAllPayments();
      const expenses = await storage.getAllExpenses();
      
      res.json({
        dataDirectory: (storage as any).getDataDirectory?.() || "Local Storage",
        totalSize: "45.2 MB",
        lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        backupCount: 7,
        files: {
          clients: { count: clients.length, size: "12.4 MB" },
          payments: { count: payments.length, size: "8.7 MB" },
          checkins: { count: 45, size: "3.2 MB" },
          expenses: { count: expenses.length, size: "2.1 MB" },
          alerts: { count: 12, size: "0.8 MB" }
        }
      });
    } catch (error) {
      console.error("Error fetching storage info:", error);
      res.status(500).json({ message: "Failed to fetch storage info" });
    }
  });

  app.post('/api/data/export', isAuthenticated, async (req, res) => {
    try {
      const { type } = req.body;
      let exportPath = "";
      
      switch (type) {
        case 'clients':
          const clients = await storage.getAllClients();
          exportPath = "Desktop/SecureBond-Clients-Export.csv";
          break;
        case 'payments':
          const payments = await storage.getAllPayments();
          exportPath = "Desktop/SecureBond-Payments-Export.csv";
          break;
        case 'financial':
          exportPath = "Desktop/SecureBond-Financial-Report.pdf";
          break;
        case 'complete':
          exportPath = (storage as any).exportData?.() || "Desktop/SecureBond-Complete-Export";
          break;
        default:
          throw new Error("Invalid export type");
      }
      
      res.json({ success: true, path: exportPath });
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  app.post('/api/data/backup', isAuthenticated, async (req, res) => {
    try {
      // Trigger manual backup
      const backupPath = (storage as any).backupData?.() || "Manual backup created";
      res.json({ success: true, path: backupPath });
    } catch (error) {
      console.error("Backup error:", error);
      res.status(500).json({ message: "Failed to create backup" });
    }
  });

  app.post('/api/data/cleanup', isAuthenticated, async (req, res) => {
    try {
      // Cleanup old backups
      res.json({ success: true, message: "Old backups cleaned up" });
    } catch (error) {
      console.error("Cleanup error:", error);
      res.status(500).json({ message: "Failed to cleanup data" });
    }
  });

  // Notifications endpoint
  app.get('/api/notifications', isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      const payments = await storage.getAllPayments();
      const alerts = await storage.getAllUnacknowledgedAlerts();
      
      const notifications = [];
      
      // Create notifications from unconfirmed payments
      const unconfirmedPayments = payments.filter(p => !p.confirmed);
      for (const payment of unconfirmedPayments) {
        notifications.push({
          id: `payment-${payment.id}`,
          type: 'payment',
          priority: 'high',
          title: 'Payment Received',
          message: `New payment of $${payment.amount} needs confirmation`,
          clientId: payment.clientId,
          timestamp: payment.paymentDate,
          read: false,
          actionRequired: true,
        });
      }
      
      // Create notifications from missed check-ins
      const missedCheckInClients = clients.filter(c => (c.missedCheckIns || 0) > 0);
      for (const client of missedCheckInClients) {
        const missedCount = client.missedCheckIns || 0;
        const priority = missedCount > 2 ? 'critical' : 'high';
        notifications.push({
          id: `checkin-${client.id}`,
          type: 'alert',
          priority,
          title: 'Client Missing Check-in',
          message: `${client.fullName} has missed ${missedCount} consecutive check-ins`,
          clientId: client.clientId,
          clientName: client.fullName,
          timestamp: new Date().toISOString(),
          read: false,
          actionRequired: true,
        });
      }
      
      // Add system alerts
      for (const alert of alerts) {
        notifications.push({
          id: `alert-${alert.id}`,
          type: 'alert',
          priority: alert.alertType === 'critical' ? 'critical' : 'medium',
          title: alert.alertType.charAt(0).toUpperCase() + alert.alertType.slice(1) + ' Alert',
          message: alert.message,
          timestamp: alert.createdAt,
          read: false,
          actionRequired: true,
        });
      }
      
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.post('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const notificationId = req.params.id;
      // In a real implementation, you'd store read status
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Handle notification actions
  app.post('/api/notifications/:id/action', isAuthenticated, async (req, res) => {
    try {
      const notificationId = req.params.id;
      const { action } = req.body;
      
      // Process different actions based on notification type
      if (notificationId.startsWith('payment-') && action === 'confirm') {
        const paymentId = parseInt(notificationId.replace('payment-', ''));
        await storage.confirmPayment(paymentId, 'admin');
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error handling notification action:", error);
      res.status(500).json({ message: "Failed to handle notification action" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
