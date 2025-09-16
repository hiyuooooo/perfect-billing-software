@echo off
echo Starting Himalaya Traders...
echo URL: http://localhost:8081
timeout /t 2 /nobreak > nul
start http://localhost:8081
echo.
echo Himalaya Traders Server Running  
echo Keep this window open.
echo.
Himalaya-Traders.exe
