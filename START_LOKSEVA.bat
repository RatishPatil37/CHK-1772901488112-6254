@echo off
echo ==========================================
echo   LOKSEVA - Full Stack Startup Script
echo ==========================================
echo.

echo [1/3] Clearing ports 3000, 5000, 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 :5000 :5173"') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo All ports cleared.
echo.

echo [2/3] Starting Backend on port 5000...
start "LOKSEVA Backend" cmd /k "cd /d "H:\ChakravyuhPandharpur\combined code folder (1)\Vedant\combined code folder\LokSevaAI_MERN\backend" && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend Dashboard on port 3000...
start "LOKSEVA Frontend" cmd /k "cd /d "H:\ChakravyuhPandharpur\combined code folder (1)\Vedant\combined code folder\LokSevaAI_MERN\frontend" && npm start"

timeout /t 3 /nobreak >nul

echo [4/4] Starting Data Collection on port 5173...
start "LOKSEVA Data Collection" cmd /k "cd /d "H:\ChakravyuhPandharpur\combined code folder (1)\Vedant\combined code folder\LokSevaAI\data collection" && npm run dev"

echo.
echo ==========================================
echo   All 3 servers starting in new windows!
echo.
echo   Backend:         http://localhost:5000
echo   Frontend:        http://localhost:3000
echo   Data Collection: http://localhost:5173
echo ==========================================
pause
