@echo off
setlocal

cd /d "%~dp0"

where powershell >nul 2>nul
if errorlevel 1 (
  echo PowerShell is required to run Aimura AI on Windows.
  echo Install PowerShell or run npm install and npm run dev manually.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0open_aimura_windows.ps1"
set EXIT_CODE=%ERRORLEVEL%

if not "%EXIT_CODE%"=="0" (
  echo.
  echo Aimura AI exited with code %EXIT_CODE%.
  pause
)

exit /b %EXIT_CODE%
