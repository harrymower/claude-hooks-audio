@echo off
echo === Claude Code Screenshot Tool ===
echo.
echo This tool helps you capture screenshots and automatically
echo formats the file path for pasting into Claude Code.
echo.
echo Choose mode:
echo 1. Simple Mode (Menu-based)
echo 2. Advanced Mode (Global Hotkeys + System Tray)
echo.
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo Starting Simple Mode...
    powershell -ExecutionPolicy Bypass -File "%~dp0claude-screenshot-tool.ps1"
) else if "%choice%"=="2" (
    echo.
    echo Starting Advanced Mode with Hotkeys...
    echo.
    echo Hotkeys:
    echo - Win+Shift+F : Capture Fullscreen
    echo - Win+Shift+C : Capture Selection
    echo.
    echo Look for icon in system tray!
    start /min powershell -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0claude-screenshot-hotkey.ps1"
) else (
    echo Invalid choice!
    pause
)