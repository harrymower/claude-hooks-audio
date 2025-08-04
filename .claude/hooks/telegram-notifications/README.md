# Telegram Notifications for Claude Code Hooks

This module provides Telegram bot notifications for Claude Code events with rich Markdown formatting.

## Features

- Instant push notifications worldwide
- Rich Markdown formatting with bold, code blocks, etc.
- Completely free with no limits
- Works on all devices (mobile, desktop, web)
- Simple HTTP API integration
- No webhooks required

## Setup Instructions

### 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Start a conversation and send `/newbot`
3. Follow the prompts to create your bot:
   - Choose a name (e.g., "Claude Code Notifications")
   - Choose a username (e.g., "your_claude_bot")
4. **Save the bot token** that BotFather gives you

### 2. Get Your Chat ID

Option A: **Start a chat with your bot**
1. Find your bot by its username
2. Send it a message (e.g., "/start")
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Look for your `chat.id` in the response

Option B: **Use a helper bot**
1. Search for `@userinfobot` in Telegram
2. Start it and it will show your chat ID

### 3. Configure Environment Variables

Add your bot credentials to the `.env` file:

```bash
# Telegram Bot Credentials
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=1234567890
```

Then enable Telegram notifications in `.claude/settings.json`:

```json
"env": {
  "TELEGRAM_ENABLED": "true",
  "TELEGRAM_BOT_TOKEN": "",
  "TELEGRAM_CHAT_ID": ""
}
```

### 4. Test the Setup

Run the test command to verify everything is working:

```bash
npm test
```

Check your Telegram for the test notifications!

## Configuration Options

### TELEGRAM_ENABLED
- `true`: Enable Telegram notifications
- `false`: Disable Telegram notifications (default)

### TELEGRAM_BOT_TOKEN
- Your bot token from @BotFather
- Store in `.env` file for security

### TELEGRAM_CHAT_ID
- Your personal chat ID or group chat ID
- Can be negative for group chats

## Message Templates

Edit `telegram-mapping.json` to customize notification appearance:

```json
{
  "stop": {
    "template": "✅ *Task Completed*\\n\\nClaude completed: [activity-summary] in *[project-name]*\\n\\n🕐 Time: [timestamp]",
    "priority": "high",
    "parse_mode": "Markdown"
  }
}
```

### Available Variables
- `[project-name]`: Current project directory name
- `[activity-summary]`: Summary of recent activities
- `[timestamp]`: When the event occurred
- `[requested-action]`: For permission requests

### Markdown Formatting
Telegram supports rich formatting:
- `*bold text*`
- `_italic text_`
- `\`inline code\``
- `\`\`\`code block\`\`\``
- `[link text](http://example.com)`

## Priority System

Only messages with `"priority": "high"` are sent by default to reduce noise.

Current priorities:
- **High**: Task completion, permission requests
- **Medium**: File edits, command execution (not sent)
- **Low**: File reads, searches (not sent)

## Group Chat Support

To send notifications to a group:

1. Add your bot to the group
2. Make the bot an admin (optional, for better reliability)
3. Get the group chat ID (negative number)
4. Use the group chat ID in `TELEGRAM_CHAT_ID`

## Troubleshooting

### Messages not being sent
1. Check `TELEGRAM_ENABLED` is set to `"true"`
2. Verify bot token is correct and complete
3. Ensure chat ID is correct (try both positive and negative)
4. Test bot token with curl:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe"
```

### Bot not responding
- **Bot blocked**: Unblock the bot in Telegram
- **Invalid token**: Create a new bot with @BotFather
- **Wrong chat ID**: Get your chat ID again

### Testing the API manually
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "<YOUR_CHAT_ID>", "text": "Test from Claude Code!"}'
```

### Common error messages
- **"Unauthorized"**: Wrong bot token
- **"Bad Request: chat not found"**: Wrong chat ID
- **"Forbidden: bot was blocked by the user"**: Unblock the bot

## Security Notes

- Store bot token in `.env` file (never commit to Git)
- Bot tokens are sensitive - treat them like passwords
- Consider using a dedicated bot for notifications
- Regularly check active sessions in Telegram settings

## Advanced Features

### Custom Parse Modes
- `"Markdown"`: Basic formatting (default)
- `"HTML"`: HTML-style formatting
- `null`: Plain text only

### Multiple Recipients
To send to multiple chats, you can:
1. Add multiple bots with different chat IDs
2. Create a group and add all recipients
3. Use a channel and subscribe recipients

### Bot Commands
You can add custom commands to your bot:
1. Talk to @BotFather
2. Send `/setcommands`
3. Add commands like:
   ```
   status - Check Claude status
   help - Show help information
   ```

## Mobile Setup

1. Install Telegram mobile app
2. Enable push notifications in Telegram settings
3. The bot will send notifications directly to your chat
4. Notifications appear instantly as push notifications

Perfect for staying updated when away from your computer!