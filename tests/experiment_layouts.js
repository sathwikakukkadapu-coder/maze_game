// tests/experiment_layouts.js
const { solveLevel, simulateStep, DIRS } = require('./solver_prototype');

function test(ascii, name, description) {
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
        console.log(`\n[SUCCESS] ${name} (${res.moves} moves)`);
        console.log(`Description: ${description}`);
        console.log(`Solution: ${res.path.join(' -> ')}`);
        return true;
    } else {
        console.log(`[FAILED] ${name}`);
        return false;
    }
}

// 1. Level 1: Introduce the mechanic in a clear, small room with a dead-end pocket/alcove
test(`
#######
#.....#
#.P.E.#
#...###
#...#
#####
`, "Level 1 Variant A", "Small room with an alcove at the bottom");

test(`
#######
#.....#
#.#.#.#
#.P.E.#
#.#.###
#.#...#
#######
`, "Level 1 Variant B", "Columns");

// Simple dead-end hallway / corner
test(`
#######
#P...E#
###.###
  #.#  
  ###  
`, "Level 1 Variant C", "T-junction with pocket");

// Level 1: A 6x5 room with a 1-tile alcove at the right
test(`
########
#......#
#.P..E.#
#....###
#....#
######
`, "Level 1 Variant D", "Room with cul-de-sac at bottom right");

// What if the room is a 7x7 room with a dead-end corridor on the right?
test(`
#######
#.....#
#.P.E##
#....##
#..####
#######
`, "Level 1 Variant E", "Staircase wall");

// Let's test a simple 5x5 room! Can the player catch the exit in a simple 5x5 room?
test(`
#####
#...#
#P.E#
#...#
#####
`, "Simple 5x5 Room", "No internal walls");

// What about a 4x4 room?
test(`
####
#P.#
#.E#
####
`, "Simple 4x4 Room", "Tiny room");

// What about a 6x3 corridor?
test(`
########
#.P..E.#
########
`, "1D Corridor", "Single hallway");
