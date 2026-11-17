/**
 * KarmaCrunch: Animal & Player Archetype Roles
 * Built by Rupesh Kumar, Eshwar Kartik, and Prashant
 */

export const ANIMAL_ROLES = [
  {
    id: "doge",
    name: "Wholesome Doge",
    emoji: "🐕",
    tier: "Beginner / Animal Friendly",
    description: "Much karma, very wholesome! High health, passive healing, and generous upvote bonuses.",
    baseStats: {
      hp: 120,
      attack: 16,
      defense: 25,
      critChance: 0.15,
      passivePerSec: 3
    },
    specialMove: {
      name: "Tail Wag Upvote",
      desc: "Heals 20 HP and gives +20 Upvote Shield",
      heatCost: 20
    }
  },
  {
    id: "cat",
    name: "Chaos Shitpost Cat",
    emoji: "🐈",
    tier: "Trickster",
    description: "Knocks glasses off tables and derails comment sections. High critical strike rate.",
    baseStats: {
      hp: 95,
      attack: 26,
      defense: 12,
      critChance: 0.35,
      passivePerSec: 5
    },
    specialMove: {
      name: "3 AM Zoomies",
      desc: "Deals 32 chaotic damage and scrambles enemy shields",
      heatCost: 30
    }
  },
  {
    id: "capybara",
    name: "Zen Master Capybara",
    emoji: "🦫",
    tier: "Tank",
    description: "Completely immune to drama, toxic downvotes, and internet arguments. Maximum defense.",
    baseStats: {
      hp: 160,
      attack: 14,
      defense: 40,
      critChance: 0.10,
      passivePerSec: 4
    },
    specialMove: {
      name: "Hot Spring Chill",
      desc: "Blocks 100% of incoming damage for next turn",
      heatCost: 25
    }
  },
  {
    id: "ape",
    name: "Diamond-Hands Ape",
    emoji: "🦍",
    tier: "High Stakes",
    description: "Apes together strong. HODLs through downvote dips and gambles for 5x multipliers.",
    baseStats: {
      hp: 110,
      attack: 30,
      defense: 18,
      critChance: 0.25,
      passivePerSec: 8
    },
    specialMove: {
      name: "Rocket to the Moon",
      desc: "50% chance to deal 60 massive damage, 50% backfire",
      heatCost: 40
    }
  },
  {
    id: "snoo",
    name: "Cosmic Reddit Wizard",
    emoji: "🧙‍♂️",
    tier: "Legendary",
    description: "An enlightened archmage wielding the sacred Upvote Staff and Reddit Gold.",
    baseStats: {
      hp: 140,
      attack: 34,
      defense: 28,
      critChance: 0.30,
      passivePerSec: 15
    },
    specialMove: {
      name: "Ternion All-Powerful",
      desc: "Detonates enemy for 45 damage and gains +35 Shield",
      heatCost: 50
    }
  }
];
