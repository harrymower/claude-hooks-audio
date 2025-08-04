# PowerShell script to create Windows-compatible icon
param(
    [string]$InputPath = "..\assets\icons\claude-icon.png",
    [string]$OutputPath = "..\assets\icons\claude-icon-windows.ico"
)

# Load Windows Forms for image handling
Add-Type -AssemblyName System.Drawing

try {
    # Load the PNG image
    $png = [System.Drawing.Image]::FromFile((Resolve-Path $InputPath))
    
    # Create ICO file
    $icon = [System.Drawing.Icon]::FromHandle($png.GetHicon())
    
    # Save as ICO
    $fs = New-Object System.IO.FileStream($OutputPath, 'Create')
    $icon.Save($fs)
    $fs.Close()
    
    Write-Host "Icon created successfully: $OutputPath"
    
    # Clean up
    $icon.Dispose()
    $png.Dispose()
} catch {
    Write-Error "Failed to create icon: $_"
}