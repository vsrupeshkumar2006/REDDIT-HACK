/**
 * KarmaCrunch: 1-100 Level Progression & Scaling Engine
 * Built by Eshwar Karthik, Prashanth, and Rupesh Kumar
 */

export function calculateXpForLevel(level) {
  if (level <= 1) return 0;
  // Smooth progressive polynomial curve: Level 1 = 0 XP, Level 2 = 60 XP, Level 100 = ~315,000 XP
  return Math.floor(60 * Math.pow(level - 1, 1.45));
}

export function getTierForLevel(level) {
  if (level <= 10) return { name: "🐾 Wholesome Meadow", bracket: "Levels 1-10", desc: "Easy play for pups, kittens, and casual lurkers." };
  if (level <= 25) return { name: "📈 Meme Uprising", bracket: "Levels 11-25", desc: "Unlocking combo multipliers and snarky comments." };
  if (level <= 50) return { name: "⚔️ Frontpage Crucible", bracket: "Levels 26-50", desc: "Fierce debates and high-stakes viral threads." };
  if (level <= 75) return { name: "🛡️ ModQueue Citadel", bracket: "Levels 51-75", desc: "Battling auto-moderators and rule-lawyers." };
  return { name: "👑 Reddit Ascension", bracket: "Levels 76-100", desc: "Immortal Reddit deities and server sovereign lords." };
}

export const MILESTONE_PERKS = {
  5: { title: "Unlocked: Auto-Upvoter", bonus: "+3 Passive Karma/sec" },
  10: { title: "Unlocked: Double Ratio", bonus: "+15% Shield Efficacy" },
  25: { title: "Unlocked: Gold Award Giver", bonus: "Awards grant x2 multipliers" },
  50: { title: "Unlocked: Sarcasm Overdrive", bonus: "+25% Critical Hit Chance" },
  75: { title: "Unlocked: Banhammer Deflector", bonus: "Passive 10 Armor against bosses" },
  100: { title: "Ascended: Cosmic Reddit Sovereign", bonus: "Ultimate Reddit Status Achieved!" }
};

export const BOSS_ARCHETYPES = [
  {
    name: "The Repost Bot 3000",
    role: "Automated Content Scraper",
    avatar: "🤖",
    baseHp: 75,
    baseAtk: 12,
    baseShield: 5,
    quote: "DOWNLOADING MEME FROM 2017... CROPPING WATERMARK...",
    attackDesc: "fires a moldy recycled jpeg!"
  },
  {
    name: "The Grammar Enforcer",
    role: "Subreddit Pedant",
    avatar: "🧐",
    baseHp: 95,
    baseAtk: 16,
    baseShield: 15,
    quote: "Actually, 'their' and 'there' are fundamentally distinct.",
    attackDesc: "delivers an 8-paragraph grammatical rebuttal!"
  },
  {
    name: "The Armchair General",
    role: "Instant Expert on Everything",
    avatar: "🎖️",
    baseHp: 125,
    baseAtk: 20,
    baseShield: 20,
    quote: "As someone who read half a headline on r/news, listen to me.",
    attackDesc: "demands a peer-reviewed double-blind citation!"
  },
  {
    name: "The Toxic Troll",
    role: "Downvote Harvester",
    avatar: "👺",
    baseHp: 155,
    baseAtk: 25,
    baseShield: 10,
    quote: "Your opinion is objectively invalid. Cope and seethe.",
    attackDesc: "unleashes a flame-war brigade!"
  },
  {
    name: "The Power-Tripping Mod",
    role: "Grand Inquisitor of Rule 3 Subsection B",
    avatar: "👑",
    baseHp: 195,
    baseAtk: 30,
    baseShield: 30,
    quote: "Thread locked because y'all cannot behave.",
    attackDesc: "drops the heavy banhammer for critical damage!"
  },
  {
    name: "The Algorithmic Hivemind",
    role: "The Collective Unconscious of r/All",
    avatar: "🌌",
    baseHp: 260,
    baseAtk: 38,
    baseShield: 40,
    quote: "WE ARE THE HIVEMIND. YOUR INDIVIDUAL TAKE IS REJECTED.",
    attackDesc: "channels 100,000 collective downvotes in a vortex!"
  }
];

export function generateBossForLevel(level) {
  const index = Math.min(BOSS_ARCHETYPES.length - 1, Math.floor((level - 1) / 16));
  const base = BOSS_ARCHETYPES[index];
  const scale = 1 + (level - 1) * 0.085; // Progressive scale
  return {
    name: `${base.name} (Lvl ${level})`,
    role: base.role,
    avatar: base.avatar,
    maxHp: Math.floor(base.baseHp * scale),
    hp: Math.floor(base.baseHp * scale),
    atk: Math.floor(base.baseAtk * scale),
    shield: Math.floor(base.baseShield * scale * 0.4),
    quote: base.quote,
    attackDesc: base.attackDesc
  };
}
