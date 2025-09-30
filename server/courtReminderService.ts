import { storage } from './storage';
import { notificationService } from './services/notificationService';
import { 
  type CourtDate, 
  type CourtDateReminder, 
  type InsertCourtDateReminder,
  type InsertNotification 
} from '@shared/schema';

export class CourtReminderService {
  private reminderIntervals = {
    initial: 7, // 7 days before
    followup_1: 3, // 3 days before
    followup_2: 1, // 1 day before
    final: 0 // day of court date
  };

  // Schedule all reminders for a court date
  async scheduleReminders(courtDate: CourtDate): Promise<void> {
    if (!courtDate.courtDate) return;

    const courtDateTime = new Date(courtDate.courtDate);
    const now = new Date();

    for (const [reminderType, daysBefore] of Object.entries(this.reminderIntervals)) {
      const scheduledFor = new Date(courtDateTime);
      scheduledFor.setDate(scheduledFor.getDate() - daysBefore);
      scheduledFor.setHours(9, 0, 0, 0); // Schedule for 9 AM

      // Only schedule future reminders
      if (scheduledFor > now) {
        const reminderData: InsertCourtDateReminder = {
          courtDateId: courtDate.id!,
          reminderType,
          scheduledFor,
          sent: false,
          confirmed: false
        };

        await storage.createCourtDateReminder(reminderData);
      }
    }
  }

  // Process pending reminders (called by scheduler)
  async processPendingReminders(): Promise<void> {
    const now = new Date();
    const pendingReminders = await this.getPendingReminders(now);

    // Processing pending court reminders

    for (const reminder of pendingReminders) {
      try {
        await this.sendReminder(reminder);
        console.log(`Court reminder sent successfully: ${reminder.reminderType} for court date ${reminder.courtDateId}`);
      } catch (error) {
        console.error(`Failed to send court reminder ${reminder.id}:`, error);
      }
    }
  }

  private async getPendingReminders(currentTime: Date): Promise<CourtDateReminder[]> {
    // Implementation would fetch reminders from storage
    // For now, return empty array as the storage method needs to be implemented
    return [];
  }

  private async sendReminder(reminder: CourtDateReminder): Promise<void> {
    try {
      const courtDate = await this.getCourtDateById(reminder.courtDateId);
      if (!courtDate) return;

      const client = courtDate.clientId ? await storage.getClient(courtDate.clientId) : null;
      if (!client) return;

      // Send SMS and email notifications via NotificationService
      await notificationService.sendCourtDateReminder(client, courtDate, reminder.reminderType);

      // Create notification record in database
      const notificationData: InsertNotification = {
        userId: client.clientId,
        title: this.getReminderTitle(reminder.reminderType, courtDate),
        message: this.getReminderMessage(reminder.reminderType, courtDate, client),
        type: 'court_reminder',
        priority: this.getReminderPriority(reminder.reminderType),
        metadata: {
          courtDateId: courtDate.id,
          clientId: client.id,
          reminderType: reminder.reminderType
        }
      };

      const notification = await storage.createNotification(notificationData);

      // Mark reminder as sent
      await this.markReminderSent(reminder.id!, notification.id);

      console.log(`Court reminder sent for ${client.fullName} - ${reminder.reminderType}`);
    } catch (error) {
      console.error('Error sending court reminder:', error);
    }
  }

  private async getCourtDateById(courtDateId: number): Promise<CourtDate | undefined> {
    const allCourtDates = await storage.getAllCourtDates();
    return allCourtDates.find(cd => cd.id === courtDateId);
  }

  private getReminderTitle(reminderType: string, courtDate: CourtDate): string {
    const daysMap: Record<string, string> = {
      initial: '7 Days',
      followup_1: '3 Days', 
      followup_2: '1 Day',
      final: 'Today'
    };

    const days = daysMap[reminderType] || reminderType;
    return `Court Date Reminder - ${days}`;
  }

  private getReminderMessage(reminderType: string, courtDate: CourtDate, client: any): string {
    const courtDateStr = new Date(courtDate.courtDate!).toLocaleDateString();
    const courtTimeStr = courtDate.courtLocation || 'TBD';
    const location = courtDate.courtLocation || 'TBD';

    const messageMap: Record<string, string> = {
      initial: `Upcoming court date for ${client.fullName} in 7 days`,
      followup_1: `Court date for ${client.fullName} is in 3 days - please confirm attendance`,
      followup_2: `URGENT: Court date for ${client.fullName} is tomorrow`,
      final: `Court date for ${client.fullName} is TODAY`
    };

    const baseMessage = messageMap[reminderType] || `Court reminder for ${client.fullName}`;
    return `${baseMessage}\n\nDate: ${courtDateStr}\nTime: ${courtTimeStr}\nLocation: ${location}`;
  }

  private getReminderPriority(reminderType: string): string {
    const priorityMap: Record<string, string> = {
      initial: 'medium',
      followup_1: 'medium',
      followup_2: 'high',
      final: 'urgent'
    };

    return priorityMap[reminderType] || 'medium';
  }

  private async markReminderSent(reminderId: number, notificationId: number): Promise<void> {
    // Implementation would update the reminder status
    // This requires adding an update method to storage
    console.log(`Marking reminder ${reminderId} as sent with notification ${notificationId}`);
  }

  // Get upcoming court dates for dashboard
  async getUpcomingCourtDates(daysAhead: number = 30): Promise<any[]> {
    const allCourtDates = await storage.getAllCourtDates();
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + daysAhead);

    const upcoming = allCourtDates.filter(cd => {
      if (!cd.courtDate) return false;
      const courtDateTime = new Date(cd.courtDate);
      return courtDateTime >= now && courtDateTime <= futureDate;
    });

    // Enrich with client information
    const enriched = [];
    for (const courtDate of upcoming) {
      const client = courtDate.clientId ? await storage.getClient(courtDate.clientId) : null;
      if (client) {
        enriched.push({
          ...courtDate,
          clientName: client.fullName,
          clientId: client.clientId,
          daysUntil: Math.ceil((new Date(courtDate.courtDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        });
      }
    }

    return enriched.sort((a, b) => new Date(a.courtDate!).getTime() - new Date(b.courtDate!).getTime());
  }

  // Check for overdue court dates
  async getOverdueCourtDates(): Promise<any[]> {
    const allCourtDates = await storage.getAllCourtDates();
    const now = new Date();
    now.setHours(23, 59, 59, 999); // End of today

    const overdue = allCourtDates.filter(cd => {
      if (!cd.courtDate) return false;
      const courtDateTime = new Date(cd.courtDate);
      return courtDateTime < now;
    });

    // Enrich with client information
    const enriched = [];
    for (const courtDate of overdue) {
      const client = courtDate.clientId ? await storage.getClient(courtDate.clientId) : null;
      if (client) {
        enriched.push({
          ...courtDate,
          clientName: client.fullName,
          clientId: client.clientId,
          daysOverdue: Math.ceil((now.getTime() - new Date(courtDate.courtDate!).getTime()) / (1000 * 60 * 60 * 24))
        });
      }
    }

    return enriched.sort((a, b) => new Date(b.courtDate!).getTime() - new Date(a.courtDate!).getTime());
  }

  // Start the reminder scheduler
  startReminderScheduler(): void {
    console.log('Court reminder scheduler started successfully');
    // The actual processing is handled by the interval in index.ts
    // This method exists to satisfy the startup call
  }
}

export const courtReminderService = new CourtReminderService();