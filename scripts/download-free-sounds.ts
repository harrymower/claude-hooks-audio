import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Free sound URLs from various sources
const soundUrls = [
  {
    name: 'success.wav',
    url: 'https://www.wavsource.com/snds_2020-10-01_3728627494378403/sfx/bell_tiny.wav',
    description: 'Success bell sound'
  },
  {
    name: 'tool-use.wav', 
    url: 'https://www.wavsource.com/snds_2020-10-01_3728627494378403/sfx/click_tiny_bell.wav',
    description: 'Tool click sound'
  },
  {
    name: 'alert.wav',
    url: 'https://www.wavsource.com/snds_2020-10-01_3728627494378403/sfx/beep-28.wav',
    description: 'Alert beep'
  },
  {
    name: 'error.wav',
    url: 'https://www.wavsource.com/snds_2020-10-01_3728627494378403/sfx/fail_buzzer.wav',
    description: 'Error buzzer'
  },
  {
    name: 'info.wav',
    url: 'https://www.wavsource.com/snds_2020-10-01_3728627494378403/sfx/pop_drip.wav',
    description: 'Info pop sound'
  }
];

async function downloadFile(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(destPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        console.error(`Failed to download (${response.statusCode}): ${url}`);
        resolve(false);
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded successfully`);
        resolve(true);
      });
      
      file.on('error', () => {
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        resolve(false);
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      console.error(`Download error: ${err.message}`);
      resolve(false);
    });
  });
}

async function generateSilentWav(filename: string, durationMs: number = 200): Promise<void> {
  // WAV file header for silent audio
  const sampleRate = 44100;
  const numChannels = 1;
  const bitsPerSample = 16;
  const numSamples = Math.floor(sampleRate * durationMs / 1000);
  const dataSize = numSamples * numChannels * (bitsPerSample / 8);
  const fileSize = 44 + dataSize;
  
  const buffer = Buffer.alloc(fileSize);
  
  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize - 8, 4);
  buffer.write('WAVE', 8);
  
  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // byte rate
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); // block align
  buffer.writeUInt16LE(bitsPerSample, 34);
  
  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  // Silent audio data (all zeros)
  // Buffer is already initialized with zeros
  
  fs.writeFileSync(filename, buffer);
}

async function main() {
  const voicePack = process.env.VOICE_PACK || 'alfred';
  const soundsDir = path.join(__dirname, '..', '.claude', 'hooks', 'voice-notifications', 'sounds', voicePack);
  
  console.log(`Downloading sounds for voice pack: ${voicePack}`);
  console.log(`Target directory: ${soundsDir}\n`);
  
  // Try to download each sound
  for (const sound of soundUrls) {
    const destPath = path.join(soundsDir, sound.name);
    console.log(`Attempting to download ${sound.name} - ${sound.description}`);
    
    const success = await downloadFile(sound.url, destPath);
    
    if (!success) {
      console.log(`Creating placeholder ${sound.name} instead...`);
      // Generate a simple silent WAV file as placeholder
      await generateSilentWav(destPath, 200);
      console.log(`✓ Created placeholder ${sound.name}`);
    }
    
    console.log('');
  }
  
  console.log('Download complete! Running verification...\n');
  
  // Verify downloads
  const { execSync } = await import('child_process');
  execSync('npx tsx scripts/test-sounds.ts', { stdio: 'inherit' });
}

main().catch(console.error);