@echo off
:: Create a batch file to start the app and ngrok
:: This script is designed to be placed in the project root

cd /d "%~dp0"

echo Starting Next.js App...
start "Next.js App" cmd /k "npm run dev"

timeout /t 5 /nobreak >nul

echo Starting Ngrok...
start "Ngrok Tunnel" cmd /k "ngrok http 8000"

echo Done! You can close this window, but keep the other two open.
timeout /t 5
exit
