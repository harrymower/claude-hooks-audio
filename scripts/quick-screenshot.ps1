# PowerShell script for quick screenshot to file
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Capture the screen
$screen = [System.Windows.Forms.SystemInformation]::VirtualScreen
$bitmap = New-Object System.Drawing.Bitmap $screen.Width, $screen.Height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($screen.Left, $screen.Top, 0, 0, $bitmap.Size)

# Save to clipboard AND file
[System.Windows.Forms.Clipboard]::SetImage($bitmap)

# Save to file with timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$filepath = "$env:USERPROFILE\Desktop\screenshot_$timestamp.png"
$bitmap.Save($filepath, [System.Drawing.Imaging.ImageFormat]::Png)

# Clean up
$graphics.Dispose()
$bitmap.Dispose()

Write-Host "Screenshot saved to: $filepath"
Write-Host "Also copied to clipboard"

# Open in default viewer (optional)
Start-Process $filepath