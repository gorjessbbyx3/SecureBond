# SecureBond Desktop Installation Guide

## Overview
SecureBond is a professional bail bond management system that runs on your computer and stores all data locally. This ensures complete privacy and control over your client information.

## System Requirements
- Windows 10 or later
- Node.js 18 or later (automatically checked during setup)
- 500MB free disk space
- 4GB RAM recommended

## Installation Steps

### 1. Download and Extract
- Download the SecureBond package
- Extract all files to a folder on your computer

### 2. Run Setup
- Double-click `setup.bat` to start installation
- The setup will:
  - Check for Node.js (install from nodejs.org if missing)
  - Create data storage folder in Documents
  - Create desktop shortcuts
  - Install required components

### 3. Start the Application
- Double-click `Start-SecureBond.bat` on your desktop
- Wait 30 seconds for the system to start
- Click the `SecureBond` shortcut to open in your browser
- Or manually go to: http://localhost:5000

## Data Storage Location
Your client data is stored locally at:
`C:\Users\[YourName]\Documents\SecureBond Data\`

This folder contains:
- `clients.json` - Client information and profiles
- `payments.json` - Payment records and receipts
- `checkins.json` - Daily check-in logs
- `expenses.json` - Business expense tracking
- `alerts.json` - System alerts and notifications
- `backups\` - Automatic daily backups (last 10 days)

## Data Backup

### Automatic Backups
- System automatically creates daily backups
- Stored in the `backups` folder within your data directory
- Keeps the last 10 backups automatically

### Manual Backup
- Double-click `Backup-SecureBond-Data.bat` on your desktop
- Creates a timestamped backup folder on your desktop
- Copy this folder to external drive or cloud storage

### Restore from Backup
1. Stop SecureBond application
2. Navigate to your data folder
3. Replace files with backup versions
4. Restart SecureBond

## Security Features
- All data stored locally on your computer
- No internet connection required for operation
- Encrypted password storage for client accounts
- Automatic file permissions protection

## Troubleshooting

### Application Won't Start
1. Check if Node.js is installed: Open Command Prompt, type `node --version`
2. If missing, download from: https://nodejs.org
3. Re-run `setup.bat`

### Data Not Saving
1. Check if data folder exists: `Documents\SecureBond Data`
2. Verify write permissions to Documents folder
3. Run as Administrator if necessary

### Browser Won't Open
1. Manually open browser
2. Go to: http://localhost:5000
3. Bookmark this address for future use

### Port Already in Use
1. Close any other web applications
2. Restart your computer
3. Try starting SecureBond again

## Data Export
The system provides built-in export functionality:
- Go to Admin Dashboard → Financial → Export Reports
- Creates CSV files for accounting software
- Includes client lists, payment records, and financial summaries

## Updates
To update SecureBond:
1. Download new version
2. Extract to same folder (overwrite files)
3. Your data remains safe in Documents folder
4. Re-run setup if needed

## Support
Keep this documentation for reference. The system is designed to run independently without internet connectivity, ensuring your client data remains private and secure.

## Important Notes
- Always backup data before major system changes
- Client passwords are encrypted and cannot be recovered if lost
- The system generates automatic client IDs and passwords
- Court date notifications work without internet connection
- GPS tracking requires internet for real-time updates