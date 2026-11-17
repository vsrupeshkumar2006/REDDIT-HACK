/**
 * ONLYSONS: Undercover Spy Racer Narrative Engine ("Dhurandhar" Indian Spy Thriller Inspired)
 * Built by Eshwar Karthik, Prashanth, and Rupesh Kumar
 * 
 * Narrative Characters:
 *  - Protagonist: Ayaan Malik (~25, underground street racer & automotive engineer)
 *  - Father: Rashid Malik (veteran mechanic running family garage)
 *  - Mother: Sana Malik (caring mother, emotional anchor)
 *  - Sister: Zara Malik (fearless investigative journalist tracking corporate syndicates)
 *  - Brother: Hamza Malik (tech streamer, viral video editor, drone operator)
 *  - Uncle: Farooq Malik (veteran logistics & customs informant)
 *  - Handler: Agent Kabir (National Intelligence Special Operations)
 *  - Antagonist: Viktor Drake / Nawab (Head of Syndicate Apex)
 * 
 * 6-Act Campaign:
 *  Act I: The Midnight Sprint (Street Racer)
 *  Act II: The Shadow Contract (The Recruitment)
 *  Act III: The Desert Infiltration (The Underground)
 *  Act IV: The Double Life & Suspicion Crisis (Managing family trust & syndicate radar)
 *  Act V: Mountain Pass Ambush (Sister Zara's Extraction)
 *  Act VI: The Grand Reckoning (The Final Climax & Multiple Endings)
 */

export class SpyStoryEngine {
  constructor(onStoryUpdate = null) {
    this.onStoryUpdate = onStoryUpdate;

    // Narrative State
    this.currentAct = 1;
    this.currentMissionIndex = 0;
    this.familyTrust = 85;      // 0 to 100
    this.syndicateSuspicion = 15; // 0 to 100 (If > 90, enforcers raid!)
    this.agencyRating = 80;      // 0 to 100
    this.completedMissions = [];
    this.activeMission = null;

    // Characters Directory
    this.characters = {
      ayaan: { name: "Ayaan Malik", role: "Protagonist / Undercover Racer", emoji: "🏎️", voicePitch: 1.0 },
      rashid: { name: "Father Rashid Malik", role: "Master Mechanic & Patriarch", emoji: "🔧", voicePitch: 0.8 },
      sana: { name: "Mother Sana", role: "Emotional Anchor & Matriarch", emoji: "🧕", voicePitch: 1.2 },
      zara: { name: "Sister Zara Malik", role: "Investigative Journalist", emoji: "📰", voicePitch: 1.3 },
      hamza: { name: "Brother Hamza Malik", role: "Gamer, Streamer & Drone Tech", emoji: "🎮", voicePitch: 1.4 },
      farooq: { name: "Uncle Farooq", role: "Customs & Desert Logistics", emoji: "📦", voicePitch: 0.7 },
      kabir: { name: "Agent Kabir", role: "National Intelligence Handler", emoji: "🕶️", voicePitch: 0.9 },
      nawab: { name: "Nawab (Syndicate Kingpin)", role: "Syndicate Apex Leader", emoji: "👑", voicePitch: 0.75 }
    };

    // 6-Act Missions Catalogue
    this.acts = [
      {
        actNumber: 1,
        title: "Act I: The Midnight Sprint",
        subtitle: "The Street Racer of Cyber City",
        location: "Rashid's Performance Garage & Cyber City Streets",
        description: "Win the local Midnight Street Sprint in Father Rashid's tuned car to save Malik Garage from eviction.",
        dialogue: [
          { speaker: "rashid", text: "Ayaan! The dyno numbers on this V8 are still dropping. Stop dreaming about underground races and focus on the customer orders! If we don't pay the lease by tomorrow, they lock the garage doors." },
          { speaker: "hamza", text: "Bhai, ignore Dad's panic! I set up our 4K drone cameras along the neon expressway. 80,000 people are waiting for your drift stream! Win this, and the prize money clears our debt!" },
          { speaker: "ayaan", text: "Relax, Dad. The timing belt is dialed in, and the nitrous pressure is primed. Tonight, Malik Garage takes the trophy." }
        ],
        objective: "Reach 120 MPH and perform a 3-second drift across Cyber City plaza.",
        rewardKarma: 1500,
        rewardPoints: 2500
      },
      {
        actNumber: 2,
        title: "Act II: The Shadow Contract",
        subtitle: "The Recruitment",
        location: "Ancient Lost Ruins • Dead Drop",
        description: "A mysterious operative flags down your car. National Intelligence Officer Kabir offers an undercover proposal.",
        dialogue: [
          { speaker: "kabir", text: "Impressive steering tonight, Ayaan. Or should I say... Ghost Racer? We know about your skills. We also know 'Syndicate Apex' is smuggling illegal AI neural chips through high-speed automotive convoys." },
          { speaker: "ayaan", text: "Who are you? I'm just a mechanic who likes driving fast. I don't work for badges." },
          { speaker: "kabir", text: "Your family's garage was denied loans because the Syndicate owns the local banks. Join us undercover. Infiltrate their convoy. Protect your country, and your family's garage will never be touched again." },
          { speaker: "ayaan", text: "On one condition: my family stays completely out of this." }
        ],
        objective: "Drive to the Ancient Stone Temple and collect the Encrypted Telemetry Transponder.",
        rewardKarma: 2400,
        rewardPoints: 3500
      },
      {
        actNumber: 3,
        title: "Act III: The Desert Infiltration",
        subtitle: "The Underground Convoy",
        location: "Desert Dunes & Abandoned Outpost",
        description: "Infiltrate the Syndicate's high-speed desert convoy without triggering their surveillance drones.",
        dialogue: [
          { speaker: "farooq", text: "Ayaan, beta... why did you ask me for the secret border route through the sand dunes? Be careful out there. The sand eats tires for breakfast, and Nawab's men shoot first." },
          { speaker: "nawab", text: "So this is the prodigy driver everyone talks about. Malik's boy. Deliver this black box across the dunes in under 3 minutes, and you are inside the inner circle." },
          { speaker: "ayaan", text: "Keep the cash ready, Nawab. Loose sand is just another surface to drift on." }
        ],
        objective: "Drive through the Desert Dunes biome and maintain high speed on loose terrain.",
        rewardKarma: 3200,
        rewardPoints: 5000
      },
      {
        actNumber: 4,
        title: "Act IV: The Double Life & Suspicion Crisis",
        subtitle: "Family vs. Duty",
        location: "Rashid's Garage • Family Dinner",
        description: "Tensions explode at home. Sister Zara discovers confidential files, while the Syndicate suspects a leak.",
        dialogue: [
          { speaker: "sana", text: "Ayaan, sit down and eat your roti. Look at your hands—bruised and bleeding. Where are you disappearing every night until 4 AM?" },
          { speaker: "zara", text: "I ran the license plates from the desert convoy for my front-page news article... Ayaan, why was your car registered in Nawab's logistics manifest?! What are you hiding?!" },
          { speaker: "rashid", text: "Tell your sister she's mistaken, Ayaan! Tell me my son didn't sell his soul to criminals!" },
          { speaker: "ayaan", text: "Trust me... please. I can't explain everything yet, but I promise everything I am doing is to keep this family safe." }
        ],
        objective: "Keep Syndicate Suspicion below 75% and extract the encrypted ledger files.",
        rewardKarma: 4000,
        rewardPoints: 6500
      },
      {
        actNumber: 5,
        title: "Act V: Mountain Pass Ambush",
        subtitle: "The Extraction of Sister Zara",
        location: "Mountain Canyon Pass & Illuminated Tunnel",
        description: "Syndicate enforcers discover Zara's press investigation! Speed up the mountain pass to extract her car before she is captured.",
        dialogue: [
          { speaker: "zara", text: "Ayaan! They followed me to the mountain highway! Two black SUVs are ramming my car—my steering is failing!" },
          { speaker: "kabir", text: "Ayaan, you cannot blow your cover! Do not engage directly!" },
          { speaker: "ayaan", text: "To hell with the cover! Nobody touches my sister! Hamza, launch the drone and mark their coordinates on my HUD!" },
          { speaker: "hamza", text: "Coordinates locked, Bhai! Punch the Nitrous right through the mountain tunnel!" }
        ],
        objective: "Race up the Mountain Pass, enter the Tunnel at full throttle, and intercept the pursuers.",
        rewardKarma: 5500,
        rewardPoints: 8500
      },
      {
        actNumber: 6,
        title: "Act VI: The Grand Reckoning",
        subtitle: "The Final Climax & Destiny",
        location: "Syndicate Citadel & Open World Apex",
        description: "The ultimate showdown. Infiltrate the Syndicate's central vault, expose the conspiracy, and choose your ending.",
        dialogue: [
          { speaker: "nawab", text: "You were Kabir's ghost all along! You played us well, Ayaan Malik. But you won't leave this city alive!" },
          { speaker: "rashid", text: "He won't be leaving alone, Nawab! The whole Malik family stands behind him!" },
          { speaker: "ayaan", text: "It's over, Nawab. The telemetry is uploaded, the press has the documents, and your empire is finished." }
        ],
        objective: "Deliver the final cryptographic proof to the Central Vault and complete the Dynasty Saga.",
        rewardKarma: 10000,
        rewardPoints: 15000
      }
    ];

    this.activeMission = this.acts[0];
  }

  // ===========================================================================
  // ADVANCE CAMPAIGN MISSION
  // ===========================================================================
  advanceMission(choiceIndex = 0) {
    const completedAct = this.acts[this.currentAct - 1];
    if (!this.completedMissions.includes(completedAct.actNumber)) {
      this.completedMissions.push(completedAct.actNumber);
    }

    // Branching consequences
    if (choiceIndex === 0) {
      // Prioritize Family
      this.familyTrust = Math.min(100, this.familyTrust + 15);
      this.syndicateSuspicion = Math.min(100, this.syndicateSuspicion + 10);
    } else {
      // Prioritize Agency / Undercover Cover
      this.familyTrust = Math.max(20, this.familyTrust - 10);
      this.syndicateSuspicion = Math.max(5, this.syndicateSuspicion - 15);
      this.agencyRating = Math.min(100, this.agencyRating + 15);
    }

    if (this.currentAct < this.acts.length) {
      this.currentAct += 1;
      this.activeMission = this.acts[this.currentAct - 1];
    }

    if (this.onStoryUpdate) {
      this.onStoryUpdate(this.getState());
    }

    return this.getState();
  }

  // ===========================================================================
  // TEXT-TO-SPEECH VOICE SYNTHESIS
  // ===========================================================================
  speakDialogue(dialogueItem) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(dialogueItem.text);
      const speakerMeta = this.characters[dialogueItem.speaker] || {};
      utterance.pitch = speakerMeta.voicePitch || 1.0;
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis non-critical:", e);
    }
  }

  // ===========================================================================
  // STATE EXPORT
  // ===========================================================================
  getState() {
    return {
      currentAct: this.currentAct,
      totalActs: this.acts.length,
      activeMission: this.activeMission,
      familyTrust: this.familyTrust,
      syndicateSuspicion: this.syndicateSuspicion,
      agencyRating: this.agencyRating,
      completedMissions: this.completedMissions,
      isCampaignComplete: this.completedMissions.length >= this.acts.length
    };
  }
}
