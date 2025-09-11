// 音频系统 - CyberCatch专用
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.bgmEnabled = true;
        this.sfxEnabled = true;
        this.bgmPlaying = false;
        this.bgmGainNode = null;
        this.sfxGainNode = null;
        this.bgmOscillators = [];
        
        this.init();
    }

    async init() {
        try {
            // 等待用户交互后初始化音频上下文
            document.addEventListener('click', this.initAudioContext.bind(this), { once: true });
            document.addEventListener('touchstart', this.initAudioContext.bind(this), { once: true });
            
            console.log('Audio system initialized, waiting for user interaction');
        } catch (error) {
            console.error('Audio system initialization failed:', error);
        }
    }

    async initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 创建增益节点
            this.bgmGainNode = this.audioContext.createGain();
            this.sfxGainNode = this.audioContext.createGain();
            
            this.bgmGainNode.connect(this.audioContext.destination);
            this.sfxGainNode.connect(this.audioContext.destination);
            
            // 设置初始音量
            this.bgmGainNode.gain.value = 0.3;
            this.sfxGainNode.gain.value = 0.5;
            
            console.log('Audio context initialized successfully');
            
            // 自动开始BGM
            if (this.bgmEnabled) {
                this.startBGM();
            }
            
        } catch (error) {
            console.error('Audio context initialization failed:', error);
        }
    }

    // 播放音效
    playSound(soundType) {
        if (!this.audioContext || !this.sfxEnabled) return;
        
        try {
            switch (soundType) {
                case 'catch':
                    this.playCatchSound();
                    break;
                case 'miss':
                    this.playMissSound();
                    break;
                case 'levelup':
                    this.playLevelUpSound();
                    break;
                case 'gamestart':
                    this.playGameStartSound();
                    break;
                case 'gameover':
                    this.playGameOverSound();
                    break;
                case 'move':
                    this.playMoveSound();
                    break;
                case 'countdown':
                    this.playCountdownSound();
                    break;
                default:
                    console.warn(`Unknown sound type: ${soundType}`);
            }
        } catch (error) {
            console.error(`Failed to play sound ${soundType}:`, error);
        }
    }

    // 捕获威胁音效
    playCatchSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        // 网络安全主题音效 - 数字化捕获声
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
        
        // 添加数字化效果
        setTimeout(() => {
            const osc2 = this.audioContext.createOscillator();
            const gain2 = this.audioContext.createGain();
            
            osc2.connect(gain2);
            gain2.connect(this.sfxGainNode);
            
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(400, this.audioContext.currentTime);
            gain2.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            osc2.start(this.audioContext.currentTime);
            osc2.stop(this.audioContext.currentTime + 0.1);
        }, 100);
    }

    // 错过威胁音效
    playMissSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        // 警告音效
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }

    // 升级音效
    playLevelUpSound() {
        const frequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.sfxGainNode);
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.3);
            }, index * 100);
        });
    }

    // 游戏开始音效
    playGameStartSound() {
        // 网络启动音效
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }

    // 游戏结束音效
    playGameOverSound() {
        // 系统关闭音效
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 1);
    }

    // 移动音效
    playMoveSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }

    // 倒计时音效
    playCountdownSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    // 开始背景音乐
    startBGM() {
        if (!this.audioContext || this.bgmPlaying || !this.bgmEnabled) return;
        
        this.bgmPlaying = true;
        this.playBGMLoop();
        console.log('BGM started');
    }

    // 停止背景音乐
    stopBGM() {
        this.bgmPlaying = false;
        
        // 停止所有BGM振荡器
        this.bgmOscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {
                // 忽略已经停止的振荡器
            }
        });
        this.bgmOscillators = [];
        
        console.log('BGM stopped');
    }

    // BGM循环播放
    playBGMLoop() {
        if (!this.bgmPlaying || !this.audioContext) return;
        
        // 网络安全主题BGM - 电子音乐风格
        const melody = [
            { freq: 220, duration: 0.5 }, // A3
            { freq: 277, duration: 0.5 }, // C#4
            { freq: 330, duration: 0.5 }, // E4
            { freq: 440, duration: 0.5 }, // A4
            { freq: 330, duration: 0.5 }, // E4
            { freq: 277, duration: 0.5 }, // C#4
            { freq: 220, duration: 1.0 }, // A3
            { freq: 0, duration: 0.5 },   // 休止符
        ];
        
        let currentTime = this.audioContext.currentTime;
        
        melody.forEach((note, index) => {
            if (note.freq > 0) {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.bgmGainNode);
                
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(note.freq, currentTime);
                
                gainNode.gain.setValueAtTime(0, currentTime);
                gainNode.gain.linearRampToValueAtTime(0.1, currentTime + 0.05);
                gainNode.gain.linearRampToValueAtTime(0.05, currentTime + note.duration - 0.05);
                gainNode.gain.linearRampToValueAtTime(0, currentTime + note.duration);
                
                oscillator.start(currentTime);
                oscillator.stop(currentTime + note.duration);
                
                this.bgmOscillators.push(oscillator);
                
                // 清理已完成的振荡器
                oscillator.onended = () => {
                    const index = this.bgmOscillators.indexOf(oscillator);
                    if (index > -1) {
                        this.bgmOscillators.splice(index, 1);
                    }
                };
            }
            
            currentTime += note.duration;
        });
        
        // 循环播放
        const totalDuration = melody.reduce((sum, note) => sum + note.duration, 0);
        setTimeout(() => {
            if (this.bgmPlaying) {
                this.playBGMLoop();
            }
        }, totalDuration * 1000);
    }

    // 切换BGM
    toggleBGM() {
        this.bgmEnabled = !this.bgmEnabled;
        
        if (this.bgmEnabled) {
            this.startBGM();
        } else {
            this.stopBGM();
        }
        
        // 更新UI
        this.updateBGMButton();
        
        return this.bgmEnabled;
    }

    // 切换音效
    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }

    // 设置BGM音量
    setBGMVolume(volume) {
        if (this.bgmGainNode) {
            this.bgmGainNode.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    // 设置音效音量
    setSFXVolume(volume) {
        if (this.sfxGainNode) {
            this.sfxGainNode.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    // 更新BGM按钮显示
    updateBGMButton() {
        const bgmButton = document.querySelector('button[onclick="toggleBGM()"]');
        const musicIndicator = document.getElementById('music-indicator');
        
        if (bgmButton) {
            bgmButton.className = this.bgmEnabled ? 'music-enabled' : 'music-disabled';
        }
        
        if (musicIndicator) {
            musicIndicator.textContent = this.bgmEnabled ? '🎵' : '🔇';
        }
    }

    // 获取音频状态
    getAudioStatus() {
        return {
            contextState: this.audioContext ? this.audioContext.state : 'not-initialized',
            bgmEnabled: this.bgmEnabled,
            bgmPlaying: this.bgmPlaying,
            sfxEnabled: this.sfxEnabled,
            bgmVolume: this.bgmGainNode ? this.bgmGainNode.gain.value : 0,
            sfxVolume: this.sfxGainNode ? this.sfxGainNode.gain.value : 0
        };
    }

    // 销毁音频系统
    destroy() {
        this.stopBGM();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        console.log('Audio system destroyed');
    }
}

// 全局BGM切换函数
function toggleBGM() {
    if (window.audioSystem) {
        const enabled = window.audioSystem.toggleBGM();
        console.log(`BGM ${enabled ? 'enabled' : 'disabled'}`);
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioSystem;
} else {
    window.AudioSystem = AudioSystem;
}