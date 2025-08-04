param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectName
)

# Create app ID based on project name
$AppId = "com.claude.$ProjectName"
$AppDisplayName = $ProjectName
$IconPath = "$PSScriptRoot\claude-icon.png"

# Registry path
$RegPath = "HKCU:\SOFTWARE\Classes\AppUserModelId\$AppId"

try {
    # Create the registry key
    if (!(Test-Path $RegPath)) {
        New-Item -Path $RegPath -Force | Out-Null
    }

    # Set properties
    Set-ItemProperty -Path $RegPath -Name "DisplayName" -Value $AppDisplayName -Force
    
    if (Test-Path $IconPath) {
        Set-ItemProperty -Path $RegPath -Name "IconUri" -Value $IconPath -Force
        Set-ItemProperty -Path $RegPath -Name "IconBackgroundColor" -Value "0" -Force
    }

    Write-Host "Registered: $AppDisplayName" -ForegroundColor Green
    Write-Host "App ID: $AppId" -ForegroundColor Cyan
    
    # Return the app ID for use in notifications
    return $AppId
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    return $null
}