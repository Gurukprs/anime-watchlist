@echo off
echo Stopping Node servers...

REM This kills ALL node.exe processes. OK if you only use Node for this app.
taskkill /F /IM node.exe >nul 2>&1

echo Done.
pause
