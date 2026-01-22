// 統一導航欄 JavaScript 功能

document.addEventListener('DOMContentLoaded', function() {
    // 導航欄滾動效果
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 添加滾動效果
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });

    // 導航連結點擊效果
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        // 點擊波紋效果
        link.addEventListener('click', function(e) {
            createRipple(e, this);
        });

        // 懸停音效（可選）
        link.addEventListener('mouseenter', function() {
            // 可以添加懸停音效
            // playHoverSound();
        });
    });

    // 登入按鈕效果
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            createRipple(e, this);
        });
    }

    // 語言選擇器效果
    const languageSelector = document.querySelector('.language-selector');
    if (languageSelector) {
        languageSelector.addEventListener('change', function() {
            // 語言切換動畫
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    }

    // 漢堡選單動畫
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    }

    // 創建波紋效果
    function createRipple(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // 導航欄項目進入視窗動畫
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // 觀察導航欄元素
    const navbarElements = document.querySelectorAll('.navbar-brand, .nav-link, .btn-login, .language-selector');
    navbarElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });

    // 手機端選單展開/收起動畫
    const navbarCollapse = document.querySelector('.navbar-collapse');
    if (navbarCollapse) {
        const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
            toggle: false
        });

        // 選單展開時的動畫
        navbarCollapse.addEventListener('show.bs.collapse', function() {
            const navItems = this.querySelectorAll('.nav-item');
            navItems.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'translateX(-20px)';
                setTimeout(() => {
                    item.style.transition = 'all 0.3s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                }, index * 100);
            });
        });

        // 選單收起時的動畫
        navbarCollapse.addEventListener('hide.bs.collapse', function() {
            const navItems = this.querySelectorAll('.nav-item');
            navItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '0';
                    item.style.transform = 'translateX(-20px)';
                }, index * 50);
            });
        });
    }

    // 當前頁面高亮
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const currentNavLink = document.querySelector(`.nav-link[href="${currentPage}"]`);
    if (currentNavLink) {
        currentNavLink.classList.add('active');
    }

    // 導航連結點擊高亮
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // 移除所有 active 類別
            navLinks.forEach(l => l.classList.remove('active'));
            // 添加當前連結的 active 類別
            this.classList.add('active');
        });
    });

    // 鍵盤導航支援
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // 按 ESC 關閉手機端選單
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                if (bsCollapse) {
                    bsCollapse.hide();
                }
            }
        }
    });

    // 觸控設備優化
    if ('ontouchstart' in window) {
        // 為觸控設備添加額外的視覺回饋
        navLinks.forEach(link => {
            link.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            });
            
            link.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }
});

// 添加波紋效果的 CSS
const rippleCSS = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }

    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;

// 動態添加 CSS
const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style); 