// tests/trace_level1.js
const { simulateStep, DIRS, getDistanceSq, getExitNextPos } = require('./solver_prototype');

const ascii = `
#######
#.....#
#.P.E.#
#...#.#
#...#.#
#.....#
#######
`;

const lines = ascii.trim().split('\n').map(l => l.trim());
const height = lines.length;
const width = lines[0].length;
const grid = lines.map(row => row.split('').map(c => c === '#' ? 1 : 0));

let state = { px: 2, py: 2, ex: 4, ey: 2 };

console.log("Initial state:", state);
const moves = ['RIGHT', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN'];
for (const m of moves) {
    const dir = DIRS.find(d => d.name === m);
    state = simulateStep(state, dir, grid, width, height);
    console.log(`After Player ${m}: P=(${state.px}, ${state.py}), E=(${state.ex}, ${state.ey}), trapped=${state.exitTrapped}, won=${state.won}`);
}
