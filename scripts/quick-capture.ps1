# Quick Screenshot Capture for Claude Code
# Super simple - just captures and copies path

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Create folder
$folder = "$env:USERPROFILE\Pictures\ClaudeScreenshots"
if (!(Test-Path $folder)) {
    New-Item -ItemType Directory -Path $folder | Out-Null
}

# Launch Windows snipping tool
Write-Host "Select area to capture..." -ForegroundColor Yellow
Start-Process "ms-screenclip:" -Wait

# Wait a moment for clipboard
Start-Sleep -Milliseconds 500

# Check if image is in clipboard
if ([System.Windows.Forms.Clipboard]::ContainsImage()) {
    $image = [System.Windows.Forms.Clipboard]::GetImage()
    
    # Save with timestamp
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $filepath = Join-Path $folder "screenshot_$timestamp.png"
    $image.Save($filepath, [System.Drawing.Imaging.ImageFormat]::Png)
    $image.Dispose()
    
    # Copy path to clipboard
    $claudeText = "Look at this screenshot: $filepath"
    [System.Windows.Forms.Clipboard]::SetText($claudeText)
    
    # Show result
    Write-Host "`n✓ Screenshot saved!" -ForegroundColor Green
    Write-Host "File: $filepath" -ForegroundColor Cyan
    Write-Host "`n✓ Path copied to clipboard!" -ForegroundColor Green
    Write-Host "Just paste (Ctrl+V) in Claude Code" -ForegroundColor Yellow
    
    # Play sound
    [System.Media.SystemSounds]::Asterisk.Play()
    
    # Keep window open briefly
    Start-Sleep -Seconds 3
} else {
    Write-Host "No screenshot captured!" -ForegroundColor Red
    Start-Sleep -Seconds 2
}