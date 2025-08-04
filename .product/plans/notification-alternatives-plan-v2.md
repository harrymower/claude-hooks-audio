# Additional Remote Notification Methods Plan

## Overview
Add remote notification capabilities to complement the existing audio and desktop notifications, allowing you to receive alerts when away from your computer.

## Proposed Additional Notification Methods

### 1. Discord Webhooks (Recommended)
**Pros:**
- Completely free
- No limits on messages
- Rich embeds with colors and formatting
- Instant push notifications on mobile
- Easy webhook URL setup
- No API keys or complex auth

**Cons:**
- Requires Discord account
- Need to create a server/channel

**Implementation:**
- Create `discord-webhook` handler
- Support rich embeds with project info
- Color coding for different event types
- Include timestamps and activity summaries

### 2. Email Notifications (Universal)
**Pros:**
- Works on every device
- No additional apps needed
- Gmail SMTP is free
- Professional appearance
- HTML formatting support

**Cons:**
- Slightly slower than push notifications
- May go to spam initially
- Requires email app setup

**Implementation:**
- Use nodemailer with Gmail SMTP
- HTML templates for nice formatting
- Support multiple recipients
- Daily digest option

### 3. Telegram Bot (Optional - Power Users)
**Pros:**
- Instant delivery
- Free with no limits
- Global availability
- Rich message formatting
- Can create inline keyboards

**Cons:**
- Requires creating a bot
- Need Telegram account
- More complex setup

**Implementation:**
- Create Telegram bot handler
- Simple HTTP API
- Support markdown formatting
- Group chat support

## Implementation Plan

### Updated Architecture
The existing notification system will be enhanced, not replaced:

```
.claude/hooks/
├── audio-notifications/        # EXISTING - Local audio alerts
├── desktop-notifications/      # EXISTING - Local desktop popups
├── discord-notifications/      # NEW - Remote Discord alerts
├── email-notifications/        # NEW - Remote email alerts
└── activity-tracker.ts         # EXISTING - Feeds all notifications
```

### Phase 1: Discord Webhooks
```
.claude/hooks/discord-notifications/
├── handler.ts              # Main Discord handler
├── discord-mapping.json    # Event-to-embed mappings
└── README.md              # Setup instructions
```

**Features:**
- Rich embeds with colors (green=success, yellow=permission, red=error)
- Project name and timestamp
- Activity summary from activity tracker
- Clickable links to files
- @mentions support

### Phase 2: Email Notifications
```
.claude/hooks/email-notifications/
├── handler.ts              # Email handler
├── email-mapping.json      # Event-to-template mappings
├── templates/              # HTML email templates
└── README.md              # Setup instructions
```

**Features:**
- HTML email templates
- Plain text fallback
- Batching for multiple events
- Daily summary option
- Multiple recipients

## Configuration Changes

### Updated settings.json
```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          // EXISTING
          {
            "type": "command",
            "command": "npx tsx .claude/hooks/audio-notifications/handler.ts"
          },
          {
            "type": "command",
            "command": "npx tsx .claude/hooks/desktop-notifications/handler.ts"
          },
          // NEW - OPTIONAL
          {
            "type": "command",
            "command": "npx tsx .claude/hooks/discord-notifications/handler.ts"
          },
          {
            "type": "command",
            "command": "npx tsx .claude/hooks/email-notifications/handler.ts"
          }
        ]
      }
    ],
    // Similar for Notification events...
  },
  "env": {
    // EXISTING
    "VOICE_PACK": "alfred",
    
    // NEW - Discord
    "DISCORD_ENABLED": "false",
    "DISCORD_WEBHOOK_URL": "",
    "DISCORD_USERNAME": "Claude Code",
    
    // NEW - Email
    "EMAIL_ENABLED": "false",
    "EMAIL_FROM": "",
    "EMAIL_TO": "",
    "EMAIL_SMTP_HOST": "smtp.gmail.com",
    "EMAIL_SMTP_PORT": "587",
    "EMAIL_SMTP_USER": "",
    "EMAIL_SMTP_PASS": ""
  }
}
```

### .env file for sensitive data
```bash
# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Email
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASS=app-specific-password
```

## Integration Strategy

1. **Keep all existing notifications** - Audio and desktop continue working as-is
2. **Add new handlers alongside** - Discord and email are additional, not replacements
3. **Optional enablement** - Each remote notification can be individually enabled/disabled
4. **Shared activity tracking** - All notifications use the same activity tracker
5. **Remove SMS code** - Clean up the SMS implementation we started

## Benefits of This Approach

1. **Local + Remote** - Get notifications both at your desk and away
2. **Flexible** - Enable only what you need
3. **No breaking changes** - Existing setup continues working
4. **Gradual adoption** - Add remote notifications when convenient
5. **Multiple channels** - Can use Discord AND email simultaneously

## Security Considerations

1. **Webhook URLs** - Store in .env file
2. **Email passwords** - Use app-specific passwords
3. **No sensitive data** - Don't send secrets in notifications
4. **Rate limiting** - Implement daily limits
5. **Event filtering** - Choose which events trigger remote notifications

## Testing Strategy

1. Update `test-notifications.js` to include new providers
2. Each provider can be tested independently
3. Mock modes for development
4. Test with notifications enabled/disabled

## Next Steps

1. Remove SMS implementation
2. Implement Discord webhook handler
3. Implement email handler
4. Update test suite
5. Create setup documentation

### 📝 Ready to proceed?
This approach keeps your existing local notifications while adding remote capabilities. Would you like me to start implementing Discord webhooks first?