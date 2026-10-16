// tests/generate_puzzles.js
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

const candidateList = [
    // 1. The Pocket Corridor (Verified 8 moves)
    parse(`
#########
#.......#
#.P.###.#
#...#.#E#
#...#.###
#.......#
#########
`, "Pocket Corridor (8 moves)"),

    // 2. Serpentine S-Curve (Verified 8 moves)
    parse(`
#########
#.....#.#
#.P.#.#.#
#...#.#.#
###.#...#
#E#.#.###
#...#...#
#########
`, "Serpentine S-Curve (8 moves)"),

    // 3. Labyrinth Spiral:
    parse(`
###########
#.........#
#.#######.#
#.#.....#.#
#.#.###.#.#
#.#.#E#.#.#
#.#.#.#.#.#
#...P...#.#
###########
`, "Spiral Labyrinth"),

    // 4. Double Barrier with alcove:
    parse(`
###########
#.........#
#.P.###.E.#
#...#...#.#
#...#.#.#.#
#.....#...#
###########
`, "Double Barrier"),

    // 5. Cross Corridor:
    parse(`
#########
#...#...#
#...#...#
#.P#E#..#
#...#...#
#...#...#
#########
`, "Cross Corridor"),

    // 6. Staggered Pillars:
    parse(`
###########
#.........#
#.P.#.#.E.#
#...#.#.#.#
#.#...#.#.#
#.........#
###########
`, "Staggered Pillars"),

    // 7. Triple Nook:
    parse(`
#########
#.#...#.#
#.P.E.#.#
#.#.###.#
#.#...#.#
#.#.#.#.#
#########
`, "Triple Nook"),

    // 8. The Vault of Corners:
    parse(`
###########
#.#.....#.#
#...P.E...#
#.#.###.#.#
#...#.#...#
#.#.....#.#
###########
`, "Vault of Corners"),

    // 9. Chamber of Reflexes:
    parse(`
###########
#...#...#.#
#.P.#.E.#.#
#...#...#.#
#.###.###.#
#.........#
###########
`, "Chamber of Reflexes"),

    // 10. The Fork:
    parse(`
#########
#.#...#.#
#.#.P.#.#
#.#...#.#
#.##.##.#
#...E...#
#########
`, "The Fork"),

    // 11. Castle Moat:
    parse(`
###########
#.........#
#.#######.#
#.#.P.E.#.#
#.#.###.#.#
#.#...#.#.#
#.....#...#
###########
`, "Castle Moat"),

    // 12. Snake Path:
    parse(`
###########
#...#.....#
#.P.#.###.#
#...#...#.#
###.###.#.#
#E#.....#.#
###########
`, "Snake Path")
];

for (const c of candidateList) {
    const res = solveLevel(c);
    if (res.solved) {
        console.log(`[PASS] ${c.name} - Solved in ${res.moves} moves!`);
        console.log(`  Path: ${res.path.join(' -> ')}`);
    } else {
        console.log(`[FAIL] ${c.name}`);
    }
}
