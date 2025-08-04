#!/usr/bin/env tsx

import { readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

// Import notifiers
import { BaseNotifier, HookEvent, NotificationContext } from './notifiers/base.js';
import { AudioNotifier } from './notifiers/audio.js';
import { DesktopNotifier } from './notifiers/desktop.js';
import { DiscordNotifier } from './notifiers/discord.js';
import { EmailNotifier } from './notifiers/email.js';
import { TelegramNotifier } from './notifiers/telegram.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class UnifiedNotificationHandler {
  private notifiers: BaseNotifier[] = [];
  private projectRoot: string;
  private config: any;

  constructor() {
    this.projectRoot = resolve(__dirname, '../../..');
    
    // Load environment variables
    const envPath = join(this.projectRoot, '.env');
    console.error(`[UnifiedHandler] Loading .env from: ${envPath}`);
    // Force override existing env vars
    const result = dotenv.config({ path: envPath, override: true });
    if (result.error) {
      console.error(`[UnifiedHandler] Error loading .env: ${result.error}`);
    } else {
      console.error(`[UnifiedHandler] Loaded ${Object.keys(result.parsed || {}).length} env vars`);
    }
    
    // Load configuration
    this.loadConfig();
    
    // Initialize notifiers
    this.initializeNotifiers();
  }

  private loadConfig(): void {
    const configPath = join(__dirname, 'config.json');
    
    if (!existsSync(configPath)) {
      console.error('[UnifiedHandler] config.json not found');
      process.exit(1);
    }

    try {
      this.config = JSON.parse(readFileSync(configPath, 'utf-8'));
    } catch (error) {
      console.error('[UnifiedHandler] Failed to load config:', error);
      process.exit(1);
    }
  }

  private initializeNotifiers(): void {
    const assetsDir = join(__dirname, 'assets');

    // Initialize each notifier if enabled
    if (this.config.audio?.enabled) {
      this.notifiers.push(new AudioNotifier(this.config.audio, assetsDir));
    }

    if (this.config.desktop?.enabled) {
      this.notifiers.push(new DesktopNotifier(this.config.desktop, assetsDir));
    }

    if (this.config.discord?.enabled) {
      this.notifiers.push(new DiscordNotifier(this.config.discord));
    }

    if (this.config.email?.enabled) {
      this.notifiers.push(new EmailNotifier(this.config.email));
    }

    if (this.config.telegram?.enabled) {
      this.notifiers.push(new TelegramNotifier(this.config.telegram));
    }

    console.error(`[UnifiedHandler] Initialized ${this.notifiers.length} notifiers`);
  }

  async handle(event: HookEvent): Promise<void> {
    const context: NotificationContext = {
      event,
      config: this.config,
      projectRoot: this.projectRoot
    };

    // Run all notifiers in parallel
    const promises = this.notifiers.map(notifier => 
      notifier.notify(context).catch(error => {
        console.error(`[UnifiedHandler] Notifier failed:`, error);
      })
    );

    await Promise.all(promises);
  }
}

// Main execution
async function main() {
  const input = readFileSync(0, 'utf-8').trim();
  
  if (!input) {
    console.error('[UnifiedHandler] No input received');
    process.exit(1);
  }

  try {
    const event: HookEvent = JSON.parse(input);
    const handler = new UnifiedNotificationHandler();
    await handler.handle(event);
  } catch (error) {
    console.error('[UnifiedHandler] Error:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('[UnifiedHandler] Fatal error:', error);
  process.exit(1);
});