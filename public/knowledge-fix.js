// 知識庫修復腳本
console.log('載入知識庫修復腳本...');

function getApiBase() {
    // API_BASE_URL 在 js/api-config.js 中已包含 /api 結尾
    return (window.API_BASE_URL && window.API_BASE_URL.endsWith('/api'))
        ? window.API_BASE_URL
        : (window.API_BASE_URL || 'https://echochat-api.onrender.com/api');
}

async function readJsonSafe(response) {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`非 JSON 回應: ${response.status} ${response.statusText} - ${text.substring(0, 200)}`);
    }
    return response.json();
}

// 修復按鈕樣式
function fixKnowledgeTabButtons() {
    console.log('修復知識庫標籤按鈕樣式...');
    
    const tabs = ['newKnowledgeTab', 'existingKnowledgeTab', 'configTab'];
    
    tabs.forEach(tabId => {
        const tab = document.getElementById(tabId);
        if (tab) {
            // 移除內聯樣式
            tab.removeAttribute('style');
            
            // 確保有正確的點擊事件
            if (!tab.onclick) {
                const tabType = tabId.replace('Tab', '');
                tab.onclick = function(e) {
                    e.preventDefault();
                    switchKnowledgeTab(tabType);
                };
            }
        }
    });
    
    // 初始化第一個標籤為激活狀態
    const firstTab = document.getElementById('newKnowledgeTab');
    if (firstTab) {
        firstTab.classList.add('active');
    }
}

// 載入知識庫資料
async function loadKnowledgeData() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('未找到認證 token');
            return;
        }

        const response = await fetch(`${getApiBase()}/knowledge`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const knowledge = await readJsonSafe(response);
            console.log('載入知識庫資料:', knowledge);
            updateKnowledgeUI(knowledge);
        } else {
            console.error('載入知識庫失敗:', response.status);
        }
    } catch (error) {
        console.error('載入知識庫錯誤:', error);
    }
}

// 更新知識庫 UI
function updateKnowledgeUI(knowledge) {
    console.log('更新知識庫 UI，資料數量:', knowledge.length);
    
    // 更新分類統計
    const totalCount = knowledge.length;
    const manualCount = knowledge.filter(item => item.category === 'manual').length;
    const uploadCount = knowledge.filter(item => item.category === 'upload').length;
    const tableCount = knowledge.filter(item => item.category === 'table').length;
    
    // 更新計數器
    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('manualCount').textContent = manualCount;
    document.getElementById('uploadCount').textContent = uploadCount;
    document.getElementById('tableCount').textContent = tableCount;
    
    // 更新知識庫項目列表
    const knowledgeList = document.getElementById('knowledgeList');
    if (knowledgeList) {
        if (knowledge.length === 0) {
            knowledgeList.innerHTML = `
                <div class="col-12">
                    <div class="text-center py-5">
                        <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">暫無知識庫項目</h5>
                        <p class="text-muted">您還沒有添加任何知識庫項目</p>
                        <button class="btn btn-primary" onclick="switchKnowledgeTab('new')">
                            <i class="fas fa-plus me-2"></i>新增知識
                        </button>
                    </div>
                </div>
            `;
        } else {
            const knowledgeHTML = knowledge.map(item => `
                <div class="col-md-6 col-lg-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="badge bg-primary">${item.category || 'general'}</span>
                                <div class="dropdown">
                                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                        <i class="fas fa-ellipsis-v"></i>
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li><a class="dropdown-item" href="#" onclick="editKnowledge(${item.id})">
                                            <i class="fas fa-edit me-2"></i>編輯
                                        </a></li>
                                        <li><a class="dropdown-item text-danger" href="#" onclick="deleteKnowledge(${item.id})">
                                            <i class="fas fa-trash me-2"></i>刪除
                                        </a></li>
                                    </ul>
                                </div>
                            </div>
                            <h6 class="card-title">${item.question}</h6>
                            <p class="card-text text-muted small">${item.answer.substring(0, 100)}${item.answer.length > 100 ? '...' : ''}</p>
                            ${item.tags ? `<div class="mt-2"><span class="badge bg-secondary">${item.tags}</span></div>` : ''}
                            <small class="text-muted">建立時間: ${new Date(item.created_at).toLocaleDateString()}</small>
                        </div>
                    </div>
                </div>
            `).join('');
            
            knowledgeList.innerHTML = knowledgeHTML;
        }
    }
}

// 顯示類別詳情
function showCategoryDetail(category) {
    console.log('顯示類別詳情:', category);
    
    // 創建模態框顯示詳情
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'categoryDetailModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${getCategoryName(category)} 詳情</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div id="categoryDetailContent">
                        <div class="text-center">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">載入中...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 載入該類別的知識庫資料
    loadCategoryKnowledge(category);
    
    // 顯示模態框
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    // 模態框關閉時移除元素
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

// 載入類別知識庫資料
async function loadCategoryKnowledge(category) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${getApiBase()}/knowledge`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const knowledge = await readJsonSafe(response);
            const filteredKnowledge = category === 'all' ? 
                knowledge : 
                knowledge.filter(item => item.category === category);
            
            displayCategoryKnowledge(filteredKnowledge, category);
        }
    } catch (error) {
        console.error('載入類別知識庫錯誤:', error);
        document.getElementById('categoryDetailContent').innerHTML = 
            '<div class="alert alert-danger">載入失敗，請稍後再試</div>';
    }
}

// 顯示類別知識庫資料
function displayCategoryKnowledge(knowledge, category) {
    const content = document.getElementById('categoryDetailContent');
    
    if (knowledge.length === 0) {
        content.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">暫無資料</h5>
                <p class="text-muted">此類別目前沒有知識庫項目</p>
            </div>
        `;
        return;
    }
    
    const knowledgeHTML = knowledge.map(item => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="card-title">${item.question}</h6>
                        <p class="card-text text-muted">${item.answer}</p>
                        <div class="d-flex gap-2">
                            <span class="badge bg-primary">${item.category || 'general'}</span>
                            ${item.tags ? `<span class="badge bg-secondary">${item.tags}</span>` : ''}
                        </div>
                    </div>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" onclick="editKnowledge(${item.id})">
                                <i class="fas fa-edit me-2"></i>編輯
                            </a></li>
                            <li><a class="dropdown-item text-danger" href="#" onclick="deleteKnowledge(${item.id})">
                                <i class="fas fa-trash me-2"></i>刪除
                            </a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    content.innerHTML = `
        <div class="mb-3">
            <h6>共 ${knowledge.length} 個項目</h6>
        </div>
        ${knowledgeHTML}
    `;
}

// 取得類別名稱
function getCategoryName(category) {
    const names = {
        'all': '全部',
        'manual': '手動輸入',
        'upload': '上傳檔案',
        'table': '表格',
        'webpage': '網頁',
        'sitemap': '站點地圖'
    };
    return names[category] || category;
}

// 編輯知識庫項目
function editKnowledge(id) {
    console.log('編輯知識庫項目:', id);
    // TODO: 實現編輯功能
    alert('編輯功能開發中...');
}

// 刪除知識庫項目
async function deleteKnowledge(id) {
    if (!confirm('確定要刪除此知識庫項目嗎？')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${getApiBase()}/knowledge/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert('刪除成功！');
            // 重新載入知識庫資料
            loadKnowledgeData();
            // 關閉模態框
            const modal = bootstrap.Modal.getInstance(document.getElementById('categoryDetailModal'));
            if (modal) {
                modal.hide();
            }
        } else {
            alert('刪除失敗，請稍後再試');
        }
    } catch (error) {
        console.error('刪除知識庫錯誤:', error);
        alert('刪除失敗，請稍後再試');
    }
}

// 頁面載入時執行
document.addEventListener('DOMContentLoaded', function() {
    console.log('知識庫修復腳本已載入');
    
    // 修復按鈕樣式
    setTimeout(fixKnowledgeTabButtons, 100);
    
    // 如果當前在知識庫頁面，載入資料
    if (window.location.hash.includes('knowledge') || 
        document.querySelector('#knowledgePage')) {
        console.log('檢測到知識庫頁面，載入資料...');
        setTimeout(loadKnowledgeData, 1000);
    }

    // 載入使用者方案資訊（用於側邊欄問候與方案顯示）
    setTimeout(loadUserPlanForSidebar, 300);
});

// 導出函數供全域使用
window.showCategoryDetail = showCategoryDetail;
window.editKnowledge = editKnowledge;
window.deleteKnowledge = deleteKnowledge;
window.fixKnowledgeTabButtons = fixKnowledgeTabButtons; 

// =============== 匯入網址 / 站點地圖 UI 與行為 =================

function showUrlImportModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'urlImportModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">從網址匯入知識</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">網址</label>
                        <input id="importUrlInput" type="url" class="form-control" placeholder="https://example.com/page" required />
                    </div>
                    <div class="mb-3">
                        <label class="form-label">每次分段最大項目數</label>
                        <input id="importUrlMaxItems" type="number" class="form-control" value="10" min="1" max="50" />
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="confirmUrlImport()">開始匯入</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(modal);
    const instance = new bootstrap.Modal(modal);
    instance.show();
    modal.addEventListener('hidden.bs.modal', () => document.body.removeChild(modal));
}

async function confirmUrlImport() {
    const url = document.getElementById('importUrlInput').value.trim();
    const maxItems = parseInt(document.getElementById('importUrlMaxItems').value || '10', 10);
    if (!url) {
        alert('請輸入網址');
        return;
    }
    try {
        const token = localStorage.getItem('token');
        const resp = await fetch(`${getApiBase()}/knowledge/import/url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ url, maxItems })
        });
        const data = await readJsonSafe(resp);
        if (!resp.ok || !data.success) throw new Error(data.error || '匯入失敗');
        alert(`匯入成功，新增 ${data.createdCount} 筆`);
        loadKnowledgeData();
        const modal = bootstrap.Modal.getInstance(document.getElementById('urlImportModal'));
        if (modal) modal.hide();
    } catch (e) {
        console.error(e);
        alert('匯入失敗，請稍後再試');
    }
}

function showSitemapImportModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'sitemapImportModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">從站點地圖匯入</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Sitemap URL (.xml)</label>
                        <input id="sitemapUrlInput" type="url" class="form-control" placeholder="https://example.com/sitemap.xml" required />
                    </div>
                    <div class="mb-3">
                        <label class="form-label">最多抓取頁數</label>
                        <input id="sitemapMaxPages" type="number" class="form-control" value="10" min="1" max="200" />
                    </div>
                    <div class="mb-3">
                        <label class="form-label">每頁最大拆分項目數</label>
                        <input id="sitemapPerPageItems" type="number" class="form-control" value="3" min="1" max="20" />
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="confirmSitemapImport()">開始匯入</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(modal);
    const instance = new bootstrap.Modal(modal);
    instance.show();
    modal.addEventListener('hidden.bs.modal', () => document.body.removeChild(modal));
}

async function confirmSitemapImport() {
    const sitemapUrl = document.getElementById('sitemapUrlInput').value.trim();
    const maxPages = parseInt(document.getElementById('sitemapMaxPages').value || '10', 10);
    const perPageItems = parseInt(document.getElementById('sitemapPerPageItems').value || '3', 10);
    if (!sitemapUrl) {
        alert('請輸入 Sitemap URL');
        return;
    }
    try {
        const token = localStorage.getItem('token');
        const resp = await fetch(`${getApiBase()}/knowledge/import/sitemap`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ sitemapUrl, maxPages, perPageItems })
        });
        const data = await readJsonSafe(resp);
        if (!resp.ok || !data.success) throw new Error(data.error || '匯入失敗');
        alert(`匯入成功，新增 ${data.createdCount} 筆`);
        loadKnowledgeData();
        const modal = bootstrap.Modal.getInstance(document.getElementById('sitemapImportModal'));
        if (modal) modal.hide();
    } catch (e) {
        console.error(e);
        alert('匯入失敗，請稍後再試');
    }
}

// 導出
window.showUrlImportModal = showUrlImportModal;
window.showSitemapImportModal = showSitemapImportModal;
window.confirmUrlImport = confirmUrlImport;
window.confirmSitemapImport = confirmSitemapImport;

// =============== 儀表板右側「AI 聊天測試」區域 ================

let testChatConversationId = null;
let knowledgeOnlyMode = false;

function initTestChatUI() {
    const sendBtn = document.getElementById('sendMessageBtnTest');
    const inputEl = document.getElementById('chatInput');
    const clearBtn = document.getElementById('clearChatBtn');
    const refreshBtn = document.getElementById('refreshChatBtn');
    // 追加：強制知識庫開關（若不存在，可動態插入一個切換）
    let toggle = document.getElementById('knowledgeOnlyToggle');
    if (!toggle) {
        // 若模板中已加入，就不再動態插入
    }
    if (toggle) {
        // 預設開啟僅用知識庫
        toggle.checked = true;
        knowledgeOnlyMode = true;
        toggle.addEventListener('change', (e) => {
            knowledgeOnlyMode = !!e.target.checked;
        });
    }

    // 防止重複綁定：若已綁定則先移除舊監聽
    function handleSend() {
        if (!inputEl) return;
        const text = inputEl.value.trim();
        if (!text) return;
        appendUserMessage(text);
        inputEl.value = '';
        sendTestMessage(text);
    }

    if (sendBtn && sendBtn.dataset.bound !== '1' && inputEl) {
        sendBtn.addEventListener('click', handleSend);
        sendBtn.dataset.bound = '1';
    }

    // 防止 Enter 綁定重複
    if (inputEl && inputEl.dataset.boundEnter !== '1') {
        // 中文輸入法組字時不要觸發送出
        inputEl.addEventListener('compositionstart', () => { inputEl.dataset.isComposing = '1'; });
        inputEl.addEventListener('compositionend', () => { inputEl.dataset.isComposing = '0'; });
        inputEl.dataset.isComposing = '0';

        inputEl.addEventListener('keyup', (e) => {
            if (inputEl.dataset.isComposing === '1') return;
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                // 防抖 300ms
                if (inputEl.dataset.lastTs && Date.now() - parseInt(inputEl.dataset.lastTs, 10) < 300) {
                    return;
                }
                inputEl.dataset.lastTs = String(Date.now());
                handleSend();
            }
        });
        inputEl.dataset.boundEnter = '1';
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            clearChatMessages();
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            testChatConversationId = null;
            clearChatMessages();
            appendSystemInfo('已重置對話，從頭開始');
        });
    }
}

function clearChatMessages() {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;
    container.innerHTML = '';
}

function appendUserMessage(text) {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;
    const wrap = document.createElement('div');
    wrap.className = 'd-flex justify-content-end mb-3';
    wrap.innerHTML = `
        <div class="bg-white p-3 rounded-3 shadow-sm" style="max-width: 80%; border-radius: 15px 15px 5px 15px !important;">
            <span class="text-dark">${escapeHtml(text)}</span>
            <div class="small text-muted mt-1 text-end"><i class="fas fa-user me-1"></i>你</div>
        </div>
    `;
    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;
}

function appendAssistantMessage(text) {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;
    const wrap = document.createElement('div');
    wrap.className = 'd-flex align-items-start mb-3';
    wrap.innerHTML = `
        <div class="me-2">
            <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                <i class="fas fa-robot text-white" style="font-size: 12px;"></i>
            </div>
        </div>
        <div class="bg-white p-3 rounded-3 shadow-sm" style="max-width: 80%; border-radius: 15px 15px 15px 5px !important;">
            <span class="text-dark">${escapeHtml(text)}</span>
            <div class="small text-muted mt-1"><i class="fas fa-clock me-1"></i>剛剛</div>
        </div>
    `;
    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;
}

function appendSystemInfo(text) {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;
    const wrap = document.createElement('div');
    wrap.className = 'text-center text-muted small my-2';
    wrap.textContent = text;
    container.appendChild(wrap);
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function sendTestMessage(message) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            appendAssistantMessage('請先登入再測試');
            return;
        }
        // 為避免快取舊對話（特別是剛匯入知識的當下），在重新開始時不帶 conversationId
        const body = testChatConversationId ? { message, conversationId: testChatConversationId, knowledgeOnly: knowledgeOnlyMode } : { message, knowledgeOnly: knowledgeOnlyMode };
        const resp = await fetch(`${getApiBase()}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) {
            appendAssistantMessage('伺服器回應錯誤，請稍後再試');
            return;
        }

        const data = await readJsonSafe(resp);
        if (data && data.success) {
            testChatConversationId = data.conversationId || testChatConversationId;
            appendAssistantMessage(data.reply || '');
        } else {
            appendAssistantMessage('暫時無法取得回覆');
        }
    } catch (e) {
        appendAssistantMessage('發送失敗，請檢查網路連線');
    }
}

async function renderChannels() {
    const wrap = document.getElementById('channelList');
    if (!wrap) return;
    const list = await loadChannels();
    // 快取於全域供編輯使用
    window._channels = Array.isArray(list) ? list : [];
    if (!list.length) {
        wrap.innerHTML = '<div class="col-12 text-muted">尚無頻道，請點右上角「新增頻道」。</div>';
        return;
    }
    wrap.innerHTML = list.map(ch => `
      <div class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge ${ch.isActive ? 'bg-success' : 'bg-secondary'}">${ch.platform}</span>
              <span class="badge ${ch.hasCredentials ? 'bg-primary' : 'bg-warning'}">${ch.hasCredentials ? '已設定金鑰' : '未設定金鑰'}</span>
            </div>
            <h6 class="card-title mb-2">${ch.name}</h6>
            <div class="input-group input-group-sm mb-2">
              <input type="text" class="form-control" value="${ch.webhookUrl || ''}" readonly placeholder="Webhook URL">
              <button class="btn btn-outline-secondary" type="button" onclick="(function(btn){const inp=btn.parentElement.querySelector('input');inp.select();document.execCommand('copy');btn.innerHTML='已複製';setTimeout(()=>btn.innerHTML='複製',1200);})(this)">複製</button>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm ${ch.isActive ? 'btn-success' : 'btn-outline-success'}" disabled>${ch.isActive ? '啟用中' : '未啟用'}</button>
              <a class="btn btn-sm btn-outline-primary" href="/line-token-manager.html"><i class="fas fa-edit me-1"></i>編輯</a>
              <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteChannel('${ch.id}')"><i class="fas fa-trash me-1"></i>刪除</button>
            </div>
          </div>
          <div class="card-footer bg-white small text-muted d-flex justify-content-between">
            <span>建立：${new Date(ch.createdAt).toLocaleString()}</span>
            <span>更新：${new Date(ch.updatedAt).toLocaleString()}</span>
          </div>
        </div>
      </div>
    `).join('');
}

// 自動初始化（當右側聊天測試區存在時）
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('sendMessageBtnTest') && document.getElementById('chatMessagesContainer')) {
        initTestChatUI();
    }
    // 載入頻道列表（若在頻道頁）
    if (document.getElementById('channelList')) { renderChannels(); }
});

// =============== 使用者方案顯示（側邊欄） ===============
async function loadUserPlanForSidebar() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const resp = await fetch(`${getApiBase()}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) return;
        const data = await readJsonSafe(resp);
        if (!data || !data.success) return;
        const user = data.user || {};
        const greetingEl = document.getElementById('greetingLine');
        const planEl = document.getElementById('planLine');
        if (greetingEl) greetingEl.textContent = `${user.name || user.username || '使用者'} 您好！`;
        if (planEl) {
            const plan = (user.plan || 'free').toLowerCase();
            const planMap = {
                free: '免費版',
                basic: '基礎版',
                starter: '入門版',
                pro: '專業版',
                professional: '專業版',
                premium: '高級版',
                business: '商務版',
                enterprise: '企業版'
            };
            const planLabel = planMap[plan] || plan;
            if (plan === 'free') {
                planEl.textContent = `方案：${planLabel}`;
            } else {
                const expires = user.plan_expires_at ? new Date(user.plan_expires_at) : null;
                const expiresText = expires ? `，到期：${expires.toLocaleDateString()}` : '';
                planEl.textContent = `方案：${planLabel}${expiresText}`;
            }
        }
    } catch (e) {
        // ignore
    }
}

// =============== 檔案匯入（前端） ===============
function showFileUploadModal(kind) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'fileUploadModal';

    // 檔案接受格式
    const accept = kind === 'spreadsheet' ? '.csv,.xls,.xlsx' : '.json,.csv,.xls,.xlsx';
    const title = kind === 'spreadsheet' ? '上傳試算表' : '上傳文件';

    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p class="small text-muted mb-2">每列需包含 <code>question</code> 與 <code>answer</code> 欄位（也支援 <code>Q/A</code>、<code>title/content</code> 對應）。</p>
            <input id="knowledgeFileInput" type="file" class="form-control" accept="${accept}" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-primary" onclick="confirmFileUpload()">開始匯入</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const instance = new bootstrap.Modal(modal);
    instance.show();
    modal.addEventListener('hidden.bs.modal', () => document.body.removeChild(modal));
}

async function confirmFileUpload() {
    try {
        const inp = document.getElementById('knowledgeFileInput');
        if (!inp || !inp.files || !inp.files[0]) {
            alert('請選擇檔案');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            alert('請先登入');
            return;
        }
        const fd = new FormData();
        fd.append('file', inp.files[0]);
        const resp = await fetch(`${getApiBase()}/knowledge/import/file`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: fd
        });
        const data = await readJsonSafe(resp);
        if (!resp.ok || !data.success) throw new Error(data.error || '匯入失敗');
        alert(`匯入成功，新增 ${data.createdCount} 筆`);
        loadKnowledgeData();
        const modal = bootstrap.Modal.getInstance(document.getElementById('fileUploadModal'));
        if (modal) modal.hide();
    } catch (e) {
        console.error(e);
        alert('匯入失敗，請確認檔案格式');
    }
}

function showTemplateUploadModal() {
    const sample = 'question,answer\n營業時間是？,我們每日 10:00-21:00 營業\n地址在哪裡？,台北市信義區...';
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'templateModal';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">下載範本</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p class="mb-2">請下載 CSV 範本，填寫後再使用「上傳試算表」匯入：</p>
            <a class="btn btn-outline-primary" href="${url}" download="knowledge-template.csv">
              <i class="fas fa-download me-1"></i>下載 CSV 範本
            </a>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const instance = new bootstrap.Modal(modal);
    instance.show();
    modal.addEventListener('hidden.bs.modal', () => {
        URL.revokeObjectURL(url);
        document.body.removeChild(modal);
    });
}

// 導出檔案匯入相關方法
window.showFileUploadModal = showFileUploadModal;
window.confirmFileUpload = confirmFileUpload;
window.showTemplateUploadModal = showTemplateUploadModal;

// =============== 頻道管理（前端） ===============
async function loadChannels() {
    try {
        const token = localStorage.getItem('token');
        const resp = await fetch(`${getApiBase()}/channels`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) return [];
        const data = await readJsonSafe(resp);
        return data.channels || [];
    } catch { return []; }
}

async function createChannel({ name, platform, apiKey, channelSecret, webhookUrl, isActive }) {
    const token = localStorage.getItem('token');
    const resp = await fetch(`${getApiBase()}/channels`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, platform, apiKey, channelSecret, webhookUrl, isActive })
    });
    return readJsonSafe(resp);
}

async function updateChannel(id, { name, platform, apiKey, channelSecret, webhookUrl, isActive }) {
    const token = localStorage.getItem('token');
    const resp = await fetch(`${getApiBase()}/channels/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, platform, apiKey, channelSecret, webhookUrl, isActive })
    });
    return readJsonSafe(resp);
}

// 儲存使用者層級的 LINE Token/Secret（統一於此，不必再去另一頁）
async function saveLineSettings({ channelAccessToken, channelSecret, webhookUrl }) {
    const token = localStorage.getItem('token');
    const resp = await fetch(`${getApiBase()}/line-api/settings`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelAccessToken, channelSecret, webhookUrl })
    });
    const data = await readJsonSafe(resp);
    if (!resp.ok || !data.success) throw new Error(data.error || 'LINE Token 儲存失敗');
    return data;
}

async function deleteChannel(id) {
    const token = localStorage.getItem('token');
    const resp = await fetch(`${getApiBase()}/channels/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return readJsonSafe(resp);
}

async function confirmDeleteChannel(id) {
    if (!id) return;
    if (!confirm('確定要刪除此頻道嗎？')) return;
    try {
        const data = await deleteChannel(id);
        if (!data.success) throw new Error(data.error || '刪除失敗');
        alert('刪除成功');
        if (typeof renderChannels === 'function') {
            try { await renderChannels(); } catch {}
        }
    } catch (e) {
        alert(e.message || '刪除失敗');
    }
}

function showAddChannelModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'addChannelModal';
    modal.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">新增頻道</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row g-4">
              <div class="col-md-12">
                <div class="mb-3">
                  <label class="form-label">名稱</label>
                  <input id="chName" class="form-control" placeholder="我的 LINE 客服 / Facebook Page / Telegram Bot 等">
                </div>
                <div class="mb-3">
                  <label class="form-label">選擇要串接的平台</label>
                  <div class="btn-group w-100 flex-wrap" role="group">
                    <input type="radio" class="btn-check" name="platform" id="pf-line" value="line" checked>
                    <label class="btn btn-outline-success" for="pf-line"><i class="fab fa-line me-1"></i>LINE</label>
                    <input type="radio" class="btn-check" name="platform" id="pf-facebook" value="facebook">
                    <label class="btn btn-outline-primary" for="pf-facebook"><i class="fab fa-facebook me-1"></i>Facebook</label>
                    <input type="radio" class="btn-check" name="platform" id="pf-telegram" value="telegram">
                    <label class="btn btn-outline-info" for="pf-telegram"><i class="fab fa-telegram me-1"></i>Telegram</label>
                    <input type="radio" class="btn-check" name="platform" id="pf-discord" value="discord">
                    <label class="btn btn-outline-dark" for="pf-discord"><i class="fab fa-discord me-1"></i>Discord</label>
                    <input type="radio" class="btn-check" name="platform" id="pf-slack" value="slack">
                    <label class="btn btn-outline-secondary" for="pf-slack"><i class="fab fa-slack me-1"></i>Slack</label>
                    <input type="radio" class="btn-check" name="platform" id="pf-messenger" value="messenger">
                    <label class="btn btn-outline-primary" for="pf-messenger"><i class="fab fa-facebook-messenger me-1"></i>Messenger</label>
                    <input type="radio" class="btn-check" name="platform" id="pf-whatsapp" value="whatsapp">
                    <label class="btn btn-outline-success" for="pf-whatsapp"><i class="fab fa-whatsapp me-1"></i>WhatsApp</label>
                    <input type="radio" class="btn-check" name="platform" id="pf-webhook" value="webhook">
                    <label class="btn btn-outline-dark" for="pf-webhook"><i class="fas fa-plug me-1"></i>Webhook</label>
                </div>
              </div>

                <div class="card">
                  <div class="card-header"><i class="fas fa-book me-2"></i>串接教學</div>
                  <div class="card-body small" id="platformGuide">
                    <!-- 依平台切換教學 -->
                  </div>
                  <div class="card-body border-top small pt-3" id="webhookHelp"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-primary" onclick="confirmAddChannelAndRedirect()">下一步：設定串接</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const instance = new bootstrap.Modal(modal);
    instance.show();
    modal.addEventListener('hidden.bs.modal', () => document.body.removeChild(modal));

    // 初始化教學內容
    const guideMap = {
      line: `
        <ol class="mb-2">
          <li>至 LINE Developers 建立 Provider 與 Channel。</li>
          <li>取得 <strong>Channel ID</strong>、<strong>Channel Secret</strong>、<strong>Channel Access Token</strong>。</li>
          <li>於本視窗填入 Token/Secret，Webhook 可先留空；完成後可到 LINE 後台設定 Webhook URL。</li>
        </ol>
        <a href="/line-token-manager.html" class="btn btn-outline-success btn-sm"><i class="fas fa-cog me-1"></i>前往 LINE Bot 管理</a>
      `,
      facebook: `
        <ol class="mb-2">
          <li>至 Facebook for Developers 建立 App 與粉專串接。</li>
          <li>取得 Page Access Token 與 App Secret，並設定 Webhook 訂閱。</li>
        </ol>
        <a href="https://developers.facebook.com/" target="_blank" class="btn btn-outline-primary btn-sm">開發者中心</a>
      `,
      telegram: `
        <ol class="mb-2">
          <li>在 Telegram 與 @BotFather 建立 Bot，取得 <strong>Bot Token</strong>。</li>
          <li>設定 Webhook 指向本系統提供的 URL。</li>
        </ol>
      `,
      discord: `
        <ol class="mb-2">
          <li>至 Discord Developer Portal 建立應用程式與 Bot。</li>
          <li>取得 Bot Token，並邀請至伺服器，設定事件接收端點。</li>
        </ol>
      `,
      slack: `
        <ol class="mb-2">
          <li>至 Slack API 建立 App，啟用 Bot 與 OAuth。</li>
          <li>取得 <strong>Bot User OAuth Token</strong> 與 Signing Secret。</li>
          <li>於 Events Subscriptions 設定 Request URL。</li>
        </ol>
        <a href="https://api.slack.com/apps" target="_blank" class="btn btn-outline-secondary btn-sm">Slack API</a>
      `,
      messenger: `
        <ol class="mb-2">
          <li>至 Facebook for Developers 建立 App，啟用 Messenger。</li>
          <li>綁定粉專並取得 Page Access Token 與 App Secret。</li>
          <li>設定 Webhook 訂閱（messages、messaging_postbacks）。</li>
        </ol>
      `,
      whatsapp: `
        <ol class="mb-2">
          <li>使用 Meta WhatsApp Cloud API 建立測試號碼或申請正式號碼。</li>
          <li>取得永久 Token 與電話號碼 ID，設定 Webhook。</li>
        </ol>
      `,
      webhook: `
        <ol class="mb-2">
          <li>使用自訂第三方來源，將訊息以 Webhook 送至本系統。</li>
          <li>於此處保存 API Key/Secret 作為驗證；Webhook URL 請指向本系統提供的端點。</li>
        </ol>
      `
    };

    function renderGuide(platform) {
      const el = document.getElementById('platformGuide');
      if (!el) return;
      el.innerHTML = guideMap[platform] || '';
    }
    // 初始顯示 LINE 教學
    renderGuide('line');

    // 取得 userId 並初始化 webhook 區塊
    let userIdForWebhook = null;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${getApiBase()}/me`, { headers: { 'Authorization': `Bearer ${token}` }});
        const data = await res.json();
        userIdForWebhook = data && data.user && data.user.id ? data.user.id : null;
        updateWebhookHelp('line');
      } catch {}
    })();

    function platformLabel(p) {
      const m = { line: 'LINE', facebook: 'Facebook', telegram: 'Telegram', discord: 'Discord', slack: 'Slack', messenger: 'Messenger', whatsapp: 'WhatsApp', webhook: 'Webhook' };
      return m[p] || p;
    }

    function updateWebhookHelp(platform) {
      const box = document.getElementById('webhookHelp');
      if (!box) return;
      if (!userIdForWebhook) { box.innerHTML = '<div class="text-muted">無法取得使用者 ID，請重新登入後再試。</div>'; return; }
      const url = `${getApiBase()}/webhook/${platform}/${userIdForWebhook}`;
      box.innerHTML = `
        <div class="mb-2"><i class="fas fa-link me-1"></i>專屬 Webhook URL（${platformLabel(platform)}）</div>
        <div class="input-group input-group-sm">
          <input id="webhookUrlInput" type="text" class="form-control" value="${url}" readonly>
          <button class="btn btn-outline-secondary" type="button" id="copyWebhookBtn"><i class="fas fa-copy me-1"></i>複製</button>
        </div>
        <div class="form-text">請將此 URL 貼到 ${platformLabel(platform)} 後台的 Webhook 回調設定。</div>
      `;
      const btn = document.getElementById('copyWebhookBtn');
      btn && btn.addEventListener('click', () => {
        const inp = document.getElementById('webhookUrlInput');
        inp.select();
        document.execCommand('copy');
        btn.innerHTML = '<i class="fas fa-check me-1"></i>已複製';
        setTimeout(() => btn.innerHTML = '<i class="fas fa-copy me-1"></i>複製', 1500);
      });
    }

    // 綁定平台切換
    ['pf-line','pf-facebook','pf-telegram','pf-discord','pf-slack','pf-messenger','pf-whatsapp','pf-webhook'].forEach(id => {
      const r = document.getElementById(id);
      r && r.addEventListener('change', (e) => { if (e.target.checked) { renderGuide(e.target.value); updateWebhookHelp(e.target.value); } });
    });
}

function showEditChannelModal(id) {
    const list = Array.isArray(window._channels) ? window._channels : [];
    const ch = list.find(c => String(c.id) === String(id));
    showAddChannelModal();
    // 延遲以等待 modal 插入 DOM 後再填值
    setTimeout(() => {
        try {
            if (!ch) return;
            // 標記為編輯模式
            window._editingChannelId = ch.id;
            document.getElementById('chName').value = ch.name || '';
            const pf = String(ch.platform || 'line');
            const radio = document.querySelector(`input[name="platform"][value="${pf}"]`);
            if (radio) radio.checked = true;
            document.getElementById('chWebhook').value = ch.webhookUrl || '';
            document.getElementById('chActive').checked = !!ch.isActive;

            // 調整標題與主按鈕文字
            const title = document.querySelector('#addChannelModal .modal-title');
            if (title) title.textContent = '編輯頻道';
            const primaryBtn = Array.from(document.querySelectorAll('#addChannelModal .modal-footer button'))
                .find(b => b.classList.contains('btn-primary'));
            if (primaryBtn) primaryBtn.textContent = '儲存';

            // 插入刪除鈕
            const footer = document.querySelector('#addChannelModal .modal-footer');
            if (footer && !document.getElementById('deleteChannelBtn')) {
                const delBtn = document.createElement('button');
                delBtn.id = 'deleteChannelBtn';
                delBtn.type = 'button';
                delBtn.className = 'btn btn-outline-danger me-auto';
                delBtn.innerHTML = '<i class="fas fa-trash me-1"></i>刪除頻道';
                delBtn.onclick = () => confirmDeleteChannel(ch.id);
                footer.prepend(delBtn);
            }
        } catch {}
    }, 150);
}

async function confirmAddChannelAndRedirect() {
    const name = document.getElementById('chName').value.trim();
    const platform = (document.querySelector('input[name="platform"]:checked')?.value) || 'line';
    if (!name || !platform) { alert('請填寫名稱並選擇平台'); return; }
    
    try {
        const token = localStorage.getItem('token');
        const isEditing = !!window._editingChannelId;
        
        // 僅建立頻道記錄，不填 Token/Secret（之後導到專頁填）
        const payload = { name, platform, apiKey: 'pending', channelSecret: 'pending', webhookUrl: '', isActive: false };
        const data = isEditing
            ? await updateChannel(window._editingChannelId, payload)
            : await createChannel(payload);
        if (!data.success) throw new Error(data.error || '建立失敗');
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('addChannelModal'));
        if (modal) modal.hide();
        window._editingChannelId = null;
        
        // 導到對應設定頁
        if (platform === 'line') {
            window.location.href = '/line-token-manager.html';
        } else {
            alert(`${platform} 平台設定頁面開發中，請稍後再試`);
            if (typeof renderChannels === 'function') {
                try { await renderChannels(); } catch {}
            }
        }
    } catch (e) {
        alert(e.message || '操作失敗');
    }
}

window.showAddChannelModal = showAddChannelModal;