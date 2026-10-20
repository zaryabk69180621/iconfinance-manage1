const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

function getBackupDir() {
  // 1. Allow explicit override via environment variable if provided
  if (process.env.BACKUP_DIR) {
    return process.env.BACKUP_DIR;
  }

  // 2. Default target directory for Windows OneDrive mongodump
  const primaryTarget = 'C:\\Users\\Icon Pc 7\\OneDrive - Imperial College of Nursing Swat\\mongodump';
  
  return primaryTarget;
}

function runBackup() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/icon_finance_db';
  const backupDir = getBackupDir();

  if (!fs.existsSync(backupDir)) {
    try {
      fs.mkdirSync(backupDir, { recursive: true });
    } catch (err) {
      console.error(`[${new Date().toLocaleString()}] ❌ Failed to create backup directory:`, err.message);
      return;
    }
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  
  let dbName = 'icon_finance_db';
  try {
    const parsedUrl = new URL(mongoUri);
    const pathname = parsedUrl.pathname.replace('/', '');
    if (pathname) dbName = pathname;
  } catch (e) {
    // fallback default
  }

  const archiveName = `${dbName}_backup_${timestamp}.gz`;
  const archivePath = path.join(backupDir, archiveName);

  const command = `mongodump --uri="${mongoUri}" --archive="${archivePath}" --gzip`;

  console.log(`[${new Date().toLocaleString()}] Starting MongoDB backup...`);
  console.log(`Target directory: ${backupDir}`);
  console.log(`Target file: ${archivePath}`);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`[${new Date().toLocaleString()}] ❌ Backup Failed:`, error.message);
      if (stderr) console.error(stderr);
      return;
    }
    
    if (fs.existsSync(archivePath)) {
      const stats = fs.statSync(archivePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`[${new Date().toLocaleString()}] ✅ Backup Successful!`);
      console.log(`Saved File: ${archivePath}`);
      console.log(`File Size: ${sizeKB} KB`);
    } else {
      console.log(`[${new Date().toLocaleString()}] Backup completed. Output:`, stdout || stderr);
    }
  });
}

if (require.main === module) {
  runBackup();
}

module.exports = runBackup;
