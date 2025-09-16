@echo off
echo.
echo ===============================================
echo  Creating Dual Account Executables
echo ===============================================
echo.

echo Building applications...
call npm run build:client
call npm run build:multi-server

if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo Creating executables...

echo Creating Sadhana Agency executable...
call npx pkg dist/multi-server/sadhana-server.js --targets node18-win-x64 --out-path temp-sadhana

echo Creating Himalaya Traders executable...  
call npx pkg dist/multi-server/himalaya-server.js --targets node18-win-x64 --out-path temp-himalaya

echo.
echo Creating dual account package...
if exist "BillMaster-Dual-Accounts" rmdir /s /q "BillMaster-Dual-Accounts"
mkdir "BillMaster-Dual-Accounts"

echo Setting up Sadhana Agency...
mkdir "BillMaster-Dual-Accounts\Sadhana-Agency"
copy temp-sadhana\sadhana-server.exe "BillMaster-Dual-Accounts\Sadhana-Agency\Sadhana-Agency.exe"
xcopy /E /I /Y dist\spa "BillMaster-Dual-Accounts\Sadhana-Agency\spa"

echo Setting up Himalaya Traders...
mkdir "BillMaster-Dual-Accounts\Himalaya-Traders"
copy temp-himalaya\himalaya-server.exe "BillMaster-Dual-Accounts\Himalaya-Traders\Himalaya-Traders.exe"
xcopy /E /I /Y dist\spa "BillMaster-Dual-Accounts\Himalaya-Traders\spa"

echo Creating launchers...

rem Sadhana Agency launcher
(
echo @echo off
echo echo Starting Sadhana Agency...
echo echo URL: http://localhost:8080
echo timeout /t 2 /nobreak ^> nul
echo start http://localhost:8080
echo echo.
echo echo Sadhana Agency Server Running
echo echo Keep this window open.
echo echo.
echo Sadhana-Agency.exe
) > "BillMaster-Dual-Accounts\Sadhana-Agency\Start-Sadhana.bat"

rem Himalaya Traders launcher
(
echo @echo off
echo echo Starting Himalaya Traders...
echo echo URL: http://localhost:8081
echo timeout /t 2 /nobreak ^> nul
echo start http://localhost:8081
echo echo.
echo echo Himalaya Traders Server Running  
echo echo Keep this window open.
echo echo.
echo Himalaya-Traders.exe
) > "BillMaster-Dual-Accounts\Himalaya-Traders\Start-Himalaya.bat"

rem Dual launcher
(
echo @echo off
echo echo.
echo echo ===============================================
echo echo  Starting Both Account Servers
echo echo ===============================================
echo echo.
echo echo Starting Sadhana Agency on port 8080...
echo start "Sadhana Agency" cmd /k "cd Sadhana-Agency && Start-Sadhana.bat"
echo.
echo timeout /t 3 /nobreak ^> nul
echo.
echo echo Starting Himalaya Traders on port 8081...
echo start "Himalaya Traders" cmd /k "cd Himalaya-Traders && Start-Himalaya.bat"
echo.
echo echo.
echo echo ===============================================
echo echo  Both Accounts Started Successfully!
echo echo ===============================================
echo echo.
echo echo 🏢 Sadhana Agency:     http://localhost:8080
echo echo 🏢 Himalaya Traders:   http://localhost:8081
echo echo.
echo echo Each account runs independently with separate data.
echo echo Close individual windows to stop each account.
echo echo.
echo pause
) > "BillMaster-Dual-Accounts\Start-Both-Accounts.bat"

rem README
(
echo ===============================================
echo   BillMaster Pro - Dual Account Setup
echo ===============================================
echo.
echo QUICK START:
echo 1. Double-click "Start-Both-Accounts.bat" to run both
echo 2. OR run individual accounts:
echo    - Sadhana-Agency\Start-Sadhana.bat
echo    - Himalaya-Traders\Start-Himalaya.bat
echo.
echo ACCOUNTS:
echo • Sadhana Agency:    http://localhost:8080
echo • Himalaya Traders:  http://localhost:8081
echo.
echo FEATURES:
echo ✓ Completely separate data storage
echo ✓ Independent bill numbering
echo ✓ Separate customer databases
echo ✓ Individual stock management
echo ✓ Account-specific settings
echo ✓ Run both simultaneously
echo.
echo Each account is a complete billing system.
echo Data is stored separately in browser localStorage.
echo.
echo ===============================================
) > "BillMaster-Dual-Accounts\README.txt"

echo Cleaning up...
rmdir /s /q temp-sadhana
rmdir /s /q temp-himalaya

echo.
echo ===============================================
echo  SUCCESS! Dual Account Package Created
echo ===============================================
echo.
echo Package location: BillMaster-Dual-Accounts\
echo.
echo Contents:
echo   📁 Sadhana-Agency\
echo      ├── Sadhana-Agency.exe
echo      ├── spa\ (web files)
echo      └── Start-Sadhana.bat
echo.
echo   📁 Himalaya-Traders\
echo      ├── Himalaya-Traders.exe  
echo      ├── spa\ (web files)
echo      └── Start-Himalaya.bat
echo.
echo   🚀 Start-Both-Accounts.bat (runs both)
echo   📖 README.txt (instructions)
echo.
echo TO USE:
echo • Run both: Start-Both-Accounts.bat
echo • Individual: Go to each folder and run Start-*.bat
echo.
echo ✅ DUAL ACCOUNT SETUP COMPLETE!
echo.
pause
