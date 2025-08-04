# Email Notifications for Claude Code Hooks

This module provides email notifications for Claude Code events with HTML formatting.

## Features

- HTML and plain text email support
- Professional email templates
- Gmail SMTP integration
- Project context and timestamps
- Works on all email clients and devices

## Setup Instructions

### 1. Set Up Gmail App Password

If using Gmail (recommended):

1. Go to your Google Account settings
2. Navigate to **Security** → **2-Step Verification**
3. Scroll down to **App passwords**
4. Generate a new app password for "Mail"
5. Copy the 16-character app password

### 2. Configure Environment Variables

Add your email credentials to the `.env` file:

```bash
# Email SMTP Credentials
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASS=your-16-char-app-password
```

Then enable email notifications in `.claude/settings.json`:

```json
"env": {
  "EMAIL_ENABLED": "true",
  "EMAIL_FROM": "your-email@gmail.com",
  "EMAIL_TO": "recipient@example.com",
  "EMAIL_SMTP_HOST": "smtp.gmail.com",
  "EMAIL_SMTP_PORT": "587"
}
```

### 3. Test the Setup

Run the test command to verify everything is working:

```bash
npm test
```

Check your email inbox for the test notifications!

## Configuration Options

### EMAIL_ENABLED
- `true`: Enable email notifications
- `false`: Disable email notifications (default)

### EMAIL_FROM / EMAIL_TO
- Sender and recipient email addresses
- Can be the same email for self-notifications

### SMTP Settings (for other providers)
- **Gmail**: `smtp.gmail.com:587`
- **Outlook**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **Custom**: Set your provider's SMTP settings

## Message Templates

Edit `email-mapping.json` to customize email content:

```json
{
  "stop": {
    "subject": "✅ Task Completed - [project-name]",
    "template": "Claude has completed a task in [project-name].\n\nActivity Summary:\n[activity-summary]\n\nCompleted at [timestamp]",
    "priority": "high"
  }
}
```

### Available Variables
- `[project-name]`: Current project directory name
- `[activity-summary]`: Summary of recent activities
- `[timestamp]`: When the event occurred
- `[requested-action]`: For permission requests

## Email Format

Emails include both HTML and plain text versions:

- **HTML version**: Styled with CSS, professional appearance
- **Plain text version**: Simple fallback for text-only email clients
- **Automatic detection**: Email client chooses best format

## Priority System

Only messages with `"priority": "high"` are sent by default to avoid inbox spam.

Current priorities:
- **High**: Task completion, permission requests
- **Medium**: File edits, command execution (not sent)
- **Low**: File reads, searches (not sent)

## Troubleshooting

### Emails not being sent
1. Check `EMAIL_ENABLED` is set to `"true"`
2. Verify SMTP credentials are correct
3. Ensure Gmail app password is active
4. Check firewall/antivirus blocking SMTP port 587

### Emails going to spam
1. Add sender to your contacts
2. Mark first email as "Not Spam"
3. Consider using a custom email domain
4. Check SPF/DKIM records if using custom domain

### Authentication errors
- **Gmail**: Use app password, not account password
- **2FA required**: Enable 2-factor authentication first
- **Less secure apps**: Not needed with app passwords

### Testing SMTP connection
```bash
# Test SMTP connection manually
telnet smtp.gmail.com 587
```

## Multiple Recipients

To send to multiple recipients, separate emails with commas in settings.json:

```json
"EMAIL_TO": "email1@example.com,email2@example.com,email3@example.com"
```

## Custom Email Providers

For non-Gmail providers, update SMTP settings:

```json
"EMAIL_SMTP_HOST": "your-smtp-server.com",
"EMAIL_SMTP_PORT": "587",
"EMAIL_SMTP_USER": "your-username",
"EMAIL_SMTP_PASS": "your-password"
```

## Security Notes

- Store credentials in `.env` file (never commit to Git)
- Use app passwords instead of account passwords
- Consider using dedicated email account for notifications
- Regularly rotate app passwords for security
- Enable 2FA on your email account

## Mobile Email Setup

1. Add your email account to your phone's email app
2. Enable push notifications for new emails
3. Consider creating a VIP/Priority inbox rule
4. Test with a notification to ensure mobile alerts work

Email notifications will appear as push notifications when new emails arrive!