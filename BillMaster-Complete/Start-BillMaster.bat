@echo off
echo.
echo ===============================================
echo    BillMaster Pro - Starting Application
echo ===============================================
echo.
echo Starting server...
echo Web interface will open automatically at:
echo http://localhost:8080
echo.
echo Please wait while the application loads...
timeout /t 3 /nobreak > nul

echo Opening web browser...
start http://localhost:8080

echo.
echo Server starting... (this window must stay open)
echo Close this window to stop the application.
echo.

BillMaster.exe
