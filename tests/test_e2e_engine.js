// tests/test_e2e_engine.js
// End-to-End Simulation of GameEngine: Plays through all 10 levels, tests Undo, Restart, and Wall bumps

const assert = require('assert');

// Setup mock window & DOM environment
global.window = global;
global.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = v.toString(); }
};

// Mock minimal DOM elements
const mockElements = {};
global.document = {
    getElementById(id) {
        if (!mockElements[id]) {
            mockElements[id] = {
                textContent: '',
                innerHTML: '',
                classList: {
                    _classes: new Set(),
                    add(c) { this._classes.add(c); },
                    remove(c) { this._classes.delete(c); },
                    contains(c) { return this._classes.has(c); }
                },
                disabled: false
            };
        }
        return mockElements[id];
    },
    querySelectorAll() { return []; },
    addEventListener() {}
};

// Mock requestAnimationFrame
global.requestAnimationFrame = () => {};

// Load modules in order
require('../js/levels.js');
require('../js/ai.js');
require('../js/audio.js');

// Mock renderer
class MockRenderer {
    constructor() {
        this.playerRender = { x: 0, y: 0, facing: 'DOWN' };
        this.exitRender = { x: 0, y: 0 };
        this.speechBubble = null;
    }
    resize() {}
    calculateLayout() {}
    syncPositions(p, e) {
        this.playerRender.x = p.x;
        this.playerRender.y = p.y;
        this.exitRender.x = e.x;
        this.exitRender.y = e.y;
    }
    triggerPlayerBump() {}
    spawnDust() {}
    spawnVictoryConfetti() {}
    showSpeech(txt, type) { this.speechBubble = { text: txt, type }; }
    update() {}
    render() {}
}
global.GameRenderer = MockRenderer;

require('../js/engine.js');

console.log("=== RUNNING FULL END-TO-END ENGINE TESTS (10 LEVELS) ===");

const engine = new window.GameEngine();
engine.initRenderer({});

// 1. Test Wall Collision / Bump
{
    console.log("Test 1: Wall Collision & Bumping...");
    engine.startLevel(0); // Level 1: Player starts at (2, 2)
    assert.strictEqual(engine.player.x, 2);
    assert.strictEqual(engine.player.y, 2);
    assert.strictEqual(engine.movesCount, 0);

    // Try moving UP twice into top boundary / wall:
    engine.handlePlayerMove('UP'); // to (2, 1)
    assert.strictEqual(engine.player.y, 1);
    assert.strictEqual(engine.movesCount, 1);

    engine.handlePlayerMove('UP'); // (2, 0) is wall '#' -> blocked!
    assert.strictEqual(engine.player.y, 1, "Player should be blocked by wall");
    assert.strictEqual(engine.movesCount, 1, "Move count should NOT increment on wall bump");
    console.log(" -> PASS: Wall collision properly blocked move and prevented turn passage.");
}

// 2. Test Undo Functionality
{
    console.log("\nTest 2: Move History and Undo...");
    const canUndo = engine.undoMove();
    assert.strictEqual(canUndo, true, "Undo should succeed");
    assert.strictEqual(engine.player.y, 2, "Player should be back at y = 2");
    assert.strictEqual(engine.movesCount, 0, "Move count should be back to 0");

    const canUndoEmpty = engine.undoMove();
    assert.strictEqual(canUndoEmpty, false, "Undo on empty history should return false");
    console.log(" -> PASS: Undo successfully reverted player state and move count.");
}

// 3. Test Restart Level
{
    console.log("\nTest 3: Restart Level...");
    engine.handlePlayerMove('RIGHT');
    assert.strictEqual(engine.movesCount, 1);
    engine.restartLevel();
    assert.strictEqual(engine.player.x, 2);
    assert.strictEqual(engine.player.y, 2);
    assert.strictEqual(engine.movesCount, 0);
    assert.strictEqual(engine.history.length, 0);
    console.log(" -> PASS: Restart successfully restored initial state.");
}

// 4. Play through all 10 levels to completion using verified solution paths!
{
    console.log("\nTest 4: Play-through of all 10 levels using optimal solutions...");
    const levelSolutions = [
        ["RIGHT", "RIGHT", "RIGHT", "RIGHT", "DOWN"],
        ["RIGHT", "DOWN", "DOWN", "RIGHT", "RIGHT", "UP"],
        ["RIGHT", "DOWN", "DOWN", "RIGHT", "RIGHT", "UP", "UP", "RIGHT"],
        ["UP", "RIGHT", "RIGHT", "RIGHT", "RIGHT", "RIGHT", "DOWN", "DOWN"],
        ["RIGHT", "DOWN", "DOWN", "DOWN", "DOWN", "LEFT", "LEFT", "UP"],
        ["DOWN", "DOWN", "DOWN", "RIGHT", "RIGHT", "RIGHT", "UP", "UP", "UP", "UP"],
        ["UP", "RIGHT", "UP", "UP", "RIGHT", "DOWN", "RIGHT", "DOWN", "RIGHT", "RIGHT", "DOWN"],
        ["RIGHT", "RIGHT", "RIGHT", "UP", "LEFT", "LEFT", "DOWN", "DOWN", "DOWN", "DOWN"],
        ["RIGHT", "DOWN", "DOWN", "DOWN", "RIGHT", "RIGHT", "DOWN", "DOWN", "RIGHT", "RIGHT", "UP", "UP", "UP", "UP", "UP", "UP"],
        ["DOWN", "DOWN", "LEFT", "DOWN", "DOWN", "RIGHT", "RIGHT", "RIGHT", "RIGHT", "UP", "UP", "RIGHT", "RIGHT", "UP", "UP", "RIGHT", "RIGHT", "UP"]
    ];

    for (let i = 0; i < 10; i++) {
        engine.startLevel(i);
        const moves = levelSolutions[i];
        console.log(` Playing Level ${i + 1}: ${engine.currentLevel.title} (${moves.length} moves)...`);

        for (const dir of moves) {
            engine.handlePlayerMove(dir);
        }

        assert.strictEqual(engine.isWon, true, `Level ${i + 1} should be won!`);
        assert.strictEqual(engine.movesCount, moves.length, `Level ${i + 1} should complete in ${moves.length} moves`);
        assert.strictEqual(engine.unlockedLevels >= i + 1, true, `Level ${i + 1} progression unlock verified`);
        
        // Trigger modal for verification
        engine.showLevelClearModal();
        console.log(` -> Level ${i + 1} WON in ${engine.movesCount} moves! Stars: ${mockElements['clear-stars'].textContent}`);
    }

    engine.showVictoryModal();
    assert.strictEqual(mockElements['victory-levels-count'].textContent, "10 / 10");
    console.log(" -> PASS: All 10 levels successfully completed end-to-end!");
}

console.log("\n=================================================");
console.log("  ALL END-TO-END ENGINE TESTS PASSED! (10/10)    ");
console.log("=================================================");
