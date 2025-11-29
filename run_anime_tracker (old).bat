@echo off
REM Start Anime Watchlist (backend + frontend)

REM Go to the folder where this .bat file is located
cd /d "%~dp0"

REM Install root dev dependency (concurrently) if node_modules not present
IF NOT EXIST "node_modules" (
    echo Installing root dependencies...
    npm install
)

echo Starting backend and frontend...
npm run dev

pause
