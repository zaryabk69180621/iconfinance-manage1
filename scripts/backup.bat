@echo off
:: MongoDB Backup Script for Windows OneDrive
set BACKUP_DIR=C:\Users\Icon Pc 7\OneDrive - Imperial College of Nursing Swat\mongodump

if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
)

:: Format timestamp YYYY-MM-DD_HH-MM-SS
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%-%datetime:~12,2%

set BACKUP_FILE=%BACKUP_DIR%\icon_finance_db_backup_%TIMESTAMP%.gz

echo Starting MongoDB database backup...
mongodump --uri="mongodb://127.0.0.1:27017/icon_finance_db" --archive="%BACKUP_FILE%" --gzip

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Backup created at: %BACKUP_FILE%
) else (
    echo [ERROR] Backup failed with code %ERRORLEVEL%
)
