export class ParticleSystem {
    constructor(count, width, height) {
        this.count = count;
        this.width = width;
        this.height = height;

        // Properties: x, y, z, vx, vy, vz, life
        this.positions = new Float32Array(count * 3);
        this.velocities = new Float32Array(count * 3);
        this.lives = new Float32Array(count); // 0-1 for alpha/size mod
        this.targetIndices = new Int32Array(count);

        // Init particles randomly
        for (let i = 0; i < count; i++) {
            this.positions[i * 3 + 0] = Math.random() * width;
            this.positions[i * 3 + 1] = Math.random() * height;
            this.positions[i * 3 + 2] = 0;
            this.lives[i] = Math.random();
            this.targetIndices[i] = -1; // No target initially
        }
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
    }

    update(targets, mode = 'attract', themeName = '') {
        const friction = 0.90;
        const attractStrength = 0.05;
        const simpleRepelStrength = 2.0;

        const numTargets = targets.length;

        for (let i = 0; i < this.count; i++) {
            const idx3 = i * 3;

            let target = null;
            if (numTargets > 0) {
                const tIdx = i % numTargets;
                target = targets[tIdx];
            }

            if (target && mode === 'attract') {
                // Attract Force
                const dx = target.x - this.positions[idx3 + 0];
                const dy = target.y - this.positions[idx3 + 1];

                this.velocities[idx3 + 0] += dx * attractStrength;
                this.velocities[idx3 + 1] += dy * attractStrength;

                const dz = target.z - this.positions[idx3 + 2];
                this.velocities[idx3 + 2] += dz * attractStrength;

            } else if (mode === 'repel') {
                if (target) {
                    const dx = this.positions[idx3 + 0] - target.x;
                    const dy = this.positions[idx3 + 1] - target.y;
                    const distSq = dx * dx + dy * dy + 0.1;
                    this.velocities[idx3 + 0] += (dx / distSq) * simpleRepelStrength;
                    this.velocities[idx3 + 1] += (dy / distSq) * simpleRepelStrength;
                } else {
                    this.velocities[idx3 + 0] += (Math.random() - 0.5) * 0.5;
                    this.velocities[idx3 + 1] += (Math.random() - 0.5) * 0.5;
                }
            }

            // Portal Physics Overlay
            if (themeName === 'Portal') {
                const x = this.positions[idx3 + 0];
                // Left: Matrix Gravity
                if (x < this.width / 2) {
                    this.velocities[idx3 + 1] += 0.5; // Gravity
                    // Reset if fall off screen? No, keeps flowing. 
                    // Maybe clamp X slightly so they don't cross over easily without force?
                    // Actually, letting them cross is the fun part.
                    if (this.positions[idx3 + 1] > this.height) {
                        this.positions[idx3 + 1] = 0;
                        this.positions[idx3 + 0] = Math.random() * (this.width / 2);
                    }
                }
                // Right: Cosmic Float
                else {
                    this.velocities[idx3 + 0] += Math.sin(i + this.positions[idx3 + 1] * 0.01) * 0.05;
                    this.velocities[idx3 + 1] -= 0.1; // Slow rise
                    if (this.positions[idx3 + 1] < 0) {
                        this.positions[idx3 + 1] = this.height;
                        this.positions[idx3 + 0] = (this.width / 2) + Math.random() * (this.width / 2);
                    }
                }
            }

            // Physics integration
            this.positions[idx3 + 0] += this.velocities[idx3 + 0];
            this.positions[idx3 + 1] += this.velocities[idx3 + 1];
            this.positions[idx3 + 2] += this.velocities[idx3 + 2];

            this.velocities[idx3 + 0] *= friction;
            this.velocities[idx3 + 1] *= friction;
            this.velocities[idx3 + 2] *= friction;
        }
    }

    draw(ctx, themeManager) {
        const pixelSize = 1.5;
        const themeName = themeManager.currentTheme;

        // Portal Line
        if (themeName === 'Portal') {
            ctx.beginPath();
            ctx.moveTo(this.width / 2, 0);
            ctx.lineTo(this.width / 2, this.height);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#fff';
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        for (let i = 0; i < this.count; i++) {
            const idx3 = i * 3;
            const x = this.positions[idx3 + 0];
            const y = this.positions[idx3 + 1];
            const z = this.positions[idx3 + 2];

            if (x < 0 || x > this.width || y < 0 || y > this.height) continue;

            const nx = x / this.width;
            const ny = y / this.height;

            const sizeMod = Math.max(0.5, 2.0 + z * 0.01);

            ctx.fillStyle = themeManager.getColor(i, this.count, nx, ny, 1.0);

            if (themeName === 'Portal' && x > this.width / 2) {
                // Right Side: Circles
                ctx.beginPath();
                ctx.arc(x, y, (pixelSize * sizeMod) / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Default: Rects (Matrix uses rects too)
                ctx.fillRect(x, y, pixelSize * sizeMod, pixelSize * sizeMod);
            }
        }
    }
}
