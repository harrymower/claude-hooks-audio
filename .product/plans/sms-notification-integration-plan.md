# SMS/Text Message Notification Integration Plan

## Overview
Add SMS/text message notifications as a third notification channel for Claude Code hooks, complementing the existing audio and desktop notifications.

## Implementation Options

### Option A: Twilio Integration (Recommended) //HM - yes. lets go with this option. 
**Pros:**
- Industry-standard SMS API
- Reliable delivery
- Global coverage
- Detailed delivery reports
- Rich features (MMS, WhatsApp, etc.)

**Cons:**
- Requires Twilio account
- Costs money per SMS ($0.0079 per SMS in US)
- Requires API credentials

**Implementation Notes:**
```typescript
// Example Twilio usage
import twilio from 'twilio';
const client = twilio(accountSid, authToken);
await client.messages.create({
  body: 'Claude completed task',
  from: '+1234567890',
  to: '+0987654321'
});
```

### Option B: Email-to-SMS Gateway (Free Alternative)
**Pros:**
- Completely free
- No API required
- Simple implementation

**Cons:**
- Requires knowing recipient's carrier
- Less reliable
- US-only (mostly)
- No delivery confirmation

**Carrier Gateways:**
- AT&T: `number@txt.att.net`
- Verizon: `number@vtext.com`
- T-Mobile: `number@tmomail.net`
- Sprint: `number@messaging.sprintpcs.com`

## Technical Architecture

### Directory Structure
```
.claude/hooks/sms-notifications/
├── handler.ts              # Main SMS handler
├── sms-mapping.json        # Event-to-message mappings
├── providers/
│   ├── twilio.ts          # Twilio implementation
│   └── email-gateway.ts    # Email-to-SMS implementation
└── README.md              # Setup instructions
```

### Configuration (settings.json)
```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          // ... existing hooks ...
          {
            "type": "command",
            "command": "npx tsx .claude/hooks/sms-notifications/handler.ts"
          }
        ]
      }
    ],
    "Notification": [
      {
        "matcher": "*",
        "hooks": [
          // ... existing hooks ...
          {
            "type": "command",
            "command": "npx tsx .claude/hooks/sms-notifications/handler.ts"
          }
        ]
      }
    ]
  },
  "env": {
    // Existing env vars...
    "SMS_ENABLED": "true",
    "SMS_PROVIDER": "twilio",  // or "email_gateway"
    "SMS_FROM": "+1234567890",  // Twilio phone or email
    "SMS_TO": "+0987654321",    // Recipient
    "SMS_DAILY_LIMIT": "10",    // Cost control
    "SMS_EVENTS": "stop,notification",  // Which events to send
    
    // Twilio-specific
    "TWILIO_ACCOUNT_SID": "your_account_sid",
    "TWILIO_AUTH_TOKEN": "your_auth_token",
    
    // Email gateway-specific
    "SMS_CARRIER": "att",  // att, verizon, tmobile, etc.
    "SMTP_HOST": "smtp.gmail.com",
    "SMTP_USER": "your-email@gmail.com",
    "SMTP_PASS": "your-app-password"
  }
}
```

### Message Filtering Strategy //HM - we should do this for the other notifications as well. 

**High Priority (Always Send):**
- Task completion (stop event) ✅
- Permission required notifications ⚠️
- Errors/failures ❌

**Medium Priority (Configurable):**
- Important tool uses (Bash commands)
- File modifications

**Low Priority (Never Send):**
- File reads
- Search operations
- Minor tool uses

### Cost Control Features
1. **Daily SMS limit** - Hard cap on messages per day //HM - this is the only one we need. 
2. **Rate limiting** - Max 1 SMS per 5 minutes //HM - remove
3. **Message batching** - Combine multiple events within 30-second window //HM - remove
4. **Dry-run mode** - Test without sending actual SMS //HM - keep for testing

### Sample Message Templates

**Task Completion:**
```
Claude completed task in [project-name]
Summary: [activity-summary]
Duration: [time]
```

**Permission Required:**
```
Claude needs permission in [project-name]
Action: [requested-action]
Reply STOP to disable SMS
```

**Error/Failure:**
```
Claude encountered error in [project-name]
Error: [error-message]
Check your terminal
```

## Implementation Steps

### Phase 1: Core Infrastructure
1. Create directory structure
2. Implement base SMS handler with HookEvent interface
3. Create sms-mapping.json with message templates
4. Add rate limiting and daily limit logic

### Phase 2: Provider Implementation
1. Implement Twilio provider with error handling
2. Implement email gateway provider
3. Add provider selection logic based on SMS_PROVIDER env var
4. Test both providers independently

### Phase 3: Integration
1. Add SMS handler to settings.json hooks
2. Update activity tracker integration
3. Add SMS-specific entries to test-notifications.js
4. Create setup documentation

### Phase 4: Polish
1. Add message batching for rapid events
2. Implement cost tracking/reporting
3. Add opt-out handling (STOP replies)
4. Create troubleshooting guide

## Testing Strategy

### Unit Tests
- Mock SMS providers
- Test rate limiting logic
- Test message template rendering
- Test daily limit enforcement

### Integration Tests
```javascript
// Add to test-notifications.js
{
  name: "SMS: Task Complete",
  event: { hook_event_name: "Stop" },
  handlers: ['voice', 'push', 'sms']
},
{
  name: "SMS: Permission Required",
  event: { 
    hook_event_name: "Notification", 
    notification: { type: "permission_required" }
  },
  handlers: ['voice', 'push', 'sms']
}
```

### Manual Testing
1. Test with `SMS_ENABLED=false` (should skip silently)
2. Test rate limiting (rapid events)
3. Test daily limit enforcement
4. Test both providers with real phone numbers

## Security Considerations

### Credential Storage
- Use environment variables only
- Never commit credentials
- Document secure setup in README

### Input Validation
- Validate phone numbers (E.164 format)
- Sanitize message content
- Limit message length (160 chars for SMS)

### Privacy
- Don't log message content in production
- Implement message retention policy
- Allow users to opt-out

## Maintenance Considerations

### Monitoring
- Log SMS send attempts and failures
- Track daily usage vs limits
- Monitor provider API errors

### Updates
- Keep Twilio SDK updated
- Monitor carrier gateway changes
- Update message templates based on feedback

## User Documentation

### Setup Guide
1. Choose your SMS provider
2. Configure environment variables
3. Test with dry-run mode
4. Enable for production

### Troubleshooting
- Common error messages and solutions
- How to check SMS delivery status
- Rate limit and daily limit explanations

## Future Enhancements

### V2 Features
- WhatsApp integration (via Twilio)
- Multiple recipient support
- Custom message templates per project
- SMS commands (pause/resume Claude)

### V3 Features
- Telegram bot integration
- Discord webhook support
- Slack notifications
- Custom webhook endpoints

---

## Decision Points for Implementation

### 🤔 Questions to Answer:

1. **Primary SMS Provider**
   - [ ] Twilio (recommended for reliability)
   - [ ] Email-to-SMS (free but limited)
   - [ ] Both (with fallback)

2. **Default Event Filtering**
   - [ ] Only critical events (stop, permission)
   - [ ] All events with smart filtering
   - [ ] User-configurable per event type

3. **Message Format**
   - [ ] Short and concise (< 160 chars)
   - [ ] Detailed with multiple SMS if needed
   - [ ] User-customizable templates

4. **Cost Control Priority**
   - [ ] Strict limits (may miss notifications)
   - [ ] Flexible with warnings
   - [ ] No limits (user manages externally)

5. **Implementation Timeline**
   - [ ] Full implementation now
   - [ ] Phased approach (core first, enhancements later)
   - [ ] MVP with single provider only

### 📝 Notes Section:
_Add your comments and feedback here:_

---

### 🚀 Ready to Implement?
Once you've reviewed and provided feedback on the decision points above, we can proceed with the implementation following your preferences.