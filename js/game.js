// js/game.js
// Main Application Controller, Event Listeners, and UI Bindings

(function() {
    'use strict';

    let engine = null;

    function init() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;

        engine = new window.GameEngine();
        engine.initRenderer(canvas);

        setupEventListeners(canvas);
        updateSoundButtons();
        renderLevelSelectGrid();

        // Start render loop
        engine.loop();

        // Window resize handler
        window.addEventListener('resize', () => {
            if (engine.renderer) {
                engine.renderer.resize();
                if (engine.currentLevel) {
                    engine.renderer.calculateLayout(engine.currentLevel.width, engine.currentLevel.height);
                }
            }
        });
    }

    function setupEventListeners(canvas) {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            if (window.GameAudio) window.GameAudio.init();

            const key = e.key.toLowerCase();
            const code = e.code;

            if (code === 'ArrowUp' || key === 'w') {
                e.preventDefault();
                engine.handlePlayerMove('UP');
            } else if (code === 'ArrowRight' || key === 'd') {
                e.preventDefault();
                engine.handlePlayerMove('RIGHT');
            } else if (code === 'ArrowDown' || key === 's') {
                e.preventDefault();
                engine.handlePlayerMove('DOWN');
            } else if (code === 'ArrowLeft' || key === 'a') {
                e.preventDefault();
                engine.handlePlayerMove('LEFT');
            } else if (key === 'r') {
                e.preventDefault();
                engine.restartLevel();
            } else if (key === 'z' || key === 'u') {
                e.preventDefault();
                engine.undoMove();
            } else if (key === 'p' || key === 'escape') {
                e.preventDefault();
                togglePause();
            } else if (key === 'm') {
                e.preventDefault();
                toggleSound();
            }
        });

        // Pointer / Touch gestures on Canvas
        let pointerStartX = 0;
        let pointerStartY = 0;
        let pointerStartTime = 0;

        canvas.addEventListener('pointerdown', (e) => {
            if (window.GameAudio) window.GameAudio.init();
            pointerStartX = e.clientX;
            pointerStartY = e.clientY;
            pointerStartTime = performance.now();
        });

        canvas.addEventListener('pointerup', (e) => {
            if (engine.state !== 'PLAYING') return;

            const deltaX = e.clientX - pointerStartX;
            const deltaY = e.clientY - pointerStartY;
            const duration = performance.now() - pointerStartTime;
            const dist = Math.hypot(deltaX, deltaY);

            // 1. If it's a swipe (> 24px within 400ms)
            if (dist > 24 && duration < 400) {
                if (Math.abs(deltaX) >= Math.abs(deltaY)) {
                    engine.handlePlayerMove(deltaX > 0 ? 'RIGHT' : 'LEFT');
                } else {
                    engine.handlePlayerMove(deltaY > 0 ? 'DOWN' : 'UP');
                }
                return;
            }

            // 2. Otherwise it's a click/tap on the grid
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            const r = engine.renderer;
            const gx = Math.floor((clickX - r.offsetX) / r.cellSize);
            const gy = Math.floor((clickY - r.offsetY) / r.cellSize);

            const px = engine.player.x;
            const py = engine.player.y;

            const dx = gx - px;
            const dy = gy - py;

            // Move towards the clicked tile along dominant axis
            if (Math.abs(dx) >= Math.abs(dy)) {
                if (dx > 0) engine.handlePlayerMove('RIGHT');
                else if (dx < 0) engine.handlePlayerMove('LEFT');
            } else {
                if (dy > 0) engine.handlePlayerMove('DOWN');
                else if (dy < 0) engine.handlePlayerMove('UP');
            }
        });

        // Touch D-Pad buttons
        const dpadUp = document.getElementById('dpad-up');
        const dpadRight = document.getElementById('dpad-right');
        const dpadDown = document.getElementById('dpad-down');
        const dpadLeft = document.getElementById('dpad-left');

        const bindDpad = (el, dir) => {
            if (!el) return;
            const act = (e) => {
                e.preventDefault();
                if (window.GameAudio) window.GameAudio.init();
                engine.handlePlayerMove(dir);
            };
            el.addEventListener('pointerdown', act);
        };

        bindDpad(dpadUp, 'UP');
        bindDpad(dpadRight, 'RIGHT');
        bindDpad(dpadDown, 'DOWN');
        bindDpad(dpadLeft, 'LEFT');

        // HUD Buttons
        const btnUndo = document.getElementById('btn-undo');
        const btnRestart = document.getElementById('btn-restart');
        const btnPause = document.getElementById('btn-pause');
        const btnSoundHud = document.getElementById('btn-sound-hud');
        const btnMenuHud = document.getElementById('btn-menu-hud');

        if (btnUndo) btnUndo.addEventListener('click', (e) => { e.target.blur(); engine.undoMove(); });
        if (btnRestart) btnRestart.addEventListener('click', (e) => { e.target.blur(); engine.restartLevel(); });
        if (btnPause) btnPause.addEventListener('click', (e) => { e.target.blur(); togglePause(); });
        if (btnSoundHud) btnSoundHud.addEventListener('click', (e) => { e.target.blur(); toggleSound(); });
        if (btnMenuHud) btnMenuHud.addEventListener('click', (e) => { e.target.blur(); showMainMenu(); });

        // Menu Buttons
        const btnPlay = document.getElementById('btn-play-game');
        const btnHowToPlay = document.getElementById('btn-how-to-play');
        const btnLevelSelect = document.getElementById('btn-level-select');
        const btnSoundMenu = document.getElementById('btn-sound-menu');

        if (btnPlay) {
            btnPlay.addEventListener('click', () => {
                if (window.GameAudio) window.GameAudio.init();
                hideAllModals();
                document.getElementById('screen-menu').classList.add('hidden');
                document.getElementById('screen-game').classList.remove('hidden');

                // Allow DOM to compute bounding box before initializing level
                requestAnimationFrame(() => {
                    engine.startLevel(0);
                });
            });
        }

        if (btnHowToPlay) {
            btnHowToPlay.addEventListener('click', () => {
                document.getElementById('modal-how-to-play').classList.remove('hidden');
            });
        }

        if (btnLevelSelect) {
            btnLevelSelect.addEventListener('click', () => {
                renderLevelSelectGrid();
                document.getElementById('modal-level-select').classList.remove('hidden');
            });
        }

        if (btnSoundMenu) btnSoundMenu.addEventListener('click', () => toggleSound());

        // Modals Buttons
        const btnCloseHowToPlay = document.getElementById('btn-close-how-to');
        if (btnCloseHowToPlay) {
            btnCloseHowToPlay.addEventListener('click', () => {
                document.getElementById('modal-how-to-play').classList.add('hidden');
            });
        }

        // Pause modal buttons
        const btnResume = document.getElementById('btn-pause-resume');
        const btnPauseRestart = document.getElementById('btn-pause-restart');
        const btnPauseLevelSelect = document.getElementById('btn-pause-level-select');
        const btnPauseMenu = document.getElementById('btn-pause-menu');

        if (btnResume) {
            btnResume.addEventListener('click', () => {
                document.getElementById('modal-pause').classList.add('hidden');
                engine.state = 'PLAYING';
            });
        }
        if (btnPauseRestart) {
            btnPauseRestart.addEventListener('click', () => {
                document.getElementById('modal-pause').classList.add('hidden');
                engine.restartLevel();
            });
        }
        if (btnPauseLevelSelect) {
            btnPauseLevelSelect.addEventListener('click', () => {
                document.getElementById('modal-pause').classList.add('hidden');
                renderLevelSelectGrid();
                document.getElementById('modal-level-select').classList.remove('hidden');
            });
        }
        if (btnPauseMenu) {
            btnPauseMenu.addEventListener('click', () => {
                document.getElementById('modal-pause').classList.add('hidden');
                showMainMenu();
            });
        }

        // Level Clear modal buttons
        const btnNextLevel = document.getElementById('btn-next-level');
        const btnReplayLevel = document.getElementById('btn-replay-level');
        const btnClearSelect = document.getElementById('btn-clear-level-select');

        if (btnNextLevel) {
            btnNextLevel.addEventListener('click', () => {
                document.getElementById('modal-level-clear').classList.add('hidden');
                engine.nextLevel();
            });
        }
        if (btnReplayLevel) {
            btnReplayLevel.addEventListener('click', () => {
                document.getElementById('modal-level-clear').classList.add('hidden');
                engine.restartLevel();
            });
        }
        if (btnClearSelect) {
            btnClearSelect.addEventListener('click', () => {
                document.getElementById('modal-level-clear').classList.add('hidden');
                renderLevelSelectGrid();
                document.getElementById('modal-level-select').classList.remove('hidden');
            });
        }

        // Victory modal buttons
        const btnVictoryReplay = document.getElementById('btn-victory-replay');
        const btnVictoryMenu = document.getElementById('btn-victory-menu');

        if (btnVictoryReplay) {
            btnVictoryReplay.addEventListener('click', () => {
                document.getElementById('modal-victory').classList.add('hidden');
                engine.startLevel(0);
            });
        }
        if (btnVictoryMenu) {
            btnVictoryMenu.addEventListener('click', () => {
                document.getElementById('modal-victory').classList.add('hidden');
                showMainMenu();
            });
        }

        // Level Select close button
        const btnCloseLevelSelect = document.getElementById('btn-close-level-select');
        if (btnCloseLevelSelect) {
            btnCloseLevelSelect.addEventListener('click', () => {
                document.getElementById('modal-level-select').classList.add('hidden');
            });
        }
    }

    function togglePause() {
        if (engine.state === 'PLAYING') {
            engine.state = 'PAUSED';
            document.getElementById('modal-pause').classList.remove('hidden');
        } else if (engine.state === 'PAUSED') {
            engine.state = 'PLAYING';
            document.getElementById('modal-pause').classList.add('hidden');
        }
    }

    function toggleSound() {
        if (window.GameAudio) {
            window.GameAudio.init();
            const muted = window.GameAudio.toggleMute();
            updateSoundButtons();
        }
    }

    function updateSoundButtons() {
        const isMuted = window.GameAudio ? window.GameAudio.isMuted() : false;
        const icon = isMuted ? '🔇' : '🔊';
        const text = isMuted ? 'UNMUTE' : 'MUTE';

        const btnMenu = document.getElementById('btn-sound-menu');
        const btnHud = document.getElementById('btn-sound-hud');

        if (btnMenu) btnMenu.innerHTML = `${icon} <span>${text}</span>`;
        if (btnHud) btnHud.innerHTML = `${icon}`;
    }

    function showMainMenu() {
        hideAllModals();
        document.getElementById('screen-game').classList.add('hidden');
        document.getElementById('screen-menu').classList.remove('hidden');
        engine.state = 'MENU';
    }

    function hideAllModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(m => m.classList.add('hidden'));
    }

    function renderLevelSelectGrid() {
        const container = document.getElementById('level-select-grid');
        if (!container) return;

        container.innerHTML = '';
        engine.levels.forEach((lvl, idx) => {
            const isUnlocked = (lvl.id <= engine.unlockedLevels);
            const card = document.createElement('button');
            card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'}`;

            const best = engine.bestScores[lvl.id];
            let stars = "☆☆☆";
            if (best) {
                if (best <= lvl.parMoves) stars = "★★★";
                else if (best <= lvl.parMoves + 3) stars = "★★☆";
                else stars = "★☆☆";
            }

            card.innerHTML = `
                <div class="card-num">LEVEL ${lvl.id}</div>
                <div class="card-title">${lvl.title}</div>
                <div class="card-stars">${isUnlocked ? (best ? stars : 'UNPLAYED') : '🔒 LOCKED'}</div>
                ${best ? `<div class="card-best">Best: ${best} moves</div>` : ''}
            `;

            if (isUnlocked) {
                card.addEventListener('click', () => {
                    hideAllModals();
                    document.getElementById('screen-menu').classList.add('hidden');
                    document.getElementById('screen-game').classList.remove('hidden');
                    requestAnimationFrame(() => {
                        engine.startLevel(idx);
                    });
                });
            }

            container.appendChild(card);
        });
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
