# 🛡️ CyberCatch - 网络安全防护游戏

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![PWA](https://img.shields.io/badge/PWA-Ready-blue.svg)](https://web.dev/progressive-web-apps/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Face%20Mesh-green.svg)](https://mediapipe.dev/)

一个创新的网络安全教育游戏，通过AI头部动作识别技术，让用户在游戏中学习网络安全知识。支持在线和离线两种模式，具备完整的隐私保护机制。

## 📸 游戏截图

![游戏主界面](https://via.placeholder.com/800x400/0066cc/ffffff?text=CyberCatch+Game+Interface)

## ✨ 主要特性

- 🎯 **AI头部控制** - 使用MediaPipe技术进行实时人脸检测和动作识别
- 🛡️ **网络安全教育** - 20+种真实网络威胁类型，寓教于乐
- 📱 **多平台支持** - 桌面端、移动端完美适配
- 🔒 **隐私保护** - 所有数据本地处理，4小时自动删除机制
- 🌐 **离线支持** - 内置MediaPipe文件，支持完全离线运行
- 🎵 **沉浸式体验** - 动态音效和网络安全主题音乐
- 🏆 **排行榜系统** - 本地排行榜，记录最佳成绩

## 🎮 游戏特色

### 🛡️ 网络安全主题
- **20+种网络威胁**：恶意软件、钓鱼攻击、勒索软件、DDoS攻击等
- **教育意义**：在游戏中学习识别各种网络安全威胁
- **分级难度**：随着等级提升，威胁种类和速度逐渐增加

### 🎯 头部控制系统
- **左右倾斜头部** → 控制挡板左右移动
- **实时人脸检测** → 使用MediaPipe技术
- **智能校准** → 自动适应用户的基准姿态
- **连续移动** → 支持持续倾斜进行连续移动

### 📸 隐私保护照片系统
- **游戏结束展示** → 显示玩家头像和最终分数
- **4小时自动删除** → 严格的隐私保护机制
- **本地存储** → 照片不会上传到服务器
- **加密存储** → 本地照片经过简单加密处理

### ⏱️ 游戏机制
- **3分钟限时** → 快节奏的游戏体验
- **动态难度** → 根据时间和分数自动调整
- **分数系统** → 不同威胁有不同分值
- **统计追踪** → 记录成功拦截和错过的威胁数量

## 🚀 技术特点

### 🤖 AI人脸识别
- **MediaPipe Face Mesh** → 468个面部关键点检测
- **实时处理** → 30fps流畅识别
- **低延迟** → 优化的动作检测算法
- **稳定性** → 智能的人脸丢失处理

### 🎵 音频系统
- **Web Audio API** → 实时生成音效
- **网络安全主题音乐** → 电子风格背景音乐
- **动态音效** → 根据游戏事件播放不同音效
- **音量控制** → 独立的BGM和音效控制

### 📱 多平台支持
- **桌面端** → 头部控制 + 键盘备用
- **移动端** → 触摸控制 + 滑动手势
- **PWA支持** → 可安装为应用
- **响应式设计** → 适配各种屏幕尺寸

### 🔒 隐私保护
- **本地处理** → 所有图像处理在本地进行
- **定时删除** → 照片4小时后自动删除
- **用户控制** → 可手动删除照片
- **透明提示** → 清晰的隐私保护说明

## 🎯 游戏玩法

### 基本操作
1. **启动游戏** → 同意隐私声明并启动摄像头
2. **校准系统** → 保持正常姿态进行30帧校准
3. **开始游戏** → 点击开始按钮进入游戏
4. **控制挡板** → 左右倾斜头部移动挡板
5. **接住威胁** → 用挡板接住掉落的网络威胁图案

### 控制方式
- **头部控制**（主要）：
  - 👈 向左倾斜 → 挡板左移
  - 👉 向右倾斜 → 挡板右移
  
- **键盘控制**（备用）：
  - ← / A → 左移
  - → / D → 右移
  - 空格 / P → 暂停
  
- **触摸控制**（移动端）：
  - 滑动屏幕 → 移动挡板
  - 虚拟按钮 → 精确控制

### 威胁类型
- **恶意软件类**：病毒、木马、勒索软件（10-25分）
- **网络攻击类**：DDoS、钓鱼邮件、钓鱼网站（15-30分）
- **社会工程学**：心理操控、电话诈骗（12-22分）
- **数据泄露类**：隐私窃取、敏感信息泄露（28-35分）
- **高级威胁**：APT攻击、零日漏洞（40-50分）

## 🛠️ 技术架构

### 📁 项目结构
```
cybercatch/
├── index.html              # 在线版本主页面
├── index_offline.html      # 离线版本主页面
├── cache/                  # MediaPipe离线文件
│   ├── camera_utils.js
│   ├── control_utils.js
│   ├── drawing_utils.js
│   └── face_mesh.js
├── game-engine.js          # 游戏引擎核心
├── head-control.js         # AI头部控制系统
├── cyber-threats.js        # 网络威胁数据库
├── photo-manager.js        # 隐私保护照片系统
├── leaderboard.js          # 排行榜管理
├── audio-system.js         # 音频系统
├── mobile-touch.js         # 移动端控制
├── main.js                 # 主控制器
├── style.css               # 样式文件
├── manifest.json           # PWA配置
└── sw.js                   # Service Worker
```

### 🔧 核心技术
- **前端框架**: 原生JavaScript ES6+
- **AI技术**: MediaPipe Face Mesh (468个面部关键点)
- **图形渲染**: Canvas 2D API
- **音频处理**: Web Audio API
- **摄像头访问**: WebRTC getUserMedia API
- **本地存储**: localStorage + IndexedDB
- **PWA支持**: Service Worker + Web App Manifest

### 🌐 浏览器兼容性
| 浏览器 | 头部控制 | 键盘控制 | 触摸控制 | PWA |
|--------|----------|----------|----------|-----|
| Chrome 88+ | ✅ | ✅ | ✅ | ✅ |
| Firefox 85+ | ✅ | ✅ | ✅ | ✅ |
| Safari 14+ | ⚠️ | ✅ | ✅ | ⚠️ |
| Edge 88+ | ✅ | ✅ | ✅ | ✅ |
| Mobile Chrome | ❌ | ❌ | ✅ | ✅ |
| Mobile Safari | ❌ | ❌ | ✅ | ⚠️ |

> ⚠️ 部分支持 | ❌ 不支持 | ✅ 完全支持

## 🚀 快速开始

### 在线版本（推荐）
```bash
# 1. 克隆项目
git clone https://github.com/your-username/cybercatch.git
cd cybercatch

# 2. 启动HTTP服务器
python -m http.server 8000
# 或者使用Node.js
npx http-server

# 3. 访问游戏
# 打开浏览器访问 http://localhost:8000
```

### 离线版本
```bash
# 1. 使用离线版本
cp index_offline.html index.html

# 2. 启动服务器（MediaPipe文件已内置在cache文件夹）
python -m http.server 8000

# 3. 访问游戏
# 打开浏览器访问 http://localhost:8000
```

### 系统要求
- **浏览器**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **摄像头**: 支持WebRTC的摄像头（头部控制功能）
- **网络**: 在线版需要网络连接下载MediaPipe库
- **HTTPS**: 生产环境需要HTTPS协议（摄像头权限要求）

### 部署到生产环境
```bash
# 1. 确保使用HTTPS
# 2. 配置正确的MIME类型
# 3. 启用Service Worker缓存
# 4. 配置CSP头部（如需要）
```

## 🔧 配置选项

### 头部控制灵敏度
在 `head-control.js` 中调整：
```javascript
this.headTiltThreshold = 0.12; // 头部倾斜阈值
this.actionCooldown = 100;     // 动作冷却时间
this.continuousMoveThreshold = 300; // 连续移动阈值
```

### 游戏难度
在 `game-engine.js` 中调整：
```javascript
this.threatSpawnRate = 1000;   // 威胁生成间隔
this.threatSpeed = 2;          // 威胁下降速度
```

### 照片保存时间
在 `photo-manager.js` 中调整：
```javascript
this.photoExpiryHours = 4;     // 照片保存时间（小时）
```

## 🔒 隐私保护声明

### 数据处理
- ✅ 所有图像处理均在本地浏览器中进行
- ✅ 不会上传任何照片或视频到服务器
- ✅ 不会收集或存储个人身份信息
- ✅ 摄像头数据仅用于游戏控制

### 照片管理
- 📸 游戏结束时可选择捕获头像照片
- ⏰ 照片将在4小时后自动删除
- 🗑️ 用户可随时手动删除照片
- 🔒 照片经过简单加密存储在本地

### 权限使用
- 📹 摄像头权限：仅用于头部动作检测
- 🔊 麦克风权限：不需要，游戏不使用音频输入
- 💾 本地存储：仅存储游戏设置和临时照片

## 🎓 教育价值

### 网络安全知识
- **威胁识别** → 学习识别各种网络安全威胁
- **防护意识** → 提高网络安全防护意识
- **实时反应** → 训练对安全威胁的快速反应能力

### 技术学习
- **AI应用** → 了解人脸识别技术应用
- **Web技术** → 体验现代Web技术能力
- **隐私保护** → 学习隐私保护的重要性

## 🐛 故障排除

### 摄像头无法启动
- 确保浏览器有摄像头权限
- 检查摄像头是否被其他应用占用
- 尝试刷新页面重新获取权限
- 使用HTTPS协议访问（生产环境必需）

### MediaPipe加载失败
- 检查网络连接（在线版本）
- 使用离线版本：`cp index_offline.html index.html`
- 确保cache文件夹中有完整的MediaPipe文件

### 游戏性能问题
- 降低浏览器缩放比例到100%
- 关闭其他占用摄像头的应用
- 使用Chrome浏览器获得最佳性能

### 移动端问题
- 确保使用触摸控制模式
- 检查屏幕方向锁定设置
- 某些移动浏览器不支持摄像头功能

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献
1. **Fork** 本项目
2. **创建** 功能分支 (`git checkout -b feature/AmazingFeature`)
3. **提交** 更改 (`git commit -m 'Add some AmazingFeature'`)
4. **推送** 到分支 (`git push origin feature/AmazingFeature`)
5. **创建** Pull Request

### 贡献类型
- 🐛 Bug修复
- ✨ 新功能开发
- 📚 文档改进
- 🎨 UI/UX优化
- 🔧 性能优化
- 🌐 国际化支持

### 开发环境设置
```bash
# 1. Fork并克隆项目
git clone https://github.com/your-username/cybercatch.git

# 2. 创建开发分支
git checkout -b feature/your-feature

# 3. 启动开发服务器
python -m http.server 8000

# 4. 开始开发...
```

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE) - 详见 LICENSE 文件了解更多信息。

## 🙏 致谢

- **[MediaPipe](https://mediapipe.dev/)** - 提供强大的AI人脸检测技术
- **[Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)** - 现代Web技术支持
- **网络安全社区** - 提供威胁情报和安全知识
- **开源社区** - 持续的技术支持和反馈

## 📞 联系我们

- **项目主页**: [GitHub Repository](https://github.com/your-username/cybercatch)
- **问题报告**: [Issues](https://github.com/your-username/cybercatch/issues)
- **功能请求**: [Feature Requests](https://github.com/your-username/cybercatch/issues/new?template=feature_request.md)

## 🔐 安全声明

本项目严格遵循隐私保护原则：
- ✅ 所有数据本地处理，不上传到服务器
- ✅ 摄像头数据仅用于游戏控制，不做其他用途
- ✅ 用户照片4小时后自动删除
- ✅ 开源代码，接受社区审查

---

**⚠️ 重要提示**: 本游戏需要摄像头权限才能使用头部控制功能。如果您不希望使用摄像头，可以使用键盘或触摸控制进行游戏。所有摄像头数据均在本地处理，不会上传到任何服务器。