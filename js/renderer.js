// js/renderer.js
// Canvas 60 FPS Graphics Engine: High-Contrast Procedural Indie Art, Characters, Juice, and Particles

(function(window) {
    'use strict';

    class Renderer {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');

            // Grid rendering metrics
            this.cellSize = 48;
            this.offsetX = 0;
            this.offsetY = 0;
            this.viewWidth = 0;
            this.viewHeight = 0;

            // Interpolation & animation states
            this.playerRender = { x: 0, y: 0, facing: 'DOWN', bumpTimer: 0, bumpDx: 0, bumpDy: 0 };
            this.exitRender = { x: 0, y: 0, wobble: 0, scamperPhase: 0, panicShake: 0 };
            this.lerpSpeed = 0.32; // Fast, responsive glide

            // Particle systems
            this.particles = [];
            this.ambientParticles = [];
            this.initAmbientParticles();

            // Speech bubble
            this.speechBubble = null; // { text, timer, maxTime, type }

            // Wall glow pulse
            this.glowTime = 0;
        }

        initAmbientParticles() {
            this.ambientParticles = [];
            for (let i = 0; i < 35; i++) {
                this.ambientParticles.push({
                    x: Math.random(),
                    y: Math.random(),
                    size: Math.random() * 2 + 1,
                    speed: Math.random() * 0.0003 + 0.0001,
                    alpha: Math.random() * 0.4 + 0.2,
                    color: Math.random() > 0.5 ? '#00f0ff' : '#d946ef'
                });
            }
        }

        resize() {
            const dpr = window.devicePixelRatio || 1;
            const container = this.canvas.parentElement;
            let width = container ? Math.floor(container.clientWidth) : 0;
            let height = container ? Math.floor(container.clientHeight) : 0;

            // Robust fallback if container is still measuring or hidden
            if (width <= 0) width = Math.min(840, Math.max(320, window.innerWidth - 32));
            if (height <= 0) height = Math.min(640, Math.max(320, window.innerHeight - 180));

            this.canvas.width = Math.floor(width * dpr);
            this.canvas.height = Math.floor(height * dpr);
            this.canvas.style.width = width + 'px';
            this.canvas.style.height = height + 'px';

            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            this.viewWidth = width;
            this.viewHeight = height;
        }

        calculateLayout(gridWidth, gridHeight) {
            if (this.viewWidth <= 0 || this.viewHeight <= 0) {
                this.resize();
            }

            const padding = 28;
            const availW = Math.max(100, this.viewWidth - padding * 2);
            const availH = Math.max(100, this.viewHeight - padding * 2);

            const sizeByW = Math.floor(availW / gridWidth);
            const sizeByH = Math.floor(availH / gridHeight);
            this.cellSize = Math.max(36, Math.min(76, Math.min(sizeByW, sizeByH)));

            const totalGridW = gridWidth * this.cellSize;
            const totalGridH = gridHeight * this.cellSize;

            this.offsetX = Math.floor((this.viewWidth - totalGridW) / 2);
            this.offsetY = Math.floor((this.viewHeight - totalGridH) / 2);
        }

        syncPositions(player, exit, immediate = false) {
            if (immediate) {
                this.playerRender.x = player.x;
                this.playerRender.y = player.y;
                this.exitRender.x = exit.x;
                this.exitRender.y = exit.y;
            }
        }

        triggerPlayerBump(dx, dy) {
            this.playerRender.bumpTimer = 1.0;
            this.playerRender.bumpDx = dx * 0.28;
            this.playerRender.bumpDy = dy * 0.28;
            this.spawnDust(this.playerRender.x, this.playerRender.y, 6, '#ff0055');
        }

        showSpeech(text, type = 'flee', duration = 1800) {
            this.speechBubble = {
                text,
                type,
                timer: duration,
                maxTime: duration
            };
        }

        spawnDust(gx, gy, count = 8, color = '#38bdf8') {
            const cx = this.offsetX + (gx + 0.5) * this.cellSize;
            const cy = this.offsetY + (gy + 0.5) * this.cellSize;
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 2.5 + 0.8;
                this.particles.push({
                    x: cx,
                    y: cy,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: Math.random() * 3 + 2,
                    alpha: 1.0,
                    life: 1.0,
                    decay: Math.random() * 0.03 + 0.02,
                    color: color
                });
            }
        }

        spawnVictoryConfetti() {
            const colors = ['#00f0ff', '#d946ef', '#facc15', '#22c55e', '#ec4899', '#ffffff'];
            for (let i = 0; i < 90; i++) {
                const cx = this.viewWidth / 2 + (Math.random() - 0.5) * 120;
                const cy = this.viewHeight / 2 + (Math.random() - 0.5) * 80;
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 7 + 3;
                this.particles.push({
                    x: cx,
                    y: cy,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 2.5,
                    gravity: 0.15,
                    size: Math.random() * 5 + 3,
                    alpha: 1.0,
                    life: 1.0,
                    decay: Math.random() * 0.012 + 0.008,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    rot: Math.random() * Math.PI,
                    rotSpeed: (Math.random() - 0.5) * 0.2
                });
            }
        }

        update(dt, player, exit, isTrapped) {
            this.glowTime += dt * 0.002;

            // Interpolate player position
            const pSpeed = Math.min(1.0, this.lerpSpeed * (dt / 16.67));
            this.playerRender.x += (player.x - this.playerRender.x) * pSpeed;
            this.playerRender.y += (player.y - this.playerRender.y) * pSpeed;

            // Interpolate exit position
            const eSpeed = Math.min(1.0, (this.lerpSpeed * 1.1) * (dt / 16.67));
            const exDist = Math.hypot(exit.x - this.exitRender.x, exit.y - this.exitRender.y);
            this.exitRender.x += (exit.x - this.exitRender.x) * eSpeed;
            this.exitRender.y += (exit.y - this.exitRender.y) * eSpeed;

            // Exit scamper leg animation when moving
            if (exDist > 0.03) {
                this.exitRender.scamperPhase += dt * 0.025;
                this.exitRender.wobble = Math.sin(this.exitRender.scamperPhase) * 0.18;
            } else {
                this.exitRender.wobble *= 0.85;
            }

            // Panic shake when trapped
            if (isTrapped) {
                this.exitRender.panicShake = (Math.random() - 0.5) * 4;
            } else {
                this.exitRender.panicShake = 0;
            }

            // Player bump decay
            if (this.playerRender.bumpTimer > 0) {
                this.playerRender.bumpTimer -= dt * 0.008;
                if (this.playerRender.bumpTimer <= 0) {
                    this.playerRender.bumpTimer = 0;
                    this.playerRender.bumpDx = 0;
                    this.playerRender.bumpDy = 0;
                }
            }

            // Speech bubble timer
            if (this.speechBubble) {
                this.speechBubble.timer -= dt;
                if (this.speechBubble.timer <= 0) {
                    this.speechBubble = null;
                }
            }

            // Update particles
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                if (p.gravity) p.vy += p.gravity;
                p.life -= p.decay;
                p.alpha = Math.max(0, p.life);
                if (p.rot !== undefined) p.rot += p.rotSpeed;
                if (p.life <= 0) {
                    this.particles.splice(i, 1);
                }
            }

            // Update ambient floating particles
            for (const ap of this.ambientParticles) {
                ap.y -= ap.speed * dt;
                if (ap.y < 0) {
                    ap.y = 1.0;
                    ap.x = Math.random();
                }
            }
        }

        render(level, player, exit, isTrapped, won) {
            const ctx = this.ctx;
            const w = this.viewWidth;
            const h = this.viewHeight;

            if (w <= 0 || h <= 0) return;

            // 1. Dark Midnight Background
            const bgGradient = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, Math.max(w, h));
            bgGradient.addColorStop(0, '#161233');
            bgGradient.addColorStop(0.5, '#0b091a');
            bgGradient.addColorStop(1, '#05040d');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, w, h);

            // 2. Ambient background particles
            for (const ap of this.ambientParticles) {
                ctx.fillStyle = ap.color;
                ctx.globalAlpha = ap.alpha * (0.6 + Math.sin(this.glowTime + ap.x * 10) * 0.3);
                ctx.beginPath();
                ctx.arc(ap.x * w, ap.y * h, ap.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;

            // 3. Grid board shadow & outer frame
            const boardW = level.width * this.cellSize;
            const boardH = level.height * this.cellSize;

            ctx.save();
            ctx.shadowColor = '#00f0ff33';
            ctx.shadowBlur = 28;
            ctx.fillStyle = '#0a0817';
            ctx.beginPath();
            ctx.roundRect(this.offsetX - 8, this.offsetY - 8, boardW + 16, boardH + 16, 12);
            ctx.fill();
            ctx.strokeStyle = '#2e2560';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();

            // 4. Draw Floor Tiles and Walls
            for (let y = 0; y < level.height; y++) {
                for (let x = 0; x < level.width; x++) {
                    const cellX = this.offsetX + x * this.cellSize;
                    const cellY = this.offsetY + y * this.cellSize;
                    const isWall = (level.grid[y][x] === 1);

                    if (isWall) {
                        this.drawWall(cellX, cellY, x, y, level);
                    } else {
                        this.drawFloor(cellX, cellY, x, y);
                    }
                }
            }

            // 5. Draw Exit Door
            if (!won) {
                this.drawLivingExit(player, isTrapped);
            }

            // 6. Draw Player
            this.drawPlayer(player);

            // 7. If won, draw caught celebration on exit tile
            if (won) {
                this.drawCaughtCelebration(exit);
            }

            // 8. Draw Particle Effects
            this.drawParticles();

            // 9. Draw Speech Bubble
            if (this.speechBubble && !won) {
                this.drawSpeechBubble();
            }
        }

        drawFloor(x, y, gx, gy) {
            const ctx = this.ctx;
            const s = this.cellSize;

            // Clear, crisp dark floor tile
            ctx.fillStyle = (gx + gy) % 2 === 0 ? '#120f29' : '#0e0c22';
            ctx.fillRect(x, y, s, s);

            // Clean glowing tile grid line
            ctx.strokeStyle = '#1e1845';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);

            // Subtle center floor accent
            ctx.fillStyle = '#261f52';
            ctx.fillRect(x + s / 2 - 1, y + s / 2 - 1, 2, 2);
        }

        drawWall(x, y, gx, gy, level) {
            const ctx = this.ctx;
            const s = this.cellSize;

            // HIGH-CONTRAST 3D CYBER-BLOCK
            // Drop shadow
            ctx.fillStyle = '#06050e';
            ctx.fillRect(x + 2, y + 2, s, s);

            // Base face (deep indigo stone)
            const wallGrad = ctx.createLinearGradient(x, y, x, y + s);
            wallGrad.addColorStop(0, '#312763');
            wallGrad.addColorStop(0.3, '#221a47');
            wallGrad.addColorStop(1, '#15102e');
            ctx.fillStyle = wallGrad;
            ctx.fillRect(x, y, s, s);

            // Top-lit highlight bevel
            ctx.fillStyle = '#5444a0';
            ctx.fillRect(x + 1, y + 1, s - 2, 3);
            ctx.fillRect(x + 1, y + 1, 3, s - 2);

            // Dark bottom-right shadow bevel
            ctx.fillStyle = '#0a0817';
            ctx.fillRect(x + s - 3, y + 1, 3, s - 1);
            ctx.fillRect(x + 1, y + s - 3, s - 1, 3);

            // Prominent glowing cyber-border
            ctx.strokeStyle = '#7c3aed';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 4, y + 4, s - 8, s - 8);

            // Center neon diamond
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            const cx = x + s / 2;
            const cy = y + s / 2;
            ctx.moveTo(cx, cy - 4);
            ctx.lineTo(cx + 4, cy);
            ctx.lineTo(cx, cy + 4);
            ctx.lineTo(cx - 4, cy);
            ctx.closePath();
            ctx.fill();
        }

        drawPlayer(player) {
            const ctx = this.ctx;
            const s = this.cellSize;

            let px = this.offsetX + this.playerRender.x * s;
            let py = this.offsetY + this.playerRender.y * s;

            if (this.playerRender.bumpTimer > 0) {
                px += this.playerRender.bumpDx * Math.sin(this.playerRender.bumpTimer * Math.PI) * s;
                py += this.playerRender.bumpDy * Math.sin(this.playerRender.bumpTimer * Math.PI) * s;
            }

            const cx = px + s / 2;
            const cy = py + s / 2;
            const radius = s * 0.38;

            ctx.save();

            // Outer cyan glowing aura
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 18 + Math.sin(this.glowTime * 3) * 5;

            // Player Body Gradient (Bright glowing cyan cyber-bot)
            const bodyGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 2, cx, cy, radius);
            bodyGrad.addColorStop(0, '#cffafe');
            bodyGrad.addColorStop(0.3, '#38bdf8');
            bodyGrad.addColorStop(0.7, '#0284c7');
            bodyGrad.addColorStop(1, '#075985');

            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();

            // White rim highlight
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Visor
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#082f49';
            ctx.beginPath();
            ctx.ellipse(cx, cy - 2, radius * 0.65, radius * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();

            // Eyes / Direction glance
            let eyeOffsetX = 0;
            let eyeOffsetY = 0;
            if (this.playerRender.facing === 'RIGHT') eyeOffsetX = 3.5;
            if (this.playerRender.facing === 'LEFT') eyeOffsetX = -3.5;
            if (this.playerRender.facing === 'UP') eyeOffsetY = -3.5;
            if (this.playerRender.facing === 'DOWN') eyeOffsetY = 2.5;

            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(cx - 5 + eyeOffsetX, cy - 2 + eyeOffsetY, 3, 0, Math.PI * 2);
            ctx.arc(cx + 5 + eyeOffsetX, cy - 2 + eyeOffsetY, 3, 0, Math.PI * 2);
            ctx.fill();

            // Antenna
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy - radius);
            ctx.lineTo(cx, cy - radius - 5);
            ctx.stroke();

            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.arc(cx, cy - radius - 6, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        drawLivingExit(player, isTrapped) {
            const ctx = this.ctx;
            const s = this.cellSize;

            let ex = this.offsetX + this.exitRender.x * s + (isTrapped ? this.exitRender.panicShake : 0);
            let ey = this.offsetY + this.exitRender.y * s;

            const cx = ex + s / 2;
            const cy = ey + s / 2;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(this.exitRender.wobble);

            const doorW = s * 0.68;
            const doorH = s * 0.86;

            // 1. Scampering running feet
            const legPhase = this.exitRender.scamperPhase;
            const legOffset1 = Math.sin(legPhase) * 4;
            const legOffset2 = Math.sin(legPhase + Math.PI) * 4;

            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.ellipse(-doorW * 0.28, doorH * 0.48 + legOffset1, 4.5, 3.5, 0, 0, Math.PI * 2);
            ctx.ellipse(doorW * 0.28, doorH * 0.48 + legOffset2, 4.5, 3.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // 2. Glowing aura
            ctx.shadowColor = isTrapped ? '#ef4444' : '#f59e0b';
            ctx.shadowBlur = isTrapped ? 22 + Math.sin(this.glowTime * 14) * 8 : 18;

            // 3. Door Arch Frame
            const frameGrad = ctx.createLinearGradient(-doorW / 2, -doorH / 2, doorW / 2, doorH / 2);
            if (isTrapped) {
                frameGrad.addColorStop(0, '#fca5a5');
                frameGrad.addColorStop(0.4, '#ef4444');
                frameGrad.addColorStop(1, '#991b1b');
            } else {
                frameGrad.addColorStop(0, '#fef08a');
                frameGrad.addColorStop(0.3, '#f59e0b');
                frameGrad.addColorStop(1, '#b45309');
            }

            ctx.fillStyle = frameGrad;
            ctx.beginPath();
            ctx.roundRect(-doorW / 2, -doorH / 2, doorW, doorH, [doorW * 0.45, doorW * 0.45, 5, 5]);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // 4. Portal Vortex Interior
            ctx.shadowBlur = 0;
            const innerW = doorW * 0.72;
            const innerH = doorH * 0.78;
            const portalGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, innerW);
            portalGrad.addColorStop(0, '#ffffff');
            portalGrad.addColorStop(0.3, '#ec4899');
            portalGrad.addColorStop(0.7, '#8b5cf6');
            portalGrad.addColorStop(1, '#310d54');

            ctx.fillStyle = portalGrad;
            ctx.beginPath();
            ctx.roundRect(-innerW / 2, -innerH / 2 + 3, innerW, innerH, [innerW * 0.4, innerW * 0.4, 4, 4]);
            ctx.fill();

            // 5. Golden Knob
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(innerW * 0.32, 2, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1;
            ctx.stroke();

            // 6. Expressive Eyes tracking player
            const pRealX = this.offsetX + this.playerRender.x * s + s / 2;
            const pRealY = this.offsetY + this.playerRender.y * s + s / 2;
            const angleToPlayer = Math.atan2(pRealY - (ey + s / 2), pRealX - (ex + s / 2));
            const lookDist = 2.5;
            const lookX = Math.cos(angleToPlayer) * lookDist;
            const lookY = Math.sin(angleToPlayer) * lookDist;

            const eyeY = -innerH * 0.16;
            const eyeSpacing = innerW * 0.24;

            // Eye whites
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(-eyeSpacing, eyeY, 5.5, 7.5, 0, 0, Math.PI * 2);
            ctx.ellipse(eyeSpacing, eyeY, 5.5, 7.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#1e1b4b';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Pupils
            ctx.fillStyle = isTrapped ? '#ef4444' : '#0f172a';
            const pupilSize = isTrapped ? 2.0 : 3.0;
            ctx.beginPath();
            ctx.arc(-eyeSpacing + lookX, eyeY + lookY, pupilSize, 0, Math.PI * 2);
            ctx.arc(eyeSpacing + lookX, eyeY + lookY, pupilSize, 0, Math.PI * 2);
            ctx.fill();

            // Mouth
            ctx.strokeStyle = '#1e1b4b';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            if (isTrapped) {
                // Shaking wavy mouth
                ctx.moveTo(-6, eyeY + 12);
                ctx.quadraticCurveTo(-3, eyeY + 9, 0, eyeY + 12);
                ctx.quadraticCurveTo(3, eyeY + 15, 6, eyeY + 12);
            } else {
                // Mischievous grin
                ctx.arc(0, eyeY + 9, 5, 0.1 * Math.PI, 0.9 * Math.PI);
            }
            ctx.stroke();

            // Sweat droplets in panic
            if (isTrapped) {
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.arc(doorW * 0.45, -doorH * 0.4, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(doorW * 0.45 - 3, -doorH * 0.4);
                ctx.lineTo(doorW * 0.45, -doorH * 0.4 - 5);
                ctx.lineTo(doorW * 0.45 + 3, -doorH * 0.4);
                ctx.fill();
            }

            ctx.restore();
        }

        drawCaughtCelebration(exit) {
            const s = this.cellSize;
            const cx = this.offsetX + exit.x * s + s / 2;
            const cy = this.offsetY + exit.y * s + s / 2;

            const ctx = this.ctx;
            ctx.save();
            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 30;
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.arc(cx, cy, s * 0.42, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 18px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('WIN!', cx, cy);
            ctx.restore();
        }

        drawSpeechBubble() {
            const ctx = this.ctx;
            const s = this.cellSize;
            const bubble = this.speechBubble;

            const ex = this.offsetX + this.exitRender.x * s + s / 2;
            const ey = this.offsetY + this.exitRender.y * s - s * 0.45;

            const alpha = Math.min(1.0, bubble.timer / 300);

            ctx.save();
            ctx.globalAlpha = alpha;

            ctx.font = 'bold 13px "Segoe UI", sans-serif';
            const metrics = ctx.measureText(bubble.text);
            const padX = 12;
            const bw = metrics.width + padX * 2;
            const bh = 24;
            const bx = ex - bw / 2;
            const by = ey - bh;

            // Shadow
            ctx.shadowColor = bubble.type === 'trapped' ? '#ef4444' : '#00f0ff';
            ctx.shadowBlur = 12;

            // Body
            ctx.fillStyle = bubble.type === 'trapped' ? '#fee2e2' : '#ffffff';
            ctx.beginPath();
            ctx.roundRect(bx, by, bw, bh, 6);
            ctx.fill();

            // Tail
            ctx.beginPath();
            ctx.moveTo(ex - 4, by + bh);
            ctx.lineTo(ex, by + bh + 6);
            ctx.lineTo(ex + 4, by + bh);
            ctx.fill();

            // Text
            ctx.shadowBlur = 0;
            ctx.fillStyle = bubble.type === 'trapped' ? '#b91c1c' : '#0f172a';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(bubble.text, ex, by + bh / 2 + 1);

            ctx.restore();
        }

        drawParticles() {
            const ctx = this.ctx;
            for (const p of this.particles) {
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;

                if (p.rot !== undefined) {
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rot);
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                } else {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        }
    }

    window.GameRenderer = Renderer;

})(typeof window !== 'undefined' ? window : global);
