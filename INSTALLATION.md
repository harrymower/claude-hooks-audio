# Installing Claude Hooks Notification System in Other Projects

## Quick Installation

1. **Copy the hooks folder** to your project:
   ```bash
   # From this project's root
   cp -r .claude/hooks /path/to/your/project/.claude/hooks
   cp .claude/settings.json /path/to/your/project/.claude/settings.json
   ```

2. **Install dependencies** in your project:
   ```bash
   cd /path/to/your/project
   npm install node-notifier tsx
   ```

3. **Copy sound files** (optional):
   - Copy `.claude/hooks/audio-notifications/sounds/` folder
   - Or download your own sounds

4. **Adjust settings** in `.claude/settings.json`:
   - Modify hook paths if needed
   - Set your preferred voice pack
   - Enable/disable specific hooks

## Manual Installation Steps

### 1. Create the folder structure:
```
your-project/
└── .claude/
    ├── settings.json
    └── hooks/
        ├── activity-tracker.ts
        ├── audio-notifications/
        │   ├── handler.ts
        │   ├── sound-mapping.json
        │   └── sounds/
        └── desktop-notifications/
            ├── handler.ts
            └── notification-mapping.json
```

### 2. Install required packages:
```bash
npm install --save-dev node-notifier tsx @types/node
```

### 3. Create `.claude/settings.json`:
```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "npx tsx .claude/hooks/audio-notifications/handler.ts"
          },
          {
            "type": "command",
            "command": "npx tsx .claude/hooks/desktop-notifications/handler.ts"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "npx tsx .claude/hooks/activity-tracker.ts"
          }
        ]
      }
    ],
    "Notification": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "npx tsx .claude/hooks/audio-notifications/handler.ts"
          },
          {
            "type": "command",
            "command": "npx tsx .claude/hooks/desktop-notifications/handler.ts"
          }
        ]
      }
    ]
  },
  "env": {
    "VOICE_PACK": "alfred"
  }
}
```

### 4. Copy only the handlers you want:
- **Voice notifications only**: Copy `audio-notifications/` folder
- **Desktop notifications only**: Copy `desktop-notifications/` folder
- **Activity tracking**: Copy `activity-tracker.ts`

## Using as a Template

You can also use this repository as a template:

1. **Clone this repository**:
   ```bash
   git clone https://github.com/harrymower/claude-hooks-audio.git
   cd claude-hooks-audio
   ```

2. **Copy the `.claude` folder** to your project:
   ```bash
   cp -r .claude /path/to/your/project/
   ```

3. **Install dependencies** in your project

## Customization Options

### Disable specific notifications:
Remove unwanted hooks from `.claude/settings.json`

### Add custom sounds:
1. Add `.wav` files to `.claude/hooks/audio-notifications/sounds/[voice-pack]/`
2. Update `sound-mapping.json` with new mappings

### Modify notification messages:
Edit `notification-mapping.json` to customize desktop notification text

### Create project-specific handlers:
You can create custom handlers for specific needs:
```typescript
// .claude/hooks/my-custom-handler.ts
#!/usr/bin/env tsx
import { readFileSync } from 'fs';

const input = readFileSync(0, 'utf-8').trim();
const event = JSON.parse(input);

// Your custom logic here
console.log('Custom handler triggered:', event.hook_event_name);

// Always approve (required for PreToolUse hooks)
console.log(JSON.stringify({ decision: 'approve' }));
```

## Minimal Setup (Desktop Notifications Only)

For a minimal setup with just desktop notifications:

1. Create `.claude/settings.json`:
```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "npx tsx .claude/hooks/desktop-notifications/handler.ts"
          }
        ]
      }
    ]
  }
}
```

2. Copy only the desktop notifications handler
3. Install only `node-notifier` and `tsx`

## Troubleshooting

- **No notifications**: Check that Claude Code can find `.claude/settings.json`
- **Missing sounds**: Ensure `.wav` files are in the correct folder
- **TypeScript errors**: Make sure `tsx` is installed
- **Windows issues**: Run as administrator if needed for notifications

## Share Across Multiple Projects

Create a shared npm package:
1. Fork this repository
2. Publish to npm or use locally with `npm link`
3. Install in your projects: `npm install your-claude-hooks`
4. Reference the package in your `.claude/settings.json`