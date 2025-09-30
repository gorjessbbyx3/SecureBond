import { Router } from "express";
import { storage } from "../storage-extensions";
import {
  insertClientAssignmentSchema,
  insertTaskSchema,
  insertActivityLogSchema,
  insertClientNoteSchema,
  insertSavedFilterSchema,
  insertComplianceTrackingSchema,
  insertShiftHandoffSchema,
} from "@shared/schema";
import { z } from "zod";

const router = Router();

// ============ STAFF ASSIGNMENTS ============

// Get all client assignments
router.get("/api/staff-assignments", async (req, res) => {
  try {
    const assignments = await storage.getAllClientAssignments();
    res.json(assignments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get assignments for a specific staff member
router.get("/api/staff-assignments/staff/:staffId", async (req, res) => {
  try {
    const staffId = parseInt(req.params.staffId);
    const assignments = await storage.getAssignmentsByStaff(staffId);
    res.json(assignments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get assignments for a specific client
router.get("/api/staff-assignments/client/:clientId", async (req, res) => {
  try {
    const clientId = parseInt(req.params.clientId);
    const assignments = await storage.getAssignmentsByClient(clientId);
    res.json(assignments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new client assignment
router.post("/api/staff-assignments", async (req, res) => {
  try {
    const data = insertClientAssignmentSchema.parse(req.body);
    const assignment = await storage.createClientAssignment(data);
    res.status(201).json(assignment);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update a client assignment
router.patch("/api/staff-assignments/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const assignment = await storage.updateClientAssignment(id, req.body);
    res.json(assignment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a client assignment
router.delete("/api/staff-assignments/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteClientAssignment(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ TASKS ============

// Get all tasks
router.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await storage.getAllTasks();
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get tasks for a specific staff member
router.get("/api/tasks/staff/:staffId", async (req, res) => {
  try {
    const staffId = parseInt(req.params.staffId);
    const tasks = await storage.getTasksByStaff(staffId);
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get tasks for a specific client
router.get("/api/tasks/client/:clientId", async (req, res) => {
  try {
    const clientId = parseInt(req.params.clientId);
    const tasks = await storage.getTasksByClient(clientId);
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending tasks for a staff member
router.get("/api/tasks/staff/:staffId/pending", async (req, res) => {
  try {
    const staffId = parseInt(req.params.staffId);
    const tasks = await storage.getPendingTasksByStaff(staffId);
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new task
router.post("/api/tasks", async (req, res) => {
  try {
    const data = insertTaskSchema.parse(req.body);
    const task = await storage.createTask(data);
    res.status(201).json(task);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update a task
router.patch("/api/tasks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const task = await storage.updateTask(id, req.body);
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Complete a task
router.post("/api/tasks/:id/complete", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { completedBy, notes } = req.body;
    const task = await storage.completeTask(id, completedBy, notes);
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a task
router.delete("/api/tasks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteTask(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ CLIENT NOTES ============

// Get all notes for a client
router.get("/api/client-notes/client/:clientId", async (req, res) => {
  try {
    const clientId = parseInt(req.params.clientId);
    const notes = await storage.getClientNotes(clientId);
    res.json(notes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new client note
router.post("/api/client-notes", async (req, res) => {
  try {
    const data = insertClientNoteSchema.parse(req.body);
    const note = await storage.createClientNote(data);
    res.status(201).json(note);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update a client note
router.patch("/api/client-notes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const note = await storage.updateClientNote(id, req.body);
    res.json(note);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a client note
router.delete("/api/client-notes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteClientNote(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ACTIVITY LOGS ============

// Get all activity logs
router.get("/api/activity-logs", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const logs = await storage.getActivityLogs(limit);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity logs for a specific client
router.get("/api/activity-logs/client/:clientId", async (req, res) => {
  try {
    const clientId = parseInt(req.params.clientId);
    const logs = await storage.getActivityLogsByClient(clientId);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity logs for a specific user
router.get("/api/activity-logs/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const logs = await storage.getActivityLogsByUser(userId);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new activity log
router.post("/api/activity-logs", async (req, res) => {
  try {
    const data = insertActivityLogSchema.parse(req.body);
    const log = await storage.createActivityLog(data);
    res.status(201).json(log);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// ============ SAVED FILTERS ============

// Get saved filters for a user
router.get("/api/saved-filters/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const filters = await storage.getSavedFiltersByUser(userId);
    res.json(filters);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new saved filter
router.post("/api/saved-filters", async (req, res) => {
  try {
    const data = insertSavedFilterSchema.parse(req.body);
    const filter = await storage.createSavedFilter(data);
    res.status(201).json(filter);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update a saved filter
router.patch("/api/saved-filters/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const filter = await storage.updateSavedFilter(id, req.body);
    res.json(filter);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a saved filter
router.delete("/api/saved-filters/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteSavedFilter(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ COMPLIANCE TRACKING ============

// Get compliance tracking for a client
router.get("/api/compliance-tracking/client/:clientId", async (req, res) => {
  try {
    const clientId = parseInt(req.params.clientId);
    const tracking = await storage.getComplianceTracking(clientId);
    res.json(tracking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update compliance tracking for a client
router.post("/api/compliance-tracking", async (req, res) => {
  try {
    const data = insertComplianceTrackingSchema.parse(req.body);
    const tracking = await storage.upsertComplianceTracking(data);
    res.json(tracking);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Recalculate compliance score for a client
router.post("/api/compliance-tracking/client/:clientId/recalculate", async (req, res) => {
  try {
    const clientId = parseInt(req.params.clientId);
    const tracking = await storage.recalculateComplianceScore(clientId);
    res.json(tracking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SHIFT HANDOFFS ============

// Get shift handoffs
router.get("/api/shift-handoffs", async (req, res) => {
  try {
    const { staffId, acknowledged } = req.query;
    let handoffs;
    
    if (staffId) {
      handoffs = await storage.getShiftHandoffsForStaff(parseInt(staffId as string));
    } else if (acknowledged !== undefined) {
      handoffs = await storage.getUnacknowledgedHandoffs();
    } else {
      handoffs = await storage.getAllShiftHandoffs();
    }
    
    res.json(handoffs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new shift handoff
router.post("/api/shift-handoffs", async (req, res) => {
  try {
    const data = insertShiftHandoffSchema.parse(req.body);
    const handoff = await storage.createShiftHandoff(data);
    res.status(201).json(handoff);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Acknowledge a shift handoff
router.post("/api/shift-handoffs/:id/acknowledge", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { acknowledgedBy } = req.body;
    const handoff = await storage.acknowledgeShiftHandoff(id, acknowledgedBy);
    res.json(handoff);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ DASHBOARD DATA ============

// Get staff dashboard summary
router.get("/api/staff-dashboard/summary/:staffId", async (req, res) => {
  try {
    const staffId = parseInt(req.params.staffId);
    
    const [assignments, tasks, handoffs] = await Promise.all([
      storage.getAssignmentsByStaff(staffId),
      storage.getPendingTasksByStaff(staffId),
      storage.getUnacknowledgedHandoffsForStaff(staffId),
    ]);
    
    const summary = {
      assignedClients: assignments.length,
      pendingTasks: tasks.length,
      unacknowledgedHandoffs: handoffs.length,
      assignments,
      tasks: tasks.slice(0, 10), // Top 10 tasks
      handoffs: handoffs.slice(0, 5), // Top 5 handoffs
    };
    
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get clients with their assigned staff
router.get("/api/clients-with-assignments", async (req, res) => {
  try {
    const clients = await storage.getClientsWithAssignments();
    res.json(clients);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
