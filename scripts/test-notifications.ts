import { spawn } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test events that would trigger notifications
const testEvents = [
  {
    type: 'stop',
    description: 'Task completion notification',
    event: {
      type: 'stop',
      reason: 'completed',
      timestamp: new Date().toISOString()
    }
  },
  {
    type: 'pre_tool_use',
    description: 'Tool usage notification (Read)',
    event: {
      type: 'pre_tool_use',
      tool: 'Read',
      args: { file_path: 'test.ts' },
      timestamp: new Date().toISOString()
    }
  },
  {
    type: 'pre_tool_use',
    description: 'Tool usage notification (Edit)',
    event: {
      type: 'pre_tool_use',
      tool: 'Edit',
      args: { file_path: 'test.ts' },
      timestamp: new Date().toISOString()
    }
  },
  {
    type: 'notification',
    description: 'Alert notification',
    event: {
      type: 'notification',
      level: 'warning',
      message: 'Permission required',
      timestamp: new Date().toISOString()
    }
  },
  {
    type: 'notification',
    description: 'Error notification',
    event: {
      type: 'notification',
      level: 'error',
      message: 'An error occurred',
      timestamp: new Date().toISOString()
    }
  }
];

async function runTest(event: any, description: string): Promise<void> {
  return new Promise((resolve) => {
    console.log(`\nTesting: ${description}`);
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    
    const handlerPath = path.join(__dirname, '..', '.claude', 'hooks', 'audio-notifications', 'handler.ts');
    
    // Run the handler with the event
    const child = spawn('npx', ['tsx', handlerPath], {
      env: {
        ...process.env,
        VOICE_PACK: 'alfred'
      },
      shell: true
    });
    
    // Send event data to handler
    child.stdin.write(JSON.stringify(event));
    child.stdin.end();
    
    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      console.error(`Error: ${data}`);
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log('✓ Test passed');
        if (output) console.log(`Output: ${output.trim()}`);
      } else {
        console.log(`✗ Test failed with code ${code}`);
      }
      
      // Wait a bit between tests
      setTimeout(resolve, 1000);
    });
  });
}

async function testDirectPlayback() {
  console.log('\n=== Testing Direct Audio Playback ===');
  
  const soundsDir = path.join(__dirname, '..', '.claude', 'hooks', 'audio-notifications', 'sounds', 'alfred');
  const testSound = path.join(soundsDir, 'success.wav');
  
  console.log(`\nTesting direct playback of: ${testSound}`);
  
  // Try different audio players based on platform
  const platform = process.platform;
  let command: string;
  let args: string[];
  
  if (platform === 'win32') {
    // Windows: Use PowerShell
    command = 'powershell';
    args = ['-c', `(New-Object Media.SoundPlayer '${testSound}').PlaySync()`];
  } else if (platform === 'darwin') {
    // macOS
    command = 'afplay';
    args = [testSound];
  } else {
    // Linux
    command = 'aplay';
    args = [testSound];
  }
  
  return new Promise<void>((resolve) => {
    const player = spawn(command, args, { shell: true });
    
    player.on('close', (code) => {
      if (code === 0) {
        console.log('✓ Audio playback successful');
      } else {
        console.log(`✗ Audio playback failed with code ${code}`);
      }
      resolve();
    });
    
    player.on('error', (err) => {
      console.error(`Playback error: ${err.message}`);
      resolve();
    });
  });
}

async function main() {
  console.log('=== Claude Hooks Notification System Test ===');
  console.log('This will test all notification types and play sounds.\n');
  
  // First test direct audio playback
  await testDirectPlayback();
  
  // Then test the hook handlers
  console.log('\n=== Testing Hook Handlers ===');
  
  for (const test of testEvents) {
    await runTest(test.event, test.description);
  }
  
  console.log('\n=== Test Complete ===');
  console.log('\nIf you heard sounds for each test, the notification system is working correctly!');
  console.log('If not, check:');
  console.log('1. Your system audio is not muted');
  console.log('2. The appropriate audio player is installed (PowerShell on Windows)');
  console.log('3. The .wav files exist in the sounds directory');
}

main().catch(console.error);