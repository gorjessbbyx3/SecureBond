@echo off
echo SecureBond Bail Management System - Desktop Setup
echo ================================================
echo Professional bail bond management with advanced AI technology
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

REM Create SecureBond folder structure on Desktop
set DESKTOP=%USERPROFILE%\Desktop
set SECUREBOND_DIR=%DESKTOP%\SecureBond
set DATA_DIR=%USERPROFILE%\Documents\SecureBond Data
set CONFIG_DIR=%DATA_DIR%\Config
set BACKUP_DIR=%DATA_DIR%\Backups

echo Creating SecureBond application folder...
if not exist "%SECUREBOND_DIR%" mkdir "%SECUREBOND_DIR%"

echo Creating data storage folders...
if not exist "%DATA_DIR%" mkdir "%DATA_DIR%"
if not exist "%CONFIG_DIR%" mkdir "%CONFIG_DIR%"
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo Creating business configuration template...
set CONFIG_FILE=%CONFIG_DIR%\business-config.json
if not exist "%CONFIG_FILE%" (
    echo {> "%CONFIG_FILE%"
    echo   "companyName": "Your Bail Bond Company",>> "%CONFIG_FILE%"
    echo   "licenseNumber": "Enter Your License Number",>> "%CONFIG_FILE%"
    echo   "setupComplete": false,>> "%CONFIG_FILE%"
    echo   "adminAccountCreated": false>> "%CONFIG_FILE%"
    echo }>> "%CONFIG_FILE%"
)

REM Install dependencies if package.json exists
if exist package.json (
    echo Installing application dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies.
        echo Please check your internet connection and try again.
        pause
        exit /b 1
    )
    echo ✓ Dependencies installed successfully
) else (
    echo WARNING: package.json not found. Skipping dependency installation.
)

REM Create desktop shortcuts
echo Creating desktop shortcuts...
set SHORTCUT_PATH=%DESKTOP%\SecureBond-Dashboard.url
(
echo [InternetShortcut]
echo URL=http://localhost:5000
echo IconIndex=0
) > "%SHORTCUT_PATH%"

set ADMIN_SHORTCUT=%DESKTOP%\SecureBond-Admin.url
(
echo [InternetShortcut]
echo URL=http://localhost:5000/admin-login
echo IconIndex=0
) > "%ADMIN_SHORTCUT%"

REM Create startup script
echo Creating startup script...
set STARTUP_SCRIPT=%DESKTOP%\Start-SecureBond.bat
(
echo @echo off
echo title SecureBond Bail Management System
echo color 0A
echo echo ================================================
echo echo SecureBond Bail Management System
echo echo Professional Bail Bond Technology Platform
echo echo ================================================
echo echo.
echo echo Starting SecureBond...
echo echo Data storage: %DATA_DIR%
echo echo Admin portal: http://localhost:5000/admin-login
echo echo Staff portal: http://localhost:5000/staff-login
echo echo Client portal: http://localhost:5000/client-login
echo echo.
echo echo Please wait while the system initializes...
echo echo This may take 30-60 seconds on first startup.
echo echo.
echo cd /d "%~dp0"
echo npm run dev
echo echo.
echo echo System stopped. Press any key to exit.
echo pause
) > "%STARTUP_SCRIPT%"

REM Create data backup script
echo Creating backup script...
set BACKUP_SCRIPT=%DESKTOP%\Backup-SecureBond-Data.bat
(
echo @echo off
echo title SecureBond Data Backup System
echo color 0E
echo echo ================================================
echo echo SecureBond Data Backup System
echo echo ================================================
echo echo.
echo for /f "tokens=2 delims==" %%%%a in ('wmic OS Get localdatetime /value'^) do set "dt=%%%%a"
echo set BACKUP_DATE=%%dt:~0,8%%
echo set BACKUP_TIME=%%dt:~8,6%%
echo set BACKUP_DIR=%USERPROFILE%\Desktop\SecureBond-Backup-%%BACKUP_DATE%%-%%BACKUP_TIME%%
echo echo Creating comprehensive backup of SecureBond data...
echo echo Backup location: %%BACKUP_DIR%%
echo echo.
echo mkdir "%%BACKUP_DIR%%"
echo xcopy /E /I /Y "%DATA_DIR%" "%%BACKUP_DIR%%\Data"
echo xcopy /E /I /Y "%~dp0temp-data" "%%BACKUP_DIR%%\TempData" 2^>nul
echo echo.
echo echo ================================================
echo echo Backup completed successfully!
echo echo ================================================
echo echo Location: %%BACKUP_DIR%%
echo echo.
echo echo IMPORTANT: Store this backup in a secure location
echo echo away from this computer for maximum data protection.
echo echo.
echo pause
) > "%BACKUP_SCRIPT%"

REM Create system status script
echo Creating system status script...
set STATUS_SCRIPT=%DESKTOP%\SecureBond-System-Status.bat
(
echo @echo off
echo title SecureBond System Status
echo color 0B
echo echo ================================================
echo echo SecureBond System Status Check
echo echo ================================================
echo echo.
echo echo Checking Node.js installation...
echo where node ^>nul 2^>nul
echo if %%errorlevel%% neq 0 ^(
echo     echo ERROR: Node.js not found
echo ^) else ^(
echo     echo ✓ Node.js installed
echo     node --version
echo ^)
echo echo.
echo echo Checking data directories...
echo if exist "%DATA_DIR%" ^(
echo     echo ✓ Data directory exists: %DATA_DIR%
echo ^) else ^(
echo     echo WARNING: Data directory not found
echo ^)
echo echo.
echo echo Checking configuration...
echo if exist "%CONFIG_DIR%\business-config.json" ^(
echo     echo ✓ Business configuration file found
echo ^) else ^(
echo     echo INFO: Business setup required
echo ^)
echo echo.
echo echo System health check complete.
echo echo.
echo pause
) > "%STATUS_SCRIPT%"

echo.
echo ================================================
echo SecureBond Setup Complete!
echo ================================================
echo.
echo Installation Summary:
echo - Data storage: %DATA_DIR%
echo - Configuration: %CONFIG_DIR%
echo - Backups: %BACKUP_DIR%
echo - Desktop shortcuts created
echo.
echo ================================================
echo GETTING STARTED
echo ================================================
echo.
echo STEP 1 - Start the System:
echo   Double-click "Start-SecureBond.bat" on your desktop
echo   Wait 30-60 seconds for initialization
echo.
echo STEP 2 - Initial Setup:
echo   Click "SecureBond-Admin.url" to access admin portal
echo   Default login: admin / admin123
echo   Complete business setup in the "Business Setup" tab
echo.
echo STEP 3 - Create Staff Accounts:
echo   Use the Staff Management section to create accounts
echo   Set appropriate permissions for each role
echo.
echo ================================================
echo DAILY OPERATIONS
echo ================================================
echo.
echo Admin Portal: http://localhost:5000/admin-login
echo   - Complete business management and analytics
echo   - Client management and financial tracking
echo   - Staff account management
echo.
echo Staff Portal: http://localhost:5000/staff-login
echo   - Daily client monitoring and compliance
echo   - Court date management and alerts
echo.
echo Client Portal: http://localhost:5000/client-login
echo   - Check-ins, payments, court notifications
echo.
echo ================================================
echo DATA PROTECTION
echo ================================================
echo.
echo CRITICAL: Run "Backup-SecureBond-Data.bat" regularly
echo Store backups on external drives or cloud storage
echo Your business data is stored locally on this computer
echo.
echo Data location: %DATA_DIR%
echo.
echo For system status: Run "SecureBond-System-Status.bat"
echo.
echo ================================================
echo Setup complete! Your SecureBond system is ready.
echo ================================================
echo.
pause