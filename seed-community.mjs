// Community Seed Data Generator
// This generates 100 users with realistic posts and comments

const AVATAR_ICONS = [
  "mushroom-1", "mushroom-2", "mushroom-3", "mushroom-4", "mushroom-5",
  "mushroom-6", "mushroom-7", "mushroom-8", "mushroom-9", "mushroom-10",
  "mushroom-11", "mushroom-12"
];

const AVATAR_COLORS = [
  "#8B5CF6", "#EF4444", "#10B981", "#3B82F6", "#F59E0B", 
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1"
];

const JOURNEY_STAGES = ["researching", "preparing", "started", "experienced", "guide"];

const JOIN_REASONS = [
  ["ptsd"], ["depression"], ["addiction"], ["medication"],
  ["ptsd", "depression"], ["addiction", "medication"],
  ["spiritual", "curiosity"], ["research"],
  ["ptsd", "addiction"], ["depression", "spiritual"],
  ["medication", "curiosity"], ["ptsd", "depression", "addiction"]
];

const DISPLAY_NAMES = [
  "MysticSeeker", "HealingJourney", "ForestWanderer", "MoonChild", "SpiritGuide",
  "InnerPeace", "NaturePath", "SoulExplorer", "QuietMind", "GentleHealer",
  "StarGazer", "EarthWalker", "DreamWeaver", "LightSeeker", "WildHeart",
  "SilentWatcher", "RiverFlow", "MountainSpirit", "SunDancer", "NightOwl",
  "WisdomSeeker", "PeacefulWarrior", "GoldenPath", "SilverMoon", "CrystalClear",
  "DeepRoots", "HigherSelf", "TrueNorth", "WildSoul", "GentleSpirit",
  "BraveHeart", "OpenMind", "FreeSpirit", "WarmLight", "CalmWaters",
  "StrongRoots", "BrightStar", "SoftEarth", "ClearSky", "DeepOcean",
  "TallTree", "SmallFlower", "BigDreamer", "QuietStrength", "LoudSilence",
  "DarkLight", "SweetBitter", "OldSoul", "NewBeginning", "LastHope",
  "FirstStep", "LongRoad", "ShortPath", "HighClimb", "DeepDive",
  "FastSlow", "HardSoft", "ColdWarm", "DryRain", "SilentThunder",
  "GentleStorm", "FierceCalm", "BrokenWhole", "LostFound", "AloneTogeth",
  "EmptyFull", "WeakStrong", "SadHappy", "FearlessFear", "HopelessHope",
  "EndlessEnd", "BeginningEnd", "DawnDusk", "SunsetRise", "NightDay",
  "WinterSpring", "FallRise", "DeathLife", "SleepWake", "DreamReal",
  "PastFuture", "NowThen", "HereGone", "StayLeave", "GoReturn",
  "SeekFind", "LoseGain", "GiveReceive", "TakeLet", "HoldRelease",
  "PushPull", "RiseFall", "GrowShrink", "BuildBreak", "CreateDestroy",
  "LoveFear", "TrustDoubt", "BelieveQuestion", "KnowWonder", "SeeBlind"
];

// Realistic posts for different spaces
const POSTS_BY_SPACE = {
  introductions: [
    { title: "Finally found my people", content: "After years of suffering in silence with treatment-resistant depression, I stumbled upon this community through a podcast. I've been on SSRIs for 8 years with minimal improvement. I'm here to learn about alternative approaches and hopefully find some hope. Looking forward to connecting with others who understand." },
    { title: "Combat vet seeking healing", content: "Three tours in Afghanistan left me with PTSD that the VA couldn't touch. Pills, therapy, nothing worked. A buddy told me about his experience with psilocybin and how it changed his life. I'm skeptical but desperate. Here to learn and maybe find a path forward." },
    { title: "Mom of two, ready for change", content: "I've been dealing with anxiety and depression since my second child was born 4 years ago. The medication makes me feel like a zombie. I want to be present for my kids. I've been researching microdosing and found this community. Nervous but hopeful." },
    { title: "20 years of addiction, ready to try something new", content: "I've been in and out of rehab for alcohol addiction for two decades. Traditional approaches haven't worked for me. I recently read about ibogaine and psilocybin for addiction treatment. I'm here to learn from others who've walked this path." },
    { title: "Chronic pain warrior checking in", content: "Fibromyalgia has stolen so much from me. I've been on opioids for 5 years and I hate who I've become. I heard Amanita might help with pain and inflammation. Anyone else here dealing with chronic pain? Would love to connect." },
  ],
  microdosing: [
    { title: "Week 4 of my microdosing protocol - incredible results", content: "I started the Fadiman protocol 4 weeks ago for depression. I'm taking 0.1g of dried psilocybin mushrooms every third day. The changes have been subtle but profound. I'm noticing colors more vividly, I'm more patient with my kids, and for the first time in years, I actually look forward to waking up. The dark cloud that's been following me for a decade is finally lifting. I still have hard days, but they don't consume me like before." },
    { title: "Amanita microdosing for sleep - my experience", content: "I've been microdosing Amanita Muscaria for sleep issues for about 6 weeks now. I take a small amount (about 0.5g dried) about 2 hours before bed. The first week was adjustment - vivid dreams, some grogginess. But now? I'm sleeping through the night for the first time in 15 years. No more 3am anxiety spirals. My doctor is amazed at the change in my bloodwork - cortisol levels are normalizing." },
    { title: "Failed microdosing attempt - what I learned", content: "I want to share my experience because not every story is a success. I tried microdosing psilocybin for 3 months with no noticeable benefits. I was taking 0.15g every third day. After talking with others here, I realized my expectations were off and my dose might have been wrong for my body. I'm going to try again with a lower dose and better tracking. Sharing because it's important to know this isn't magic - it takes work and patience." },
    { title: "Combining microdosing with therapy - game changer", content: "I've been microdosing for 2 months now, but the real breakthrough came when I started combining it with therapy sessions. My therapist is open-minded and we time my doses for the day before our sessions. The insights I'm having are incredible. Trauma that I've been carrying for 30 years is finally processing. I'm crying in sessions (in a good way) for the first time ever." },
  ],
  amanita: [
    { title: "Proper Amanita preparation - my method", content: "After months of research and careful experimentation, I want to share my preparation method for Amanita Muscaria. Safety first: ALWAYS decarboxylate. I dry my caps at 170°F for 8-10 hours, then simmer in water (pH adjusted to 2.5-3 with lemon juice) for 3 hours. This converts ibotenic acid to muscimol, making it much safer. I then strain and reduce the liquid. One cap makes about a week's worth of microdoses for me. Please do your own research - this is just what works for me." },
    { title: "Amanita for nerve pain - 6 month update", content: "I've been using Amanita Muscaria for peripheral neuropathy for 6 months now. Before, I was on gabapentin which made me foggy and didn't fully control the pain. Now I take a small amount of properly prepared Amanita tea before bed. The burning sensation in my feet has reduced by about 70%. I can walk without wincing. My neurologist is curious but supportive. This mushroom has given me my life back." },
    { title: "First macro experience with Amanita - trip report", content: "After months of microdosing and preparation, I had my first full Amanita experience last weekend. Set and setting were perfect - alone in my cabin, intention set, sitter on call. The experience was nothing like psilocybin. More dreamy, more physical. I felt like I was sinking into the earth. Visions of my childhood, conversations with my deceased grandmother. I woke up the next day feeling like I'd been reset. The anxiety that's been my constant companion for 20 years was just... gone. It's been a week and I still feel different. Lighter." },
  ],
  psilocybin: [
    { title: "My journey from suicidal ideation to hope", content: "I want to share my story because someone out there might need to hear it. Two years ago, I was planning my exit. Nothing helped - not the pills, not the hospitals, not the therapy. Then I tried psilocybin. My first real journey was 3.5g in a safe setting with a guide. I saw my life from outside myself. I understood, for the first time, that my depression was lying to me. That I mattered. That experience saved my life. I've had three more journeys since then, each one peeling back another layer. I'm not \"cured\" - I still have hard days. But I have hope now. And hope is everything." },
    { title: "Psilocybin for end-of-life anxiety - my father's story", content: "My father was diagnosed with terminal cancer last year. The fear and anxiety were consuming him. He couldn't enjoy his remaining time with family. Through this community, we found a guide who helped him have a psilocybin experience. I wasn't there, but he told me afterward that he saw death not as an ending but as a transition. He's at peace now. He's spending his remaining months laughing with his grandkids instead of crying in fear. I'm sharing this because these medicines aren't just for the young - they can bring peace to those facing the ultimate unknown." },
    { title: "5g heroic dose - confronting my trauma", content: "After a year of preparation, therapy, and smaller doses, I took 5g of penis envy mushrooms to confront childhood trauma. I won't share details of the trauma, but I will say this: I relived it. I felt it. And then I watched it transform. The monster that had been chasing me in my dreams for 30 years became small. I held my inner child and told him it wasn't his fault. I cried for 4 hours straight. It's been a month and I haven't had a single nightmare. My therapist says I've made more progress in that one night than in 10 years of talk therapy." },
  ],
  recovery: [
    { title: "18 months sober thanks to psilocybin", content: "I was a functioning alcoholic for 15 years. Two bottles of wine every night, more on weekends. I tried AA, rehab, willpower - nothing stuck for more than a few months. Then I had a guided psilocybin session focused on my addiction. During the journey, I saw alcohol as a parasite that had attached itself to me. I understood why I drank - to escape feelings I couldn't process. The next day, I didn't want to drink. Not through willpower, but because the desire was just... gone. I've had two more sessions since then to reinforce the work. 18 months sober and counting." },
    { title: "Getting off benzos with Amanita support", content: "Benzodiazepine withdrawal is hell. I was on Xanax for 10 years and my doctor wanted me off. The withdrawal anxiety was unbearable. Through careful research, I started using small amounts of Amanita Muscaria to help with the GABA receptor issues during tapering. It's not a magic solution - I still had hard days. But the Amanita helped smooth out the worst of it. I'm now 6 months benzo-free. Please don't try this without research and medical supervision - I'm just sharing what worked for me." },
    { title: "Opioid addiction - my ibogaine journey", content: "I was on heroin for 8 years. Lost everything - job, family, home. I went to Mexico for ibogaine treatment as a last resort. The experience was intense - 36 hours of facing every terrible thing I'd ever done. But when I came out the other side, the physical withdrawal was gone. The mental obsession was quiet. That was 2 years ago. I've rebuilt my life. I have a job, an apartment, and I'm slowly rebuilding trust with my family. Ibogaine isn't for everyone and it's not without risks, but it gave me my life back." },
  ],
  integration: [
    { title: "Integration practices that actually work", content: "After 10+ psychedelic experiences, I've learned that the journey is only 10% of the work. Integration is everything. Here's what works for me: 1) Journaling immediately after and for the following week. 2) No alcohol or cannabis for at least 2 weeks. 3) Daily meditation, even just 10 minutes. 4) Nature walks. 5) Talking to someone who understands - therapist or trusted friend. 6) Making one small change based on insights. The insights fade if you don't anchor them in daily life." },
    { title: "When integration goes wrong - my cautionary tale", content: "I had a powerful psilocybin experience 6 months ago that showed me I needed to leave my marriage. In the afterglow, I told my wife I wanted a divorce. I quit my job. I moved across the country. Now I'm realizing I acted too fast. The insights were real, but I didn't take time to integrate them properly. I confused \"this needs to change\" with \"this needs to change RIGHT NOW.\" I'm sharing this as a warning: give yourself time. The insights will still be there in a month. Don't make major life decisions in the integration window." },
  ],
  questions: [
    { title: "First timer - how do I find a guide?", content: "I've decided I want to try psilocybin for my depression, but I'm terrified of doing it alone. How do people find trustworthy guides? I'm in a state where it's not legal, so I can't just look up a clinic. Any advice for finding someone safe and experienced?" },
    { title: "Amanita vs Psilocybin for anxiety?", content: "I'm trying to decide between Amanita Muscaria and psilocybin for anxiety treatment. I've read that they work on different receptors and have different effects. Has anyone tried both? What were the differences in your experience? I'm leaning toward Amanita because it's legal, but I want to make an informed decision." },
    { title: "Microdosing while on SSRIs?", content: "I'm currently on Lexapro and want to try microdosing psilocybin. I've read conflicting information about whether it's safe. Some say the SSRI blocks the effects, others warn about serotonin syndrome. Has anyone here successfully microdosed while on an SSRI? Did you taper off first? I'm nervous about stopping my medication." },
    { title: "How long between macro doses?", content: "I had my first psilocybin journey 3 weeks ago and I'm eager to go deeper. How long should I wait between macro doses? I've heard everything from 2 weeks to 3 months. What's the consensus here? I don't want to lose the magic but I also don't want to rush the process." },
  ]
};

// Realistic comments
const COMMENTS = [
  "Thank you for sharing this. Your story gives me hope.",
  "I had a very similar experience. You're not alone.",
  "This is exactly what I needed to read today.",
  "Have you tried combining this with meditation? It really helped me.",
  "I'm in the same boat. Would love to connect and share experiences.",
  "The courage it takes to share this is incredible. Thank you.",
  "I've been lurking for months and this post finally made me want to share my own story.",
  "This community is so supportive. I'm grateful I found you all.",
  "Your preparation method is similar to mine. Safety first!",
  "I tried something similar and it changed my life.",
  "Be careful with dosing - everyone's body is different.",
  "Have you talked to a therapist about this? Integration support is so important.",
  "Sending you love and healing energy on your journey.",
  "This gives me hope that things can get better.",
  "I've been exactly where you are. It does get better.",
  "Thank you for being so honest about the challenges too.",
  "The part about your inner child really resonated with me.",
  "I'm crying reading this. Thank you for sharing.",
  "Your story is so powerful. You should write a book.",
  "I'm going to try your method. Thanks for the detailed instructions.",
  "How long did it take before you noticed changes?",
  "Did you experience any side effects?",
  "What was your set and setting like?",
  "I'm nervous to try this. Any advice for first-timers?",
  "Your courage inspires me to keep going.",
  "I shared this with my therapist and they were really interested.",
  "This is why I love this community. Real stories, real healing.",
  "I've been struggling with the same thing. Thank you for the hope.",
  "The way you describe the experience is beautiful.",
  "I'm bookmarking this for when I'm ready to try.",
  "Your integration practices are gold. Thank you!",
  "I made the same mistake of acting too fast. Good warning.",
  "Finding a guide is so hard. Let me know if you find resources.",
  "I've tried both and prefer Amanita for anxiety personally.",
  "Please be careful with SSRIs. Talk to a doctor first.",
  "I wait at least 6 weeks between macro doses. Patience is key.",
  "Your transformation is inspiring. Keep sharing your journey.",
  "I needed to hear this today. Thank you.",
  "The part about hope being everything hit me hard.",
  "You're so brave for sharing this. It helps others feel less alone."
];

// Generate the seed data
const profiles = [];
const posts = [];
const comments = [];

// Create 100 profiles
for (let i = 0; i < 100; i++) {
  const profile = {
    id: i + 1,
    userId: i + 1000, // Fake user IDs
    displayName: DISPLAY_NAMES[i] || `Seeker${i + 1}`,
    avatarIcon: AVATAR_ICONS[Math.floor(Math.random() * AVATAR_ICONS.length)],
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    bio: null,
    journeyStage: JOURNEY_STAGES[Math.floor(Math.random() * JOURNEY_STAGES.length)],
    joinReasons: JSON.stringify(JOIN_REASONS[Math.floor(Math.random() * JOIN_REASONS.length)]),
    isPublic: true,
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString() // Random date in last 90 days
  };
  profiles.push(profile);
}

// Create posts for each space
const spaceMapping = {
  introductions: 1,
  microdosing: 2,
  amanita: 3,
  psilocybin: 4,
  recovery: 5,
  integration: 6,
  questions: 7
};

let postId = 1;
for (const [spaceName, spacePosts] of Object.entries(POSTS_BY_SPACE)) {
  const spaceId = spaceMapping[spaceName];
  for (const postData of spacePosts) {
    const authorId = Math.floor(Math.random() * 100) + 1;
    const post = {
      id: postId,
      spaceId,
      authorId,
      title: postData.title,
      content: postData.content,
      isAnonymous: Math.random() > 0.8, // 20% anonymous
      isPinned: false,
      likeCount: Math.floor(Math.random() * 50) + 5,
      commentCount: 0, // Will be updated
      viewCount: Math.floor(Math.random() * 200) + 20,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
    };
    posts.push(post);
    
    // Add 2-8 comments per post
    const numComments = Math.floor(Math.random() * 7) + 2;
    for (let c = 0; c < numComments; c++) {
      const commentAuthorId = Math.floor(Math.random() * 100) + 1;
      const comment = {
        postId: postId,
        authorId: commentAuthorId,
        content: COMMENTS[Math.floor(Math.random() * COMMENTS.length)],
        isAnonymous: Math.random() > 0.9, // 10% anonymous
        likeCount: Math.floor(Math.random() * 15),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      comments.push(comment);
    }
    post.commentCount = numComments;
    
    postId++;
  }
}

// Output the data
const seedData = {
  profiles,
  posts,
  comments,
  spaces: [
    { id: 1, name: "Introductions", slug: "introductions", description: "Welcome! Share your story and why you're here.", color: "#10B981", icon: "hand-wave", sortOrder: 1, isDefault: true, postCount: POSTS_BY_SPACE.introductions.length },
    { id: 2, name: "Microdosing Journey", slug: "microdosing", description: "Share your microdosing experiences and protocols.", color: "#8B5CF6", icon: "sparkles", sortOrder: 2, isDefault: false, postCount: POSTS_BY_SPACE.microdosing.length },
    { id: 3, name: "Amanita Experiences", slug: "amanita", description: "Discuss Amanita Muscaria experiences and preparation.", color: "#EF4444", icon: "flame", sortOrder: 3, isDefault: false, postCount: POSTS_BY_SPACE.amanita.length },
    { id: 4, name: "Psilocybin Stories", slug: "psilocybin", description: "Share psilocybin journeys and insights.", color: "#3B82F6", icon: "moon", sortOrder: 4, isDefault: false, postCount: POSTS_BY_SPACE.psilocybin.length },
    { id: 5, name: "Recovery & Healing", slug: "recovery", description: "Support for addiction recovery and trauma healing.", color: "#F59E0B", icon: "heart", sortOrder: 5, isDefault: false, postCount: POSTS_BY_SPACE.recovery.length },
    { id: 6, name: "Integration", slug: "integration", description: "How to integrate psychedelic experiences into daily life.", color: "#06B6D4", icon: "sun", sortOrder: 6, isDefault: false, postCount: POSTS_BY_SPACE.integration.length },
    { id: 7, name: "Questions & Answers", slug: "questions", description: "Ask questions and get answers from the community.", color: "#EC4899", icon: "help-circle", sortOrder: 7, isDefault: false, postCount: POSTS_BY_SPACE.questions.length },
  ]
};

console.log(JSON.stringify(seedData, null, 2));
