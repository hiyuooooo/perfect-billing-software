@echo off
echo.
echo ===============================================
echo  Creating Working BillMaster Pro Executable
echo ===============================================
echo.

echo Building application...
call npm run build

echo.
echo Creating executable...
call npx pkg dist/server/node-build.js --targets node18-win-x64 --out-path working-exe

echo.
echo Creating portable package...
if not exist "BillMaster-Ready" mkdir "BillMaster-Ready"

echo Copying executable...
copy working-exe\node-build.exe BillMaster-Ready\BillMaster.exe

echo Copying web assets...
xcopy /E /I /Y dist\spa BillMaster-Ready\spa

echo Creating launcher...
echo @echo off > BillMaster-Ready\Start-BillMaster.bat
echo echo Starting BillMaster Pro... >> BillMaster-Ready\Start-BillMaster.bat
echo echo Web interface will open at http://localhost:8080 >> BillMaster-Ready\Start-BillMaster.bat
echo echo. >> BillMaster-Ready\Start-BillMaster.bat
echo timeout /t 2 /nobreak ^> nul >> BillMaster-Ready\Start-BillMaster.bat
echo start http://localhost:8080 >> BillMaster-Ready\Start-BillMaster.bat
echo BillMaster.exe >> BillMaster-Ready\Start-BillMaster.bat

echo.
echo ===============================================
echo  SUCCESS! Working Executable Created
echo ===============================================
echo.
echo Your ready-to-use package is in: BillMaster-Ready\
echo.
echo Contents:
echo   - BillMaster.exe (main application)
echo   - spa\ folder (web interface files)
echo   - Start-BillMaster.bat (launcher)
echo.
echo To use: Double-click Start-BillMaster.bat
echo.
pause
