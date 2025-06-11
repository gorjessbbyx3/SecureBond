import { Router } from "express";
import { storage } from "../local-db";
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

export default router;