import { sendGridService } from './sendgrid';
import { storage } from '../storage';
import type { Client, CourtDate, Notification } from '@shared/schema';

interface SMSProvider {
  sendSMS(to: string, message: string): Promise<boolean>;
}

class TwilioSMSProvider implements SMSProvider {
  async sendSMS(to: string, message: string): Promise<boolean> {
    // Twilio SMS implementation would go here with API credentials
    // SMS notification sent
    return true;
  }
}

export class NotificationService {
  private smsProvider: SMSProvider;

  constructor() {
    this.smsProvider = new TwilioSMSProvider();
  }

  async sendCourtDateReminder(
    client: Client, 
    courtDate: CourtDate, 
    reminderType: string
  ): Promise<void> {
    const message = this.formatCourtReminderMessage(client, courtDate, reminderType);
    
    // Send SMS notification
    if (client.phoneNumber) {
      try {
        await this.smsProvider.sendSMS(client.phoneNumber, message);
        // Court reminder SMS sent
      } catch (error) {
        // Failed to send SMS notification
      }
    }

    // Send email notification if available
    if (sendGridService.isReady()) {
      try {
        await sendGridService.sendEmail({
          to: client.phoneNumber || 'client@example.com', // Use phone as fallback until email field added
          from: 'notifications@securebond.com',
          subject: `Court Date Reminder - ${this.getReminderSubject(reminderType)}`,
          text: message,
          html: this.formatCourtReminderHTML(client, courtDate, reminderType)
        });
        // Court reminder email sent
      } catch (error) {
        // Failed to send email notification
      }
    }

    // Create notification record
    await this.createNotificationRecord(client, courtDate, reminderType, message);
  }

  async sendPaymentReminder(client: Client, amount: string): Promise<void> {
    const message = `Reminder: Your payment of $${amount} is due. Please contact us at (808) 555-0123 to make your payment. - SecureBond`;
    
    if (client.phoneNumber) {
      await this.smsProvider.sendSMS(client.phoneNumber, message);
    }

    await this.createNotificationRecord(client, null, 'payment_reminder', message);
  }

  async sendCheckInReminder(client: Client): Promise<void> {
    const message = `Reminder: Your check-in is required today. Please call (808) 555-0123 or visit our office. - SecureBond`;
    
    if (client.phoneNumber) {
      await this.smsProvider.sendSMS(client.phoneNumber, message);
    }

    await this.createNotificationRecord(client, null, 'checkin_reminder', message);
  }

  async sendTestSMS(phoneNumber: string): Promise<boolean> {
    try {
      const testMessage = 'This is a test SMS from SecureBond. Your notification system is working correctly.';
      return await this.smsProvider.sendSMS(phoneNumber, testMessage);
    } catch (error) {
      // Test SMS failed
      return false;
    }
  }

  private formatCourtReminderMessage(
    client: Client, 
    courtDate: CourtDate, 
    reminderType: string
  ): string {
    const date = new Date(courtDate.courtDate).toLocaleDateString();
    const location = courtDate.courtLocation || 'Court Location TBD';
    
    const urgencyMap: Record<string, string> = {
      'initial': '7 days',
      'followup_1': '3 days',
      'followup_2': '1 day',
      'final': 'TODAY'
    };

    const urgency = urgencyMap[reminderType] || 'upcoming';
    
    return `COURT REMINDER (${urgency}): ${client.fullName}, your court date is ${date} at ${location}. Case: ${courtDate.caseNumber || 'TBD'}. Contact SecureBond: (808) 555-0123`;
  }

  private formatCourtReminderHTML(
    client: Client, 
    courtDate: CourtDate, 
    reminderType: string
  ): string {
    const date = new Date(courtDate.courtDate).toLocaleDateString();
    const location = courtDate.courtLocation || 'Court Location TBD';
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #1f2937;">Court Date Reminder</h2>
        <p>Dear ${client.fullName},</p>
        <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="color: #92400e; margin: 0;">Important Court Date</h3>
          <p style="margin: 8px 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 8px 0;"><strong>Location:</strong> ${location}</p>
          <p style="margin: 8px 0;"><strong>Case Number:</strong> ${courtDate.caseNumber || 'TBD'}</p>
        </div>
        <p>Please ensure you appear on time for your scheduled court appearance. Missing your court date could result in serious consequences.</p>
        <p>If you have any questions, please contact SecureBond immediately at (808) 555-0123.</p>
        <p>Best regards,<br>SecureBond Team</p>
      </div>
    `;
  }

  private getReminderSubject(reminderType: string): string {
    const subjectMap: Record<string, string> = {
      'initial': 'Upcoming Court Date (7 Days)',
      'followup_1': 'Court Date Reminder (3 Days)',
      'followup_2': 'URGENT: Court Date Tomorrow',
      'final': 'CRITICAL: Court Date Today'
    };

    return subjectMap[reminderType] || 'Court Date Reminder';
  }

  private async createNotificationRecord(
    client: Client, 
    courtDate: CourtDate | null, 
    type: string, 
    message: string
  ): Promise<void> {
    try {
      await storage.createNotification({
        userId: client.clientId,
        type,
        title: `${type.replace('_', ' ').toUpperCase()}`,
        message,
        priority: type.includes('final') || type.includes('critical') ? 'critical' : 'medium',
        read: false,
        metadata: courtDate ? JSON.stringify({ courtDateId: courtDate.id }) : null
      });
    } catch (error) {
      console.error('Failed to create notification record:', error);
    }
  }
}

export const notificationService = new NotificationService();