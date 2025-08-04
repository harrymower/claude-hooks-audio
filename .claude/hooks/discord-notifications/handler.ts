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

interface DiscordMapping {
  stop?: DiscordConfig;
  notification?: {
    permission_required?: DiscordConfig;
    default?: DiscordConfig;
  };
  pre_tool_use?: {
    [tool: string]: DiscordConfig;
  };
}

interface DiscordConfig {
  title: string;
  description: string;
  color: number; // Decimal color value
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

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
  };
  timestamp?: string;
}

interface DiscordWebhookPayload {
  username?: string;
  avatar_url?: string;
  embeds: DiscordEmbed[];
}

class DiscordNotificationHandler {
  private discordMapping: DiscordMapping;
  private webhookUrl: string;
  private enabled: boolean;
  private username: string;
  private avatarUrl?: string;

  constructor() {
    const mappingPath = join(__dirname, 'discord-mapping.json');
    this.discordMapping = this.loadDiscordMapping(mappingPath);
    
    // Load configuration from environment
    this.enabled = process.env.DISCORD_ENABLED === 'true';
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL || '';
    this.username = process.env.DISCORD_USERNAME || 'Claude Code';
    this.avatarUrl = process.env.DISCORD_AVATAR_URL;
    
    // Validate webhook URL
    if (this.enabled && !this.webhookUrl) {
      console.error('[Discord] Webhook URL not configured');
      this.enabled = false;
    }
  }

  private loadDiscordMapping(path: string): DiscordMapping {
    try {
      if (existsSync(path)) {
        return JSON.parse(readFileSync(path, 'utf-8'));
      }
    } catch (error) {
      console.error('Error loading Discord mapping:', error);
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

  private getDiscordConfig(event: HookEvent): DiscordConfig | undefined {
    const hookName = event.hook_event_name?.toLowerCase();
    
    switch (hookName) {
      case 'stop':
        return this.discordMapping.stop;

      case 'notification':
        if (event.notification?.type === 'permission_required') {
          return this.discordMapping.notification?.permission_required;
        }
        return this.discordMapping.notification?.default;

      case 'pretooluse':
        if (event.tool_name && this.discordMapping.pre_tool_use) {
          return this.discordMapping.pre_tool_use[event.tool_name];
        }
        break;
    }
    
    return undefined;
  }

  private formatEmbed(config: DiscordConfig, event: HookEvent): DiscordEmbed {
    const projectName = event.cwd ? basename(event.cwd) : 'Claude Code';
    const activitySummary = event.session_id ? this.getActivitySummary(event.session_id) : '';
    
    // Replace template variables
    let description = config.description
      .replace('[project-name]', projectName)
      .replace('[activity-summary]', activitySummary);
    
    // For permission required, add the requested action
    if (event.notification?.type === 'permission_required') {
      const action = event.notification.message || 'perform action';
      description = description.replace('[requested-action]', action);
    }
    
    const embed: DiscordEmbed = {
      title: config.title,
      description: description,
      color: config.color,
      timestamp: new Date().toISOString(),
      footer: {
        text: `Claude Code • ${projectName}`
      }
    };
    
    // Add fields for additional context
    if (event.tool_name) {
      embed.fields = [{
        name: 'Tool',
        value: event.tool_name,
        inline: true
      }];
    }
    
    return embed;
  }

  private async sendWebhook(payload: DiscordWebhookPayload): Promise<void> {
    try {
      const url = new URL(this.webhookUrl);
      const data = JSON.stringify(payload);
      
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
            if (res.statusCode === 204) {
              console.log('[Discord] Notification sent successfully');
              resolve();
            } else {
              console.error(`[Discord] Error: ${res.statusCode} - ${responseData}`);
              reject(new Error(`Discord API error: ${res.statusCode}`));
            }
          });
        });
        
        req.on('error', (error) => {
          console.error('[Discord] Request error:', error);
          reject(error);
        });
        
        req.write(data);
        req.end();
      });
    } catch (error) {
      console.error('[Discord] Error sending webhook:', error);
      throw error;
    }
  }

  public async handleEvent(event: HookEvent): Promise<void> {
    // Check if Discord is enabled
    if (!this.enabled) {
      console.log('[Discord] Discord notifications are disabled');
      return;
    }

    // Get Discord configuration for this event
    const discordConfig = this.getDiscordConfig(event);
    if (!discordConfig) {
      console.log(`[Discord] No Discord config for event: ${event.hook_event_name}`);
      return;
    }

    // Check priority - only send high priority messages by default
    if (discordConfig.priority !== 'high') {
      console.log(`[Discord] Skipping ${discordConfig.priority} priority message`);
      return;
    }

    // Format the embed
    const embed = this.formatEmbed(discordConfig, event);
    
    // Create webhook payload
    const payload: DiscordWebhookPayload = {
      username: this.username,
      embeds: [embed]
    };
    
    if (this.avatarUrl) {
      payload.avatar_url = this.avatarUrl;
    }
    
    // Send to Discord
    try {
      await this.sendWebhook(payload);
    } catch (error) {
      // Error already logged in sendWebhook
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
    const handler = new DiscordNotificationHandler();
    await handler.handleEvent(event);
  } catch (error) {
    console.error('Error in Discord notification handler:', error);
    process.exit(1);
  }
}

main();