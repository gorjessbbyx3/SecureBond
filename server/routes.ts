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
      const clientData = insertClientSchema.parse(req.body);
      
      // Generate unique client ID
      const clientId = `SB${Date.now().toString().slice(-6)}${randomBytes(2).toString('hex').toUpperCase()}`;
      
      // Generate random password
      const password = randomBytes(8).toString('base64').slice(0, 8);
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const client = await storage.createClient({
        ...clientData,
        clientId,
        password: hashedPassword,
      });

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

  const httpServer = createServer(app);
  return httpServer;
}
