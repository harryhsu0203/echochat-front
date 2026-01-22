// 企業管理功能模組
const express = require('express');
const router = express.Router();

// 企業使用者管理
router.get('/users', (req, res) => {
    // 這裡應該從資料庫獲取使用者列表
    const users = [
        {
            id: 'user_1',
            name: '張小明',
            email: 'zhang@company.com',
            role: '客服專員',
            department: '客服部',
            status: 'active',
            createdAt: '2024-01-15T00:00:00.000Z'
        },
        {
            id: 'user_2',
            name: '李小華',
            email: 'li@company.com',
            role: '客服主管',
            department: '客服部',
            status: 'active',
            createdAt: '2024-01-10T00:00:00.000Z'
        }
    ];

    res.json({
        success: true,
        users: users
    });
});

// 創建新使用者
router.post('/users', (req, res) => {
    const { name, email, role, department, password } = req.body;
    
    if (!name || !email || !role || !password) {
        return res.status(400).json({
            success: false,
            error: '請填寫所有必要欄位'
        });
    }

    const newUser = {
        id: `user_${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        role: role.trim(),
        department: department || '未分配',
        status: 'active',
        createdAt: new Date().toISOString()
    };

    res.json({
        success: true,
        message: '使用者創建成功',
        user: newUser
    });
});

// 更新使用者資訊
router.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, role, department, status } = req.body;

    const updatedUser = {
        id: id,
        name: name || '未命名',
        email: email || '',
        role: role || '未分配',
        department: department || '未分配',
        status: status || 'active',
        updatedAt: new Date().toISOString()
    };

    res.json({
        success: true,
        message: '使用者資訊更新成功',
        user: updatedUser
    });
});

// 刪除使用者
router.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    res.json({
        success: true,
        message: '使用者刪除成功'
    });
});

// 獲取部門列表
router.get('/departments', (req, res) => {
    const departments = [
        { id: 'dept_1', name: '客服部', description: '客戶服務部門' },
        { id: 'dept_2', name: '技術部', description: '技術支援部門' },
        { id: 'dept_3', name: '銷售部', description: '銷售部門' },
        { id: 'dept_4', name: '管理部', description: '管理部門' }
    ];

    res.json({
        success: true,
        departments: departments
    });
});

// 獲取角色列表
router.get('/roles', (req, res) => {
    const roles = [
        { id: 'role_1', name: '客服專員', permissions: ['chat', 'knowledge'] },
        { id: 'role_2', name: '客服主管', permissions: ['chat', 'knowledge', 'users', 'reports'] },
        { id: 'role_3', name: '系統管理員', permissions: ['chat', 'knowledge', 'users', 'reports', 'settings'] },
        { id: 'role_4', name: '超級管理員', permissions: ['*'] }
    ];

    res.json({
        success: true,
        roles: roles
    });
});

module.exports = router; 