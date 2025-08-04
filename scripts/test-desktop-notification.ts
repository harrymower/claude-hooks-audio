import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testDesktopNotification() {
  console.log('Testing desktop notification...');
  
  // Test event for desktop notification
  const testEvent = {
    type: 'stop',
    reason: 'completed',
    timestamp: new Date().toISOString()
  };
  
  try {
    // Run the desktop notification handler
    const command = `echo ${JSON.stringify(JSON.stringify(testEvent))} | npx tsx .claude/hooks/desktop-notifications/handler.ts`;
    
    await execAsync(command, { shell: true, cwd: 'D:\\CodingProjects\\claude-hooks-audo' });
    console.log('✓ Desktop notification sent');
    console.log('You should see a notification popup on your screen!');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

testDesktopNotification().catch(console.error);