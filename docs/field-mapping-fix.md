# Field Mapping Issue Fix

## Problem
The handlers are expecting the wrong field names. Claude Code sends:
- `hook_event_name` (e.g., "PreToolUse", "Stop", "Notification")
- `tool_name` (e.g., "Read", "Write", "Bash")
- `tool_input` (contains the parameters)

But the handlers are looking for:
- `event.hook` (should be `event.hook_event_name`)
- `event.tool` (should be `event.tool_name`)
- `event.params` (should be `event.tool_input`)

## Solution
Update the HookEvent interface and handleEvent method in both handlers to match Claude Code's actual output.

### Voice Notification Handler Changes

1. Update the HookEvent interface:
```typescript
interface HookEvent {
  hook_event_name: string;  // was: hook
  tool_name?: string;       // was: tool
  tool_input?: any;         // was: params
  notification?: {
    type: string;
    message: string;
  };
}
```

2. Update the handleEvent method:
```typescript
public async handleEvent(event: HookEvent): Promise<void> {
  let sounds: string[] | undefined;
  switch (event.hook_event_name.toLowerCase()) {  // Add toLowerCase() and use hook_event_name
    case 'stop':
      sounds = this.soundMapping.stop;
      break;
    case 'notification':
      if (event.notification?.type === 'permission_required') {
        sounds = this.soundMapping.notification?.permission_required;
      } else {
        sounds = this.soundMapping.notification?.default;
      }
      break;
    case 'pretooluse':  // lowercase version
      if (event.tool_name) {
        sounds = this.getContextualSound(event.tool_name, event.tool_input);
      }
      break;
  }
  // ... rest of the method
}
```

3. Update getContextualSound to use tool_input:
```typescript
private getContextualSound(tool: string, params: any): string[] | undefined {
  // Change params to tool_input references
}
```

### Desktop Notification Handler Changes

Apply the same changes to the desktop notification handler.

## Testing
After making these changes, the handlers should properly respond to Claude Code's hook events.