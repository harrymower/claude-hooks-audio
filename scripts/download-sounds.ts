import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

interface SoundConfig {
  url: string;
  filename: string;
  description: string;
  category: 'success' | 'alert' | 'error' | 'info' | 'tool';
}

// These are example URLs - you'll need to replace with actual sound file URLs
// from the free sources mentioned (BigSoundBank, Freesound, etc.)
const soundConfigs: SoundConfig[] = [
  {
    url: 'https://www.soundjay.com/misc/bell-ringing-05.wav',
    filename: 'success-bell.wav',
    description: 'Pleasant bell for task completion',
    category: 'success'
  },
  {
    url: 'https://www.soundjay.com/misc/button-09.wav',
    filename: 'tool-click.wav',
    description: 'Click sound for tool usage',
    category: 'tool'
  },
  {
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-01.wav',
    filename: 'alert-chime.wav',
    description: 'Alert chime for notifications',
    category: 'alert'
  },
  {
    url: 'https://www.soundjay.com/misc/sounds/button-10.wav',
    filename: 'error-beep.wav',
    description: 'Error beep sound',
    category: 'error'
  },
  {
    url: 'https://www.soundjay.com/misc/sounds/button-3.wav',
    filename: 'info-pop.wav',
    description: 'Info pop sound',
    category: 'info'
  }
];

async function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        file.close();
        fs.unlinkSync(destPath);
        downloadFile(response.headers.location!, destPath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

async function setupSounds() {
  const voicePack = process.env.VOICE_PACK || 'alfred';
  const soundsDir = path.join(__dirname, '..', '.claude', 'hooks', 'audio-notifications', 'sounds', voicePack);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir, { recursive: true });
  }
  
  console.log(`Setting up sounds for voice pack: ${voicePack}`);
  console.log(`Target directory: ${soundsDir}`);
  
  // Download each sound
  for (const sound of soundConfigs) {
    const destPath = path.join(soundsDir, sound.filename);
    console.log(`\nDownloading ${sound.filename}...`);
    console.log(`Description: ${sound.description}`);
    
    try {
      await downloadFile(sound.url, destPath);
      console.log(`✓ Downloaded ${sound.filename}`);
    } catch (error) {
      console.error(`✗ Failed to download ${sound.filename}:`, error);
      console.log('Please manually download a suitable sound file and place it at:', destPath);
    }
  }
  
  // Create a sound mapping update suggestion
  console.log('\n\nSuggested sound-mapping.json updates:');
  console.log(JSON.stringify({
    "stop": {
      "default": sound.filename.find(s => s.category === 'success')?.filename || "success-bell.wav"
    },
    "pre_tool_use": {
      "default": soundConfigs.find(s => s.category === 'tool')?.filename || "tool-click.wav",
      "Read": soundConfigs.find(s => s.category === 'info')?.filename || "info-pop.wav",
      "Edit": soundConfigs.find(s => s.category === 'tool')?.filename || "tool-click.wav"
    },
    "notification": {
      "default": soundConfigs.find(s => s.category === 'alert')?.filename || "alert-chime.wav",
      "error": soundConfigs.find(s => s.category === 'error')?.filename || "error-beep.wav"
    }
  }, null, 2));
}

// Run the setup
setupSounds().catch(console.error);