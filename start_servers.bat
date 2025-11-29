@echo off
REM Change to the folder where this script is located
cd /d "%~dp0"

REM Go into backend
cd backend

REM Start the server
REM Using "node src/server.js" is enough; the window will be hidden by the VBS wrapper
@REM replace this with npm run dev to start development server
node src/server.js
