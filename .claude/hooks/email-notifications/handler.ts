#!/usr/bin/env tsx

import { readFileSync, existsSync } from 'fs';
import { join, basename, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import nodemailer from 'nodemailer';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from project root
const projectRoot = resolve(__dirname, '../../..');
config({ path: join(projectRoot, '.env') });

interface EmailMapping {
  stop?: EmailConfig;
  notification?: {
    permission_required?: EmailConfig;
    default?: EmailConfig;
  };
  pre_tool_use?: {
    [tool: string]: EmailConfig;
  };
}

interface EmailConfig {
  subject: string;
  template: string;
  priority: 'high' | 'medium' | 'low';
}

interface HookEvent {
  hook_event_name: string;
  session_id?: string;
  transcript_path?: string;
  cwd?: string;
  tool_name?: string;
  tool_input?: any;
  notification?: {
    type: string;
    message: string;
  };
}

class EmailNotificationHandler {
  private emailMapping: EmailMapping;
  private transporter: nodemailer.Transporter | null = null;
  private enabled: boolean;
  private fromEmail: string;
  private toEmail: string;

  constructor() {
    const mappingPath = join(__dirname, 'email-mapping.json');
    this.emailMapping = this.loadEmailMapping(mappingPath);
    
    // Load configuration from environment
    this.enabled = process.env.EMAIL_ENABLED === 'true';
    this.fromEmail = process.env.EMAIL_FROM || '';
    this.toEmail = process.env.EMAIL_TO || '';
    
    // Initialize nodemailer transporter
    if (this.enabled) {
      this.initializeTransporter();
    }
  }

  private loadEmailMapping(path: string): EmailMapping {
    try {
      if (existsSync(path)) {
        return JSON.parse(readFileSync(path, 'utf-8'));
      }
    } catch (error) {
      console.error('Error loading email mapping:', error);
    }
    return {};
  }

  private initializeTransporter(): void {
    try {
      const smtpHost = process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com';
      const smtpPort = parseInt(process.env.EMAIL_SMTP_PORT || '587', 10);
      const smtpUser = process.env.EMAIL_SMTP_USER || this.fromEmail;
      const smtpPass = process.env.EMAIL_SMTP_PASS || '';
      
      if (!smtpUser || !smtpPass) {
        console.error('[Email] SMTP credentials not configured');
        this.enabled = false;
        return;
      }
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: false, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
      
      console.log('[Email] Transporter initialized');
    } catch (error) {
      console.error('[Email] Error initializing transporter:', error);
      this.enabled = false;
    }
  }

  private getActivitySummary(sessionId: string): string {
    try {
      const activityLogPath = join(__dirname, '..', 'activity-log.json');
      if (existsSync(activityLogPath)) {
        const logData = JSON.parse(readFileSync(activityLogPath, 'utf-8'));
        const session = logData[sessionId];
        
        if (session && session.activities && session.activities.length > 0) {
          // Get last few activities
          const recent = session.activities.slice(-3);
          return recent.map(a => a.description).join(' → ');
        }
      }
    } catch (error) {
      // Silent fail
    }
    return "Task completed";
  }

  private getEmailConfig(event: HookEvent): EmailConfig | undefined {
    const hookName = event.hook_event_name?.toLowerCase();
    
    switch (hookName) {
      case 'stop':
        return this.emailMapping.stop;

      case 'notification':
        if (event.notification?.type === 'permission_required') {
          return this.emailMapping.notification?.permission_required;
        }
        return this.emailMapping.notification?.default;

      case 'pretooluse':
        if (event.tool_name && this.emailMapping.pre_tool_use) {
          return this.emailMapping.pre_tool_use[event.tool_name];
        }
        break;
    }
    
    return undefined;
  }

  private formatEmail(config: EmailConfig, event: HookEvent): { subject: string; html: string; text: string } {
    const projectName = event.cwd ? basename(event.cwd) : 'Claude Code';
    const activitySummary = event.session_id ? this.getActivitySummary(event.session_id) : '';
    const timestamp = new Date().toLocaleString();
    
    // Replace template variables in subject
    let subject = config.subject
      .replace('[project-name]', projectName)
      .replace('[activity-summary]', activitySummary);
    
    // Replace template variables in content
    let content = config.template
      .replace('[project-name]', projectName)
      .replace('[activity-summary]', activitySummary)
      .replace('[timestamp]', timestamp);
    
    // For permission required, add the requested action
    if (event.notification?.type === 'permission_required') {
      const action = event.notification.message || 'perform action';
      subject = subject.replace('[requested-action]', action);
      content = content.replace('[requested-action]', action);
    }
    
    // Create HTML version
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .content { padding: 20px; }
            .footer { font-size: 12px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
            .project { font-weight: bold; color: #2c3e50; }
            .timestamp { color: #7f8c8d; }
            pre { background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>🤖 Claude Code Notification</h2>
            <p class="timestamp">${timestamp}</p>
          </div>
          <div class="content">
            ${content.split('\n').map(line => `<p>${line}</p>`).join('')}
          </div>
          <div class="footer">
            <p>Sent from <span class="project">${projectName}</span></p>
            <p>Claude Code Notification System</p>
          </div>
        </body>
      </html>
    `;
    
    // Plain text version
    const text = `
Claude Code Notification

${content}

---
Sent from ${projectName}
${timestamp}
Claude Code Notification System
    `.trim();
    
    return { subject, html, text };
  }

  private async sendEmail(subject: string, html: string, text: string): Promise<void> {
    if (!this.transporter) {
      console.error('[Email] Transporter not initialized');
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"Claude Code" <${this.fromEmail}>`,
        to: this.toEmail,
        subject: subject,
        text: text,
        html: html
      });
      
      console.log(`[Email] Message sent: ${info.messageId}`);
    } catch (error) {
      console.error('[Email] Error sending email:', error);
    }
  }

  public async handleEvent(event: HookEvent): Promise<void> {
    // Check if email is enabled
    if (!this.enabled) {
      console.log('[Email] Email notifications are disabled');
      return;
    }

    // Get email configuration for this event
    const emailConfig = this.getEmailConfig(event);
    if (!emailConfig) {
      console.log(`[Email] No email config for event: ${event.hook_event_name}`);
      return;
    }

    // Check priority - only send high priority messages by default
    if (emailConfig.priority !== 'high') {
      console.log(`[Email] Skipping ${emailConfig.priority} priority message`);
      return;
    }

    // Format the email
    const { subject, html, text } = this.formatEmail(emailConfig, event);
    
    // Send email
    await this.sendEmail(subject, html, text);
  }
}

// Main execution
async function main() {
  try {
    const input = readFileSync(0, 'utf-8').trim();
    if (!input) {
      console.error('No input received');
      process.exit(1);
    }

    const event: HookEvent = JSON.parse(input);
    const handler = new EmailNotificationHandler();
    await handler.handleEvent(event);
  } catch (error) {
    console.error('Error in email notification handler:', error);
    process.exit(1);
  }
}

main();