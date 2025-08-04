#!/usr/bin/env tsx

import { readFileSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import notifier from 'node-notifier';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface NotificationMapping {
  stop?: NotificationConfig;
  notification?: {
    permission_required?: NotificationConfig;
    default?: NotificationConfig;
  };
  pre_tool_use?: {
    [tool: string]: NotificationConfig | {
      extensions?: { [ext: string]: NotificationConfig };
      files?: { [filename: string]: NotificationConfig };
      default?: NotificationConfig;
    };
  };
}

interface NotificationConfig {
  title: string;
  messages: string[];
  sound?: boolean;
  icon?: string;
  timeout?: number;
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

class DesktopNotificationHandler {
  private notificationMapping: NotificationMapping;
  private iconPath: string;

  constructor() {
    const mappingPath = join(__dirname, 'notification-mapping.json');
    this.notificationMapping = this.loadNotificationMapping(mappingPath);
    
    // Use the product icon
    const productIcon = 'D:\\CodingProjects\\claude-hooks-audo\\.product\\claude-icon-8x.png';
    const fallbackIcon = join(__dirname, 'claude-icon.png');
    
    // Use product icon if it exists, otherwise fallback
    if (existsSync(productIcon)) {
      this.iconPath = productIcon;
    } else {
      this.iconPath = fallbackIcon;
    }
  }

  private getActivitySummary(sessionId: string): string {
    try {
      const activityLogPath = join(__dirname, '..', 'activity-log.json');
      if (existsSync(activityLogPath)) {
        const logData = JSON.parse(readFileSync(activityLogPath, 'utf-8'));
        const session = logData[sessionId];
        
        if (session && session.activities && session.activities.length > 0) {
          // Get the last few activities
          const recent = session.activities.slice(-3);
          
          // If only one activity, use its description directly
          if (recent.length === 1) {
            return recent[0].description || "Task Complete";
          }
          
          // Just use the most recent activity's description
          // This is simpler and more accurate than trying to group activities
          return recent[recent.length - 1].description || "Task Complete";
        }
      }
    } catch (error) {
      // Silent fail
    }
    return "Task Complete";
  }

  private loadNotificationMapping(path: string): NotificationMapping {
    try {
      if (existsSync(path)) {
        return JSON.parse(readFileSync(path, 'utf-8'));
      }
    } catch (error) {
      console.error('Error loading notification mapping:', error);
    }
    return {};
  }

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private async sendDesktopNotification(config: NotificationConfig, event: HookEvent): Promise<void> {
    let message = this.getRandomElement(config.messages);
    let title = config.title;
    
    // Extract project name from current working directory
    const projectName = event.cwd ? path.basename(event.cwd) : 'Claude Code';
    
    // For Stop events, add activity context
    if (event.hook_event_name?.toLowerCase() === 'stop') {
      const activitySummary = this.getActivitySummary(event.session_id || '');
      title = activitySummary + ' ✅';
    }
    
    const notificationOptions: notifier.Notification = {
      title: title,
      message: message,
      sound: config.sound !== false, // Default to true
      timeout: config.timeout || 10, // Default 10 seconds
      appName: 'Claude Hooks', // Override the app name to avoid "SnoreToast"
    };

    // Add icon if it exists
    if (existsSync(this.iconPath)) {
      notificationOptions.icon = this.iconPath;
    }

    // Windows-specific options
    if (process.platform === 'win32') {
      // Set a title to avoid "SnoreToast" default
      // Not using appID to avoid duplicate notifications
      if (!notificationOptions.title || notificationOptions.title === '') {
        notificationOptions.title = 'Claude Hooks';
      }
    }

    // macOS-specific options
    if (process.platform === 'darwin') {
      notificationOptions.sound = config.sound !== false ? 'Ping' : false;
    }

    notifier.notify(notificationOptions, (err, response) => {
      if (err) {
        console.error('Error sending desktop notification:', err);
      }
    });
  }

  private getContextualNotification(tool: string, params: any): NotificationConfig | undefined {
    const toolMapping = this.notificationMapping.pre_tool_use?.[tool];
    
    if (!toolMapping) return undefined;
    
    if ('title' in toolMapping && 'messages' in toolMapping) {
      return toolMapping as NotificationConfig;
    }

    // Handle file-based operations
    if (params?.file_path || params?.path) {
      const filePath = params.file_path || params.path;
      const ext = extname(filePath).toLowerCase();
      const filename = basename(filePath).toLowerCase();

      // Check specific files
      if ('files' in toolMapping && toolMapping.files?.[filename]) {
        return toolMapping.files[filename];
      }

      // Check extensions
      if ('extensions' in toolMapping && toolMapping.extensions?.[ext]) {
        return toolMapping.extensions[ext];
      }
    }

    return 'default' in toolMapping ? toolMapping.default : undefined;
  }

  public async handleEvent(event: HookEvent): Promise<void> {
    let notificationConfig: NotificationConfig | undefined;

    // Normalize the hook event name to lowercase for comparison
    const hookName = event.hook_event_name?.toLowerCase();
    
    switch (hookName) {
      case 'stop':
        notificationConfig = this.notificationMapping.stop;
        break;

      case 'notification':
        if (event.notification?.type === 'permission_required') {
          notificationConfig = this.notificationMapping.notification?.permission_required;
        } else {
          notificationConfig = this.notificationMapping.notification?.default;
        }
        break;

      case 'pretooluse':
        if (event.tool_name) {
          notificationConfig = this.getContextualNotification(event.tool_name, event.tool_input);
        }
        break;
    }

    if (notificationConfig) {
      await this.sendDesktopNotification(notificationConfig, event);
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
    const handler = new DesktopNotificationHandler();
    await handler.handleEvent(event);
  } catch (error) {
    console.error('Error in desktop notification handler:', error);
    process.exit(1);
  }
}

main();