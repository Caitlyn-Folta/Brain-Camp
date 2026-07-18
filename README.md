# Brain Camp ⚽🏈🏀🏴‍☠️🐉

A colorful learning game for kids (ages ~4–8) that practices **math, reading,
and writing** — wrapped in an adventure your kid picks. The big idea:
**"You are the player on the team."** Your kid adds their photo, picks a
jersey, and becomes the hero of their own mini sports (or pirate, or monster)
journey.

## How to play

Just open `index.html` in any modern browser — no install, no internet needed
after loading. Works great on a tablet or phone (touch-friendly, big buttons).

> Tip: for the read-aloud voice, use Chrome/Edge/Safari. Every question is
> spoken out loud, so pre-readers (age 4–5) can play too.

## What's inside

### 1. Create your player
- Type a name or nickname and pick an age (4–8). Age sets the difficulty:
  **5-and-under** gets counting, letters, and 3-letter words; **7-and-up**
  gets bigger sums, spelling, and word problems.
- **Pick your adventure:** Soccer Star ⚽, Football Hero 🏈, Hoops Hero 🏀,
  Pirate Adventure 🏴‍☠️, or Monster Quest 🐉.
- **Pick your jersey:** soccer jerseys are inspired by today's most famous
  players (Messi, Ronaldo, Mbappé, Haaland, Vini Jr., Bellingham, Alexia
  Putellas, Sam Kerr) with legend jerseys (Zlatan, Bale) to unlock. Football
  and basketball have their own star jerseys; pirates get captain coats and
  monster trainers get team outfits.
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
- 🪙 **Coins** after every drill and match
- ⭐ **Stars** that level your player up (questions get a bit harder as you level)
- 🎨 **Stickers** for the sticker book
- 🏆 **Trophies** for milestones (first drill, math star, champion…)
- 🛍️ A **shop** to spend coins on legend jerseys and fun stadium items
  displayed in your kid's own stadium/ship/camp

## For grown-ups
- Multiple kids can each have their own player on the same device (great for
  a 5- and a 7-year-old sharing a tablet).
- All progress and photos stay in the browser's local storage on your device.
- "Grown-ups: manage players" on the home screen lets you delete a profile.

## Tech
Plain HTML/CSS/JavaScript — no frameworks, no build step, no network calls.
- `index.html` — shell
- `css/styles.css` — kid-friendly styling and animations
- `js/data.js` — themes, jerseys/outfits, word banks, trophies, shop items
- `js/questions.js` — age-tiered question generators
- `js/app.js` — screens, drill & match runners, tracing canvas, rewards
