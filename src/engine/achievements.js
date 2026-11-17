/**
 * KarmaCrunch: Quests & Achievements Engine
 * Built by Rupesh Kumar, Eshwar Kartik, and Prashant
 */

export const ACHIEVEMENTS_LIST = [
  { id: "first_upvote", name: "First Karma", desc: "Earn your first 50 Karma Points", reward: 100, icon: "▲", unlocked: true },
  { id: "runner_100m", name: "Subway Lurker", desc: "Survive 100 meters in 3D Karma Surfers", reward: 250, icon: "🏃", unlocked: false },
  { id: "dodge_spikes", name: "Downvote Deflector", desc: "Dodge or jump over 15 Downvote Spikes", reward: 300, icon: "🛡️", unlocked: false },
  { id: "gold_rush", name: "Reddit Gold Hunter", desc: "Collect 25 Reddit Gold coins in 3D runner", reward: 500, icon: "🌟", unlocked: false },
  { id: "level_10", name: "Meme Apprentice", desc: "Clear Level 10 and enter Tier 2", reward: 750, icon: "📈", unlocked: false },
  { id: "boss_slayer", name: "AutoMod Tamer", desc: "Defeat a boss in the Karma Arena", reward: 1000, icon: "⚔️", unlocked: false },
  { id: "agent_chat", name: "Curious Redditor", desc: "Ask the Reddit AI Agent 3 questions", reward: 200, icon: "🤖", unlocked: false },
  { id: "level_50", name: "Frontpage Hero", desc: "Ascend to Level 50", reward: 2500, icon: "🏆", unlocked: false },
  { id: "level_100", name: "Century Club Deity", desc: "Conquer Level 100 and reach Reddit Ascension", reward: 10000, icon: "👑", unlocked: false }
];

export class AchievementManager {
  constructor(onAchievementUnlocked) {
    this.achievements = JSON.parse(JSON.stringify(ACHIEVEMENTS_LIST));
    this.onAchievementUnlocked = onAchievementUnlocked;
  }

  unlock(id) {
    const ach = this.achievements.find(a => a.id === id);
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
      if (this.onAchievementUnlocked) {
        this.onAchievementUnlocked(ach);
      }
      return ach;
    }
    return null;
  }

  getProgress() {
    const total = this.achievements.length;
    const unlocked = this.achievements.filter(a => a.unlocked).length;
    return { unlocked, total, percent: Math.floor((unlocked / total) * 100) };
  }
}
