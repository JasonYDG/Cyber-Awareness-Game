// CyberCatch 游戏引擎
class GameEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
        this.gameLoop = null;
        this.gameStarted = false; // 新增：标记游戏是否真正开始
        this.frameCount = 0; // 帧计数器，用于性能优化
        this.performanceStats = {
            frameTime: 0,
            avgFrameTime: 0,
            fps: 0,
            lastFpsUpdate: 0
        }; // 性能统计
        
        // 游戏状态
        this.score = 0;
        this.level = 1;
        this.timeRemaining = 60; // 1分钟 = 60秒，快节奏挑战
        this.caughtCount = 0;
        this.missedCount = 0;
        
        // 游戏对象
        this.paddle = null;
        this.threats = [];
        this.particles = [];
        
        // 游戏设置 - 快节奏反应游戏
        this.threatSpawnRate = 1500; // 初始生成间隔（毫秒）- 1.5秒一个，更快节奏
        this.threatSpeed = 5.0; // 大幅增加下落速度，从3.0增加到5.0
        this.maxThreats = 6; // 增加20%威胁数量，从5增加到6
        this.lastThreatSpawn = 0;
        this.lastUpdate = 0;
        
        // 轨道系统 - 避免威胁重叠
        this.trackCount = 4; // 减少到4个轨道，提高性能和可视性
        this.trackWidth = 0; // 将在setupCanvas中计算
        this.occupiedTracks = new Set(); // 记录被占用的轨道
        
        // 威胁系统
        this.cyberThreats = new CyberThreats();
        
        // 回调函数
        this.onGameEnd = null;
        this.onScoreUpdate = null;
        
        this.init();
    }

    init() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            console.error('Game canvas not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.initializeGameObjects();
        
        console.log('Game engine initialized');
    }

    setupCanvas() {
        // 设置画布尺寸 - 加宽一倍，提高游戏挑战性
        this.canvas.width = 800; // 从400加宽到800
        this.canvas.height = 800; // 保持正方形比例
        
        // 计算轨道宽度
        this.trackWidth = this.canvas.width / this.trackCount;
        
        console.log(`Canvas size: ${this.canvas.width}x${this.canvas.height}, Track width: ${this.trackWidth}`);
    }

    initializeGameObjects() {
        // 初始化挡板 - 固定宽度确保3格显示
        const paddleWidth = 240; // 直接设置为240像素，确保显示为3格宽度
        this.paddle = {
            x: this.canvas.width / 2 - paddleWidth / 2,
            y: this.canvas.height - 30,
            width: paddleWidth,
            height: 15,
            speed: 35, // 大幅提高移动速度，从25增加到35，提高灵敏度
            color: '#00ffff'
        };
        
        // 清空威胁和粒子
        this.threats = [];
        this.particles = [];
    }

    startGame() {
        console.log('GameEngine.startGame called', { 
            gameRunning: this.gameRunning, 
            gameStarted: this.gameStarted 
        });
        
        // 如果游戏已经在运行，先完全停止
        if (this.gameRunning) {
            console.log('Game already running, resetting first...');
            this.resetGameState();
        }
        
        // 设置游戏状态
        this.gameRunning = true;
        this.gameStarted = false; // 游戏还未真正开始，等待倒计时结束
        
        // 重置游戏数据（但不停止游戏循环）
        this.score = 0;
        this.level = 1;
        this.timeRemaining = 60;
        this.caughtCount = 0;
        this.missedCount = 0;
        this.threatSpawnRate = 1000;
        this.threatSpeed = 4;
        this.lastThreatSpawn = 0;
        
        // 清空游戏对象
        this.threats = [];
        this.particles = [];
        this.occupiedTracks = new Set();
        
        // 重新初始化游戏对象
        this.initializeGameObjects();
        
        // 启动游戏循环
        this.lastUpdate = performance.now();
        this.gameLoop = requestAnimationFrame(this.update.bind(this));
        
        // 开始倒计时
        this.startTimer();
        
        console.log('GameEngine started successfully');
    }

    // 真正开始游戏（倒计时结束后调用）
    actuallyStartGame() {
        this.gameStarted = true;
        // 重置威胁生成时间，确保立即开始生成
        this.lastThreatSpawn = performance.now();
        console.log('Game actually started - threats will now spawn');
    }

    resetGameState() {
        // 完全停止当前游戏
        this.gameRunning = false;
        this.gameStarted = false;
        
        // 清理游戏循环
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        
        // 重置游戏数据
        this.score = 0;
        this.level = 1;
        this.timeRemaining = 60;
        this.caughtCount = 0;
        this.missedCount = 0;
        this.threatSpawnRate = 1000;
        this.threatSpeed = 4;
        this.lastThreatSpawn = 0;
        
        // 清空游戏对象
        this.threats = [];
        this.particles = [];
        this.occupiedTracks = new Set();
        
        // 重新初始化游戏对象
        this.initializeGameObjects();
        this.updateUI();
        
        console.log('Game state completely reset');
    }

    startTimer() {
        const timer = setInterval(() => {
            if (!this.gameRunning) {
                clearInterval(timer);
                return;
            }
            
            this.timeRemaining--;
            this.updateUI();
            
            if (this.timeRemaining <= 0) {
                clearInterval(timer);
                this.endGame();
            }
        }, 1000);
    }

    update(currentTime) {
        if (!this.gameRunning) return;
        
        const deltaTime = currentTime - this.lastUpdate;
        
        // 优化更新频率 - 每16ms更新一次（约60FPS），提高流畅度
        if (deltaTime < 16) {
            this.gameLoop = requestAnimationFrame(this.update.bind(this));
            return;
        }
        
        this.lastUpdate = currentTime;
        this.frameCount++; // 增加帧计数
        
        // 性能监控
        this.performanceStats.frameTime = deltaTime;
        if (currentTime - this.performanceStats.lastFpsUpdate > 1000) {
            this.performanceStats.fps = Math.round(1000 / this.performanceStats.frameTime);
            this.performanceStats.lastFpsUpdate = currentTime;
        }
        
        // 更新游戏逻辑
        this.updateLevel();
        this.spawnThreats(currentTime);
        this.updateThreats();
        this.updateParticles(deltaTime);
        this.checkCollisions();
        
        // 渲染
        this.render();
        
        // 继续游戏循环
        this.gameLoop = requestAnimationFrame(this.update.bind(this));
    }

    updateLevel() {
        // 根据时间和分数调整等级
        const timeElapsed = 60 - this.timeRemaining;
        const newLevel = Math.floor(timeElapsed / 20) + Math.floor(this.score / 500) + 1;
        
        if (newLevel !== this.level) {
            this.level = newLevel;
            
            // 调整难度 - 平衡的反应游戏，限制最大速度
            this.threatSpawnRate = Math.max(600, 1500 - (this.level - 1) * 150); // 最快0.6秒一个
            this.threatSpeed = Math.min(8.0, 5.0 + (this.level - 1) * 0.3); // 限制最大速度为8.0，增长更缓慢
            // 高等级时允许更多威胁
            this.maxThreats = Math.min(10, 6 + Math.floor((this.level - 1) / 2)); // 增加20%威胁数量
            
            console.log(`Level up! Level ${this.level}, Spawn rate: ${this.threatSpawnRate}ms, Speed: ${this.threatSpeed}`);
        }
    }

    spawnThreats(currentTime) {
        // 如果游戏还未真正开始（倒计时期间），不生成威胁
        if (!this.gameStarted) {
            // 每5秒输出一次调试信息，避免日志过多
            if (Math.floor(currentTime / 5000) !== Math.floor(this.lastThreatSpawn / 5000)) {
                console.log('Waiting for game to actually start...');
                this.lastThreatSpawn = currentTime;
            }
            return;
        }
        
        // 控制威胁数量
        if (this.threats.length >= this.maxThreats) {
            return;
        }
        
        if (currentTime - this.lastThreatSpawn > this.threatSpawnRate) {
            const threat = this.cyberThreats.getRandomThreat(this.level);
            
            // 选择可用轨道，避免重叠
            const availableTracks = [];
            for (let i = 0; i < this.trackCount; i++) {
                if (!this.occupiedTracks.has(i)) {
                    availableTracks.push(i);
                }
            }
            
            // 如果没有可用轨道，清理一些已占用的轨道
            if (availableTracks.length === 0) {
                this.occupiedTracks.clear();
                for (let i = 0; i < this.trackCount; i++) {
                    availableTracks.push(i);
                }
            }
            
            // 随机选择一个可用轨道
            const selectedTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
            const threatSize = 120; // 放大图案尺寸，从80增加到120
            const trackX = selectedTrack * this.trackWidth + (this.trackWidth - threatSize) / 2;
            
            const threatObj = {
                ...threat,
                x: trackX,
                y: -threatSize,
                size: threatSize,
                speed: this.threatSpeed * threat.speed,
                track: selectedTrack // 记录轨道信息
            };
            
            this.threats.push(threatObj);
            this.occupiedTracks.add(selectedTrack);
            this.lastThreatSpawn = currentTime;
            
            // 设置轨道释放定时器
            setTimeout(() => {
                this.occupiedTracks.delete(selectedTrack);
            }, 1500); // 1.5秒后释放轨道
            
            console.log(`Spawned threat in track ${selectedTrack}. Current count: ${this.threats.length}/${this.maxThreats}`);
        }
    }

    updateThreats() {
        for (let i = this.threats.length - 1; i >= 0; i--) {
            const threat = this.threats[i];
            
            // 只更新位置，移除旋转以提高性能
            threat.y += threat.speed;
            
            // 检查是否超出屏幕底部
            if (threat.y > this.canvas.height) {
                this.threats.splice(i, 1);
                this.missedCount++;
                this.createMissEffect(threat.x + threat.size/2, this.canvas.height);
                
                // 错过威胁的惩罚
                this.score = Math.max(0, this.score - 5);
                this.updateUI();
            }
        }
    }

    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= deltaTime;
            particle.alpha = particle.life / particle.maxLife;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    checkCollisions() {
        for (let i = this.threats.length - 1; i >= 0; i--) {
            const threat = this.threats[i];
            
            // 检查与挡板的碰撞
            if (this.isColliding(threat, this.paddle)) {
                // 碰撞成功
                this.score += threat.points;
                this.caughtCount++;
                
                // 创建捕获效果
                this.createCatchEffect(threat.x + threat.size/2, threat.y + threat.size/2, threat.points);
                
                // 移除威胁
                this.threats.splice(i, 1);
                
                // 播放音效
                this.playSound('catch');
                
                this.updateUI();
            }
        }
    }

    isColliding(threat, paddle) {
        return threat.x < paddle.x + paddle.width &&
               threat.x + threat.size > paddle.x &&
               threat.y < paddle.y + paddle.height &&
               threat.y + threat.size > paddle.y;
    }

    createCatchEffect(x, y, points) {
        // 大幅减少粒子数量以降低CPU使用
        for (let i = 0; i < 4; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 600,
                maxLife: 600,
                alpha: 1,
                color: '#00ffff',
                size: Math.random() * 2 + 2
            });
        }
        
        // 创建分数显示
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: -1.5,
            life: 1200,
            maxLife: 1200,
            alpha: 1,
            color: '#ffff00',
            size: 14,
            text: `+${points}`,
            isText: true
        });
    }

    createMissEffect(x, y) {
        // 进一步减少错过效果粒子数量
        for (let i = 0; i < 2; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * -2,
                life: 400,
                maxLife: 400,
                alpha: 1,
                color: '#ff0040',
                size: Math.random() * 1.5 + 1
            });
        }
    }

    movePaddle(direction) {
        if (!this.gameRunning) return;
        
        const newX = this.paddle.x + direction * this.paddle.speed;
        
        // 边界检查
        if (newX >= 0 && newX + this.paddle.width <= this.canvas.width) {
            this.paddle.x = newX;
        }
        
        // 播放移动音效
        this.playSound('move');
    }

    render() {
        // 完全清空画布，去掉拖影效果以提高性能
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景效果
        this.drawBackground();
        
        // 绘制威胁
        this.drawThreats();
        
        // 绘制挡板
        this.drawPaddle();
        
        // 绘制粒子效果
        this.drawParticles();
        
        // 绘制UI元素
        this.drawGameUI();
    }

    drawBackground() {
        // 性能优化：减少背景绘制频率，每5帧绘制一次
        if (this.frameCount % 5 !== 0) return;
        
        // 极简背景绘制 - 轨道辅助线（可选）
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.02)'; // 进一步降低透明度
        this.ctx.lineWidth = 1;
        
        // 只绘制轨道分隔线，移除水平线以提高性能
        for (let i = 1; i < this.trackCount; i++) {
            const x = i * this.trackWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
    }

    drawThreats() {
        // 简化威胁绘制 - 移除旋转变换以提高性能
        this.threats.forEach(threat => {
            this.cyberThreats.drawThreat(this.ctx, threat, threat.x, threat.y, threat.size);
        });
    }

    drawPaddle() {
        const paddle = this.paddle;
        
        // 绘制挡板主体
        this.ctx.fillStyle = paddle.color;
        this.ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        
        // 性能优化：只在每3帧绘制一次发光效果
        if (this.frameCount % 3 === 0) {
            this.ctx.shadowColor = paddle.color;
            this.ctx.shadowBlur = 8; // 减少模糊半径以提高性能
            this.ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
            this.ctx.shadowBlur = 0;
        }
        
        // 绘制边框
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
        
        // 简化中心线绘制
        this.ctx.strokeStyle = '#ff0040';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(paddle.x + paddle.width/2, paddle.y);
        this.ctx.lineTo(paddle.x + paddle.width/2, paddle.y + paddle.height);
        this.ctx.stroke();
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            
            if (particle.isText) {
                this.ctx.fillStyle = particle.color;
                this.ctx.font = `bold ${particle.size}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText(particle.text, particle.x, particle.y);
            } else {
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.restore();
        });
    }

    drawGameUI() {
        // 绘制时间警告
        if (this.timeRemaining <= 30) {
            this.ctx.fillStyle = this.timeRemaining % 2 === 0 ? '#ff0040' : '#ffffff';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`时间: ${this.timeRemaining}s`, this.canvas.width / 2, 40);
        }
        
        // 性能优化：调试信息每10帧更新一次
        if (this.frameCount % 10 === 0) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`威胁: ${this.threats.length}/${this.maxThreats}`, 10, 20);
            this.ctx.fillText(`粒子: ${this.particles.length}`, 10, 35);
            this.ctx.fillText(`FPS: ${this.performanceStats.fps}`, 10, 50);
        }
    }



    updateUI() {
        // 更新分数显示
        const scoreElement = document.getElementById('score');
        const timeElement = document.getElementById('time');
        const levelElement = document.getElementById('level');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (timeElement) timeElement.textContent = this.timeRemaining;
        if (levelElement) levelElement.textContent = this.level;
        
        // 调用回调
        if (this.onScoreUpdate) {
            this.onScoreUpdate(this.score, this.caughtCount, this.missedCount);
        }
    }

    pauseGame() {
        if (!this.gameRunning) return;
        
        this.gameRunning = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        
        console.log('Game paused');
    }

    resumeGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.lastUpdate = performance.now();
        this.gameLoop = requestAnimationFrame(this.update.bind(this));
        
        console.log('Game resumed');
    }

    endGame() {
        this.gameRunning = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        
        console.log(`Game ended - Score: ${this.score}, Caught: ${this.caughtCount}, Missed: ${this.missedCount}`);
        
        // 调用游戏结束回调
        if (this.onGameEnd) {
            this.onGameEnd({
                score: this.score,
                caughtCount: this.caughtCount,
                missedCount: this.missedCount,
                level: this.level
            });
        }
    }

    playSound(soundType) {
        // 音效播放（由音频系统处理）
        if (window.audioSystem) {
            window.audioSystem.playSound(soundType);
        }
    }

    // 获取游戏状态
    getGameState() {
        return {
            running: this.gameRunning,
            score: this.score,
            level: this.level,
            timeRemaining: this.timeRemaining,
            caughtCount: this.caughtCount,
            missedCount: this.missedCount,
            threatsCount: this.threats.length
        };
    }

    // 调整画布尺寸
    resizeCanvas() {
        // 加宽游戏画面，适应不同屏幕
        const isMobile = window.innerWidth <= 768;
        const isSmallScreen = window.innerWidth <= 1200;
        
        if (isMobile) {
            this.canvas.width = 600; // 移动端也加宽
            this.canvas.height = 600;
        } else if (isSmallScreen) {
            this.canvas.width = 700;
            this.canvas.height = 700;
        } else {
            this.canvas.width = 800; // 桌面端加宽一倍
            this.canvas.height = 800;
        }
        
        if (this.paddle) {
            // 调整挡板位置和尺寸
            this.paddle.y = this.canvas.height - 30;
            this.paddle.width = 240; // 固定宽度确保3格显示
            if (this.paddle.x + this.paddle.width > this.canvas.width) {
                this.paddle.x = this.canvas.width - this.paddle.width;
            }
        }
        
        console.log(`Canvas resized to: ${this.canvas.width}x${this.canvas.height}`);
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
} else {
    window.GameEngine = GameEngine;
}