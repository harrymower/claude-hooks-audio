import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function playSound(soundFile: string) {
  const soundPath = path.join(__dirname, '..', '.claude', 'hooks', 'voice-notifications', 'sounds', 'alfred', soundFile);
  
  console.log(`Playing sound: ${soundPath}`);
  
  try {
    // Windows: Use PowerShell
    const command = `powershell -c "(New-Object Media.SoundPlayer '${soundPath}').PlaySync()"`;
    console.log(`Executing: ${command}`);
    
    await execAsync(command);
    console.log('✓ Sound played successfully');
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}

// Play test sound
const soundFile = process.argv[2] || 'success.wav';
playSound(soundFile).catch(console.error);