// 排行榜管理系统
class LeaderboardManager {
    constructor() {
        this.storageKey = 'cybercatch_leaderboard';
        this.maxEntries = 100; // 最多显示100个记录
        this.leaderboard = this.loadLeaderboard();
    }

    // 从本地存储加载排行榜
    loadLeaderboard() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            return [];
        }
    }

    // 保存排行榜到本地存储
    saveLeaderboard() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.leaderboard));
        } catch (error) {
            console.error('Failed to save leaderboard:', error);
        }
    }

    // 添加新的游戏记录
    addScore(playerData) {
        const entry = {
            id: Date.now() + Math.random(), // 唯一ID
            playerName: playerData.playerName || '匿名玩家',
            score: playerData.score,
            caughtCount: playerData.caughtCount,
            missedCount: playerData.missedCount,
            level: playerData.level,
            playTime: new Date().toISOString(),
            playerPhoto: playerData.playerPhoto || null // base64编码的头像
        };

        // 添加到排行榜
        this.leaderboard.push(entry);

        // 按分数排序（从高到低）
        this.leaderboard.sort((a, b) => b.score - a.score);

        // 限制最大条目数
        if (this.leaderboard.length > this.maxEntries) {
            this.leaderboard = this.leaderboard.slice(0, this.maxEntries);
        }

        // 保存到本地存储
        this.saveLeaderboard();

        return entry;
    }

    // 获取排行榜数据
    getLeaderboard(limit = this.maxEntries) {
        return this.leaderboard.slice(0, limit);
    }

    // 获取玩家排名
    getPlayerRank(score) {
        const rank = this.leaderboard.findIndex(entry => entry.score <= score) + 1;
        return rank === 0 ? this.leaderboard.length + 1 : rank;
    }

    // 清空排行榜
    clearLeaderboard() {
        this.leaderboard = [];
        this.saveLeaderboard();
    }

    // 获取统计信息
    getStats() {
        if (this.leaderboard.length === 0) {
            return {
                totalPlayers: 0,
                highestScore: 0,
                averageScore: 0,
                totalGames: 0
            };
        }

        const scores = this.leaderboard.map(entry => entry.score);
        const totalScore = scores.reduce((sum, score) => sum + score, 0);

        return {
            totalPlayers: this.leaderboard.length,
            highestScore: Math.max(...scores),
            averageScore: Math.round(totalScore / this.leaderboard.length),
            totalGames: this.leaderboard.length
        };
    }

    // 创建排行榜HTML
    createLeaderboardHTML() {
        const stats = this.getStats();
        const entries = this.getLeaderboard();

        let html = `
            <div class="leaderboard-container">
                <div class="leaderboard-header">
                    <h2>🏆 CyberCatch 排行榜</h2>
                    <div class="leaderboard-stats">
                        <div class="stat-item">
                            <span class="stat-label">总玩家数:</span>
                            <span class="stat-value">${stats.totalPlayers}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">最高分:</span>
                            <span class="stat-value">${stats.highestScore}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">平均分:</span>
                            <span class="stat-value">${stats.averageScore}</span>
                        </div>
                    </div>
                </div>
                
                <div class="leaderboard-list">
        `;

        if (entries.length === 0) {
            html += `
                <div class="no-entries">
                    <p>🎮 还没有玩家记录</p>
                    <p>成为第一个上榜的玩家吧！</p>
                </div>
            `;
        } else {
            entries.forEach((entry, index) => {
                const rank = index + 1;
                const rankIcon = this.getRankIcon(rank);
                const playDate = new Date(entry.playTime).toLocaleDateString('zh-CN');
                const playTime = new Date(entry.playTime).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                html += `
                    <div class="leaderboard-entry ${rank <= 3 ? 'top-three' : ''}" data-rank="${rank}">
                        <div class="entry-rank">
                            <span class="rank-number">${rankIcon} ${rank}</span>
                        </div>
                        
                        <div class="entry-avatar">
                            ${entry.playerPhoto ?
                        `<img src="${entry.playerPhoto}" alt="玩家头像" class="player-avatar">` :
                        `<div class="default-avatar">👤</div>`
                    }
                        </div>
                        
                        <div class="entry-info">
                            <div class="player-name">${entry.playerName}</div>
                            <div class="play-time">${playDate} ${playTime}</div>
                        </div>
                        
                        <div class="entry-score">
                            <div class="score-value">${entry.score}</div>
                            <div class="score-label">分</div>
                        </div>
                    </div>
                `;
            });
        }

        html += `
                </div>
                
                <div class="leaderboard-actions">
                    <button id="close-leaderboard" class="leaderboard-btn primary">关闭</button>
                    <button id="clear-leaderboard" class="leaderboard-btn secondary">清空排行榜</button>
                </div>
            </div>
        `;

        return html;
    }

    // 获取排名图标
    getRankIcon(rank) {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return '🏅';
        }
    }

    // 显示排行榜模态框
    showLeaderboard() {
        // 创建模态框
        const modal = document.createElement('div');
        modal.id = 'leaderboard-modal';
        modal.className = 'modal leaderboard-modal';
        modal.innerHTML = `
            <div class="modal-content leaderboard-content">
                ${this.createLeaderboardHTML()}
            </div>
        `;

        // 添加到页面
        document.body.appendChild(modal);

        // 显示模态框
        modal.style.display = 'flex';

        // 绑定事件
        this.bindLeaderboardEvents(modal);

        return modal;
    }

    // 绑定排行榜事件
    bindLeaderboardEvents(modal) {
        const closeBtn = modal.querySelector('#close-leaderboard');
        const clearBtn = modal.querySelector('#clear-leaderboard');

        // 关闭按钮
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideLeaderboard(modal);
            });
        }

        // 清空排行榜按钮
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('确定要清空所有排行榜记录吗？此操作不可恢复！')) {
                    this.clearLeaderboard();
                    // 重新创建内容
                    const container = modal.querySelector('.leaderboard-content');
                    container.innerHTML = this.createLeaderboardHTML();
                    // 重新绑定事件
                    this.bindLeaderboardEvents(modal);
                }
            });
        }

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideLeaderboard(modal);
            }
        });

        // ESC键关闭
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                this.hideLeaderboard(modal);
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        document.addEventListener('keydown', handleKeyPress);
    }

    // 隐藏排行榜
    hideLeaderboard(modal) {
        if (modal && modal.parentNode) {
            modal.style.display = 'none';
            modal.parentNode.removeChild(modal);
        }
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LeaderboardManager;
} else {
    window.LeaderboardManager = LeaderboardManager;
}