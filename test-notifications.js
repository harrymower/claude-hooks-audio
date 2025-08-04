import { execSync } from 'child_process';
import { readFileSync } from 'fs';

// Load settings to get environment variables
const settings = JSON.parse(readFileSync('.claude/settings.json', 'utf-8'));
const testEnv = { ...process.env };
// Only add non-empty values from settings to avoid overriding .env file values with empty strings
for (const [key, value] of Object.entries(settings.env)) {
  if (value && value !== '') {
    testEnv[key] = value;
  }
}

console.log('🧪 Testing Claude Code Notification System\n');
console.log('🖥️  Desktop notifications will appear in your system notification area');
console.log('🔊 Voice notifications will play if audio files are present');
console.log('💬 Discord notifications will be sent if webhook configured');
console.log('📧 Email notifications will be sent if SMTP configured');
console.log('📱 Telegram notifications will be sent if bot configured\n');

const tests = [
  {
    name: "Task Complete ✅",
    event: { hook_event_name: "Stop", session_id: "test-123", cwd: process.cwd() },
    handlers: ['voice', 'push', 'discord', 'email', 'telegram']
  },
  {
    name: "Permission Required ⚠️",
    event: { 
      hook_event_name: "Notification", 
      notification: { 
        type: "permission_required", 
        message: "Claude needs your permission to proceed" 
      },
      cwd: process.cwd()
    },
    handlers: ['voice', 'push', 'discord', 'email', 'telegram']
  },
  {
    name: "Reading TypeScript File 📘",
    event: { 
      hook_event_name: "PreToolUse", 
      tool_name: "Read", 
      tool_input: { file_path: "app.ts" }
    },
    handlers: ['voice']
  },
  {
    name: "Editing Python File 🐍",
    event: { 
      hook_event_name: "PreToolUse", 
      tool_name: "Edit", 
      tool_input: { file_path: "main.py" }
    },
    handlers: ['voice']
  },
  {
    name: "Running Bash Command 💻",
    event: { 
      hook_event_name: "PreToolUse", 
      tool_name: "Bash", 
      tool_input: { command: "npm install" }
    },
    handlers: ['voice']
  }
];

let delay = 0;
tests.forEach((test, index) => {
  setTimeout(() => {
    console.log(`\n[${index + 1}/${tests.length}] Testing: ${test.name}`);
    const json = JSON.stringify(test.event);
    
    try {
      if (test.handlers.includes('voice')) {
        console.log('  🔊 Sending voice notification...');
        execSync(`tsx .claude/hooks/audio-notifications/handler.ts`, { 
          input: json,
          stdio: ['pipe', 'inherit', 'inherit'],
          env: testEnv
        });
      }
      
      if (test.handlers.includes('push')) {
        console.log('  🖥️  Sending desktop notification...');
        execSync(`tsx .claude/hooks/desktop-notifications/handler.ts`, { 
          input: json,
          stdio: ['pipe', 'inherit', 'inherit'],
          env: testEnv
        });
      }
      
      if (test.handlers.includes('discord')) {
        console.log('  💬 Sending Discord notification...');
        execSync(`npx tsx .claude/hooks/discord-notifications/handler.ts`, { 
          input: json,
          stdio: ['pipe', 'inherit', 'inherit'],
          env: testEnv
        });
      }
      
      if (test.handlers.includes('email')) {
        console.log('  📧 Sending email notification...');
        execSync(`npx tsx .claude/hooks/email-notifications/handler.ts`, { 
          input: json,
          stdio: ['pipe', 'inherit', 'inherit'],
          env: testEnv
        });
      }
      
      if (test.handlers.includes('telegram')) {
        console.log('  📱 Sending Telegram notification...');
        execSync(`npx tsx .claude/hooks/telegram-notifications/handler.ts`, { 
          input: json,
          stdio: ['pipe', 'inherit', 'inherit'],
          env: testEnv
        });
      }
      
      console.log('  ✓ Test completed');
    } catch (e) {
      console.error(`  ✗ Test failed: ${e.message}`);
    }
  }, delay);
  
  delay += 2000; // 2 second delay between tests
});

setTimeout(() => {
  console.log('\n✨ All tests completed!');
  console.log('\n💡 Tips:');
  console.log('- Desktop notifications should have appeared in your system notification area');
  console.log('- Add .wav files to .claude/hooks/audio-notifications/sounds/alfred/ for audio');
  console.log('- Discord/Email/Telegram are disabled by default - check console output');
  console.log('- To enable Discord: set DISCORD_ENABLED=true and add webhook URL in .env');
  console.log('- To enable Email: set EMAIL_ENABLED=true and add SMTP credentials in .env');
  console.log('- To enable Telegram: set TELEGRAM_ENABLED=true and add bot token/chat ID in .env');
  console.log('- Check your OS notification settings if you didn\'t see notifications');
}, delay + 1000);