# Script to update Twilio phone number in settings
param(
    [Parameter(Mandatory=$true)]
    [string]$NewPhoneNumber
)

$settingsPath = Join-Path $PSScriptRoot "..\\.claude\\settings.json"

# Validate phone number format
if ($NewPhoneNumber -notmatch '^\+1\d{10}$') {
    Write-Host "Error: Phone number must be in format +1XXXXXXXXXX" -ForegroundColor Red
    Write-Host "Example: +16091234567" -ForegroundColor Yellow
    exit 1
}

# Read current settings
$settings = Get-Content $settingsPath -Raw | ConvertFrom-Json

# Update the phone number
$oldNumber = $settings.env.SMS_FROM
$settings.env.SMS_FROM = $NewPhoneNumber

# Save updated settings
$settings | ConvertTo-Json -Depth 10 | Set-Content $settingsPath

Write-Host "✓ Updated Twilio phone number!" -ForegroundColor Green
Write-Host "  Old: $oldNumber" -ForegroundColor Gray
Write-Host "  New: $NewPhoneNumber" -ForegroundColor Cyan
Write-Host ""
Write-Host "SMS notifications will now be sent from: $NewPhoneNumber" -ForegroundColor Yellow