# EchoChat 多語言功能指南

## 概述

EchoChat 現在支援多語言介面，包括繁體中文、英文和日文。用戶可以通過導航欄右側的語言選擇器來切換語言。

## 支援的語言

- **繁體中文 (zh-TW)** - 預設語言
- **English (en)** - 英文
- **日本語 (ja)** - 日文

## 功能特點

### 1. 自動語言記憶
- 用戶選擇的語言會自動保存到瀏覽器的 localStorage
- 下次訪問網站時會自動應用上次選擇的語言

### 2. 即時語言切換
- 點擊語言選擇器可以即時切換語言
- 所有頁面內容會立即更新
- 頁面標題也會相應更新

### 3. HTML 語言屬性
- 切換語言時會自動更新 HTML 的 `lang` 屬性
- 有助於搜尋引擎優化和螢幕閱讀器

## 文件結構

```
public/
├── js/
│   └── i18n.js          # 多語言核心文件
├── index.html           # 已更新支援多語言
└── test-i18n.html      # 多語言功能測試頁面
```

## 使用方法

### 1. 在 HTML 中添加多語言支援

```html
<!-- 引入多語言文件 -->
<script src="js/i18n.js"></script>

<!-- 添加語言選擇器 -->
<select class="language-selector">
    <option value="zh-TW">繁體中文</option>
    <option value="en">English</option>
    <option value="ja">日本語</option>
</select>

<!-- 為元素添加翻譯標籤 -->
<h1 data-i18n="hero.title">AI 客服串接平台</h1>
<p data-i18n="hero.subtitle">將 AI 智能客服串接到您的平台</p>
<button data-i18n="btn.start">開始使用</button>
```

### 2. 添加新的翻譯

在 `public/js/i18n.js` 文件中添加新的翻譯：

```javascript
translations: {
    'zh-TW': {
        'new.key': '新的中文翻譯',
        // ...
    },
    'en': {
        'new.key': 'New English Translation',
        // ...
    },
    'ja': {
        'new.key': '新しい日本語翻訳',
        // ...
    }
}
```

### 3. 頁面標題翻譯

```html
<title data-i18n-title="page.title">EchoChat - AI 客服串接平台</title>
```

## API 參考

### i18n 對象方法

#### `i18n.init()`
初始化多語言系統

#### `i18n.changeLanguage(language)`
切換到指定語言
- `language`: 語言代碼 ('zh-TW', 'en', 'ja')

#### `i18n.getCurrentLanguage()`
獲取當前語言代碼

#### `i18n.getLanguageName(code)`
獲取語言名稱
- `code`: 語言代碼

#### `i18n.getTranslation(key, language)`
獲取翻譯文本
- `key`: 翻譯鍵
- `language`: 語言代碼

## 測試多語言功能

1. 訪問 `http://localhost:8000/test-i18n.html`
2. 使用語言選擇器切換語言
3. 觀察頁面內容的變化
4. 檢查瀏覽器開發者工具中的 localStorage

## 為其他頁面添加多語言支援

### 步驟 1: 引入 i18n.js
```html
<script src="js/i18n.js"></script>
```

### 步驟 2: 添加語言選擇器
```html
<select class="language-selector">
    <option value="zh-TW">繁體中文</option>
    <option value="en">English</option>
    <option value="ja">日本語</option>
</select>
```

### 步驟 3: 為元素添加 data-i18n 屬性
```html
<h1 data-i18n="page.title">頁面標題</h1>
<p data-i18n="page.description">頁面描述</p>
<button data-i18n="btn.submit">提交</button>
```

### 步驟 4: 在 i18n.js 中添加翻譯
```javascript
translations: {
    'zh-TW': {
        'page.title': '頁面標題',
        'page.description': '頁面描述',
        'btn.submit': '提交'
    },
    'en': {
        'page.title': 'Page Title',
        'page.description': 'Page Description',
        'btn.submit': 'Submit'
    },
    'ja': {
        'page.title': 'ページタイトル',
        'page.description': 'ページ説明',
        'btn.submit': '送信'
    }
}
```

## 注意事項

1. **翻譯鍵命名**: 使用點號分隔的層次結構，如 `nav.home`、`hero.title`
2. **預設語言**: 如果找不到翻譯，會回退到繁體中文
3. **HTML 屬性**: 只有 `data-i18n` 和 `data-i18n-title` 會被處理
4. **動態內容**: 動態生成的內容需要手動調用 `i18n.applyLanguage()`

## 故障排除

### 語言不切換
1. 檢查是否正確引入了 `i18n.js`
2. 確認語言選擇器有正確的 `value` 屬性
3. 檢查瀏覽器控制台是否有錯誤

### 翻譯不顯示
1. 確認翻譯鍵存在於 `i18n.js` 中
2. 檢查 `data-i18n` 屬性是否正確
3. 確認所有語言都有對應的翻譯

### 頁面標題不更新
1. 確認使用了 `data-i18n-title` 屬性
2. 檢查翻譯鍵是否正確

## 未來擴展

- 支援更多語言
- 動態載入翻譯文件
- 自動檢測瀏覽器語言
- 支援複數形式和性別區分
- 支援日期和數字格式化 