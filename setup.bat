@echo off
echo Aloha Bail Bond Management System - Desktop Setup
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

REM Create Aloha Bail Bond folder on Desktop
set DESKTOP=%USERPROFILE%\Desktop
set ALOHA_DIR=%DESKTOP%\AlohaBailBond
set DATA_DIR=%USERPROFILE%\Documents\AlohaBailBond Data

echo Creating Aloha Bail Bond application folder...
if not exist "%ALOHA_DIR%" mkdir "%ALOHA_DIR%"

echo Creating data storage folder...
if not exist "%DATA_DIR%" mkdir "%DATA_DIR%"

REM Install dependencies if package.json exists
if exist package.json (
    echo Installing application dependencies...
    call npm install
)

REM Create desktop shortcut
echo Creating desktop shortcut...
set SHORTCUT_PATH=%DESKTOP%\AlohaBailBond.url
(
echo [InternetShortcut]
echo URL=http://localhost:5000
echo IconIndex=0
) > "%SHORTCUT_PATH%"

REM Create startup script
echo Creating startup script...
set STARTUP_SCRIPT=%DESKTOP%\Start-AlohaBailBond.bat
(
echo @echo off
echo title Aloha Bail Bond Management System
echo echo Starting Aloha Bail Bond...
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
set BACKUP_SCRIPT=%DESKTOP%\Backup-AlohaBailBond-Data.bat
(
echo @echo off
echo title Aloha Bail Bond Data Backup
echo set BACKUP_DATE=%%date:~-4,4%%%%date:~-10,2%%%%date:~-7,2%%
echo set BACKUP_DIR=%USERPROFILE%\Desktop\AlohaBailBond-Backup-%%BACKUP_DATE%%
echo echo Creating backup of Aloha Bail Bond data...
echo mkdir "%%BACKUP_DIR%%"
echo xcopy /E /I /Y "%DATA_DIR%" "%%BACKUP_DIR%%"
echo echo Backup completed: %%BACKUP_DIR%%
echo pause
) > "%BACKUP_SCRIPT%"

echo.
echo ================================================
echo Aloha Bail Bond Setup Complete!
echo ================================================
echo.
echo Installation Details:
echo - Data storage: %DATA_DIR%
echo - Desktop shortcuts created
echo.
echo To start Aloha Bail Bond:
echo 1. Double-click "Start-AlohaBailBond.bat" on your desktop
echo 2. Wait for the system to start (about 30 seconds)
echo 3. Click the "AlohaBailBond" shortcut to open in browser
echo.
echo To backup your data:
echo - Run "Backup-AlohaBailBond-Data.bat" on your desktop
echo.
echo Your client data is stored locally on this computer in:
echo %DATA_DIR%
echo.
echo IMPORTANT: Regular backups are recommended!
echo.
pause