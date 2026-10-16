// tests/test_game_logic.js
const assert = require('assert');
const { getDistanceSq, getExitNextPos, simulateStep, solveLevel, DIRS } = require('./solver_prototype');

console.log("=== RUNNING GAME LOGIC UNIT TESTS ===");

// 1. Distance Calculation Test
{
    const d1 = getDistanceSq(0, 0, 3, 4);
    assert.strictEqual(d1, 25, "Distance squared between (0,0) and (3,4) should be 25");
    console.log("[PASS] Distance calculation test");
}

// 2. Collision Detection Test (Player blocked by wall)
{
    const grid = [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1]
    ];
    // Player is at (1, 1), completely surrounded by walls
    const state = { px: 1, py: 1, ex: 2, ey: 2 };
    const upDir = DIRS.find(d => d.name === 'UP');
    const nextState = simulateStep(state, upDir, grid, 3, 3);
    assert.strictEqual(nextState.valid, false, "Moving into wall should return invalid");
    assert.strictEqual(nextState.px, 1, "Player position must not change on bump");
    console.log("[PASS] Player wall collision test");
}

// 3. Exit Escape Algorithm Test
{
    // 5x5 grid with no internal walls
    const grid = Array(5).fill(null).map(() => Array(5).fill(0));
    // Player at (1, 2), Exit at (2, 2)
    // Current distSq is 1.
    // Neighbors: (3, 2) has distSq 4. (2, 1) has 2. (2, 3) has 2. (1, 2) is player.
    // Exit MUST choose Right (3, 2) because 4 is the maximum distance!
    const nextPos = getExitNextPos(1, 2, 2, 2, grid, 5, 5);
    assert.strictEqual(nextPos.x, 3, "Exit should move Right to (3, 2)");
    assert.strictEqual(nextPos.y, 2, "Exit y should remain 2");
    assert.strictEqual(nextPos.moved, true, "Exit should move");
    assert.strictEqual(nextPos.trapped, false, "Exit should not be trapped");
    console.log("[PASS] Exit escape path maximization test");
}

// 4. Exit Trapped Test
{
    // Corner: Exit at (1, 1) surrounded by walls at (0, 1), (1, 0)
    const grid = [
        [1, 1, 1],
        [1, 0, 0],
        [1, 0, 0]
    ];
    // If player is at (2, 2):
    // Dist from (1, 1) to (2, 2) is 2.
    // Valid neighbors of (1, 1) are (2, 1) and (1, 2):
    // Dist from (2, 1) to (2, 2) is 1 < 2.
    // Dist from (1, 2) to (2, 2) is 1 < 2.
    // Neither neighbor strictly increases distance!
    // Exit MUST be trapped and stay in place!
    const nextPos = getExitNextPos(2, 2, 1, 1, grid, 3, 3);
    assert.strictEqual(nextPos.trapped, true, "Exit should be trapped");
    assert.strictEqual(nextPos.moved, false, "Exit should not move when trapped");
    assert.strictEqual(nextPos.x, 1, "Exit x should stay 1");
    assert.strictEqual(nextPos.y, 1, "Exit y should stay 1");
    console.log("[PASS] Exit trapped condition test");
}

// 5. Player Victory Test (Step onto Exit)
{
    const grid = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    // Player at (0, 1), Exit at (1, 1)
    const state = { px: 0, py: 1, ex: 1, ey: 1 };
    const rightDir = DIRS.find(d => d.name === 'RIGHT');
    const nextState = simulateStep(state, rightDir, grid, 3, 3);
    assert.strictEqual(nextState.won, true, "Stepping on exit must trigger won = true");
    assert.strictEqual(nextState.px, 1, "Player should be at (1, 1)");
    assert.strictEqual(nextState.py, 1, "Player should be at (1, 1)");
    console.log("[PASS] Player victory condition test");
}

// 6. Deterministic Tie-Breaking Test
{
    // Player at (2, 2). Exit at (4, 4).
    // Neighbors of (4, 4):
    // (5, 4): distSq to (2, 2) is 3^2 + 2^2 = 13. (Dir: RIGHT)
    // (4, 5): distSq to (2, 2) is 2^2 + 3^2 = 13. (Dir: DOWN)
    // Both (5, 4) and (4, 5) tie for maximum distance (13)!
    // Priority order: RIGHT before DOWN.
    const grid = Array(6).fill(null).map(() => Array(6).fill(0));
    const nextPos = getExitNextPos(2, 2, 4, 4, grid, 6, 6);
    assert.strictEqual(nextPos.x, 5, "Deterministic tie-breaking should pick (5, 4) [RIGHT]");
    assert.strictEqual(nextPos.y, 4, "y should be 4");
    console.log("[PASS] Deterministic tie-breaking test");
}

console.log("\nALL GAME LOGIC UNIT TESTS PASSED SUCCESSFULLY!");
