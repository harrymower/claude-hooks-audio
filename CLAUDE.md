# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This project implements a comprehensive notification system for Claude Code hooks using TypeScript:
- **Audio Notifications**: Cross-platform audio playback for various Claude events
- **Desktop Notifications**: Native OS notifications for important Claude events  
- **Discord Notifications**: Rich webhook embeds with mobile push notifications
- **Email Notifications**: HTML formatted emails with SMTP delivery
- **Telegram Notifications**: Instant bot messages with Markdown formatting

## Development Environment

- Platform: Windows (win32)
- Working Directory: D:\CodingProjects\claude-hooks-audo
- Runtime: Node.js with TypeScript (tsx)

## Commands

```bash
# Install dependencies
npm install

# Build TypeScript files
npm run build

# Watch mode for development
npm run dev

# Clean build output
npm run clean

# Test notification system
npm test
```

## Architecture

### Directory Structure
```
.claude/
├── settings.json         # Hook configurations
├── settings.local.json   # Local permissions
├── hooks/
│   ├── audio-notifications/
│   │   ├── handler.ts           # Voice notification handler
│   │   ├── sound-mapping.json   # Event-to-sound mappings
│   │   └── sounds/             # Audio files by voice pack
│   ├── desktop-notifications/
│   │   ├── handler.ts                  # Desktop notification handler
│   │   └── notification-mapping.json   # Event-to-message mappings
│   ├── discord-notifications/
│   │   ├── handler.ts                  # Discord webhook handler
│   │   ├── discord-mapping.json        # Discord embed templates
│   │   └── README.md                   # Discord setup guide
│   ├── email-notifications/
│   │   ├── handler.ts                  # Email notification handler
│   │   ├── email-mapping.json          # Email message templates
│   │   └── README.md                   # Email setup guide
│   └── telegram-notifications/
│       ├── handler.ts                  # Telegram bot handler
│       ├── telegram-mapping.json       # Telegram message templates
│       └── README.md                   # Telegram setup guide
└── dist/                 # Compiled JavaScript output
```

### Hook System

The project handles three main hook events:
1. **stop**: Fired when Claude completes a task
2. **pre_tool_use**: Fired before Claude uses a tool (Read, Edit, etc.)
3. **notification**: Fired when Claude needs user input/permission

### Key Features

- **Context-Aware Notifications**: Different sounds/messages based on file types and operations
- **Voice Pack Support**: Easy switching between voice personalities (alfred, jarvis, etc.)
- **Cross-Platform Support**: Works on Windows, macOS, and Linux
- **Native OS Integration**: Uses system notification APIs for desktop alerts
- **Remote Notifications**: Discord webhooks and email for away-from-computer alerts
- **Rich Formatting**: Discord embeds and HTML emails with colors and styling
- **Flexible Configuration**: Enable/disable each notification type independently
- **Secure**: Sensitive credentials stored in .env file

## Configuration

### Environment Variables (in settings.json)
- `VOICE_PACK`: Voice pack to use (default: "alfred")
- `DISCORD_ENABLED`: Enable Discord notifications (default: "false")
- `DISCORD_WEBHOOK_URL`: Discord webhook URL (stored in .env)
- `DISCORD_USERNAME`: Webhook display name (default: "Claude Code")
- `EMAIL_ENABLED`: Enable email notifications (default: "false")
- `EMAIL_FROM`: Sender email address
- `EMAIL_TO`: Recipient email address
- `EMAIL_SMTP_HOST`: SMTP server (default: "smtp.gmail.com")
- `EMAIL_SMTP_USER`: SMTP username (stored in .env)
- `EMAIL_SMTP_PASS`: SMTP password (stored in .env)
- `TELEGRAM_ENABLED`: Enable Telegram notifications (default: "false")
- `TELEGRAM_BOT_TOKEN`: Telegram bot token (stored in .env)
- `TELEGRAM_CHAT_ID`: Telegram chat ID (stored in .env)

### Adding New Sounds
1. Add .wav files to `.claude/hooks/audio-notifications/sounds/[voice-pack]/`
2. Update `sound-mapping.json` with new mappings
3. Restart Claude Code to apply changes

### Testing Notifications
1. Run `npm test` to test all notification types
2. Run Claude Code commands to trigger hooks
3. Verify audio playback and desktop notifications

The test suite (`test-notifications.js`) includes:
- Task completion notifications (stop hook)
- Permission required alerts (notification hook)
- Tool usage notifications (pre_tool_use hook)
- Tests for both voice and desktop notifications
- 2-second delays between tests for clarity

Test output shows:
- 🔊 Voice notification status
- 🖥️ Desktop notification status
- ✓/✗ Success/failure indicators

## Important Notes

- Audio files must be in .wav format for cross-platform compatibility
- Desktop notifications use native OS notification systems
- Handlers use tsx for direct TypeScript execution (no build step needed)
- Each handler processes all event types for its notification system
- No external services or internet connection required