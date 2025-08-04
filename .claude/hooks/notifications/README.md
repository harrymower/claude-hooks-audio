# Claude Code Unified Notification System

A simplified, all-in-one notification system for Claude Code hooks that combines audio, desktop, Discord, email, and Telegram notifications into a single, easy-to-install package.

## 🚀 Quick Start

### Installation

1. **Copy the notifications folder** to your project:
   ```bash
   cp -r path/to/notifications .claude/hooks/
   ```

2. **Update `.claude/settings.json`**:
   ```json
   {
     "hooks": {
       "Stop": [{
         "matcher": "*",
         "hooks": [{
           "type": "command",
           "command": "npx tsx .claude/hooks/notifications/handler.ts"
         }]
       }],
       "Notification": [{
         "matcher": "*",
         "hooks": [{
           "type": "command",
           "command": "npx tsx .claude/hooks/notifications/handler.ts"
         }]
       }]
     }
   }
   ```

3. **Configure notifications** in `config.json`
4. **Add credentials** to your `.env` file

## 📋 Features

- **🔊 Audio Notifications**: Multiple voice packs with context-aware sounds
- **🖥️ Desktop Notifications**: Native OS notifications for all platforms
- **💬 Discord**: Rich webhook embeds with mobile push support
- **📧 Email**: HTML formatted emails via SMTP
- **🤖 Telegram**: Bot messages with markdown formatting

## ⚙️ Configuration

Edit `.claude/hooks/notifications/config.json`:

```json
{
  "audio": {
    "enabled": true,
    "voicePack": "alfred",  // Options: alfred, jarvis, glados, etc.
    "soundMapping": {
      // Custom sound mappings
    }
  },
  "desktop": {
    "enabled": true,
    "notificationMapping": {
      // Custom notification messages
    }
  },
  "discord": {
    "enabled": false,
    "webhookUrl": "",  // Or use DISCORD_WEBHOOK_URL env var
    "username": "Claude Code",
    "discordMapping": {
      // Custom Discord embeds
    }
  },
  "email": {
    "enabled": false,
    "from": "",  // Or use EMAIL_FROM env var
    "to": "",    // Or use EMAIL_TO env var
    "emailMapping": {
      // Custom email templates
    }
  },
  "telegram": {
    "enabled": false,
    "botToken": "",  // Or use TELEGRAM_BOT_TOKEN env var
    "chatId": "",    // Or use TELEGRAM_CHAT_ID env var
    "telegramMapping": {
      // Custom Telegram messages
    }
  }
}
```

## 🔐 Environment Variables

Create a `.env` file in your project root:

```env
# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Email (Gmail example)
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=recipient@example.com
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASS=your-app-password

# Telegram
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=1234567890
```

## 📁 Structure

```
notifications/
├── handler.ts          # Main unified handler
├── config.json         # All notification settings
├── notifiers/          # Individual notification modules
│   ├── base.ts         # Base classes and interfaces
│   ├── audio.ts        # Audio notifications
│   ├── desktop.ts      # Desktop notifications
│   ├── discord.ts      # Discord webhooks
│   ├── email.ts        # Email notifications
│   └── telegram.ts     # Telegram bot
├── assets/
│   ├── sounds/         # Voice pack audio files
│   └── icons/          # Notification icons
└── install.ts          # Installation helper
```

## 🎵 Voice Packs

Available voice packs in `assets/sounds/`:
- **alfred**: Professional butler
- **jarvis**: AI assistant
- **glados**: Portal AI
- **friday**: Modern assistant
- **edith**: Spider-Man AI

## 🛠️ Advanced Usage

### Custom Sound Mappings

```json
{
  "audio": {
    "soundMapping": {
      "stop": ["custom-complete.wav"],
      "pre_tool_use": {
        "bash": {
          "default": ["command.wav"]
        }
      }
    }
  }
}
```

### Custom Notification Messages

```json
{
  "desktop": {
    "notificationMapping": {
      "stop": {
        "title": "My Custom Title",
        "message": "My custom message",
        "sound": true
      }
    }
  }
}
```

## 🐛 Troubleshooting

1. **No notifications appearing?**
   - Check that notifications are enabled in `config.json`
   - Verify credentials in `.env` file
   - Run with `--verbose` flag for debug output

2. **Audio not playing?**
   - Ensure `.wav` files exist in `assets/sounds/[voice-pack]/`
   - Check system audio settings
   - Try a different voice pack

3. **Discord/Email/Telegram not working?**
   - Verify webhook URL / credentials
   - Check network connectivity
   - Look for error messages in console

## 📦 Creating a Package

To share your notification setup:

```bash
# Package the notifications folder
tar -czf claude-notifications.tar.gz .claude/hooks/notifications/

# Install in another project
tar -xzf claude-notifications.tar.gz -C /path/to/project/
```

## 🤝 Contributing

Feel free to add new notification types, voice packs, or improvements!

1. Add new notifier in `notifiers/`
2. Extend base class from `base.ts`
3. Update handler.ts to load your notifier
4. Add configuration to `config.json`

---

Made with ❤️ for Claude Code users