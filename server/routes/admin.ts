import { Router } from "express";
import { storage } from "../local-db";
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

// Authentication middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  const adminRole = req.session?.adminRole;
  const clientId = req.session?.clientId;
  const userId = req.user?.claims?.sub;
  
  if (adminRole || clientId || userId) {
    return next();
  }
  
  return res.status(401).json({ message: "Unauthorized access" });
};
import { 
  insertCompanyConfigurationSchema,
  insertStateConfigurationSchema,
  insertCustomFieldSchema,
  insertDocumentTemplateSchema,
  insertStatePricingSchema,
  insertBusinessRuleSchema
} from "@shared/schema";

const router = Router();

// Company Configuration Routes
router.post("/company-configuration", async (req, res) => {
  try {
    const validatedData = insertCompanyConfigurationSchema.parse(req.body);
    const config = await storage.createCompanyConfiguration(validatedData);
    res.json(config);
  } catch (error) {
    console.error("Error creating company configuration:", error);
    res.status(400).json({ error: "Failed to create company configuration" });
  }
});

router.get("/company-configuration/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const config = await storage.getCompanyConfiguration(id);
    if (!config) {
      return res.status(404).json({ error: "Company configuration not found" });
    }
    res.json(config);
  } catch (error) {
    console.error("Error fetching company configuration:", error);
    res.status(500).json({ error: "Failed to fetch company configuration" });
  }
});

router.put("/company-configuration/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const config = await storage.updateCompanyConfiguration(id, updates);
    res.json(config);
  } catch (error) {
    console.error("Error updating company configuration:", error);
    res.status(400).json({ error: "Failed to update company configuration" });
  }
});

router.get("/company-configurations", async (req, res) => {
  try {
    const configs = await storage.getAllCompanyConfigurations();
    res.json(configs);
  } catch (error) {
    console.error("Error fetching company configurations:", error);
    res.status(500).json({ error: "Failed to fetch company configurations" });
  }
});

// State Configuration Routes
router.post("/state-configurations", async (req, res) => {
  try {
    const validatedData = insertStateConfigurationSchema.parse(req.body);
    const config = await storage.createStateConfiguration(validatedData);
    res.json(config);
  } catch (error) {
    console.error("Error creating state configuration:", error);
    res.status(400).json({ error: "Failed to create state configuration" });
  }
});

router.get("/state-configurations", async (req, res) => {
  try {
    const configs = await storage.getAllStateConfigurations();
    res.json(configs);
  } catch (error) {
    console.error("Error fetching state configurations:", error);
    res.status(500).json({ error: "Failed to fetch state configurations" });
  }
});

router.get("/state-configurations/:state", async (req, res) => {
  try {
    const state = req.params.state;
    const config = await storage.getStateConfiguration(state);
    if (!config) {
      return res.status(404).json({ error: "State configuration not found" });
    }
    res.json(config);
  } catch (error) {
    console.error("Error fetching state configuration:", error);
    res.status(500).json({ error: "Failed to fetch state configuration" });
  }
});

router.put("/state-configurations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const config = await storage.updateStateConfiguration(id, updates);
    res.json(config);
  } catch (error) {
    console.error("Error updating state configuration:", error);
    res.status(400).json({ error: "Failed to update state configuration" });
  }
});

// State Pricing Routes
router.post("/state-pricing", async (req, res) => {
  try {
    const validatedData = insertStatePricingSchema.parse(req.body);
    const pricing = await storage.createStatePricing(validatedData);
    res.json(pricing);
  } catch (error) {
    console.error("Error creating state pricing:", error);
    res.status(400).json({ error: "Failed to create state pricing" });
  }
});

router.get("/state-pricing/:companyId", async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    const { state, bondType } = req.query;
    const pricing = await storage.getStatePricing(
      companyId,
      state as string,
      bondType as string
    );
    res.json(pricing);
  } catch (error) {
    console.error("Error fetching state pricing:", error);
    res.status(500).json({ error: "Failed to fetch state pricing" });
  }
});

router.put("/state-pricing/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const pricing = await storage.updateStatePricing(id, updates);
    res.json(pricing);
  } catch (error) {
    console.error("Error updating state pricing:", error);
    res.status(400).json({ error: "Failed to update state pricing" });
  }
});

router.delete("/state-pricing/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteStatePricing(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting state pricing:", error);
    res.status(400).json({ error: "Failed to delete state pricing" });
  }
});

// Custom Fields Routes
router.post("/custom-fields", async (req, res) => {
  try {
    const validatedData = insertCustomFieldSchema.parse(req.body);
    const field = await storage.createCustomField(validatedData);
    res.json(field);
  } catch (error) {
    console.error("Error creating custom field:", error);
    res.status(400).json({ error: "Failed to create custom field" });
  }
});

router.get("/custom-fields", async (req, res) => {
  try {
    const { companyId, state, entityType } = req.query;
    const fields = await storage.getCustomFields(
      companyId ? parseInt(companyId as string) : undefined,
      state as string,
      entityType as string
    );
    res.json(fields);
  } catch (error) {
    console.error("Error fetching custom fields:", error);
    res.status(500).json({ error: "Failed to fetch custom fields" });
  }
});

router.put("/custom-fields/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const field = await storage.updateCustomField(id, updates);
    res.json(field);
  } catch (error) {
    console.error("Error updating custom field:", error);
    res.status(400).json({ error: "Failed to update custom field" });
  }
});

router.delete("/custom-fields/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteCustomField(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting custom field:", error);
    res.status(400).json({ error: "Failed to delete custom field" });
  }
});

// Document Template Routes
router.post("/document-templates", async (req, res) => {
  try {
    const validatedData = insertDocumentTemplateSchema.parse(req.body);
    const template = await storage.createDocumentTemplate(validatedData);
    res.json(template);
  } catch (error) {
    console.error("Error creating document template:", error);
    res.status(400).json({ error: "Failed to create document template" });
  }
});

router.get("/document-templates", async (req, res) => {
  try {
    const { companyId, state, templateType } = req.query;
    const templates = await storage.getDocumentTemplates(
      companyId ? parseInt(companyId as string) : undefined,
      state as string,
      templateType as string
    );
    res.json(templates);
  } catch (error) {
    console.error("Error fetching document templates:", error);
    res.status(500).json({ error: "Failed to fetch document templates" });
  }
});

router.put("/document-templates/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const template = await storage.updateDocumentTemplate(id, updates);
    res.json(template);
  } catch (error) {
    console.error("Error updating document template:", error);
    res.status(400).json({ error: "Failed to update document template" });
  }
});

router.delete("/document-templates/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteDocumentTemplate(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting document template:", error);
    res.status(400).json({ error: "Failed to delete document template" });
  }
});

// Business Rules Routes
router.post("/business-rules", async (req, res) => {
  try {
    const validatedData = insertBusinessRuleSchema.parse(req.body);
    const rule = await storage.createBusinessRule(validatedData);
    res.json(rule);
  } catch (error) {
    console.error("Error creating business rule:", error);
    res.status(400).json({ error: "Failed to create business rule" });
  }
});

router.get("/business-rules/:companyId", async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    const { ruleType } = req.query;
    const rules = await storage.getBusinessRules(companyId, ruleType as string);
    res.json(rules);
  } catch (error) {
    console.error("Error fetching business rules:", error);
    res.status(500).json({ error: "Failed to fetch business rules" });
  }
});

router.put("/business-rules/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const rule = await storage.updateBusinessRule(id, updates);
    res.json(rule);
  } catch (error) {
    console.error("Error updating business rule:", error);
    res.status(400).json({ error: "Failed to update business rule" });
  }
});

router.delete("/business-rules/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteBusinessRule(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting business rule:", error);
    res.status(400).json({ error: "Failed to delete business rule" });
  }
});

// Staff Management Routes
router.post("/staff", isAuthenticated, async (req, res) => {
  try {
    const staffData = req.body;
    
    // Generate temporary password
    const tempPassword = randomBytes(8).toString('hex');
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);
    
    // Create staff member
    const staff = await storage.createStaff({
      ...staffData,
      companyId: 1, // Default company ID for now
    });
    
    // Create user credentials
    const credential = await storage.createUserCredential({
      staffId: staff.id,
      credentialType: 'staff_access',
      username: staffData.email || `staff${staff.employeeId}`,
      temporaryPassword: hashedTempPassword,
      passwordResetRequired: true,
      createdBy: 'admin'
    });
    
    res.json({
      staff,
      credentials: {
        username: credential.username,
        temporaryPassword: tempPassword, // Send plain password for initial setup
        activationToken: credential.activationToken
      }
    });
  } catch (error) {
    console.error("Error creating staff:", error);
    res.status(400).json({ error: "Failed to create staff member" });
  }
});

router.get("/staff", isAuthenticated, async (req, res) => {
  try {
    const staff = await storage.getAllStaff();
    res.json(staff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

router.get("/staff/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const staff = await storage.getStaff(id);
    if (!staff) {
      return res.status(404).json({ error: "Staff member not found" });
    }
    res.json(staff);
  } catch (error) {
    console.error("Error fetching staff member:", error);
    res.status(500).json({ error: "Failed to fetch staff member" });
  }
});

router.put("/staff/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const staff = await storage.updateStaff(id, updates);
    res.json(staff);
  } catch (error) {
    console.error("Error updating staff:", error);
    res.status(400).json({ error: "Failed to update staff member" });
  }
});

router.delete("/staff/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteStaff(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting staff:", error);
    res.status(400).json({ error: "Failed to delete staff member" });
  }
});

// Client Management Routes with Credential Assignment
router.post("/clients", isAuthenticated, async (req, res) => {
  try {
    const clientData = req.body;
    
    // Generate client ID and temporary password
    const clientId = `CLT-${Date.now()}`;
    const tempPassword = randomBytes(8).toString('hex');
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);
    
    // Create client
    const client = await storage.createClient({
      ...clientData,
      clientId,
      password: hashedTempPassword,
      temporaryPassword: hashedTempPassword,
      companyId: 1, // Default company ID for now
      accountStatus: 'pending'
    });
    
    // Create user credentials for client portal access
    const credential = await storage.createUserCredential({
      clientId: client.id,
      credentialType: 'client_portal',
      username: clientData.email || clientId,
      temporaryPassword: hashedTempPassword,
      passwordResetRequired: true,
      createdBy: 'admin'
    });
    
    res.json({
      client,
      credentials: {
        clientId: client.clientId,
        username: credential.username,
        temporaryPassword: tempPassword, // Send plain password for initial setup
        activationToken: credential.activationToken,
        portalUrl: `/client-portal/activate?token=${credential.activationToken}`
      }
    });
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(400).json({ error: "Failed to create client" });
  }
});

router.get("/clients", isAuthenticated, async (req, res) => {
  try {
    const clients = await storage.getAllClients();
    res.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

router.get("/clients/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const client = await storage.getClient(id);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.json(client);
  } catch (error) {
    console.error("Error fetching client:", error);
    res.status(500).json({ error: "Failed to fetch client" });
  }
});

router.put("/clients/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const client = await storage.updateClient(id, updates);
    res.json(client);
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(400).json({ error: "Failed to update client" });
  }
});

// User Credential Management Routes
router.post("/activate-account", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const credential = await storage.activateUserAccount(token, hashedPassword);
    
    res.json({
      success: true,
      message: "Account activated successfully",
      username: credential.username
    });
  } catch (error) {
    console.error("Error activating account:", error);
    res.status(400).json({ error: error.message || "Failed to activate account" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { username } = req.body;
    
    const credential = await storage.getUserCredential(username);
    if (!credential) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Generate new temporary password
    const tempPassword = randomBytes(8).toString('hex');
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);
    const newToken = `token_${Date.now()}`;
    
    await storage.updateUserCredential(credential.id, {
      temporaryPassword: hashedTempPassword,
      passwordResetRequired: true,
      activationToken: newToken,
      activationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
    
    res.json({
      success: true,
      temporaryPassword: tempPassword,
      activationToken: newToken,
      message: "Password reset successfully. Please use the temporary password to log in."
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(400).json({ error: "Failed to reset password" });
  }
});

router.get("/user-credentials", async (req, res) => {
  try {
    const credentials = await storage.readJsonFile('user-credentials.json', []);
    // Remove sensitive data before sending
    const sanitized = credentials.map((cred: any) => ({
      id: cred.id,
      username: cred.username,
      credentialType: cred.credentialType,
      isActive: cred.isActive,
      passwordResetRequired: cred.passwordResetRequired,
      lastLogin: cred.lastLogin,
      createdAt: cred.createdAt
    }));
    res.json(sanitized);
  } catch (error) {
    console.error("Error fetching user credentials:", error);
    res.status(500).json({ error: "Failed to fetch user credentials" });
  }
});

export default router;