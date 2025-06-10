import {
  type User,
  type UpsertUser,
  type Client,
  type InsertClient,
  type Bond,
  type InsertBond,
  type CheckIn,
  type InsertCheckIn,
  type Payment,
  type InsertPayment,
  type Message,
  type InsertMessage,
  type CourtDate,
  type InsertCourtDate,
  type Expense,
  type InsertExpense,
  type Alert,
  type InsertAlert,
  type Notification,
  type InsertNotification,
  type CourtDateReminder,
  type InsertCourtDateReminder,
  type NotificationPreferences,
  type InsertNotificationPreferences,
  type ClientVehicle,
  type FamilyMember,
  type EmploymentInfo,
  type ClientFile,
} from "@shared/schema";
import { LocalFileStorage } from "./local-db";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Client operations
  getClient(id: number): Promise<Client | undefined>;
  getClientByClientId(clientId: string): Promise<Client | undefined>;
  getAllClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, updates: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: number): Promise<void>;
  
  // Bond operations
  createBond(bond: InsertBond): Promise<Bond>;
  getClientBonds(clientId: number): Promise<Bond[]>;
  getAllBonds(): Promise<Bond[]>;
  updateBond(id: number, updates: Partial<InsertBond>): Promise<Bond>;
  deleteBond(id: number): Promise<void>;
  getActiveBonds(): Promise<Bond[]>;
  getClientActiveBondCount(clientId: number): Promise<number>;
  
  // Check-in operations
  createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn>;
  getClientCheckIns(clientId: number): Promise<CheckIn[]>;
  getAllCheckIns(): Promise<CheckIn[]>;
  getLastCheckIn(clientId: number): Promise<CheckIn | undefined>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getClientPayments(clientId: number): Promise<Payment[]>;
  getAllPayments(): Promise<Payment[]>;
  confirmPayment(id: number, confirmedBy: string): Promise<Payment>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getClientMessages(clientId: number): Promise<Message[]>;
  markMessageAsRead(id: number): Promise<void>;
  
  // Court date operations
  createCourtDate(courtDate: InsertCourtDate): Promise<CourtDate>;
  getClientCourtDates(clientId: number): Promise<CourtDate[]>;
  getAllUpcomingCourtDates(): Promise<CourtDate[]>;
  updateCourtDate(id: number, updates: Partial<InsertCourtDate>): Promise<CourtDate>;
  
  // Expense operations
  createExpense(expense: InsertExpense): Promise<Expense>;
  getAllExpenses(): Promise<Expense[]>;
  getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]>;
  updateExpense(id: number, updates: Partial<InsertExpense>): Promise<Expense>;
  deleteExpense(id: number): Promise<void>;
  
  // Alert operations
  createAlert(alert: InsertAlert): Promise<Alert>;
  getClientAlerts(clientId: number): Promise<Alert[]>;
  getAllUnacknowledgedAlerts(): Promise<Alert[]>;
  acknowledgeAlert(id: number, acknowledgedBy: string): Promise<Alert>;
  
  // Additional client info operations
  getClientVehicles(clientId: number): Promise<ClientVehicle[]>;
  getClientFamily(clientId: number): Promise<FamilyMember[]>;
  getClientEmployment(clientId: number): Promise<EmploymentInfo[]>;
  getClientFiles(clientId: number): Promise<ClientFile[]>;
  
  // Court date reminder operations
  getAllCourtDates(): Promise<CourtDate[]>;
  getCourtDateReminders(): Promise<any[]>;
  acknowledgeReminder(reminderId: string): Promise<any>;
  updateCourtDate(id: number, updates: Partial<InsertCourtDate>): Promise<CourtDate>;
  
  // Arrest monitoring operations
  getArrestRecords(): Promise<any[]>;
  getMonitoringConfig(): Promise<any[]>;
  scanArrestLogs(): Promise<any>;
  acknowledgeArrestRecord(recordId: string): Promise<any>;
  getPublicArrestLogs(): Promise<any[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification>;
  confirmNotification(id: number, confirmedBy: string): Promise<Notification>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(id: number): Promise<void>;
  
  // Court date reminder operations
  createCourtDateReminder(reminder: InsertCourtDateReminder): Promise<CourtDateReminder>;
  getCourtDateRemindersForDate(courtDateId: number): Promise<CourtDateReminder[]>;
  scheduleFollowupReminders(courtDateId: number): Promise<void>;
  
  // Notification preferences operations
  getUserNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined>;
  upsertNotificationPreferences(preferences: InsertNotificationPreferences): Promise<NotificationPreferences>;
}

// In-memory storage for development
class MemoryStorage implements IStorage {
  private users: User[] = [];
  private clients: Client[] = [];
  private bonds: Bond[] = [];
  private checkIns: CheckIn[] = [];
  private payments: Payment[] = [];
  private messages: Message[] = [];
  private courtDates: CourtDate[] = [];
  private expenses: Expense[] = [];
  private alerts: Alert[] = [];
  private notifications: Notification[] = [];
  private courtDateReminders: CourtDateReminder[] = [];
  private notificationPreferences: NotificationPreferences[] = [];
  private clientVehicles: ClientVehicle[] = [];
  private familyMembers: FamilyMember[] = [];
  private employmentInfo: EmploymentInfo[] = [];
  private clientFiles: ClientFile[] = [];
  private nextId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Add sample client data
    const sampleClient = {
      id: 1,
      clientId: "SB123456",
      password: "$2b$10$example.hash", // bcrypt hash of "password123"
      fullName: "John Smith",
      phoneNumber: "(555) 123-4567",
      address: "123 Main St, Anytown, ST 12345",
      dateOfBirth: "1985-06-15",
      emergencyContact: "Jane Smith",
      emergencyPhone: "(555) 987-6543",
      bondAmount: "25000.00",
      courtDate: new Date("2024-02-15T10:00:00Z"),
      courtLocation: "District Court Room 3A",
      charges: "Driving under the influence",
      isActive: true,
      lastCheckIn: new Date("2024-01-10T14:30:00Z"),
      missedCheckIns: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: null,
    };
    this.clients.push(sampleClient);
    this.nextId = 2;
    
    // Add sample vehicle data
    this.clientVehicles.push({
      id: 1,
      clientId: 1,
      make: "Honda",
      model: "Civic",
      year: 2019,
      color: "Blue",
      licensePlate: "ABC123",
      vin: "1HGBH41JXMN109186",
      createdAt: new Date(),
    });
    
    // Add sample family data
    this.familyMembers.push({
      id: 1,
      clientId: 1,
      name: "Jane Smith",
      relationship: "Sister",
      phoneNumber: "(555) 987-6543",
      address: "456 Oak Ave, Anytown, ST 12345",
      createdAt: new Date(),
    });
    
    this.familyMembers.push({
      id: 2,
      clientId: 1,
      name: "Robert Johnson",
      relationship: "Emergency Contact",
      phoneNumber: "(555) 123-7890",
      address: "789 Pine St, Anytown, ST 12345",
      createdAt: new Date(),
    });
    
    // Add sample employment data
    this.employmentInfo.push({
      id: 1,
      clientId: 1,
      employerName: "ABC Construction Co.",
      position: "Heavy Equipment Operator",
      employerPhone: "(555) 456-7890",
      employerAddress: "100 Industrial Blvd, Anytown, ST 12345",
      startDate: "2020-03-15",
      salary: "52000.00",
      createdAt: new Date(),
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingIndex = this.users.findIndex(u => u.id === userData.id);
    const user = {
      ...userData,
      updatedAt: new Date(),
      createdAt: userData.createdAt || new Date(),
    } as User;
    
    if (existingIndex >= 0) {
      this.users[existingIndex] = user;
    } else {
      this.users.push(user);
    }
    return user;
  }

  // Client operations
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.find(c => c.id === id);
  }

  async getClientByClientId(clientId: string): Promise<Client | undefined> {
    return this.clients.find(c => c.clientId === clientId);
  }

  async getAllClients(): Promise<Client[]> {
    return [...this.clients].sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createClient(clientData: InsertClient): Promise<Client> {
    const client = {
      ...clientData,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Client;
    this.clients.push(client);
    return client;
  }

  async updateClient(id: number, updates: Partial<InsertClient>): Promise<Client> {
    const index = this.clients.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error("Client not found");
    }
    
    this.clients[index] = {
      ...this.clients[index],
      ...updates,
      updatedAt: new Date(),
    };
    return this.clients[index];
  }

  async deleteClient(id: number): Promise<void> {
    const index = this.clients.findIndex(c => c.id === id);
    if (index >= 0) {
      this.clients.splice(index, 1);
    }
  }

  // Check-in operations
  async createCheckIn(checkInData: InsertCheckIn): Promise<CheckIn> {
    const checkIn = {
      ...checkInData,
      id: this.nextId++,
      checkInTime: checkInData.checkInTime || new Date(),
      createdAt: new Date(),
    } as CheckIn;
    
    this.checkIns.push(checkIn);
    
    // Update client's last check-in time
    if (checkInData.clientId) {
      const clientIndex = this.clients.findIndex(c => c.id === checkInData.clientId);
      if (clientIndex >= 0) {
        this.clients[clientIndex] = {
          ...this.clients[clientIndex],
          lastCheckIn: new Date(),
          missedCheckIns: 0,
          updatedAt: new Date(),
        };
      }
    }
    
    return checkIn;
  }

  async getClientCheckIns(clientId: number): Promise<CheckIn[]> {
    return this.checkIns
      .filter(c => c.clientId === clientId)
      .sort((a, b) => new Date(b.checkInTime!).getTime() - new Date(a.checkInTime!).getTime());
  }

  async getLastCheckIn(clientId: number): Promise<CheckIn | undefined> {
    const checkIns = await this.getClientCheckIns(clientId);
    return checkIns[0];
  }

  // Payment operations
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const payment = {
      ...paymentData,
      id: this.nextId++,
      paymentDate: paymentData.paymentDate || new Date(),
      confirmed: false,
      createdAt: new Date(),
    } as Payment;
    this.payments.push(payment);
    return payment;
  }

  async getClientPayments(clientId: number): Promise<Payment[]> {
    return this.payments
      .filter(p => p.clientId === clientId)
      .sort((a, b) => new Date(b.paymentDate!).getTime() - new Date(a.paymentDate!).getTime());
  }

  async getAllPayments(): Promise<Payment[]> {
    return [...this.payments].sort((a, b) => new Date(b.paymentDate!).getTime() - new Date(a.paymentDate!).getTime());
  }

  async confirmPayment(id: number, confirmedBy: string): Promise<Payment> {
    const index = this.payments.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error("Payment not found");
    }
    
    this.payments[index] = {
      ...this.payments[index],
      confirmed: true,
      confirmedBy,
      confirmedAt: new Date(),
    };
    return this.payments[index];
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const message = {
      ...messageData,
      id: this.nextId++,
      isRead: false,
      createdAt: new Date(),
    } as Message;
    this.messages.push(message);
    return message;
  }

  async getClientMessages(clientId: number): Promise<Message[]> {
    return this.messages
      .filter(m => m.clientId === clientId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async markMessageAsRead(id: number): Promise<void> {
    const index = this.messages.findIndex(m => m.id === id);
    if (index >= 0) {
      this.messages[index].isRead = true;
    }
  }

  // Court date operations
  async createCourtDate(courtDateData: InsertCourtDate): Promise<CourtDate> {
    const courtDate = {
      ...courtDateData,
      id: this.nextId++,
      completed: false,
      createdAt: new Date(),
    } as CourtDate;
    this.courtDates.push(courtDate);
    return courtDate;
  }

  async getClientCourtDates(clientId: number): Promise<CourtDate[]> {
    return this.courtDates
      .filter(c => c.clientId === clientId)
      .sort((a, b) => new Date(b.courtDate).getTime() - new Date(a.courtDate).getTime());
  }

  async getAllUpcomingCourtDates(): Promise<CourtDate[]> {
    const now = new Date();
    return this.courtDates
      .filter(c => new Date(c.courtDate) >= now && !c.completed)
      .sort((a, b) => new Date(a.courtDate).getTime() - new Date(b.courtDate).getTime());
  }

  async updateCourtDate(id: number, updates: Partial<InsertCourtDate>): Promise<CourtDate> {
    const index = this.courtDates.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error("Court date not found");
    }
    
    this.courtDates[index] = {
      ...this.courtDates[index],
      ...updates,
    };
    return this.courtDates[index];
  }

  // Expense operations
  async createExpense(expenseData: InsertExpense): Promise<Expense> {
    const expense = {
      ...expenseData,
      id: this.nextId++,
      expenseDate: expenseData.expenseDate || new Date(),
      createdAt: new Date(),
    } as Expense;
    this.expenses.push(expense);
    return expense;
  }

  async getAllExpenses(): Promise<Expense[]> {
    return [...this.expenses].sort((a, b) => new Date(b.expenseDate!).getTime() - new Date(a.expenseDate!).getTime());
  }

  async getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    return this.expenses
      .filter(e => {
        const expenseDate = new Date(e.expenseDate!);
        return expenseDate >= startDate && expenseDate <= endDate;
      })
      .sort((a, b) => new Date(b.expenseDate!).getTime() - new Date(a.expenseDate!).getTime());
  }

  async updateExpense(id: number, updates: Partial<InsertExpense>): Promise<Expense> {
    const index = this.expenses.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error("Expense not found");
    }
    
    this.expenses[index] = {
      ...this.expenses[index],
      ...updates,
    };
    return this.expenses[index];
  }

  async deleteExpense(id: number): Promise<void> {
    const index = this.expenses.findIndex(e => e.id === id);
    if (index >= 0) {
      this.expenses.splice(index, 1);
    }
  }

  // Alert operations
  async createAlert(alertData: InsertAlert): Promise<Alert> {
    const alert = {
      ...alertData,
      id: this.nextId++,
      acknowledged: false,
      createdAt: new Date(),
    } as Alert;
    this.alerts.push(alert);
    return alert;
  }

  async getClientAlerts(clientId: number): Promise<Alert[]> {
    return this.alerts
      .filter(a => a.clientId === clientId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getAllUnacknowledgedAlerts(): Promise<Alert[]> {
    return this.alerts
      .filter(a => !a.acknowledged)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async acknowledgeAlert(id: number, acknowledgedBy: string): Promise<Alert> {
    const index = this.alerts.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error("Alert not found");
    }
    
    this.alerts[index] = {
      ...this.alerts[index],
      acknowledged: true,
      acknowledgedBy,
      acknowledgedAt: new Date(),
    };
    return this.alerts[index];
  }

  // Additional client info operations
  async getClientVehicles(clientId: number): Promise<ClientVehicle[]> {
    return this.clientVehicles.filter(v => v.clientId === clientId);
  }

  async getClientFamily(clientId: number): Promise<FamilyMember[]> {
    return this.familyMembers.filter(f => f.clientId === clientId);
  }

  async getClientEmployment(clientId: number): Promise<EmploymentInfo[]> {
    return this.employmentInfo.filter(e => e.clientId === clientId);
  }

  async getClientFiles(clientId: number): Promise<ClientFile[]> {
    return this.clientFiles.filter(f => f.clientId === clientId);
  }

  // Bond operations
  async createBond(bondData: InsertBond): Promise<Bond> {
    const bond = {
      ...bondData,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Bond;
    this.bonds.push(bond);
    return bond;
  }

  async getClientBonds(clientId: number): Promise<Bond[]> {
    return this.bonds.filter(b => b.clientId === clientId);
  }

  async getAllBonds(): Promise<Bond[]> {
    return [...this.bonds];
  }

  async updateBond(id: number, updates: Partial<InsertBond>): Promise<Bond> {
    const index = this.bonds.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error("Bond not found");
    }
    
    this.bonds[index] = {
      ...this.bonds[index],
      ...updates,
      updatedAt: new Date(),
    };
    return this.bonds[index];
  }

  async deleteBond(id: number): Promise<void> {
    const index = this.bonds.findIndex(b => b.id === id);
    if (index >= 0) {
      this.bonds.splice(index, 1);
    }
  }

  async getActiveBonds(): Promise<Bond[]> {
    return this.bonds.filter(b => b.status === 'active');
  }

  async getClientActiveBondCount(clientId: number): Promise<number> {
    return this.bonds.filter(b => b.clientId === clientId && b.status === 'active').length;
  }

  // Court date reminder operations
  async getAllCourtDates(): Promise<CourtDate[]> {
    return [...this.courtDates];
  }

  async getCourtDateReminders(): Promise<any[]> {
    const now = new Date();
    const reminders = [];

    for (const courtDate of this.courtDates) {
      const courtDateObj = new Date(courtDate.courtDate);
      const timeDiff = courtDateObj.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysDiff <= 7 && daysDiff >= 0) {
        let priority = 'low';
        if (daysDiff === 0) priority = 'critical';
        else if (daysDiff === 1) priority = 'high';
        else if (daysDiff <= 3) priority = 'medium';

        const type = daysDiff === 0 ? 'today' : daysDiff < 0 ? 'overdue' : 'upcoming';

        reminders.push({
          id: `reminder-${courtDate.id}-${Date.now()}`,
          courtDateId: courtDate.id,
          clientId: courtDate.clientId,
          clientName: 'Unknown Client',
          courtDate: courtDate.courtDate,
          courtLocation: courtDate.courtLocation,
          daysUntil: daysDiff,
          priority,
          type,
          isAcknowledged: false
        });
      }
    }

    return reminders;
  }

  async acknowledgeReminder(reminderId: string): Promise<any> {
    return { id: reminderId, acknowledged: true, acknowledgedAt: new Date() };
  }

  // Arrest monitoring operations
  async getArrestRecords(): Promise<any[]> {
    return [];
  }

  async getMonitoringConfig(): Promise<any[]> {
    const hawaiiCounties = [
      { id: 'honolulu', name: 'Honolulu County', agency: 'Honolulu Police Department' },
      { id: 'hawaii', name: 'Hawaii County', agency: 'Hawaii Police Department' },
      { id: 'maui', name: 'Maui County', agency: 'Maui Police Department' },
      { id: 'kauai', name: 'Kauai County', agency: 'Kauai Police Department' }
    ];

    return hawaiiCounties.map(county => ({
      id: `config-${county.id}`,
      county: county.id,
      agency: county.agency,
      isEnabled: true,
      lastChecked: new Date().toISOString(),
      checkInterval: 30,
      apiEndpoint: `https://api.${county.id}pd.gov/arrest-logs`,
      status: 'active'
    }));
  }

  async scanArrestLogs(): Promise<any> {
    return {
      success: true,
      newRecords: 0,
      lastScanned: new Date().toISOString(),
      sourcesChecked: ['Honolulu PD', 'Hawaii County PD', 'Maui PD', 'Kauai PD']
    };
  }

  async acknowledgeArrestRecord(recordId: string): Promise<any> {
    return {
      id: recordId,
      status: 'processed',
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: 'admin'
    };
  }

  async getPublicArrestLogs(): Promise<any[]> {
    return [];
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      id: this.nextId++,
      userId: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      priority: notificationData.priority || "medium",
      read: notificationData.read || false,
      confirmed: notificationData.confirmed || false,
      confirmedAt: notificationData.confirmedAt || null,
      confirmedBy: notificationData.confirmedBy || null,
      actionUrl: notificationData.actionUrl || null,
      metadata: notificationData.metadata || null,
      expiresAt: notificationData.expiresAt || null,
      createdAt: new Date(),
    };

    this.notifications.push(notification);
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.notifications.filter(n => n.userId === userId && !n.read);
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const notification = this.notifications.find(n => n.id === id);
    if (!notification) {
      throw new Error(`Notification with id ${id} not found`);
    }
    notification.read = true;
    return notification;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    this.notifications
      .filter(n => n.userId === userId)
      .forEach(n => n.read = true);
  }

  async confirmNotification(id: number, confirmedBy: string): Promise<Notification> {
    const notification = this.notifications.find(n => n.id === id);
    if (!notification) {
      throw new Error("Notification not found");
    }
    
    notification.confirmed = true;
    notification.confirmedAt = new Date();
    notification.confirmedBy = confirmedBy;
    
    return notification;
  }

  async deleteNotification(id: number): Promise<void> {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index >= 0) {
      this.notifications.splice(index, 1);
    }
  }

  // Court date reminder operations
  async createCourtDateReminder(reminderData: InsertCourtDateReminder): Promise<CourtDateReminder> {
    const reminder: CourtDateReminder = {
      id: this.nextId++,
      ...reminderData,
      createdAt: new Date(),
    };
    
    this.courtDateReminders.push(reminder);
    return reminder;
  }

  async getCourtDateRemindersForDate(courtDateId: number): Promise<CourtDateReminder[]> {
    return this.courtDateReminders.filter(r => r.courtDateId === courtDateId);
  }

  async scheduleFollowupReminders(courtDateId: number): Promise<void> {
    const courtDate = this.courtDates.find(cd => cd.id === courtDateId);
    if (!courtDate || !courtDate.courtDate) return;

    const courtDateTime = new Date(courtDate.courtDate);
    const now = new Date();
    
    // Schedule initial reminder (3 days before)
    const initialReminder = new Date(courtDateTime);
    initialReminder.setDate(initialReminder.getDate() - 3);
    
    if (initialReminder > now) {
      await this.createCourtDateReminder({
        courtDateId,
        reminderType: 'initial',
        scheduledFor: initialReminder,
        sent: false,
        sentAt: null,
        confirmed: false,
        confirmedBy: null,
        confirmedAt: null,
        notificationId: null,
      });
    }
    
    // Schedule follow-up reminders (1 day before, 3 hours before)
    const followup1 = new Date(courtDateTime);
    followup1.setDate(followup1.getDate() - 1);
    
    if (followup1 > now) {
      await this.createCourtDateReminder({
        courtDateId,
        reminderType: 'followup_1',
        scheduledFor: followup1,
        sent: false,
        confirmed: false,
        confirmedBy: null,
        notificationId: null,
      });
    }
    
    const followup2 = new Date(courtDateTime);
    followup2.setHours(followup2.getHours() - 3);
    
    if (followup2 > now) {
      await this.createCourtDateReminder({
        courtDateId,
        reminderType: 'followup_2',
        scheduledFor: followup2,
        sent: false,
        confirmed: false,
        confirmedBy: null,
        notificationId: null,
      });
    }
  }

  // Notification preferences operations
  async getUserNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined> {
    return this.notificationPreferences.find(p => p.userId === userId);
  }

  async upsertNotificationPreferences(preferencesData: InsertNotificationPreferences): Promise<NotificationPreferences> {
    const existingIndex = this.notificationPreferences.findIndex(p => p.userId === preferencesData.userId);
    
    if (existingIndex >= 0) {
      const updated: NotificationPreferences = {
        ...this.notificationPreferences[existingIndex],
        ...preferencesData,
        updatedAt: new Date(),
      };
      this.notificationPreferences[existingIndex] = updated;
      return updated;
    } else {
      const newPreferences: NotificationPreferences = {
        id: this.nextId++,
        userId: preferencesData.userId,
        emailEnabled: preferencesData.emailEnabled ?? true,
        courtRemindersEmail: preferencesData.courtRemindersEmail ?? true,
        paymentDueEmail: preferencesData.paymentDueEmail ?? true,
        arrestAlertsEmail: preferencesData.arrestAlertsEmail ?? true,
        bondExpiringEmail: preferencesData.bondExpiringEmail ?? true,
        inAppEnabled: preferencesData.inAppEnabled ?? true,
        courtRemindersInApp: preferencesData.courtRemindersInApp ?? true,
        paymentDueInApp: preferencesData.paymentDueInApp ?? true,
        arrestAlertsInApp: preferencesData.arrestAlertsInApp ?? true,
        bondExpiringInApp: preferencesData.bondExpiringInApp ?? true,
        courtReminderDays: preferencesData.courtReminderDays ?? 3,
        paymentReminderDays: preferencesData.paymentReminderDays ?? 7,
        bondExpiringDays: preferencesData.bondExpiringDays ?? 30,
        soundEnabled: preferencesData.soundEnabled ?? true,
        desktopNotifications: preferencesData.desktopNotifications ?? false,
        quietHoursEnabled: preferencesData.quietHoursEnabled ?? false,
        quietHoursStart: preferencesData.quietHoursStart ?? "22:00",
        quietHoursEnd: preferencesData.quietHoursEnd ?? "08:00",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.notificationPreferences.push(newPreferences);
      return newPreferences;
    }
  }
}

// Use local file storage for data persistence on bondsman's computer
export const storage = new LocalFileStorage();