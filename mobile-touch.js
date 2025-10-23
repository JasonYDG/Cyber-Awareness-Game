// 移动端触摸控制 - CyberCatch专用
class MobileTouchHandler {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.minSwipeDistance = 30;
        this.isTouch = false;
        
        this.init();
    }
    
    init() {
        this.setupTouchEvents();
        this.setupMobileButtons();
        this.preventDefaultBehaviors();
    }
    
    setupTouchEvents() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        
        // 触摸开始
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
            this.isTouch = true;
            
            // 添加视觉反馈
            canvas.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.8)';
        }, { passive: false });
        
        // 触摸移动
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            if (!this.isTouch || !this.gameEngine.gameRunning) return;
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - this.touchStartX;
            
            // 实时移动挡板
            if (Math.abs(deltaX) > 10) {
                const direction = deltaX > 0 ? 1 : -1;
                this.gameEngine.movePaddle(direction);
                this.touchStartX = touch.clientX; // 更新起始位置
            }
        }, { passive: false });
        
        // 触摸结束
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isTouch = false;
            
            // 移除视觉反馈
            setTimeout(() => {
                canvas.style.boxShadow = '';
            }, 200);
        }, { passive: false });
    }
    
    setupMobileButtons() {
        const leftBtn = document.getElementById('mobile-left');
        const rightBtn = document.getElementById('mobile-right');
        
        if (leftBtn) {
            this.setupButton(leftBtn, 'left');
        }
        
        if (rightBtn) {
            this.setupButton(rightBtn, 'right');
        }
    }
    
    setupButton(button, direction) {
        let moveInterval = null;
        
        // 触摸开始
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.addTouchFeedback(button);
            
            // 立即移动一次
            this.movePaddle(direction);
            
            // 开始连续移动 - 进一步提高响应速度
            moveInterval = setInterval(() => {
                this.movePaddle(direction);
            }, 20); // 从30ms减少到20ms，进一步提高响应速度
            
        }, { passive: false });
        
        // 触摸结束
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.removeTouchFeedback(button);
            
            // 停止连续移动
            if (moveInterval) {
                clearInterval(moveInterval);
                moveInterval = null;
            }
        }, { passive: false });
        
        // 触摸取消（手指移出按钮区域）
        button.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.removeTouchFeedback(button);
            
            if (moveInterval) {
                clearInterval(moveInterval);
                moveInterval = null;
            }
        }, { passive: false });
        
        // 点击事件（备用）
        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.movePaddle(direction);
        });
    }
    
    movePaddle(direction) {
        if (!this.gameEngine || !this.gameEngine.gameRunning) return;
        
        const moveDirection = direction === 'left' ? -1 : 1;
        this.gameEngine.movePaddle(moveDirection);
        
        // 显示操作反馈
        this.showActionFeedback(direction);
    }
    
    addTouchFeedback(button) {
        button.classList.add('touched');
        button.style.transform = 'scale(0.9)';
        button.style.boxShadow = '0 0 20px rgba(255, 0, 64, 0.8)';
        
        // 震动反馈
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    }
    
    removeTouchFeedback(button) {
        button.classList.remove('touched');
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '';
    }
    
    showActionFeedback(action) {
        const feedback = document.createElement('div');
        feedback.className = 'action-feedback';
        feedback.textContent = action === 'left' ? '← 左移' : '→ 右移';
        
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 255, 255, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            z-index: 2000;
            pointer-events: none;
            animation: actionFeedback 0.8s ease-out forwards;
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 800);
    }
    
    preventDefaultBehaviors() {
        // 防止页面滚动
        document.body.addEventListener('touchmove', (e) => {
            if (e.target.closest('.mobile-controls') || e.target.closest('#game-canvas')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // 防止双击缩放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // 防止长按菜单
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.mobile-controls') || e.target.closest('#game-canvas')) {
                e.preventDefault();
            }
        });
        
        // 防止选择文本
        document.addEventListener('selectstart', (e) => {
            if (e.target.closest('.mobile-controls') || e.target.closest('#game-canvas')) {
                e.preventDefault();
            }
        });
    }
    
    // 检测设备是否支持触摸
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    // 显示/隐藏移动端控制
    toggleMobileControls(show) {
        const mobileControls = document.querySelector('.mobile-controls');
        if (mobileControls) {
            mobileControls.style.display = show ? 'flex' : 'none';
        }
    }
    
    // 启用/禁用触摸控制
    setEnabled(enabled) {
        const mobileControls = document.querySelector('.mobile-controls');
        const canvas = document.getElementById('game-canvas');
        
        if (mobileControls) {
            mobileControls.style.pointerEvents = enabled ? 'auto' : 'none';
            mobileControls.style.opacity = enabled ? '1' : '0.5';
        }
        
        if (canvas) {
            canvas.style.pointerEvents = enabled ? 'auto' : 'none';
        }
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes actionFeedback {
        0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px) scale(0.8);
        }
        20% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1.1);
        }
        100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px) scale(1);
        }
    }
    
    .mobile-control-btn.touched {
        background: linear-gradient(135deg, #ff0040, #ff3366) !important;
        box-shadow: 0 0 25px rgba(255, 0, 64, 0.8) !important;
        transform: scale(0.9) !important;
    }
    
    .mobile-control-btn {
        transition: all 0.1s ease;
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
    }
    
    .mobile-control-btn:active {
        transform: scale(0.85) !important;
    }
    
    /* 防止移动端双击缩放 */
    .mobile-controls, #game-canvas {
        touch-action: manipulation;
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
    }
    
    /* 移动端优化 */
    @media (max-width: 768px) {
        .mobile-controls {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            background: rgba(0, 0, 0, 0.3);
            padding: 10px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        
        .mobile-control-btn {
            width: 60px;
            height: 60px;
            font-size: 24px;
            margin: 0 10px;
        }
    }
    
    /* 横屏模式优化 */
    @media (max-width: 768px) and (orientation: landscape) {
        .mobile-controls {
            bottom: 10px;
        }
        
        .mobile-control-btn {
            width: 50px;
            height: 50px;
            font-size: 20px;
            margin: 0 8px;
        }
    }
`;
document.head.appendChild(style);

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileTouchHandler;
} else {
    window.MobileTouchHandler = MobileTouchHandler;
}