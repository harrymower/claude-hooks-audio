# PowerShell script to convert WebP to PNG using Windows Imaging Component

Add-Type -AssemblyName System.Drawing

$webpPath = "D:\CodingProjects\claude-hooks-audo\.product\icon.webp"
$pngPath = "$PSScriptRoot\claude-icon.png"

try {
    # Try to load and convert using .NET
    $image = [System.Drawing.Image]::FromFile($webpPath)
    $image.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $image.Dispose()
    
    Write-Host "Successfully converted icon to PNG!" -ForegroundColor Green
    Write-Host "Saved to: $pngPath" -ForegroundColor Cyan
} catch {
    Write-Host "Could not convert using .NET. Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative methods:" -ForegroundColor Yellow
    Write-Host "1. Open the WebP file in Paint and save as PNG"
    Write-Host "2. Use an online converter like cloudconvert.com"
    Write-Host "3. Install ImageMagick: winget install ImageMagick.ImageMagick"
    Write-Host "   Then run: magick convert `"$webpPath`" `"$pngPath`""
}