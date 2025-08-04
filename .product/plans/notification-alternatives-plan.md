# Alternative Notification Methods Plan

## Overview
Since SMS requires business verification and costs, this plan outlines better alternatives for notifications when you're away from your computer.

## Proposed Notification Methods

### 1. Discord Webhooks (Recommended) //HM - comment here
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

### 3. Telegram Bot (Power Users)
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

### 4. Pushbullet (Simplest) //HM - remove pushbullet
**Pros:**
- Very easy setup
- Works across all devices
- Browser extensions available
- File sharing support

**Cons:**
- Limited to 100/month on free tier
- Requires account

**Implementation:**
- Simple REST API
- Cross-device syncing
- Link sharing

## Implementation Plan

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

### Phase 3: Universal Handler
```
.claude/hooks/universal-notifications/
├── handler.ts              # Routes to appropriate provider
├── providers/
│   ├── discord.ts
│   ├── email.ts
│   ├── telegram.ts
│   └── pushbullet.ts
└── config.json
```

## Configuration Changes

### settings.json
```json
{
  "env": {
    // Existing...
    "NOTIFICATIONS_ENABLED": "true",
    "NOTIFICATION_PROVIDERS": "discord,email",  // Comma-separated
    
    // Discord
    "DISCORD_WEBHOOK_URL": "https://discord.com/api/webhooks/...",
    "DISCORD_USERNAME": "Claude Code",
    "DISCORD_AVATAR_URL": "https://...",
    
    // Email
    "EMAIL_ENABLED": "true",
    "EMAIL_FROM": "your-email@gmail.com",
    "EMAIL_TO": "recipient@example.com",
    "EMAIL_SMTP_HOST": "smtp.gmail.com",
    "EMAIL_SMTP_PORT": "587",
    "EMAIL_SMTP_USER": "your-email@gmail.com",
    "EMAIL_SMTP_PASS": "app-specific-password",
    
    // Telegram (optional)
    "TELEGRAM_BOT_TOKEN": "bot-token",
    "TELEGRAM_CHAT_ID": "chat-id"
  }
}
```

## Migration Path //HM - i want to keep audio and desktop and add these as additiional features. 

1. **Keep existing notifications** - Audio and desktop still work locally
2. **Add new providers** - Discord first, then email
3. **Gradual transition** - Can use multiple providers simultaneously
4. **Remove SMS** - Once alternatives are working

## Security Considerations

1. **Webhook URLs** - Store in .env file
2. **Email passwords** - Use app-specific passwords
3. **No sensitive data** - Don't send secrets in notifications
4. **Rate limiting** - Implement daily limits like SMS

## Testing Strategy

1. Update `test-notifications.js` to support new providers
2. Create provider-specific test commands
3. Mock modes for development
4. Integration tests for each provider

## Benefits Over SMS

1. **Free** - No per-message costs
2. **Rich formatting** - Colors, embeds, HTML
3. **Faster** - Instant push notifications
4. **More reliable** - No carrier filtering
5. **Better for development** - Clickable links, code formatting

## Questions to Answer:

1. **Primary notification method preference?**
   - [ ] Discord (recommended for developers)
   - [ ] Email (most universal)
   - [ ] Telegram (most powerful)
   - [ ] All of the above

2. **Notification events?**
   - [ ] Task completion only
   - [ ] Permissions required
   - [ ] Errors and failures
   - [ ] All events

3. **Implementation priority?**
   - [ ] Discord first
   - [ ] Email first
   - [ ] Both simultaneously

4. **Additional features?**
   - [ ] Daily summary digest
   - [ ] Notification grouping
   - [ ] Rich media (screenshots)
   - [ ] Action buttons

### 📝 Notes Section:
_Add your comments and feedback here:_

---

### 🚀 Ready to Implement?
Once you've reviewed and provided feedback on the options above, we can proceed with implementation.