# Claude Code Hooks Reference

## Overview

Claude Code hooks allow you to extend and customize tool behavior through configurable scripts that run at different stages of interaction.

## Configuration

Hooks are configured in settings files:
- `~/.claude/settings.json` - User settings
- `.claude/settings.json` - Project settings
- `.claude/settings.local.json` - Local project settings
- Enterprise managed policy settings

### Hook Structure

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",
        "hooks": [
          {
            "type": "command",
            "command": "your-command-here"
          }
        ]
      }
    ]
  }
}
```

## Hook Events

### PreToolUse
Runs before tool execution. Common matchers include:
- `Task` - Subagent tasks
- `Bash` - Shell commands
- `Read` - File reading
- `Write` - File writing
- `WebSearch` - Web operations

### PostToolUse
Runs after successful tool completion, using similar matchers to PreToolUse.

### Other Events
- `Notification` - Triggered by tool permission requests or idle periods
- `UserPromptSubmit` - Runs before processing user prompts
- `Stop` - Runs when main agent finishes responding
- `SubagentStop` - Runs when subagent completes
- `PreCompact` - Runs before context compaction
- `SessionStart` - Runs when starting or resuming a session

## Hook Input

Hooks receive JSON input via stdin with session information and event-specific data:

```json
{
  "session_id": "string",
  "transcript_path": "path/to/conversation.jsonl",
  "cwd": "current/working/directory",
  "hook_event_name": "EventName",
  // Event-specific fields
}
```

## Hook Output

Hooks can control execution through:
1. Exit codes
2. JSON output with decision control

### JSON Output Example

```json
{
  "decision": "block" | "approve",
  "message": "Optional message to explain decision"
}
```