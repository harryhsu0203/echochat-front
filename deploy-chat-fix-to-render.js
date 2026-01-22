#!/usr/bin/env node

/**
 * 部署聊天功能修復到 Render
 * 這個腳本會將更新的錯誤處理代碼部署到 Render
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== 部署聊天功能修復到 Render ===\n');

// 檢查 Git 狀態
function checkGitStatus() {
    try {
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        if (status.trim()) {
            console.log('📋 檢測到未提交的更改：');
            console.log(status);
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ 無法檢查 Git 狀態:', error.message);
        process.exit(1);
    }
}

// 提交更改
function commitChanges() {
    try {
        console.log('📝 提交更改...');
        
        // 添加修改的文件
        execSync('git add echochat-api/server.js update-render-env-openai.js deploy-chat-fix-to-render.js', { stdio: 'inherit' });
        
        // 創建提交
        const commitMessage = 'Fix: 改進 AI 聊天錯誤處理並添加 OpenAI API Key 檢查';
        execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
        
        console.log('✅ 更改已提交\n');
    } catch (error) {
        if (error.message.includes('nothing to commit')) {
            console.log('ℹ️  沒有需要提交的更改\n');
        } else {
            console.error('❌ 提交失敗:', error.message);
            process.exit(1);
        }
    }
}

// 推送到 GitHub
function pushToGitHub() {
    try {
        console.log('🚀 推送到 GitHub...');
        execSync('git push origin main', { stdio: 'inherit' });
        console.log('✅ 成功推送到 GitHub\n');
    } catch (error) {
        console.error('❌ 推送失敗:', error.message);
        console.log('\n💡 提示：如果推送失敗，請手動執行：');
        console.log('   git push origin main');
        process.exit(1);
    }
}

// 觸發 Render 重新部署
function triggerRenderRedeploy() {
    console.log('🔄 觸發 Render 重新部署...');
    console.log('Render 會自動檢測到 GitHub 的更新並重新部署\n');
    
    console.log('📋 部署狀態：');
    console.log('1. GitHub 推送完成 ✅');
    console.log('2. Render 自動部署中... ⏳');
    console.log('3. 預計完成時間：2-3 分鐘\n');
}

// 主函數
async function main() {
    console.log('🔍 檢查環境...\n');
    
    // 檢查是否有未提交的更改
    const hasChanges = checkGitStatus();
    
    if (hasChanges) {
        // 提交更改
        commitChanges();
    }
    
    // 推送到 GitHub
    pushToGitHub();
    
    // 觸發 Render 重新部署
    triggerRenderRedeploy();
    
    console.log('=== 下一步操作 ===\n');
    console.log('1. 等待 2-3 分鐘讓 Render 完成部署');
    console.log('2. 運行以下命令設置 OpenAI API Key：');
    console.log('   export RENDER_API_KEY="your-render-api-key"');
    console.log('   node update-render-env-openai.js');
    console.log('\n3. 設置完成後，您可以訪問以下網址測試：');
    console.log('   https://echochat-api.onrender.com/api/health');
    console.log('   https://echochat-api.onrender.com/api/test');
    console.log('\n4. 測試聊天功能：');
    console.log('   訪問您的前端應用並嘗試使用聊天功能');
    console.log('\n💡 重要提示：');
    console.log('   - 如果沒有設置 OpenAI API Key，您會看到更清楚的錯誤訊息');
    console.log('   - 錯誤訊息會指導您如何設置 API Key');
    console.log('   - 設置 API Key 後，聊天功能應該可以正常工作');
}

// 執行主函數
main().catch(error => {
    console.error('❌ 部署失敗:', error);
    process.exit(1);
});