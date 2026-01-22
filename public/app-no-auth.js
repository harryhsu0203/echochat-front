// 完全禁用身份驗證的 app.js 版本
console.log('🚀 載入無身份驗證版本');

// 設定 axios 攔截器（不進行身份驗證）
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axios.interceptors.response.use(
    response => response,
    error => {
        console.log('⚠️ API 錯誤，但繼續處理:', error.message);
        return Promise.reject(error);
    }
);

// 建立 Vue 應用程式
const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            currentView: 'dashboard',
            staffName: localStorage.getItem('staffName') || '測試用戶',
            staffRole: localStorage.getItem('staffRole') || 'admin',
            isAdmin: true,
            stats: {
                totalUsers: 0,
                todayChats: 0,
                pendingItems: 0
            },
            users: [],
            userSearchQuery: '',
            selectedUser: null,
            handoverData: {
                toStaff: '',
                note: ''
            },
            staffList: [],
            chats: [],
            chatSearchQuery: '',
            chatSearchDate: '',
            chatSearchTag: '',
            availableTags: [],
            selectedChat: null,
            ratingData: {
                satisfied: null,
                correctAnswer: ''
            },
            settings: {
                lineToken: '',
                discordWebhook: '',
                notifyOnUserSwitch: false,
                notifyOnError: false,
                enableSurvey: false,
                surveyQuestions: []
            },
            newStaff: {
                username: '',
                password: '',
                name: '',
                email: '',
                role: 'staff'
            },
            knowledge: [],
            knowledgeSearchQuery: '',
            newKnowledge: {
                question: '',
                answer: ''
            },
            imageAnalysis: null,
            selectedImage: null,
            assistantProfile: {}
        };
    },
    methods: {
        async logout() {
            console.log('✅ 登出功能已禁用');
        },
        async fetchStats() {
            console.log('📊 載入統計資料...');
        },
        async fetchUsers() {
            console.log('👥 載入用戶資料...');
        },
        async fetchChats() {
            console.log('💬 載入聊天記錄...');
        },
        async fetchKnowledge() {
            console.log('📚 載入知識庫...');
        },
        async fetchSettings() {
            console.log('⚙️ 載入設定...');
        },
        async saveSettings() {
            console.log('💾 儲存設定...');
        }
    },
    mounted() {
        console.log('🚀 應用程式已載入（無身份驗證模式）');
    }
});

app.mount('#app');

// 全域 logout 函數（已禁用）
function logout() {
    console.log('✅ 全域登出功能已禁用');
}