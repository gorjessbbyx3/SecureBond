import { MailService } from '@sendgrid/mail';

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: any;
}

export class SendGridService {
  private mailService: MailService;
  private isConfigured: boolean = false;

  constructor() {
    this.mailService = new MailService();
  }

  configure(apiKey: string): void {
    if (!apiKey || !apiKey.startsWith('SG.')) {
      throw new Error('Invalid SendGrid API key format');
    }
    
    this.mailService.setApiKey(apiKey);
    this.isConfigured = true;
  }

  isReady(): boolean {
    return this.isConfigured && !!process.env.SENDGRID_API_KEY;
  }

  async sendEmail(params: EmailParams): Promise<boolean> {
    if (!this.isReady()) {
      console.error('SendGrid not configured - email not sent');
      return false;
    }

    try {
      const emailData: any = {
        to: params.to,
        from: params.from,
        subject: params.subject,
      };

      if (params.templateId) {
        emailData.templateId = params.templateId;
        emailData.dynamicTemplateData = params.dynamicTemplateData || {};
      } else {
        emailData.text = params.text;
        emailData.html = params.html;
      }

      await this.mailService.send(emailData);
      console.log(`Email sent successfully to ${params.to}`);
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }

  async sendCourtReminder(clientEmail: string, clientName: string, courtDate: string, location: string): Promise<boolean> {
    if (!this.isReady()) {
      console.log('SendGrid not configured - court reminder not sent');
      return false;
    }

    return this.sendEmail({
      to: clientEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'alerts@yourdomain.com',
      subject: 'Court Date Reminder - Action Required',
      html: `
        <h2>Court Date Reminder</h2>
        <p>Dear ${clientName},</p>
        <p>This is a reminder that you have a court appearance scheduled:</p>
        <ul>
          <li><strong>Date:</strong> ${courtDate}</li>
          <li><strong>Location:</strong> ${location}</li>
        </ul>
        <p><strong>IMPORTANT:</strong> Failure to appear may result in a warrant for your arrest and forfeiture of your bond.</p>
        <p>Please contact us immediately if you have any questions or concerns.</p>
        <p>Best regards,<br>Your Bail Bond Team</p>
      `
    });
  }

  async sendEmergencyAlert(recipients: string[], message: string, alertType: string): Promise<boolean> {
    if (!this.isReady()) {
      console.log('SendGrid not configured - emergency alert not sent');
      return false;
    }

    const promises = recipients.map(email => 
      this.sendEmail({
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || 'alerts@yourdomain.com',
        subject: `URGENT: ${alertType} Alert`,
        html: `
          <h2 style="color: red;">EMERGENCY ALERT</h2>
          <p><strong>Alert Type:</strong> ${alertType}</p>
          <p><strong>Message:</strong> ${message}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p>This alert requires immediate attention. Please take appropriate action.</p>
        `
      })
    );

    const results = await Promise.all(promises);
    return results.every(result => result);
  }

  async testConnection(testEmail: string): Promise<{ success: boolean; message: string }> {
    if (!this.isReady()) {
      return {
        success: false,
        message: 'SendGrid API key not configured'
      };
    }

    try {
      const success = await this.sendEmail({
        to: testEmail,
        from: process.env.SENDGRID_FROM_EMAIL || 'test@yourdomain.com',
        subject: 'SendGrid Test Email',
        text: 'This is a test email to verify SendGrid configuration.',
        html: '<p>This is a test email to verify SendGrid configuration.</p><p>If you receive this, your email system is working correctly.</p>'
      });

      return {
        success,
        message: success ? 'Test email sent successfully' : 'Failed to send test email'
      };
    } catch (error) {
      return {
        success: false,
        message: `SendGrid error: ${error}`
      };
    }
  }
}

// Global instance
export const sendGridService = new SendGridService();

// Initialize with environment variable if available
if (process.env.SENDGRID_API_KEY) {
  sendGridService.configure(process.env.SENDGRID_API_KEY);
}