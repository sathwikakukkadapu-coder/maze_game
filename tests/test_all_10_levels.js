// tests/test_all_10_levels.js
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

const levels10 = [
    // Level 1: Corner Trap
    parse(`
########
#......#
#.P..E.#
#...##.#
########
`, 1, "The First Escape", "Tutorial: Corner Trap", "The exit is a coward! It flees from you. Chase it into the corner pocket!", 5),

    // Level 2: Dividing Barrier
    parse(`
#######
#.....#
#.P.###
#...#E#
#.....#
#######
`, 2, "The Dividing Barrier", "Obstacle Navigation", "The barrier blocks both you and the door. Navigate around to box it in!", 6),

    // Level 3: Flanking Maneuver
    parse(`
#######
#...#.#
#...#.#
#.P.#.E
#...#.#
#.....#
#######
`, 3, "The Flanking Maneuver", "Angle of Approach", "Chasing directly won't work. Loop around and approach from below to cut off its escape!", 8),

    // Level 4: Pocket Corridor
    parse(`
#########
#.......#
#.P.###.#
#...#.#E#
#...#.###
#.......#
#########
`, 4, "The Pocket Corridor", "Branching Paths", "Use the upper hallway to force the coward into the sealed pocket.", 8),

    // Level 5: Serpentine S-Curve
    parse(`
#########
#.....#.#
#.P.#.#.#
#...#.#.#
###.#...#
#E#.#.###
#...#...#
#########
`, 5, "The Serpentine S-Curve", "Winding Corridors", "Corner the coward as it tries to back away through the S-bends.", 8),

    // Level 6: The Forked Pass
    parse(`
#########
#.#...#.#
#.#.P.#.#
#.#...#.#
#.##.##.#
#...E...#
#########
`, 6, "The Forked Pass", "Chamber Divide", "Push through the center gap to herd the coward into the right wing.", 10),

    // Level 7: Pillars of Hesitation
    parse(`
#########
#.#...#.#
#.#.E.#.#
#...#...#
#.P...#.#
#########
`, 7, "Pillars of Hesitation", "Choke Points", "Use the columns as shields to limit where the coward can run.", 11),

    // Level 8: The Triple Nook
    parse(`
#########
#.#...#.#
#.P.E.#.#
#.#.###.#
#.#...#.#
#.#.#.#.#
#########
`, 8, "The Triple Nook", "Multi-Nook Trap", "Don't let it slip back. Seal off its northern retreat to trap it down below.", 10),

    // Level 9: The Coward's Cage
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
`, 9, "The Coward's Cage", "Labyrinthine Trap", "A multi-step labyrinth. Plan your route carefully to seal its only escape route!", 16),

    // Level 10: The Coward's Citadel (Grand Finale)
    parse(`
###########
#...#...#.#
#.P.###.E.#
#...#.#.#.#
#...#...#.#
#.###.###.#
#.........#
###########
`, 10, "The Coward's Citadel", "Grand Finale", "The ultimate fortress of escapes. Outsmart the master coward once and for all!", 18)
];

console.log("=== VERIFYING ALL 10 HANDCRAFTED LEVELS ===");
let allPassed = true;
const solutions = [];

levels10.forEach((lvl) => {
    const res = solveLevel(lvl);
    console.log(`\n-----------------------------------------`);
    console.log(`Level ${lvl.id}: ${lvl.title} (${lvl.width}x${lvl.height})`);
    console.log(`Hint: "${lvl.hint}"`);
    if (res.solved) {
        console.log(`[PASS] SOLVED in ${res.moves} moves! (Par: ${lvl.parMoves})`);
        console.log(`Optimal Path: ${res.path.join(' -> ')}`);
        solutions.push({ id: lvl.id, moves: res.moves, path: res.path });
    } else {
        console.log(`[FAIL] UNSOLVABLE!`);
        allPassed = false;
    }
});

console.log(`\n=========================================`);
console.log(`ALL 10 LEVELS VERIFICATION: ${allPassed ? "100% SUCCESS (ALL 10 SOLVABLE)" : "FAILURE"}`);
console.log(JSON.stringify(solutions, null, 2));
