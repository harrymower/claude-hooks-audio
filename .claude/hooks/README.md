# Claude Hooks Structure

This folder contains the notification system handlers for Claude Code.

## Structure

```
hooks/
├── activity-tracker.ts          # Tracks tool usage for activity summaries
├── audio-notifications/         # Audio notification system
│   ├── handler.ts              # Main audio notification handler
│   ├── sound-mapping.json      # Maps events to sound files
│   └── sounds/                 # Audio files organized by voice pack
│       └── alfred/             # Default voice pack
└── desktop-notifications/       # Desktop notification system
    ├── handler.ts              # Main desktop notification handler
    ├── notification-mapping.json # Maps events to notification messages
    ├── claude-icon.png         # Icon for notifications
    └── utils/                  # Utility scripts (optional)
        ├── register-app.ps1    # Windows app registration
        ├── unregister-app.ps1  # Windows app cleanup
        └── create-icon.js      # Icon generation utility
```

## Key Files

### Core Handlers
- **activity-tracker.ts**: Monitors Claude's tool usage and creates activity summaries
- **audio-notifications/handler.ts**: Plays audio notifications for events
- **desktop-notifications/handler.ts**: Shows OS desktop notifications

### Configuration Files
- **sound-mapping.json**: Configure which sounds play for which events
- **notification-mapping.json**: Configure notification messages

### Generated Files (git-ignored)
- **activity-log.json**: Runtime activity tracking data

## How It Works

1. Claude Code triggers hooks based on events (Stop, PreToolUse, Notification)
2. Handlers receive event data via stdin as JSON
3. Each handler processes the event and provides appropriate feedback
4. PreToolUse hooks must return approval/rejection decisions

## Adding Custom Handlers

Create a new TypeScript file following this pattern:

```typescript
#!/usr/bin/env tsx
import { readFileSync } from 'fs';

const input = readFileSync(0, 'utf-8').trim();
const event = JSON.parse(input);

// Your logic here
console.log('Event:', event.hook_event_name);

// For PreToolUse hooks, always respond:
console.log(JSON.stringify({ decision: 'approve' }));
```