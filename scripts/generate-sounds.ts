import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate WAV file with a tone
function generateToneWav(
  filename: string,
  frequency: number,
  durationMs: number,
  amplitude: number = 0.5
): void {
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
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  
  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  // Generate audio data
  const maxAmplitude = 32767 * amplitude;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    
    // Apply envelope for smoother sound
    let envelope = 1.0;
    const attackTime = 0.01;
    const releaseTime = 0.05;
    const totalTime = durationMs / 1000;
    
    if (t < attackTime) {
      envelope = t / attackTime;
    } else if (t > totalTime - releaseTime) {
      envelope = (totalTime - t) / releaseTime;
    }
    
    // Generate sample
    const sample = Math.sin(2 * Math.PI * frequency * t) * maxAmplitude * envelope;
    buffer.writeInt16LE(Math.round(sample), 44 + i * 2);
  }
  
  fs.writeFileSync(filename, buffer);
}

// Generate click sound with multiple harmonics
function generateClickWav(filename: string): void {
  const sampleRate = 44100;
  const numChannels = 1;
  const bitsPerSample = 16;
  const durationMs = 100;
  const numSamples = Math.floor(sampleRate * durationMs / 1000);
  const dataSize = numSamples * numChannels * (bitsPerSample / 8);
  const fileSize = 44 + dataSize;
  
  const buffer = Buffer.alloc(fileSize);
  
  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize - 8, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  // Generate click sound
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t * 50);
    
    // Mix multiple frequencies for richer sound
    let sample = 0;
    sample += Math.sin(2 * Math.PI * 1000 * t) * 0.3;
    sample += Math.sin(2 * Math.PI * 2000 * t) * 0.2;
    sample += Math.sin(2 * Math.PI * 4000 * t) * 0.1;
    
    sample *= envelope * 20000;
    buffer.writeInt16LE(Math.round(sample), 44 + i * 2);
  }
  
  fs.writeFileSync(filename, buffer);
}

async function generateSounds() {
  const voicePack = process.env.VOICE_PACK || 'alfred';
  const soundsDir = path.join(__dirname, '..', '.claude', 'hooks', 'voice-notifications', 'sounds', voicePack);
  
  console.log(`Generating notification sounds for voice pack: ${voicePack}`);
  console.log(`Target directory: ${soundsDir}\n`);
  
  // Generate different sounds
  const sounds = [
    {
      name: 'success.wav',
      generate: () => generateToneWav(path.join(soundsDir, 'success.wav'), 800, 300, 0.3),
      description: 'Pleasant success chime (800Hz)'
    },
    {
      name: 'tool-use.wav',
      generate: () => generateClickWav(path.join(soundsDir, 'tool-use.wav')),
      description: 'Quick click sound'
    },
    {
      name: 'alert.wav',
      generate: () => {
        const file = path.join(soundsDir, 'alert.wav');
        generateToneWav(file + '.tmp1', 440, 200, 0.4);
        generateToneWav(file, 550, 200, 0.4);
      },
      description: 'Alert tone (440-550Hz)'
    },
    {
      name: 'error.wav',
      generate: () => generateToneWav(path.join(soundsDir, 'error.wav'), 200, 400, 0.3),
      description: 'Low error tone (200Hz)'
    },
    {
      name: 'info.wav',
      generate: () => generateToneWav(path.join(soundsDir, 'info.wav'), 600, 150, 0.2),
      description: 'Soft info beep (600Hz)'
    }
  ];
  
  // Generate each sound
  for (const sound of sounds) {
    console.log(`Generating ${sound.name} - ${sound.description}`);
    sound.generate();
    console.log(`✓ Generated ${sound.name}`);
  }
  
  // Clean up temp files
  const tempFile = path.join(soundsDir, 'alert.wav.tmp1');
  if (fs.existsSync(tempFile)) {
    fs.unlinkSync(tempFile);
  }
  
  console.log('\nAll sounds generated successfully!');
  console.log('\nRunning verification...\n');
  
  // Verify
  const { execSync } = await import('child_process');
  execSync('npx tsx scripts/test-sounds.ts', { stdio: 'inherit' });
}

generateSounds().catch(console.error);