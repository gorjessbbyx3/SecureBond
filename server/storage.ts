import {
  users,
  clients,
  checkIns,
  payments,
  messages,
  courtDates,
  expenses,
  alerts,
  clientVehicles,
  familyMembers,
  employmentInfo,
  clientFiles,
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
// import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

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

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingIndex = this.users.findIndex(u => u.id === userData.id);
    const user = {
      ...userData,
      updatedAt: new Date(),
      createdAt: new Date(),
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
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClientByClientId(clientId: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.clientId, clientId));
    return client;
  }

  async getAllClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async createClient(clientData: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(clientData).returning();
    return client;
  }

  async updateClient(id: number, updates: Partial<InsertClient>): Promise<Client> {
    const [client] = await db
      .update(clients)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return client;
  }

  async deleteClient(id: number): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  // Check-in operations
  async createCheckIn(checkInData: InsertCheckIn): Promise<CheckIn> {
    const [checkIn] = await db.insert(checkIns).values(checkInData).returning();
    
    // Update client's last check-in time
    if (checkInData.clientId) {
      await db
        .update(clients)
        .set({ 
          lastCheckIn: new Date(),
          missedCheckIns: 0, // Reset missed check-ins on successful check-in
          updatedAt: new Date() 
        })
        .where(eq(clients.id, checkInData.clientId));
    }
    
    return checkIn;
  }

  async getClientCheckIns(clientId: number): Promise<CheckIn[]> {
    return await db
      .select()
      .from(checkIns)
      .where(eq(checkIns.clientId, clientId))
      .orderBy(desc(checkIns.checkInTime));
  }

  async getLastCheckIn(clientId: number): Promise<CheckIn | undefined> {
    const [checkIn] = await db
      .select()
      .from(checkIns)
      .where(eq(checkIns.clientId, clientId))
      .orderBy(desc(checkIns.checkInTime))
      .limit(1);
    return checkIn;
  }

  // Payment operations
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(paymentData).returning();
    return payment;
  }

  async getClientPayments(clientId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.clientId, clientId))
      .orderBy(desc(payments.paymentDate));
  }

  async getAllPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.paymentDate));
  }

  async confirmPayment(id: number, confirmedBy: string): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set({ 
        confirmed: true, 
        confirmedBy, 
        confirmedAt: new Date() 
      })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(messageData).returning();
    return message;
  }

  async getClientMessages(clientId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.clientId, clientId))
      .orderBy(desc(messages.createdAt));
  }

  async markMessageAsRead(id: number): Promise<void> {
    await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
  }

  // Court date operations
  async createCourtDate(courtDateData: InsertCourtDate): Promise<CourtDate> {
    const [courtDate] = await db.insert(courtDates).values(courtDateData).returning();
    return courtDate;
  }

  async getClientCourtDates(clientId: number): Promise<CourtDate[]> {
    return await db
      .select()
      .from(courtDates)
      .where(eq(courtDates.clientId, clientId))
      .orderBy(desc(courtDates.courtDate));
  }

  async getAllUpcomingCourtDates(): Promise<CourtDate[]> {
    const now = new Date();
    return await db
      .select()
      .from(courtDates)
      .where(and(gte(courtDates.courtDate, now), eq(courtDates.completed, false)))
      .orderBy(courtDates.courtDate);
  }

  async updateCourtDate(id: number, updates: Partial<InsertCourtDate>): Promise<CourtDate> {
    const [courtDate] = await db
      .update(courtDates)
      .set(updates)
      .where(eq(courtDates.id, id))
      .returning();
    return courtDate;
  }

  // Expense operations
  async createExpense(expenseData: InsertExpense): Promise<Expense> {
    const [expense] = await db.insert(expenses).values(expenseData).returning();
    return expense;
  }

  async getAllExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses).orderBy(desc(expenses.expenseDate));
  }

  async getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    return await db
      .select()
      .from(expenses)
      .where(and(gte(expenses.expenseDate, startDate), lte(expenses.expenseDate, endDate)))
      .orderBy(desc(expenses.expenseDate));
  }

  async updateExpense(id: number, updates: Partial<InsertExpense>): Promise<Expense> {
    const [expense] = await db
      .update(expenses)
      .set(updates)
      .where(eq(expenses.id, id))
      .returning();
    return expense;
  }

  async deleteExpense(id: number): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  // Alert operations
  async createAlert(alertData: InsertAlert): Promise<Alert> {
    const [alert] = await db.insert(alerts).values(alertData).returning();
    return alert;
  }

  async getClientAlerts(clientId: number): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .where(eq(alerts.clientId, clientId))
      .orderBy(desc(alerts.createdAt));
  }

  async getAllUnacknowledgedAlerts(): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .where(eq(alerts.acknowledged, false))
      .orderBy(desc(alerts.createdAt));
  }

  async acknowledgeAlert(id: number, acknowledgedBy: string): Promise<Alert> {
    const [alert] = await db
      .update(alerts)
      .set({ 
        acknowledged: true, 
        acknowledgedBy, 
        acknowledgedAt: new Date() 
      })
      .where(eq(alerts.id, id))
      .returning();
    return alert;
  }

  // Additional client info operations
  async getClientVehicles(clientId: number): Promise<ClientVehicle[]> {
    return await db.select().from(clientVehicles).where(eq(clientVehicles.clientId, clientId));
  }

  async getClientFamily(clientId: number): Promise<FamilyMember[]> {
    return await db.select().from(familyMembers).where(eq(familyMembers.clientId, clientId));
  }

  async getClientEmployment(clientId: number): Promise<EmploymentInfo[]> {
    return await db.select().from(employmentInfo).where(eq(employmentInfo.clientId, clientId));
  }

  async getClientFiles(clientId: number): Promise<ClientFile[]> {
    return await db.select().from(clientFiles).where(eq(clientFiles.clientId, clientId));
  }
}

export const storage = new DatabaseStorage();
