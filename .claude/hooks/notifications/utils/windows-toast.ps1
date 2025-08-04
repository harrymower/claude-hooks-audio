param(
    [string]$Title = "Claude Code",
    [string]$Message = "Notification",
    [string]$IconPath = "",
    [string]$AppId = "Claude Code"
)

[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null

# Create the toast XML template
$template = @"
<toast>
    <visual>
        <binding template="ToastGeneric">
            <text>$Title</text>
            <text>$Message</text>
            $(if ($IconPath -and (Test-Path $IconPath)) { "<image placement='appLogoOverride' src='file:///$($IconPath.Replace('\','/'))'/>" })
        </binding>
    </visual>
</toast>
"@

# Load the XML
$xml = New-Object Windows.Data.Xml.Dom.XmlDocument
$xml.LoadXml($template)

# Create and show the toast
$toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
$notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($AppId)
$notifier.Show($toast)