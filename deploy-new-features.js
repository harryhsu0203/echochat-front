const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 部署配置
const config = {
    frontendUrl: 'https://echochat-frontend.onrender.com',
    backendUrl: 'https://echochat-api.onrender.com',
    frontendDir: './',
    backendDir: './echochat-api'
};

// 顏色輸出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 檢查文件是否存在
function checkFileExists(filePath) {
    return fs.existsSync(filePath);
}

// 執行命令
function executeCommand(command, cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
        log(`執行命令: ${command}`, 'cyan');
        exec(command, { cwd }, (error, stdout, stderr) => {
            if (error) {
                log(`錯誤: ${error.message}`, 'red');
                reject(error);
                return;
            }
            if (stderr) {
                log(`警告: ${stderr}`, 'yellow');
            }
            log(`輸出: ${stdout}`, 'green');
            resolve(stdout);
        });
    });
}

// 檢查新功能文件
function checkNewFeatures() {
    log('檢查新功能文件...', 'blue');
    
    const requiredFiles = [
        'gemini-features.js',
        'enterprise-management.js',
        'system-settings.js',
        'ai-chatbot-service.js',
        'public/gemini-features.html',
        'public/enterprise-management.html'
    ];
    
    const missingFiles = [];
    
    requiredFiles.forEach(file => {
        if (!checkFileExists(file)) {
            missingFiles.push(file);
        }
    });
    
    if (missingFiles.length > 0) {
        log(`缺少以下文件:`, 'red');
        missingFiles.forEach(file => log(`  - ${file}`, 'red'));
        return false;
    }
    
    log('所有新功能文件都存在', 'green');
    return true;
}

// 更新package.json
function updatePackageJson() {
    log('更新package.json...', 'blue');
    
    const packagePath = path.join(config.backendDir, 'package.json');
    if (!checkFileExists(packagePath)) {
        log('找不到package.json文件', 'red');
        return false;
    }
    
    try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // 添加新的依賴項（如果需要）
        if (!packageJson.dependencies) {
            packageJson.dependencies = {};
        }
        
        // 確保必要的依賴項存在
        const requiredDependencies = {
            'express': '^4.18.2',
            'cors': '^2.8.5',
            'jsonwebtoken': '^9.0.0',
            'bcryptjs': '^2.4.3'
        };
        
        Object.entries(requiredDependencies).forEach(([dep, version]) => {
            if (!packageJson.dependencies[dep]) {
                packageJson.dependencies[dep] = version;
            }
        });
        
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
        log('package.json更新完成', 'green');
        return true;
    } catch (error) {
        log(`更新package.json失敗: ${error.message}`, 'red');
        return false;
    }
}

// 部署到Render
async function deployToRender() {
    try {
        log('開始部署新功能到Render...', 'blue');
        
        // 檢查文件
        if (!checkNewFeatures()) {
            log('新功能文件檢查失敗，停止部署', 'red');
            return false;
        }
        
        // 更新package.json
        if (!updatePackageJson()) {
            log('package.json更新失敗，停止部署', 'red');
            return false;
        }
        
        // 提交更改到Git
        log('提交更改到Git...', 'blue');
        await executeCommand('git add .');
        await executeCommand('git commit -m "feat: 新增Gemini系列功能、企業管理、系統設定和AI對話式機器人服務"');
        
        // 推送到Render
        log('推送到Render...', 'blue');
        await executeCommand('git push origin main');
        
        log('部署完成！', 'green');
        log(`前端URL: ${config.frontendUrl}`, 'cyan');
        log(`後端URL: ${config.backendUrl}`, 'cyan');
        
        return true;
    } catch (error) {
        log(`部署失敗: ${error.message}`, 'red');
        return false;
    }
}

// 測試新功能
async function testNewFeatures() {
    log('測試新功能...', 'blue');
    
    const testEndpoints = [
        '/api/gemini/ai-models/supported',
        '/api/enterprise/users',
        '/api/system/settings',
        '/api/ai-chatbot/robots'
    ];
    
    for (const endpoint of testEndpoints) {
        try {
            const response = await fetch(`${config.backendUrl}${endpoint}`);
            if (response.ok) {
                log(`✅ ${endpoint} - 正常`, 'green');
            } else {
                log(`❌ ${endpoint} - 失敗 (${response.status})`, 'red');
            }
        } catch (error) {
            log(`❌ ${endpoint} - 錯誤: ${error.message}`, 'red');
        }
    }
}

// 主函數
async function main() {
    log('=== EchoChat 新功能部署腳本 ===', 'bright');
    
    const args = process.argv.slice(2);
    const command = args[0] || 'deploy';
    
    switch (command) {
        case 'deploy':
            await deployToRender();
            break;
        case 'test':
            await testNewFeatures();
            break;
        case 'check':
            checkNewFeatures();
            break;
        default:
            log('可用命令:', 'blue');
            log('  node deploy-new-features.js deploy  - 部署新功能', 'cyan');
            log('  node deploy-new-features.js test    - 測試新功能', 'cyan');
            log('  node deploy-new-features.js check   - 檢查文件', 'cyan');
    }
}

// 執行主函數
if (require.main === module) {
    main().catch(error => {
        log(`執行失敗: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = {
    deployToRender,
    testNewFeatures,
    checkNewFeatures
}; 