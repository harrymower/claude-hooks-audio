import { BaseNotifier, NotificationContext } from './base.js';
import https from 'https';
import { basename } from 'path';

interface TelegramConfig {
  enabled: boolean;
  botToken?: string;
  chatId?: string;
  telegramMapping: {
    stop?: MessageConfig;
    notification?: {
      permission_required?: MessageConfig;
      default?: MessageConfig;
    };
    pre_tool_use?: {
      [tool: string]: MessageConfig;
    };
  };
}

interface MessageConfig {
  message: string;
  priority: 'high' | 'medium' | 'low';
  parseMode?: 'Markdown' | 'HTML';
}

export class TelegramNotifier extends BaseNotifier {
  constructor(config: TelegramConfig) {
    super('Telegram', config);
  }

  async notify(context: NotificationContext): Promise<void> {
    if (!this.isEnabled()) return;

    const config = this.config as TelegramConfig;
    const botToken = config.botToken?.trim() || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = config.chatId?.trim() || process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      this.log('Telegram bot token or chat ID not configured');
      return;
    }

    const messageConfig = this.getMessageForEvent(context.event, config.telegramMapping);
    if (!messageConfig) return;

    const message = this.formatMessage(messageConfig.message, context.event);
    await this.sendMessage(botToken, chatId, message, messageConfig.parseMode);
  }

  private getMessageForEvent(event: any, mapping: any): MessageConfig | null {
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

  private formatMessage(template: string, event: any): string {
    let message = template;

    // Replace placeholders
    if (event.tool_name) {
      message = message.replace(/\{tool_name\}/g, event.tool_name);
    }
    if (event.tool_input?.file_path) {
      message = message.replace(/\{file_name\}/g, basename(event.tool_input.file_path));
    }
    if (event.notification?.message) {
      message = message.replace(/\{message\}/g, event.notification.message);
    }
    if (event.session_id) {
      message = message.replace(/\{session_id\}/g, event.session_id);
    }

    return message;
  }

  private async sendMessage(botToken: string, chatId: string, text: string, parseMode?: string): Promise<void> {
    const data = JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode || 'Markdown'
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${botToken}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`Telegram API failed: ${res.statusCode} - ${body}`));
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }
}