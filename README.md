# Claude Code Hooks Notification System

A TypeScript-based notification system for Claude Code that provides real-time voice and desktop notifications for various hook events - completely self-contained with no external dependencies.

**Now with improved activity tracking!**

## Features

- 🔊 **Audio Notifications**: Cross-platform sound alerts for Claude Code events
- 🖥️ **Desktop Notifications**: Native OS notifications (Windows, macOS, Linux)
- 🎯 **Context-Aware**: Different notifications based on file types and operations
- 🎭 **Voice Packs**: Support for multiple voice personalities (Alfred, Jarvis, etc.)
- 🔒 **Fully Local**: No external services required - everything runs on your machine
- 🔧 **TypeScript**: Type-safe implementation with modern tooling

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Add audio files (optional):**
   - Place `.wav` files in `.claude/hooks/audio-notifications/sounds/alfred/`
   - See the [audio files README](.claude/hooks/audio-notifications/sounds/alfred/README.md) for required files
   - System works without audio files (will log "Sound file not found")

3. **Use Claude Code normally** - notifications will trigger automatically!

## How It Works

The system listens to three main Claude Code hook events:

1. **Task Completion** (`stop` event)
   - Voice: "Task complete" sound
   - Desktop: Native OS notification with "Task Complete" message

2. **Tool Usage** (`pre_tool_use` event)
   - Voice: Contextual sounds based on operation
   - Desktop: Silent by default (configurable)

3. **User Input Required** (`notification` event)
   - Voice: "Permission needed" sound
   - Desktop: Native OS notification with "Action Required" message

## Testing

Run the included test script to verify everything is working:

```bash
npm test
```

Or test individual components:

```bash
# Test desktop notification
echo {"hook":"stop","event":"stop"} | tsx .claude/hooks/desktop-notifications/handler.ts

# Test voice notification
echo {"hook":"stop","event":"stop"} | tsx .claude/hooks/audio-notifications/handler.ts
```

## Customization

### Change Voice Pack
Edit `.claude/settings.json`:
```json
{
  "env": {
    "VOICE_PACK": "jarvis"  // Change from "alfred" to "jarvis"
  }
}
```

### Configure Notifications
Edit notification behavior in `.claude/hooks/desktop-notifications/notification-mapping.json`:
- `sound`: Enable/disable notification sound
- `timeout`: How long notification stays visible (seconds)
- `messages`: Array of random messages to display

### Add New Sounds
1. Add entries to `.claude/hooks/audio-notifications/sound-mapping.json`
2. Place corresponding `.wav` files in the sounds directory
3. Restart Claude Code

## Platform-Specific Notes

### Windows
- Uses Windows native notifications
- Supports notification sounds via Windows API

### macOS
- Uses macOS Notification Center
- Supports custom notification sounds

### Linux
- Uses `notify-send` (must be installed)
- Install: `sudo apt-get install libnotify-bin` (Ubuntu/Debian)

## Architecture

```
Voice Notifications:             Desktop Notifications:
Claude Event → Handler.ts →      Claude Event → Handler.ts →
Sound Mapping → Play Audio       Notification Mapping → OS Native Notification
```

## Troubleshooting

- **No desktop notifications on Linux?** Install `libnotify-bin`
- **No audio on Windows?** Ensure audio files are in `.wav` format
- **No audio on Linux?** Install `alsa-utils` or `pulseaudio-utils`
- **Notifications not appearing?** Check OS notification settings

## License

This project is open source and available under the MIT License.