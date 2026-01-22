const { backupDatabase } = require('./backup-db.js');

console.log('🔄 部署前自動備份資料庫...');
console.log('📅 時間:', new Date().toISOString());

// 執行備份
const success = backupDatabase();

if (success) {
    console.log('✅ 備份完成，可以安全部署');
    process.exit(0);
} else {
    console.log('❌ 備份失敗，請檢查後再部署');
    process.exit(1);
} 