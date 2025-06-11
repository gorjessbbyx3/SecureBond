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
  bigint,
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
  // Remove individual bond fields - these will be in bonds table
  isActive: boolean("is_active").default(true),
  lastCheckIn: timestamp("last_check_in"),
  missedCheckIns: integer("missed_check_ins").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bond contracts table - supports multiple bonds per client
export const bonds = pgTable("bonds", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  bondNumber: varchar("bond_number").unique(), // Auto-generated bond contract number
  bondAmount: decimal("bond_amount", { precision: 10, scale: 2 }).notNull(),
  totalOwed: decimal("total_owed", { precision: 10, scale: 2 }).notNull(),
  downPayment: decimal("down_payment", { precision: 10, scale: 2 }).default("0.00"),
  remainingBalance: decimal("remaining_balance", { precision: 10, scale: 2 }).notNull(),
  courtDate: timestamp("court_date"),
  courtLocation: text("court_location"),
  charges: text("charges"),
  caseNumber: varchar("case_number"),
  status: varchar("status").notNull().default("active"), // active, completed, forfeited, cancelled, in_forfeiture, surrendered
  bondType: varchar("bond_type").default("surety"), // surety, cash, property, federal
  premiumRate: decimal("premium_rate", { precision: 5, scale: 4 }).default("0.10"), // 10% default
  collateral: text("collateral"), // Description of collateral if any
  cosigner: varchar("cosigner"),
  cosignerPhone: varchar("cosigner_phone"),
  issuedDate: timestamp("issued_date").defaultNow(),
  expirationDate: timestamp("expiration_date"),
  completedDate: timestamp("completed_date"),
  forfeitedDate: timestamp("forfeited_date"),
  forfeitureReason: text("forfeiture_reason"),
  forfeitureAmount: decimal("forfeiture_amount", { precision: 10, scale: 2 }),
  recoveryEfforts: text("recovery_efforts"),
  surrenderDate: timestamp("surrender_date"),
  surrenderLocation: text("surrender_location"),
  notes: text("notes"),
  riskAssessment: varchar("risk_assessment").default("medium"), // low, medium, high, critical
  lastContactDate: timestamp("last_contact_date"),
  nextFollowupDate: timestamp("next_followup_date"),
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
  // Admin approval system
  adminApproved: boolean("admin_approved").default(false),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  // Client acknowledgment system
  clientAcknowledged: boolean("client_acknowledged").default(false),
  acknowledgedAt: timestamp("acknowledged_at"),
  source: varchar("source").default("manual"), // manual, scraped, imported
  sourceVerified: boolean("source_verified").default(false),
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

// Real-time notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // court_reminder, payment_due, arrest_alert, check_in_missed, bond_expiring, system_alert
  priority: varchar("priority").notNull().default("medium"), // low, medium, high, urgent
  read: boolean("read").notNull().default(false),
  confirmed: boolean("confirmed").notNull().default(false),
  confirmedAt: timestamp("confirmed_at"),
  confirmedBy: varchar("confirmed_by"),
  actionUrl: varchar("action_url"), // URL to navigate when clicked
  metadata: jsonb("metadata"), // Additional data for the notification
  expiresAt: timestamp("expires_at"), // Optional expiration for temporary notifications
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Court date reminder tracking table
export const courtDateReminders = pgTable("court_date_reminders", {
  id: serial("id").primaryKey(),
  courtDateId: integer("court_date_id").references(() => courtDates.id).notNull(),
  reminderType: varchar("reminder_type").notNull(), // initial, followup_1, followup_2, final
  scheduledFor: timestamp("scheduled_for").notNull(),
  sent: boolean("sent").notNull().default(false),
  sentAt: timestamp("sent_at"),
  confirmed: boolean("confirmed").notNull().default(false),
  confirmedAt: timestamp("confirmed_at"),
  confirmedBy: varchar("confirmed_by"),
  notificationId: integer("notification_id").references(() => notifications.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User notification preferences table
export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  // Email preferences
  emailEnabled: boolean("email_enabled").notNull().default(true),
  courtRemindersEmail: boolean("court_reminders_email").notNull().default(true),
  paymentDueEmail: boolean("payment_due_email").notNull().default(true),
  arrestAlertsEmail: boolean("arrest_alerts_email").notNull().default(true),
  bondExpiringEmail: boolean("bond_expiring_email").notNull().default(true),
  // In-app preferences
  inAppEnabled: boolean("in_app_enabled").notNull().default(true),
  courtRemindersInApp: boolean("court_reminders_in_app").notNull().default(true),
  paymentDueInApp: boolean("payment_due_in_app").notNull().default(true),
  arrestAlertsInApp: boolean("arrest_alerts_in_app").notNull().default(true),
  bondExpiringInApp: boolean("bond_expiring_in_app").notNull().default(true),
  // Timing preferences
  courtReminderDays: integer("court_reminder_days").notNull().default(3), // Days before court date
  paymentReminderDays: integer("payment_reminder_days").notNull().default(7), // Days before payment due
  bondExpiringDays: integer("bond_expiring_days").notNull().default(30), // Days before bond expires
  // Sound and visual preferences
  soundEnabled: boolean("sound_enabled").notNull().default(true),
  desktopNotifications: boolean("desktop_notifications").notNull().default(false),
  quietHoursEnabled: boolean("quiet_hours_enabled").notNull().default(false),
  quietHoursStart: varchar("quiet_hours_start").notNull().default("22:00"), // 10 PM
  quietHoursEnd: varchar("quiet_hours_end").notNull().default("08:00"), // 8 AM
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  password: true,
  userId: true,
  lastCheckIn: true,
  createdAt: true,
  updatedAt: true,
});
export const insertBondSchema = createInsertSchema(bonds).omit({
  id: true,
  bondNumber: true,
  status: true,
  bondType: true,
  premiumRate: true,
  issuedDate: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  courtDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  expirationDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  completedDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});
export const insertCheckInSchema = createInsertSchema(checkIns).omit({
  id: true,
  createdAt: true,
}).extend({
  checkInTime: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});
export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
}).extend({
  paymentDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});
export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
}).extend({
  senderType: z.string().default("admin"),
});
export const insertCourtDateSchema = createInsertSchema(courtDates).omit({
  id: true,
  createdAt: true,
  approvedAt: true,
  acknowledgedAt: true,
}).extend({
  courtDate: z.string().transform((val) => new Date(val)),
});
export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
}).extend({
  expenseDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});
export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});
export const insertCourtDateReminderSchema = createInsertSchema(courtDateReminders).omit({
  id: true,
  createdAt: true,
});
export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});



// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Terms of Service acknowledgment tracking
export const termsAcknowledgments = pgTable("terms_acknowledgments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  version: varchar("version").notNull().default("2025-06-01"),
  acknowledgedAt: timestamp("acknowledged_at").defaultNow(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
});

export type TermsAcknowledgment = typeof termsAcknowledgments.$inferSelect;
export type InsertTermsAcknowledgment = typeof termsAcknowledgments.$inferInsert;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertBond = z.infer<typeof insertBondSchema>;
export type Bond = typeof bonds.$inferSelect;
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
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertCourtDateReminder = z.infer<typeof insertCourtDateReminderSchema>;
export type CourtDateReminder = typeof courtDateReminders.$inferSelect;
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type ClientVehicle = typeof clientVehicles.$inferSelect;
export type FamilyMember = typeof familyMembers.$inferSelect;
export type EmploymentInfo = typeof employmentInfo.$inferSelect;
export type ClientFile = typeof clientFiles.$inferSelect;

// Payment plans table for structured payment schedules
export const paymentPlans = pgTable("payment_plans", {
  id: serial("id").primaryKey(),
  bondId: integer("bond_id").references(() => bonds.id).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  downPayment: decimal("down_payment", { precision: 10, scale: 2 }).notNull(),
  remainingBalance: decimal("remaining_balance", { precision: 10, scale: 2 }).notNull(),
  installmentAmount: decimal("installment_amount", { precision: 10, scale: 2 }).notNull(),
  frequency: varchar("frequency").notNull().default("monthly"), // weekly, biweekly, monthly, custom
  numberOfPayments: integer("number_of_payments").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: varchar("status").notNull().default("active"), // active, completed, defaulted, cancelled
  autoPayEnabled: boolean("auto_pay_enabled").default(false),
  lateFeesEnabled: boolean("late_fees_enabled").default(true),
  lateFeeAmount: decimal("late_fee_amount", { precision: 5, scale: 2 }).default("25.00"),
  gracePeriodDays: integer("grace_period_days").default(5),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scheduled payment installments
export const paymentInstallments = pgTable("payment_installments", {
  id: serial("id").primaryKey(),
  paymentPlanId: integer("payment_plan_id").references(() => paymentPlans.id).notNull(),
  installmentNumber: integer("installment_number").notNull(),
  dueDate: date("due_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("pending"), // pending, paid, late, defaulted
  paidDate: timestamp("paid_date"),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }),
  lateFees: decimal("late_fees", { precision: 5, scale: 2 }).default("0.00"),
  remindersSent: integer("reminders_sent").default(0),
  lastReminderDate: timestamp("last_reminder_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Collections activities and attempts
export const collectionsActivities = pgTable("collections_activities", {
  id: serial("id").primaryKey(),
  bondId: integer("bond_id").references(() => bonds.id).notNull(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  activityType: varchar("activity_type").notNull(), // call, email, letter, visit, legal_action
  contactMethod: varchar("contact_method"), // phone, email, certified_mail, in_person
  contactAttemptedAt: timestamp("contact_attempted_at").notNull(),
  contactSuccessful: boolean("contact_successful").default(false),
  personContacted: varchar("person_contacted"),
  responseReceived: text("response_received"),
  promiseDate: date("promise_date"),
  promiseAmount: decimal("promise_amount", { precision: 10, scale: 2 }),
  nextActionDate: date("next_action_date"),
  nextActionType: varchar("next_action_type"),
  agentId: varchar("agent_id").references(() => users.id).notNull(),
  priority: varchar("priority").default("medium"), // low, medium, high, urgent
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Forfeiture tracking and management
export const forfeitures = pgTable("forfeitures", {
  id: serial("id").primaryKey(),
  bondId: integer("bond_id").references(() => bonds.id).notNull(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  initiatedDate: timestamp("initiated_date").notNull(),
  reason: text("reason").notNull(),
  forfeitureAmount: decimal("forfeiture_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("pending"), // pending, active, resolved, cancelled
  courtOrderDate: date("court_order_date"),
  judgmentAmount: decimal("judgment_amount", { precision: 10, scale: 2 }),
  collectionEfforts: text("collection_efforts"),
  recoveredAmount: decimal("recovered_amount", { precision: 10, scale: 2 }).default("0.00"),
  writeOffAmount: decimal("write_off_amount", { precision: 10, scale: 2 }).default("0.00"),
  writeOffDate: date("write_off_date"),
  writeOffReason: text("write_off_reason"),
  assignedAgent: varchar("assigned_agent").references(() => users.id),
  nextReviewDate: date("next_review_date"),
  priority: varchar("priority").default("medium"), // low, medium, high, critical
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User roles and permissions system
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  permissions: jsonb("permissions").notNull(), // JSON array of permission strings
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User role assignments
export const userRoleAssignments = pgTable("user_role_assignments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  roleId: integer("role_id").references(() => userRoles.id).notNull(),
  assignedBy: varchar("assigned_by").references(() => users.id).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
});

// Data backup tracking
export const dataBackups = pgTable("data_backups", {
  id: serial("id").primaryKey(),
  backupType: varchar("backup_type").notNull(), // full, incremental, differential
  backupLocation: varchar("backup_location").notNull(),
  backupSize: bigint("backup_size", { mode: "number" }),
  status: varchar("status").notNull().default("pending"), // pending, in_progress, completed, failed
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  checksum: varchar("checksum"),
  retentionDays: integer("retention_days").default(90),
  isEncrypted: boolean("is_encrypted").default(true),
  createdBy: varchar("created_by").references(() => users.id),
});

// Security audit log
export const securityAuditLog = pgTable("security_audit_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action").notNull(),
  resource: varchar("resource").notNull(),
  resourceId: varchar("resource_id"),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  successful: boolean("successful").notNull(),
  failureReason: text("failure_reason"),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow(),
});
