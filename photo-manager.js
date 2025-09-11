// 玩家照片管理系统 - 隐私保护
class PhotoManager {
    constructor() {
        this.playerPhoto = null;
        this.photoTimestamp = null;
        this.photoExpiryHours = 4; // 4小时后自动删除
        this.storageKey = 'cyberCatch_playerPhoto';
        this.timestampKey = 'cyberCatch_photoTimestamp';
        
        this.init();
    }

    init() {
        // 检查现有照片是否过期
        this.checkPhotoExpiry();
        
        // 设置定期清理
        this.setupPeriodicCleanup();
        
        // 页面卸载时清理
        this.setupUnloadCleanup();
    }

    // 捕获玩家照片
    async capturePlayerPhoto() {
        try {
            const video = document.getElementById('input_video');
            const canvas = document.getElementById('output_canvas');
            
            if (!video || !canvas) {
                throw new Error('视频或画布元素未找到');
            }

            // 创建临时画布用于捕获照片
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            // 设置照片尺寸
            const photoSize = 150;
            tempCanvas.width = photoSize;
            tempCanvas.height = photoSize;
            
            // 从视频捕获当前帧
            tempCtx.drawImage(video, 0, 0, photoSize, photoSize);
            
            // 添加网络安全主题边框效果
            this.addCyberFrame(tempCtx, photoSize);
            
            // 转换为数据URL
            const photoDataUrl = tempCanvas.toDataURL('image/jpeg', 0.8);
            
            // 存储照片和时间戳
            this.playerPhoto = photoDataUrl;
            this.photoTimestamp = Date.now();
            
            // 保存到本地存储（加密）
            this.savePhotoSecurely();
            
            // 显示照片
            this.displayPlayerPhoto();
            
            console.log('玩家照片捕获成功，将在4小时后自动删除');
            return true;
            
        } catch (error) {
            console.error('照片捕获失败:', error);
            return false;
        }
    }

    // 添加网络安全主题边框
    addCyberFrame(ctx, size) {
        // 添加发光边框效果
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        
        // 绘制边框
        ctx.strokeRect(2, 2, size - 4, size - 4);
        
        // 添加角落装饰
        const cornerSize = 15;
        ctx.strokeStyle = '#ff0040';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ff0040';
        ctx.shadowBlur = 5;
        
        // 左上角
        ctx.beginPath();
        ctx.moveTo(5, 5 + cornerSize);
        ctx.lineTo(5, 5);
        ctx.lineTo(5 + cornerSize, 5);
        ctx.stroke();
        
        // 右上角
        ctx.beginPath();
        ctx.moveTo(size - 5 - cornerSize, 5);
        ctx.lineTo(size - 5, 5);
        ctx.lineTo(size - 5, 5 + cornerSize);
        ctx.stroke();
        
        // 左下角
        ctx.beginPath();
        ctx.moveTo(5, size - 5 - cornerSize);
        ctx.lineTo(5, size - 5);
        ctx.lineTo(5 + cornerSize, size - 5);
        ctx.stroke();
        
        // 右下角
        ctx.beginPath();
        ctx.moveTo(size - 5 - cornerSize, size - 5);
        ctx.lineTo(size - 5, size - 5);
        ctx.lineTo(size - 5, size - 5 - cornerSize);
        ctx.stroke();
        
        // 重置阴影
        ctx.shadowBlur = 0;
        
        // 添加时间戳水印
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '8px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(new Date().toLocaleString(), size - 5, size - 5);
    }

    // 显示玩家照片
    displayPlayerPhoto() {
        const photoSection = document.getElementById('player-photo-section');
        const photoCanvas = document.getElementById('player-photo');
        
        if (!photoSection || !photoCanvas || !this.playerPhoto) return;
        
        const ctx = photoCanvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            ctx.clearRect(0, 0, photoCanvas.width, photoCanvas.height);
            ctx.drawImage(img, 0, 0, photoCanvas.width, photoCanvas.height);
            
            // 显示照片区域
            photoSection.style.display = 'block';
            
            // 更新隐私提示
            this.updatePrivacyNote();
        };
        
        img.src = this.playerPhoto;
    }

    // 更新隐私提示
    updatePrivacyNote() {
        const privacyNote = document.querySelector('.privacy-note');
        if (!privacyNote || !this.photoTimestamp) return;
        
        const expiryTime = new Date(this.photoTimestamp + this.photoExpiryHours * 60 * 60 * 1000);
        const remainingHours = Math.max(0, Math.ceil((expiryTime - Date.now()) / (60 * 60 * 1000)));
        
        privacyNote.textContent = `📸 照片将在${remainingHours}小时后自动删除`;
    }

    // 安全保存照片（简单加密）
    savePhotoSecurely() {
        try {
            if (!this.playerPhoto || !this.photoTimestamp) return;
            
            // 简单的Base64编码（实际应用中应使用更强的加密）
            const encodedPhoto = btoa(this.playerPhoto);
            
            localStorage.setItem(this.storageKey, encodedPhoto);
            localStorage.setItem(this.timestampKey, this.photoTimestamp.toString());
            
        } catch (error) {
            console.error('照片保存失败:', error);
        }
    }

    // 安全加载照片
    loadPhotoSecurely() {
        try {
            const encodedPhoto = localStorage.getItem(this.storageKey);
            const timestamp = localStorage.getItem(this.timestampKey);
            
            if (!encodedPhoto || !timestamp) return false;
            
            this.playerPhoto = atob(encodedPhoto);
            this.photoTimestamp = parseInt(timestamp);
            
            return true;
            
        } catch (error) {
            console.error('照片加载失败:', error);
            this.clearPhoto();
            return false;
        }
    }

    // 检查照片是否过期
    checkPhotoExpiry() {
        if (this.loadPhotoSecurely()) {
            const now = Date.now();
            const expiryTime = this.photoTimestamp + (this.photoExpiryHours * 60 * 60 * 1000);
            
            if (now >= expiryTime) {
                console.log('玩家照片已过期，自动删除');
                this.clearPhoto();
            } else {
                console.log('加载现有玩家照片');
                this.displayPlayerPhoto();
            }
        }
    }

    // 清除照片
    clearPhoto() {
        this.playerPhoto = null;
        this.photoTimestamp = null;
        
        // 清除本地存储
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.timestampKey);
        
        // 隐藏照片显示区域
        const photoSection = document.getElementById('player-photo-section');
        if (photoSection) {
            photoSection.style.display = 'none';
        }
        
        // 清空画布
        const photoCanvas = document.getElementById('player-photo');
        if (photoCanvas) {
            const ctx = photoCanvas.getContext('2d');
            ctx.clearRect(0, 0, photoCanvas.width, photoCanvas.height);
        }
        
        console.log('玩家照片已清除');
    }

    // 设置定期清理
    setupPeriodicCleanup() {
        // 每小时检查一次
        setInterval(() => {
            this.checkPhotoExpiry();
        }, 60 * 60 * 1000);
        
        // 每10分钟更新隐私提示
        setInterval(() => {
            if (this.photoTimestamp) {
                this.updatePrivacyNote();
            }
        }, 10 * 60 * 1000);
    }

    // 页面卸载时清理
    setupUnloadCleanup() {
        window.addEventListener('beforeunload', () => {
            // 可选：页面关闭时立即清除照片
            // this.clearPhoto();
        });
        
        // 页面隐藏时暂停（移动端）
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // 页面隐藏时的处理
                console.log('页面隐藏，照片管理暂停');
            } else {
                // 页面重新显示时检查过期
                this.checkPhotoExpiry();
            }
        });
    }

    // 获取游戏结束时的照片用于显示
    getPhotoForGameEnd() {
        if (!this.playerPhoto || !this.photoTimestamp) {
            return null;
        }
        
        // 检查是否过期
        const now = Date.now();
        const expiryTime = this.photoTimestamp + (this.photoExpiryHours * 60 * 60 * 1000);
        
        if (now >= expiryTime) {
            this.clearPhoto();
            return null;
        }
        
        return this.playerPhoto;
    }

    // 创建游戏结束照片显示
    createGameEndPhotoDisplay(finalScore, caughtCount, missedCount) {
        const photo = this.getPhotoForGameEnd();
        if (!photo) {
            return '<p>📸 照片已过期或未捕获</p>';
        }
        
        return `
            <div class="game-end-photo">
                <img src="${photo}" alt="玩家照片" style="
                    width: 120px; 
                    height: 120px; 
                    border-radius: 10px; 
                    border: 2px solid #00ffff;
                    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
                    margin: 10px 0;
                ">
                <div class="photo-stats">
                    <p style="margin: 5px 0; font-size: 0.9em; color: #00ffff;">
                        🏆 最终分数: ${finalScore}
                    </p>
                    <p style="margin: 5px 0; font-size: 0.9em; color: #00ff00;">
                        ✅ 成功拦截: ${caughtCount}
                    </p>
                    <p style="margin: 5px 0; font-size: 0.9em; color: #ff6600;">
                        ❌ 错过威胁: ${missedCount}
                    </p>
                </div>
                <p style="font-size: 0.7em; color: rgba(255,255,255,0.6); margin-top: 10px;">
                    📸 照片将在${Math.ceil((this.photoTimestamp + this.photoExpiryHours * 60 * 60 * 1000 - Date.now()) / (60 * 60 * 1000))}小时后自动删除
                </p>
            </div>
        `;
    }

    // 手动删除照片（用户主动删除）
    deletePhotoManually() {
        const confirmed = confirm('确定要删除您的照片吗？此操作不可撤销。');
        if (confirmed) {
            this.clearPhoto();
            alert('照片已删除');
        }
    }

    // 获取照片状态信息
    getPhotoStatus() {
        if (!this.photoTimestamp) {
            return {
                hasPhoto: false,
                message: '未捕获照片'
            };
        }
        
        const now = Date.now();
        const expiryTime = this.photoTimestamp + (this.photoExpiryHours * 60 * 60 * 1000);
        const remainingMs = expiryTime - now;
        
        if (remainingMs <= 0) {
            return {
                hasPhoto: false,
                message: '照片已过期'
            };
        }
        
        const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
        return {
            hasPhoto: true,
            remainingHours: remainingHours,
            message: `照片将在${remainingHours}小时后删除`
        };
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhotoManager;
} else {
    window.PhotoManager = PhotoManager;
}