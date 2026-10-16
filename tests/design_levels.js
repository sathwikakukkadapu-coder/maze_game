// tests/design_levels.js
const { solveLevel, simulateStep, DIRS } = require('./solver_prototype');

// Helper to parse ASCII map
// '#' = wall, '.' = floor, 'P' = player, 'E' = exit
function parseMap(asciiMap, name, hint = '') {
    const lines = asciiMap.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const height = lines.length;
    const width = lines[0].length;
    const grid = [];
    let playerStart = null;
    let exitStart = null;

    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const ch = lines[y][x];
            if (ch === '#') {
                row.push(1);
            } else {
                row.push(0);
                if (ch === 'P') playerStart = { x, y };
                if (ch === 'E') exitStart = { x, y };
            }
        }
        grid.push(row);
    }

    if (!playerStart || !exitStart) {
        throw new Error(`Map ${name} must define both P and E!`);
    }

    return { name, hint, width, height, grid, playerStart, exitStart, ascii: lines };
}

// Candidate levels
const candidateLevels = [
    // Level 1: Simple introduction - cornering the coward in a small room with an alcove
    parseMap(`
#######
#.....#
#.P.E.#
#...#.#
#...#.#
#.....#
#######
`, "Level 1: The First Corner", "Don't just chase blindly—herd the coward into a dead end!"),

    // Level 2: The Divider - flanking around a dividing wall
    parseMap(`
#########
#.......#
#.P.###.#
#...#E#.#
#...#.#.#
#...#...#
#.......#
#########
`, "Level 2: The Divider", "The door can't see around corners. Cut off its escape path!"),

    // Level 3: The Cul-de-Sac - approach from the right side so it flees into the pocket
    parseMap(`
#########
#...#...#
#.P.#...#
#...#E#.#
###.#.#.#
#...#...#
#.......#
#########
`, "Level 3: The Cul-de-Sac", "Approach from the side so it runs directly into the trap."),

    // Level 4: The Pillars - narrow choke points
    parseMap(`
###########
#.........#
#.P.#.#.E.#
#...#.#...#
#...#.#...#
#.........#
###########
`, "Level 4: Pillars of Panic", "Use the columns as obstacles to limit where it can flee."),

    // Level 5: The Grand Heist - complex maze room requiring multi-step planning
    parseMap(`
###########
#.#.....#.#
#.#.P.#.#.#
#...#.#...#
#.#.#.#.#.#
#.#...E.#.#
#.#.###.#.#
#.........#
###########
`, "Level 5: The Coward's Cage", "Cornering the master of escape requires true strategic thinking.")
];

console.log("=== TESTING CANDIDATE LEVELS WITH BFS SOLVER ===");
candidateLevels.forEach((lvl, idx) => {
    console.log(`\nTesting ${lvl.name}...`);
    const result = solveLevel(lvl);
    if (result.solved) {
        console.log(`[PASS] Solved in ${result.moves} moves!`);
        console.log(`Solution path: ${result.path.join(' -> ')}`);
    } else {
        console.log(`[FAIL] UNABLE TO SOLVE!`);
    }
});
