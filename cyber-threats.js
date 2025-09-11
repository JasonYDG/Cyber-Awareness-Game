// 网络安全威胁数据和图案定义
class CyberThreats {
    constructor() {
        this.threats = this.initializeThreats();
        this.colors = {
            malware: '#ff0040',
            phishing: '#ff6600',
            ransomware: '#cc0000',
            ddos: '#9900cc',
            socialeng: '#ffcc00',
            dataLeak: '#00ccff',
            virus: '#ff3366',
            trojan: '#cc3399'
        };
    }

    initializeThreats() {
        return [
            // 恶意软件类
            {
                id: 'malware1',
                type: 'malware',
                text: '恶意软件',
                icon: '🦠',
                description: '恶意软件感染',
                points: 10,
                speed: 1.0
            },
            {
                id: 'virus1',
                type: 'virus',
                text: '计算机病毒',
                icon: '🔴',
                description: '病毒传播',
                points: 15,
                speed: 1.2
            },
            {
                id: 'trojan1',
                type: 'trojan',
                text: '木马程序',
                icon: '🐴',
                description: '特洛伊木马',
                points: 20,
                speed: 1.1
            },
            {
                id: 'ransomware1',
                type: 'ransomware',
                text: '勒索软件',
                icon: '🔒',
                description: '文件加密勒索',
                points: 25,
                speed: 0.9
            },

            // 网络攻击类
            {
                id: 'ddos1',
                type: 'ddos',
                text: 'DDoS攻击',
                icon: '💥',
                description: '分布式拒绝服务',
                points: 30,
                speed: 1.3
            },
            {
                id: 'phishing1',
                type: 'phishing',
                text: '钓鱼邮件',
                icon: '🎣',
                description: '虚假邮件诈骗',
                points: 15,
                speed: 1.0
            },
            {
                id: 'phishing2',
                type: 'phishing',
                text: '钓鱼网站',
                icon: '🕸️',
                description: '虚假网站',
                points: 18,
                speed: 1.1
            },

            // 社会工程学
            {
                id: 'socialeng1',
                type: 'socialeng',
                text: '社会工程学',
                icon: '🎭',
                description: '心理操控攻击',
                points: 22,
                speed: 0.8
            },
            {
                id: 'socialeng2',
                type: 'socialeng',
                text: '电话诈骗',
                icon: '📞',
                description: '电话社工攻击',
                points: 12,
                speed: 1.0
            },

            // 数据泄露
            {
                id: 'dataleak1',
                type: 'dataLeak',
                text: '数据泄露',
                icon: '💾',
                description: '敏感信息泄露',
                points: 35,
                speed: 0.7
            },
            {
                id: 'dataleak2',
                type: 'dataLeak',
                text: '隐私窃取',
                icon: '👁️',
                description: '个人隐私被窃',
                points: 28,
                speed: 0.9
            },

            // 高级威胁
            {
                id: 'apt1',
                type: 'malware',
                text: 'APT攻击',
                icon: '🎯',
                description: '高级持续威胁',
                points: 50,
                speed: 0.6
            },
            {
                id: 'zeroday1',
                type: 'malware',
                text: '零日漏洞',
                icon: '⚡',
                description: '未知安全漏洞',
                points: 45,
                speed: 1.4
            },

            // 移动威胁
            {
                id: 'mobile1',
                type: 'malware',
                text: '移动恶意软件',
                icon: '📱',
                description: '手机病毒',
                points: 16,
                speed: 1.1
            },

            // 网络钓鱼变种
            {
                id: 'spear1',
                type: 'phishing',
                text: '鱼叉钓鱼',
                icon: '🔱',
                description: '定向钓鱼攻击',
                points: 32,
                speed: 0.8
            },
            {
                id: 'whaling1',
                type: 'phishing',
                text: '捕鲸攻击',
                icon: '🐋',
                description: '高管定向攻击',
                points: 40,
                speed: 0.7
            },

            // 身份盗用
            {
                id: 'identity1',
                type: 'socialeng',
                text: '身份盗用',
                icon: '🆔',
                description: '身份信息被盗',
                points: 26,
                speed: 0.9
            },

            // 加密货币威胁
            {
                id: 'crypto1',
                type: 'malware',
                text: '挖矿木马',
                icon: '⛏️',
                description: '恶意挖矿程序',
                points: 20,
                speed: 1.0
            },

            // IoT威胁
            {
                id: 'iot1',
                type: 'malware',
                text: 'IoT僵尸网络',
                icon: '🤖',
                description: '物联网设备感染',
                points: 24,
                speed: 1.2
            },

            // 供应链攻击
            {
                id: 'supply1',
                type: 'malware',
                text: '供应链攻击',
                icon: '🔗',
                description: '软件供应链污染',
                points: 38,
                speed: 0.8
            }
        ];
    }

    // 根据游戏等级获取威胁
    getThreatsForLevel(level) {
        const baseThreats = this.threats.slice();
        
        // 根据等级调整威胁出现概率
        if (level >= 5) {
            // 高等级增加高价值威胁的概率
            const highValueThreats = this.threats.filter(t => t.points >= 30);
            baseThreats.push(...highValueThreats);
        }
        
        if (level >= 8) {
            // 更高等级再次增加最高价值威胁
            const premiumThreats = this.threats.filter(t => t.points >= 40);
            baseThreats.push(...premiumThreats);
        }
        
        return baseThreats;
    }

    // 随机获取一个威胁
    getRandomThreat(level = 1) {
        const availableThreats = this.getThreatsForLevel(level);
        const randomIndex = Math.floor(Math.random() * availableThreats.length);
        const threat = { ...availableThreats[randomIndex] };
        
        // 简化分数为3个档次：10分、20分、30分
        if (threat.points <= 15) {
            threat.points = 10;
        } else if (threat.points <= 25) {
            threat.points = 20;
        } else {
            threat.points = 30;
        }
        
        // 根据等级调整速度
        threat.speed *= (1 + (level - 1) * 0.1); // 每级增加10%速度
        
        return threat;
    }

    // 获取威胁的颜色
    getThreatColor(threatType) {
        return this.colors[threatType] || '#ffffff';
    }

    // 绘制威胁图案 - 圆形设计，优化性能，放大文字
    drawThreat(ctx, threat, x, y, size) {
        // 简化颜色分类：根据分数分为3种颜色
        let color;
        if (threat.points <= 15) {
            color = '#00ff00'; // 绿色 - 10分档
        } else if (threat.points <= 25) {
            color = '#ffaa00'; // 橙色 - 20分档
        } else {
            color = '#ff0040'; // 红色 - 30分档
        }
        
        // 绘制背景圆形
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 简单边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 绘制图标 - 放大图标
        ctx.fillStyle = '#ffffff';
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(threat.icon, x + size/2, y + size/2 - 15);
        
        // 放大文字显示
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        
        // 智能显示文字 - 短文字一行，长文字两行
        const text = threat.text;
        if (text.length <= 4) {
            ctx.strokeText(text, x + size/2, y + size/2 + 20);
            ctx.fillText(text, x + size/2, y + size/2 + 20);
        } else {
            const mid = Math.ceil(text.length / 2);
            const line1 = text.substring(0, mid);
            const line2 = text.substring(mid);
            ctx.strokeText(line1, x + size/2, y + size/2 + 15);
            ctx.fillText(line1, x + size/2, y + size/2 + 15);
            ctx.strokeText(line2, x + size/2, y + size/2 + 30);
            ctx.fillText(line2, x + size/2, y + size/2 + 30);
        }
        
        // 放大分数显示
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#ffff00';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeText(`+${threat.points}`, x + size/2, y + size - 10);
        ctx.fillText(`+${threat.points}`, x + size/2, y + size - 10);
    }

    // 获取威胁统计信息
    getThreatStats() {
        const stats = {};
        this.threats.forEach(threat => {
            if (!stats[threat.type]) {
                stats[threat.type] = {
                    count: 0,
                    totalPoints: 0,
                    avgPoints: 0
                };
            }
            stats[threat.type].count++;
            stats[threat.type].totalPoints += threat.points;
        });
        
        // 计算平均分数
        Object.keys(stats).forEach(type => {
            stats[type].avgPoints = Math.round(stats[type].totalPoints / stats[type].count);
        });
        
        return stats;
    }

    // 获取威胁类型的中文名称
    getThreatTypeName(type) {
        const names = {
            malware: '恶意软件',
            phishing: '钓鱼攻击',
            ransomware: '勒索软件',
            ddos: 'DDoS攻击',
            socialeng: '社会工程学',
            dataLeak: '数据泄露',
            virus: '计算机病毒',
            trojan: '木马程序'
        };
        return names[type] || type;
    }

    // 获取所有威胁类型用于分数面板显示
    getAllThreatTypes() {
        const typeMap = new Map();
        
        this.threats.forEach(threat => {
            if (!typeMap.has(threat.type)) {
                typeMap.set(threat.type, {
                    name: this.getThreatTypeName(threat.type),
                    color: this.getThreatColor(threat.type),
                    points: threat.points,
                    icon: threat.icon
                });
            } else {
                // 取该类型的平均分数
                const existing = typeMap.get(threat.type);
                existing.points = Math.round((existing.points + threat.points) / 2);
            }
        });
        
        return Array.from(typeMap.values()).sort((a, b) => a.points - b.points);
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CyberThreats;
} else {
    window.CyberThreats = CyberThreats;
}