@echo off
echo.
echo ===============================================
echo  Starting BillMaster Pro - Dual Accounts
echo ===============================================
echo.

echo Building multi-server applications...
call npm run build:client
call npm run build:multi-server

echo.
echo Starting both account servers...
echo.

echo Starting Sadhana Agency on port 8080...
start "Sadhana Agency - Port 8080" cmd /k "echo 🏢 Sadhana Agency Server && npm run start:sadhana"

timeout /t 3 /nobreak > nul

echo Starting Himalaya Traders on port 8081...
start "Himalaya Traders - Port 8081" cmd /k "echo 🏢 Himalaya Traders Server && npm run start:himalaya"

timeout /t 5 /nobreak > nul

echo.
echo Opening web browsers...
echo 🌐 Sadhana Agency: http://localhost:8080
start http://localhost:8080

timeout /t 2 /nobreak > nul

echo 🌐 Himalaya Traders: http://localhost:8081
start http://localhost:8081

echo.
echo ===============================================
echo  Both Accounts Running Successfully!
echo ===============================================
echo.
echo 🏢 Sadhana Agency:     http://localhost:8080
echo 🏢 Himalaya Traders:   http://localhost:8081
echo.
echo Each account has its own separate data storage.
echo Close the individual command windows to stop each server.
echo.
pause
