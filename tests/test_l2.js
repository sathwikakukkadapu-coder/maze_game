// tests/test_l2.js
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

// Option A: 5-line Sloped Nook
const l2A = parse(`
########
#......#
#.P..E##
#...####
########
`, "L2 A");

// Option B: A central partition that restricts movement
const l2B = parse(`
########
#......#
#.P.##E#
#...##.#
#......#
########
`, "L2 B");

// Option C: A corridor divider
const l2C = parse(`
#######
#.....#
#.P#E.#
#..#..#
#.....#
#######
`, "L2 C");

// Option D: L-shaped barrier
const l2D = parse(`
#######
#.....#
#.P.###
#...#E#
#.....#
#######
`, "L2 D");

for (const t of [l2A, l2B, l2C, l2D]) {
    const res = solveLevel(t);
    console.log(`${t.name}: solved=${res.solved}, moves=${res.moves}`);
    if (res.solved) console.log(`   Path: ${res.path.join(' -> ')}`);
}
