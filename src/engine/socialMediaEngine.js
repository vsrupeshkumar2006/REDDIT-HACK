/**
 * ONLYSONS: Interactive In-Game Social Media Platform (Reels & Reddit Dynasty Feed)
 * Built by Eshwar Karthik, Prashanth, and Rupesh Kumar
 * 
 * Features:
 *  - Vertical 9:16 In-Game Reels & Shorts Feed with audio vibes, drift clips, and creator badges
 *  - Reddit Community Threads (r/OnlySons, r/Cars, r/UndergroundDrift, r/CityMysteries)
 *  - Dynamic viral comments reacting in real time to Ayaan Malik's driving, family events, and spy acts
 *  - Trending Hashtags ticker (#AyaanMalik, #MalikGarage, #GhostRacer, #SyndicateExposed)
 *  - Interactive actions: Like, Upvote, Share, and Comment to gain Karma!
 */

export class SocialMediaEngine {
  constructor(onKarmaEarned = null) {
    this.onKarmaEarned = onKarmaEarned;
    this.currentFeedType = 'reels'; // 'reels' or 'reddit'
    this.userKarma = 0;

    // Trending Hashtags
    this.trendingTags = [
      { tag: "#AyaanMalik", posts: "1.2M posts", trending: "Trending #1 in City" },
      { tag: "#MalikGarage", posts: "850K posts", trending: "Trending in Auto" },
      { tag: "#GhostRacer", posts: "640K posts", trending: "Trending in Mystery" },
      { tag: "#MidnightDrift", posts: "420K posts", trending: "Trending in Racing" },
      { tag: "#SyndicateExposed", posts: "310K posts", trending: "Breaking News" }
    ];

    // In-Game Reels / Shorts Feed
    this.reels = [
      {
        id: "reel_01",
        creator: "Hamza Malik 🎮",
        handle: "@hamza_streamz",
        avatar: "🎮",
        title: "BHAI PULLED OFF A 360° DRIFT THROUGH THE PLAZA!! 🏎️🔥",
        description: "Recorded from our drone cam. The sound of that Malik Garage twin-turbo V8... UNREAL! #AyaanMalik #MidnightDrift",
        soundTrack: "Phonk Drift Anthem (Slowed + Reverb)",
        likes: 184500,
        commentsCount: 3420,
        shares: 12500,
        isLiked: false,
        bgGradient: "linear-gradient(135deg, #ff4500, #1a0802)",
        previewClipText: "🏎️💨 360° SMOKE DRIFT • 142 MPH",
        comments: [
          { user: "drift_king_delhi", text: "Bhai kya drift tha yaar!! 🔥🔥 Best driver in the city!", time: "2m ago" },
          { user: "speedy_sam", text: "Bro literally thinks he is in Dhurandhar 💀 But it worked!!", time: "5m ago" },
          { user: "father_rashid_official", text: "Hamza! Stop recording videos and tell your brother to clean the grease on stall 3! 🔧", time: "12m ago" }
        ]
      },
      {
        id: "reel_02",
        creator: "Zara Malik News 📰",
        handle: "@zara_investigates",
        avatar: "📰",
        title: "BREAKING: Mysterious Convoys Spotted in Desert Dunes ⚠️",
        description: "Who owns the blacked-out luxury fleet hauling encrypted hardware? Full investigative report dropping tonight. #SyndicateExposed",
        soundTrack: "Cinematic Thriller Mystery Score",
        likes: 92300,
        commentsCount: 1890,
        shares: 8900,
        isLiked: false,
        bgGradient: "linear-gradient(135deg, #0079d3, #051829)",
        previewClipText: "📹 INVESTIGATIVE DRONE RECON • DESERT SECTOR 4",
        comments: [
          { user: "city_watchdog", text: "Stay safe Zara! The people behind this convoy are dangerous...", time: "10m ago" },
          { user: "ayaan_m", text: "Zara, delete this post right now. It's not safe.", time: "18m ago" },
          { user: "conspiracy_cat", text: "I saw the Ghost Racer red GT speeding ahead of the convoy!", time: "25m ago" }
        ]
      },
      {
        id: "reel_03",
        creator: "Malik Performance Garage 🔧",
        handle: "@malik_garage",
        avatar: "🔧",
        title: "Father Rashid Tuning the 950HP Dyno Monster 💥",
        description: "Old school wrenching meets modern ECU tuning. No computer beats 40 years of mechanic experience! #MalikGarage",
        soundTrack: "Straight Pipe Exhaust Symphony V8",
        likes: 145000,
        commentsCount: 2210,
        shares: 9800,
        isLiked: false,
        bgGradient: "linear-gradient(135deg, #ffd700, #2b1f00)",
        previewClipText: "🔥 DYNO TEST: 950 BHP • 8,500 RPM REDLINE",
        comments: [
          { user: "car_guy_mumbai", text: "Uncle Rashid is a legend! Brought my sedan there last week, drives like a rocket now.", time: "1h ago" },
          { user: "hamza_streamz", text: "Dad famous on the algorithm now haha 📈", time: "2h ago" }
        ]
      }
    ];

    // Reddit Community Posts (r/OnlySons, r/Cars, r/UndergroundDrift)
    this.redditPosts = [
      {
        id: "post_101",
        subreddit: "r/OnlySons",
        flair: "DYNASTY SAGA",
        flairColor: "#ff4500",
        author: "u/hamza_the_streamer",
        title: "[MEGATHREAD] The Ghost Racer in the Red GT Supercar has been identified as Ayaan Malik! Family pride or underground legend?",
        body: "Look at the telemetry from last night's race. 0-60 in 2.3 seconds, 4-wheel raycast suspension eating curbs like nothing. My brother is literally carrying the dynasty on his back!",
        upvotes: 4820,
        downvotes: 110,
        commentsCount: 428,
        userVote: 0,
        topComments: [
          { author: "u/doge_fanatic", text: "Much speed! Very drift! Take all my Reddit Gold! 🐕🚀", upvotes: 950 },
          { author: "u/mod_wizard_prime", text: "Automod verified: 0% bot, 100% pure horsepower.", upvotes: 620 }
        ]
      },
      {
        id: "post_102",
        subreddit: "r/Cars",
        flair: "DYNO TUNING",
        flairColor: "#00d2d3",
        author: "u/rashid_master_wrench",
        title: "PSA from a 40-year mechanic: Check your tire treads and suspension damping before doing high-speed highway pulls",
        body: "Too many young racers think pure horsepower wins races. It's about mechanical grip, tire contact patches, and weight distribution. Also don't use cheap nitrous oxide valves.",
        upvotes: 7210,
        downvotes: 45,
        commentsCount: 890,
        userVote: 0,
        topComments: [
          { author: "u/wsb_ape_trader", text: "Sir, this is a Wendy's... but also thank you for saving my front axle.", upvotes: 1200 },
          { author: "u/ayaan_gt", text: "Understood, Dad. Front alignment dialed to -1.8 degrees.", upvotes: 840 }
        ]
      },
      {
        id: "post_103",
        subreddit: "r/CityMysteries",
        flair: "EXPOSÉ",
        flairColor: "#9b59b6",
        author: "u/zara_investigative",
        title: "Leaked Financial Lineage: How Syndicate Apex laundered millions through offshore cloud GPU billing and high-value auto customs",
        body: "I connected the dots using our data lineage tables. Over $1.2M in phantom GPU hours matched the timestamps of the desert smuggling runs. Full document leak attached.",
        upvotes: 11400,
        downvotes: 210,
        commentsCount: 1350,
        userVote: 0,
        topComments: [
          { author: "u/fintech_auditor", text: "Our MOA GPU auditor flagged this exact invoice! $1,200 of $3,600 was billed 12h post-termination! Great journalism Zara!", upvotes: 1850 }
        ]
      }
    ];
  }

  // ===========================================================================
  // INTERACTION HANDLERS
  // ===========================================================================
  likeReel(reelId) {
    const reel = this.reels.find(r => r.id === reelId);
    if (!reel) return;
    reel.isLiked = !reel.isLiked;
    reel.likes += reel.isLiked ? 1 : -1;
    this.addKarma(50, `Liked Reel: ${reel.title.slice(0, 20)}...`);
    return reel;
  }

  addCommentToReel(reelId, commentText, username = "u/DynastyPlayer") {
    const reel = this.reels.find(r => r.id === reelId);
    if (!reel || !commentText) return;
    reel.comments.unshift({
      user: username,
      text: commentText,
      time: "Just now"
    });
    reel.commentsCount += 1;
    this.addKarma(100, `Commented on Reel: ${reel.title.slice(0, 20)}...`);
    return reel;
  }

  voteRedditPost(postId, direction) { // +1 or -1
    const post = this.redditPosts.find(p => p.id === postId);
    if (!post) return;
    if (post.userVote === direction) {
      // Toggle off
      post.upvotes -= direction;
      post.userVote = 0;
    } else {
      post.upvotes += direction - post.userVote;
      post.userVote = direction;
      this.addKarma(25, `Voted on ${post.subreddit}`);
    }
    return post;
  }

  addKarma(amount, reason) {
    this.userKarma += amount;
    if (this.onKarmaEarned) {
      this.onKarmaEarned(amount, reason, this.userKarma);
    }
  }

  getState() {
    return {
      currentFeedType: this.currentFeedType,
      trendingTags: this.trendingTags,
      reels: this.reels,
      redditPosts: this.redditPosts,
      userKarma: this.userKarma
    };
  }
}
