import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("client"), // client, admin, maintenance
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clients table for bail bond clients
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  clientId: varchar("client_id").unique().notNull(), // Auto-generated client ID
  password: varchar("password").notNull(), // Hashed password for client login
  fullName: varchar("full_name").notNull(),
  phoneNumber: varchar("phone_number"),
  address: text("address"),
  dateOfBirth: date("date_of_birth"),
  emergencyContact: varchar("emergency_contact"),
  emergencyPhone: varchar("emergency_phone"),
  bondAmount: decimal("bond_amount", { precision: 10, scale: 2 }),
  totalOwed: decimal("total_owed", { precision: 10, scale: 2 }),
  downPayment: decimal("down_payment", { precision: 10, scale: 2 }).default("0.00"),
  remainingBalance: decimal("remaining_balance", { precision: 10, scale: 2 }),
  courtDate: timestamp("court_date"),
  courtLocation: text("court_location"),
  charges: text("charges"),
  isActive: boolean("is_active").default(true),
  lastCheckIn: timestamp("last_check_in"),
  missedCheckIns: integer("missed_check_ins").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vehicle information
export const clientVehicles = pgTable("client_vehicles", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  make: varchar("make"),
  model: varchar("model"),
  year: integer("year"),
  color: varchar("color"),
  licensePlate: varchar("license_plate"),
  vin: varchar("vin"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Family members
export const familyMembers = pgTable("family_members", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  name: varchar("name").notNull(),
  relationship: varchar("relationship"),
  phoneNumber: varchar("phone_number"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Employment information
export const employmentInfo = pgTable("employment_info", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  employerName: varchar("employer_name"),
  position: varchar("position"),
  employerPhone: varchar("employer_phone"),
  employerAddress: text("employer_address"),
  startDate: date("start_date"),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Check-ins
export const checkIns = pgTable("check_ins", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  checkInTime: timestamp("check_in_time").defaultNow(),
  location: text("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").defaultNow(),
  paymentMethod: varchar("payment_method"),
  receiptImageUrl: text("receipt_image_url"),
  confirmed: boolean("confirmed").default(false),
  confirmedBy: varchar("confirmed_by"),
  confirmedAt: timestamp("confirmed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  senderId: varchar("sender_id").references(() => users.id),
  senderType: varchar("sender_type").notNull(), // client, admin, system
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Court dates and information
export const courtDates = pgTable("court_dates", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  courtDate: timestamp("court_date").notNull(),
  courtType: varchar("court_type").notNull().default("hearing"), // hearing, trial, arraignment, sentencing, etc.
  courtLocation: text("court_location"),
  caseNumber: varchar("case_number"),
  charges: text("charges"),
  notes: text("notes"),
  completed: boolean("completed").default(false),
  attendanceStatus: varchar("attendance_status").default("pending"), // pending, attended, missed, rescheduled
  createdAt: timestamp("created_at").defaultNow(),
});

// Files and documents
export const clientFiles = pgTable("client_files", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  fileName: varchar("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type"),
  fileSize: integer("file_size"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Expenses
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category"),
  expenseDate: timestamp("expense_date").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Alerts
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  alertType: varchar("alert_type").notNull(), // missed_checkin, court_reminder, payment_due
  severity: varchar("severity").notNull(), // low, medium, high
  message: text("message").notNull(),
  acknowledged: boolean("acknowledged").default(false),
  acknowledgedBy: varchar("acknowledged_by"),
  acknowledgedAt: timestamp("acknowledged_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertCheckInSchema = createInsertSchema(checkIns).omit({
  id: true,
  createdAt: true,
});
export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});
export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});
export const insertCourtDateSchema = createInsertSchema(courtDates).omit({
  id: true,
  createdAt: true,
});
export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
});
export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type CheckIn = typeof checkIns.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertCourtDate = z.infer<typeof insertCourtDateSchema>;
export type CourtDate = typeof courtDates.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;
export type ClientVehicle = typeof clientVehicles.$inferSelect;
export type FamilyMember = typeof familyMembers.$inferSelect;
export type EmploymentInfo = typeof employmentInfo.$inferSelect;
export type ClientFile = typeof clientFiles.$inferSelect;
