#!/usr/bin/env tsx

import { readFileSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface SoundMapping {
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

class VoiceNotificationHandler {
  private soundMapping: SoundMapping;
  private voicePack: string;
  private soundsDir: string;

  constructor() {
    const mappingPath = join(__dirname, 'sound-mapping.json');
    this.soundMapping = this.loadSoundMapping(mappingPath);
    this.voicePack = process.env.VOICE_PACK || 'alfred';
    this.soundsDir = join(__dirname, 'sounds', this.voicePack);
  }

  private loadSoundMapping(path: string): SoundMapping {
    try {
      if (existsSync(path)) {
        return JSON.parse(readFileSync(path, 'utf-8'));
      }
    } catch (error) {
      console.error('Error loading sound mapping:', error);
    }
    return {};
  }

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private async playSound(soundFile: string): Promise<void> {
    const soundPath = join(this.soundsDir, soundFile);
    
    if (!existsSync(soundPath)) {
      console.log(`Sound file not found: ${soundPath}`);
      return;
    }

    try {
      // Cross-platform audio playback
      const platform = process.platform;
      let command: string;

      if (platform === 'win32') {
        // Windows: Use PowerShell
        command = `powershell -c "(New-Object Media.SoundPlayer '${soundPath}').PlaySync()"`;
      } else if (platform === 'darwin') {
        // macOS: Use afplay
        command = `afplay "${soundPath}"`;
      } else {
        // Linux: Try aplay or paplay
        command = `aplay "${soundPath}" 2>/dev/null || paplay "${soundPath}" 2>/dev/null || play "${soundPath}" 2>/dev/null`;
      }

      await execAsync(command);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  private getContextualSound(tool: string, params: any): string[] | undefined {
    const toolMapping = this.soundMapping.pre_tool_use?.[tool];
    
    if (!toolMapping) return undefined;
    
    if (Array.isArray(toolMapping)) {
      return toolMapping;
    }

    // Handle file-based operations
    if (params?.file_path || params?.path) {
      const filePath = params.file_path || params.path;
      const ext = extname(filePath).toLowerCase();
      const filename = basename(filePath).toLowerCase();

      // Check specific files
      if (toolMapping.files?.[filename]) {
        return toolMapping.files[filename];
      }

      // Check extensions
      if (toolMapping.extensions?.[ext]) {
        return toolMapping.extensions[ext];
      }
    }

    return toolMapping.default;
  }

  public async handleEvent(event: HookEvent): Promise<void> {
    let sounds: string[] | undefined;

    // Normalize the hook event name to lowercase for comparison
    const hookName = event.hook_event_name?.toLowerCase();
    
    switch (hookName) {
      case 'stop':
        sounds = this.soundMapping.stop;
        break;

      case 'notification':
        if (event.notification?.type === 'permission_required') {
          sounds = this.soundMapping.notification?.permission_required;
        } else {
          sounds = this.soundMapping.notification?.default;
        }
        break;

      case 'pretooluse':
        if (event.tool_name) {
          sounds = this.getContextualSound(event.tool_name, event.tool_input);
        }
        break;
    }

    if (sounds && sounds.length > 0) {
      const selectedSound = this.getRandomElement(sounds);
      await this.playSound(selectedSound);
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
    const handler = new VoiceNotificationHandler();
    await handler.handleEvent(event);
  } catch (error) {
    console.error('Error in voice notification handler:', error);
    process.exit(1);
  }
}

main();