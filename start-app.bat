@echo off
echo Starting Employee Payroll Management System...
echo.
echo Make sure you have MySQL running on your machine!
echo.

echo Starting backend server...
start cmd /k "cd backend && node server.js"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo Testing connection to backend...
node test-connection.js

echo.
echo Starting frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo Application started! 
echo Backend running on http://localhost:5000
echo Frontend running on http://localhost:5173
echo.
echo Press any key to exit this window (servers will continue running)
pause > nul
