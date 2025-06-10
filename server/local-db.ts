import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
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
  type NotificationPreferences,
  type InsertNotificationPreferences,
  type ClientVehicle,
  type FamilyMember,
  type EmploymentInfo,
  type ClientFile,
} from "@shared/schema";

export class LocalFileStorage {
  private dataDir: string;
  private nextId = 1;

  constructor() {
    // Store data in user's Documents folder under "Aloha Bail Bond Data"
    this.dataDir = path.join(os.homedir(), 'Documents', 'Aloha Bail Bond Data');
    this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Create subdirectories for organized storage
      const subdirs = ['clients', 'payments', 'checkins', 'messages', 'expenses', 'alerts', 'notifications', 'preferences', 'backups'];
      for (const subdir of subdirs) {
        await fs.mkdir(path.join(this.dataDir, subdir), { recursive: true });
      }

      // Initialize index file if it doesn't exist
      const indexPath = path.join(this.dataDir, 'index.json');
      try {
        const indexData = await fs.readFile(indexPath, 'utf-8');
        const index = JSON.parse(indexData);
        this.nextId = index.nextId || 1;
      } catch {
        await this.saveIndex();
      }

      console.log(`Aloha Bail Bond data directory initialized at: ${this.dataDir}`);
    } catch (error) {
      console.error('Failed to initialize local storage:', error);
      throw new Error('Cannot create data directory. Please check permissions.');
    }
  }

  private async saveIndex() {
    const indexPath = path.join(this.dataDir, 'index.json');
    await fs.writeFile(indexPath, JSON.stringify({ 
      nextId: this.nextId,
      lastModified: new Date().toISOString(),
      version: '1.0.0'
    }), 'utf-8');
  }

  private async readJsonFile<T>(filePath: string): Promise<T[]> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async writeJsonFile<T>(filePath: string, data: T[]) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private async backupData() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.dataDir, 'backups', timestamp);
    await fs.mkdir(backupDir, { recursive: true });

    // Copy all data files to backup directory
    const files = await fs.readdir(this.dataDir);
    for (const file of files) {
      if (file.endsWith('.json') && file !== 'index.json') {
        const sourcePath = path.join(this.dataDir, file);
        const backupPath = path.join(backupDir, file);
        await fs.copyFile(sourcePath, backupPath);
      }
    }

    // Keep only last 10 backups
    const backups = await fs.readdir(path.join(this.dataDir, 'backups'));
    if (backups.length > 10) {
      const oldestBackups = backups.sort().slice(0, backups.length - 10);
      for (const backup of oldestBackups) {
        await fs.rmdir(path.join(this.dataDir, 'backups', backup), { recursive: true });
      }
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const users = await this.readJsonFile<User>(path.join(this.dataDir, 'users.json'));
    return users.find(u => u.id === id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const users = await this.readJsonFile<User>(path.join(this.dataDir, 'users.json'));
    const existingIndex = users.findIndex(u => u.id === userData.id);
    
    const user = {
      ...userData,
      updatedAt: new Date(),
      createdAt: userData.createdAt || new Date(),
    } as User;
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    await this.writeJsonFile(path.join(this.dataDir, 'users.json'), users);
    return user;
  }

  // Client operations
  async getClient(id: number): Promise<Client | undefined> {
    const clients = await this.readJsonFile<Client>(path.join(this.dataDir, 'clients.json'));
    return clients.find(c => c.id === id);
  }

  async getClientByClientId(clientId: string): Promise<Client | undefined> {
    const clients = await this.readJsonFile<Client>(path.join(this.dataDir, 'clients.json'));
    return clients.find(c => c.clientId === clientId);
  }

  async getAllClients(): Promise<Client[]> {
    const clients = await this.readJsonFile<Client>(path.join(this.dataDir, 'clients.json'));
    return clients.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createClient(clientData: InsertClient): Promise<Client> {
    const clients = await this.readJsonFile<Client>(path.join(this.dataDir, 'clients.json'));
    
    const client = {
      ...clientData,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Client;
    
    clients.push(client);
    await this.writeJsonFile(path.join(this.dataDir, 'clients.json'), clients);
    await this.saveIndex();
    
    // Trigger backup for important operations
    await this.backupData();
    
    return client;
  }

  async updateClient(id: number, updates: Partial<InsertClient>): Promise<Client> {
    const clients = await this.readJsonFile<Client>(path.join(this.dataDir, 'clients.json'));
    const index = clients.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error("Client not found");
    }
    
    clients[index] = {
      ...clients[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    await this.writeJsonFile(path.join(this.dataDir, 'clients.json'), clients);
    return clients[index];
  }

  async deleteClient(id: number): Promise<void> {
    const clients = await this.readJsonFile<Client>(path.join(this.dataDir, 'clients.json'));
    const filteredClients = clients.filter(c => c.id !== id);
    await this.writeJsonFile(path.join(this.dataDir, 'clients.json'), filteredClients);
  }

  // Bond operations
  async createBond(bondData: InsertBond): Promise<Bond> {
    const bonds = await this.readJsonFile<Bond>(path.join(this.dataDir, 'bonds.json'));
    
    // Generate unique bond number
    const bondNumber = `SB${Date.now().toString().slice(-6)}${this.nextId.toString().padStart(3, '0')}`;
    
    const bond = {
      ...bondData,
      id: this.nextId++,
      bondNumber,
      status: 'active',
      bondType: 'surety',
      premiumRate: '0.10',
      issuedDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Bond;
    
    bonds.push(bond);
    await this.writeJsonFile(path.join(this.dataDir, 'bonds.json'), bonds);
    await this.saveIndex();
    
    return bond;
  }

  async getClientBonds(clientId: number): Promise<Bond[]> {
    const bonds = await this.readJsonFile<Bond>(path.join(this.dataDir, 'bonds.json'));
    return bonds
      .filter(b => b.clientId === clientId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getAllBonds(): Promise<Bond[]> {
    const bonds = await this.readJsonFile<Bond>(path.join(this.dataDir, 'bonds.json'));
    return bonds.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async updateBond(id: number, updates: Partial<InsertBond>): Promise<Bond> {
    const bonds = await this.readJsonFile<Bond>(path.join(this.dataDir, 'bonds.json'));
    const index = bonds.findIndex(b => b.id === id);
    
    if (index === -1) {
      throw new Error("Bond not found");
    }
    
    bonds[index] = {
      ...bonds[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    await this.writeJsonFile(path.join(this.dataDir, 'bonds.json'), bonds);
    return bonds[index];
  }

  async deleteBond(id: number): Promise<void> {
    const bonds = await this.readJsonFile<Bond>(path.join(this.dataDir, 'bonds.json'));
    const filteredBonds = bonds.filter(b => b.id !== id);
    await this.writeJsonFile(path.join(this.dataDir, 'bonds.json'), filteredBonds);
  }

  async getActiveBonds(): Promise<Bond[]> {
    const bonds = await this.readJsonFile<Bond>(path.join(this.dataDir, 'bonds.json'));
    return bonds
      .filter(b => b.status === 'active')
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getClientActiveBondCount(clientId: number): Promise<number> {
    const bonds = await this.readJsonFile<Bond>(path.join(this.dataDir, 'bonds.json'));
    return bonds.filter(b => b.clientId === clientId && b.status === 'active').length;
  }

  // Payment operations
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const payments = await this.readJsonFile<Payment>(path.join(this.dataDir, 'payments.json'));
    
    const payment = {
      ...paymentData,
      id: this.nextId++,
      paymentDate: paymentData.paymentDate || new Date(),
      confirmed: false,
      createdAt: new Date(),
    } as Payment;
    
    payments.push(payment);
    await this.writeJsonFile(path.join(this.dataDir, 'payments.json'), payments);
    await this.saveIndex();
    
    return payment;
  }

  async getAllPayments(): Promise<Payment[]> {
    const payments = await this.readJsonFile<Payment>(path.join(this.dataDir, 'payments.json'));
    return payments.sort((a, b) => new Date(b.paymentDate!).getTime() - new Date(a.paymentDate!).getTime());
  }

  async confirmPayment(id: number, confirmedBy: string): Promise<Payment> {
    const payments = await this.readJsonFile<Payment>(path.join(this.dataDir, 'payments.json'));
    const index = payments.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error("Payment not found");
    }
    
    payments[index] = {
      ...payments[index],
      confirmed: true,
      confirmedBy,
      confirmedAt: new Date(),
    };
    
    await this.writeJsonFile(path.join(this.dataDir, 'payments.json'), payments);
    return payments[index];
  }

  // Check-in operations
  async createCheckIn(checkInData: InsertCheckIn): Promise<CheckIn> {
    const checkIns = await this.readJsonFile<CheckIn>(path.join(this.dataDir, 'checkins.json'));
    
    const checkIn = {
      ...checkInData,
      id: this.nextId++,
      checkInTime: checkInData.checkInTime || new Date(),
      createdAt: new Date(),
    } as CheckIn;
    
    checkIns.push(checkIn);
    await this.writeJsonFile(path.join(this.dataDir, 'checkins.json'), checkIns);
    await this.saveIndex();
    
    // Update client's last check-in time
    if (checkInData.clientId) {
      const clients = await this.readJsonFile<Client>(path.join(this.dataDir, 'clients.json'));
      const clientIndex = clients.findIndex(c => c.id === checkInData.clientId);
      if (clientIndex >= 0) {
        clients[clientIndex] = {
          ...clients[clientIndex],
          lastCheckIn: new Date(),
          missedCheckIns: 0,
          updatedAt: new Date(),
        };
        await this.writeJsonFile(path.join(this.dataDir, 'clients.json'), clients);
      }
    }
    
    return checkIn;
  }

  async getClientCheckIns(clientId: number): Promise<CheckIn[]> {
    const checkIns = await this.readJsonFile<CheckIn>(path.join(this.dataDir, 'checkins.json'));
    return checkIns
      .filter(c => c.clientId === clientId)
      .sort((a, b) => new Date(b.checkInTime!).getTime() - new Date(a.checkInTime!).getTime());
  }

  // Expense operations
  async createExpense(expenseData: InsertExpense): Promise<Expense> {
    const expenses = await this.readJsonFile<Expense>(path.join(this.dataDir, 'expenses.json'));
    
    const expense = {
      ...expenseData,
      id: this.nextId++,
      expenseDate: expenseData.expenseDate || new Date(),
      createdAt: new Date(),
    } as Expense;
    
    expenses.push(expense);
    await this.writeJsonFile(path.join(this.dataDir, 'expenses.json'), expenses);
    await this.saveIndex();
    
    return expense;
  }

  async getAllExpenses(): Promise<Expense[]> {
    const expenses = await this.readJsonFile<Expense>(path.join(this.dataDir, 'expenses.json'));
    return expenses.sort((a, b) => new Date(b.expenseDate!).getTime() - new Date(a.expenseDate!).getTime());
  }

  // Alert operations
  async createAlert(alertData: InsertAlert): Promise<Alert> {
    const alerts = await this.readJsonFile<Alert>(path.join(this.dataDir, 'alerts.json'));
    
    const alert = {
      ...alertData,
      id: this.nextId++,
      acknowledged: false,
      createdAt: new Date(),
    } as Alert;
    
    alerts.push(alert);
    await this.writeJsonFile(path.join(this.dataDir, 'alerts.json'), alerts);
    await this.saveIndex();
    
    return alert;
  }

  async getAllUnacknowledgedAlerts(): Promise<Alert[]> {
    const alerts = await this.readJsonFile<Alert>(path.join(this.dataDir, 'alerts.json'));
    return alerts
      .filter(a => !a.acknowledged)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async acknowledgeAlert(id: number, acknowledgedBy: string): Promise<Alert> {
    const alerts = await this.readJsonFile<Alert>(path.join(this.dataDir, 'alerts.json'));
    const index = alerts.findIndex(a => a.id === id);
    
    if (index === -1) {
      throw new Error("Alert not found");
    }
    
    alerts[index] = {
      ...alerts[index],
      acknowledged: true,
      acknowledgedBy,
      acknowledgedAt: new Date(),
    };
    
    await this.writeJsonFile(path.join(this.dataDir, 'alerts.json'), alerts);
    return alerts[index];
  }

  // Court date operations
  async getAllUpcomingCourtDates(): Promise<CourtDate[]> {
    const courtDates = await this.readJsonFile<CourtDate>(path.join(this.dataDir, 'courtdates.json'));
    const now = new Date();
    return courtDates
      .filter(c => new Date(c.courtDate) >= now && !c.completed)
      .sort((a, b) => new Date(a.courtDate).getTime() - new Date(b.courtDate).getTime());
  }

  // Additional operations with minimal implementations for interface compliance
  async getClientPayments(clientId: number): Promise<Payment[]> {
    const payments = await this.getAllPayments();
    return payments.filter(p => p.clientId === clientId);
  }

  async getLastCheckIn(clientId: number): Promise<CheckIn | undefined> {
    const checkIns = await this.getClientCheckIns(clientId);
    return checkIns[0];
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const messages = await this.readJsonFile<Message>(path.join(this.dataDir, 'messages.json'));
    const message = { ...messageData, id: this.nextId++, isRead: false, createdAt: new Date() } as Message;
    messages.push(message);
    await this.writeJsonFile(path.join(this.dataDir, 'messages.json'), messages);
    await this.saveIndex();
    return message;
  }

  async getClientMessages(clientId: number): Promise<Message[]> {
    const messages = await this.readJsonFile<Message>(path.join(this.dataDir, 'messages.json'));
    return messages.filter(m => m.clientId === clientId);
  }

  async markMessageAsRead(id: number): Promise<void> {
    const messages = await this.readJsonFile<Message>(path.join(this.dataDir, 'messages.json'));
    const index = messages.findIndex(m => m.id === id);
    if (index >= 0) {
      messages[index].isRead = true;
      await this.writeJsonFile(path.join(this.dataDir, 'messages.json'), messages);
    }
  }

  async createCourtDate(courtDateData: InsertCourtDate): Promise<CourtDate> {
    const courtDates = await this.readJsonFile<CourtDate>(path.join(this.dataDir, 'courtdates.json'));
    const courtDate = { ...courtDateData, id: this.nextId++, completed: false, createdAt: new Date() } as CourtDate;
    courtDates.push(courtDate);
    await this.writeJsonFile(path.join(this.dataDir, 'courtdates.json'), courtDates);
    await this.saveIndex();
    return courtDate;
  }

  async getClientCourtDates(clientId: number): Promise<CourtDate[]> {
    const courtDates = await this.readJsonFile<CourtDate>(path.join(this.dataDir, 'courtdates.json'));
    return courtDates.filter(c => c.clientId === clientId);
  }

  async updateCourtDate(id: number, updates: Partial<InsertCourtDate>): Promise<CourtDate> {
    const courtDates = await this.readJsonFile<CourtDate>(path.join(this.dataDir, 'courtdates.json'));
    const index = courtDates.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Court date not found");
    courtDates[index] = { ...courtDates[index], ...updates };
    await this.writeJsonFile(path.join(this.dataDir, 'courtdates.json'), courtDates);
    return courtDates[index];
  }

  async getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    const expenses = await this.getAllExpenses();
    return expenses.filter(e => {
      const expenseDate = new Date(e.expenseDate!);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  }

  async updateExpense(id: number, updates: Partial<InsertExpense>): Promise<Expense> {
    const expenses = await this.readJsonFile<Expense>(path.join(this.dataDir, 'expenses.json'));
    const index = expenses.findIndex(e => e.id === id);
    if (index === -1) throw new Error("Expense not found");
    expenses[index] = { ...expenses[index], ...updates };
    await this.writeJsonFile(path.join(this.dataDir, 'expenses.json'), expenses);
    return expenses[index];
  }

  async deleteExpense(id: number): Promise<void> {
    const expenses = await this.readJsonFile<Expense>(path.join(this.dataDir, 'expenses.json'));
    const filteredExpenses = expenses.filter(e => e.id !== id);
    await this.writeJsonFile(path.join(this.dataDir, 'expenses.json'), filteredExpenses);
  }

  async getClientAlerts(clientId: number): Promise<Alert[]> {
    const alerts = await this.readJsonFile<Alert>(path.join(this.dataDir, 'alerts.json'));
    return alerts.filter(a => a.clientId === clientId);
  }

  async getClientVehicles(clientId: number): Promise<ClientVehicle[]> {
    const vehicles = await this.readJsonFile<ClientVehicle>(path.join(this.dataDir, 'vehicles.json'));
    return vehicles.filter(v => v.clientId === clientId);
  }

  async getClientFamily(clientId: number): Promise<FamilyMember[]> {
    const family = await this.readJsonFile<FamilyMember>(path.join(this.dataDir, 'family.json'));
    return family.filter(f => f.clientId === clientId);
  }

  async getClientEmployment(clientId: number): Promise<EmploymentInfo[]> {
    const employment = await this.readJsonFile<EmploymentInfo>(path.join(this.dataDir, 'employment.json'));
    return employment.filter(e => e.clientId === clientId);
  }

  async getClientFiles(clientId: number): Promise<ClientFile[]> {
    const files = await this.readJsonFile<ClientFile>(path.join(this.dataDir, 'files.json'));
    return files.filter(f => f.clientId === clientId);
  }

  // Data management utilities
  async exportData(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportDir = path.join(this.dataDir, 'exports', timestamp);
    await fs.mkdir(exportDir, { recursive: true });

    const files = await fs.readdir(this.dataDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const sourcePath = path.join(this.dataDir, file);
        const exportPath = path.join(exportDir, file);
        await fs.copyFile(sourcePath, exportPath);
      }
    }

    return exportDir;
  }

  getDataDirectory(): string {
    return this.dataDir;
  }

  // Court date reminder operations
  async getAllCourtDates(): Promise<CourtDate[]> {
    const courtDates = await this.readJsonFile<CourtDate>('court-dates.json');
    return courtDates;
  }

  async getCourtDateReminders(): Promise<any[]> {
    const courtDates = await this.getAllCourtDates();
    const now = new Date();
    const reminders = [];

    for (const courtDate of courtDates) {
      // Only process active court dates (completed = false)
      if (courtDate.completed) continue;

      const courtDateObj = new Date(courtDate.courtDate);
      const timeDiff = courtDateObj.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // Default reminder days to 3 if not specified
      const reminderDays = 3;
      if (daysDiff <= reminderDays && daysDiff >= 0) {
        let priority = 'low';
        if (daysDiff === 0) priority = 'critical';
        else if (daysDiff === 1) priority = 'high';
        else if (daysDiff <= 3) priority = 'medium';

        const type = daysDiff === 0 ? 'today' : daysDiff < 0 ? 'overdue' : 'upcoming';

        // Get client name from clients array using await
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
    // For file-based storage, we'll just return success
    // In a real implementation, you'd store acknowledgment state
    return { id: reminderId, acknowledged: true, acknowledgedAt: new Date() };
  }

  // Arrest monitoring operations
  async getArrestRecords(): Promise<any[]> {
    // Generate sample arrest records for demonstration
    const clients = await this.getAllClients();
    const hawaiiCounties = ['honolulu', 'hawaii', 'maui', 'kauai'];
    const charges = [
      'DUI', 'Public Intoxication', 'Disorderly Conduct', 'Theft', 
      'Assault', 'Drug Possession', 'Trespassing', 'Violation of Bond Terms'
    ];

    const arrestRecords = [];
    
    // Create some sample arrest records
    for (let i = 0; i < 5; i++) {
      const client = clients[Math.floor(Math.random() * clients.length)];
      const county = hawaiiCounties[Math.floor(Math.random() * hawaiiCounties.length)];
      const arrestDate = new Date();
      arrestDate.setDate(arrestDate.getDate() - Math.floor(Math.random() * 30));
      
      const selectedCharges = charges.slice(0, Math.floor(Math.random() * 3) + 1);
      const bondViolation = selectedCharges.includes('Violation of Bond Terms');
      
      let severity = 'low';
      if (bondViolation) severity = 'critical';
      else if (selectedCharges.includes('Assault') || selectedCharges.includes('DUI')) severity = 'high';
      else if (selectedCharges.length > 1) severity = 'medium';

      arrestRecords.push({
        id: `arrest-${client.id}-${i}-${Date.now()}`,
        clientId: client.id,
        clientName: client.fullName,
        arrestDate: arrestDate.toISOString().split('T')[0],
        arrestTime: `${Math.floor(Math.random() * 12) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
        arrestLocation: `${Math.floor(Math.random() * 9999) + 1000} ${['Ala Moana Blvd', 'King St', 'Beretania St', 'Kapiolani Blvd'][Math.floor(Math.random() * 4)]}, ${county.charAt(0).toUpperCase() + county.slice(1)}, HI`,
        charges: selectedCharges,
        arrestingAgency: `${county.charAt(0).toUpperCase() + county.slice(1)} Police Department`,
        county: county,
        bookingNumber: `${county.toUpperCase()}-${Date.now().toString().slice(-6)}`,
        status: Math.random() > 0.7 ? 'processed' : 'pending',
        isActive: client.isActive === true,
        bondViolation,
        severity,
        createdAt: arrestDate.toISOString()
      });
    }

    return arrestRecords;
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
      lastChecked: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      checkInterval: 30, // minutes
      apiEndpoint: `https://api.${county.id}pd.gov/arrest-logs`,
      status: Math.random() > 0.2 ? 'active' : 'error'
    }));
  }

  async scanArrestLogs(): Promise<any> {
    // Simulate scanning arrest logs
    await this.delay(2000); // Simulate API call delay
    
    const newRecords = Math.floor(Math.random() * 3);
    return {
      success: true,
      newRecords,
      lastScanned: new Date().toISOString(),
      sourcesChecked: ['Honolulu PD', 'Hawaii County PD', 'Maui PD', 'Kauai PD']
    };
  }

  async acknowledgeArrestRecord(recordId: string): Promise<any> {
    // In a real implementation, you'd update the record status
    return {
      id: recordId,
      status: 'processed',
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: 'admin'
    };
  }

  async getPublicArrestLogs(): Promise<any[]> {
    // Generate sample public arrest logs prioritizing Honolulu County
    const hawaiiCounties = ['honolulu', 'hawaii', 'maui', 'kauai'];
    const commonNames = [
      'John Smith', 'Michael Johnson', 'David Williams', 'Christopher Brown', 'Matthew Jones',
      'Anthony Garcia', 'Mark Miller', 'Donald Davis', 'Steven Rodriguez', 'Paul Martinez',
      'Joshua Anderson', 'Kenneth Taylor', 'Kevin Thomas', 'Brian Jackson', 'George White',
      'Edward Harris', 'Ronald Clark', 'Timothy Lewis', 'Jason Lee', 'Jeffrey Walker',
      'Ryan Hall', 'Jacob Allen', 'Gary Young', 'Nicholas King', 'Eric Wright',
      'Mary Johnson', 'Patricia Williams', 'Jennifer Brown', 'Linda Davis', 'Elizabeth Miller',
      'Barbara Wilson', 'Susan Moore', 'Jessica Taylor', 'Sarah Anderson', 'Karen Thomas'
    ];
    
    const charges = [
      'DUI', 'Public Intoxication', 'Disorderly Conduct', 'Theft', 'Shoplifting',
      'Assault', 'Drug Possession', 'Trespassing', 'Domestic Violence', 'Burglary',
      'Traffic Violations', 'Probation Violation', 'Warrant', 'Disturbing the Peace'
    ];

    const locations = {
      honolulu: [
        'Waikiki Beach', 'Downtown Honolulu', 'Kalihi', 'Pearl City', 'Kaneohe',
        'Ala Moana Center', 'Chinatown', 'Sand Island', 'Keeaumoku St', 'Hotel St'
      ],
      hawaii: [
        'Hilo', 'Kona', 'Pahoa', 'Captain Cook', 'Waimea',
        'Volcano', 'Pepeekeo', 'Laupahoehoe', 'Honokaa', 'Naalehu'
      ],
      maui: [
        'Kahului', 'Lahaina', 'Kihei', 'Paia', 'Makawao',
        'Wailuku', 'Haiku', 'Hana', 'Wailea', 'Kaanapali'
      ],
      kauai: [
        'Lihue', 'Kapaa', 'Princeville', 'Waimea', 'Hanapepe',
        'Koloa', 'Kilauea', 'Anahola', 'Eleele', 'Kalaheo'
      ]
    };

    const publicLogs = [];
    
    // Generate more records for Honolulu (prioritized for new client opportunities)
    for (let i = 0; i < 25; i++) {
      const county = i < 15 ? 'honolulu' : hawaiiCounties[Math.floor(Math.random() * hawaiiCounties.length)];
      const name = commonNames[Math.floor(Math.random() * commonNames.length)];
      const arrestDate = new Date();
      arrestDate.setDate(arrestDate.getDate() - Math.floor(Math.random() * 7)); // Last 7 days
      
      const selectedCharges = charges.slice(0, Math.floor(Math.random() * 3) + 1);
      const age = Math.floor(Math.random() * 40) + 18; // 18-58 years old
      
      publicLogs.push({
        id: `public-${county}-${i}-${Date.now()}`,
        name,
        county,
        arrestDate: arrestDate.toISOString().split('T')[0],
        arrestTime: `${Math.floor(Math.random() * 12) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
        location: locations[county as keyof typeof locations][Math.floor(Math.random() * locations[county as keyof typeof locations].length)],
        charges: selectedCharges,
        bookingNumber: `${county.toUpperCase()}-${Date.now().toString().slice(-6)}-${i}`,
        age,
        agency: `${county.charAt(0).toUpperCase() + county.slice(1)} Police Department`,
        status: 'in_custody',
        bondEligible: Math.random() > 0.3,
        estimatedBond: Math.floor(Math.random() * 50000) + 1000,
        createdAt: arrestDate.toISOString()
      });
    }

    // Sort by county priority (Honolulu first) and then by date
    return publicLogs.sort((a, b) => {
      if (a.county === 'honolulu' && b.county !== 'honolulu') return -1;
      if (a.county !== 'honolulu' && b.county === 'honolulu') return 1;
      return new Date(b.arrestDate).getTime() - new Date(a.arrestDate).getTime();
    });
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
      ...reminderData,
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
    const courtDates = await this.readJsonFile<CourtDate>(path.join(this.dataDir, 'court-dates', 'court-dates.json'));
    const courtDate = courtDates.find(cd => cd.id === courtDateId);
    
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
        sentAt: null,
        confirmed: false,
        confirmedBy: null,
        confirmedAt: null,
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
        sentAt: null,
        confirmed: false,
        confirmedBy: null,
        confirmedAt: null,
        notificationId: null,
      });
    }
  }

  // Notification preferences operations
  async getUserNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined> {
    const preferences = await this.readJsonFile<NotificationPreferences>(path.join(this.dataDir, 'preferences', 'preferences.json'));
    return preferences.find(p => p.userId === userId);
  }

  async upsertNotificationPreferences(preferencesData: InsertNotificationPreferences): Promise<NotificationPreferences> {
    const preferences = await this.readJsonFile<NotificationPreferences>(path.join(this.dataDir, 'preferences', 'preferences.json'));
    const existingIndex = preferences.findIndex(p => p.userId === preferencesData.userId);
    
    if (existingIndex >= 0) {
      // Update existing preferences
      const updated: NotificationPreferences = {
        ...preferences[existingIndex],
        ...preferencesData,
        updatedAt: new Date(),
      };
      preferences[existingIndex] = updated;
      await this.writeJsonFile(path.join(this.dataDir, 'preferences', 'preferences.json'), preferences);
      return updated;
    } else {
      // Create new preferences
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
      await this.writeJsonFile(path.join(this.dataDir, 'preferences', 'preferences.json'), preferences);
      await this.saveIndex();
      return newPreferences;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}