@echo off
REM Go to this script's directory (project root)
cd /d "%~dp0"

REM Start the dev servers
REM /c means "run this and then exit this cmd"
npm run dev
