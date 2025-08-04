# Claude Code Screenshot Tool with Global Hotkeys
# Hotkeys: Win+Shift+F (Fullscreen), Win+Shift+W (Window), Win+Shift+S (Selection)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Windows.Forms;

public class GlobalHotkey {
    [DllImport("user32.dll")]
    private static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);
    
    [DllImport("user32.dll")]
    private static extern bool UnregisterHotKey(IntPtr hWnd, int id);
    
    private const uint MOD_ALT = 0x0001;
    private const uint MOD_CONTROL = 0x0002;
    private const uint MOD_SHIFT = 0x0004;
    private const uint MOD_WIN = 0x0008;
    
    public static bool Register(IntPtr handle, int id, Keys key, bool ctrl, bool alt, bool shift, bool win) {
        uint modifiers = 0;
        if (ctrl) modifiers |= MOD_CONTROL;
        if (alt) modifiers |= MOD_ALT;
        if (shift) modifiers |= MOD_SHIFT;
        if (win) modifiers |= MOD_WIN;
        
        return RegisterHotKey(handle, id, modifiers, (uint)key);
    }
    
    public static bool Unregister(IntPtr handle, int id) {
        return UnregisterHotKey(handle, id);
    }
}

public class HotkeyForm : Form {
    public delegate void HotkeyPressed(int id);
    public event HotkeyPressed OnHotkeyPressed;
    
    protected override void WndProc(ref Message m) {
        const int WM_HOTKEY = 0x0312;
        
        if (m.Msg == WM_HOTKEY) {
            int id = m.WParam.ToInt32();
            OnHotkeyPressed?.Invoke(id);
        }
        
        base.WndProc(ref m);
    }
}
"@

# Configuration
$screenshotFolder = "$env:USERPROFILE\Pictures\ClaudeScreenshots"
if (!(Test-Path $screenshotFolder)) {
    New-Item -ItemType Directory -Path $screenshotFolder | Out-Null
}

# Screenshot functions (reuse from previous script)
function Capture-FullScreen {
    $screen = [System.Windows.Forms.SystemInformation]::VirtualScreen
    $bitmap = New-Object System.Drawing.Bitmap $screen.Width, $screen.Height
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.CopyFromScreen($screen.Left, $screen.Top, 0, 0, $bitmap.Size)
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $filename = "fullscreen_$timestamp.png"
    $filepath = Join-Path $screenshotFolder $filename
    
    $bitmap.Save($filepath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
    
    return $filepath
}

function Show-Toast {
    param([string]$Message)
    
    $balloon = New-Object System.Windows.Forms.NotifyIcon
    $balloon.Icon = [System.Drawing.SystemIcons]::Information
    $balloon.BalloonTipTitle = "Claude Screenshot Tool"
    $balloon.BalloonTipText = $Message
    $balloon.Visible = $true
    $balloon.ShowBalloonTip(3000)
    
    Start-Sleep -Seconds 3
    $balloon.Dispose()
}

function Copy-PathForClaude {
    param([string]$FilePath)
    
    # Format for Claude Code
    $claudeFormat = "Look at screenshot: $FilePath"
    [System.Windows.Forms.Clipboard]::SetText($claudeFormat)
    
    # Play sound
    [System.Media.SystemSounds]::Asterisk.Play()
    
    # Show notification
    Show-Toast "Path copied: $FilePath"
}

# Create form for hotkey handling
$form = New-Object HotkeyForm
$form.Text = "Claude Screenshot Hotkeys"
$form.WindowState = [System.Windows.Forms.FormWindowState]::Minimized
$form.ShowInTaskbar = $false

# Register hotkeys
# Win+Shift+F = Fullscreen (ID: 1)
[GlobalHotkey]::Register($form.Handle, 1, [System.Windows.Forms.Keys]::F, $false, $false, $true, $true)

# Win+Shift+W = Window (ID: 2)  
[GlobalHotkey]::Register($form.Handle, 2, [System.Windows.Forms.Keys]::W, $false, $false, $true, $true)

# Win+Shift+S = Selection (ID: 3)
# Note: This might conflict with Windows built-in, so we'll use Win+Shift+C instead
[GlobalHotkey]::Register($form.Handle, 3, [System.Windows.Forms.Keys]::C, $false, $false, $true, $true)

# Handle hotkey events
$form.Add_OnHotkeyPressed({
    param($id)
    
    switch ($id) {
        1 { # Fullscreen
            $filepath = Capture-FullScreen
            Copy-PathForClaude -FilePath $filepath
        }
        2 { # Active Window
            # Implementation would go here (similar to fullscreen)
            Show-Toast "Window capture not implemented yet"
        }
        3 { # Selection
            # Launch snipping tool
            Start-Process "ms-screenclip:"
            Show-Toast "Use Snipping Tool, then run tool to process"
        }
    }
})

# System tray icon
$trayIcon = New-Object System.Windows.Forms.NotifyIcon
$trayIcon.Icon = [System.Drawing.SystemIcons]::Application
$trayIcon.Text = "Claude Screenshot Tool"
$trayIcon.Visible = $true

# Context menu
$contextMenu = New-Object System.Windows.Forms.ContextMenu
$menuFullscreen = New-Object System.Windows.Forms.MenuItem "Capture Fullscreen (Win+Shift+F)"
$menuWindow = New-Object System.Windows.Forms.MenuItem "Capture Window (Win+Shift+W)"
$menuSelection = New-Object System.Windows.Forms.MenuItem "Capture Selection (Win+Shift+C)"
$menuFolder = New-Object System.Windows.Forms.MenuItem "Open Screenshot Folder"
$menuExit = New-Object System.Windows.Forms.MenuItem "Exit"

$menuFullscreen.Add_Click({
    $filepath = Capture-FullScreen
    Copy-PathForClaude -FilePath $filepath
})

$menuFolder.Add_Click({
    Start-Process explorer.exe $screenshotFolder
})

$menuExit.Add_Click({
    $trayIcon.Visible = $false
    [GlobalHotkey]::Unregister($form.Handle, 1)
    [GlobalHotkey]::Unregister($form.Handle, 2)
    [GlobalHotkey]::Unregister($form.Handle, 3)
    $form.Close()
    [System.Windows.Forms.Application]::Exit()
})

$contextMenu.MenuItems.AddRange(@($menuFullscreen, $menuWindow, $menuSelection, "-", $menuFolder, "-", $menuExit))
$trayIcon.ContextMenu = $contextMenu

# Show initial notification
Show-Toast "Claude Screenshot Tool is running. Win+Shift+F for fullscreen"

# Run the application
[System.Windows.Forms.Application]::Run($form)