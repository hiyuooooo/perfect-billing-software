@echo off
echo.
echo ===============================================
echo  Starting Himalaya Traders Only
echo ===============================================
echo.

echo Building application...
call npm run build:client
call npm run build:multi-server

echo.
echo Starting Himalaya Traders server on port 8081...
echo.

timeout /t 2 /nobreak > nul

echo Opening web browser...
start http://localhost:8081

echo.
echo ===============================================
echo  Himalaya Traders Server Starting...
echo ===============================================
echo.
echo 🏢 Account: Himalaya Traders  
echo 🌐 URL: http://localhost:8081
echo 💾 Data Storage: Separate from other accounts
echo.
echo Keep this window open to run the server.
echo Close this window to stop the application.
echo.

npm run start:himalaya
