/**
 * KarmaCrunch Client Progression & Game Logic Tests
 * Built by Rupesh Kumar, Eshwar Kartik, and Prashant
 */

import assert from 'assert';
import { calculateXpForLevel, getTierForLevel, generateBossForLevel } from '../src/data/levelsData.js';
import { ANIMAL_ROLES } from '../src/data/animalRoles.js';

console.log("🧪 Running KarmaCrunch Game Logic Test Suite...\n");

// Test 1: Level XP Curve (1 to 100)
console.log("▶ Testing 1-100 XP progression curve...");
assert.strictEqual(calculateXpForLevel(1), 0, "Level 1 should require 0 XP");
const xpLvl2 = calculateXpForLevel(2);
const xpLvl10 = calculateXpForLevel(10);
const xpLvl50 = calculateXpForLevel(50);
const xpLvl100 = calculateXpForLevel(100);

assert(xpLvl2 > 0, "Level 2 XP must be greater than 0");
assert(xpLvl10 > xpLvl2, "Level 10 must require more XP than Level 2");
assert(xpLvl50 > xpLvl10, "Level 50 must require more XP than Level 10");
assert(xpLvl100 > xpLvl50, "Level 100 must require more XP than Level 50");
console.log(`   Level 1: 0 XP | Level 10: ${xpLvl10} XP | Level 50: ${xpLvl50} XP | Level 100: ${xpLvl100} XP`);
console.log("   ✅ XP curve scales smoothly up to Level 100.\n");

// Test 2: Tier bracket checks
console.log("▶ Testing Tier brackets...");
assert.strictEqual(getTierForLevel(5).bracket, "Levels 1-10");
assert.strictEqual(getTierForLevel(20).bracket, "Levels 11-25");
assert.strictEqual(getTierForLevel(40).bracket, "Levels 26-50");
assert.strictEqual(getTierForLevel(70).bracket, "Levels 51-75");
assert.strictEqual(getTierForLevel(95).bracket, "Levels 76-100");
console.log("   ✅ All level brackets (1-100) map correctly.\n");

// Test 3: Boss generator scaling
console.log("▶ Testing progressive boss scaling...");
const boss1 = generateBossForLevel(1);
const boss50 = generateBossForLevel(50);
const boss100 = generateBossForLevel(100);

assert(boss50.maxHp > boss1.maxHp, "Boss HP must scale with level");
assert(boss100.maxHp > boss50.maxHp, "Level 100 boss HP must exceed Level 50");
assert(boss100.atk > boss1.atk, "Boss attack must scale with level");
console.log(`   Lvl 1 Boss (${boss1.name}): HP=${boss1.maxHp}, ATK=${boss1.atk}`);
console.log(`   Lvl 50 Boss (${boss50.name}): HP=${boss50.maxHp}, ATK=${boss50.atk}`);
console.log(`   Lvl 100 Boss (${boss100.name}): HP=${boss100.maxHp}, ATK=${boss100.atk}`);
console.log("   ✅ Boss generation scales cleanly.\n");

// Test 4: Roles & Animal Archetypes
console.log("▶ Testing role balance & animal friendly archetypes...");
assert(ANIMAL_ROLES.length >= 5, "At least 5 distinct roles should be available");
const doge = ANIMAL_ROLES.find(r => r.id === "doge");
assert(doge !== undefined, "Wholesome Doge must exist");
assert(doge.baseStats.hp > 100, "Wholesome Doge should have high base HP");
console.log(`   Loaded ${ANIMAL_ROLES.length} roles. Default role: ${doge.name} (${doge.emoji})`);
console.log("   ✅ Animal friendly roles validated.\n");

console.log("🎉 ALL CLIENT TESTS PASSED SUCCESSFULLY! Ready for deployment.");
