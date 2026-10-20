const cron = require('node-cron');
const runBackup = require('./backup');

console.log('---------------------------------------------------------');
console.log('⏰ MongoDB Backup Scheduler initialized.');
console.log('Schedule: Every day at 11:30 AM Pakistan Standard Time (Asia/Karachi)');
console.log('---------------------------------------------------------');

// Schedule job at 11:30 AM PKT (Asia/Karachi)
cron.schedule('30 11 * * *', () => {
  console.log(`\n[${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })} PKT] Triggering daily scheduled database backup...`);
  runBackup();
}, {
  scheduled: true,
  timezone: "Asia/Karachi"
});
