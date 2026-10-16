// js/ai.js
// The Living Exit Decision Algorithm & Taunt System

(function(window) {
    'use strict';

    function getDistanceSq(x1, y1, x2, y2) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return dx * dx + dy * dy;
    }

    const DIRS = [
        { name: 'UP', dx: 0, dy: -1 },
        { name: 'RIGHT', dx: 1, dy: 0 },
        { name: 'DOWN', dx: 0, dy: 1 },
        { name: 'LEFT', dx: -1, dy: 0 }
    ];

    const FLEE_MESSAGES = [
        "TOO SLOW!",
        "NOPE!",
        "CATCH ME!",
        "ZOOM!",
        "TOO CLOSE!",
        "NOT TODAY!",
        "BYE BYE!",
        "YOU THOUGHT!",
        "MISSED ME!",
        "EASY PEASY!"
    ];

    const TRAPPED_MESSAGES = [
        "WAIT NO!",
        "A CORNER?!",
        "I'M TRAPPED!",
        "DON'T TOUCH ME!",
        "HAVE MERCY!",
        "UH OH...",
        "NO ESCAPE!",
        "STAY BACK!"
    ];

    const CAUGHT_MESSAGES = [
        "NOOOOO!",
        "YOU GOT ME!",
        "FOILED!",
        "HOW DID YOU...?!",
        "I SURRENDER!"
    ];

    let fleeMsgIdx = 0;
    let trappedMsgIdx = 0;
    let caughtMsgIdx = 0;

    function getNextMessage(type) {
        if (type === 'flee') {
            const msg = FLEE_MESSAGES[fleeMsgIdx % FLEE_MESSAGES.length];
            fleeMsgIdx++;
            return msg;
        } else if (type === 'trapped') {
            const msg = TRAPPED_MESSAGES[trappedMsgIdx % TRAPPED_MESSAGES.length];
            trappedMsgIdx++;
            return msg;
        } else if (type === 'caught') {
            const msg = CAUGHT_MESSAGES[caughtMsgIdx % CAUGHT_MESSAGES.length];
            caughtMsgIdx++;
            return msg;
        }
        return "";
    }

    /**
     * Determines the Exit's next move based on current game state.
     * 
     * Algorithm Rules:
     * 1. Check all 4 neighboring cardinal cells.
     * 2. Exclude cells that are out of bounds, are walls, or contain the player.
     * 3. Evaluate Euclidean distance squared from each legal candidate to player.
     * 4. Candidate must strictly increase distance: distSq > currentDistSq.
     * 5. If multiple candidates tie for maximum distance, resolve ties deterministically:
     *    Order: RIGHT, DOWN, LEFT, UP.
     * 6. If no candidate strictly increases distance, the Exit stays in place (trapped).
     */
    function getExitNextMove(px, py, ex, ey, grid, width, height) {
        const currentDistSq = getDistanceSq(ex, ey, px, py);
        let bestDistSq = currentDistSq;
        let candidates = [];

        for (const dir of DIRS) {
            const nx = ex + dir.dx;
            const ny = ey + dir.dy;

            // In bounds check
            if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
            // Wall check
            if (grid[ny][nx] === 1) continue;
            // Player's new position check (Exit will never move into the player)
            if (nx === px && ny === py) continue;

            const dSq = getDistanceSq(nx, ny, px, py);
            if (dSq > currentDistSq) {
                if (dSq > bestDistSq) {
                    bestDistSq = dSq;
                    candidates = [{ x: nx, y: ny, dir: dir.name }];
                } else if (dSq === bestDistSq) {
                    candidates.push({ x: nx, y: ny, dir: dir.name });
                }
            }
        }

        if (candidates.length === 0) {
            // Trapped! Cannot increase distance.
            return {
                x: ex,
                y: ey,
                moved: false,
                trapped: true,
                message: getNextMessage('trapped')
            };
        }

        // Deterministic tie-breaker
        const priority = ['RIGHT', 'DOWN', 'LEFT', 'UP'];
        candidates.sort((a, b) => priority.indexOf(a.dir) - priority.indexOf(b.dir));

        const chosen = candidates[0];
        return {
            x: chosen.x,
            y: chosen.y,
            moved: true,
            trapped: false,
            dir: chosen.dir,
            message: getNextMessage('flee')
        };
    }

    window.GameAI = {
        getDistanceSq,
        getExitNextMove,
        getNextMessage,
        DIRS
    };

})(typeof window !== 'undefined' ? window : global);
