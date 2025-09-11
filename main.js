// CyberCatch 主控制器
class CyberCatchGame {
    constructor() {
        this.gameEngine = null;
        this.headControl = null;
        this.photoManager = null;
        this.audioSystem = null;
        this.mobileTouchHandler = null;
        
        this.gameState = 'menu'; // menu, playing, paused, ended
        this.privacyAccepted = false;
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing CyberCatch game...');
            
            // 初始化各个系统
            this.initializeSystems();
            
            // 设置事件监听器
            this.setupEventListeners();
            
            // 检查设备类型并调整UI
            this.adjustForDevice();
            
            // 显示隐私声明
            this.showPrivacyModal();
            
            console.log('CyberCatch game initialized successfully');
            
        } catch (error) {
            console.error('Game initialization failed:', error);
            this.showError('游戏初始化失败: ' + error.message);
        }
    }

    initializeSystems() {
        // 初始化游戏引擎
        this.gameEngine = new GameEngine();
        this.gameEngine.onGameEnd = this.onGameEnd.bind(this);
        this.gameEngine.onScoreUpdate = this.onScoreUpdate.bind(this);
        
        // 初始化照片管理器
        this.photoManager = new PhotoManager();
        
        // 初始化音频系统
        this.audioSystem = new AudioSystem();
        window.audioSystem = this.audioSystem; // 全局访问
        
        // 初始化移动端触摸控制
        if (MobileTouchHandler.isTouchDevice()) {
            this.mobileTouchHandler = new MobileTouchHandler(this.gameEngine);
        }
        
        // 暴露到全局作用域
        window.gameEngine = this.gameEngine;
        window.photoManager = this.photoManager;
    }

    setupEventListeners() {
        // 开始游戏按钮
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', this.startGame.bind(this));
        }
        
        // 重新开始按钮
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', this.restartGame.bind(this));
        }
        
        // 暂停按钮
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', this.togglePause.bind(this));
        }
        
        // 摄像头按钮
        const cameraBtn = document.getElementById('camera-btn');
        if (cameraBtn) {
            cameraBtn.addEventListener('click', this.toggleCamera.bind(this));
        }
        
        // 隐私声明按钮
        const acceptPrivacyBtn = document.getElementById('accept-privacy');
        const declinePrivacyBtn = document.getElementById('decline-privacy');
        
        if (acceptPrivacyBtn) {
            acceptPrivacyBtn.addEventListener('click', this.acceptPrivacy.bind(this));
        }
        
        if (declinePrivacyBtn) {
            declinePrivacyBtn.addEventListener('click', this.declinePrivacy.bind(this));
        }
        
        // 键盘控制
        this.setupKeyboardControls();
        
        // 窗口大小变化
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.gameState === 'playing') {
                        this.gameEngine.movePaddle(-1);
                        event.preventDefault();
                    }
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.gameState === 'playing') {
                        this.gameEngine.movePaddle(1);
                        event.preventDefault();
                    }
                    break;
                case ' ':
                case 'p':
                case 'P':
                    if (this.gameState === 'playing' || this.gameState === 'paused') {
                        this.togglePause();
                        event.preventDefault();
                    }
                    break;
                case 'Escape':
                    if (this.gameState === 'playing') {
                        this.pauseGame();
                        event.preventDefault();
                    }
                    break;
            }
        });
    }

    adjustForDevice() {
        const isMobile = window.innerWidth <= 768 || MobileTouchHandler.isTouchDevice();
        
        if (isMobile) {
            // 移动端优化
            document.body.classList.add('mobile-device');
            
            // 显示移动端控制
            if (this.mobileTouchHandler) {
                this.mobileTouchHandler.toggleMobileControls(true);
            }
            
            // 调整画布尺寸
            this.adjustCanvasForMobile();
        } else {
            // 桌面端优化
            document.body.classList.add('desktop-device');
            
            // 隐藏移动端控制
            if (this.mobileTouchHandler) {
                this.mobileTouchHandler.toggleMobileControls(false);
            }
        }
    }

    adjustCanvasForMobile() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        
        const container = canvas.parentElement;
        const maxWidth = Math.min(window.innerWidth - 40, 400);
        const maxHeight = Math.min(window.innerHeight - 200, 600);
        
        canvas.style.maxWidth = maxWidth + 'px';
        canvas.style.maxHeight = maxHeight + 'px';
        
        // 重新调整游戏引擎画布
        if (this.gameEngine) {
            this.gameEngine.resizeCanvas();
        }
    }

    showPrivacyModal() {
        const modal = document.getElementById('privacy-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hidePrivacyModal() {
        const modal = document.getElementById('privacy-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    acceptPrivacy() {
        this.privacyAccepted = true;
        this.hidePrivacyModal();
        
        // 只有在MediaPipe可用时才初始化头部控制
        if (window.MediaPipeAvailable) {
            this.initializeHeadControl();
            console.log('Privacy accepted, initializing head control');
        } else {
            console.log('Privacy accepted, MediaPipe not available - using keyboard/touch controls');
        }
    }

    declinePrivacy() {
        this.hidePrivacyModal();
        alert('需要同意隐私声明才能使用头部控制功能。您仍可以使用键盘或触摸控制游戏。');
        
        // 显示摄像头按钮供用户手动启动
        const cameraBtn = document.getElementById('camera-btn');
        if (cameraBtn) {
            cameraBtn.style.display = 'inline-block';
        }
    }

    async initializeHeadControl() {
        try {
            // 检查MediaPipe是否可用
            if (!window.MediaPipeAvailable) {
                console.log('MediaPipe not available, skipping head control initialization');
                return;
            }

            this.headControl = new HeadControl(
                this.gameEngine,
                this.onCalibrationComplete.bind(this),
                this.onFaceStatusChange.bind(this)
            );
            
            // 自动启动摄像头
            await this.headControl.startCamera();
            
            console.log('Head control initialized and camera started');
            
        } catch (error) {
            console.error('Head control initialization failed:', error);
            
            // 显示摄像头按钮供用户手动启动
            const cameraBtn = document.getElementById('camera-btn');
            if (cameraBtn) {
                cameraBtn.style.display = 'inline-block';
            }
        }
    }

    onCalibrationComplete() {
        console.log('Head control calibration completed');
        
        // 捕获玩家照片
        if (this.photoManager) {
            this.photoManager.capturePlayerPhoto();
        }
        
        // 显示3,2,1倒计时
        this.showCountdown();
    }

    // 显示3,2,1倒计时
    showCountdown() {
        let count = 3;
        const countdownInterval = setInterval(() => {
            if (count > 0) {
                this.showMessage(`${count}`, 800);
                
                // 播放倒计时音效
                if (this.audioSystem) {
                    this.audioSystem.playSound('countdown');
                }
                
                count--;
            } else {
                clearInterval(countdownInterval);
                
                // 倒计时结束，显示"开始！"
                this.showMessage('开始！', 1000);
                
                // 播放游戏开始音效
                if (this.audioSystem) {
                    this.audioSystem.playSound('gamestart');
                }
                
                // 1秒后自动开始游戏
                setTimeout(() => {
                    if (this.gameState === 'menu') {
                        this.startGame();
                    }
                }, 1000);
            }
        }, 1000);
    }

    onFaceStatusChange(isDetected) {
        if (this.gameState === 'playing') {
            if (!isDetected) {
                // 人脸丢失，暂停游戏
                this.pauseGame();
                this.showMessage('人脸检测丢失，游戏已暂停');
            } else {
                // 人脸恢复，可以继续游戏
                this.showMessage('人脸检测恢复');
            }
        }
    }

    startGame() {
        if (this.gameState === 'playing') return;
        
        // 检查是否需要摄像头权限
        if (window.MediaPipeAvailable && !this.headControl && !this.privacyAccepted) {
            this.showPrivacyModal();
            return;
        }
        
        // 如果有头部控制但未校准完成，等待校准
        if (this.headControl && !this.headControl.calibrationCompleted) {
            this.showMessage('请等待头部控制校准完成...', 2000);
            return;
        }
        
        this.gameState = 'playing';
        
        // 隐藏开始屏幕
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
            startScreen.style.display = 'none';
        }
        
        // 隐藏游戏覆盖层
        const gameOverlay = document.getElementById('game-overlay');
        if (gameOverlay) {
            gameOverlay.style.display = 'none';
        }
        
        // 启动游戏引擎
        this.gameEngine.startGame();
        
        // 启用控制
        this.enableControls(true);
        
        console.log('Game started');
    }

    pauseGame() {
        if (this.gameState !== 'playing') return;
        
        this.gameState = 'paused';
        this.gameEngine.pauseGame();
        
        // 禁用控制
        this.enableControls(false);
        
        this.updateUI();
        console.log('Game paused');
    }

    resumeGame() {
        if (this.gameState !== 'paused') return;
        
        this.gameState = 'playing';
        this.gameEngine.resumeGame();
        
        // 启用控制
        this.enableControls(true);
        
        this.updateUI();
        console.log('Game resumed');
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.pauseGame();
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }

    restartGame() {
        this.gameState = 'menu';
        
        // 隐藏游戏结束屏幕
        const gameOverScreen = document.getElementById('game-over-screen');
        if (gameOverScreen) {
            gameOverScreen.style.display = 'none';
        }
        
        // 显示开始屏幕
        const startScreen = document.getElementById('start-screen');
        const gameOverlay = document.getElementById('game-overlay');
        if (startScreen && gameOverlay) {
            startScreen.style.display = 'block';
            gameOverlay.style.display = 'flex';
        }
        
        // 重置游戏引擎
        this.gameEngine.resetGameState();
        
        // 禁用控制
        this.enableControls(false);
        
        this.updateUI();
        console.log('Game restarted');
    }

    onGameEnd(gameResult) {
        this.gameState = 'ended';
        
        // 禁用控制
        this.enableControls(false);
        
        // 播放游戏结束音效
        if (this.audioSystem) {
            this.audioSystem.playSound('gameover');
        }
        
        // 显示游戏结束屏幕
        this.showGameOverScreen(gameResult);
        
        console.log('Game ended:', gameResult);
    }

    showGameOverScreen(gameResult) {
        const gameOverScreen = document.getElementById('game-over-screen');
        const gameOverlay = document.getElementById('game-overlay');
        const playerResult = document.getElementById('player-result');
        
        if (!gameOverScreen || !gameOverlay) return;
        
        // 更新分数显示
        const finalScoreElement = document.getElementById('final-score');
        const caughtCountElement = document.getElementById('caught-count');
        const missedCountElement = document.getElementById('missed-count');
        
        if (finalScoreElement) finalScoreElement.textContent = gameResult.score;
        if (caughtCountElement) caughtCountElement.textContent = gameResult.caughtCount;
        if (missedCountElement) missedCountElement.textContent = gameResult.missedCount;
        
        // 显示玩家照片和结果
        if (playerResult && this.photoManager) {
            const photoDisplay = this.photoManager.createGameEndPhotoDisplay(
                gameResult.score,
                gameResult.caughtCount,
                gameResult.missedCount
            );
            playerResult.innerHTML = photoDisplay;
        }
        
        // 显示屏幕
        gameOverScreen.style.display = 'block';
        gameOverlay.style.display = 'flex';
    }

    onScoreUpdate(score, caughtCount, missedCount) {
        // 更新右侧面板的分数显示
        const caughtDisplay = document.getElementById('caught-display');
        const missedDisplay = document.getElementById('missed-display');
        const scoreDisplay = document.getElementById('score-display');
        
        if (caughtDisplay) caughtDisplay.textContent = caughtCount;
        if (missedDisplay) missedDisplay.textContent = missedCount;
        if (scoreDisplay) scoreDisplay.textContent = score;
        
        // 可以在这里添加分数更新的特效
        if (score > 0 && score % 100 === 0) {
            // 每100分播放一次音效
            if (this.audioSystem) {
                this.audioSystem.playSound('levelup');
            }
        }
    }

    async toggleCamera() {
        const cameraBtn = document.getElementById('camera-btn');
        if (!cameraBtn) return;
        
        if (!this.headControl) {
            if (!this.privacyAccepted) {
                this.showPrivacyModal();
                return;
            }
            
            try {
                cameraBtn.textContent = '启动中...';
                cameraBtn.disabled = true;
                
                await this.initializeHeadControl();
                
                cameraBtn.textContent = '停止摄像头';
                cameraBtn.disabled = false;
                
            } catch (error) {
                cameraBtn.textContent = '启动摄像头';
                cameraBtn.disabled = false;
                this.showError('摄像头启动失败: ' + error.message);
            }
        } else {
            // 停止摄像头
            this.headControl.stop();
            this.headControl = null;
            
            cameraBtn.textContent = '启动摄像头';
        }
    }

    enableControls(enabled) {
        // 启用/禁用移动端控制
        if (this.mobileTouchHandler) {
            this.mobileTouchHandler.setEnabled(enabled);
        }
        
        // 更新按钮状态
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            // 暂停按钮在游戏运行或暂停时都应该可用
            pauseBtn.disabled = !(this.gameState === 'playing' || this.gameState === 'paused');
            pauseBtn.textContent = this.gameState === 'paused' ? '继续' : '暂停';
        }
    }

    updateUI() {
        // 更新按钮状态等UI元素
        this.enableControls(this.gameState === 'playing');
        
        // 确保暂停按钮状态正确
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.disabled = !(this.gameState === 'playing' || this.gameState === 'paused');
            pauseBtn.textContent = this.gameState === 'paused' ? '继续' : '暂停';
        }
    }

    onWindowResize() {
        // 调整设备适配
        this.adjustForDevice();
        
        // 调整画布尺寸
        if (this.gameEngine) {
            this.gameEngine.resizeCanvas();
        }
    }

    showMessage(message, duration = 3000) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 255, 255, 0.9);
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            z-index: 3000;
            pointer-events: none;
            animation: messageShow 0.3s ease-out;
            border: 2px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'messageHide 0.3s ease-out forwards';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.parentNode.removeChild(messageDiv);
                    }
                }, 300);
            }
        }, duration);
    }

    showError(message) {
        console.error(message);
        alert(message);
    }

    // 获取游戏状态
    getGameStatus() {
        return {
            gameState: this.gameState,
            privacyAccepted: this.privacyAccepted,
            headControlActive: this.headControl ? this.headControl.isActive : false,
            gameEngineState: this.gameEngine ? this.gameEngine.getGameState() : null,
            audioStatus: this.audioSystem ? this.audioSystem.getAudioStatus() : null
        };
    }
}

// 添加消息动画CSS
const messageStyle = document.createElement('style');
messageStyle.textContent = `
    @keyframes messageShow {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
        100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
    
    @keyframes messageHide {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
    }
`;
document.head.appendChild(messageStyle);

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    window.cyberCatchGame = new CyberCatchGame();
});

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CyberCatchGame;
} else {
    window.CyberCatchGame = CyberCatchGame;
}