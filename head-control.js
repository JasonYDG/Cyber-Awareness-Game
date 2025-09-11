// 头部控制系统 - 专为CyberCatch游戏优化
class HeadControl {
    constructor(gameEngine, onCalibrationComplete, onFaceStatusChange) {
        this.gameEngine = gameEngine;
        this.onCalibrationComplete = onCalibrationComplete;
        this.onFaceStatusChange = onFaceStatusChange;
        
        this.faceMesh = null;
        this.camera = null;
        this.isActive = false;
        this.isFaceDetected = false;
        this.lastFaceDetectionStatus = false;

        // 控制参数 - 进一步提高灵敏度
        this.headTiltThreshold = 0.06; // 进一步降低阈值，提高灵敏度
        this.actionCooldown = 30; // 进一步减少冷却时间，从50ms减少到30ms
        this.lastActionTime = 0;

        // 移动状态跟踪
        this.currentTiltState = 'center';
        this.lastTiltState = 'center';
        this.continuousMoveStartTime = 0;
        this.continuousMoveThreshold = 100; // 进一步减少连续移动阈值，从150ms减少到100ms
        this.continuousMoveInterval = 25; // 进一步减少连续移动间隔，从40ms减少到25ms
        this.lastContinuousMoveTime = 0;
        this.isInContinuousMode = false;

        // 基准位置校准
        this.baselineNose = null;
        this.calibrationFrames = 0;
        this.maxCalibrationFrames = 30;
        this.calibrationCompleted = false;

        // 人脸检测稳定性
        this.faceDetectionFailureCount = 0;
        this.maxFailureCount = 30;
        this.lastSuccessfulDetection = Date.now();

        // 调试和状态显示
        this.frameCounter = 0;
        this.showDetailedStatus = true;

        this.initMediaPipe();
    }

    async initMediaPipe() {
        try {
            // 检查MediaPipe是否可用
            if (!window.MediaPipeAvailable || typeof FaceMesh === 'undefined') {
                console.log('MediaPipe not available, head control disabled');
                return;
            }

            this.faceMesh = new FaceMesh({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                }
            });

            this.faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: false,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
                selfieMode: true,
                staticImageMode: false,
                modelComplexity: 0
            });

            this.faceMesh.onResults(this.onResults.bind(this));
            console.log('MediaPipe Face Mesh initialized successfully');
        } catch (error) {
            console.error('MediaPipe initialization failed:', error);
            console.log('Falling back to keyboard/touch controls');
        }
    }

    async startCamera() {
        try {
            // 检查MediaPipe和Camera是否可用
            if (!window.MediaPipeAvailable || !this.faceMesh || typeof Camera === 'undefined') {
                throw new Error('MediaPipe或Camera不可用');
            }

            const video = document.getElementById('input_video');
            const canvas = document.getElementById('output_canvas');

            this.resetCalibration();

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    frameRate: { ideal: 30, max: 30 }
                }
            });

            video.srcObject = stream;
            video.autoplay = true;
            video.playsInline = true;
            video.muted = true;

            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    video.play().then(resolve);
                };
            });

            this.camera = new Camera(video, {
                onFrame: async () => {
                    try {
                        if (this.faceMesh && video.readyState === 4 && !video.paused && !video.ended) {
                            await this.faceMesh.send({ image: video });
                        }
                    } catch (error) {
                        console.error('Frame processing error:', error);
                    }
                },
                width: 640,
                height: 480
            });

            await this.camera.start();
            this.isActive = true;
            console.log('Camera started successfully');

            // 显示初始状态
            this.showInitialStatus(canvas);

        } catch (error) {
            console.error('Camera startup failed:', error);
            let errorMessage = '无法访问摄像头或MediaPipe不可用';

            if (error.name === 'NotAllowedError') {
                errorMessage = '摄像头权限被拒绝，请检查浏览器设置';
            } else if (error.name === 'NotReadableError') {
                errorMessage = '摄像头正被其他应用使用';
            }

            this.showError(errorMessage);
            throw error;
        }
    }

    onResults(results) {
        try {
            const canvas = document.getElementById('output_canvas');
            const ctx = canvas.getContext('2d');

            // 清空画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 绘制视频帧
            if (results.image) {
                try {
                    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
                } catch (webglError) {
                    console.warn('WebGL drawing error:', webglError);
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            }

            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                // 人脸检测成功
                this.faceDetectionFailureCount = 0;
                this.lastSuccessfulDetection = Date.now();
                this.isFaceDetected = true;
                const landmarks = results.multiFaceLandmarks[0];

                // 绘制人脸关键点
                this.drawLandmarks(ctx, landmarks);

                // 校准基准位置
                if (this.calibrationFrames < this.maxCalibrationFrames) {
                    this.calibrateBaseline(landmarks);
                    this.calibrationFrames++;
                    this.drawCalibrationProgress(ctx);
                    return;
                }

                // 校准完成后开始检测头部动作
                if (!this.calibrationCompleted) {
                    this.calibrationCompleted = true;
                    if (this.onCalibrationComplete) {
                        this.onCalibrationComplete();
                    }
                }

                // 检测头部移动
                this.detectHeadMovements(landmarks);

                // 显示控制状态
                this.drawControlStatus(ctx, landmarks);

            } else {
                // 未检测到人脸
                this.faceDetectionFailureCount++;

                if (this.faceDetectionFailureCount >= this.maxFailureCount) {
                    this.isFaceDetected = false;
                    this.showNoFaceMessage(ctx);
                }
            }

            // 检查人脸检测状态变化
            if (this.isFaceDetected !== this.lastFaceDetectionStatus) {
                this.lastFaceDetectionStatus = this.isFaceDetected;
                if (this.onFaceStatusChange) {
                    this.onFaceStatusChange(this.isFaceDetected);
                }
            }

        } catch (error) {
            console.error('onResults processing error:', error);
            this.faceDetectionFailureCount++;
        }
    }

    calibrateBaseline(landmarks) {
        try {
            const nose = landmarks[1];
            if (!nose) return;

            if (!this.baselineNose) {
                this.baselineNose = { x: 0, y: 0, z: 0 };
            }

            this.baselineNose.x += nose.x;
            this.baselineNose.y += nose.y;
            this.baselineNose.z += nose.z;

            if (this.calibrationFrames === this.maxCalibrationFrames - 1) {
                this.baselineNose.x /= this.maxCalibrationFrames;
                this.baselineNose.y /= this.maxCalibrationFrames;
                this.baselineNose.z /= this.maxCalibrationFrames;
                console.log('Head control calibration complete!');
            }
        } catch (error) {
            console.error('Calibration error:', error);
        }
    }

    detectHeadMovements(landmarks) {
        if (!this.baselineNose || !this.calibrationCompleted) return;

        const now = Date.now();
        if (now - this.lastActionTime < this.actionCooldown) return;

        try {
            const tiltX = this.calculateHeadTilt(landmarks);
            let action = '';

            // 更新当前倾斜状态
            if (tiltX > this.headTiltThreshold) {
                this.currentTiltState = 'right';
            } else if (tiltX < -this.headTiltThreshold) {
                this.currentTiltState = 'left';
            } else {
                this.currentTiltState = 'center';
            }

            // 检测左右倾斜
            if (this.currentTiltState !== 'center') {
                if (this.lastTiltState === 'center') {
                    // 刚开始倾斜
                    action = this.currentTiltState;
                    this.continuousMoveStartTime = now;
                    this.isInContinuousMode = false;
                } else if (this.currentTiltState === this.lastTiltState) {
                    // 持续倾斜
                    const holdTime = now - this.continuousMoveStartTime;
                    
                    if (holdTime >= this.continuousMoveThreshold && !this.isInContinuousMode) {
                        this.isInContinuousMode = true;
                        this.lastContinuousMoveTime = now;
                        action = this.currentTiltState;
                    } else if (this.isInContinuousMode && 
                               now - this.lastContinuousMoveTime >= this.continuousMoveInterval) {
                        action = this.currentTiltState;
                        this.lastContinuousMoveTime = now;
                    }
                }
            } else {
                // 回到中心位置
                this.continuousMoveStartTime = 0;
                this.isInContinuousMode = false;
            }

            this.lastTiltState = this.currentTiltState;

            // 执行动作
            if (action) {
                this.executeAction(action);
                
                // 只对非连续动作应用冷却时间
                if (!this.isInContinuousMode) {
                    this.lastActionTime = now;
                }
            }

        } catch (error) {
            console.error('Head movement detection error:', error);
        }
    }

    calculateHeadTilt(landmarks) {
        try {
            // 使用眼角计算头部倾斜
            const leftEye = landmarks[33];  // 左眼外角
            const rightEye = landmarks[263]; // 右眼外角
            
            if (!leftEye || !rightEye) return 0;
            
            const eyeLineAngle = Math.atan2(
                rightEye.y - leftEye.y,
                rightEye.x - leftEye.x
            );
            
            return eyeLineAngle;
        } catch (error) {
            console.error('Head tilt calculation error:', error);
            return 0;
        }
    }

    executeAction(action) {
        if (!this.gameEngine) return;

        try {
            switch (action) {
                case 'left':
                    this.gameEngine.movePaddle(-1);
                    break;
                case 'right':
                    this.gameEngine.movePaddle(1);
                    break;
            }
        } catch (error) {
            console.error('Action execution error:', error);
        }
    }

    drawLandmarks(ctx, landmarks) {
        // 绘制关键面部特征点
        ctx.fillStyle = '#00ffff';
        
        // 眼睛
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        if (leftEye && rightEye) {
            ctx.beginPath();
            ctx.arc(leftEye.x * ctx.canvas.width, leftEye.y * ctx.canvas.height, 3, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(rightEye.x * ctx.canvas.width, rightEye.y * ctx.canvas.height, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // 鼻子
        const nose = landmarks[1];
        if (nose) {
            ctx.fillStyle = '#ff0040';
            ctx.beginPath();
            ctx.arc(nose.x * ctx.canvas.width, nose.y * ctx.canvas.height, 4, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    drawCalibrationProgress(ctx) {
        const progress = this.calibrationFrames / this.maxCalibrationFrames;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;
        
        ctx.fillText('校准中...', centerX, centerY - 40);
        ctx.fillText(`${Math.round(progress * 100)}%`, centerX, centerY);
        
        // 进度条
        const barWidth = 200;
        const barHeight = 10;
        const barX = centerX - barWidth / 2;
        const barY = centerY + 30;
        
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        ctx.fillStyle = '#ff0040';
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    }

    drawControlStatus(ctx, landmarks) {
        if (!this.showDetailedStatus) return;

        const tiltX = this.calculateHeadTilt(landmarks);
        
        // 状态显示区域
        const statusX = 10;
        const statusY = 10;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(statusX, statusY, 200, 100);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        let lineY = statusY + 10;
        const lineHeight = 15;
        
        ctx.fillText(`倾斜: ${tiltX.toFixed(3)}`, statusX + 5, lineY);
        lineY += lineHeight;
        
        ctx.fillText(`状态: ${this.currentTiltState}`, statusX + 5, lineY);
        lineY += lineHeight;
        
        ctx.fillText(`连续模式: ${this.isInContinuousMode ? '是' : '否'}`, statusX + 5, lineY);
        lineY += lineHeight;
        
        // 倾斜指示器
        const indicatorY = lineY + 10;
        const indicatorCenterX = statusX + 100;
        
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(statusX + 20, indicatorY);
        ctx.lineTo(statusX + 180, indicatorY);
        ctx.stroke();
        
        // 当前位置指示
        const indicatorX = indicatorCenterX + (tiltX * 300);
        ctx.fillStyle = this.currentTiltState === 'center' ? '#00ff00' : '#ff0040';
        ctx.beginPath();
        ctx.arc(Math.max(statusX + 20, Math.min(statusX + 180, indicatorX)), indicatorY, 4, 0, 2 * Math.PI);
        ctx.fill();
    }

    showInitialStatus(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillText('摄像头已启动', canvas.width / 2, canvas.height / 2 - 15);
        ctx.fillText('等待人脸检测...', canvas.width / 2, canvas.height / 2 + 15);
    }

    showNoFaceMessage(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.fillStyle = '#ff0040';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillText('请面向摄像头', ctx.canvas.width / 2, ctx.canvas.height / 2 - 10);
        ctx.font = '12px Arial';
        ctx.fillText('调整光线或位置', ctx.canvas.width / 2, ctx.canvas.height / 2 + 15);
    }

    showError(message) {
        const canvas = document.getElementById('output_canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(255, 0, 64, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillText('错误', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '12px Arial';
        ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 10);
    }

    resetCalibration() {
        this.calibrationFrames = 0;
        this.baselineNose = null;
        this.calibrationCompleted = false;
        this.currentTiltState = 'center';
        this.lastTiltState = 'center';
        this.continuousMoveStartTime = 0;
        this.isInContinuousMode = false;
        this.lastActionTime = 0;
        this.isFaceDetected = false;
        this.lastFaceDetectionStatus = false;
        this.faceDetectionFailureCount = 0;
        this.lastSuccessfulDetection = Date.now();
        this.frameCounter = 0;
    }

    stop() {
        if (this.camera) {
            this.camera.stop();
        }
        this.isActive = false;
        console.log('Head control stopped');
    }

    // 获取设备信息
    getDeviceInfo() {
        return {
            isActive: this.isActive,
            isFaceDetected: this.isFaceDetected,
            calibrationCompleted: this.calibrationCompleted,
            currentTiltState: this.currentTiltState,
            isInContinuousMode: this.isInContinuousMode
        };
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeadControl;
} else {
    window.HeadControl = HeadControl;
}