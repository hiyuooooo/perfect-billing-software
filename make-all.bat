@echo off
echo.
echo ===============================================
echo  Creating Executables for All Platforms
echo ===============================================
echo.

echo Installing dependencies...
call npm install

echo.
echo Building for Windows, macOS, and Linux...
call npm run pack:exe:all

echo.
echo ===============================================
echo  Build Complete!
echo ===============================================
echo.
echo Your executables are ready in executables\ folder:
echo   - Windows: node-build.exe
echo   - macOS:   node-build-macos
echo   - Linux:   node-build-linux
echo.
echo File sizes: ~30-35MB each
echo.
pause
