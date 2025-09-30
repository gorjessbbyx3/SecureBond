
import { storage } from './local-db';
import bcrypt from 'bcrypt';

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await clearAllData();

    // Seed company configuration
    console.log('🏢 Seeding company configuration...');
    await seedCompanyConfiguration();

    // Seed state configurations
    console.log('🗺️ Seeding state configurations...');
    await seedStateConfigurations();

    // Seed staff members
    console.log('👥 Seeding staff members...');
    await seedStaff();

    // Seed clients
    console.log('👤 Seeding clients...');
    await seedClients();

    // Seed bonds
    console.log('📋 Seeding bonds...');
    await seedBonds();

    // Seed court dates
    console.log('⚖️ Seeding court dates...');
    await seedCourtDates();

    // Seed payments
    console.log('💰 Seeding payments...');
    await seedPayments();

    // Seed check-ins
    console.log('📍 Seeding check-ins...');
    await seedCheckIns();

    // Seed alerts
    console.log('🚨 Seeding alerts...');
    await seedAlerts();

    // Seed messages
    console.log('💬 Seeding messages...');
    await seedMessages();

    // Seed expenses
    console.log('💸 Seeding expenses...');
    await seedExpenses();

    console.log('✅ Database seeding completed successfully!');
    
    // Display seeded credentials
    console.log('\n📋 Seeded Credentials:');
    console.log('Admin: username "admin", password "Wordpass3211!"');
    console.log('Maintenance: username "maintenance", password "MaintenanceSecure2025!"');
    console.log('Sample Clients:');
    console.log('- CLT-001: password "client123"');
    console.log('- CLT-002: password "client123"');
    console.log('- CLT-003: password "client123"');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

async function clearAllData() {
  // Reset the data directory
  await storage.writeJsonFile('clients.json', []);
  await storage.writeJsonFile('bonds.json', []);
  await storage.writeJsonFile('payments.json', []);
  await storage.writeJsonFile('check-ins.json', []);
  await storage.writeJsonFile('court-dates.json', []);
  await storage.writeJsonFile('messages.json', []);
  await storage.writeJsonFile('alerts.json', []);
  await storage.writeJsonFile('expenses.json', []);
  await storage.writeJsonFile('staff.json', []);
  await storage.writeJsonFile('users.json', []);
  await storage.writeJsonFile('index.json', { nextId: 1 });
}

async function seedCompanyConfiguration() {
  await storage.createCompanyConfiguration({
    companyName: "Aloha Bail Bonds LLC",
    licenseNumber: "HI-BB-2025-001",
    state: "HI",
    address: "1234 Kalakaua Avenue",
    city: "Honolulu",
    zipCode: "96815",
    phone: "(808) 555-BAIL",
    email: "admin@alohabailbonds.com",
    website: "https://alohabailbonds.com",
    description: "Premier bail bond services across all Hawaiian islands with 24/7 emergency support",
    timezone: "Pacific/Honolulu",
    businessType: "bail_bonds",
    operatingHours: {
      monday: { open: "00:00", close: "23:59" },
      tuesday: { open: "00:00", close: "23:59" },
      wednesday: { open: "00:00", close: "23:59" },
      thursday: { open: "00:00", close: "23:59" },
      friday: { open: "00:00", close: "23:59" },
      saturday: { open: "00:00", close: "23:59" },
      sunday: { open: "00:00", close: "23:59" }
    },
    customSettings: {
      courtReminderDays: 3,
      checkInFrequency: "weekly",
      gpsTrackingEnabled: true
    }
  });
}

async function seedStateConfigurations() {
  await storage.createStateConfiguration({
    state: "HI",
    stateName: "Hawaii",
    bondRegulations: {
      maxBondAmount: 500000,
      minimumDownPayment: 0.10,
      requiredDocuments: ["photo_id", "proof_of_residence", "employment_verification"]
    },
    courtSystems: {
      "First Circuit": ["Honolulu District Court", "Honolulu Family Court"],
      "Second Circuit": ["Maui District Court", "Molokai District Court"],
      "Third Circuit": ["Hilo District Court", "Kona District Court"],
      "Fifth Circuit": ["Lihue District Court"]
    },
    checkInRequirements: {
      frequency: "weekly",
      methods: ["in_person", "phone", "app"],
      restrictedAreas: ["airports", "harbors"]
    },
    feeStructures: {
      premiumRate: 0.10,
      minimumFee: 100,
      lateFee: 25,
      courtFee: 50
    }
  });
}

async function seedStaff() {
  const hashedPassword = await bcrypt.hash('staff123', 10);
  
  const staff = [
    {
      firstName: "Sarah",
      lastName: "Johnson",
      position: "manager",
      department: "operations",
      phone: "(808) 555-0101",
      email: "sarah.johnson@alohabailbonds.com",
      hireDate: "2023-01-15",
      salary: "65000.00"
    },
    {
      firstName: "Michael",
      lastName: "Chen",
      position: "agent",
      department: "sales",
      phone: "(808) 555-0102",
      email: "michael.chen@alohabailbonds.com",
      hireDate: "2023-03-20",
      salary: "45000.00"
    },
    {
      firstName: "Lisa",
      lastName: "Rodriguez",
      position: "receptionist",
      department: "administration",
      phone: "(808) 555-0103",
      email: "lisa.rodriguez@alohabailbonds.com",
      hireDate: "2023-06-10",
      salary: "35000.00"
    }
  ];

  for (const staffMember of staff) {
    await storage.createStaff(staffMember);
  }
}

async function seedClients() {
  const hashedPassword = await bcrypt.hash('client123', 10);
  
  const clients = [
    {
      clientId: "CLT-001",
      fullName: "James Mitchell",
      email: "james.mitchell@email.com",
      phoneNumber: "(808) 555-1001",
      address: "456 Keeaumoku Street, Apt 12",
      city: "Honolulu",
      state: "HI",
      zipCode: "96814",
      dateOfBirth: "1985-03-15",
      emergencyContact: "Maria Mitchell",
      emergencyPhone: "(808) 555-1002",
      password: hashedPassword,
      isActive: true,
      accountStatus: "active"
    },
    {
      clientId: "CLT-002", 
      fullName: "Kailani Nakamura",
      email: "kailani.nakamura@email.com",
      phoneNumber: "(808) 555-1003",
      address: "789 Kapiolani Boulevard",
      city: "Honolulu", 
      state: "HI",
      zipCode: "96813",
      dateOfBirth: "1992-07-22",
      emergencyContact: "David Nakamura",
      emergencyPhone: "(808) 555-1004",
      password: hashedPassword,
      isActive: true,
      accountStatus: "active"
    },
    {
      clientId: "CLT-003",
      fullName: "Robert Thompson",
      email: "robert.thompson@email.com", 
      phoneNumber: "(808) 555-1005",
      address: "321 Wilder Avenue",
      city: "Honolulu",
      state: "HI", 
      zipCode: "96822",
      dateOfBirth: "1978-11-30",
      emergencyContact: "Susan Thompson",
      emergencyPhone: "(808) 555-1006",
      password: hashedPassword,
      isActive: true,
      accountStatus: "pending",
      missedCheckIns: 2
    },
    {
      clientId: "CLT-004",
      fullName: "Ana Santos",
      email: "ana.santos@email.com",
      phoneNumber: "(808) 555-1007", 
      address: "567 King Street",
      city: "Honolulu",
      state: "HI",
      zipCode: "96817",
      dateOfBirth: "1988-05-18",
      emergencyContact: "Carlos Santos",
      emergencyPhone: "(808) 555-1008",
      password: hashedPassword,
      isActive: true,
      accountStatus: "active"
    },
    {
      clientId: "CLT-005",
      fullName: "Tyler Wong",
      email: "tyler.wong@email.com",
      phoneNumber: "(808) 555-1009",
      address: "890 Beretania Street",
      city: "Honolulu", 
      state: "HI",
      zipCode: "96814",
      dateOfBirth: "1995-09-12",
      emergencyContact: "Jennifer Wong",
      emergencyPhone: "(808) 555-1010",
      password: hashedPassword,
      isActive: false,
      accountStatus: "suspended",
      missedCheckIns: 5
    }
  ];

  for (const client of clients) {
    await storage.createClient(client);
  }
}

async function seedBonds() {
  const bonds = [
    {
      clientId: 1,
      companyId: 1,
      bondNumber: "BND-2025-001",
      bondAmount: "10000.00",
      totalOwed: "11000.00",
      downPayment: "1000.00", 
      remainingBalance: "10000.00",
      courtDate: new Date("2025-02-15T09:00:00Z"),
      courtLocation: "Honolulu District Court",
      jurisdiction: "Honolulu County",
      charges: "DUI, Reckless driving",
      caseNumber: "1PC251234567",
      status: "active",
      bondType: "surety",
      premiumRate: "0.1000",
      issuedDate: new Date("2025-01-15T10:30:00Z")
    },
    {
      clientId: 2,
      companyId: 1, 
      bondNumber: "BND-2025-002",
      bondAmount: "25000.00",
      totalOwed: "27500.00",
      downPayment: "2500.00",
      remainingBalance: "25000.00",
      courtDate: new Date("2025-02-20T14:00:00Z"),
      courtLocation: "Maui District Court",
      jurisdiction: "Maui County",
      charges: "Assault in the third degree",
      caseNumber: "2PC251234568", 
      status: "active",
      bondType: "surety",
      premiumRate: "0.1000",
      issuedDate: new Date("2025-01-18T11:15:00Z")
    },
    {
      clientId: 3,
      companyId: 1,
      bondNumber: "BND-2025-003", 
      bondAmount: "5000.00",
      totalOwed: "5500.00",
      downPayment: "500.00",
      remainingBalance: "5000.00",
      courtDate: new Date("2025-01-25T08:30:00Z"),
      courtLocation: "Honolulu District Court",
      jurisdiction: "Honolulu County", 
      charges: "Theft in the fourth degree",
      caseNumber: "1PC251234569",
      status: "active",
      bondType: "surety",
      premiumRate: "0.1000",
      issuedDate: new Date("2025-01-20T09:45:00Z")
    }
  ];

  for (const bond of bonds) {
    await storage.createBond(bond);
  }
}

async function seedCourtDates() {
  const courtDates = [
    {
      clientId: 1,
      courtDate: new Date("2025-02-15T09:00:00Z"),
      courtType: "arraignment",
      courtLocation: "Honolulu District Court, Room 3A",
      caseNumber: "1PC251234567",
      charges: "DUI, Reckless driving",
      notes: "First appearance - defendant must be present",
      adminApproved: true,
      approvedBy: "admin",
      approvedAt: new Date(),
      source: "manual"
    },
    {
      clientId: 2,
      courtDate: new Date("2025-02-20T14:00:00Z"), 
      courtType: "hearing",
      courtLocation: "Maui District Court, Room 1B",
      caseNumber: "2PC251234568",
      charges: "Assault in the third degree",
      notes: "Preliminary hearing scheduled",
      adminApproved: true,
      approvedBy: "admin", 
      approvedAt: new Date(),
      source: "manual"
    },
    {
      clientId: 3,
      courtDate: new Date("2025-01-25T08:30:00Z"),
      courtType: "trial",
      courtLocation: "Honolulu District Court, Room 2C", 
      caseNumber: "1PC251234569",
      charges: "Theft in the fourth degree",
      notes: "Jury trial scheduled - 2 day estimated duration",
      adminApproved: false,
      source: "scraped"
    },
    {
      clientId: 1,
      courtDate: new Date("2025-03-10T10:00:00Z"),
      courtType: "sentencing",
      courtLocation: "Honolulu District Court, Room 3A",
      caseNumber: "1PC251234567", 
      charges: "DUI, Reckless driving",
      notes: "Sentencing hearing if guilty plea entered",
      adminApproved: true,
      approvedBy: "admin",
      approvedAt: new Date(),
      source: "manual"
    }
  ];

  for (const courtDate of courtDates) {
    await storage.createCourtDate(courtDate);
  }
}

async function seedPayments() {
  const payments = [
    {
      clientId: 1,
      amount: "1000.00",
      paymentDate: new Date("2025-01-15T12:00:00Z"),
      paymentMethod: "credit_card",
      confirmed: true,
      confirmedBy: "admin",
      confirmedAt: new Date("2025-01-15T12:30:00Z"),
      notes: "Initial down payment - bond BND-2025-001"
    },
    {
      clientId: 2, 
      amount: "2500.00",
      paymentDate: new Date("2025-01-18T14:15:00Z"),
      paymentMethod: "bank_transfer",
      confirmed: true,
      confirmedBy: "admin",
      confirmedAt: new Date("2025-01-18T14:45:00Z"),
      notes: "Down payment - bond BND-2025-002"
    },
    {
      clientId: 3,
      amount: "500.00", 
      paymentDate: new Date("2025-01-20T10:30:00Z"),
      paymentMethod: "cash",
      confirmed: true,
      confirmedBy: "admin",
      confirmedAt: new Date("2025-01-20T11:00:00Z"),
      notes: "Full payment - bond BND-2025-003"
    },
    {
      clientId: 1,
      amount: "250.00",
      paymentDate: new Date("2025-01-22T16:20:00Z"),
      paymentMethod: "credit_card",
      confirmed: false,
      notes: "Monthly installment payment - pending confirmation"
    },
    {
      clientId: 2,
      amount: "300.00",
      paymentDate: new Date("2025-01-24T11:45:00Z"), 
      paymentMethod: "check",
      confirmed: false,
      notes: "Partial payment towards balance - check needs to clear"
    }
  ];

  for (const payment of payments) {
    await storage.createPayment(payment);
  }
}

async function seedCheckIns() {
  const checkIns = [
    {
      clientId: 1,
      checkInTime: new Date("2025-01-20T09:00:00Z"),
      location: "21.3099, -157.8581", // Honolulu coordinates
      notes: "Weekly check-in - client in compliance"
    },
    {
      clientId: 1,
      checkInTime: new Date("2025-01-27T09:15:00Z"),
      location: "21.3099, -157.8581",
      notes: "Weekly check-in - no issues reported"
    },
    {
      clientId: 2,
      checkInTime: new Date("2025-01-21T14:30:00Z"), 
      location: "20.7984, -156.3319", // Maui coordinates
      notes: "Phone check-in - client working on Maui"
    },
    {
      clientId: 2,
      checkInTime: new Date("2025-01-28T15:00:00Z"),
      location: "20.7984, -156.3319",
      notes: "In-person check-in at Maui office"
    },
    {
      clientId: 4,
      checkInTime: new Date("2025-01-19T11:00:00Z"),
      location: "21.3099, -157.8581",
      notes: "Initial check-in after bond posting"
    },
    {
      clientId: 4,
      checkInTime: new Date("2025-01-26T11:30:00Z"),
      location: "21.3099, -157.8581", 
      notes: "Weekly check-in - client reported job interview"
    }
  ];

  for (const checkIn of checkIns) {
    await storage.createCheckIn(checkIn);
  }
}

async function seedAlerts() {
  const alerts = [
    {
      clientId: 3,
      alertType: "missed_checkin",
      severity: "high",
      message: "Robert Thompson has missed 2 consecutive weekly check-ins. Last contact: January 15, 2025",
      acknowledged: false
    },
    {
      clientId: 5,
      alertType: "court_reminder", 
      severity: "critical",
      message: "Tyler Wong has upcoming court date in 2 days (January 27, 2025) and has not acknowledged",
      acknowledged: false
    },
    {
      clientId: 3,
      alertType: "payment_overdue",
      severity: "medium",
      message: "Monthly payment of $200 overdue by 5 days for Robert Thompson",
      acknowledged: false
    },
    {
      clientId: 1,
      alertType: "location_violation",
      severity: "medium", 
      message: "James Mitchell detected near restricted area (Honolulu Airport) at 2:30 PM",
      acknowledged: true,
      acknowledgedBy: "admin",
      acknowledgedAt: new Date("2025-01-25T14:45:00Z")
    }
  ];

  for (const alert of alerts) {
    await storage.createAlert(alert);
  }
}

async function seedMessages() {
  const messages = [
    {
      clientId: 1,
      senderId: "admin",
      senderType: "admin",
      message: "Good morning James. This is a reminder about your upcoming court date on February 15th at 9:00 AM. Please confirm receipt.",
      isRead: true
    },
    {
      clientId: 2,
      senderId: "admin", 
      senderType: "admin",
      message: "Kailani, your payment has been received and processed. Thank you for staying current with your obligations.",
      isRead: false
    },
    {
      clientId: 3,
      senderId: "admin",
      senderType: "admin",
      message: "Robert, you have missed your last two check-ins. Please contact our office immediately at (808) 555-BAIL.",
      isRead: false
    },
    {
      clientId: 1,
      senderId: "CLT-001",
      senderType: "client",
      message: "Hi, I received the court reminder. I will be there on time. Thank you.",
      isRead: true
    },
    {
      clientId: 4,
      senderId: "admin",
      senderType: "admin", 
      message: "Ana, welcome to our system. Please remember to check in weekly and keep us updated with any address changes.",
      isRead: false
    }
  ];

  for (const message of messages) {
    await storage.createMessage(message);
  }
}

async function seedExpenses() {
  const expenses = [
    {
      description: "Court filing fees - January",
      amount: "350.00",
      category: "court_fees",
      expenseDate: new Date("2025-01-15T00:00:00Z"),
      createdBy: "admin"
    },
    {
      description: "Office rent - January 2025",
      amount: "2500.00", 
      category: "office_expenses",
      expenseDate: new Date("2025-01-01T00:00:00Z"),
      createdBy: "admin"
    },
    {
      description: "GPS monitoring equipment maintenance",
      amount: "450.00",
      category: "equipment",
      expenseDate: new Date("2025-01-18T00:00:00Z"),
      createdBy: "admin"
    },
    {
      description: "Insurance premium - liability coverage",
      amount: "800.00",
      category: "insurance",
      expenseDate: new Date("2025-01-10T00:00:00Z"), 
      createdBy: "admin"
    },
    {
      description: "Legal consultation fees",
      amount: "1200.00",
      category: "legal",
      expenseDate: new Date("2025-01-22T00:00:00Z"),
      createdBy: "admin"
    }
  ];

  for (const expense of expenses) {
    await storage.createExpense(expense);
  }
}
