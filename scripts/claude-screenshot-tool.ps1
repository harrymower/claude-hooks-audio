# Claude Code Screenshot Tool
# This tool captures screenshots and automatically copies the file path for easy pasting into Claude Code

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")]
    public static extern int GetWindowRect(IntPtr hwnd, out RECT lpRect);
    
    public struct RECT {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }
}
"@

# Configuration
$screenshotFolder = "$env:USERPROFILE\Pictures\ClaudeScreenshots"
$soundEnabled = $true

# Create screenshot folder if it doesn't exist
if (!(Test-Path $screenshotFolder)) {
    New-Item -ItemType Directory -Path $screenshotFolder | Out-Null
}

function Show-Notification {
    param(
        [string]$Title,
        [string]$Message,
        [string]$FilePath
    )
    
    # Create balloon notification
    $notification = New-Object System.Windows.Forms.NotifyIcon
    $notification.Icon = [System.Drawing.SystemIcons]::Information
    $notification.BalloonTipTitle = $Title
    $notification.BalloonTipText = $Message
    $notification.Visible = $true
    $notification.ShowBalloonTip(5000)
    
    # Clean up after 5 seconds
    Start-Sleep -Seconds 5
    $notification.Dispose()
}

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

function Capture-ActiveWindow {
    $hwnd = [Win32]::GetForegroundWindow()
    $rect = New-Object Win32+RECT
    [Win32]::GetWindowRect($hwnd, [ref]$rect) | Out-Null
    
    $width = $rect.Right - $rect.Left
    $height = $rect.Bottom - $rect.Top
    
    $bitmap = New-Object System.Drawing.Bitmap $width, $height
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.CopyFromScreen($rect.Left, $rect.Top, 0, 0, $bitmap.Size)
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $filename = "window_$timestamp.png"
    $filepath = Join-Path $screenshotFolder $filename
    
    $bitmap.Save($filepath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
    
    return $filepath
}

function Capture-Selection {
    # Launch snipping tool for selection
    Start-Process "ms-screenclip:" -Wait
    Start-Sleep -Milliseconds 500
    
    # Check if image is in clipboard
    if ([System.Windows.Forms.Clipboard]::ContainsImage()) {
        $image = [System.Windows.Forms.Clipboard]::GetImage()
        
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $filename = "selection_$timestamp.png"
        $filepath = Join-Path $screenshotFolder $filename
        
        $image.Save($filepath, [System.Drawing.Imaging.ImageFormat]::Png)
        $image.Dispose()
        
        return $filepath
    }
    return $null
}

function Copy-PathForClaude {
    param([string]$FilePath)
    
    # Format the path for Claude Code
    $claudeFormat = "Please look at the screenshot: $FilePath"
    
    # Copy to clipboard
    [System.Windows.Forms.Clipboard]::SetText($claudeFormat)
    
    # Also copy just the path as backup
    Set-Clipboard -Value $FilePath -Append
    
    # Play sound if enabled
    if ($soundEnabled) {
        [System.Media.SystemSounds]::Asterisk.Play()
    }
}

# Main menu
function Show-Menu {
    Write-Host "`n=== Claude Code Screenshot Tool ===" -ForegroundColor Cyan
    Write-Host "1. Capture Full Screen (F)" -ForegroundColor Yellow
    Write-Host "2. Capture Active Window (W)" -ForegroundColor Yellow
    Write-Host "3. Capture Selection (S)" -ForegroundColor Yellow
    Write-Host "4. Open Screenshot Folder (O)" -ForegroundColor Yellow
    Write-Host "5. Settings (T)" -ForegroundColor Yellow
    Write-Host "6. Exit (X)" -ForegroundColor Yellow
    Write-Host "=================================" -ForegroundColor Cyan
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "`nSelect option"
    
    switch ($choice.ToUpper()) {
        {$_ -in '1','F'} {
            Write-Host "`nCapturing full screen..." -ForegroundColor Green
            $filepath = Capture-FullScreen
            Copy-PathForClaude -FilePath $filepath
            Write-Host "✓ Screenshot saved: $filepath" -ForegroundColor Green
            Write-Host "✓ Path copied to clipboard for Claude Code!" -ForegroundColor Green
            Show-Notification -Title "Screenshot Captured" -Message "Path copied: $filepath" -FilePath $filepath
        }
        {$_ -in '2','W'} {
            Write-Host "`nCapturing active window..." -ForegroundColor Green
            $filepath = Capture-ActiveWindow
            Copy-PathForClaude -FilePath $filepath
            Write-Host "✓ Screenshot saved: $filepath" -ForegroundColor Green
            Write-Host "✓ Path copied to clipboard for Claude Code!" -ForegroundColor Green
            Show-Notification -Title "Window Captured" -Message "Path copied: $filepath" -FilePath $filepath
        }
        {$_ -in '3','S'} {
            Write-Host "`nUse mouse to select area..." -ForegroundColor Green
            $filepath = Capture-Selection
            if ($filepath) {
                Copy-PathForClaude -FilePath $filepath
                Write-Host "✓ Screenshot saved: $filepath" -ForegroundColor Green
                Write-Host "✓ Path copied to clipboard for Claude Code!" -ForegroundColor Green
                Show-Notification -Title "Selection Captured" -Message "Path copied: $filepath" -FilePath $filepath
            } else {
                Write-Host "✗ No selection made" -ForegroundColor Red
            }
        }
        {$_ -in '4','O'} {
            Start-Process explorer.exe $screenshotFolder
        }
        {$_ -in '5','T'} {
            Write-Host "`n--- Settings ---" -ForegroundColor Cyan
            Write-Host "Screenshot folder: $screenshotFolder" -ForegroundColor Gray
            Write-Host "Sound enabled: $soundEnabled" -ForegroundColor Gray
            Write-Host "Press any key to continue..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        {$_ -in '6','X'} {
            Write-Host "`nGoodbye!" -ForegroundColor Green
            break
        }
        default {
            Write-Host "`n✗ Invalid option" -ForegroundColor Red
        }
    }
    
    if ($choice.ToUpper() -ne 'X' -and $choice -ne '6') {
        Write-Host "`nPress any key to continue..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
    
} while ($choice.ToUpper() -ne 'X' -and $choice -ne '6')