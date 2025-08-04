# PowerShell script to unregister custom app ID
# Run this if you want to remove the registration

$AppId = "com.claude.hooks"
$RegPath = "HKCU:\SOFTWARE\Classes\AppUserModelId\$AppId"

if (Test-Path $RegPath) {
    Remove-Item -Path $RegPath -Recurse -Force
    Write-Host "Successfully unregistered app ID: $AppId" -ForegroundColor Green
} else {
    Write-Host "App ID not found: $AppId" -ForegroundColor Yellow
}