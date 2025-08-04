# Testing Claude Code Notifications

## Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Subscribe to push notifications:**
   - Open https://ntfy.sh/claude-code-notifications-demo123 in your browser
   - Or install the ntfy app on your phone and subscribe to: `claude-code-notifications-demo123`

3. **Add test audio files (optional):**
   - For testing without real audio files, the system will log "Sound file not found" but continue working
   - To test with audio, create simple .wav files or download free ones

## Test Methods

### Method 1: Direct Handler Testing

Test the handlers directly by simulating hook events:

```bash
# Test voice notification - task complete
echo '{"hook":"stop","event":"stop"}' | tsx .claude/hooks/audio-notifications/handler.ts

# Test push notification - task complete
echo '{"hook":"stop","event":"stop"}' | tsx .claude/hooks/push-notifications/handler.ts

# Test reading a TypeScript file
echo '{"hook":"pre_tool_use","tool":"Read","params":{"file_path":"test.ts"}}' | tsx .claude/hooks/audio-notifications/handler.ts

# Test permission required
echo '{"hook":"notification","notification":{"type":"permission_required","message":"Need permission to edit"}}' | tsx .claude/hooks/push-notifications/handler.ts
```

### Method 2: Create Test Script

Create a test script to try all notification types:

```bash
# Create test script
cat > test-all-notifications.js << 'EOF'
const { execSync } = require('child_process');

const tests = [
  {
    name: "Task Complete",
    event: { hook: "stop", event: "stop" }
  },
  {
    name: "Permission Required",
    event: { hook: "notification", notification: { type: "permission_required", message: "Need permission" }}
  },
  {
    name: "Reading TypeScript",
    event: { hook: "pre_tool_use", tool: "Read", params: { file_path: "app.ts" }}
  },
  {
    name: "Editing Python",
    event: { hook: "pre_tool_use", tool: "Edit", params: { file_path: "main.py" }}
  },
  {
    name: "Running Command",
    event: { hook: "pre_tool_use", tool: "Bash", params: { command: "npm install" }}
  }
];

tests.forEach(test => {
  console.log(`\nTesting: ${test.name}`);
  const json = JSON.stringify(test.event);
  
  try {
    // Test voice
    execSync(`echo '${json}' | tsx .claude/hooks/audio-notifications/handler.ts`, { stdio: 'inherit' });
    
    // Test push (only for important events)
    if (test.event.hook === "stop" || test.event.hook === "notification") {
      execSync(`echo '${json}' | tsx .claude/hooks/push-notifications/handler.ts`, { stdio: 'inherit' });
    }
  } catch (e) {
    console.error(`Failed: ${e.message}`);
  }
});
EOF

# Run the test
node test-all-notifications.js
```

### Method 3: Test with Real Claude Code

The best way to test is using Claude Code itself:

1. **Start a new Claude Code session** in this project
2. **Ask Claude to read a file:**
   ```
   What's in the package.json file?
   ```
   - Should trigger: "Reading Package Config" notification

3. **Ask Claude to edit something:**
   ```
   Add a new script to package.json called "test"
   ```
   - Should trigger: "Editing File" notification
   - May trigger: "Permission Required" if Claude needs approval

4. **Let a task complete:**
   - Should trigger: "Task Complete" notification

## Debugging

### Check if notifications are sent:
1. Watch the browser tab at https://ntfy.sh/claude-code-notifications-demo123
2. Check console output for any errors
3. For voice notifications, check if you see "Sound file not found" messages

### Common Issues:

**No push notifications:**
- Check internet connection
- Verify the ntfy URL is correct
- Try sending a manual test: 
  ```bash
  curl -d "Test message" https://ntfy.sh/claude-code-notifications-demo123
  ```

**No voice notifications:**
- Check if tsx is installed: `npx tsx --version`
- Verify handler has execute permissions
- Check console for error messages

**"Sound file not found" errors:**
- This is expected if you haven't added .wav files yet
- System will continue working, just without audio

## Creating Test Audio Files

For quick testing without real audio files, create silent .wav files:

```bash
# Install sox (audio toolkit)
# Windows: choco install sox
# Mac: brew install sox
# Linux: apt-get install sox

# Create a 1-second silent wav file
sox -n -r 44100 -c 2 .claude/hooks/audio-notifications/sounds/alfred/task_complete_1.wav trim 0.0 1.0
```

Or use online text-to-speech services to generate voice files.