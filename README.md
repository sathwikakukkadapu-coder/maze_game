# THE EXIT IS A COWARD 🚪💨

> *"You enter a room and must reach the glowing exit door. The twist: the exit is alive, terrified of you, and actively tries to escape."*

**The Exit is a Coward** is a complete, polished, handcrafted 2D indie puzzle game built for the overnight hackathon. Built using vanilla JavaScript, HTML5 Canvas, and procedural Web Audio, it features an original cat-and-mouse puzzle mechanic where players must stop chasing the door blindly and use walls, corners, and choke points to corner and trap it.

---

## 🎮 Playable Demo & Quick Start

The game runs 100% locally and completely offline with **zero external dependencies**.

### Option A: Local Web Server (Running in Background)
```bash
# The built-in zero-dependency HTTP server is active:
# Open in your browser:
http://localhost:8080/
```

### Option B: Direct Browser Launch
Simply double-click or open `index.html` directly in any modern browser (Chrome, Edge, Firefox, Safari).

---

## 🕹 Controls

| Action | Keyboard | Touch / Mouse |
| :--- | :--- | :--- |
| **Move Player** | `W`, `A`, `S`, `D` or Arrow Keys | Click/tap any tile towards your goal, swipe, or use on-screen D-Pad |
| **Undo Move** | `Z` or `U` | Click `↩` button in HUD |
| **Restart Level** | `R` | Click `🔄` button in HUD |
| **Pause / Resume** | `P` or `Escape` | Click `⏸` button in HUD |
| **Toggle Audio** | `M` | Click `🔊` / `🔇` button in HUD or Menu |

---

## 🧠 The Core Mechanic & Escaping-Door Algorithm

The exit door (*"Door-y"*) is not an inanimate portal—it is an intelligent, cowardly agent that flees from the player according to clear, deterministic rules:

### 1. Step-by-Step Turn Lifecycle
1. **Player Move**: The player selects a direction ($U, R, D, L$).
   - If the target cell is a wall or boundary, movement is rejected, a bump effect occurs, and the turn does not advance.
2. **Win Condition Check**: Did the player step directly onto the exit's current tile?
   - **Yes**: The exit is caught! Level complete fanfare plays, and victory confetti erupts.
   - **No**: The Exit immediately calculates its best escape response.
3. **Exit Neighbor Evaluation**:
   - The exit evaluates all 4 orthogonal neighboring cells: $(ex \pm 1, ey)$ and $(ex, ey \pm 1)$.
   - A candidate cell is **legal** if:
     - It lies within room boundaries ($0 \le x < W, 0 \le y < H$).
     - It is NOT a solid wall (`#`).
     - It is NOT the player's new position (the exit will never run into the player).
4. **Distance Maximization**:
   - For every legal neighbor $N$, the exit calculates its Euclidean distance squared to the player:
     $$D(N, P) = (N_x - P_x)^2 + (N_y - P_y)^2$$
   - A move is only considered an "escape" if it strictly increases distance: $D(N, P) > D_{current}$.
5. **Deterministic Tie-Breaking**:
   - If multiple candidate tiles tie for the maximum distance, ties are resolved deterministically using a fixed cardinal priority:
     $$\text{RIGHT} \succ \text{DOWN} \succ \text{LEFT} \succ \text{UP}$$
   - This ensures the exit's behavior is 100% reproducible and predictable—crucial for a fair puzzle game.
6. **The Trapped State**:
   - If no legal neighbor strictly increases distance, the exit **stays in place**.
   - It enters a **PANIC** state: trembling animation, sweat droplets, fear-filled comic dialogue bubbles (*"WAIT NO!"*, *"I'M TRAPPED!"*, *"HAVE MERCY!"*), and nervous sound synthesis.
   - Once trapped, the player can step onto the exit on their next move to win!

---

## 🗺 10 Handcrafted Levels & Solvability Proof

The game features ten handcrafted puzzle rooms with smoothly increasing difficulty. Every level has been verified through an automated Breadth-First Search (BFS) state solver to guarantee **100% solvability**:

| Level | Title | Theme & Concept | Par Moves | Verified Optimal Solution |
| :---: | :--- | :--- | :---: | :--- |
| **1** | **The First Escape** | *Tutorial / Corner Trap*: Introduces the fleeing door and corner pocket dead-end. | 5 | `R ➔ R ➔ R ➔ R ➔ D` |
| **2** | **The Dividing Barrier** | *Obstacle Navigation*: An L-barrier stops the exit from slipping past. Flank to box it in. | 6 | `R ➔ D ➔ D ➔ R ➔ R ➔ U` |
| **3** | **The Flanking Maneuver** | *Angle of Approach*: Direct chasing fails. Loop around from below to herd it into a nook. | 8 | `R ➔ D ➔ D ➔ R ➔ R ➔ U ➔ U ➔ R` |
| **4** | **The Pocket Corridor** | *Branching Paths*: Use the upper hallway to force the coward into the sealed pocket. | 8 | `U ➔ R ➔ R ➔ R ➔ R ➔ R ➔ D ➔ D` |
| **5** | **The Serpentine S-Curve** | *Winding Corridors*: Corner the coward as it tries to back away through the S-bends. | 8 | `R ➔ D ➔ D ➔ D ➔ D ➔ L ➔ L ➔ U` |
| **6** | **The Forked Pass** | *Chamber Divide*: Push through the center gap to herd the coward into the right wing. | 10 | `D ➔ D ➔ D ➔ R ➔ R ➔ R ➔ U ➔ U ➔ U ➔ U` |
| **7** | **Pillars of Hesitation** | *Choke Points*: Multiple column obstacles funnel the exit into narrow corridors. | 11 | `U ➔ R ➔ U ➔ U ➔ R ➔ D ➔ R ➔ D ➔ R ➔ R ➔ D` |
| **8** | **The Triple Nook** | *Multi-Nook Trap*: Seal off the door's northern retreat to trap it down below. | 10 | `R ➔ R ➔ R ➔ U ➔ L ➔ L ➔ D ➔ D ➔ D ➔ D` |
| **9** | **The Coward's Cage** | *Labyrinthine Trap*: An interlocking multi-corridor labyrinth requiring multi-step planning. | 16 | `R ➔ D ➔ D ➔ D ➔ R ➔ R ➔ D ➔ D ➔ R ➔ R ➔ U ➔ U ➔ U ➔ U ➔ U ➔ U` |
| **10** | **The Coward's Citadel** | *Grand Finale*: The ultimate fortress of escapes. Outsmart the master coward! | 18 | `D ➔ D ➔ L ➔ D ➔ D ➔ R ➔ R ➔ R ➔ R ➔ U ➔ U ➔ R ➔ R ➔ U ➔ U ➔ R ➔ R ➔ U` |

---

## 🤖 Meaningful AI-Assisted Development

As emphasized in the hackathon criteria, AI was used systematically across development:

1. **Algorithm Co-Design**:
   - Evaluated distance metrics (Manhattan vs. Euclidean). Discovered that Manhattan distance caused unintended perpendicular sliding along straight walls; Euclidean distance squared produced intuitive straight-line flight behavior.
   - Designed deterministic tie-breaking rules so the puzzle mechanics act as a pure, reproducible Markovian state machine.
2. **Level Generation & Pruning**:
   - Built a BFS graph solver (`tests/solver_prototype.js`) exploring the state space $S = (P_x, P_y, E_x, E_y)$.
   - Tested candidate layouts. Pruned layouts that allowed infinite looping, and refined geometry to guarantee clear eureka moments.
3. **Automated QA & Verification Suite**:
   - Created three automated test suites (`tests/run_all_tests.js`):
     - **Suite 1**: Core game logic, wall collision, distance calculation, exit trapped states, tie-breakers.
     - **Suite 2**: Level solvability proof proving all 10 levels are mathematically solvable.
     - **Suite 3**: Full end-to-end game engine simulation including undo stacks, restart, and star scoring.

### Running the Automated Tests
```bash
node tests/run_all_tests.js
```

---

## 🎨 Visual Design & "Game Juice"

- **Indie Cyberpunk Palette**: Midnight purple background (`#05040d` to `#161233`), glowing cyan (`#00f0ff`) player accents, and radiant golden-magenta exit portal.
- **Expressive Living Exit**:
  - Animated cartoon eyes that look back at the player in real-time based on their relative angle.
  - Little running legs that scamper and wobble when moving.
  - Panic trembling, dilated pupils, and sweat drops when trapped.
  - Dynamic speech bubbles displaying over 20 situation-aware comic reactions.
- **High-Contrast Board Geometry**:
  - Distinct 3D cyber-stone walls with glowing neon bevels and center emblems.
  - Dark sleek floor tiles with glowing grid borders.
- **Juice & Polish**:
  - 60 FPS HTML5 Canvas renderer with smooth linear interpolation (lerp).
  - Dust puff particles on steps and wall bumps.
  - Confetti and sparkle fountain bursts upon level victory.
  - Ambient floating cyber-dust in the background.

---

## 🔊 Procedural Web Audio API Sound System

To ensure the game is 100% offline and requires zero external asset downloads, all audio is procedurally synthesized using the native **Web Audio API**:
- **Player Footstep**: Crisp triangle-wave tap blip.
- **Exit Scamper**: Playful upward frequency sweep (slide-whistle effect).
- **Exit Trapped**: Nervous, shivering high-frequency stutter.
- **Wall Bump**: Dampened low-frequency thud.
- **Level Win**: Ascending major arpeggio ($C_5 \rightarrow E_5 \rightarrow G_5 \rightarrow C_6$).
- **Game Victory**: Triumphant harmonic multi-voice celebration.
- **Undo / Restart**: Reverse sweep blips.
- **Mute Toggle**: Persistent sound toggle saved to `localStorage`.

---

## 📁 Project Architecture

```
tech_duo/
├── index.html              # Main game HTML, HUD, screens, and modals
├── style.css               # Midnight cyberpunk theme, glassmorphism, responsive CSS
├── server.js               # Zero-dependency local static web server
├── README.md               # Hackathon presentation & technical documentation
├── js/
│   ├── levels.js           # 10 Handcrafted level grids & metadata
│   ├── ai.js               # Living Exit escape algorithm & taunt dialogue system
│   ├── audio.js            # Procedural Web Audio API sound synthesizer
│   ├── renderer.js         # Canvas 60 FPS engine, sprites, particles, animations
│   ├── engine.js           # State machine, history stack (Undo), scoring, loop
│   └── game.js             # Event listeners, input handling, UI bindings
└── tests/
    ├── run_all_tests.js    # Master QA test runner executing all suites
    ├── test_game_logic.js  # Unit tests for collision, distance, and AI rules
    ├── craft_all_levels.js # BFS solver proving 100% solvability for all 10 levels
    ├── test_e2e_engine.js  # End-to-end engine simulation (plays all 10 levels)
    └── solver_prototype.js # Reusable BFS puzzle solver module
```

---

## 🏆 Hackathon Quality Assurance Checklist

- [x] Launches without errors (offline, zero external dependencies).
- [x] Main menu with Play, How to Play, Level Select, and Sound toggle.
- [x] Triple controls: Keyboard (Arrows/WASD) + Touch D-Pad + Direct Tile/Swipe clicking.
- [x] Collision detection prevents walking through walls.
- [x] Living Exit maximizes distance and respects obstacles.
- [x] Exit never occupies illegal tiles or walks into the player.
- [x] All 10 levels mathematically verified solvable via BFS.
- [x] Level progression and high score tracking with star ratings.
- [x] Full Undo (`Z`/`U`) and Restart (`R`) functionality.
- [x] Pause and Resume (`P`/`Esc`).
- [x] Complete victory screen after Level 10.
- [x] Responsive layout adapting to desktop and mobile viewports.
- [x] Procedural sound effects with working mute toggle.
