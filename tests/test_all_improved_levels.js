// tests/test_all_improved_levels.js
const { solveLevel } = require('./solver_prototype');

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

const improvedLevels = [
    // Level 1: Clean room with a corner pocket
    parse(`
########
#......#
#.P..E.#
#...##.#
########
`, 1, "The First Escape", "Tutorial: Corner Trap", "The exit is a coward! It flees from you. Chase it into the corner pocket!", 5),

    // Level 2: Dividing barrier
    parse(`
#######
#.....#
#.P.###
#...#E#
#.....#
#######
`, 2, "The Dividing Barrier", "Obstacle Navigation", "The barrier blocks both you and the door. Navigate around to box it in!", 6),

    // Level 3: Flanking maneuver
    parse(`
#######
#...#.#
#...#.#
#.P.#.E
#...#.#
#.....#
#######
`, 3, "The Flanking Maneuver", "Angle of Approach", "Chasing directly won't work. Loop around and approach from below to cut off its escape!", 8),

    // Level 4: Narrow pillars
    parse(`
#########
#.#...#.#
#.#.E.#.#
#...#...#
#.P...#.#
#########
`, 4, "Pillars of Hesitation", "Choke Points", "Use the columns as shields to limit where the coward can run.", 11),

    // Level 5: The Coward's Cage
    parse(`
###########
#.#.....#.#
#.#.P.#.#.#
#...#.#...#
#.#.#.#.#.#
#.#...E.#.#
#.#.###.#.#
#.........#
###########
`, 5, "The Coward's Cage", "The Master Trap", "A multi-step labyrinth. Plan your route carefully to seal its only escape route!", 16)
];

console.log("=== TESTING ALL IMPROVED LEVELS ===");
let allOk = true;
for (const lvl of improvedLevels) {
    const res = solveLevel(lvl);
    console.log(`\nLevel ${lvl.id}: ${lvl.title}`);
    console.log(`Grid: ${lvl.width}x${lvl.height}`);
    if (res.solved) {
        console.log(`[PASS] Solved in ${res.moves} moves!`);
        console.log(`Path: ${res.path.join(' -> ')}`);
    } else {
        console.log(`[FAIL] Unsolvable!`);
        allOk = false;
    }
}

console.log(`\nOverall Solvability: ${allOk ? 'ALL PASS' : 'FAIL'}`);
