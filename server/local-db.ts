import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import {
  type User,
  type UpsertUser,
  type Client,
  type InsertClient,
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
  type ClientVehicle,
  type FamilyMember,
  type EmploymentInfo,
  type ClientFile,
} from "@shared/schema";

export class LocalFileStorage {
  private dataDir: string;
  private nextId = 1;

  constructor() {
    // Store data in user's Documents folder under "SecureBond Data"
    this.dataDir = path.join(os.homedir(), 'Documents', 'SecureBond Data');
    this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Create subdirectories for organized storage
      const subdirs = ['clients', 'payments', 'checkins', 'messages', 'expenses', 'alerts', 'backups'];
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

      console.log(`SecureBond data directory initialized at: ${this.dataDir}`);
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
}