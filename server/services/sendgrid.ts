import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set. Email functionality will be disabled.");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export class SendGridService {
  async sendEmail(params: EmailParams): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn("SendGrid API key not configured. Email not sent.");
      return false;
    }

    try {
      await mailService.send({
        to: params.to,
        from: params.from,
        subject: params.subject,
        text: params.text,
        html: params.html,
      });
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }

  async sendBulkEmails(emails: EmailParams[]): Promise<number> {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn("SendGrid API key not configured. Bulk emails not sent.");
      return 0;
    }

    let successCount = 0;
    for (const email of emails) {
      const success = await this.sendEmail(email);
      if (success) successCount++;
    }
    return successCount;
  }

  async sendCourtReminder(clientEmail: string, clientName: string, courtDate: Date, caseNumber?: string): Promise<boolean> {
    const subject = `Court Date Reminder - ${courtDate.toLocaleDateString()}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Court Date Reminder</h2>
        <p>Dear ${clientName},</p>
        <p>This is a reminder about your upcoming court date:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Date:</strong> ${courtDate.toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${courtDate.toLocaleTimeString()}</p>
          ${caseNumber ? `<p><strong>Case Number:</strong> ${caseNumber}</p>` : ''}
        </div>
        <p><strong>Important:</strong> Please ensure you appear at the scheduled time. Failure to appear may result in bond forfeiture.</p>
        <p>If you have any questions, please contact us immediately.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated reminder from Aloha Bail Bond.<br>
          Please do not reply to this email.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: clientEmail,
      from: 'noreply@alohabailbond.com',
      subject,
      html,
      text: `Court Date Reminder - ${clientName}, your court date is scheduled for ${courtDate.toLocaleDateString()} at ${courtDate.toLocaleTimeString()}. ${caseNumber ? `Case Number: ${caseNumber}. ` : ''}Please ensure you appear at the scheduled time.`
    });
  }

  async sendPaymentConfirmation(clientEmail: string, clientName: string, amount: string, paymentDate: Date): Promise<boolean> {
    const subject = `Payment Confirmation - $${amount}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Payment Confirmed</h2>
        <p>Dear ${clientName},</p>
        <p>We have successfully received and confirmed your payment:</p>
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <p><strong>Amount:</strong> $${amount}</p>
          <p><strong>Date:</strong> ${paymentDate.toLocaleDateString()}</p>
          <p><strong>Status:</strong> Confirmed</p>
        </div>
        <p>Thank you for your payment. Your account has been updated accordingly.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated confirmation from Aloha Bail Bond.<br>
          Please keep this email for your records.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: clientEmail,
      from: 'payments@alohabailbond.com',
      subject,
      html,
      text: `Payment Confirmation - ${clientName}, we have confirmed your payment of $${amount} received on ${paymentDate.toLocaleDateString()}. Thank you for your payment.`
    });
  }

  // Health check methods for monitoring
  isReady(): boolean {
    return !!process.env.SENDGRID_API_KEY;
  }

  async testConnection(): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      return false;
    }
    
    try {
      // Send a minimal test email to verify connection
      const testResult = await this.sendEmail({
        to: 'test@example.com',
        from: 'noreply@alohabailbond.com',
        subject: 'SendGrid Connection Test',
        text: 'This is a connection test.'
      });
      return testResult;
    } catch (error) {
      console.error('SendGrid connection test failed:', error);
      return false;
    }
  }
}

export const sendGridService = new SendGridService();