import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkSoundSetup() {
  const voicePack = process.env.VOICE_PACK || 'alfred';
  const soundsDir = path.join(__dirname, '..', '.claude', 'hooks', 'audio-notifications', 'sounds', voicePack);
  const mappingPath = path.join(__dirname, '..', '.claude', 'hooks', 'audio-notifications', 'sound-mapping.json');
  
  console.log(`Checking sound setup for voice pack: ${voicePack}`);
  console.log(`Sound directory: ${soundsDir}\n`);
  
  // Check if sound mapping exists
  if (!fs.existsSync(mappingPath)) {
    console.error('❌ sound-mapping.json not found!');
    return;
  }
  
  const soundMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  console.log('✓ Found sound-mapping.json\n');
  
  // Check required sounds
  const requiredSounds = new Set<string>();
  
  // Extract all sound filenames from mapping
  Object.values(soundMapping).forEach((eventConfig: any) => {
    if (typeof eventConfig === 'object' && !Array.isArray(eventConfig)) {
      Object.values(eventConfig).forEach((value: any) => {
        if (typeof value === 'string' && value.endsWith('.wav')) {
          requiredSounds.add(value);
        }
      });
    }
  });
  
  console.log('Required sounds based on mapping:');
  let allSoundsPresent = true;
  
  requiredSounds.forEach(soundFile => {
    const soundPath = path.join(soundsDir, soundFile);
    const exists = fs.existsSync(soundPath);
    console.log(`${exists ? '✓' : '❌'} ${soundFile} ${exists ? '(found)' : '(missing)'}`);
    if (!exists) allSoundsPresent = false;
  });
  
  // List actual files in directory
  console.log('\nActual files in sound directory:');
  if (fs.existsSync(soundsDir)) {
    const files = fs.readdirSync(soundsDir);
    if (files.length === 0) {
      console.log('  (empty directory)');
    } else {
      files.forEach(file => {
        if (file.endsWith('.wav')) {
          console.log(`  ✓ ${file}`);
        }
      });
    }
  } else {
    console.log('  ❌ Directory does not exist');
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (allSoundsPresent) {
    console.log('✅ All required sounds are present! Your notification system is ready.');
  } else {
    console.log('⚠️  Some sounds are missing. Please download the missing files.');
    console.log('   See DOWNLOAD_INSTRUCTIONS.md for guidance.');
  }
}

// Run the check
checkSoundSetup();