#!/usr/bin/env tsx

import { readFileSync, existsSync } from 'fs';
import { join, basename, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import https from 'https';
import { URL } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from project root
const projectRoot = resolve(__dirname, '../../..');
config({ path: join(projectRoot, '.env') });

interface TelegramMapping {
  stop?: TelegramConfig;
  notification?: {
    permission_required?: TelegramConfig;
    default?: TelegramConfig;
  };
  pre_tool_use?: {
    [tool: string]: TelegramConfig;
  };
}

interface TelegramConfig {
  template: string;
  priority: 'high' | 'medium' | 'low';
  parse_mode?: 'Markdown' | 'HTML';
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

interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: 'Markdown' | 'HTML';
  disable_web_page_preview?: boolean;
}

class TelegramNotificationHandler {
  private telegramMapping: TelegramMapping;
  private botToken: string;
  private chatId: string;
  private enabled: boolean;

  constructor() {
    const mappingPath = join(__dirname, 'telegram-mapping.json');
    this.telegramMapping = this.loadTelegramMapping(mappingPath);
    
    // Load configuration from environment
    this.enabled = process.env.TELEGRAM_ENABLED === 'true';
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.chatId = process.env.TELEGRAM_CHAT_ID || '';
    
    // Validate configuration
    if (this.enabled && (!this.botToken || !this.chatId)) {
      console.error('[Telegram] Bot token or chat ID not configured');
      this.enabled = false;
    }
  }

  private loadTelegramMapping(path: string): TelegramMapping {
    try {
      if (existsSync(path)) {
        return JSON.parse(readFileSync(path, 'utf-8'));
      }
    } catch (error) {
      console.error('Error loading Telegram mapping:', error);
    }
    return {};
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

  private getTelegramConfig(event: HookEvent): TelegramConfig | undefined {
    const hookName = event.hook_event_name?.toLowerCase();
    
    switch (hookName) {
      case 'stop':
        return this.telegramMapping.stop;

      case 'notification':
        if (event.notification?.type === 'permission_required') {
          return this.telegramMapping.notification?.permission_required;
        }
        return this.telegramMapping.notification?.default;

      case 'pretooluse':
        if (event.tool_name && this.telegramMapping.pre_tool_use) {
          return this.telegramMapping.pre_tool_use[event.tool_name];
        }
        break;
    }
    
    return undefined;
  }

  private formatMessage(config: TelegramConfig, event: HookEvent): string {
    const projectName = event.cwd ? basename(event.cwd) : 'Claude Code';
    const activitySummary = event.session_id ? this.getActivitySummary(event.session_id) : '';
    const timestamp = new Date().toLocaleString();
    
    // Replace template variables
    let message = config.template
      .replace('[project-name]', projectName)
      .replace('[activity-summary]', activitySummary)
      .replace('[timestamp]', timestamp);
    
    // For permission required, add the requested action
    if (event.notification?.type === 'permission_required') {
      const action = event.notification.message || 'perform action';
      message = message.replace('[requested-action]', action);
    }
    
    return message;
  }

  private async sendTelegramMessage(message: TelegramMessage): Promise<void> {
    try {
      const apiUrl = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const url = new URL(apiUrl);
      const data = JSON.stringify(message);
      
      const options = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };
      
      return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let responseData = '';
          
          res.on('data', (chunk) => {
            responseData += chunk;
          });
          
          res.on('end', () => {
            try {
              const response = JSON.parse(responseData);
              if (response.ok) {
                console.log(`[Telegram] Message sent successfully: ${response.result.message_id}`);
                resolve();
              } else {
                console.error(`[Telegram] API Error: ${response.description}`);
                reject(new Error(`Telegram API error: ${response.description}`));
              }
            } catch (error) {
              console.error('[Telegram] Invalid response:', responseData);
              reject(new Error('Invalid response from Telegram API'));
            }
          });
        });
        
        req.on('error', (error) => {
          console.error('[Telegram] Request error:', error);
          reject(error);
        });
        
        req.write(data);
        req.end();
      });
    } catch (error) {
      console.error('[Telegram] Error sending message:', error);
      throw error;
    }
  }

  public async handleEvent(event: HookEvent): Promise<void> {
    // Check if Telegram is enabled
    if (!this.enabled) {
      console.log('[Telegram] Telegram notifications are disabled');
      return;
    }

    // Get Telegram configuration for this event
    const telegramConfig = this.getTelegramConfig(event);
    if (!telegramConfig) {
      console.log(`[Telegram] No Telegram config for event: ${event.hook_event_name}`);
      return;
    }

    // Check priority - only send high priority messages by default
    if (telegramConfig.priority !== 'high') {
      console.log(`[Telegram] Skipping ${telegramConfig.priority} priority message`);
      return;
    }

    // Format the message
    const messageText = this.formatMessage(telegramConfig, event);
    
    // Create Telegram message
    const message: TelegramMessage = {
      chat_id: this.chatId,
      text: messageText,
      disable_web_page_preview: true
    };
    
    // Add parse mode if specified
    if (telegramConfig.parse_mode) {
      message.parse_mode = telegramConfig.parse_mode;
    }
    
    // Send to Telegram
    try {
      await this.sendTelegramMessage(message);
    } catch (error) {
      // Error already logged in sendTelegramMessage
    }
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
    const handler = new TelegramNotificationHandler();
    await handler.handleEvent(event);
  } catch (error) {
    console.error('Error in Telegram notification handler:', error);
    process.exit(1);
  }
}

main();