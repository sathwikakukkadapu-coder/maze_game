// tests/design_new_levels.js
const { solveLevel, DIRS } = require('./solver_prototype');

function parse(ascii, id, title, subtitle, hint, parMoves) {
    const lines = ascii.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
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
    return { id, title, subtitle, hint, parMoves, width, height, grid, playerStart, exitStart, ascii: lines };
}

// Candidates for Level 6-10:
const candidates = [
    // Level 6: The T-Junction Gambit
    parse(`
#########
#...#...#
#.P.#.E.#
#...#...#
#####.###
    #.#
    ###
`, 6, "The T-Junction Gambit", "Branching Paths", "Herd the coward past the junction into the southern dead-end.", 0),

    // Level 6 Alt: Symmetrical T-Corridor
    parse(`
#########
#.......#
#.P.###.#
#...#E#.#
#...#.#.#
#...#...#
#.......#
#########
`, 6, "The T-Chamber", "Chamber", "", 0),

    // Level 6 Alt 2: Pocket corridor
    parse(`
#########
#.......#
#.P.###.#
#...#.#E#
#...#.###
#.......#
#########
`, 6, "The Pocket Corridor", "Pocket", "", 0),

    // Level 7: The Serpentine (S-Curve)
    parse(`
#########
#.....#.#
#.P.#.#.#
#...#.#.#
###.#...#
#E#.#.###
#...#...#
#########
`, 7, "The Serpentine Corridor", "S-Curve", "", 0),

    // Level 7 Alt: S-Hall
    parse(`
#########
#.......#
#.P.###.#
#...#...#
###.#.E.#
#...#...#
#.......#
#########
`, 7, "S-Hall", "S", "", 0),

    // Level 8: The Double Feint (Parallel corridors)
    parse(`
###########
#.........#
#.P.#.###.#
#...#.#E#.#
#...#.#.#.#
#...#.....#
###########
`, 8, "The Double Feint", "Parallel Feint", "", 0),

    // Level 9: Quad Pillars
    parse(`
###########
#...#.#...#
#.P.#.#.E.#
#.........#
###.###.###
#...#.#...#
#...#.#...#
###########
`, 9, "The Quad Citadel", "Citadel", "", 0),

    // Level 10: The Master Fortress
    parse(`
###########
#.#.....#.#
#...P.#...#
#.###.###.#
#.#.....#.#
#.#.###.#.#
#...#E#...#
#.#.###.#.#
#.........#
###########
`, 10, "The Coward's Citadel", "Grand Finale", "", 0)
];

console.log("=== TESTING CANDIDATES FOR LEVELS 6-10 ===");
for (const c of candidates) {
    const res = solveLevel(c);
    console.log(`\nTesting Candidate ${c.id}: ${c.title}`);
    console.log(`Grid: ${c.width}x${c.height}`);
    if (res.solved) {
        console.log(`[PASS] Solved in ${res.moves} moves!`);
        console.log(`Solution: ${res.path.join(' -> ')}`);
    } else {
        console.log(`[FAIL] Unsolvable`);
    }
}
