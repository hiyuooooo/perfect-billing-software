@echo off
echo.
echo ===============================================
echo  Starting Both Account Servers
echo ===============================================
echo.
echo Starting Sadhana Agency on port 8080...
start "Sadhana Agency" cmd /k "cd Sadhana-Agency && Start-Sadhana.bat"

timeout /t 3 /nobreak > nul

echo Starting Himalaya Traders on port 8081...
start "Himalaya Traders" cmd /k "cd Himalaya-Traders && Start-Himalaya.bat"

echo.
echo ===============================================
echo  Both Accounts Started Successfully!
echo ===============================================
echo.
echo 🏢 Sadhana Agency:     http://localhost:8080
echo 🏢 Himalaya Traders:   http://localhost:8081
echo.
echo Each account runs independently with separate data.
echo Close individual windows to stop each account.
echo.
pause
