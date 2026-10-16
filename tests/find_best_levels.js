// tests/find_best_levels.js
const { solveLevel, simulateStep, DIRS } = require('./solver_prototype');

function evaluate(ascii, name, targetMinMoves, targetMaxMoves) {
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

    const lvl = { name, width, height, grid, playerStart, exitStart };
    const res = solveLevel(lvl);
    if (res.solved) {
        console.log(`\n=== [PASS] ${name} ===`);
        console.log(`Moves: ${res.moves} (target: ${targetMinMoves}-${targetMaxMoves})`);
        console.log(`Path: ${res.path.join(' -> ')}`);
        return { ok: res.moves >= targetMinMoves && res.moves <= targetMaxMoves, moves: res.moves, path: res.path, lvl };
    } else {
        console.log(`\n=== [FAIL] ${name} (UNSOLVABLE) ===`);
        return { ok: false, moves: -1 };
    }
}

console.log("--- EVALUATING LEVEL 1 (Introduction: 4-6 moves) ---");
// L1 Candidate 1:
evaluate(`
#########
#.......#
#.P...E.#
#.......#
#########
`, "L1 Open Hall", 3, 6);

// L1 Candidate 2: Alcove at the right
evaluate(`
########
#......#
#.P..E.#
#......#
########
`, "L1 8x5 Open", 3, 6);

// L1 Candidate with alcove:
evaluate(`
#######
#.....#
#.P.E.#
#...###
#...#
#####
`, "L1 Alcove A", 3, 6);

// L1 Candidate: Simple room where right wall has a recessed exit nook
evaluate(`
########
#......#
#.P..E.#
#......#
#..#####
###
`, "L1 with boundary", 3, 6);

// L1: Room with narrow nook
evaluate(`
#######
#.....#
#..E..#
#.P...#
#######
`, "L1 Vertical", 3, 6);

// L1 with side walls framing the room:
evaluate(`
#######
###...#
#.P.E.#
###...#
#######
`, "L1 Funnel", 3, 6);

// L1 Corner Pocket:
evaluate(`
#######
#.....#
#.P.E.#
#...#.#
#...#.#
#####.#
    ###
`, "L1 Pocket", 3, 8);
