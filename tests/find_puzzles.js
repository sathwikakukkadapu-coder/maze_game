// tests/find_puzzles.js
const { solveLevel, DIRS } = require('./solver_prototype');

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

const tests = [
    // 1. Simple room with corner niche:
    parse(`
#######
#.....#
#.P.E.#
#####.#
    ###
`, "Corner Niche"),

    // 2. Room with wall dead end:
    parse(`
########
#......#
#.P..E##
#...####
########
`, "Sloped Nook"),

    // 3. Hallway with dead end:
    parse(`
#######
#P..E.#
#####.#
    #.#
    ###
`, "L-Corridor"),

    // 4. Room with pillar and dead end
    parse(`
#########
#.......#
#.P.#.E.#
#...#.#.#
#...#...#
#########
`, "Center Pillar"),

    // 5. Room with a pocket at top right:
    parse(`
#######
#...#.#
#...#.E
#.P.#.#
#.....#
#######
`, "Pocket Top"),

    // 6. U-Shape / Flanking:
    parse(`
#######
#P#...#
#.#.#.#
#.#.E.#
#.....#
#######
`, "Flanking U-Shape"),

    // 7. Divider room:
    parse(`
#########
#P......#
###.###.#
#...#.E.#
#.#.#.#.#
#.......#
#########
`, "Divider Room"),

    // 8. 5x5 with a corner wall:
    parse(`
######
#....#
#.PE.#
#..#.#
######
`, "5x5 with block"),

    // 9. Simple 6x6 with one block behind exit:
    parse(`
######
#....#
#.PE##
#....#
######
`, "Block Behind"),

    // 10. Corner box:
    parse(`
#######
#.....#
#.P.E.#
#...#.#
#####.#
    ###
`, "Corner Box")
];

for (const t of tests) {
    const res = solveLevel(t);
    if (res.solved) {
        console.log(`[PASS] ${t.name}: Solved in ${res.moves} moves!`);
        console.log(`   Path: ${res.path.join(' -> ')}`);
    } else {
        console.log(`[FAIL] ${t.name}`);
    }
}
