# PowerShell script to register custom app ID for Windows notifications
# Run as Administrator

$AppId = "com.claude.hooks"
$AppName = "Claude Hooks"
$IconPath = "$PSScriptRoot\claude-icon.png"

# Registry path for Toast notifications
$RegPath = "HKCU:\SOFTWARE\Classes\AppUserModelId\$AppId"

# Check if running as admin
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "This script needs to be run as Administrator to register the app properly." -ForegroundColor Yellow
    Write-Host "Creating user-level registration instead..." -ForegroundColor Yellow
}

try {
    # Create the registry key
    if (!(Test-Path $RegPath)) {
        New-Item -Path $RegPath -Force | Out-Null
    }

    # Set the display name
    Set-ItemProperty -Path $RegPath -Name "DisplayName" -Value $AppName -Force

    # Set the icon if the file exists
    if (Test-Path $IconPath) {
        Set-ItemProperty -Path $RegPath -Name "IconUri" -Value $IconPath -Force
        Set-ItemProperty -Path $RegPath -Name "IconBackgroundColor" -Value "0" -Force
    }

    # Set additional properties
    Set-ItemProperty -Path $RegPath -Name "ShowInSettings" -Value 1 -PropertyType DWord -Force

    Write-Host "Successfully registered app: $AppName" -ForegroundColor Green
    Write-Host "App ID: $AppId" -ForegroundColor Green
    Write-Host ""
    Write-Host "To use this in notifications, update the appID to: $AppId" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error registering app: $_" -ForegroundColor Red
}

# Show current registration
Write-Host "`nCurrent registration:" -ForegroundColor Yellow
Get-ItemProperty -Path $RegPath -ErrorAction SilentlyContinue | Format-List