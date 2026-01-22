const http = require('http');

console.log('🔍 測試首頁hero section...\n');

// 測試本地伺服器
const testLocalServer = () => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 8000,
            path: '/public/index.html',
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                // 檢查是否包含hero section
                const hasHeroSection = data.includes('hero-section');
                const hasHeroTitle = data.includes('AI 客服串接平台');
                const hasFloatingIcons = data.includes('floating-icons');
                const hasHeroIcon = data.includes('fas fa-robot');
                
                console.log('📄 首頁內容檢查結果：');
                console.log(`   Hero Section: ${hasHeroSection ? '✅ 存在' : '❌ 缺失'}`);
                console.log(`   Hero Title: ${hasHeroTitle ? '✅ 存在' : '❌ 缺失'}`);
                console.log(`   Floating Icons: ${hasFloatingIcons ? '✅ 存在' : '❌ 缺失'}`);
                console.log(`   Hero Icon: ${hasHeroIcon ? '✅ 存在' : '❌ 缺失'}`);
                
                if (hasHeroSection && hasHeroTitle && hasFloatingIcons && hasHeroIcon) {
                    console.log('\n🎉 首頁hero section正常！');
                    console.log('📱 請訪問 http://localhost:8000/public/index.html 查看效果');
                } else {
                    console.log('\n⚠️ 首頁hero section可能有問題');
                }
                
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ 無法連接到本地伺服器');
            console.log('💡 請確保執行: python3 -m http.server 8000');
            reject(error);
        });
        
        req.end();
    });
};

// 執行測試
testLocalServer().catch(console.error); 