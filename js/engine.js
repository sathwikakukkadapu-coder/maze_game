// js/engine.js
// Core Game Engine, State Machine, History Stack, and Input Management

(function(window) {
    'use strict';

    const STATE = {
        MENU: 'MENU',
        PLAYING: 'PLAYING',
        PAUSED: 'PAUSED',
        LEVEL_CLEAR: 'LEVEL_CLEAR',
        VICTORY: 'VICTORY'
    };

    class GameEngine {
        constructor() {
            this.state = STATE.MENU;
            this.currentLevelIndex = 0;
            this.levels = window.GAME_LEVELS || [];
            this.currentLevel = null;

            // Entity positions on grid
            this.player = { x: 0, y: 0, facing: 'DOWN' };
            this.exit = { x: 0, y: 0 };
            this.isExitTrapped = false;

            // Stats & History
            this.movesCount = 0;
            this.history = []; // Stack for UNDO support!
            this.unlockedLevels = 1;
            this.bestScores = {};

            // Timers & loop
            this.lastFrameTime = performance.now();
            this.isWon = false;

            this.loadProgress();
        }

        loadProgress() {
            try {
                const unlocked = localStorage.getItem('teiac_unlocked');
                if (unlocked) {
                    this.unlockedLevels = Math.max(1, parseInt(unlocked, 10) || 1);
                }
                for (let i = 1; i <= this.levels.length; i++) {
                    const best = localStorage.getItem(`teiac_best_${i}`);
                    if (best) {
                        this.bestScores[i] = parseInt(best, 10);
                    }
                }
            } catch (e) {}
        }

        saveProgress() {
            try {
                localStorage.setItem('teiac_unlocked', this.unlockedLevels.toString());
                for (const lvlId in this.bestScores) {
                    localStorage.setItem(`teiac_best_${lvlId}`, this.bestScores[lvlId].toString());
                }
            } catch (e) {}
        }

        initRenderer(canvas) {
            this.renderer = new window.GameRenderer(canvas);
            this.renderer.resize();
        }

        startLevel(levelIndex) {
            if (levelIndex < 0 || levelIndex >= this.levels.length) {
                levelIndex = 0;
            }
            this.currentLevelIndex = levelIndex;
            this.currentLevel = this.levels[levelIndex];

            // Setup entities
            this.player = {
                x: this.currentLevel.playerStart.x,
                y: this.currentLevel.playerStart.y,
                facing: 'DOWN'
            };
            this.exit = {
                x: this.currentLevel.exitStart.x,
                y: this.currentLevel.exitStart.y
            };
            this.isExitTrapped = false;
            this.isWon = false;
            this.movesCount = 0;
            this.history = [];

            // Sync and resize renderer immediately
            if (this.renderer) {
                this.renderer.resize();
                this.renderer.calculateLayout(this.currentLevel.width, this.currentLevel.height);
                this.renderer.syncPositions(this.player, this.exit, true);
                this.renderer.speechBubble = null;
            }

            this.state = STATE.PLAYING;
            this.updateUI();
        }

        restartLevel() {
            if (window.GameAudio) window.GameAudio.playRestart();
            this.startLevel(this.currentLevelIndex);
        }

        undoMove() {
            if (this.history.length === 0 || this.isWon || this.state !== STATE.PLAYING) {
                return false;
            }

            const prev = this.history.pop();
            this.player = { ...prev.player };
            this.exit = { ...prev.exit };
            this.isExitTrapped = prev.isExitTrapped;
            this.movesCount = prev.movesCount;

            if (this.renderer) {
                this.renderer.playerRender.facing = this.player.facing;
                this.renderer.syncPositions(this.player, this.exit, false);
                this.renderer.speechBubble = null;
                if (prev.message) {
                    this.renderer.showSpeech(prev.message, prev.isExitTrapped ? 'trapped' : 'flee', 1200);
                }
            }

            if (window.GameAudio) window.GameAudio.playUndo();
            this.updateUI();
            return true;
        }

        handlePlayerMove(dirName) {
            if (this.state !== STATE.PLAYING || this.isWon) return;

            const dir = window.GameAI.DIRS.find(d => d.name === dirName);
            if (!dir) return;

            const nx = this.player.x + dir.dx;
            const ny = this.player.y + dir.dy;
            this.player.facing = dirName;
            if (this.renderer) this.renderer.playerRender.facing = dirName;

            // Check collision with walls or boundaries
            if (
                nx < 0 || nx >= this.currentLevel.width ||
                ny < 0 || ny >= this.currentLevel.height ||
                this.currentLevel.grid[ny][nx] === 1
            ) {
                // Wall bump!
                if (window.GameAudio) window.GameAudio.playBump();
                if (this.renderer) this.renderer.triggerPlayerBump(dir.dx, dir.dy);
                return;
            }

            // Valid move: Save current state to history stack for UNDO
            this.history.push({
                player: { ...this.player },
                exit: { ...this.exit },
                isExitTrapped: this.isExitTrapped,
                movesCount: this.movesCount,
                message: this.renderer && this.renderer.speechBubble ? this.renderer.speechBubble.text : ""
            });

            // Update player
            this.player.x = nx;
            this.player.y = ny;
            this.movesCount++;

            if (window.GameAudio) window.GameAudio.playPlayerMove();
            if (this.renderer) this.renderer.spawnDust(nx, ny, 6, '#00f0ff');

            // 1. Check if player stepped directly onto exit!
            if (this.player.x === this.exit.x && this.player.y === this.exit.y) {
                this.handleLevelWin();
                return;
            }

            // 2. The Living Exit reacts!
            const exitDecision = window.GameAI.getExitNextMove(
                this.player.x,
                this.player.y,
                this.exit.x,
                this.exit.y,
                this.currentLevel.grid,
                this.currentLevel.width,
                this.currentLevel.height
            );

            if (exitDecision.moved) {
                // Exit flees!
                this.exit.x = exitDecision.x;
                this.exit.y = exitDecision.y;
                this.isExitTrapped = false;
                if (window.GameAudio) window.GameAudio.playExitFlee();
                if (this.renderer) {
                    this.renderer.spawnDust(this.exit.x, this.exit.y, 6, '#f59e0b');
                    this.renderer.showSpeech(exitDecision.message, 'flee', 1500);
                }
            } else {
                // Exit is trapped / cornered!
                this.isExitTrapped = true;
                if (window.GameAudio) window.GameAudio.playExitTrapped();
                if (this.renderer) {
                    this.renderer.showSpeech(exitDecision.message, 'trapped', 2000);
                }
            }

            this.updateUI();
        }

        handleLevelWin() {
            this.isWon = true;
            this.state = STATE.LEVEL_CLEAR;

            // Audio & FX
            if (this.renderer) {
                this.renderer.spawnVictoryConfetti();
                const caughtMsg = window.GameAI.getNextMessage('caught');
                this.renderer.showSpeech(caughtMsg, 'trapped', 2500);
            }

            // Best score tracking
            const lvlId = this.currentLevel.id;
            const prevBest = this.bestScores[lvlId];
            if (!prevBest || this.movesCount < prevBest) {
                this.bestScores[lvlId] = this.movesCount;
            }

            // Unlock next level
            if (this.currentLevelIndex + 1 < this.levels.length) {
                this.unlockedLevels = Math.max(this.unlockedLevels, this.currentLevelIndex + 2);
            }
            this.saveProgress();

            const isLastLevel = (this.currentLevelIndex === this.levels.length - 1);
            if (isLastLevel) {
                if (window.GameAudio) window.GameAudio.playGameVictory();
                setTimeout(() => {
                    this.state = STATE.VICTORY;
                    this.showVictoryModal();
                }, 800);
            } else {
                if (window.GameAudio) window.GameAudio.playLevelWin();
                setTimeout(() => {
                    this.showLevelClearModal();
                }, 600);
            }

            this.updateUI();
        }

        nextLevel() {
            if (this.currentLevelIndex + 1 < this.levels.length) {
                this.startLevel(this.currentLevelIndex + 1);
            } else {
                this.startLevel(0);
            }
        }

        updateUI() {
            const levelTitleEl = document.getElementById('hud-level-title');
            const movesCountEl = document.getElementById('hud-moves-count');
            const bestMovesEl = document.getElementById('hud-best-moves');
            const undoBtn = document.getElementById('btn-undo');
            const hintTextEl = document.getElementById('hud-hint-text');

            if (this.currentLevel) {
                if (levelTitleEl) {
                    levelTitleEl.textContent = `L${this.currentLevel.id}: ${this.currentLevel.title}`;
                }
                if (movesCountEl) {
                    movesCountEl.textContent = this.movesCount.toString();
                }
                if (bestMovesEl) {
                    const best = this.bestScores[this.currentLevel.id];
                    bestMovesEl.textContent = best !== undefined ? best.toString() : "-";
                }
                if (hintTextEl) {
                    hintTextEl.textContent = this.currentLevel.hint;
                }
            }
            if (undoBtn) {
                undoBtn.disabled = (this.history.length === 0 || this.isWon);
            }
        }

        showLevelClearModal() {
            const modal = document.getElementById('modal-level-clear');
            const clearTitle = document.getElementById('clear-level-title');
            const clearMoves = document.getElementById('clear-moves-count');
            const clearBest = document.getElementById('clear-best-moves');
            const clearStars = document.getElementById('clear-stars');

            if (clearTitle) clearTitle.textContent = `${this.currentLevel.title} Complete!`;
            if (clearMoves) clearMoves.textContent = this.movesCount.toString();
            if (clearBest) clearBest.textContent = this.bestScores[this.currentLevel.id].toString();

            // Stars calculation: Par moves = 3 stars, Par + 3 = 2 stars, otherwise 1 star
            if (clearStars) {
                const par = this.currentLevel.parMoves;
                let starCount = 1;
                if (this.movesCount <= par) starCount = 3;
                else if (this.movesCount <= par + 3) starCount = 2;
                clearStars.textContent = "★".repeat(starCount) + "☆".repeat(3 - starCount);
            }

            if (modal) modal.classList.remove('hidden');
        }

        showVictoryModal() {
            const modal = document.getElementById('modal-victory');
            const totalMovesEl = document.getElementById('victory-total-moves');
            const levelsCountEl = document.getElementById('victory-levels-count');
            const subtitleEl = document.getElementById('victory-subtitle');
            let total = 0;
            for (let i = 1; i <= this.levels.length; i++) {
                total += (this.bestScores[i] || 0);
            }
            if (totalMovesEl) totalMovesEl.textContent = total.toString();
            if (levelsCountEl) levelsCountEl.textContent = `${this.levels.length} / ${this.levels.length}`;
            if (subtitleEl) subtitleEl.textContent = `All ${this.levels.length} Coward Doors have been captured!`;
            if (modal) modal.classList.remove('hidden');
        }

        loop() {
            const now = performance.now();
            const dt = Math.min(50, now - this.lastFrameTime);
            this.lastFrameTime = now;

            if (this.renderer && this.currentLevel) {
                // Dynamic container dimension check
                const container = this.renderer.canvas.parentElement;
                if (container) {
                    const cw = Math.floor(container.clientWidth);
                    const ch = Math.floor(container.clientHeight);
                    if (cw > 0 && ch > 0 && (cw !== this.renderer.viewWidth || ch !== this.renderer.viewHeight)) {
                        this.renderer.resize();
                        this.renderer.calculateLayout(this.currentLevel.width, this.currentLevel.height);
                    }
                }

                this.renderer.update(dt, this.player, this.exit, this.isExitTrapped);
                this.renderer.render(this.currentLevel, this.player, this.exit, this.isExitTrapped, this.isWon);
            }

            requestAnimationFrame(() => this.loop());
        }
    }

    window.GameEngine = GameEngine;

})(typeof window !== 'undefined' ? window : global);
