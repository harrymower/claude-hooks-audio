import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SoundSetup {
  filename: string;
  description: string;
  sources: string[];
  keywords: string[];
}

const requiredSounds: SoundSetup[] = [
  {
    filename: 'success.wav',
    description: 'Pleasant chime or bell for task completion',
    sources: ['BigSoundBank', 'Freesound', 'SoundBible'],
    keywords: ['success', 'complete', 'done', 'bell', 'chime']
  },
  {
    filename: 'tool-use.wav',
    description: 'Short click or pop for tool usage',
    sources: ['BigSoundBank', 'WavSource'],
    keywords: ['click', 'button', 'interface', 'ui']
  },
  {
    filename: 'alert.wav',
    description: 'Attention-grabbing sound for notifications',
    sources: ['BigSoundBank', 'Pixabay'],
    keywords: ['alert', 'notification', 'attention', 'warning']
  },
  {
    filename: 'error.wav',
    description: 'Subtle error or failure sound',
    sources: ['SoundBible', 'Freesound'],
    keywords: ['error', 'fail', 'wrong', 'buzz']
  },
  {
    filename: 'info.wav',
    description: 'Soft informational sound',
    sources: ['BigSoundBank', 'Mixkit'],
    keywords: ['info', 'message', 'pop', 'bubble']
  }
];

function setupSoundDirectories() {
  const voicePacks = ['alfred', 'jarvis', 'friday', 'edith'];
  const baseDir = path.join(__dirname, '..', '.claude', 'hooks', 'audio-notifications', 'sounds');
  
  // Create directories for each voice pack
  voicePacks.forEach(pack => {
    const packDir = path.join(baseDir, pack);
    if (!fs.existsSync(packDir)) {
      fs.mkdirSync(packDir, { recursive: true });
      console.log(`Created directory: ${packDir}`);
    }
  });
  
  // Create download instructions
  const instructions = `# Sound Download Instructions

To set up notification sounds for your Claude hooks, follow these steps:

## Recommended Sources:
1. **BigSoundBank** (https://bigsoundbank.com) - Search for "notification"
2. **Freesound** (https://freesound.org) - Search for "alert" or "notification"
3. **SoundBible** (https://soundbible.com) - Browse notification category
4. **WavSource** (https://wavsource.com) - Check sound effects section

## Required Sounds:
${requiredSounds.map(sound => `
### ${sound.filename}
- **Description**: ${sound.description}
- **Search keywords**: ${sound.keywords.join(', ')}
- **Try these sources**: ${sound.sources.join(', ')}
`).join('')}

## Instructions:
1. Visit the sources above
2. Search using the provided keywords
3. Download sounds in WAV format
4. Place them in: .claude/hooks/audio-notifications/sounds/[voice-pack]/
5. Use the exact filenames listed above

## Voice Packs:
- alfred (default)
- jarvis
- friday
- edith

You can customize sounds for each voice pack or use the same sounds across all packs.
`;
  
  const instructionsPath = path.join(baseDir, 'DOWNLOAD_INSTRUCTIONS.md');
  fs.writeFileSync(instructionsPath, instructions);
  console.log(`\nCreated download instructions at: ${instructionsPath}`);
  
  // Update sound mapping
  updateSoundMapping();
}

function updateSoundMapping() {
  const mappingPath = path.join(__dirname, '..', '.claude', 'hooks', 'audio-notifications', 'sound-mapping.json');
  
  const soundMapping = {
    "stop": {
      "default": "success.wav",
      "description": "Played when Claude completes a task"
    },
    "pre_tool_use": {
      "default": "tool-use.wav",
      "Read": "info.wav",
      "Edit": "tool-use.wav",
      "Write": "tool-use.wav",
      "Bash": "tool-use.wav",
      "description": "Played before Claude uses a tool"
    },
    "notification": {
      "default": "alert.wav",
      "permission_required": "alert.wav",
      "error": "error.wav",
      "info": "info.wav",
      "description": "Played when Claude needs user input"
    }
  };
  
  fs.writeFileSync(mappingPath, JSON.stringify(soundMapping, null, 2));
  console.log(`\nUpdated sound mapping at: ${mappingPath}`);
}

// Run setup
console.log('Setting up sound directories and configurations...\n');
setupSoundDirectories();
console.log('\n✓ Setup complete! Please follow the instructions in DOWNLOAD_INSTRUCTIONS.md to add sound files.');