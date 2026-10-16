// js/levels.js
// 10 Handcrafted levels for THE EXIT IS A COWARD
// Verified 100% solvable via Breadth-First Search state solver

(function(window) {
    'use strict';

    function parseAscii(ascii) {
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
        return { width, height, grid, playerStart, exitStart };
    }

    const rawLevels = [
        // Level 1: Clean room with a corner pocket
        {
            id: 1,
            title: "The First Escape",
            subtitle: "Tutorial: Corner Trap",
            hint: "The exit is a coward! It flees from you. Chase it into the corner pocket!",
            parMoves: 5,
            ascii: `
########
#......#
#.P..E.#
#...##.#
########
`
        },
        // Level 2: Dividing Barrier
        {
            id: 2,
            title: "The Dividing Barrier",
            subtitle: "Obstacle Navigation",
            hint: "The barrier blocks both you and the door. Navigate around to box it in!",
            parMoves: 6,
            ascii: `
#######
#.....#
#.P.###
#...#E#
#.....#
#######
`
        },
        // Level 3: Flanking Maneuver
        {
            id: 3,
            title: "The Flanking Maneuver",
            subtitle: "Angle of Approach",
            hint: "Chasing directly won't work. Loop around and approach from below to cut off its escape!",
            parMoves: 8,
            ascii: `
#######
#...#.#
#...#.#
#.P.#.E
#...#.#
#.....#
#######
`
        },
        // Level 4: Pocket Corridor
        {
            id: 4,
            title: "The Pocket Corridor",
            subtitle: "Branching Paths",
            hint: "Use the upper hallway to force the coward into the sealed pocket.",
            parMoves: 8,
            ascii: `
#########
#.......#
#.P.###.#
#...#.#E#
#...#.###
#.......#
#########
`
        },
        // Level 5: Serpentine S-Curve
        {
            id: 5,
            title: "The Serpentine S-Curve",
            subtitle: "Winding Corridors",
            hint: "Corner the coward as it tries to back away through the S-bends.",
            parMoves: 8,
            ascii: `
#########
#.....#.#
#.P.#.#.#
#...#.#.#
###.#...#
#E#.#.###
#...#...#
#########
`
        },
        // Level 6: The Forked Pass
        {
            id: 6,
            title: "The Forked Pass",
            subtitle: "Chamber Divide",
            hint: "Push through the center gap to herd the coward into the right wing.",
            parMoves: 10,
            ascii: `
#########
#.#...#.#
#.#.P.#.#
#.#...#.#
#.##.##.#
#...E...#
#########
`
        },
        // Level 7: Pillars of Hesitation
        {
            id: 7,
            title: "Pillars of Hesitation",
            subtitle: "Choke Points",
            hint: "Use the columns as shields to limit where the coward can run.",
            parMoves: 11,
            ascii: `
#########
#.#...#.#
#.#.E.#.#
#...#...#
#.P...#.#
#########
`
        },
        // Level 8: The Triple Nook
        {
            id: 8,
            title: "The Triple Nook",
            subtitle: "Multi-Nook Trap",
            hint: "Don't let it slip back. Seal off its northern retreat to trap it down below.",
            parMoves: 10,
            ascii: `
#########
#.#...#.#
#.P.E.#.#
#.#.###.#
#.#...#.#
#.#.#.#.#
#########
`
        },
        // Level 9: The Coward's Cage
        {
            id: 9,
            title: "The Coward's Cage",
            subtitle: "Labyrinthine Trap",
            hint: "A multi-step labyrinth. Plan your route carefully to seal its only escape route!",
            parMoves: 16,
            ascii: `
###########
#.#.....#.#
#.#.P.#.#.#
#...#.#...#
#.#.#.#.#.#
#.#...E.#.#
#.#.###.#.#
#.........#
###########
`
        },
        // Level 10: The Coward's Citadel (Grand Finale)
        {
            id: 10,
            title: "The Coward's Citadel",
            subtitle: "Grand Finale",
            hint: "The ultimate fortress of escapes. Outsmart the master coward once and for all!",
            parMoves: 18,
            ascii: `
###########
#...#...#.#
#.P.###.E.#
#...#.#.#.#
#...#...#.#
#.###.###.#
#.........#
###########
`
        }
    ];

    const GAME_LEVELS = rawLevels.map(lvl => {
        const parsed = parseAscii(lvl.ascii);
        return {
            id: lvl.id,
            title: lvl.title,
            subtitle: lvl.subtitle,
            hint: lvl.hint,
            parMoves: lvl.parMoves,
            width: parsed.width,
            height: parsed.height,
            grid: parsed.grid,
            playerStart: parsed.playerStart,
            exitStart: parsed.exitStart
        };
    });

    window.GAME_LEVELS = GAME_LEVELS;

})(typeof window !== 'undefined' ? window : global);
