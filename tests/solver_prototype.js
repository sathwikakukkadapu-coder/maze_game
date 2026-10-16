// tests/solver_prototype.js
// Prototype to verify Exit movement algorithm and level solvability

function getDistanceSq(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return dx * dx + dy * dy;
}

// Direction definitions: Up, Right, Down, Left
const DIRS = [
    { name: 'UP', dx: 0, dy: -1 },
    { name: 'RIGHT', dx: 1, dy: 0 },
    { name: 'DOWN', dx: 0, dy: 1 },
    { name: 'LEFT', dx: -1, dy: 0 }
];

/**
 * Calculates the Exit's next position given player pos and exit pos on a grid.
 * Rules:
 * 1. Checks legal neighbors (within bounds, not a wall, not the player's tile).
 * 2. Finds the neighbor that maximizes Euclidean distance squared to the player.
 * 3. A move is only valid if distSq(newPos, player) > distSq(currentPos, player).
 * 4. If multiple candidates tie for maximum distance, break ties deterministically.
 * 5. If no candidate strictly increases distance, the exit stays in place (trapped!).
 */
function getExitNextPos(px, py, ex, ey, grid, width, height) {
    const currentDistSq = getDistanceSq(ex, ey, px, py);
    let bestDistSq = currentDistSq;
    let candidates = [];

    // Check 4 neighbors
    for (const dir of DIRS) {
        const nx = ex + dir.dx;
        const ny = ey + dir.dy;

        // In bounds?
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        // Wall?
        if (grid[ny][nx] === 1) continue;
        // Player's tile? (Exit will not run into the player)
        if (nx === px && ny === py) continue;

        const dSq = getDistanceSq(nx, ny, px, py);
        if (dSq > currentDistSq) {
            if (dSq > bestDistSq) {
                bestDistSq = dSq;
                candidates = [{ x: nx, y: ny, dir: dir.name }];
            } else if (dSq === bestDistSq) {
                candidates.push({ x: nx, y: ny, dir: dir.name });
            }
        }
    }

    if (candidates.length === 0) {
        // Trapped! Cannot increase distance.
        return { x: ex, y: ey, moved: false, trapped: true };
    }

    // Deterministic tie-breaker:
    // Priority order: RIGHT, DOWN, LEFT, UP
    const priority = ['RIGHT', 'DOWN', 'LEFT', 'UP'];
    candidates.sort((a, b) => priority.indexOf(a.dir) - priority.indexOf(b.dir));

    return { x: candidates[0].x, y: candidates[0].y, moved: true, trapped: false, dir: candidates[0].dir };
}

/**
 * Simulates one player move.
 * Returns new state: { px, py, ex, ey, won, valid, exitTrapped }
 */
function simulateStep(state, playerDir, grid, width, height) {
    const nx = state.px + playerDir.dx;
    const ny = state.py + playerDir.dy;

    // Check wall or out of bounds
    if (nx < 0 || nx >= width || ny < 0 || ny >= height || grid[ny][nx] === 1) {
        return { ...state, valid: false };
    }

    // Check if player stepped directly onto exit
    if (nx === state.ex && ny === state.ey) {
        return { px: nx, py: ny, ex: state.ex, ey: state.ey, won: true, valid: true, exitTrapped: true };
    }

    // Exit moves
    const exitNext = getExitNextPos(nx, ny, state.ex, state.ey, grid, width, height);

    return {
        px: nx,
        py: ny,
        ex: exitNext.x,
        ey: exitNext.y,
        exitTrapped: exitNext.trapped,
        won: false,
        valid: true
    };
}

/**
 * BFS Solver: Finds the shortest sequence of player moves to win.
 */
function solveLevel(level) {
    const { width, height, grid, playerStart, exitStart } = level;
    const initialState = {
        px: playerStart.x,
        py: playerStart.y,
        ex: exitStart.x,
        ey: exitStart.y
    };

    const stateKey = (s) => `${s.px},${s.py}|${s.ex},${s.ey}`;
    const visited = new Set();
    visited.add(stateKey(initialState));

    // Queue contains: { state, path: [] }
    const queue = [{ state: initialState, path: [] }];

    while (queue.length > 0) {
        const { state, path } = queue.shift();

        for (const dir of DIRS) {
            const nextState = simulateStep(state, dir, grid, width, height);
            if (!nextState.valid) continue;

            const newPath = [...path, dir.name];

            if (nextState.won) {
                return { solved: true, moves: newPath.length, path: newPath };
            }

            const key = stateKey(nextState);
            if (!visited.has(key)) {
                visited.add(key);
                queue.push({ state: nextState, path: newPath });
            }
        }
    }

    return { solved: false, moves: -1, path: [] };
}

module.exports = { getDistanceSq, getExitNextPos, simulateStep, solveLevel, DIRS };
