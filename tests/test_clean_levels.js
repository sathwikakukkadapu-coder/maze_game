// tests/test_clean_levels.js
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

// Option 1: Current Level 1
const curL1 = parse(`
#######
#.....#
#.P.E.#
#####.#
#####.#
#######
`, "Current L1");

// Option 2: Symmetrical room with a dead-end corridor at the bottom right
const cleanL1 = parse(`
#######
#.....#
#.P.E.#
#...#.#
###.#.#
  ###.#
    ###
`, "Clean L1");

// Option 3: Rectangular room where an obstacle creates a corner pocket
const pocketL1 = parse(`
########
#......#
#.P..E.#
#...##.#
########
`, "Pocket L1");

// Option 4: A 7x5 room with a single pillar dividing the room
const pillarL1 = parse(`
#######
#.....#
#.P#E.#
#.....#
#######
`, "Pillar L1");

// Option 5: Corner alcove
const alcoveL1 = parse(`
########
#......#
#.P.E..#
#...####
########
`, "Alcove L1");

// Option 6: L-shaped room
const lShapedL1 = parse(`
######
#....#
#.PE.#
#..#.#
#..#.#
######
`, "L-Shaped L1");

for (const t of [curL1, pocketL1, alcoveL1, lShapedL1]) {
    const res = solveLevel(t);
    console.log(`${t.name}: solved=${res.solved}, moves=${res.moves}`);
    if (res.solved) console.log(`  Path: ${res.path.join(' -> ')}`);
}
