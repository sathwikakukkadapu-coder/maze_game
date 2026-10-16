// tests/tune_grand_finale.js
const { solveLevel } = require('./solver_prototype');

function parse(ascii, name) {
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
    return { name, width, height, grid, playerStart, exitStart };
}

// Variations of Chamber of Reflexes / Grand Finale:
const candidates = [
    // Variation A: Chamber of Reflexes (11x6)
    parse(`
###########
#...#...#.#
#.P.#.E.#.#
#...#...#.#
#.###.###.#
#.........#
###########
`, "Chamber 11x6"),

    // Variation B: Slightly tighter bottom corridor
    parse(`
###########
#...#...#.#
#.P.#.E.#.#
#...#...#.#
#.###.###.#
#...#.....#
###########
`, "Chamber with bottom barrier"),

    // Variation C: Two-tier fortress
    parse(`
###########
#.#.....#.#
#.#.P.E.#.#
#...#.#...#
#.###.###.#
#...#.#...#
#.#.....#.#
###########
`, "Two-tier fortress"),

    // Variation D: Symmetrical Grand Maze
    parse(`
###########
#...#...#.#
#.P.###.E.#
#...#.#.#.#
#...#...#.#
#.###.###.#
#.........#
###########
`, "Symmetrical Grand Maze")
];

for (const c of candidates) {
    const res = solveLevel(c);
    console.log(`${c.name}: solved=${res.solved}, moves=${res.moves}`);
    if (res.solved) console.log(`  Path: ${res.path.join(' -> ')}`);
}
