import { BaseNotifier, NotificationContext } from './base.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { existsSync } from 'fs';
import notifier from 'node-notifier';

const execAsync = promisify(exec);

interface DesktopConfig {
  enabled: boolean;
  notificationMapping: {
    stop?: NotificationConfig;
    notification?: {
      permission_required?: NotificationConfig;
      default?: NotificationConfig;
    };
    pre_tool_use?: {
      [tool: string]: NotificationConfig;
    };
  };
}

interface NotificationConfig {
  title: string;
  message: string;
  sound?: boolean;
}

export class DesktopNotifier extends BaseNotifier {
  private iconPath: string;

  constructor(config: DesktopConfig, assetsDir: string) {
    super('Desktop', config);
    // Use the product icon (exactly like the working version)
    const productIcon = 'D:\\CodingProjects\\claude-hooks-audo\\.product\\claude-icon-8x.png';
    const fallbackIcon = join(assetsDir, 'icons', 'claude-icon.png');
    
    // Use product icon if it exists, otherwise fallback
    if (existsSync(productIcon)) {
      this.iconPath = productIcon;
    } else {
      this.iconPath = fallbackIcon;
    }
  }

  async notify(context: NotificationContext): Promise<void> {
    if (!this.isEnabled()) return;

    const { event } = context;
    const config = this.config as DesktopConfig;
    const notification = this.getNotificationForEvent(event, config.notificationMapping);
    
    if (!notification) return;

    await this.showNotification(notification);
  }

  private getNotificationForEvent(event: any, mapping: any): NotificationConfig | null {
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

  private async showNotification(config: NotificationConfig): Promise<void> {
    try {
      // Use node-notifier for cross-platform toast notifications
      
      // For Windows, we need to use the absolute path with proper formatting
      const notificationOptions: any = {
        title: config.title,
        message: config.message,
        sound: config.sound !== false,
        wait: false,
        timeout: 10,
        appName: 'Claude Hooks'  // This was the key to avoiding "SnoreToast" label!
      };
      
      // Add icon if it exists
      if (existsSync(this.iconPath)) {
        notificationOptions.icon = this.iconPath;
      }
      
      // Windows-specific options
      if (process.platform === 'win32') {
        // Ensure title is set to avoid "SnoreToast" default
        if (!notificationOptions.title || notificationOptions.title === '') {
          notificationOptions.title = 'Claude Hooks';
        }
      }
      
      // macOS-specific options
      if (process.platform === 'darwin') {
        notificationOptions.sound = config.sound !== false ? 'Ping' : false;
      }
      
      await new Promise<void>((resolve, reject) => {
        notifier.notify(notificationOptions, (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      
    } catch (error) {
      // Fallback to platform-specific methods if node-notifier fails
      this.logError(`node-notifier failed, trying fallback: ${error}`);
      
      const platform = process.platform;
      try {
        switch (platform) {
          case 'win32':
            await this.showWindowsNotification(config);
            break;
          case 'darwin':
            await this.showMacNotification(config);
            break;
          default:
            await this.showLinuxNotification(config);
        }
      } catch (fallbackError) {
        this.logError(`All notification methods failed: ${fallbackError}`);
      }
    }
  }


  private async showWindowsNotification(config: NotificationConfig): Promise<void> {
    const snoreToastPath = 'C:\\Program Files\\SnoreToast\\SnoreToast.exe';
    const useSnoreToast = existsSync(snoreToastPath);

    if (useSnoreToast) {
      const iconArg = existsSync(this.iconPath) ? `-p "${this.iconPath}"` : '';
      const soundArg = config.sound !== false ? '-s' : '-silent';
      const command = `"${snoreToastPath}" -t "${config.title}" -m "${config.message}" ${iconArg} ${soundArg} -appID "Claude Code"`;
      await execAsync(command);
    } else {
      try {
        // Try using Windows toast notification directly
        const { exec } = await import('child_process');
        const util = await import('util');
        const execPromise = util.promisify(exec);
        
        // Use msg command as a fallback - simpler and more reliable
        const title = config.title.replace(/['"]/g, '');
        const message = config.message.replace(/['"]/g, '');
        
        // Try msg command first (works on most Windows systems)
        try {
          await execPromise(`msg "%username%" /TIME:5 "${title}: ${message}"`);
        } catch {
          // If msg fails, try PowerShell with a simpler approach
          const escapedMessage = config.message.replace(/'/g, "''").replace(/"/g, '`"');
          const escapedTitle = config.title.replace(/'/g, "''").replace(/"/g, '`"');
          
          const ps1Script = `
[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms') | Out-Null
[System.Windows.Forms.MessageBox]::Show('${escapedMessage}', '${escapedTitle}', 'OK', 'Information')
          `.trim();
          
          await execPromise(`powershell -WindowStyle Hidden -Command "${ps1Script}"`);
        }
      } catch (error) {
        // Silent fail - notifications are non-critical
        this.logError(`Notification failed: ${error}`);
      }
    }
  }

  private async showMacNotification(config: NotificationConfig): Promise<void> {
    const soundArg = config.sound !== false ? 'sound name "Glass"' : '';
    const script = `display notification "${config.message}" with title "${config.title}" ${soundArg}`;
    await execAsync(`osascript -e '${script}'`);
  }

  private async showLinuxNotification(config: NotificationConfig): Promise<void> {
    const iconArg = existsSync(this.iconPath) ? `-i "${this.iconPath}"` : '';
    await execAsync(`notify-send "${config.title}" "${config.message}" ${iconArg}`);
  }
}