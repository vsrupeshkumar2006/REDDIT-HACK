/**
 * ONLYSONS: The Five Brothers of the Reddit Dynasty
 * Built by Prashant, Rishir Kartik, and Rupesh Kumar
 */

export const ANIMAL_ROLES = [
  {
    id: "doge",
    name: "Son III: The Wholesome Doge",
    title: "The Loyal Heir",
    emoji: "🐕",
    tier: "Family Peacekeeper",
    storyQuote: "Dad taught us to upvote with our hearts. I won't let our family name be tarnished!",
    description: "The golden retriever son. Much loyalty, very wholesome. High HP, passive healing, and generous upvote bonuses to heal family feuds.",
    baseStats: {
      hp: 130,
      attack: 18,
      defense: 28,
      critChance: 0.15,
      passivePerSec: 4
    },
    specialMove: {
      name: "Family Bond Tail Wag",
      desc: "Heals 25 HP and fortifies family shield with +25 Defense",
      heatCost: 20
    }
  },
  {
    id: "cat",
    name: "Son II: The Chaos Shitpost Cat",
    title: "The Middle Child Terror",
    emoji: "🐈",
    tier: "Trickster Rebel",
    storyQuote: "If Dad didn't want me to derail the ModQueue, he shouldn't have given me the password.",
    description: "Knocks over family heirlooms and derails frontpage threads. Insanely high critical strike multiplier and unpredictable speed.",
    baseStats: {
      hp: 100,
      attack: 28,
      defense: 14,
      critChance: 0.38,
      passivePerSec: 6
    },
    specialMove: {
      name: "3 AM Family Zoomies",
      desc: "Scrambles all obstacles and deals 36 chaotic critical damage",
      heatCost: 30
    }
  },
  {
    id: "capybara",
    name: "Son V: Zen Master Capybara",
    title: "The Unbothered Prodigy",
    emoji: "🦫",
    tier: "Ancestral Tank",
    storyQuote: "Arguments on the internet are temporary. Hot springs and family karma are eternal.",
    description: "Completely immune to toxic comment flame-wars, drama, and downvote brigades. Highest base defense in the family.",
    baseStats: {
      hp: 170,
      attack: 15,
      defense: 45,
      critChance: 0.10,
      passivePerSec: 5
    },
    specialMove: {
      name: "Hot Spring Barrier",
      desc: "Absorbs 100% of damage and converts downvotes into healing",
      heatCost: 25
    }
  },
  {
    id: "ape",
    name: "Son IV: Diamond-Hands Ape",
    title: "The WallStreetBets Prodigal",
    emoji: "🦍",
    tier: "High-Roller Son",
    storyQuote: "I put the entire family inheritance into 0DTE options. We're going to the moon, brothers!",
    description: "The prodigal brother who HODLs through downvote dips and gambles for 5x viral score multipliers.",
    baseStats: {
      hp: 115,
      attack: 32,
      defense: 20,
      critChance: 0.28,
      passivePerSec: 10
    },
    specialMove: {
      name: "Inheritance Rocket",
      desc: "50% chance to detonate for 65 massive damage; 50% backfire",
      heatCost: 40
    }
  },
  {
    id: "snoo",
    name: "Son I: The Eldest Mod Wizard",
    title: "The Crown Prince",
    emoji: "🧙‍♂️",
    tier: "Dynasty Archmage",
    storyQuote: "As the firstborn, I bear the weight of Dad's Ternion Staff. The ModQueue Citadel will answer to us.",
    description: "The eldest son trained in the ancient ways of CSS, AutoMod regex, and Reddit Gold. The pinnacle of the Onlysons bloodline.",
    baseStats: {
      hp: 150,
      attack: 36,
      defense: 32,
      critChance: 0.32,
      passivePerSec: 18
    },
    specialMove: {
      name: "Ancestral Ternion Strike",
      desc: "Calls down the ancestral light for 50 damage and grants +40 Shield",
      heatCost: 50
    }
  }
];
