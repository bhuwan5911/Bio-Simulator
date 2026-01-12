import { Holistic, FACEMESH_TESSELATION, FACEMESH_RIGHT_EYE, FACEMESH_LEFT_EYE, FACEMESH_LIPS, FACEMESH_FACE_OVAL, HAND_CONNECTIONS } from '@mediapipe/holistic';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

export class MediaPipeManager {
    constructor(videoElement, debugCanvas, callbacks) {
        this.video = videoElement;
        this.debugCtx = debugCanvas.getContext('2d');
        this.callbacks = callbacks;
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.holistic = null;
        this.camera = null;
        this.fistCooldown = 0;

        // Tracking separate hand targets to merge later
        this.handTargets = [];
        this.faceTargets = [];
    }

    async init() {
        this.callbacks.onStatus('Loading Model...');

        // Initialize Holistic
        this.holistic = new Holistic({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
            }
        });

        this.holistic.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableFaceGeometry: false,
            refineFaceLandmarks: true, // For iris/refined eyes
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.holistic.onResults(this.onResults.bind(this));

        // Initialize Camera
        this.camera = new Camera(this.video, {
            onFrame: async () => {
                // Draw video frame
                this.debugCtx.save();
                this.debugCtx.scale(-1, 1);
                this.debugCtx.translate(-256, 0);
                this.debugCtx.drawImage(this.video, 0, 0, 256, 144);
                this.debugCtx.restore();

                await this.holistic.send({ image: this.video });
            },
            width: 1280,
            height: 720
        });

        this.callbacks.onStatus('Starting Camera...');
        await this.camera.start();
        this.callbacks.onStatus('Show your hands/face');
    }

    onResults(results) {
        this.drawDebug(results);

        // Process Hands
        // Holistic gives rightHandLandmarks and leftHandLandmarks
        this.handTargets = [];

        if (results.leftHandLandmarks) {
            this.processHand(results.leftHandLandmarks);
            this.detectFist(results.leftHandLandmarks);
        }
        if (results.rightHandLandmarks) {
            this.processHand(results.rightHandLandmarks);
            this.detectFist(results.rightHandLandmarks);
        }

        // Process Face
        this.faceTargets = [];
        if (results.faceLandmarks) {
            this.processFace(results.faceLandmarks);
        }

        this.updateCombinedTargets();
    }

    processHand(landmarks) {
        const connections = HAND_CONNECTIONS;
        const mappedHelper = (pt) => ({
            x: (1 - pt.x) * this.width,
            y: pt.y * this.height,
            z: pt.z * (this.width / 2)
        });

        for (const [startIdx, endIdx] of connections) {
            const start = mappedHelper(landmarks[startIdx]);
            const end = mappedHelper(landmarks[endIdx]);

            const density = 20;
            for (let j = 0; j < density; j++) {
                const t = j / density;
                const bx = start.x + (end.x - start.x) * t;
                const by = start.y + (end.y - start.y) * t;
                const bz = start.z + (end.z - start.z) * t;

                let spread = 5;
                if ([0, 1, 5, 9, 13, 17].includes(startIdx)) spread = 20;
                if ([4, 8, 12, 16, 20].includes(endIdx)) spread = 2;

                const angle = Math.random() * Math.PI * 2;
                const r = Math.random() * spread;

                this.handTargets.push({
                    x: bx + Math.cos(angle) * r,
                    y: by + Math.sin(angle) * r,
                    z: bz
                });
            }
        }
    }

    processFace(landmarks) {
        // 468 landmarks
        // We only take a subset or all? 468 * 10 particles = 4680, which is fine.

        for (let i = 0; i < landmarks.length; i++) {
            // Skip some to save particles? Or use all.
            // Let's use all for high detail -> 468 * 10 per landmark is ~5000.

            const pt = landmarks[i];
            const x = (1 - pt.x) * this.width;
            const y = pt.y * this.height;
            let z = pt.z * (this.width);
            z *= 2.0;

            // 1-2px tight cluster. Reduce count per landmark if total is high.
            // If we have 15k limit, Face (5000) + 2 Hands (2 * 21 * 20 = 840) = 6000. Very safe.

            const clusterCount = 10;
            for (let k = 0; k < clusterCount; k++) {
                const r = Math.random() * 2;
                const a = Math.random() * Math.PI * 2;
                this.faceTargets.push({
                    x: x + Math.cos(a) * r,
                    y: y + Math.sin(a) * r,
                    z: z
                });
            }
        }
    }

    updateCombinedTargets() {
        const all = [...this.handTargets, ...this.faceTargets];
        this.callbacks.onTargets(all);
    }

    detectFist(landmarks) {
        if (this.fistCooldown > 0) {
            this.fistCooldown--;
            return;
        }

        const wrist = landmarks[0];
        const tip8 = landmarks[8];
        const dist = Math.hypot(wrist.x - tip8.x, wrist.y - tip8.y);

        if (dist < 0.15) {
            this.callbacks.onGestures('fist');
            this.fistCooldown = 30;
        }
    }

    drawDebug(results) {
        // Holistic results structure: { faceLandmarks, leftHandLandmarks, rightHandLandmarks, ... }

        if (results.leftHandLandmarks) {
            drawConnectors(this.debugCtx, results.leftHandLandmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 1 });
            drawLandmarks(this.debugCtx, results.leftHandLandmarks, { color: '#FF0000', lineWidth: 0.5, radius: 1 });
        }
        if (results.rightHandLandmarks) {
            drawConnectors(this.debugCtx, results.rightHandLandmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 1 });
            drawLandmarks(this.debugCtx, results.rightHandLandmarks, { color: '#FF0000', lineWidth: 0.5, radius: 1 });
        }

        if (results.faceLandmarks) {
            drawConnectors(this.debugCtx, results.faceLandmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 0.5 });
            drawConnectors(this.debugCtx, results.faceLandmarks, FACEMESH_RIGHT_EYE, { color: '#00FFFF' });
            drawConnectors(this.debugCtx, results.faceLandmarks, FACEMESH_LEFT_EYE, { color: '#00FFFF' });
            drawConnectors(this.debugCtx, results.faceLandmarks, FACEMESH_LIPS, { color: '#FF00FF' });
            drawConnectors(this.debugCtx, results.faceLandmarks, FACEMESH_FACE_OVAL, { color: '#00FFFF' });
        }
    }
}
