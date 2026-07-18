/* ============================================================
   Brain Camp — game data
   Themes (adventures), jerseys/outfits, words, trophies, shop.
   ============================================================ */

/* ---------- Learning paths (difficulty calibration) ---------- */
// Wilder Path = younger kids (~5): counting, letters, 3-letter words.
// Grey Path   = older kids (~7): bigger math, spelling, word problems.
const PATHS = {
  wilder: {
    id: "wilder",
    name: "Wilder Path",
    emoji: "🦁",
    age: 5,
    tier: "little",
    line: "Just right for age 5 — counting, letters, and first words!",
  },
  grey: {
    id: "grey",
    name: "Grey Path",
    emoji: "🐺",
    age: 7,
    tier: "big",
    line: "Just right for age 7 — bigger math, spelling, and word problems!",
  },
};

// XP needed per skill level — Wilder levels up faster than Grey.
const SKILL_XP_PER_LEVEL = { little: 8, big: 14 };

const THEMES = {
  soccer: {
    id: "soccer",
    name: "Soccer Star",
    emoji: "⚽",
    tagline: "You are the player on the team!",
    bg: ["#43cea2", "#185a9d"],
    outfitWord: "jersey",
    terms: {
      hub: "My Stadium",
      train: "Training Time",
      drills: {
        math: { name: "Goal-Count Math", icon: "🥅", line: "Count and add to score goals!" },
        reading: { name: "Playbook Reading", icon: "📖", line: "Read the coach's playbook!" },
        writing: { name: "Autograph Club", icon: "✍️", line: "Sign like a superstar!" },
      },
      match: {
        name: "Mini Match",
        rival: "The Robo Rovers",
        rivalEmoji: "🤖",
        steps: ["Pass", "Dribble", "Shoot"],
        scoreWord: "GOOOAL!",
        scoreEmoji: "⚽",
        winWord: "You won the Golden Cup!",
      },
      shop: "Team Shop",
      thingCounted: "⚽",
      problemNouns: ["goals", "passes", "saves"],
    },
    outfits: [
      { id: "messi", label: "Messi", sub: "Pink #10", number: "10", colors: { body: "#f7b5cd", sleeve: "#0f0f0f", text: "#0f0f0f" } },
      { id: "ronaldo", label: "Ronaldo", sub: "Yellow #7", number: "7", colors: { body: "#ffd200", sleeve: "#1c3fa8", text: "#1c3fa8" } },
      { id: "mbappe", label: "Mbappé", sub: "White #9", number: "9", colors: { body: "#ffffff", sleeve: "#d4af37", text: "#1a1a1a" } },
      { id: "haaland", label: "Haaland", sub: "Sky Blue #9", number: "9", colors: { body: "#6cabdd", sleeve: "#ffffff", text: "#1c2c5b" } },
      { id: "vini", label: "Vini Jr.", sub: "White #7", number: "7", colors: { body: "#ffffff", sleeve: "#5a2d82", text: "#5a2d82" } },
      { id: "bellingham", label: "Bellingham", sub: "White #5", number: "5", colors: { body: "#fefefe", sleeve: "#00529f", text: "#00529f" } },
      { id: "alexia", label: "Alexia", sub: "Blue-Red #11", number: "11", colors: { body: "#a50044", sleeve: "#004d98", text: "#ffffff" } },
      { id: "kerr", label: "Sam Kerr", sub: "Blue #20", number: "20", colors: { body: "#034694", sleeve: "#ffffff", text: "#ffffff" } },
      { id: "zlatan", label: "Zlatan", sub: "Legend #11", number: "11", colors: { body: "#fb090b", sleeve: "#000000", text: "#ffffff" }, cost: 80 },
      { id: "bale", label: "Bale", sub: "Legend #11", number: "11", colors: { body: "#da291c", sleeve: "#ffffff", text: "#ffffff" }, cost: 80 },
    ],
    skills: {
      math: { name: "Shooting", emoji: "🥅" },
      reading: { name: "Passing", emoji: "🎯" },
      writing: { name: "Dribbling", emoji: "⚽" },
    },
    gear: [
      { id: "golden-cleat", emoji: "🥾", name: "Golden Cleat", power: "Super speed on the field!",
        missions: { little: { desc: "Finish 2 drills", stat: "drills", need: 2 }, big: { desc: "Finish 5 drills", stat: "drills", need: 5 } } },
      { id: "lightning-ball", emoji: "⚡", name: "Lightning Soccer Ball", power: "Your shots zoom like lightning!",
        missions: { little: { desc: "Get 8 answers right", stat: "rightTotal", need: 8 }, big: { desc: "Get 20 first-try answers", stat: "firstTry", need: 20 } } },
      { id: "rocket-shot", emoji: "🚀", name: "Rocket Shot", power: "Unstoppable rocket kicks!",
        missions: { little: { desc: "Score 3 goals in matches", stat: "goals", need: 3 }, big: { desc: "Win 2 matches", stat: "wins", need: 2 } } },
      { id: "super-gloves", emoji: "🧤", name: "Super Save Gloves", power: "Nothing gets past you!",
        missions: { little: { desc: "Earn 15 stars", stat: "stars", need: 15 }, big: { desc: "Earn 40 stars", stat: "stars", need: 40 } } },
      { id: "rainbow-dribble", emoji: "🌈", name: "Rainbow Dribble", power: "Dazzling rainbow moves!",
        missions: { little: { desc: "Finish 1 writing drill", stat: "writeDrills", need: 1 }, big: { desc: "Finish 3 writing drills", stat: "writeDrills", need: 3 } } },
    ],
    stickers: ["⚽", "🥅", "🏆", "🥇", "👟", "🧤", "📣", "🎉", "🌟", "🔥", "🦁", "⚡"],
    shopItems: [
      { id: "goldboot", label: "Golden Boot", emoji: "👟", cost: 30 },
      { id: "fireworks", label: "Stadium Fireworks", emoji: "🎆", cost: 45 },
      { id: "mascot", label: "Team Mascot", emoji: "🦁", cost: 60 },
      { id: "band", label: "Fan Band", emoji: "🎺", cost: 75 },
      { id: "cup", label: "Giant Cup", emoji: "🏆", cost: 100 },
      { id: "stadium", label: "Mega Stadium", emoji: "🏟️", cost: 150 },
    ],
  },

  football: {
    id: "football",
    name: "Football Hero",
    emoji: "🏈",
    tagline: "Lead your team down the field!",
    bg: ["#3a7d44", "#254d32"],
    outfitWord: "jersey",
    terms: {
      hub: "My Field",
      train: "Practice Time",
      drills: {
        math: { name: "Touchdown Math", icon: "🏈", line: "Add up the score!" },
        reading: { name: "Play-Call Reading", icon: "📖", line: "Read the play like a QB!" },
        writing: { name: "Locker Room Letters", icon: "✍️", line: "Write like a pro!" },
      },
      match: {
        name: "Big Game",
        rival: "The Steel Robots",
        rivalEmoji: "🤖",
        steps: ["Snap", "Run", "Touchdown"],
        scoreWord: "TOUCHDOWN!",
        scoreEmoji: "🏈",
        winWord: "You won the Big Game trophy!",
      },
      shop: "Pro Shop",
      thingCounted: "🏈",
      problemNouns: ["touchdowns", "catches", "yards"],
    },
    outfits: [
      { id: "mahomes", label: "Mahomes", sub: "Red #15", number: "15", colors: { body: "#e31837", sleeve: "#ffb81c", text: "#ffffff" } },
      { id: "allen", label: "Josh Allen", sub: "Blue #17", number: "17", colors: { body: "#00338d", sleeve: "#c60c30", text: "#ffffff" } },
      { id: "lamar", label: "Lamar", sub: "Purple #8", number: "8", colors: { body: "#241773", sleeve: "#9e7c0c", text: "#ffffff" } },
      { id: "hurts", label: "Hurts", sub: "Green #1", number: "1", colors: { body: "#004c54", sleeve: "#a5acaf", text: "#ffffff" } },
      { id: "ceedee", label: "CeeDee", sub: "White #88", number: "88", colors: { body: "#ffffff", sleeve: "#041e42", text: "#041e42" } },
      { id: "burrow", label: "Burrow", sub: "Orange #9", number: "9", colors: { body: "#fb4f14", sleeve: "#000000", text: "#000000" } },
      { id: "brady", label: "Brady", sub: "Legend #12", number: "12", colors: { body: "#d50a0a", sleeve: "#34302b", text: "#ffffff" }, cost: 80 },
      { id: "watt", label: "J.J. Watt", sub: "Legend #99", number: "99", colors: { body: "#000000", sleeve: "#ffb612", text: "#ffb612" }, cost: 80 },
    ],
    skills: {
      math: { name: "Throwing", emoji: "🏈" },
      reading: { name: "Play-Calling", emoji: "📋" },
      writing: { name: "Footwork", emoji: "👟" },
    },
    gear: [
      { id: "golden-cleats", emoji: "🥾", name: "Golden Cleats", power: "Super speed downfield!",
        missions: { little: { desc: "Finish 2 drills", stat: "drills", need: 2 }, big: { desc: "Finish 5 drills", stat: "drills", need: 5 } } },
      { id: "lightning-ball", emoji: "⚡", name: "Lightning Football", power: "Throws zoom like lightning!",
        missions: { little: { desc: "Get 8 answers right", stat: "rightTotal", need: 8 }, big: { desc: "Get 20 first-try answers", stat: "firstTry", need: 20 } } },
      { id: "rocket-arm", emoji: "🚀", name: "Rocket Arm", power: "Unstoppable rocket throws!",
        missions: { little: { desc: "Score 3 touchdowns", stat: "goals", need: 3 }, big: { desc: "Win 2 games", stat: "wins", need: 2 } } },
      { id: "mega-helmet", emoji: "🪖", name: "Mega Helmet", power: "Nothing stops you!",
        missions: { little: { desc: "Earn 15 stars", stat: "stars", need: 15 }, big: { desc: "Earn 40 stars", stat: "stars", need: 40 } } },
      { id: "victory-dance", emoji: "🕺", name: "Victory Dance", power: "The coolest end-zone dance!",
        missions: { little: { desc: "Finish 1 writing drill", stat: "writeDrills", need: 1 }, big: { desc: "Finish 3 writing drills", stat: "writeDrills", need: 3 } } },
    ],
    stickers: ["🏈", "🏟️", "🏆", "🥇", "🧢", "💪", "📣", "🎉", "🌟", "🔥", "🦅", "⚡"],
    shopItems: [
      { id: "helmet", label: "Gold Helmet", emoji: "🪖", cost: 30 },
      { id: "foam", label: "Foam Finger", emoji: "☝️", cost: 45 },
      { id: "mascot", label: "Team Eagle", emoji: "🦅", cost: 60 },
      { id: "jumbotron", label: "Jumbotron", emoji: "📺", cost: 75 },
      { id: "trophy", label: "Super Trophy", emoji: "🏆", cost: 100 },
      { id: "stadium", label: "Dome Stadium", emoji: "🏟️", cost: 150 },
    ],
  },

  basketball: {
    id: "basketball",
    name: "Hoops Hero",
    emoji: "🏀",
    tagline: "Light up the scoreboard!",
    bg: ["#f7971e", "#c1440e"],
    outfitWord: "jersey",
    terms: {
      hub: "My Court",
      train: "Practice Time",
      drills: {
        math: { name: "Swish Math", icon: "🏀", line: "Count buckets and add points!" },
        reading: { name: "Coach's Clipboard", icon: "📖", line: "Read the winning play!" },
        writing: { name: "All-Star Autographs", icon: "✍️", line: "Write like an all-star!" },
      },
      match: {
        name: "Mini Game",
        rival: "The Dunk Bots",
        rivalEmoji: "🤖",
        steps: ["Dribble", "Pass", "Shoot"],
        scoreWord: "SWISH!",
        scoreEmoji: "🏀",
        winWord: "You won the championship ring!",
      },
      shop: "Court Shop",
      thingCounted: "🏀",
      problemNouns: ["baskets", "rebounds", "points"],
    },
    outfits: [
      { id: "lebron", label: "LeBron", sub: "Gold #23", number: "23", colors: { body: "#fdb927", sleeve: "#552583", text: "#552583" } },
      { id: "curry", label: "Curry", sub: "Blue #30", number: "30", colors: { body: "#1d428a", sleeve: "#ffc72c", text: "#ffc72c" } },
      { id: "giannis", label: "Giannis", sub: "Green #34", number: "34", colors: { body: "#00471b", sleeve: "#eee1c6", text: "#eee1c6" } },
      { id: "clark", label: "Caitlin Clark", sub: "Red #22", number: "22", colors: { body: "#c8102e", sleeve: "#ffcd00", text: "#ffffff" } },
      { id: "wemby", label: "Wemby", sub: "Black #1", number: "1", colors: { body: "#0c0c0c", sleeve: "#c4ced4", text: "#c4ced4" } },
      { id: "aja", label: "A'ja Wilson", sub: "Black #22", number: "22", colors: { body: "#1b1b1b", sleeve: "#c8102e", text: "#c8102e" } },
      { id: "luka", label: "Luka", sub: "Star #77", number: "77", colors: { body: "#00538c", sleeve: "#b8c4ca", text: "#ffffff" }, cost: 80 },
      { id: "kd", label: "KD", sub: "Star #35", number: "35", colors: { body: "#e56020", sleeve: "#1d1160", text: "#ffffff" }, cost: 80 },
    ],
    skills: {
      math: { name: "Shooting", emoji: "🏀" },
      reading: { name: "Court Vision", emoji: "👀" },
      writing: { name: "Handles", emoji: "✋" },
    },
    gear: [
      { id: "golden-sneakers", emoji: "👟", name: "Golden Sneakers", power: "Jump higher than ever!",
        missions: { little: { desc: "Finish 2 drills", stat: "drills", need: 2 }, big: { desc: "Finish 5 drills", stat: "drills", need: 5 } } },
      { id: "lightning-ball", emoji: "⚡", name: "Lightning Ball", power: "Shots zoom like lightning!",
        missions: { little: { desc: "Get 8 answers right", stat: "rightTotal", need: 8 }, big: { desc: "Get 20 first-try answers", stat: "firstTry", need: 20 } } },
      { id: "rocket-jump", emoji: "🚀", name: "Rocket Jump", power: "Slam dunk from anywhere!",
        missions: { little: { desc: "Score 3 baskets in games", stat: "goals", need: 3 }, big: { desc: "Win 2 games", stat: "wins", need: 2 } } },
      { id: "magic-net", emoji: "🥅", name: "Magic Net", power: "Everything swishes!",
        missions: { little: { desc: "Earn 15 stars", stat: "stars", need: 15 }, big: { desc: "Earn 40 stars", stat: "stars", need: 40 } } },
      { id: "glow-headband", emoji: "🌈", name: "Glow Headband", power: "All-star rainbow style!",
        missions: { little: { desc: "Finish 1 writing drill", stat: "writeDrills", need: 1 }, big: { desc: "Finish 3 writing drills", stat: "writeDrills", need: 3 } } },
    ],
    stickers: ["🏀", "🗑️", "🏆", "🥇", "👟", "💪", "📣", "🎉", "🌟", "🔥", "🦖", "⚡"],
    shopItems: [
      { id: "kicks", label: "Super Kicks", emoji: "👟", cost: 30 },
      { id: "buzzer", label: "Buzzer Beater", emoji: "⏰", cost: 45 },
      { id: "mascot", label: "Dino Mascot", emoji: "🦖", cost: 60 },
      { id: "hoop", label: "Golden Hoop", emoji: "🗑️", cost: 75 },
      { id: "ring", label: "Champ Ring", emoji: "💍", cost: 100 },
      { id: "arena", label: "Mega Arena", emoji: "🏟️", cost: 150 },
    ],
  },

  pirate: {
    id: "pirate",
    name: "Pirate Adventure",
    emoji: "🏴‍☠️",
    tagline: "Sail the seas and find treasure!",
    bg: ["#2193b0", "#0b486b"],
    outfitWord: "captain coat",
    terms: {
      hub: "My Ship",
      train: "Crew Training",
      drills: {
        math: { name: "Treasure Math", icon: "💰", line: "Count the gold coins!" },
        reading: { name: "Map Reading", icon: "🗺️", line: "Read the treasure map!" },
        writing: { name: "Captain's Log", icon: "✍️", line: "Write in the ship's log!" },
      },
      match: {
        name: "Treasure Hunt",
        rival: "Captain Grumble",
        rivalEmoji: "🦜",
        steps: ["Sail", "Map", "Dig"],
        scoreWord: "TREASURE!",
        scoreEmoji: "💎",
        winWord: "You found the greatest treasure!",
      },
      shop: "Port Shop",
      thingCounted: "🪙",
      problemNouns: ["gold coins", "jewels", "maps"],
    },
    outfits: [
      { id: "red", label: "Captain Red", sub: "Brave coat", symbol: "☠", colors: { body: "#c0392b", sleeve: "#f1c40f", text: "#f1c40f" } },
      { id: "sea", label: "Sea Green", sub: "Wave rider", symbol: "☠", colors: { body: "#16a085", sleeve: "#ecf0f1", text: "#ecf0f1" } },
      { id: "night", label: "Midnight", sub: "Sneaky coat", symbol: "☠", colors: { body: "#2c3e50", sleeve: "#95a5a6", text: "#ecf0f1" } },
      { id: "royal", label: "Royal Blue", sub: "Fancy coat", symbol: "⚓", colors: { body: "#2980b9", sleeve: "#f39c12", text: "#f1c40f" } },
      { id: "rose", label: "Pink Pearl", sub: "Shiny coat", symbol: "⚓", colors: { body: "#e91e63", sleeve: "#ffd54f", text: "#fff8e1" } },
      { id: "gold", label: "Golden Captain", sub: "Legend coat", symbol: "👑", colors: { body: "#d4af37", sleeve: "#8e5b0a", text: "#5d4037" }, cost: 80 },
    ],
    skills: {
      math: { name: "Treasure Counting", emoji: "🪙" },
      reading: { name: "Map Reading", emoji: "🗺️" },
      writing: { name: "Log Writing", emoji: "📜" },
    },
    gear: [
      { id: "golden-boots", emoji: "🥾", name: "Golden Sea Boots", power: "Run the deck at super speed!",
        missions: { little: { desc: "Finish 2 trainings", stat: "drills", need: 2 }, big: { desc: "Finish 5 trainings", stat: "drills", need: 5 } } },
      { id: "lightning-compass", emoji: "🧭", name: "Lightning Compass", power: "Find treasure in a flash!",
        missions: { little: { desc: "Get 8 answers right", stat: "rightTotal", need: 8 }, big: { desc: "Get 20 first-try answers", stat: "firstTry", need: 20 } } },
      { id: "rocket-sails", emoji: "🚀", name: "Rocket Sails", power: "Fastest ship on the sea!",
        missions: { little: { desc: "Find 3 treasures in hunts", stat: "goals", need: 3 }, big: { desc: "Win 2 treasure hunts", stat: "wins", need: 2 } } },
      { id: "captains-crown", emoji: "👑", name: "Captain's Crown", power: "Ruler of the seven seas!",
        missions: { little: { desc: "Earn 15 stars", stat: "stars", need: 15 }, big: { desc: "Earn 40 stars", stat: "stars", need: 40 } } },
      { id: "rainbow-sails", emoji: "🌈", name: "Rainbow Sails", power: "The most dazzling ship afloat!",
        missions: { little: { desc: "Finish 1 log writing", stat: "writeDrills", need: 1 }, big: { desc: "Finish 3 log writings", stat: "writeDrills", need: 3 } } },
    ],
    stickers: ["🏴‍☠️", "⚓", "💎", "🪙", "🦜", "🗺️", "⛵", "🎉", "🌟", "🐙", "🧭", "🌊"],
    shopItems: [
      { id: "parrot", label: "Pet Parrot", emoji: "🦜", cost: 30 },
      { id: "spyglass", label: "Spyglass", emoji: "🔭", cost: 45 },
      { id: "octopus", label: "Octopus Pal", emoji: "🐙", cost: 60 },
      { id: "cannon", label: "Confetti Cannon", emoji: "🎉", cost: 75 },
      { id: "chest", label: "Treasure Chest", emoji: "🧰", cost: 100 },
      { id: "ship", label: "Mega Ship", emoji: "⛵", cost: 150 },
    ],
  },

  monster: {
    id: "monster",
    name: "Monster Quest",
    emoji: "🐉",
    tagline: "Catch friendly monsters as you learn!",
    bg: ["#f953c6", "#b91d73"],
    outfitWord: "trainer outfit",
    terms: {
      hub: "My Camp",
      train: "Trainer School",
      drills: {
        math: { name: "Monster Math", icon: "🔢", line: "Count monster berries!" },
        reading: { name: "Spell Scrolls", icon: "📜", line: "Read the magic scrolls!" },
        writing: { name: "Rune Writing", icon: "✍️", line: "Write magic runes!" },
      },
      match: {
        name: "Monster Hunt",
        rival: "The Shadow Gang",
        rivalEmoji: "👻",
        steps: ["Find", "Battle", "Catch"],
        scoreWord: "CAUGHT ONE!",
        scoreEmoji: "🐉",
        winWord: "You became a Monster Master!",
      },
      shop: "Monster Mart",
      thingCounted: "🫐",
      problemNouns: ["berries", "monsters", "magic stones"],
    },
    outfits: [
      { id: "spark", label: "Spark Trainer", sub: "Team ⚡", symbol: "★", colors: { body: "#f1c40f", sleeve: "#e67e22", text: "#7d3c00" } },
      { id: "aqua", label: "Aqua Trainer", sub: "Team 💧", symbol: "★", colors: { body: "#3498db", sleeve: "#ecf0f1", text: "#ffffff" } },
      { id: "leaf", label: "Leaf Trainer", sub: "Team 🌿", symbol: "★", colors: { body: "#27ae60", sleeve: "#f1c40f", text: "#ffffff" } },
      { id: "flame", label: "Flame Trainer", sub: "Team 🔥", symbol: "★", colors: { body: "#e74c3c", sleeve: "#f39c12", text: "#ffffff" } },
      { id: "shadow", label: "Moon Trainer", sub: "Team 🌙", symbol: "★", colors: { body: "#8e44ad", sleeve: "#2c3e50", text: "#f5eef8" } },
      { id: "rainbow", label: "Rainbow Master", sub: "Legend", symbol: "✦", colors: { body: "#ff6bcb", sleeve: "#4facfe", text: "#ffffff" }, cost: 80 },
    ],
    skills: {
      math: { name: "Battle Power", emoji: "💥" },
      reading: { name: "Spell Reading", emoji: "📖" },
      writing: { name: "Rune Magic", emoji: "🔮" },
    },
    gear: [
      { id: "golden-boots", emoji: "🥾", name: "Golden Trail Boots", power: "Trek anywhere at super speed!",
        missions: { little: { desc: "Finish 2 trainings", stat: "drills", need: 2 }, big: { desc: "Finish 5 trainings", stat: "drills", need: 5 } } },
      { id: "lightning-charm", emoji: "⚡", name: "Lightning Charm", power: "Charge up mega energy!",
        missions: { little: { desc: "Get 8 answers right", stat: "rightTotal", need: 8 }, big: { desc: "Get 20 first-try answers", stat: "firstTry", need: 20 } } },
      { id: "sky-wings", emoji: "🪽", name: "Sky Wings", power: "Soar above the clouds!",
        missions: { little: { desc: "Catch 3 monsters in hunts", stat: "goals", need: 3 }, big: { desc: "Win 2 monster hunts", stat: "wins", need: 2 } } },
      { id: "star-shield", emoji: "🛡️", name: "Star Shield", power: "Block any shadow attack!",
        missions: { little: { desc: "Earn 15 stars", stat: "stars", need: 15 }, big: { desc: "Earn 40 stars", stat: "stars", need: 40 } } },
      { id: "rainbow-aura", emoji: "🌈", name: "Rainbow Aura", power: "Glow with legendary power!",
        missions: { little: { desc: "Finish 1 rune writing", stat: "writeDrills", need: 1 }, big: { desc: "Finish 3 rune writings", stat: "writeDrills", need: 3 } } },
    ],
    stickers: ["🐉", "🦊", "🐢", "🐸", "🦄", "👾", "🌟", "🎉", "🔮", "⚡", "🫐", "🌈"],
    shopItems: [
      { id: "fox", label: "Sparkfox Pal", emoji: "🦊", cost: 30 },
      { id: "turtle", label: "Aquashell Pal", emoji: "🐢", cost: 45 },
      { id: "frog", label: "Leafhopper Pal", emoji: "🐸", cost: 60 },
      { id: "unicorn", label: "Starhorn Pal", emoji: "🦄", cost: 75 },
      { id: "dragon", label: "Emberdrake Pal", emoji: "🐉", cost: 100 },
      { id: "castle", label: "Monster Castle", emoji: "🏰", cost: 150 },
    ],
  },
};

/* ---------- Emoji faces (if no photo uploaded) ---------- */
const FACE_OPTIONS = ["😀", "😄", "🥰", "😎", "🤩", "🦸", "🦸‍♀️", "🐯", "🐼", "🦄"];

/* ---------- Word banks ---------- */
// Pictures + words for "starts with", rhyming, spelling.
const PICTURE_WORDS = [
  { word: "cat", emoji: "🐱" }, { word: "dog", emoji: "🐶" }, { word: "sun", emoji: "☀️" },
  { word: "hat", emoji: "🎩" }, { word: "bus", emoji: "🚌" }, { word: "map", emoji: "🗺️" },
  { word: "bee", emoji: "🐝" }, { word: "pig", emoji: "🐷" }, { word: "fox", emoji: "🦊" },
  { word: "cow", emoji: "🐮" }, { word: "star", emoji: "⭐" }, { word: "fish", emoji: "🐟" },
  { word: "frog", emoji: "🐸" }, { word: "cake", emoji: "🎂" }, { word: "boat", emoji: "⛵" },
  { word: "moon", emoji: "🌙" }, { word: "ball", emoji: "⚽" }, { word: "bear", emoji: "🐻" },
  { word: "duck", emoji: "🦆" }, { word: "lion", emoji: "🦁" }, { word: "apple", emoji: "🍎" },
  { word: "snake", emoji: "🐍" }, { word: "train", emoji: "🚂" }, { word: "mouse", emoji: "🐭" },
  { word: "house", emoji: "🏠" }, { word: "pizza", emoji: "🍕" }, { word: "tiger", emoji: "🐯" },
  { word: "robot", emoji: "🤖" },
];

const RHYME_SETS = [
  { base: { word: "cat", emoji: "🐱" }, rhyme: { word: "hat", emoji: "🎩" }, wrong: [{ word: "dog", emoji: "🐶" }, { word: "sun", emoji: "☀️" }] },
  { base: { word: "frog", emoji: "🐸" }, rhyme: { word: "dog", emoji: "🐶" }, wrong: [{ word: "fish", emoji: "🐟" }, { word: "bee", emoji: "🐝" }] },
  { base: { word: "bee", emoji: "🐝" }, rhyme: { word: "tree", emoji: "🌳" }, wrong: [{ word: "cow", emoji: "🐮" }, { word: "hat", emoji: "🎩" }] },
  { base: { word: "moon", emoji: "🌙" }, rhyme: { word: "spoon", emoji: "🥄" }, wrong: [{ word: "star", emoji: "⭐" }, { word: "cake", emoji: "🎂" }] },
  { base: { word: "cake", emoji: "🎂" }, rhyme: { word: "snake", emoji: "🐍" }, wrong: [{ word: "pig", emoji: "🐷" }, { word: "boat", emoji: "⛵" }] },
  { base: { word: "car", emoji: "🚗" }, rhyme: { word: "star", emoji: "⭐" }, wrong: [{ word: "bus", emoji: "🚌" }, { word: "duck", emoji: "🦆" }] },
  { base: { word: "mouse", emoji: "🐭" }, rhyme: { word: "house", emoji: "🏠" }, wrong: [{ word: "lion", emoji: "🦁" }, { word: "ball", emoji: "⚽" }] },
  { base: { word: "goat", emoji: "🐐" }, rhyme: { word: "boat", emoji: "⛵" }, wrong: [{ word: "bear", emoji: "🐻" }, { word: "sun", emoji: "☀️" }] },
];

const SIGHT_WORDS_LITTLE = ["the", "and", "see", "you", "me", "go", "we", "my", "is", "it", "up", "at", "in", "can", "big"];
const SIGHT_WORDS_BIG = ["because", "friend", "before", "again", "could", "every", "found", "always", "around", "please", "right", "their", "which", "would", "people"];

const OPPOSITES = [
  ["hot", "cold"], ["big", "small"], ["fast", "slow"], ["up", "down"],
  ["happy", "sad"], ["day", "night"], ["open", "closed"], ["loud", "quiet"],
  ["wet", "dry"], ["full", "empty"],
];

// Misspelling challenges for big kids: correct + 2 wrong spellings.
const SPELL_CHALLENGES = [
  { emoji: "🐘", options: ["elephant", "elefant", "elephent"], answer: "elephant" },
  { emoji: "🏫", options: ["school", "skool", "shcool"], answer: "school" },
  { emoji: "🍎", options: ["apple", "appel", "aple"], answer: "apple" },
  { emoji: "🐢", options: ["turtle", "tertle", "turtel"], answer: "turtle" },
  { emoji: "🌈", options: ["rainbow", "ranebow", "rainbo"], answer: "rainbow" },
  { emoji: "🦒", options: ["giraffe", "jiraffe", "girafe"], answer: "giraffe" },
  { emoji: "🍕", options: ["pizza", "peetza", "piza"], answer: "pizza" },
  { emoji: "🚀", options: ["rocket", "rockit", "roket"], answer: "rocket" },
  { emoji: "🦋", options: ["butterfly", "buterfly", "butterflie"], answer: "butterfly" },
  { emoji: "⚽", options: ["soccer", "socker", "soccor"], answer: "soccer" },
];

// Sentence completion (theme-flavored versions get generated too).
const SENTENCES_BIG = [
  { text: "The fish swims in the ___.", answer: "water", wrong: ["tree", "hat"] },
  { text: "We sleep in a ___.", answer: "bed", wrong: ["shoe", "cloud"] },
  { text: "The sun is very ___.", answer: "bright", wrong: ["sleepy", "square"] },
  { text: "I use my eyes to ___.", answer: "see", wrong: ["jump", "eat"] },
  { text: "A baby dog is a ___.", answer: "puppy", wrong: ["kitten", "cub"] },
  { text: "Rain falls from the ___.", answer: "sky", wrong: ["floor", "oven"] },
];

// Words for tile-building. little = 3 letters, big = 4-6 letters.
const TILE_WORDS_LITTLE = PICTURE_WORDS.filter((w) => w.word.length === 3);
const TILE_WORDS_BIG = PICTURE_WORDS.filter((w) => w.word.length >= 4 && w.word.length <= 5);

/* ---------- Trophies ---------- */
const TROPHIES = [
  { id: "first-drill", emoji: "🎽", name: "First Practice", desc: "Finish your first drill" },
  { id: "math-star", emoji: "🔢", name: "Math Star", desc: "Get 15 math answers right" },
  { id: "reading-rocket", emoji: "🚀", name: "Reading Rocket", desc: "Get 15 reading answers right" },
  { id: "writing-wizard", emoji: "🪄", name: "Writing Wizard", desc: "Finish 5 writing drills" },
  { id: "first-win", emoji: "🏆", name: "First Big Win", desc: "Win your first match" },
  { id: "champion", emoji: "👑", name: "Champion", desc: "Win 3 matches" },
  { id: "super-saver", emoji: "💰", name: "Super Saver", desc: "Save up 100 coins" },
  { id: "star-collector", emoji: "🌟", name: "Star Collector", desc: "Earn 50 stars" },
  { id: "sticker-fan", emoji: "🎨", name: "Sticker Fan", desc: "Collect 8 stickers" },
];

const PRAISE_WORDS = ["Awesome!", "Super!", "You got it!", "Amazing!", "Wow!", "Great job!", "Yes!", "Brilliant!", "Nice one!"];
const GENTLE_WORDS = ["Almost!", "Try again!", "So close!", "Keep going!"];
