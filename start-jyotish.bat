@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not available in PATH.
  echo You can still open index.html directly, but the local API server needs Node.js.
  pause
  exit /b 1
)

echo Starting Jyotish Digital Darpan...
echo URL: http://localhost:3000
echo.
start "" "http://localhost:3000"
node server.js
echo.
echo Server stopped. Press any key to close.
pause >nul
