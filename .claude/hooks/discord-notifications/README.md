# Discord Notifications for Claude Code Hooks

This module provides Discord webhook notifications for Claude Code events using rich embeds.

## Features

- Rich Discord embeds with colors and formatting
- Instant push notifications on mobile
- Project context and activity summaries
- Timestamp and footer information
- Completely free with no limits

## Setup Instructions

### 1. Create Discord Webhook

1. Open Discord and go to your server
2. Go to **Server Settings** → **Integrations** → **Webhooks**
3. Click **Create Webhook**
4. Choose the channel where you want notifications
5. Customize the webhook name (optional)
6. Copy the **Webhook URL**

### 2. Configure Environment Variables

Add your webhook URL to the `.env` file:

```bash
# Discord Webhook URL
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

Then enable Discord notifications in `.claude/settings.json`:

```json
"env": {
  "DISCORD_ENABLED": "true",
  "DISCORD_USERNAME": "Claude Code",
  "DISCORD_AVATAR_URL": ""
}
```

### 3. Test the Setup

Run the test command to verify everything is working:

```bash
npm test
```

Check your Discord channel for the test notifications!

## Configuration Options

### DISCORD_ENABLED
- `true`: Enable Discord notifications
- `false`: Disable Discord notifications (default)

### DISCORD_USERNAME
- Custom username for the webhook (default: "Claude Code")

### DISCORD_AVATAR_URL
- Custom avatar URL for the webhook (optional)

## Message Templates

Edit `discord-mapping.json` to customize notification appearance:

```json
{
  "stop": {
    "title": "✅ Task Completed",
    "description": "Claude completed: [activity-summary] in **[project-name]**",
    "color": 3066993,
    "priority": "high"
  }
}
```

### Available Variables
- `[project-name]`: Current project directory name
- `[activity-summary]`: Summary of recent activities
- `[timestamp]`: When the event occurred
- `[requested-action]`: For permission requests

### Discord Colors
- Green (success): 3066993
- Yellow (warning): 16776960
- Blue (info): 3447003
- Gray (neutral): 9807270
- Red (error): 15158332

## Priority System

Only messages with `"priority": "high"` are sent by default to reduce noise.

Current priorities:
- **High**: Task completion, permission requests
- **Medium**: File edits, command execution (not sent)
- **Low**: File reads, searches (not sent)

## Troubleshooting

### Discord notifications not appearing
1. Check `DISCORD_ENABLED` is set to `"true"`
2. Verify webhook URL is correct and complete
3. Ensure webhook channel exists and bot has permissions
4. Check Discord mobile app notification settings

### Testing webhooks
You can test your webhook URL directly:

```bash
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message from Claude Code!"}'
```

### Common issues
- **Invalid webhook URL**: Make sure you copied the complete URL
- **Webhook deleted**: If someone deleted the webhook, create a new one
- **Channel permissions**: Ensure the webhook can post to the channel

## Security Notes

- Store webhook URLs in `.env` file (never commit to Git)
- Webhook URLs are sensitive - treat them like passwords
- Consider using Discord's webhook permissions to limit access
- Regularly rotate webhook URLs if needed

## Discord Mobile Setup

1. Install Discord mobile app
2. Enable push notifications in Discord settings
3. Join the server where notifications will be sent
4. Test with a message to ensure mobile notifications work

Notifications will appear as push notifications when you're away from Discord!