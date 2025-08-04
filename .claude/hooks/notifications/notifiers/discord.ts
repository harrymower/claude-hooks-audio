import { BaseNotifier, NotificationContext } from './base.js';
import https from 'https';
import { URL } from 'url';
import { basename } from 'path';

interface DiscordConfig {
  enabled: boolean;
  webhookUrl: string;
  username?: string;
  avatarUrl?: string;
  discordMapping: {
    stop?: EmbedConfig;
    notification?: {
      permission_required?: EmbedConfig;
      default?: EmbedConfig;
    };
    pre_tool_use?: {
      [tool: string]: EmbedConfig;
    };
  };
}

interface EmbedConfig {
  title: string;
  description: string;
  color: number;
  priority: 'high' | 'medium' | 'low';
}

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  timestamp?: string;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  footer?: { text: string };
}

export class DiscordNotifier extends BaseNotifier {
  constructor(config: DiscordConfig) {
    super('Discord', config);
  }

  async notify(context: NotificationContext): Promise<void> {
    if (!this.isEnabled()) return;

    const config = this.config as DiscordConfig;
    const webhookUrl = config.webhookUrl || process.env.DISCORD_WEBHOOK_URL;
    
    if (!webhookUrl) {
      this.log('Discord webhook URL not configured');
      return;
    }

    const embedConfig = this.getEmbedForEvent(context.event, config.discordMapping);
    if (!embedConfig) return;

    const embed = this.createEmbed(embedConfig, context.event);
    await this.sendWebhook(webhookUrl, embed, config);
  }

  private getEmbedForEvent(event: any, mapping: any): EmbedConfig | null {
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

  private createEmbed(config: EmbedConfig, event: any): DiscordEmbed {
    const embed: DiscordEmbed = {
      title: config.title,
      description: config.description,
      color: config.color,
      timestamp: new Date().toISOString(),
    };

    if (event.hook_event_name === 'pre_tool_use' && event.tool_input?.file_path) {
      embed.fields = [{
        name: 'File',
        value: `\`${basename(event.tool_input.file_path)}\``,
        inline: true
      }];
    }

    if (event.notification?.message) {
      embed.fields = embed.fields || [];
      embed.fields.push({
        name: 'Message',
        value: event.notification.message
      });
    }

    embed.footer = {
      text: `Session: ${event.session_id || 'unknown'}`
    };

    return embed;
  }

  private async sendWebhook(webhookUrl: string, embed: DiscordEmbed, config: DiscordConfig): Promise<void> {
    const data = JSON.stringify({
      username: config.username || 'Claude Code',
      avatar_url: config.avatarUrl,
      embeds: [embed]
    });

    const url = new URL(webhookUrl);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
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
            reject(new Error(`Discord webhook failed: ${res.statusCode} - ${body}`));
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }
}