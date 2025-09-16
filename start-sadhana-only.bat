@echo off
echo.
echo ===============================================
echo  Starting Sadhana Agency Only
echo ===============================================
echo.

echo Building application...
call npm run build:client
call npm run build:multi-server

echo.
echo Starting Sadhana Agency server on port 8080...
echo.

timeout /t 2 /nobreak > nul

echo Opening web browser...
start http://localhost:8080

echo.
echo ===============================================
echo  Sadhana Agency Server Starting...
echo ===============================================
echo.
echo 🏢 Account: Sadhana Agency
echo 🌐 URL: http://localhost:8080
echo 💾 Data Storage: Separate from other accounts
echo.
echo Keep this window open to run the server.
echo Close this window to stop the application.
echo.

npm run start:sadhana
