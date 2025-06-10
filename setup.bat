@echo off
echo SecureBond Bail Management System - Desktop Setup
echo ================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed on this computer.
    echo Please download and install Node.js from: https://nodejs.org
    echo After installation, run this setup again.
    pause
    exit /b 1
)

echo ✓ Node.js found
echo.

REM Create SecureBond folder on Desktop
set DESKTOP=%USERPROFILE%\Desktop
set SECUREBOND_DIR=%DESKTOP%\SecureBond
set DATA_DIR=%USERPROFILE%\Documents\SecureBond Data

echo Creating SecureBond application folder...
if not exist "%SECUREBOND_DIR%" mkdir "%SECUREBOND_DIR%"

echo Creating data storage folder...
if not exist "%DATA_DIR%" mkdir "%DATA_DIR%"

REM Install dependencies if package.json exists
if exist package.json (
    echo Installing application dependencies...
    call npm install
)

REM Create desktop shortcut
echo Creating desktop shortcut...
set SHORTCUT_PATH=%DESKTOP%\SecureBond.url
(
echo [InternetShortcut]
echo URL=http://localhost:5000
echo IconIndex=0
) > "%SHORTCUT_PATH%"

REM Create startup script
echo Creating startup script...
set STARTUP_SCRIPT=%DESKTOP%\Start-SecureBond.bat
(
echo @echo off
echo title SecureBond Bail Management System
echo echo Starting SecureBond...
echo echo.
echo echo Data stored in: %DATA_DIR%
echo echo Web interface: http://localhost:5000
echo echo.
echo echo Please wait while the system starts...
echo npm run dev
echo pause
) > "%STARTUP_SCRIPT%"

REM Create data backup script
echo Creating backup script...
set BACKUP_SCRIPT=%DESKTOP%\Backup-SecureBond-Data.bat
(
echo @echo off
echo title SecureBond Data Backup
echo set BACKUP_DATE=%%date:~-4,4%%%%date:~-10,2%%%%date:~-7,2%%
echo set BACKUP_DIR=%USERPROFILE%\Desktop\SecureBond-Backup-%%BACKUP_DATE%%
echo echo Creating backup of SecureBond data...
echo mkdir "%%BACKUP_DIR%%"
echo xcopy /E /I /Y "%DATA_DIR%" "%%BACKUP_DIR%%"
echo echo Backup completed: %%BACKUP_DIR%%
echo pause
) > "%BACKUP_SCRIPT%"

echo.
echo ================================================
echo SecureBond Setup Complete!
echo ================================================
echo.
echo Installation Details:
echo - Data storage: %DATA_DIR%
echo - Desktop shortcuts created
echo.
echo To start SecureBond:
echo 1. Double-click "Start-SecureBond.bat" on your desktop
echo 2. Wait for the system to start (about 30 seconds)
echo 3. Click the "SecureBond" shortcut to open in browser
echo.
echo To backup your data:
echo - Run "Backup-SecureBond-Data.bat" on your desktop
echo.
echo Your client data is stored locally on this computer in:
echo %DATA_DIR%
echo.
echo IMPORTANT: Regular backups are recommended!
echo.
pause