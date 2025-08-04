import { BaseNotifier, NotificationContext } from './base.js';
import nodemailer from 'nodemailer';
import { basename } from 'path';

interface EmailConfig {
  enabled: boolean;
  from: string;
  to: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  emailMapping: {
    stop?: EmailTemplate;
    notification?: {
      permission_required?: EmailTemplate;
      default?: EmailTemplate;
    };
    pre_tool_use?: {
      [tool: string]: EmailTemplate;
    };
  };
}

interface EmailTemplate {
  subject: string;
  bodyHtml: string;
  priority: 'high' | 'medium' | 'low';
}

export class EmailNotifier extends BaseNotifier {
  private transporter: nodemailer.Transporter | null = null;

  constructor(config: EmailConfig) {
    super('Email', config);
  }

  async notify(context: NotificationContext): Promise<void> {
    if (!this.isEnabled()) return;

    const config = this.config as EmailConfig;
    const template = this.getTemplateForEvent(context.event, config.emailMapping);
    if (!template) return;

    try {
      await this.initTransporter(config);
      await this.sendEmail(template, context.event, config);
    } catch (error) {
      this.logError(`Failed to send email: ${error}`);
    }
  }

  private getTemplateForEvent(event: any, mapping: any): EmailTemplate | null {
    const eventName = event.hook_event_name?.toLowerCase();

    switch (eventName) {
      case 'stop':
        return mapping.stop || null;

      case 'notification':
        if (event.notification?.type === 'permission_required') {
          return mapping.notification?.permission_required || null;
        }
        return mapping.notification?.default || null;

      case 'pre_tool_use':
        const toolName = event.tool_name?.toLowerCase();
        return toolName && mapping.pre_tool_use?.[toolName] || null;

      default:
        return null;
    }
  }

  private async initTransporter(config: EmailConfig): Promise<void> {
    if (this.transporter) return;

    const smtpUser = config.smtpUser?.trim() || process.env.EMAIL_SMTP_USER;
    const smtpPass = config.smtpPass?.trim() || process.env.EMAIL_SMTP_PASS;
    

    if (!smtpUser || !smtpPass) {
      throw new Error('Email SMTP credentials not configured');
    }

    this.transporter = nodemailer.createTransport({
      host: config.smtpHost || 'smtp.gmail.com',
      port: config.smtpPort || 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
  }

  private async sendEmail(template: EmailTemplate, event: any, config: EmailConfig): Promise<void> {
    if (!this.transporter) return;

    const from = config.from || process.env.EMAIL_FROM;
    const to = config.to || process.env.EMAIL_TO;

    if (!from || !to) {
      throw new Error('Email from/to addresses not configured');
    }

    let html = template.bodyHtml;
    
    // Replace placeholders
    if (event.tool_name) {
      html = html.replace(/\{tool_name\}/g, event.tool_name);
    }
    if (event.tool_input?.file_path) {
      html = html.replace(/\{file_name\}/g, basename(event.tool_input.file_path));
    }
    if (event.notification?.message) {
      html = html.replace(/\{message\}/g, event.notification.message);
    }

    const mailOptions = {
      from,
      to,
      subject: template.subject,
      html,
      priority: template.priority as 'high' | 'low' | 'normal'
    };

    await this.transporter.sendMail(mailOptions);
  }
}