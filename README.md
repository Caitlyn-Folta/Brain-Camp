# Brain Camp ⚽🏈🏀🏴‍☠️🐉

> Art direction: bright anime-sports-comic style — cel-shaded full-body
> players with bold outlines, sunny stadium skies over the pitch, diamond
> panels, speed lines, and hard comic shadows.

A colorful learning game for kids (ages ~4–8) that practices **math, reading,
and writing** — wrapped in an adventure your kid picks. The big idea:
**"You are the player on the team."** Your kid adds their photo, picks a
jersey, and becomes the hero of their own mini sports (or pirate, or monster)
journey.

## How to play

Just open `index.html` in any modern browser — no install, no internet needed
after loading. Works great on a tablet or phone (touch-friendly, big buttons).

> Tip: every question is read out loud, so pre-readers (age 4–5) can play
> too. The game automatically picks the most natural voice your device
> offers, and grown-ups can change it (with tap-to-hear samples) under
> **Grown-ups: voice & players** on the home screen. Microsoft Edge has the
> most natural free voices; on iPad/iPhone you can download extra natural
> voices in Settings → Accessibility → Spoken Content → Voices, and they'll
> appear in the picker.

## What's inside

### 1. Create your player
- Type a name or nickname and pick a learning path:
  - 🦁 **Wilder Path** (age ~5): counting, letter sounds, sight words,
    3-letter words — and skills level up faster.
  - 🐺 **Grey Path** (age ~7): sums to 100, spelling, opposites, and
    word problems.
  Paths can be switched any time from the player's home screen (tap the
  path badge), so the game grows with each kid.
- **Pick your adventure:** Soccer Star ⚽, Football Hero 🏈, Hoops Hero 🏀,
  Pirate Adventure 🏴‍☠️, or Monster Quest 🐉.
- **Pick your jersey:** soccer jerseys are inspired by today's most famous
  players — Lamine Yamal, Kylian Mbappé, Jude Bellingham, Harry Kane,
  Lionel Messi, and Neymar — with legend jerseys (Ronaldo, Zlatan) to
  unlock in the shop. Football and basketball have their own star jerseys;
  pirates get captain coats and monster trainers get team outfits.
- **Add a photo** (kept only on your device, never uploaded anywhere) or pick
  a fun emoji face. Your kid's face sits right on top of their jersey.

### 2. Train — learning games framed as drills
Each drill is 5 quick tasks (~30–60 seconds) with instant celebration:
- **Math drill** (e.g. "Goal-Count Math"): counting, addition, comparing,
  missing numbers → subtraction, missing addends, skip counting, and
  theme-flavored word problems for older kids.
- **Reading drill** (e.g. "Playbook Reading"): letter matching, beginning
  sounds, sight words (read aloud!), rhyming → spelling choices, opposites,
  and sentence completion.
- **Writing drill** (e.g. "Autograph Club"): rainbow finger-tracing of
  letters and numbers on a canvas, plus build-the-word letter tiles
  (with decoy letters for older kids).

Wrong answers are gentle: one retry, then the answer is kindly shown and the
game moves on. No fail states, ever.

### 3. Play — a mini match using the skills they just practiced
Answer questions to **Pass → Dribble → Shoot** (or Sail → Map → Dig…).
Three correct answers = a GOAL with confetti. First to 3 wins! If the robo
rivals win, kids get an upbeat "so close!" screen, a small reward, and a
one-tap rematch — losing is just a nudge back to training.

### 4. Earn — rewards every 30–60 seconds
- 🎯 **Bonus shots**: right answers earn penalty kicks (8 on the Wilder
  Path, 12 on the Grey Path). Each one is a touch-controlled 3-kick
  shootout — swipe up on the phone/tablet screen to shoot past the moving
  robo-keeper for extra coins and stars. Themed per adventure: Penalty
  Kick, Field Goal, Buzzer Shot, Cannon Blast, or Magic Shot.
- 🪙 **Coins** after every drill and match
- ⭐ **Stars** that level your player up (questions get a bit harder as you level)
- ⚡ **Power-up gear** earned through missions: Golden Cleat, Lightning
  Soccer Ball, Rocket Shot, Super Save Gloves, Rainbow Dribble (each theme
  has its own set). Missions are age-calibrated — Wilder Path missions are
  simpler ("finish 2 drills") than Grey Path ones ("get 20 first-try
  answers"), so both kids earn gear at a satisfying pace.
- 📈 **Skill-ups for soccer moves**: correct answers earn XP toward
  Shooting (math), Passing (reading), and Dribbling (writing) skill levels,
  shown as progress bars. Wilder Path needs less XP per level than Grey.
- 🎨 **Stickers** for the sticker book
- 🏆 **Trophies** for milestones (first drill, math star, champion…)
- 🛍️ A **shop** to spend coins on legend jerseys and fun stadium items
  displayed in your kid's own stadium/ship/camp

### 5. Track — see each kid improve
Every kid's player saves its own progress separately (perfect for siblings
sharing a tablet). The **My Progress** screen shows:
- Skill levels and progress bars for each soccer move
- "Am I improving?" — recent drill accuracy vs. earlier drills per subject,
  with an encouraging trend note
- Totals: drills done, matches won, right answers, first-try answers,
  stars, and power-ups collected

## For grown-ups
- Multiple kids can each have their own player on the same device (great for
  a 5- and a 7-year-old sharing a tablet) — progress, rewards, and stats are
  saved per player.
- The "My Progress" screen doubles as your window into how each kid is doing:
  accuracy trends per subject show whether practice is paying off.
- All progress and photos stay in the browser's local storage on your device.
- "Grown-ups: manage players" on the home screen lets you delete a profile.

## Tech
Plain HTML/CSS/JavaScript — no frameworks, no build step, no network calls.
- `index.html` — shell
- `css/styles.css` — kid-friendly styling and animations
- `js/data.js` — themes, jerseys/outfits, word banks, trophies, shop items
- `js/questions.js` — age-tiered question generators
- `js/app.js` — screens, drill & match runners, tracing canvas, rewards
