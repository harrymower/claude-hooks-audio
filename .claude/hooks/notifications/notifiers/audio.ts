import { BaseNotifier, NotificationContext } from './base.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { join, extname, basename } from 'path';

const execAsync = promisify(exec);

interface AudioConfig {
  enabled: boolean;
  voicePack: string;
  soundMapping: {
    stop?: string[];
    notification?: {
      permission_required?: string[];
      default?: string[];
    };
    pre_tool_use?: {
      [tool: string]: string[] | {
        extensions?: { [ext: string]: string[] };
        files?: { [filename: string]: string[] };
        default?: string[];
      };
    };
  };
}

export class AudioNotifier extends BaseNotifier {
  private soundsDir: string;

  constructor(config: AudioConfig, assetsDir: string) {
    super('Audio', config);
    this.soundsDir = join(assetsDir, 'sounds');
  }

  async notify(context: NotificationContext): Promise<void> {
    if (!this.isEnabled()) {
      this.log('Audio notifier is disabled');
      return;
    }

    const { event } = context;
    const config = this.config as AudioConfig;
    
    this.log(`Processing event: ${event.hook_event_name}`);
    
    const sounds = this.getSoundsForEvent(event, config.soundMapping);
    
    if (sounds.length === 0) {
      this.log(`No sounds configured for event: ${event.hook_event_name}`);
      return;
    }

    const voicePack = config.voicePack || 'alfred';
    const voiceDir = join(this.soundsDir, voicePack);
    
    this.log(`Voice pack: ${voicePack}, Dir: ${voiceDir}`);
    
    if (!existsSync(voiceDir)) {
      this.log(`Voice pack '${voicePack}' not found at ${voiceDir}`);
      return;
    }

    for (const sound of sounds) {
      const soundPath = join(voiceDir, sound);
      this.log(`Attempting to play: ${soundPath}`);
      if (existsSync(soundPath)) {
        await this.playSound(soundPath);
      } else {
        this.log(`Sound file not found: ${soundPath}`);
      }
    }
  }

  private getSoundsForEvent(event: any, mapping: any): string[] {
    const eventName = event.hook_event_name?.toLowerCase();

    switch (eventName) {
      case 'stop':
        return mapping.stop || [];

      case 'notification':
        if (event.notification?.type === 'permission_required') {
          return mapping.notification?.permission_required || [];
        }
        return mapping.notification?.default || [];

      case 'pre_tool_use':
        return this.getToolUseSounds(event, mapping);

      default:
        return [];
    }
  }

  private getToolUseSounds(event: any, mapping: any): string[] {
    const toolName = event.tool_name?.toLowerCase();
    if (!toolName || !mapping.pre_tool_use) return [];

    const toolConfig = mapping.pre_tool_use[toolName];
    if (!toolConfig) return [];

    if (Array.isArray(toolConfig)) {
      return toolConfig;
    }

    const filePath = event.tool_input?.file_path || '';
    const ext = extname(filePath).toLowerCase();
    const filename = basename(filePath).toLowerCase();

    if (toolConfig.files?.[filename]) {
      return toolConfig.files[filename];
    }

    if (ext && toolConfig.extensions?.[ext]) {
      return toolConfig.extensions[ext];
    }

    return toolConfig.default || [];
  }

  private async playSound(soundPath: string): Promise<void> {
    try {
      if (process.platform === 'win32') {
        // For Windows, use spawn with detached process
        const { spawn } = await import('child_process');
        
        // Try multiple methods in order of preference
        try {
          // Method 1: Use PowerShell with proper escaping
          const ps1Command = `(New-Object System.Media.SoundPlayer '${soundPath.replace(/'/g, "''")}').PlaySync()`;
          const child = spawn('powershell', ['-NoProfile', '-Command', ps1Command], {
            detached: true,
            stdio: 'ignore',
            windowsHide: true
          });
          child.unref();
          this.log(`Playing sound with PowerShell: ${soundPath}`);
        } catch (e1) {
          // Method 2: Use start command as fallback
          try {
            const child = spawn('cmd', ['/c', 'start', '""', '/B', soundPath], {
              detached: true,
              stdio: 'ignore',
              windowsHide: true
            });
            child.unref();
            this.log(`Playing sound with start command: ${soundPath}`);
          } catch (e2) {
            this.logError(`All Windows audio methods failed: ${e2}`);
          }
        }
      } else {
        // For other platforms, use the existing command
        const command = this.getPlayCommand(soundPath);
        this.log(`Playing sound with command: ${command}`);
        await execAsync(command);
      }
      
      this.log(`Sound playback initiated: ${soundPath}`);
    } catch (error) {
      this.logError(`Failed to play sound: ${soundPath} - ${error}`);
    }
  }

  private getPlayCommand(soundPath: string): string {
    const platform = process.platform;
    
    switch (platform) {
      case 'win32':
        // Use 'start' command to play the wav file with the default application
        // This is the most reliable method on Windows
        return `cmd /c start "" "${soundPath}"`;
      case 'darwin':
        return `afplay "${soundPath}"`;
      default:
        return `aplay "${soundPath}" 2>/dev/null || paplay "${soundPath}" 2>/dev/null || ffplay -nodisp -autoexit "${soundPath}" 2>/dev/null`;
    }
  }
}