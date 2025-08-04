import { execSync } from 'child_process';

console.log('🧪 Testing Claude Code Notification System\n');
console.log('🖥️  Desktop notifications will appear in your system notification area\n');
console.log('🔊 Voice notifications will play if audio files are present\n');

const tests = [
  {
    name: "Task Complete ✅",
    event: { hook_event_name: "Stop" },
    handlers: ['voice', 'push']
  },
  {
    name: "Permission Required ⚠️",
    event: { 
      hook_event_name: "Notification", 
      notification: { 
        type: "permission_required", 
        message: "Claude needs your permission to proceed" 
      }
    },
    handlers: ['voice', 'push']
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
        execSync(`echo '${json}' | tsx .claude/hooks/audio-notifications/handler.ts`, { 
          stdio: ['pipe', 'inherit', 'inherit'] 
        });
      }
      
      if (test.handlers.includes('push')) {
        console.log('  🖥️  Sending desktop notification...');
        execSync(`echo '${json}' | tsx .claude/hooks/desktop-notifications/handler.ts`, { 
          stdio: ['pipe', 'inherit', 'inherit'] 
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
  console.log('- Check your OS notification settings if you didn\'t see notifications');
}, delay + 1000);