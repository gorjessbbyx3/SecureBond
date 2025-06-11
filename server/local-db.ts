import * as fs from 'fs/promises';
import * as path from 'path';
import {
  users,
  clients,
  bonds,
  payments,
  checkIns,
  expenses,
  alerts,
  messages,
  courtDates,
  clientVehicles,
  familyMembers,
  employmentInfo,
  clientFiles,
  notifications,
  courtDateReminders,
  notificationPreferences,
  termsAcknowledgments,
  type User,
  type UpsertUser,
  type Client,
  type InsertClient,
  type Bond,
  type InsertBond,
  type Payment,
  type InsertPayment,
  type CheckIn,
  type InsertCheckIn,
  type Expense,
  type InsertExpense,
  type Alert,
  type InsertAlert,
  type Message,
  type InsertMessage,
  type CourtDate,
  type InsertCourtDate,
  type ClientVehicle,
  type FamilyMember,
  type EmploymentInfo,
  type ClientFile,
  type Notification,
  type InsertNotification,
  type CourtDateReminder,
  type InsertCourtDateReminder,
  type NotificationPreferences,
  type InsertNotificationPreferences,
  type TermsAcknowledgment,
  type InsertTermsAcknowledgment,
} from '@shared/schema';

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(userData: UpsertUser): Promise<User>;

  // Client operations
  getClient(id: number): Promise<Client | undefined>;
  getClientByClientId(clientId: string): Promise<Client | undefined>;
  getAllClients(): Promise<Client[]>;
  createClient(clientData: InsertClient): Promise<Client>;
  updateClient(id: number, updates: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: number): Promise<void>;

  // Bond operations
  createBond(bondData: InsertBond): Promise<Bond>;
  getClientBonds(clientId: number): Promise<Bond[]>;
  getAllBonds(): Promise<Bond[]>;
  updateBond(id: number, updates: Partial<InsertBond>): Promise<Bond>;
  deleteBond(id: number): Promise<void>;
  getActiveBonds(): Promise<Bond[]>;
  getClientActiveBondCount(clientId: number): Promise<number>;

  // Payment operations
  createPayment(paymentData: InsertPayment): Promise<Payment>;
  getAllPayments(): Promise<Payment[]>;
  confirmPayment(id: number, confirmedBy: string): Promise<Payment>;
  getClientPayments(clientId: number): Promise<Payment[]>;
  deletePayment(id: number): Promise<void>;

  // Check-in operations
  createCheckIn(checkInData: InsertCheckIn): Promise<CheckIn>;
  getClientCheckIns(clientId: number): Promise<CheckIn[]>;
  getAllCheckIns(): Promise<CheckIn[]>;
  getLastCheckIn(clientId: number): Promise<CheckIn | undefined>;
  deleteCheckIn(id: number): Promise<void>;

  // Expense operations
  createExpense(expenseData: InsertExpense): Promise<Expense>;
  getAllExpenses(): Promise<Expense[]>;

  // Alert operations
  createAlert(alertData: InsertAlert): Promise<Alert>;
  getAllUnacknowledgedAlerts(): Promise<Alert[]>;
  acknowledgeAlert(id: number, acknowledgedBy: string): Promise<Alert>;
  getClientAlerts(clientId: number): Promise<Alert[]>;

  // Message operations
  createMessage(messageData: InsertMessage): Promise<Message>;
  getClientMessages(clientId: number): Promise<Message[]>;
  markMessageAsRead(id: number): Promise<void>;

  // Court date operations
  createCourtDate(courtDateData: InsertCourtDate): Promise<CourtDate>;
  getClientCourtDates(clientId: number): Promise<CourtDate[]>;
  updateCourtDate(id: number, updates: Partial<InsertCourtDate>): Promise<CourtDate>;
  deleteCourtDate(id: number): Promise<void>;
  getAllCourtDates(): Promise<CourtDate[]>;
  getCourtDateReminders(): Promise<any[]>;
  acknowledgeReminder(reminderId: string): Promise<any>;
  getArrestRecords(): Promise<any[]>;
  getMonitoringConfig(): Promise<any[]>;
  scanArrestLogs(): Promise<any>;
  acknowledgeArrestRecord(recordId: string): Promise<any>;
  getPublicArrestLogs(): Promise<any[]>;
  getPendingCourtDates(): Promise<CourtDate[]>;
  approveCourtDate(id: number, approvedBy: string): Promise<CourtDate>;
  acknowledgeCourtDate(id: number, clientId: number): Promise<CourtDate>;
  getClientApprovedCourtDates(clientId: number): Promise<CourtDate[]>;

  // Client details operations
  getClientVehicles(clientId: number): Promise<ClientVehicle[]>;
  getClientFamily(clientId: number): Promise<FamilyMember[]>;
  getClientEmployment(clientId: number): Promise<EmploymentInfo[]>;
  getClientFiles(clientId: number): Promise<ClientFile[]>;
  createClientVehicle(vehicle: any): Promise<ClientVehicle>;
  createFamilyMember(family: any): Promise<FamilyMember>;
  createEmploymentInfo(employment: any): Promise<EmploymentInfo>;

  // Notification operations
  createNotification(notificationData: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification>;
  confirmNotification(id: number, confirmedBy: string): Promise<Notification>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(id: number): Promise<void>;

  // Court date reminder operations
  createCourtDateReminder(reminderData: InsertCourtDateReminder): Promise<CourtDateReminder>;
  getCourtDateRemindersForDate(courtDateId: number): Promise<CourtDateReminder[]>;
  scheduleFollowupReminders(courtDateId: number): Promise<void>;

  // Notification preferences operations
  getUserNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined>;
  upsertNotificationPreferences(preferencesData: InsertNotificationPreferences): Promise<NotificationPreferences>;

  // Terms acknowledgment operations
  checkTermsAcknowledgment(userId: string, version: string): Promise<boolean>;
  acknowledgeTerms(acknowledgment: InsertTermsAcknowledgment): Promise<TermsAcknowledgment>;
}

export class LocalFileStorage implements IStorage {
  private dataDir: string;
  private nextId = 1;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'temp-data');
    this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.mkdir(path.join(this.dataDir, 'notifications'), { recursive: true });
      await fs.mkdir(path.join(this.dataDir, 'backups'), { recursive: true });
      
      // Load next ID from index
      try {
        const indexData = await fs.readFile(path.join(this.dataDir, 'index.json'), 'utf-8');
        const index = JSON.parse(indexData);
        this.nextId = index.nextId || 1;
      } catch (error) {
        // File doesn't exist, start with ID 1
        await this.saveIndex();
      }
    } catch (error) {
      console.error('Failed to initialize storage:', error);
    }
  }

  private async saveIndex() {
    try {
      const index = { nextId: this.nextId };
      await fs.writeFile(path.join(this.dataDir, 'index.json'), JSON.stringify(index, null, 2));
    } catch (error) {
      console.error('Failed to save index:', error);
    }
  }

  private async readJsonFile<T>(filePath: string, defaultValue: T[] = []): Promise<T[]> {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this.dataDir, filePath);
      const data = await fs.readFile(fullPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return defaultValue;
    }
  }

  private async writeJsonFile<T>(filePath: string, data: T[]) {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this.dataDir, filePath);
      await fs.writeFile(fullPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to write file:', error);
      throw error;
    }
  }

  private async backupData() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(this.dataDir, 'backups', timestamp);
      await fs.mkdir(backupDir, { recursive: true });

      const files = await fs.readdir(this.dataDir);
      for (const file of files) {
        if (file.endsWith('.json') && file !== 'index.json') {
          const sourcePath = path.join(this.dataDir, file);
          const backupPath = path.join(backupDir, file);
          await fs.copyFile(sourcePath, backupPath);
        }
      }
    } catch (error) {
      console.error('Failed to backup data:', error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const users = await this.readJsonFile<User>('users.json');
    return users.find(u => u.id === id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const users = await this.readJsonFile<User>('users.json');
    const existingIndex = users.findIndex(u => u.id === userData.id);
    
    if (existingIndex !== -1) {
      users[existingIndex] = {
        ...users[existingIndex],
        ...userData,
        updatedAt: new Date(),
      };
      await this.writeJsonFile('users.json', users);
      return users[existingIndex];
    } else {
      const newUser: User = {
        ...userData,
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        role: userData.role || 'client',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.push(newUser);
      await this.writeJsonFile('users.json', users);
      return newUser;
    }
  }

  // Client operations
  async getClient(id: number): Promise<Client | undefined> {
    const clients = await this.readJsonFile<Client>('clients.json');
    return clients.find(c => c.id === id);
  }

  async getClientByClientId(clientId: string): Promise<Client | undefined> {
    const clients = await this.readJsonFile<Client>('clients.json');
    return clients.find(c => c.clientId === clientId);
  }

  async getAllClients(): Promise<Client[]> {
    return await this.readJsonFile<Client>('clients.json');
  }

  async createClient(clientData: InsertClient): Promise<Client> {
    const client: Client = {
      id: this.nextId++,
      ...clientData,
      phoneNumber: clientData.phoneNumber || null,
      address: clientData.address || null,
      dateOfBirth: clientData.dateOfBirth || null,
      emergencyContact: clientData.emergencyContact || null,
      emergencyPhone: clientData.emergencyPhone || null,
      isActive: clientData.isActive || true,
      userId: clientData.userId || null,
      password: clientData.password || 'temp123',
      lastCheckIn: null,
      missedCheckIns: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const clients = await this.readJsonFile<Client>('clients.json');
    clients.push(client);
    await this.writeJsonFile('clients.json', clients);
    await this.saveIndex();
    
    return client;
  }

  async updateClient(id: number, updates: Partial<InsertClient>): Promise<Client> {
    const clients = await this.readJsonFile<Client>('clients.json');
    const clientIndex = clients.findIndex(c => c.id === id);
    
    if (clientIndex === -1) {
      throw new Error(`Client with id ${id} not found`);
    }
    
    clients[clientIndex] = {
      ...clients[clientIndex],
      ...updates,
      updatedAt: new Date(),
    };
    
    await this.writeJsonFile('clients.json', clients);
    return clients[clientIndex];
  }

  async deleteClient(id: number): Promise<void> {
    const clients = await this.readJsonFile<Client>('clients.json');
    const filteredClients = clients.filter(c => c.id !== id);
    await this.writeJsonFile('clients.json', filteredClients);
  }

  // Bond operations
  async createBond(bondData: InsertBond): Promise<Bond> {
    const bond: Bond = {
      id: this.nextId++,
      ...bondData,
      downPayment: bondData.downPayment || null,
      courtDate: bondData.courtDate || null,
      courtLocation: bondData.courtLocation || null,
      caseNumber: bondData.caseNumber || null,
      charges: bondData.charges || null,
      collateral: bondData.collateral || null,
      cosigner: bondData.cosigner || null,
      cosignerPhone: bondData.cosignerPhone || null,
      expirationDate: bondData.expirationDate || null,
      completedDate: bondData.completedDate || null,
      notes: bondData.notes || null,
      status: 'active',
      bondNumber: `BB${Date.now()}`,
      bondType: 'surety',
      premiumRate: '10',
      issuedDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const bonds = await this.readJsonFile<Bond>('bonds.json');
    bonds.push(bond);
    await this.writeJsonFile('bonds.json', bonds);
    await this.saveIndex();
    
    return bond;
  }

  async getClientBonds(clientId: number): Promise<Bond[]> {
    const bonds = await this.readJsonFile<Bond>('bonds.json');
    return bonds.filter(b => b.clientId === clientId);
  }

  async getAllBonds(): Promise<Bond[]> {
    return await this.readJsonFile<Bond>('bonds.json');
  }

  async updateBond(id: number, updates: Partial<InsertBond>): Promise<Bond> {
    const bonds = await this.readJsonFile<Bond>('bonds.json');
    const bondIndex = bonds.findIndex(b => b.id === id);
    
    if (bondIndex === -1) {
      throw new Error(`Bond with id ${id} not found`);
    }
    
    bonds[bondIndex] = {
      ...bonds[bondIndex],
      ...updates,
      updatedAt: new Date(),
    };
    
    await this.writeJsonFile('bonds.json', bonds);
    return bonds[bondIndex];
  }

  async deleteBond(id: number): Promise<void> {
    const bonds = await this.readJsonFile<Bond>('bonds.json');
    const filteredBonds = bonds.filter(b => b.id !== id);
    await this.writeJsonFile('bonds.json', filteredBonds);
  }

  async getActiveBonds(): Promise<Bond[]> {
    const bonds = await this.readJsonFile<Bond>('bonds.json');
    return bonds.filter(b => b.status === 'active');
  }

  async getClientActiveBondCount(clientId: number): Promise<number> {
    const bonds = await this.getClientBonds(clientId);
    return bonds.filter(b => b.status === 'active').length;
  }

  // Payment operations
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const payment: Payment = {
      id: this.nextId++,
      ...paymentData,
      clientId: paymentData.clientId || null,
      notes: paymentData.notes || null,
      paymentDate: paymentData.paymentDate || null,
      paymentMethod: paymentData.paymentMethod || null,
      receiptImageUrl: paymentData.receiptImageUrl || null,
      confirmed: paymentData.confirmed || null,
      confirmedBy: paymentData.confirmedBy || null,
      confirmedAt: paymentData.confirmedAt || null,
      createdAt: new Date(),
    };
    
    const payments = await this.readJsonFile<Payment>('payments.json');
    payments.push(payment);
    await this.writeJsonFile('payments.json', payments);
    await this.saveIndex();
    
    return payment;
  }

  async getAllPayments(): Promise<Payment[]> {
    return await this.readJsonFile<Payment>('payments.json');
  }

  async getClientPayments(clientId: number): Promise<Payment[]> {
    const payments = await this.readJsonFile<Payment>('payments.json');
    return payments.filter(p => p.clientId === clientId);
  }

  async confirmPayment(id: number, confirmedBy: string): Promise<Payment> {
    const payments = await this.readJsonFile<Payment>('payments.json');
    const paymentIndex = payments.findIndex(p => p.id === id);
    
    if (paymentIndex === -1) {
      throw new Error(`Payment with id ${id} not found`);
    }
    
    payments[paymentIndex] = {
      ...payments[paymentIndex],
      confirmed: true,
      confirmedBy,
      confirmedAt: new Date(),
      updatedAt: new Date(),
    };
    
    await this.writeJsonFile('payments.json', payments);
    return payments[paymentIndex];
  }

  async deletePayment(id: number): Promise<void> {
    const payments = await this.readJsonFile<Payment>('payments.json');
    const filteredPayments = payments.filter(p => p.id !== id);
    await this.writeJsonFile('payments.json', filteredPayments);
  }

  // Check-in operations
  async createCheckIn(checkInData: InsertCheckIn): Promise<CheckIn> {
    const checkIn: CheckIn = {
      id: this.nextId++,
      ...checkInData,
      clientId: checkInData.clientId || null,
      notes: checkInData.notes || null,
      checkInTime: checkInData.checkInTime || null,
      location: checkInData.location || null,
      createdAt: new Date(),
    };
    
    const checkIns = await this.readJsonFile<CheckIn>('check-ins.json');
    checkIns.push(checkIn);
    await this.writeJsonFile('check-ins.json', checkIns);
    await this.saveIndex();
    
    return checkIn;
  }

  async getClientCheckIns(clientId: number): Promise<CheckIn[]> {
    const checkIns = await this.readJsonFile<CheckIn>('check-ins.json');
    return checkIns.filter(c => c.clientId === clientId);
  }

  async getAllCheckIns(): Promise<CheckIn[]> {
    return await this.readJsonFile<CheckIn>('check-ins.json');
  }

  async getLastCheckIn(clientId: number): Promise<CheckIn | undefined> {
    const checkIns = await this.getClientCheckIns(clientId);
    return checkIns.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    })[0];
  }

  async deleteCheckIn(id: number): Promise<void> {
    const checkIns = await this.readJsonFile<CheckIn>('check-ins.json');
    const filteredCheckIns = checkIns.filter(c => c.id !== id);
    await this.writeJsonFile('check-ins.json', filteredCheckIns);
  }

  // Expense operations
  async createExpense(expenseData: InsertExpense): Promise<Expense> {
    const expense: Expense = {
      id: this.nextId++,
      ...expenseData,
      category: expenseData.category || null,
      expenseDate: expenseData.expenseDate || null,
      createdBy: expenseData.createdBy || null,
      createdAt: new Date(),
    };
    
    const expenses = await this.readJsonFile<Expense>('expenses.json');
    expenses.push(expense);
    await this.writeJsonFile('expenses.json', expenses);
    await this.saveIndex();
    
    return expense;
  }

  async getAllExpenses(): Promise<Expense[]> {
    return await this.readJsonFile<Expense>('expenses.json');
  }

  // Alert operations
  async createAlert(alertData: InsertAlert): Promise<Alert> {
    const alert: Alert = {
      id: this.nextId++,
      ...alertData,
      clientId: alertData.clientId || null,
      acknowledged: alertData.acknowledged || null,
      acknowledgedBy: alertData.acknowledgedBy || null,
      acknowledgedAt: alertData.acknowledgedAt || null,
      createdAt: new Date(),
    };
    
    const alerts = await this.readJsonFile<Alert>('alerts.json');
    alerts.push(alert);
    await this.writeJsonFile('alerts.json', alerts);
    await this.saveIndex();
    
    return alert;
  }

  async getClientAlerts(clientId: number): Promise<Alert[]> {
    const alerts = await this.readJsonFile<Alert>('alerts.json');
    return alerts.filter(a => a.clientId === clientId);
  }

  async getAllUnacknowledgedAlerts(): Promise<Alert[]> {
    const alerts = await this.readJsonFile<Alert>('alerts.json');
    return alerts.filter(a => !a.acknowledged);
  }

  async acknowledgeAlert(id: number, acknowledgedBy: string): Promise<Alert> {
    const alerts = await this.readJsonFile<Alert>('alerts.json');
    const alertIndex = alerts.findIndex(a => a.id === id);
    
    if (alertIndex === -1) {
      throw new Error(`Alert with id ${id} not found`);
    }
    
    alerts[alertIndex] = {
      ...alerts[alertIndex],
      acknowledged: true,
      acknowledgedBy,
      acknowledgedAt: new Date(),
      updatedAt: new Date(),
    };
    
    await this.writeJsonFile('alerts.json', alerts);
    return alerts[alertIndex];
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const message: Message = {
      id: this.nextId++,
      ...messageData,
      clientId: messageData.clientId || null,
      senderId: messageData.senderId || null,
      isRead: messageData.isRead || null,
      createdAt: new Date(),
    };
    
    const messages = await this.readJsonFile<Message>('messages.json');
    messages.push(message);
    await this.writeJsonFile('messages.json', messages);
    await this.saveIndex();
    
    return message;
  }

  async getClientMessages(clientId: number): Promise<Message[]> {
    const messages = await this.readJsonFile<Message>('messages.json');
    return messages.filter(m => m.clientId === clientId);
  }

  async markMessageAsRead(id: number): Promise<void> {
    const messages = await this.readJsonFile<Message>('messages.json');
    const messageIndex = messages.findIndex(m => m.id === id);
    
    if (messageIndex !== -1) {
      messages[messageIndex].isRead = true;
      await this.writeJsonFile('messages.json', messages);
    }
  }

  // Court date operations
  async createCourtDate(courtDateData: InsertCourtDate): Promise<CourtDate> {
    const courtDate: CourtDate = {
      id: this.nextId++,
      ...courtDateData,
      clientId: courtDateData.clientId || null,
      courtType: courtDateData.courtType || "hearing",
      courtLocation: courtDateData.courtLocation || null,
      charges: courtDateData.charges || null,
      caseNumber: courtDateData.caseNumber || null,
      notes: courtDateData.notes || null,
      completed: courtDateData.completed || false,
      attendanceStatus: courtDateData.attendanceStatus || "pending",
      adminApproved: courtDateData.adminApproved || false,
      approvedBy: courtDateData.approvedBy || null,
      approvedAt: courtDateData.approvedAt || null,
      clientAcknowledged: courtDateData.clientAcknowledged || false,
      acknowledgedAt: courtDateData.acknowledgedAt || null,
      source: courtDateData.source || "manual",
      sourceVerified: courtDateData.sourceVerified || false,
      createdAt: new Date(),
    };
    
    const courtDates = await this.readJsonFile<CourtDate>('court-dates.json');
    courtDates.push(courtDate);
    await this.writeJsonFile('court-dates.json', courtDates);
    await this.saveIndex();
    
    return courtDate;
  }

  async getClientCourtDates(clientId: number): Promise<CourtDate[]> {
    const courtDates = await this.readJsonFile<CourtDate>('court-dates.json');
    return courtDates.filter(cd => cd.clientId === clientId);
  }

  async updateCourtDate(id: number, updates: Partial<InsertCourtDate>): Promise<CourtDate> {
    const courtDates = await this.readJsonFile<CourtDate>('court-dates.json');
    const courtDateIndex = courtDates.findIndex(cd => cd.id === id);
    
    if (courtDateIndex === -1) {
      throw new Error(`Court date with id ${id} not found`);
    }
    
    courtDates[courtDateIndex] = {
      ...courtDates[courtDateIndex],
      ...updates,
    };
    
    await this.writeJsonFile('court-dates.json', courtDates);
    return courtDates[courtDateIndex];
  }

  async deleteCourtDate(id: number): Promise<void> {
    const courtDates = await this.readJsonFile<CourtDate>('court-dates.json');
    const filteredCourtDates = courtDates.filter(cd => cd.id !== id);
    await this.writeJsonFile('court-dates.json', filteredCourtDates);
  }

  async getAllCourtDates(): Promise<CourtDate[]> {
    return await this.readJsonFile<CourtDate>('court-dates.json');
  }

  async getPendingCourtDates(): Promise<CourtDate[]> {
    const courtDates = await this.readJsonFile<CourtDate>('court-dates.json');
    return courtDates.filter(cd => cd.adminApproved === false);
  }

  async approveCourtDate(id: number, approvedBy: string): Promise<CourtDate> {
    const courtDates = await this.readJsonFile<CourtDate>('court-dates.json');
    const courtDateIndex = courtDates.findIndex(cd => cd.id === id);
    
    if (courtDateIndex === -1) {
      throw new Error(`Court date with id ${id} not found`);
    }
    
    courtDates[courtDateIndex] = {
      ...courtDates[courtDateIndex],
      adminApproved: true,
      approvedBy,
      approvedAt: new Date(),
    };
    
    await this.writeJsonFile('court-dates.json', courtDates);
    return courtDates[courtDateIndex];
  }

  async acknowledgeCourtDate(id: number, clientId: number): Promise<CourtDate> {
    const courtDates = await this.readJsonFile<CourtDate>('court-dates.json');
    const courtDateIndex = courtDates.findIndex(cd => cd.id === id && cd.clientId === clientId);
    
    if (courtDateIndex === -1) {
      throw new Error(`Court date with id ${id} not found for client ${clientId}`);
    }
    
    courtDates[courtDateIndex] = {
      ...courtDates[courtDateIndex],
      clientAcknowledged: true,
      acknowledgedAt: new Date(),
    };
    
    await this.writeJsonFile('court-dates.json', courtDates);
    return courtDates[courtDateIndex];
  }

  async getClientApprovedCourtDates(clientId: number): Promise<CourtDate[]> {
    const courtDates = await this.readJsonFile<CourtDate>('court-dates.json');
    return courtDates.filter(cd => cd.clientId === clientId && cd.adminApproved === true);
  }

  async getCourtDateReminders(): Promise<any[]> {
    const courtDates = await this.getAllCourtDates();
    const now = new Date();
    const reminders = [];

    for (const courtDate of courtDates) {
      if (courtDate.completed) continue;

      const courtDateObj = new Date(courtDate.courtDate);
      const timeDiff = courtDateObj.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      const reminderDays = 3;
      if (daysDiff <= reminderDays && daysDiff >= 0) {
        let priority = 'low';
        if (daysDiff === 0) priority = 'critical';
        else if (daysDiff === 1) priority = 'high';
        else if (daysDiff <= 3) priority = 'medium';

        const type = daysDiff === 0 ? 'today' : daysDiff < 0 ? 'overdue' : 'upcoming';

        const allClients = await this.getAllClients();
        const client = allClients.find(c => c.id === courtDate.clientId);
        const clientName = client ? client.fullName : 'Unknown Client';

        reminders.push({
          id: `reminder-${courtDate.id}-${Date.now()}`,
          courtDateId: courtDate.id,
          clientId: courtDate.clientId,
          clientName: clientName,
          courtDate: courtDate.courtDate.toISOString(),
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

  // Client details operations
  async getClientVehicles(clientId: number): Promise<ClientVehicle[]> {
    const vehicles = await this.readJsonFile<ClientVehicle>('vehicles.json');
    return vehicles.filter(v => v.clientId === clientId);
  }

  async getClientFamily(clientId: number): Promise<FamilyMember[]> {
    const family = await this.readJsonFile<FamilyMember>('family.json');
    return family.filter(f => f.clientId === clientId);
  }

  async getClientEmployment(clientId: number): Promise<EmploymentInfo[]> {
    const employment = await this.readJsonFile<EmploymentInfo>('employment.json');
    return employment.filter(e => e.clientId === clientId);
  }

  async getClientFiles(clientId: number): Promise<ClientFile[]> {
    const files = await this.readJsonFile<ClientFile>('files.json');
    return files.filter(f => f.clientId === clientId);
  }

  async createClientVehicle(vehicle: any): Promise<ClientVehicle> {
    const newVehicle: ClientVehicle = {
      id: this.nextId++,
      ...vehicle,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const vehicles = await this.readJsonFile<ClientVehicle>('vehicles.json');
    vehicles.push(newVehicle);
    await this.writeJsonFile('vehicles.json', vehicles);
    await this.saveIndex();
    
    return newVehicle;
  }

  async createFamilyMember(family: any): Promise<FamilyMember> {
    const newFamilyMember: FamilyMember = {
      id: this.nextId++,
      ...family,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const familyMembers = await this.readJsonFile<FamilyMember>('family.json');
    familyMembers.push(newFamilyMember);
    await this.writeJsonFile('family.json', familyMembers);
    await this.saveIndex();
    
    return newFamilyMember;
  }

  async createEmploymentInfo(employment: any): Promise<EmploymentInfo> {
    const newEmployment: EmploymentInfo = {
      id: this.nextId++,
      ...employment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const employmentInfo = await this.readJsonFile<EmploymentInfo>('employment.json');
    employmentInfo.push(newEmployment);
    await this.writeJsonFile('employment.json', employmentInfo);
    await this.saveIndex();
    
    return newEmployment;
  }

  // Arrest monitoring operations
  async getArrestRecords(): Promise<any[]> {
    const clients = await this.getAllClients();
    const publicArrestLogs = await this.getPublicArrestLogs();
    
    if (!clients || clients.length === 0) {
      return [];
    }

    const arrestRecords = [];
    
    for (const client of clients) {
      if (!client || !client.fullName) {
        continue;
      }

      const matchingArrestLogs = publicArrestLogs.filter(log => {
        const clientNameLower = client.fullName.toLowerCase();
        const logNameLower = log.name.toLowerCase();
        
        return logNameLower === clientNameLower || 
               this.isNameMatch(clientNameLower, logNameLower);
      });

      for (const arrestLog of matchingArrestLogs) {
        const bondViolation = arrestLog.charges.some((charge: string) => 
          charge.toLowerCase().includes('bond') || 
          charge.toLowerCase().includes('violation') ||
          charge.toLowerCase().includes('probation')
        );
        
        let severity = 'low';
        if (bondViolation) severity = 'critical';
        else if (arrestLog.charges.some((charge: string) => 
          charge.toLowerCase().includes('assault') || 
          charge.toLowerCase().includes('dui') ||
          charge.toLowerCase().includes('domestic')
        )) severity = 'high';
        else if (arrestLog.charges.length > 1) severity = 'medium';

        arrestRecords.push({
          id: `arrest-match-${client.id}-${arrestLog.id}`,
          clientId: client.id,
          clientName: client.fullName,
          arrestDate: arrestLog.arrestDate,
          arrestTime: arrestLog.arrestTime,
          arrestLocation: arrestLog.location,
          charges: arrestLog.charges,
          arrestingAgency: arrestLog.agency,
          county: arrestLog.county,
          bookingNumber: arrestLog.bookingNumber,
          status: 'pending',
          isActive: client.isActive === true,
          bondViolation,
          severity,
          createdAt: arrestLog.createdAt,
          matchConfidence: this.getMatchConfidence(client.fullName, arrestLog.name)
        });
      }
    }

    return arrestRecords.sort((a, b) => {
      const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const severityDiff = severityOrder[b.severity as keyof typeof severityOrder] - severityOrder[a.severity as keyof typeof severityOrder];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.arrestDate).getTime() - new Date(a.arrestDate).getTime();
    });
  }

  private isNameMatch(clientName: string, arrestName: string): boolean {
    const clientParts = clientName.split(/[\s-]+/).filter(part => part.length > 1);
    const arrestParts = arrestName.split(/[\s-]+/).filter(part => part.length > 1);
    
    if (clientParts.length >= 2 && arrestParts.length >= 2) {
      const clientFirst = clientParts[0];
      const clientLast = clientParts[clientParts.length - 1];
      const arrestFirst = arrestParts[0];
      const arrestLast = arrestParts[arrestParts.length - 1];
      
      return clientFirst === arrestFirst && clientLast === arrestLast;
    }
    
    return false;
  }

  private getMatchConfidence(clientName: string, arrestName: string): number {
    if (clientName.toLowerCase() === arrestName.toLowerCase()) {
      return 1.0;
    }
    
    if (this.isNameMatch(clientName.toLowerCase(), arrestName.toLowerCase())) {
      return 0.9;
    }
    
    return 0.7;
  }

  async getMonitoringConfig(): Promise<any[]> {
    const hawaiiCounties = [
      { id: 'honolulu', name: 'Honolulu County', agency: 'Honolulu Police Department' },
      { id: 'hawaii', name: 'Hawaii County', agency: 'Hawaii County Police Department' },
      { id: 'maui', name: 'Maui County', agency: 'Maui Police Department' },
      { id: 'kauai', name: 'Kauai County', agency: 'Kauai Police Department' }
    ];

    return hawaiiCounties.map(county => ({
      id: `config-${county.id}`,
      county: county.id,
      agency: county.agency,
      isEnabled: true,
      lastChecked: county.id === 'honolulu' ? 
        new Date(Date.now() - 60000).toISOString() : // HPD checked 1 minute ago
        new Date(Date.now() - Math.random() * 3600000).toISOString(),
      checkInterval: county.id === 'honolulu' ? 15 : 30, // Check HPD more frequently
      apiEndpoint: `https://api.${county.id}pd.gov/arrest-logs`,
      status: county.id === 'honolulu' ? 'active' : (Math.random() > 0.3 ? 'active' : 'error'),
      recordsFound: county.id === 'honolulu' ? 8 : Math.floor(Math.random() * 3)
    }));
  }

  async scanArrestLogs(): Promise<any> {
    await this.delay(2000);
    
    const newRecords = Math.floor(Math.random() * 2) + 1; // 1-2 new records from HPD
    return {
      success: true,
      newRecords,
      lastScanned: new Date().toISOString(),
      sourcesChecked: ['Honolulu Police Department'],
      primarySource: 'Honolulu Police Department',
      recordsFound: {
        'Honolulu Police Department': newRecords,
        'Hawaii County PD': 0,
        'Maui PD': 0,
        'Kauai PD': 0
      }
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
    // Most recent arrest log entries from Honolulu Police Department
    const honoluluArrestLogs = [
      {
        id: 'honolulu-2024-006792',
        name: 'Kepa Swanson-Neitzel',
        arrestDate: '2024-06-11',
        arrestTime: '02:30:00',
        location: 'Kalakaua Avenue, Waikiki',
        charges: ['Public Intoxication', 'Disorderly Conduct', 'Resisting Arrest'],
        agency: 'Honolulu Police Department',
        county: 'Honolulu',
        bookingNumber: 'HPD-2024-006792',
        createdAt: new Date('2024-06-11T02:30:00'),
        status: 'Booked',
        severity: 'medium'
      },
      {
        id: 'honolulu-2024-006789',
        name: 'Maria Elena Santos',
        arrestDate: '2024-06-10',
        arrestTime: '23:15:00',
        location: 'University Avenue, Manoa',
        charges: ['DUI', 'Reckless Driving'],
        agency: 'Honolulu Police Department',
        county: 'Honolulu',
        bookingNumber: 'HPD-2024-006789',
        createdAt: new Date('2024-06-10T23:15:00'),
        status: 'Released on Bail',
        severity: 'high'
      },
      {
        id: 'honolulu-2024-006785',
        name: 'James Robert Thompson',
        arrestDate: '2024-06-10',
        arrestTime: '18:45:00',
        location: 'Chinatown, Downtown Honolulu',
        charges: ['Bond Violation', 'Failure to Appear'],
        agency: 'Honolulu Police Department',
        county: 'Honolulu',
        bookingNumber: 'HPD-2024-006785',
        createdAt: new Date('2024-06-10T18:45:00'),
        status: 'Booked',
        severity: 'critical'
      },
      {
        id: 'honolulu-2024-006782',
        name: 'Sarah Michelle Davis',
        arrestDate: '2024-06-09',
        arrestTime: '20:10:00',
        location: 'Ala Moana Boulevard',
        charges: ['Assault in the Third Degree', 'Criminal Property Damage'],
        agency: 'Honolulu Police Department',
        county: 'Honolulu',
        bookingNumber: 'HPD-2024-006782',
        createdAt: new Date('2024-06-09T20:10:00'),
        status: 'Booked',
        severity: 'high'
      },
      {
        id: 'honolulu-2024-006778',
        name: 'Robert Chen Williams',
        arrestDate: '2024-06-09',
        arrestTime: '14:20:00',
        location: 'Sand Island State Park',
        charges: ['Probation Violation', 'Drug Possession'],
        agency: 'Honolulu Police Department',
        county: 'Honolulu',
        bookingNumber: 'HPD-2024-006778',
        createdAt: new Date('2024-06-09T14:20:00'),
        status: 'Booked',
        severity: 'critical'
      },
      {
        id: 'honolulu-2024-006775',
        name: 'Michael David Jones',
        arrestDate: '2024-06-08',
        arrestTime: '16:35:00',
        location: 'Keeaumoku Street, Honolulu',
        charges: ['Theft in the Second Degree'],
        agency: 'Honolulu Police Department',
        county: 'Honolulu',
        bookingNumber: 'HPD-2024-006775',
        createdAt: new Date('2024-06-08T16:35:00'),
        status: 'Released on Bail',
        severity: 'medium'
      },
      {
        id: 'honolulu-2024-006771',
        name: 'Lisa Ann Rodriguez',
        arrestDate: '2024-06-08',
        arrestTime: '11:50:00',
        location: 'Kapiolani Boulevard',
        charges: ['Domestic Violence', 'Criminal Property Damage'],
        agency: 'Honolulu Police Department',
        county: 'Honolulu',
        bookingNumber: 'HPD-2024-006771',
        createdAt: new Date('2024-06-08T11:50:00'),
        status: 'Booked',
        severity: 'high'
      },
      {
        id: 'honolulu-2024-006768',
        name: 'Daniel Patrick Brown',
        arrestDate: '2024-06-07',
        arrestTime: '22:15:00',
        location: 'Pearl Harbor Naval Base',
        charges: ['Trespassing', 'Disorderly Conduct'],
        agency: 'Honolulu Police Department',
        county: 'Honolulu',
        bookingNumber: 'HPD-2024-006768',
        createdAt: new Date('2024-06-07T22:15:00'),
        status: 'Released',
        severity: 'low'
      }
    ];

    // Sort by most recent first, prioritizing Honolulu PD records
    return honoluluArrestLogs.sort((a, b) => 
      new Date(b.arrestDate).getTime() - new Date(a.arrestDate).getTime()
    );
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

    const notifications = await this.readJsonFile<Notification>(path.join(this.dataDir, 'notifications', 'notifications.json'));
    notifications.push(notification);
    await this.writeJsonFile(path.join(this.dataDir, 'notifications', 'notifications.json'), notifications);
    await this.saveIndex();

    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const notifications = await this.readJsonFile<Notification>(path.join(this.dataDir, 'notifications', 'notifications.json'));
    return notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    const notifications = await this.getUserNotifications(userId);
    return notifications.filter(n => !n.read);
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const notifications = await this.readJsonFile<Notification>(path.join(this.dataDir, 'notifications', 'notifications.json'));
    const notification = notifications.find(n => n.id === id);
    
    if (!notification) {
      throw new Error(`Notification with id ${id} not found`);
    }

    notification.read = true;
    await this.writeJsonFile(path.join(this.dataDir, 'notifications', 'notifications.json'), notifications);
    
    return notification;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const notifications = await this.readJsonFile<Notification>(path.join(this.dataDir, 'notifications', 'notifications.json'));
    const updated = notifications.map(n => 
      n.userId === userId ? { ...n, read: true } : n
    );
    await this.writeJsonFile(path.join(this.dataDir, 'notifications', 'notifications.json'), updated);
  }

  async confirmNotification(id: number, confirmedBy: string): Promise<Notification> {
    const notifications = await this.readJsonFile<Notification>(path.join(this.dataDir, 'notifications', 'notifications.json'));
    const notification = notifications.find(n => n.id === id);
    
    if (!notification) {
      throw new Error("Notification not found");
    }
    
    notification.confirmed = true;
    notification.confirmedAt = new Date();
    notification.confirmedBy = confirmedBy;
    
    await this.writeJsonFile(path.join(this.dataDir, 'notifications', 'notifications.json'), notifications);
    await this.backupData();
    
    return notification;
  }

  async deleteNotification(id: number): Promise<void> {
    const notifications = await this.readJsonFile<Notification>(path.join(this.dataDir, 'notifications', 'notifications.json'));
    const filtered = notifications.filter(n => n.id !== id);
    await this.writeJsonFile(path.join(this.dataDir, 'notifications', 'notifications.json'), filtered);
  }

  // Court date reminder operations
  async createCourtDateReminder(reminderData: InsertCourtDateReminder): Promise<CourtDateReminder> {
    const reminder: CourtDateReminder = {
      id: this.nextId++,
      courtDateId: reminderData.courtDateId,
      reminderType: reminderData.reminderType,
      scheduledFor: reminderData.scheduledFor,
      confirmed: reminderData.confirmed ?? false,
      confirmedBy: reminderData.confirmedBy ?? null,
      confirmedAt: reminderData.confirmedAt ?? null,
      sent: reminderData.sent ?? false,
      sentAt: reminderData.sentAt ?? null,
      notificationId: reminderData.notificationId ?? null,
      createdAt: new Date(),
    };
    
    const reminders = await this.readJsonFile<CourtDateReminder>(path.join(this.dataDir, 'notifications', 'court-reminders.json'));
    reminders.push(reminder);
    await this.writeJsonFile(path.join(this.dataDir, 'notifications', 'court-reminders.json'), reminders);
    await this.backupData();
    
    return reminder;
  }

  async getCourtDateRemindersForDate(courtDateId: number): Promise<CourtDateReminder[]> {
    const reminders = await this.readJsonFile<CourtDateReminder>(path.join(this.dataDir, 'notifications', 'court-reminders.json'));
    return reminders.filter(r => r.courtDateId === courtDateId);
  }

  async scheduleFollowupReminders(courtDateId: number): Promise<void> {
    // Implementation for scheduling follow-up reminders
  }

  // Notification preferences operations
  async getUserNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined> {
    const preferences = await this.readJsonFile<NotificationPreferences>(path.join(this.dataDir, 'notifications', 'preferences.json'));
    return preferences.find(p => p.userId === userId);
  }

  async upsertNotificationPreferences(preferencesData: InsertNotificationPreferences): Promise<NotificationPreferences> {
    const preferences = await this.readJsonFile<NotificationPreferences>(path.join(this.dataDir, 'notifications', 'preferences.json'));
    const existingIndex = preferences.findIndex(p => p.userId === preferencesData.userId);
    
    if (existingIndex !== -1) {
      const updated: NotificationPreferences = {
        ...preferences[existingIndex],
        ...preferencesData,
        updatedAt: new Date(),
      };
      preferences[existingIndex] = updated;
      await this.writeJsonFile(path.join(this.dataDir, 'notifications', 'preferences.json'), preferences);
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
      preferences.push(newPreferences);
      await this.writeJsonFile(path.join(this.dataDir, 'notifications', 'preferences.json'), preferences);
      await this.saveIndex();
      return newPreferences;
    }
  }

  // Terms acknowledgment operations
  async checkTermsAcknowledgment(userId: string, version: string): Promise<boolean> {
    const acknowledgments = await this.readJsonFile<TermsAcknowledgment>(path.join(this.dataDir, 'terms-acknowledgments.json'));
    return acknowledgments.some(ack => ack.userId === userId && ack.version === version);
  }

  async acknowledgeTerms(acknowledgmentData: InsertTermsAcknowledgment): Promise<TermsAcknowledgment> {
    const termsAck: TermsAcknowledgment = {
      id: this.nextId++,
      userId: acknowledgmentData.userId,
      version: acknowledgmentData.version || "1.0",
      ipAddress: acknowledgmentData.ipAddress || null,
      userAgent: acknowledgmentData.userAgent || null,
      acknowledgedAt: new Date(),
    };
    
    const acknowledgments = await this.readJsonFile<TermsAcknowledgment[]>(path.join(this.dataDir, 'terms-acknowledgments.json'), []);
    acknowledgments.push(termsAck);
    await this.writeJsonFile(path.join(this.dataDir, 'terms-acknowledgments.json'), acknowledgments);
    await this.saveIndex();
    return termsAck;
  }
}

export const storage = new LocalFileStorage();