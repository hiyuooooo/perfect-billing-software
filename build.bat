@echo off
echo =============================================
echo    Billing Software - Build for Windows
echo =============================================
echo.

echo Installing dependencies...
call npm install
if errorlevel 1 goto error

echo.
echo Building application...
call npm run build
if errorlevel 1 goto error

echo.
echo Creating Windows executable...
call npm run pack:exe:win
if errorlevel 1 goto error

echo.
echo =============================================
echo ✅ Build completed successfully!
echo.
echo 📁 Files created:
echo    • executables/fusion-starter-win.exe
echo    • dist/spa/ (web files)
echo.
echo 🚀 To run: Double-click the .exe file
echo 🌐 Or deploy dist/spa/ folder to web server
echo =============================================
pause
goto end

:error
echo.
echo ❌ Build failed! Check the error messages above.
echo.
echo 💡 Try:
echo    1. Make sure Node.js is installed
echo    2. Run: npm install
echo    3. Check internet connection
echo.
pause

:end
