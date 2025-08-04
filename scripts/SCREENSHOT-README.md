# Claude Code Screenshot Tools

Since Claude Code doesn't support direct clipboard image pasting (yet), these tools help you quickly capture screenshots and get the file path ready to paste.

## 🚀 Quick Start

### Option 1: QUICK-SCREENSHOT.bat (Simplest)
1. Double-click `QUICK-SCREENSHOT.bat`
2. Select area to capture
3. Path is automatically copied - just paste in Claude Code!

### Option 2: START-SCREENSHOT-TOOL.bat (More Features)
- **Simple Mode**: Menu-based interface
- **Advanced Mode**: Global hotkeys + system tray

## 📁 Files Created

All screenshots are saved to:
```
C:\Users\[YourName]\Pictures\ClaudeScreenshots\
```

## 🎯 How It Works

1. **Capture**: Uses Windows Snipping Tool
2. **Save**: Automatically saves with timestamp
3. **Copy**: Puts this in clipboard: `Look at this screenshot: C:\path\to\screenshot.png`
4. **Paste**: Just Ctrl+V in Claude Code!

## ⌨️ Hotkeys (Advanced Mode)

- `Win+Shift+F` - Capture fullscreen
- `Win+Shift+C` - Capture selection
- System tray icon for easy access

## 🛠️ Troubleshooting

### "Script cannot be loaded"
Run this in PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Screenshots not saving
- Check if `C:\Users\[YourName]\Pictures\ClaudeScreenshots\` exists
- Make sure you complete the selection in Snipping Tool

## 💡 Tips

1. **Create Desktop Shortcut**: Right-click `QUICK-SCREENSHOT.bat` → Send to → Desktop
2. **Pin to Taskbar**: Create shortcut, then pin it
3. **Keyboard Shortcut**: Right-click shortcut → Properties → Set shortcut key

## 📝 Example Usage

1. See something on screen you want to show Claude
2. Run QUICK-SCREENSHOT
3. Select the area
4. In Claude Code, just paste: "Look at this screenshot: C:\Users\..."

Claude will then be able to see and analyze your screenshot!