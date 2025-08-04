#!/usr/bin/env tsx

import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface InstallOptions {
  targetPath?: string;
  overwrite?: boolean;
}

class NotificationInstaller {
  private sourceDir: string;
  private targetDir: string;

  constructor(targetPath?: string) {
    this.sourceDir = __dirname;
    this.targetDir = targetPath || join(process.cwd(), '.claude', 'hooks', 'notifications');
  }

  install(options: InstallOptions = {}): void {
    console.log('🚀 Installing Claude Code Notification System...\n');

    // Check if target exists
    if (existsSync(this.targetDir) && !options.overwrite) {
      console.error('❌ Installation directory already exists!');
      console.error(`   Path: ${this.targetDir}`);
      console.error('   Use --overwrite flag to replace existing installation');
      process.exit(1);
    }

    try {
      // Create directory structure
      this.createDirectories();
      
      // Copy files
      this.copyFiles();
      
      // Update paths in config if needed
      this.updateConfig();
      
      // Show installation instructions
      this.showInstructions();
      
      console.log('\n✅ Installation completed successfully!');
    } catch (error) {
      console.error('\n❌ Installation failed:', error);
      process.exit(1);
    }
  }

  private createDirectories(): void {
    console.log('📁 Creating directory structure...');
    
    const dirs = [
      this.targetDir,
      join(this.targetDir, 'notifiers'),
      join(this.targetDir, 'assets'),
      join(this.targetDir, 'assets', 'sounds'),
      join(this.targetDir, 'assets', 'icons')
    ];

    dirs.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  private copyFiles(): void {
    console.log('📄 Copying notification files...');

    const files = [
      'handler.ts',
      'config.json',
      'notifiers/base.ts',
      'notifiers/audio.ts',
      'notifiers/desktop.ts',
      'notifiers/discord.ts',
      'notifiers/email.ts',
      'notifiers/telegram.ts'
    ];

    files.forEach(file => {
      const src = join(this.sourceDir, file);
      const dest = join(this.targetDir, file);
      
      if (existsSync(src)) {
        copyFileSync(src, dest);
        console.log(`   ✓ ${file}`);
      }
    });

    // Copy assets
    console.log('🎵 Copying sound files...');
    this.copyDirectory(
      join(this.sourceDir, 'assets', 'sounds'),
      join(this.targetDir, 'assets', 'sounds')
    );

    console.log('🖼️  Copying icon files...');
    this.copyDirectory(
      join(this.sourceDir, 'assets', 'icons'),
      join(this.targetDir, 'assets', 'icons')
    );
  }

  private copyDirectory(src: string, dest: string): void {
    if (!existsSync(src)) return;

    const entries = execSync(`find "${src}" -type f`, { encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(Boolean);

    entries.forEach(entry => {
      const relativePath = entry.replace(src, '');
      const destPath = join(dest, relativePath);
      const destDir = dirname(destPath);

      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }

      copyFileSync(entry, destPath);
    });
  }

  private updateConfig(): void {
    console.log('⚙️  Updating configuration...');
    
    // Update config.json with correct paths if needed
    const configPath = join(this.targetDir, 'config.json');
    if (existsSync(configPath)) {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));
      
      // Ensure all notification types have correct default states
      if (!config.audio) config.audio = { enabled: true };
      if (!config.desktop) config.desktop = { enabled: true };
      if (!config.discord) config.discord = { enabled: false };
      if (!config.email) config.email = { enabled: false };
      if (!config.telegram) config.telegram = { enabled: false };
      
      writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
  }

  private showInstructions(): void {
    console.log('\n📋 Installation Instructions:');
    console.log('═══════════════════════════════\n');
    
    console.log('1. Update your .claude/settings.json to use the unified handler:');
    console.log('   ```json');
    console.log('   {');
    console.log('     "hooks": {');
    console.log('       "Stop": [{');
    console.log('         "matcher": "*",');
    console.log('         "hooks": [{');
    console.log('           "type": "command",');
    console.log(`           "command": "npx tsx ${join(this.targetDir, 'handler.ts')}"`);
    console.log('         }]');
    console.log('       }],');
    console.log('       "Notification": [{');
    console.log('         "matcher": "*",');
    console.log('         "hooks": [{');
    console.log('           "type": "command",');
    console.log(`           "command": "npx tsx ${join(this.targetDir, 'handler.ts')}"`);
    console.log('         }]');
    console.log('       }]');
    console.log('     }');
    console.log('   }');
    console.log('   ```\n');
    
    console.log('2. Configure notifications in config.json:');
    console.log(`   Path: ${join(this.targetDir, 'config.json')}\n`);
    
    console.log('3. Add credentials to your .env file:');
    console.log('   - Discord: DISCORD_WEBHOOK_URL');
    console.log('   - Email: EMAIL_SMTP_USER, EMAIL_SMTP_PASS');
    console.log('   - Telegram: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID\n');
    
    console.log('4. Test your notifications:');
    console.log('   Run: npm test');
  }
}

// Main execution
const args = process.argv.slice(2);
const targetPath = args.find(arg => !arg.startsWith('--'));
const overwrite = args.includes('--overwrite');

const installer = new NotificationInstaller(targetPath);
installer.install({ overwrite });