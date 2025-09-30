import { storage } from "./storage";
import {
  type ClientAssignment,
  type InsertClientAssignment,
  type Task,
  type InsertTask,
  type ActivityLog,
  type InsertActivityLog,
  type ClientNote,
  type InsertClientNote,
  type SavedFilter,
  type InsertSavedFilter,
  type ComplianceTracking,
  type InsertComplianceTracking,
  type ShiftHandoff,
  type InsertShiftHandoff,
} from "@shared/schema";

// Extend storage with new teamwork features
// These are stub implementations that return empty data for now
// TODO: Implement proper database persistence

let clientAssignments: ClientAssignment[] = [];
let tasks: Task[] = [];
let activityLogs: ActivityLog[] = [];
let clientNotes: ClientNote[] = [];
let savedFilters: SavedFilter[] = [];
let complianceTracking: ComplianceTracking[] = [];
let shiftHandoffs: ShiftHandoff[] = [];

let nextId = 1;

// Client Assignments
(storage as any).getAllClientAssignments = async function (): Promise<ClientAssignment[]> {
  return clientAssignments;
};

(storage as any).getAssignmentsByStaff = async function (staffId: number): Promise<ClientAssignment[]> {
  return clientAssignments.filter(a => a.staffId === staffId && a.isActive);
};

(storage as any).getAssignmentsByClient = async function (clientId: number): Promise<ClientAssignment[]> {
  return clientAssignments.filter(a => a.clientId === clientId && a.isActive);
};

(storage as any).createClientAssignment = async function (assignment: InsertClientAssignment): Promise<ClientAssignment> {
  const newAssignment: ClientAssignment = {
    id: nextId++,
    ...assignment,
    isActive: assignment.isActive ?? true,
    notes: assignment.notes ?? null,
    isPrimary: assignment.isPrimary ?? true,
    assignmentType: assignment.assignmentType ?? "case_manager",
    assignedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  clientAssignments.push(newAssignment);
  return newAssignment;
};

(storage as any).updateClientAssignment = async function (id: number, updates: Partial<InsertClientAssignment>): Promise<ClientAssignment> {
  const index = clientAssignments.findIndex(a => a.id === id);
  if (index === -1) throw new Error("Assignment not found");
  clientAssignments[index] = { ...clientAssignments[index], ...updates, updatedAt: new Date() };
  return clientAssignments[index];
};

(storage as any).deleteClientAssignment = async function (id: number): Promise<void> {
  clientAssignments = clientAssignments.filter(a => a.id !== id);
};

// Tasks
(storage as any).getAllTasks = async function (): Promise<Task[]> {
  return tasks;
};

(storage as any).getTasksByStaff = async function (staffId: number): Promise<Task[]> {
  return tasks.filter(t => t.assignedTo === staffId);
};

(storage as any).getTasksByClient = async function (clientId: number): Promise<Task[]> {
  return tasks.filter(t => t.clientId === clientId);
};

(storage as any).getPendingTasksByStaff = async function (staffId: number): Promise<Task[]> {
  return tasks.filter(t => t.assignedTo === staffId && (t.status === "pending" || t.status === "in_progress"));
};

(storage as any).createTask = async function (task: InsertTask): Promise<Task> {
  const newTask: Task = {
    id: nextId++,
    ...task,
    clientId: task.clientId ?? null,
    description: task.description ?? null,
    dueDate: task.dueDate ?? null,
    notes: task.notes ?? null,
    metadata: task.metadata ?? null,
    status: task.status ?? "pending",
    priority: task.priority ?? "medium",
    completedAt: null,
    completedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  tasks.push(newTask);
  return newTask;
};

(storage as any).updateTask = async function (id: number, updates: Partial<InsertTask>): Promise<Task> {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) throw new Error("Task not found");
  tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date() };
  return tasks[index];
};

(storage as any).completeTask = async function (id: number, completedBy: string, notes?: string): Promise<Task> {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) throw new Error("Task not found");
  tasks[index] = {
    ...tasks[index],
    status: "completed",
    completedAt: new Date(),
    completedBy,
    notes: notes || tasks[index].notes,
    updatedAt: new Date(),
  };
  return tasks[index];
};

(storage as any).deleteTask = async function (id: number): Promise<void> {
  tasks = tasks.filter(t => t.id !== id);
};

// Activity Logs
(storage as any).getActivityLogs = async function (limit: number): Promise<ActivityLog[]> {
  return activityLogs.slice(-limit);
};

(storage as any).getActivityLogsByClient = async function (clientId: number): Promise<ActivityLog[]> {
  return activityLogs.filter(l => l.clientId === clientId);
};

(storage as any).getActivityLogsByUser = async function (userId: string): Promise<ActivityLog[]> {
  return activityLogs.filter(l => l.userId === userId);
};

(storage as any).createActivityLog = async function (log: InsertActivityLog): Promise<ActivityLog> {
  const newLog: ActivityLog = {
    id: nextId++,
    ...log,
    clientId: log.clientId ?? null,
    entityType: log.entityType ?? null,
    entityId: log.entityId ?? null,
    metadata: log.metadata ?? null,
    ipAddress: log.ipAddress ?? null,
    userAgent: log.userAgent ?? null,
    createdAt: new Date(),
  };
  activityLogs.push(newLog);
  return newLog;
};

// Client Notes
(storage as any).getClientNotes = async function (clientId: number): Promise<ClientNote[]> {
  return clientNotes.filter(n => n.clientId === clientId).sort((a: ClientNote, b: ClientNote) => {
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    return timeB - timeA;
  });
};

(storage as any).createClientNote = async function (note: InsertClientNote): Promise<ClientNote> {
  const newNote: ClientNote = {
    id: nextId++,
    ...note,
    title: note.title ?? null,
    noteType: note.noteType ?? "general",
    isPinned: note.isPinned ?? false,
    isInternal: note.isInternal ?? true,
    mentionedUsers: note.mentionedUsers ?? null,
    visibility: note.visibility ?? "team",
    tags: note.tags ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  clientNotes.push(newNote);
  return newNote;
};

(storage as any).updateClientNote = async function (id: number, updates: Partial<InsertClientNote>): Promise<ClientNote> {
  const index = clientNotes.findIndex(n => n.id === id);
  if (index === -1) throw new Error("Note not found");
  clientNotes[index] = { ...clientNotes[index], ...updates, updatedAt: new Date() };
  return clientNotes[index];
};

(storage as any).deleteClientNote = async function (id: number): Promise<void> {
  clientNotes = clientNotes.filter(n => n.id !== id);
};

// Saved Filters
(storage as any).getSavedFiltersByUser = async function (userId: string): Promise<SavedFilter[]> {
  return savedFilters.filter(f => f.userId === userId);
};

(storage as any).createSavedFilter = async function (filter: InsertSavedFilter): Promise<SavedFilter> {
  const newFilter: SavedFilter = {
    id: nextId++,
    ...filter,
    filterType: filter.filterType ?? "client",
    isDefault: filter.isDefault ?? false,
    isShared: filter.isShared ?? false,
    sharedWith: filter.sharedWith ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  savedFilters.push(newFilter);
  return newFilter;
};

(storage as any).updateSavedFilter = async function (id: number, updates: Partial<InsertSavedFilter>): Promise<SavedFilter> {
  const index = savedFilters.findIndex(f => f.id === id);
  if (index === -1) throw new Error("Filter not found");
  savedFilters[index] = { ...savedFilters[index], ...updates, updatedAt: new Date() };
  return savedFilters[index];
};

(storage as any).deleteSavedFilter = async function (id: number): Promise<void> {
  savedFilters = savedFilters.filter(f => f.id !== id);
};

// Compliance Tracking
(storage as any).getComplianceTracking = async function (clientId: number): Promise<ComplianceTracking | undefined> {
  return complianceTracking.find(c => c.clientId === clientId);
};

(storage as any).upsertComplianceTracking = async function (tracking: InsertComplianceTracking): Promise<ComplianceTracking> {
  const index = complianceTracking.findIndex(c => c.clientId === tracking.clientId);
  
  if (index >= 0) {
    complianceTracking[index] = {
      ...complianceTracking[index],
      ...tracking,
      updatedAt: new Date(),
    };
    return complianceTracking[index];
  } else {
    const newTracking: ComplianceTracking = {
      id: nextId++,
      ...tracking,
      complianceScore: tracking.complianceScore ?? 100,
      checkInStreak: tracking.checkInStreak ?? 0,
      totalCheckIns: tracking.totalCheckIns ?? 0,
      missedCheckIns: tracking.missedCheckIns ?? 0,
      courtAppearances: tracking.courtAppearances ?? 0,
      missedCourtDates: tracking.missedCourtDates ?? 0,
      onTimePayments: tracking.onTimePayments ?? 0,
      latePayments: tracking.latePayments ?? 0,
      totalPayments: tracking.totalPayments ?? 0,
      daysOnBail: tracking.daysOnBail ?? 0,
      lastCheckInDate: tracking.lastCheckInDate ?? null,
      nextCheckInDue: tracking.nextCheckInDue ?? null,
      complianceStatus: tracking.complianceStatus ?? "good",
      riskLevel: tracking.riskLevel ?? "medium",
      lastCalculated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    complianceTracking.push(newTracking);
    return newTracking;
  }
};

(storage as any).recalculateComplianceScore = async function (clientId: number): Promise<ComplianceTracking> {
  // Simplified calculation - should be more sophisticated in production
  const tracking = await (storage as any).getComplianceTracking(clientId);
  
  if (!tracking) {
    return await (storage as any).upsertComplianceTracking({ clientId });
  }
  
  // Calculate score based on metrics
  let score = 100;
  if (tracking.missedCheckIns > 0) score -= tracking.missedCheckIns * 10;
  if (tracking.missedCourtDates > 0) score -= tracking.missedCourtDates * 20;
  if (tracking.latePayments > 0) score -= tracking.latePayments * 5;
  score = Math.max(0, Math.min(100, score));
  
  const status = score >= 90 ? "excellent" : score >= 70 ? "good" : score >= 50 ? "warning" : "critical";
  
  return await (storage as any).upsertComplianceTracking({
    ...tracking,
    complianceScore: score,
    complianceStatus: status,
    lastCalculated: new Date(),
  });
};

// Shift Handoffs
(storage as any).getAllShiftHandoffs = async function (): Promise<ShiftHandoff[]> {
  return shiftHandoffs;
};

(storage as any).getShiftHandoffsForStaff = async function (staffId: number): Promise<ShiftHandoff[]> {
  return shiftHandoffs.filter(h => h.toStaffId === staffId);
};

(storage as any).getUnacknowledgedHandoffs = async function (): Promise<ShiftHandoff[]> {
  return shiftHandoffs.filter(h => !h.acknowledged);
};

(storage as any).getUnacknowledgedHandoffsForStaff = async function (staffId: number): Promise<ShiftHandoff[]> {
  return shiftHandoffs.filter(h => h.toStaffId === staffId && !h.acknowledged);
};

(storage as any).createShiftHandoff = async function (handoff: InsertShiftHandoff): Promise<ShiftHandoff> {
  const newHandoff: ShiftHandoff = {
    id: nextId++,
    ...handoff,
    clientId: handoff.clientId ?? null,
    toStaffId: handoff.toStaffId ?? null,
    handoffType: handoff.handoffType ?? "shift",
    priority: handoff.priority ?? "normal",
    actionRequired: handoff.actionRequired ?? false,
    actionItems: handoff.actionItems ?? null,
    acknowledged: false,
    acknowledgedAt: null,
    acknowledgedBy: null,
    shiftDate: handoff.shiftDate ?? new Date(),
    createdAt: new Date(),
  };
  shiftHandoffs.push(newHandoff);
  return newHandoff;
};

(storage as any).acknowledgeShiftHandoff = async function (id: number, acknowledgedBy: string): Promise<ShiftHandoff> {
  const index = shiftHandoffs.findIndex(h => h.id === id);
  if (index === -1) throw new Error("Handoff not found");
  shiftHandoffs[index] = {
    ...shiftHandoffs[index],
    acknowledged: true,
    acknowledgedAt: new Date(),
    acknowledgedBy,
  };
  return shiftHandoffs[index];
};

// Dashboard Helpers
(storage as any).getClientsWithAssignments = async function (): Promise<any[]> {
  const clients = await storage.getAllClients();
  const assignmentsPromises = clients.map(async (client: any) => {
    const assignments = await (storage as any).getAssignmentsByClient(client.id);
    return {
      ...client,
      assignments,
      assignedStaff: assignments.filter((a: ClientAssignment) => a.isActive).length,
    };
  });
  return await Promise.all(assignmentsPromises);
};

export { storage };
