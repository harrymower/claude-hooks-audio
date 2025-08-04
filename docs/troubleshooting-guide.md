# Troubleshooting Guide for Claude Code Notifications

## Issue: Not hearing audio or seeing desktop notifications

### Possible Causes and Solutions

#### 1. Hook Event Names are Case-Sensitive
Based on the Claude Code documentation, hook event names are case-sensitive. Your configuration uses:
- `Stop` (capital S)
- `PreToolUse` (camelCase)
- `Notification` (capital N)

These should match exactly what Claude Code sends.

#### 2. Windows Audio Playback Issues
On Windows, the audio playback might fail silently if:
- The Windows Media Player is not installed or configured
- The audio files are corrupted or in an incompatible format
- System audio is muted or disabled

**Solution**: Test audio playback directly:
```bash
# Test if PowerShell can play the audio
powershell -c "(New-Object Media.SoundPlayer '.claude/hooks/voice-notifications/sounds/alfred/success.wav').PlaySync()"
```

#### 3. Desktop Notification Permissions
Windows might block notifications if:
- Notifications are disabled in Windows Settings
- The app doesn't have permission to show notifications
- Focus Assist is enabled

**Solution**: Check Windows notification settings:
1. Open Windows Settings → System → Notifications
2. Ensure notifications are enabled
3. Check if Node.js/npm has permission to show notifications

#### 4. Hook Input Format
The hooks receive input via stdin in JSON format. The current handlers expect:
- `hook_event_name` field (not `hook`)
- Proper JSON escaping for Windows paths

#### 5. Testing Individual Components

Test voice notifications:
```bash
echo {"hook_event_name":"Stop","session_id":"test","cwd":"."} | npx tsx .claude/hooks/voice-notifications/handler.ts
```

Test desktop notifications:
```bash
echo {"hook_event_name":"Stop","session_id":"test","cwd":"."} | npx tsx .claude/hooks/desktop-notifications/handler.ts
```

#### 6. Debug Mode
The debug handler is logging events to `.claude/hooks/debug-events.log`. Check this file to see:
- If hooks are being triggered
- What data is being received
- Any parsing errors

#### 7. Common Windows Issues
- **Path escaping**: Windows paths need double backslashes in JSON
- **Shell execution**: Use `npx.cmd` instead of `npx` on Windows
- **File permissions**: Ensure the .wav files are readable

### Next Steps

1. **Verify hook triggering**: Check if the debug log shows hook events when you use Claude Code
2. **Test audio system**: Try playing the .wav files directly using Windows Media Player
3. **Check notification settings**: Ensure Windows allows notifications from Node.js applications
4. **Validate JSON format**: Make sure the hook input matches what the handlers expect

### Hook Configuration Reference

Your current configuration in `.claude/settings.json`:
```json
{
  "hooks": {
    "Stop": [...],
    "PreToolUse": [...],
    "Notification": [...]
  }
}
```

Make sure these event names match exactly what Claude Code sends. You can verify by checking the `hook_event_name` field in the debug log.