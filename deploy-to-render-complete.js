const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 開始部署到 Render 雙專案...');
console.log('==================================');

// 顏色定義
const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logWarning(message) {
    log(`⚠️ ${message}`, 'yellow');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️ ${message}`, 'blue');
}

// 檢查 Git 狀態
function checkGitStatus(directory = '.') {
    try {
        const status = execSync('git status --porcelain', { 
            cwd: directory, 
            encoding: 'utf8' 
        });
        
        if (status.trim()) {
            logWarning(`發現未提交的更改在 ${directory}:`);
            console.log(status);
            return false;
        } else {
            logSuccess(`Git 工作目錄乾淨 (${directory})`);
            return true;
        }
    } catch (error) {
        logError(`檢查 Git 狀態失敗: ${error.message}`);
        return false;
    }
}

// 執行 Git 命令
function executeGitCommand(command, directory = '.', description = '') {
    try {
        logInfo(`${description || command} (${directory})...`);
        const result = execSync(command, { 
            cwd: directory, 
            encoding: 'utf8' 
        });
        logSuccess(`${description || command} 完成`);
        return true;
    } catch (error) {
        logError(`${description || command} 失敗: ${error.message}`);
        return false;
    }
}

// 部署後端專案
function deployBackend() {
    logInfo('📦 部署後端專案 (echochat-api)...');
    
    // 檢查後端目錄是否存在
    if (!fs.existsSync('echochat-api')) {
        logError('找不到後端專案目錄 echochat-api/');
        return false;
    }
    
    // 檢查後端必要文件
    const requiredFiles = ['server.js', 'package.json', 'render.yaml'];
    for (const file of requiredFiles) {
        if (!fs.existsSync(`echochat-api/${file}`)) {
            logError(`後端缺少必要文件: ${file}`);
            return false;
        }
    }
    
    // 檢查 Git 狀態
    if (!checkGitStatus('echochat-api')) {
        logWarning('後端專案有未提交的更改，將自動提交');
    }
    
    // 進入後端目錄
    process.chdir('echochat-api');
    
    // 添加所有更改
    if (!executeGitCommand('git add .', '.', '添加後端更改')) {
        process.chdir('..');
        return false;
    }
    
    // 提交更改
    if (!executeGitCommand('git commit -m "更新後端 API：修復 AI 助理認證問題和配置"', '.', '提交後端更改')) {
        process.chdir('..');
        return false;
    }
    
    // 推送到遠程倉庫
    if (!executeGitCommand('git push origin main', '.', '推送後端到 Render')) {
        process.chdir('..');
        return false;
    }
    
    logSuccess('後端專案部署成功！');
    logInfo('🌐 後端 URL: https://echochat-api.onrender.com');
    logInfo('🔍 健康檢查: https://echochat-api.onrender.com/api/health');
    
    // 回到主目錄
    process.chdir('..');
    return true;
}

// 部署前端專案
function deployFrontend() {
    logInfo('📦 部署前端專案 (主目錄)...');
    
    // 檢查前端必要文件
    const requiredFiles = ['server.js', 'package.json', 'render.yaml', 'public'];
    for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
            logError(`前端缺少必要文件: ${file}`);
            return false;
        }
    }
    
    // 檢查 Git 狀態
    if (!checkGitStatus('.')) {
        logWarning('前端專案有未提交的更改，將自動提交');
    }
    
    // 添加所有更改
    if (!executeGitCommand('git add .', '.', '添加前端更改')) {
        return false;
    }
    
    // 提交更改
    if (!executeGitCommand('git commit -m "更新前端：修復 AI 助理認證問題和配置"', '.', '提交前端更改')) {
        return false;
    }
    
    // 推送到遠程倉庫
    if (!executeGitCommand('git push origin main', '.', '推送前端到 Render')) {
        return false;
    }
    
    logSuccess('前端專案部署成功！');
    logInfo('🌐 前端 URL: https://echochat-backend.onrender.com');
    logInfo('🔍 健康檢查: https://echochat-backend.onrender.com/index.html');
    
    return true;
}

// 檢查環境變數
function checkEnvironmentVariables() {
    logInfo('🔍 檢查環境變數...');
    
    // 檢查 .env 檔案
    if (fs.existsSync('.env')) {
        const envContent = fs.readFileSync('.env', 'utf8');
        
        // 檢查 JWT_SECRET
        if (envContent.includes('JWT_SECRET=')) {
            const jwtMatch = envContent.match(/JWT_SECRET=(.+)/);
            if (jwtMatch && jwtMatch[1] !== 'your_super_secret_jwt_key_here_2024') {
                logSuccess('JWT_SECRET 已設置');
            } else {
                logWarning('JWT_SECRET 仍為預設值');
            }
        }
        
        // 檢查 OPENAI_API_KEY
        if (envContent.includes('OPENAI_API_KEY=')) {
            const openaiMatch = envContent.match(/OPENAI_API_KEY=(.+)/);
            if (openaiMatch && openaiMatch[1] !== 'your_openai_api_key_here') {
                logSuccess('OpenAI API 金鑰已設置');
            } else {
                logWarning('OpenAI API 金鑰仍為預設值');
            }
        }
    } else {
        logWarning('.env 檔案不存在');
    }
}

// 檢查專案配置
function checkProjectConfig() {
    logInfo('🔍 檢查專案配置...');
    
    // 檢查後端配置
    if (fs.existsSync('echochat-api/render.yaml')) {
        const backendConfig = fs.readFileSync('echochat-api/render.yaml', 'utf8');
        if (backendConfig.includes('name: echochat-api')) {
            logSuccess('後端 Render 配置正確');
        } else {
            logWarning('後端 Render 配置可能不正確');
        }
    }
    
    // 檢查前端配置
    if (fs.existsSync('render.yaml')) {
        const frontendConfig = fs.readFileSync('render.yaml', 'utf8');
        if (frontendConfig.includes('name: echochat-backend')) {
            logSuccess('前端 Render 配置正確');
        } else {
            logWarning('前端 Render 配置可能不正確');
        }
    }
}

// 主部署流程
async function main() {
    try {
        logInfo('開始部署流程...');
        
        // 檢查環境變數
        checkEnvironmentVariables();
        
        // 檢查專案配置
        checkProjectConfig();
        
        // 部署後端
        logInfo('🚀 開始部署後端專案...');
        if (!deployBackend()) {
            logError('後端部署失敗');
            return;
        }
        
        // 等待一下
        logInfo('等待 5 秒...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 部署前端
        logInfo('🚀 開始部署前端專案...');
        if (!deployFrontend()) {
            logError('前端部署失敗');
            return;
        }
        
        logSuccess('🎉 所有專案部署完成！');
        
        // 顯示部署摘要
        console.log('\n📋 部署摘要:');
        console.log('==================================');
        console.log('🌐 前端 URL: https://echochat-backend.onrender.com');
        console.log('🔧 後端 URL: https://echochat-api.onrender.com');
        console.log('🔍 後端健康檢查: https://echochat-api.onrender.com/api/health');
        console.log('📊 前端健康檢查: https://echochat-backend.onrender.com/index.html');
        
        console.log('\n💡 下一步:');
        console.log('1. 等待 Render 部署完成（通常需要 2-5 分鐘）');
        console.log('2. 檢查部署狀態：https://dashboard.render.com');
        console.log('3. 測試前端和後端連接');
        console.log('4. 如果 OpenAI API 金鑰未設置，請在 Render 儀表板中設置');
        
    } catch (error) {
        logError(`部署過程中發生錯誤: ${error.message}`);
    }
}

// 執行部署
main(); 