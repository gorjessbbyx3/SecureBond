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
}

// In-memory storage for development
class MemoryStorage implements IStorage {
  private users: User[] = [];
  private clients: Client[] = [];
  private checkIns: CheckIn[] = [];
  private payments: Payment[] = [];
  private messages: Message[] = [];
  private courtDates: CourtDate[] = [];
  private expenses: Expense[] = [];
  private alerts: Alert[] = [];
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
}

// Use local file storage for data persistence on bondsman's computer
export const storage = new LocalFileStorage();