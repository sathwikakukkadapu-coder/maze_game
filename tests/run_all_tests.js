// tests/run_all_tests.js
console.log("=================================================");
console.log("  THE EXIT IS A COWARD - MASTER QA TEST SUITE    ");
console.log("=================================================\n");

console.log(">>> SUITE 1: CORE GAME LOGIC & AI ALGORITHM <<<");
require('./test_game_logic.js');

console.log("\n-------------------------------------------------");
console.log(">>> SUITE 2: BFS LEVEL SOLVABILITY VERIFICATION <<<");
require('./craft_all_levels.js');

console.log("\n-------------------------------------------------");
console.log(">>> SUITE 3: END-TO-END ENGINE & GAMEPLAY <<<");
require('./test_e2e_engine.js');

console.log("\n=================================================");
console.log("  ALL QA TEST SUITES PASSED SUCCESSFULLY! (100%)  ");
console.log("=================================================");
