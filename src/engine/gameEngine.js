/**
 * KarmaCrunch: Master Game Engine (1-100 Levels & Points System)
 * Built by Eshwar Karthik, Prashanth, and Rupesh Kumar
 */

import { RetroSoundEngine } from './soundEngine.js';
import { calculateXpForLevel, getTierForLevel, generateBossForLevel, MILESTONE_PERKS } from '../data/levelsData.js';
import { ANIMAL_ROLES } from '../data/animalRoles.js';

export class GameEngine {
  constructor() {
    this.sound = new RetroSoundEngine();
    this.points = 1420;
    this.level = 1;
    this.xp = 0;
    this.combo = 0;
    this.comboTimer = null;
    this.currentRole = ANIMAL_ROLES[0]; // Default Wholesome Doge
    this.boss = generateBossForLevel(1);
    this.playerHp = this.currentRole.baseStats.hp;
    this.playerShield = 0;
    this.playerHeat = 20;

    this.onStateChange = null;
    this.onLevelUp = null;
    this.onBossDefeated = null;
  }

  init() {
    this.sound.init();
    this.updateRole(this.currentRole.id);
  }

  updateRole(roleId) {
    const found = ANIMAL_ROLES.find(r => r.id === roleId);
    if (found) {
      this.currentRole = found;
      this.playerHp = found.baseStats.hp;
      this.triggerState();
    }
  }

  addPoints(amount) {
    this.sound.upvote();
    this.combo++;
    clearTimeout(this.comboTimer);
    this.comboTimer = setTimeout(() => {
      this.combo = 0;
      this.triggerState();
    }, 3500);

    const multiplier = 1 + Math.min(5, Math.floor(this.combo / 4) * 0.5);
    const earned = Math.floor(amount * multiplier);
    this.points += earned;
    this.addXp(Math.max(1, Math.floor(earned * 0.4)));

    return { earned, combo: this.combo, multiplier };
  }

  spendPoints(amount) {
    if (this.points >= amount) {
      this.points -= amount;
      this.triggerState();
      return true;
    }
    // Grant beginner family emergency stipend if points run out
    this.points = Math.max(150, this.points);
    this.triggerState();
    return true;
  }

  addXp(amount) {
    this.xp += amount;
    const requiredXp = calculateXpForLevel(this.level + 1);

    if (this.xp >= requiredXp && this.level < 100) {
      this.level++;
      this.sound.levelUp();
      const perk = MILESTONE_PERKS[this.level];

      if (this.onLevelUp) {
        this.onLevelUp(this.level, perk);
      }

      // Upgrade boss for current level
      this.boss = generateBossForLevel(this.level);
    }
    this.triggerState();
  }

  executeBattleMove(moveType) {
    if (this.boss.hp <= 0) return null;

    let dmg = 0;
    let shield = 0;
    let crit = false;
    let text = "";

    if (moveType === "strike") {
      dmg = this.currentRole.baseStats.attack + Math.floor(Math.random() * 8);
      crit = Math.random() < this.currentRole.baseStats.critChance;
      if (crit) {
        dmg = Math.floor(dmg * 2.2);
        this.sound.crit();
      } else {
        this.sound.hit();
      }
      this.playerHeat = Math.min(100, this.playerHeat + 25);
      text = `You landed an attack for ${dmg} damage!${crit ? " (CRITICAL HIT!)" : ""}`;
    } else if (moveType === "shield") {
      dmg = 10;
      shield = this.currentRole.baseStats.defense;
      this.playerShield += shield;
      this.sound.shield();
      text = `You raised a ${shield}-point Upvote Shield and dealt ${dmg} chip damage!`;
    } else if (moveType === "special") {
      const special = this.currentRole.specialMove;
      dmg = 35;
      crit = true;
      this.sound.award();
      this.playerHeat = Math.max(0, this.playerHeat - 40);
      text = `🌟 ${special.name}: ${special.desc}! (${dmg} DMG)`;
    }

    // Apply damage to boss
    let dealt = dmg;
    if (this.boss.shield > 0) {
      if (this.boss.shield >= dealt) {
        this.boss.shield -= dealt;
        dealt = 0;
      } else {
        dealt -= this.boss.shield;
        this.boss.shield = 0;
      }
    }
    this.boss.hp = Math.max(0, this.boss.hp - dealt);

    if (this.boss.hp <= 0) {
      this.sound.levelUp();
      this.addPoints(250 + this.level * 20);
      if (this.onBossDefeated) {
        this.onBossDefeated(this.boss, this.level);
      }
      // Advance to next boss
      if (this.level < 100) this.addXp(calculateXpForLevel(this.level + 1) - this.xp);
      this.boss = generateBossForLevel(this.level);
    }

    this.triggerState();
    return { text, dmg, crit, bossHp: this.boss.hp };
  }

  executeBossTurn() {
    if (this.boss.hp <= 0) return null;
    let dmg = this.boss.atk;
    let text = `${this.boss.name} ${this.boss.attackDesc}`;

    if (this.playerShield > 0) {
      if (this.playerShield >= dmg) {
        this.playerShield -= dmg;
        dmg = 0;
      } else {
        dmg -= this.playerShield;
        this.playerShield = 0;
      }
    }

    this.playerHp = Math.max(0, this.playerHp - dmg);
    this.sound.downvote();
    this.triggerState();
    return { text, dmg, playerHp: this.playerHp };
  }

  triggerState() {
    if (this.onStateChange) {
      const tier = getTierForLevel(this.level);
      const nextXp = calculateXpForLevel(this.level + 1);
      const currentLevelBaseXp = calculateXpForLevel(this.level);
      const progressPercent = Math.min(100, Math.max(0, Math.floor(((this.xp - currentLevelBaseXp) / Math.max(1, nextXp - currentLevelBaseXp)) * 100)));

      this.onStateChange({
        points: this.points,
        level: this.level,
        xp: this.xp,
        nextXp,
        progressPercent,
        tier,
        role: this.currentRole,
        boss: this.boss,
        playerHp: this.playerHp,
        playerShield: this.playerShield,
        playerHeat: this.playerHeat,
        combo: this.combo
      });
    }
  }
}
