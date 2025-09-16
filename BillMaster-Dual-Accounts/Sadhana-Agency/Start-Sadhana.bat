@echo off
echo Starting Sadhana Agency...
echo URL: http://localhost:8080
timeout /t 2 /nobreak > nul
start http://localhost:8080
echo.
echo Sadhana Agency Server Running
echo Keep this window open.
echo.
Sadhana-Agency.exe
