/* ============================================================
   Brain Camp — main app
   Screens, player profiles, drill & match runners, rewards.
   ============================================================ */

/* ------------------------ tiny helpers ------------------------ */
const $screen = document.getElementById("screen");
const $overlay = document.getElementById("overlay");
const $confetti = document.getElementById("confetti-layer");

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function setThemeColors(theme) {
  const [a, b] = theme ? theme.bg : ["#4facfe", "#00f2fe"];
  document.documentElement.style.setProperty("--bg1", a);
  document.documentElement.style.setProperty("--bg2", b);
}

/* --------------------------- audio --------------------------- */
let audioCtx = null;
function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  return audioCtx;
}
function tone(freq, start, dur, type = "sine", vol = 0.18) {
  const ac = ctx();
  if (!ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, ac.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + dur);
  o.connect(g).connect(ac.destination);
  o.start(ac.currentTime + start);
  o.stop(ac.currentTime + start + dur + 0.05);
}
const sfx = {
  click: () => tone(500, 0, 0.08, "triangle", 0.1),
  correct: () => { tone(660, 0, 0.12, "triangle"); tone(880, 0.1, 0.18, "triangle"); },
  wrong: () => tone(220, 0, 0.25, "sine", 0.12),
  coin: () => { tone(988, 0, 0.08, "square", 0.08); tone(1319, 0.08, 0.16, "square", 0.08); },
  fanfare: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25, "triangle")),
  whistle: () => { tone(2200, 0, 0.15, "square", 0.06); tone(2200, 0.2, 0.3, "square", 0.06); },
};

/* ---- speech: pick the most natural voice the device offers ---- */
const VOICE_KEY = "braincamp.voiceURI"; // per device, shared by all players
let VOICES = [];

// Higher score = more natural. Neural/enhanced voices (Edge, iOS premium,
// Android "Natural", Chrome's Google voices) rank far above the old
// robotic system voices.
function voiceScore(v) {
  if (!/^en/i.test(v.lang)) return -1;
  const n = (v.name + " " + v.voiceURI).toLowerCase();
  let s = 0;
  if (/natural|neural/.test(n)) s += 80;
  if (/premium|enhanced|superior/.test(n)) s += 60;
  if (/google/.test(n)) s += 50;
  if (/online/.test(n)) s += 15;
  if (/samantha|ava|allison|zoe|joelle|aria|jenny|michelle|sonia|libby|karen|moira|tessa/.test(n)) s += 25;
  if (/zira|david|mark|fred|albert|junior|kathy|ralph|zarvox|trinoids|whisper|bells|organ|cellos|bad news|good news|bahh|boing|bubbles|deranged|hysterical|compact|espeak|eloquence|grandma|grandpa|flo|sandy|shelley|reed|rocko/.test(n)) s -= 70;
  if (/en[-_](us|gb|au|ca)/i.test(v.lang)) s += 10;
  if (v.default) s += 2;
  return s;
}

function refreshVoices() {
  try { VOICES = speechSynthesis.getVoices() || []; } catch (e) { VOICES = []; }
}
if ("speechSynthesis" in window) {
  refreshVoices();
  speechSynthesis.addEventListener?.("voiceschanged", refreshVoices);
}

function rankedVoices() {
  return VOICES.map((v) => ({ v, s: voiceScore(v) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.v);
}

function currentVoice() {
  if (!VOICES.length) refreshVoices();
  const savedURI = localStorage.getItem(VOICE_KEY);
  if (savedURI) {
    const saved = VOICES.find((v) => v.voiceURI === savedURI);
    if (saved) return saved;
  }
  return rankedVoices()[0] || null;
}

function speak(text) {
  try {
    if (!("speechSynthesis" in window) || !text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = currentVoice();
    if (v) u.voice = v;
    // Natural voices sound best near their native rate/pitch; only the
    // older robotic voices benefit from a gentler pace.
    const n = v ? (v.name + " " + v.voiceURI).toLowerCase() : "";
    const natural = /natural|neural|premium|enhanced|google|online/.test(n);
    u.rate = natural ? 1.0 : 0.95;
    u.pitch = natural ? 1.0 : 1.05;
    speechSynthesis.speak(u);
  } catch (e) { /* speech is a bonus, never break the game */ }
}

/* ------------------------- persistence ------------------------- */
const STORE_KEY = "braincamp.players.v1";

function loadPlayers() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
  catch (e) { return []; }
}
function savePlayers(players) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(players)); }
  catch (e) { console.warn("Could not save", e); }
}
function saveCurrent() {
  if (!P) return;
  const players = loadPlayers();
  const i = players.findIndex((p) => p.id === P.id);
  if (i >= 0) players[i] = P; else players.push(P);
  savePlayers(players);
}

let P = null; // current player profile

function newProfile() {
  return {
    id: "p" + Date.now() + Math.floor(Math.random() * 999),
    name: "",
    path: "wilder", // "wilder" (≈5) or "grey" (≈7) — sets difficulty
    age: 5,
    themeId: "soccer",
    outfitId: null,
    photo: null,   // dataURL
    face: "😀",    // emoji fallback
    coins: 0,
    stars: 0,
    stickers: [],
    trophies: [],
    gear: [],      // earned power-up gear ids
    unlockedOutfits: [],
    unlockedItems: [],
    skills: { math: 0, reading: 0, writing: 0 }, // XP per skill
    history: [],   // {d, kind:"drill"|"match", subject?, right?, total?, won?}
    stats: { drills: 0, wins: 0, mathRight: 0, readRight: 0, writeDrills: 0, firstTry: 0, rightTotal: 0, goals: 0 },
  };
}

// Fill in fields for profiles saved by older versions of the game.
function normalizeProfile(p) {
  if (!p.path) p.path = p.age <= 5 ? "wilder" : "grey";
  if (!p.skills) p.skills = { math: 0, reading: 0, writing: 0 };
  if (!p.history) p.history = [];
  if (!p.gear) p.gear = [];
  const s = p.stats || (p.stats = {});
  for (const k of ["drills", "wins", "mathRight", "readRight", "writeDrills", "firstTry", "rightTotal", "goals"]) {
    if (typeof s[k] !== "number") s[k] = 0;
  }
  return p;
}

const pathOf = (p) => PATHS[p.path] || (p.age <= 5 ? PATHS.wilder : PATHS.grey);
const tierOf = (p) => pathOf(p).tier;
const themeOf = (p) => THEMES[p.themeId] || THEMES.soccer;
const levelOf = (p) => 1 + Math.floor((p.stars || 0) / 25);
function outfitOf(p) {
  const t = themeOf(p);
  return t.outfits.find((o) => o.id === p.outfitId) || t.outfits[0];
}

// Skill levels: Wilder needs less XP per level than Grey (age-calibrated).
function skillLevel(p, subject) {
  const per = SKILL_XP_PER_LEVEL[tierOf(p)];
  const xp = (p.skills && p.skills[subject]) || 0;
  return { level: 1 + Math.floor(xp / per), pct: Math.round(((xp % per) / per) * 100), xp, per };
}

// Central place to record a correct answer: stats + skill XP.
function recordAnswer(subject, firstTry) {
  if (!P) return;
  P.stats.rightTotal++;
  if (firstTry) P.stats.firstTry++;
  if (subject === "math") P.stats.mathRight++;
  if (subject === "reading") P.stats.readRight++;
  P.skills[subject] = (P.skills[subject] || 0) + (firstTry ? 2 : 1);
}

function pushHistory(entry) {
  entry.d = Date.now();
  P.history.push(entry);
  if (P.history.length > 150) P.history = P.history.slice(-150);
}

/* --------------------------- avatar --------------------------- */
let __svgUid = 0;
function jerseySVG(outfit, size = 90) {
  const c = outfit.colors;
  const label = outfit.number || outfit.symbol || "★";
  const uid = ++__svgUid; // unique gradient/clip ids per render
  const torso = "M38 18 Q60 30 82 18 L86 90 Q60 99 34 90 Z";
  let stripes = "";
  if (c.stripes) {
    const n = 6, w = (88 - 32) / n;
    for (let i = 0; i < n; i++) {
      stripes += `<rect x="${32 + i * w}" y="14" width="${w + 0.6}" height="88" fill="${c.stripes[i % c.stripes.length]}"/>`;
    }
  }
  return `
  <svg width="${size}" height="${Math.round(size * 0.84)}" viewBox="0 0 120 101" aria-hidden="true">
    <defs>
      <clipPath id="torso${uid}"><path d="${torso}"/></clipPath>
      <linearGradient id="shine${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.34"/>
        <stop offset="0.45" stop-color="#ffffff" stop-opacity="0.05"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0.2"/>
      </linearGradient>
    </defs>
    <path d="M38 18 L15 29 L23 49 L37 42 Z" fill="${c.sleeve}" stroke="#1b2450" stroke-width="3" stroke-linejoin="round"/>
    <path d="M82 18 L105 29 L97 49 L83 42 Z" fill="${c.sleeve}" stroke="#1b2450" stroke-width="3" stroke-linejoin="round"/>
    <path d="M17 44 L23 49 L27 39" fill="none" stroke="#1b2450" stroke-width="2" opacity="0.35"/>
    <path d="M103 44 L97 49 L93 39" fill="none" stroke="#1b2450" stroke-width="2" opacity="0.35"/>
    <path d="${torso}" fill="${c.body}"/>
    ${stripes ? `<g clip-path="url(#torso${uid})">${stripes}</g>` : ""}
    <path d="${torso}" fill="url(#shine${uid})" stroke="#1b2450" stroke-width="3" stroke-linejoin="round"/>
    <path d="M48 17 Q60 30 72 17" fill="none" stroke="#1b2450" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M48 17 Q60 30 72 17" fill="none" stroke="${c.sleeve}" stroke-width="2" stroke-linecap="round"/>
    <text x="60" y="70" text-anchor="middle" font-size="${label.length > 1 ? 32 : 36}" font-weight="900"
      font-family="'Arial Black', Arial, sans-serif" fill="${c.text}" stroke="#1b2450" stroke-width="1.4" paint-order="stroke">${label}</text>
  </svg>`;
}

// Full-body cel-shaded player: jersey, shorts, socks, cleats, raised
// fist, ball at the feet — anime-sports style with bold outlines.
function playerBodySVG(outfit, size, ballEmoji) {
  const c = outfit.colors;
  const label = outfit.number || outfit.symbol || "★";
  const uid = ++__svgUid;
  const OUT = "#1b2450";
  const skin = "#f6c9a0";
  const shorts = c.sleeve;
  const sock = c.stripes ? c.stripes[1] : c.body;
  const torso = "M46 24 Q75 36 104 24 L107 92 Q75 100 43 92 Z";
  let stripes = "";
  if (c.stripes) {
    const n = 6, w = (108 - 42) / n;
    for (let i = 0; i < n; i++) {
      stripes += `<rect x="${42 + i * w}" y="20" width="${w + 0.6}" height="82" fill="${c.stripes[i % c.stripes.length]}"/>`;
    }
  }
  return `
  <svg width="${size}" height="${Math.round(size * 1.28)}" viewBox="0 0 150 192" aria-hidden="true">
    <defs>
      <clipPath id="torso${uid}"><path d="${torso}"/></clipPath>
      <linearGradient id="shine${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.32"/>
        <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.04"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0.16"/>
      </linearGradient>
    </defs>
    <ellipse cx="78" cy="183" rx="52" ry="8" fill="rgba(20,30,60,0.2)"/>
    <!-- left arm (down) -->
    <path d="M30 44 L17 72" stroke="${OUT}" stroke-width="16" stroke-linecap="round" fill="none"/>
    <path d="M30 44 L17 72" stroke="${skin}" stroke-width="10" stroke-linecap="round" fill="none"/>
    <circle cx="16" cy="76" r="7.5" fill="${skin}" stroke="${OUT}" stroke-width="3"/>
    <!-- right arm (fist raised) -->
    <path d="M121 42 L134 19" stroke="${OUT}" stroke-width="16" stroke-linecap="round" fill="none"/>
    <path d="M121 42 L134 19" stroke="${skin}" stroke-width="10" stroke-linecap="round" fill="none"/>
    <circle cx="135" cy="14" r="7.5" fill="${skin}" stroke="${OUT}" stroke-width="3"/>
    <!-- legs / socks -->
    <path d="M57 120 L53 158" stroke="${OUT}" stroke-width="20" stroke-linecap="round" fill="none"/>
    <path d="M57 120 L53 158" stroke="${sock}" stroke-width="13" stroke-linecap="round" fill="none"/>
    <path d="M93 120 L99 148" stroke="${OUT}" stroke-width="20" stroke-linecap="round" fill="none"/>
    <path d="M93 120 L99 148" stroke="${sock}" stroke-width="13" stroke-linecap="round" fill="none"/>
    <!-- cleats -->
    <rect x="34" y="153" width="32" height="14" rx="7" fill="#232c52" stroke="${OUT}" stroke-width="3"/>
    <rect x="86" y="141" width="30" height="13" rx="6.5" fill="#232c52" stroke="${OUT}" stroke-width="3" transform="rotate(-14 101 147)"/>
    <path d="M40 158 L58 158" stroke="#ffd24a" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M92 148 L106 144" stroke="#ffd24a" stroke-width="2.5" stroke-linecap="round"/>
    <!-- shorts -->
    <path d="M44 88 L106 88 L112 124 L83 124 L75 108 L67 124 L38 124 Z" fill="${shorts}" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>
    <!-- sleeves -->
    <path d="M46 24 L24 35 L31 55 L47 47 Z" fill="${c.sleeve}" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M104 24 L126 35 L119 55 L103 47 Z" fill="${c.sleeve}" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>
    <!-- torso -->
    <path d="${torso}" fill="${c.body}"/>
    ${stripes ? `<g clip-path="url(#torso${uid})">${stripes}</g>` : ""}
    <path d="${torso}" fill="url(#shine${uid})" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M60 23 Q75 35 90 23" fill="none" stroke="${OUT}" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M60 23 Q75 35 90 23" fill="none" stroke="${c.sleeve}" stroke-width="2" stroke-linecap="round"/>
    <text x="75" y="74" text-anchor="middle" font-size="${label.length > 1 ? 28 : 32}" font-weight="900"
      font-family="'Arial Black', Arial, sans-serif" fill="${c.text}" stroke="${OUT}" stroke-width="1.3" paint-order="stroke">${label}</text>
    <text x="116" y="177" font-size="30" text-anchor="middle">${ballEmoji || "⚽"}</text>
  </svg>`;
}

function avatarHTML(p, size = 100, bounce = false) {
  const outfit = outfitOf(p);
  const theme = themeOf(p);
  const headSize = Math.round(size * 0.46);
  const head = p.photo
    ? `<img src="${p.photo}" alt="">`
    : `<span class="face" style="font-size:${Math.round(headSize * 0.72)}px">${p.face || "😀"}</span>`;
  return `
    <span class="avatar ${bounce ? "bounce" : ""}">
      <span class="head" style="width:${headSize}px;height:${headSize}px">${head}</span>
      ${playerBodySVG(outfit, size, theme.terms.match.scoreEmoji)}
    </span>`;
}

/* -------------------------- confetti -------------------------- */
function burstConfetti(emojis = ["🎉", "⭐", "✨"], count = 24) {
  for (let i = 0; i < count; i++) {
    const bit = document.createElement("div");
    bit.className = "confetti-bit";
    bit.textContent = emojis[i % emojis.length];
    bit.style.left = Math.random() * 100 + "vw";
    bit.style.animationDuration = 1.4 + Math.random() * 1.6 + "s";
    bit.style.animationDelay = Math.random() * 0.4 + "s";
    $confetti.appendChild(bit);
    setTimeout(() => bit.remove(), 3600);
  }
}

function praisePop(text, oops = false) {
  const el = document.createElement("div");
  el.className = "praise-pop" + (oops ? " oops" : "");
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

/* --------------------------- modal --------------------------- */
function showModal(html) {
  $overlay.innerHTML = `<div class="modal">${html}</div>`;
  $overlay.classList.remove("hidden");
}
function hideModal() { $overlay.classList.add("hidden"); $overlay.innerHTML = ""; }
$overlay.addEventListener("click", (e) => { if (e.target === $overlay) hideModal(); });

/* -------------------------- rewards -------------------------- */
function giveCoins(n) { P.coins += n; }
function giveStars(n) { P.stars += n; }

function maybeAwardSticker(theme) {
  const pool = theme.stickers.filter((s) => !P.stickers.includes(s));
  if (!pool.length) return null;
  const s = pick(pool);
  P.stickers.push(s);
  return s;
}

function checkTrophies() {
  const s = P.stats;
  const earned = [];
  const rules = {
    "first-drill": s.drills >= 1,
    "math-star": s.mathRight >= 15,
    "reading-rocket": s.readRight >= 15,
    "writing-wizard": s.writeDrills >= 5,
    "first-win": s.wins >= 1,
    "champion": s.wins >= 3,
    "super-saver": P.coins >= 100,
    "star-collector": P.stars >= 50,
    "sticker-fan": P.stickers.length >= 8,
  };
  for (const t of TROPHIES) {
    if (rules[t.id] && !P.trophies.includes(t.id)) {
      P.trophies.push(t.id);
      earned.push(t);
    }
  }
  return earned;
}

// Value of a mission stat for gear checks.
function statValue(key) {
  if (key === "stars") return P.stars;
  return P.stats[key] || 0;
}

// Power-up gear: missions are age-calibrated (simpler for Wilder Path).
function checkGear() {
  const t = themeOf(P);
  const tier = tierOf(P);
  const earned = [];
  for (const g of t.gear || []) {
    if (P.gear.includes(g.id)) continue;
    const m = g.missions[tier];
    if (m && statValue(m.stat) >= m.need) {
      P.gear.push(g.id);
      earned.push({ emoji: g.emoji, name: g.name, desc: g.power, title: "Power-Up Unlocked!", say: `Power up! You earned the ${g.name}!` });
    }
  }
  return earned;
}

// Collect all new awards (trophies + gear) in one popup queue.
function checkAwards() {
  return [
    ...checkTrophies().map((t) => ({ emoji: t.emoji, name: t.name, desc: t.desc, title: "New Trophy!", say: `New trophy! ${t.name}!` })),
    ...checkGear(),
  ];
}

function showTrophyPopups(awards, done) {
  if (!awards.length) { done && done(); return; }
  const a = awards.shift();
  sfx.fanfare();
  burstConfetti(["🏆", "⭐", "🎉"]);
  speak(a.say || `New trophy! ${a.name}!`);
  showModal(`
    <div class="modal-emoji">${a.emoji}</div>
    <h2>${esc(a.title || "New Trophy!")}</h2>
    <div class="reward-line">${esc(a.name)}</div>
    <p>${esc(a.desc)}</p>
    <button class="btn gold big" id="trophy-ok">Yay! 🎉</button>
  `);
  document.getElementById("trophy-ok").onclick = () => {
    hideModal();
    showTrophyPopups(awards, done);
  };
}

/* ========================================================
   SCREENS
   ======================================================== */

/* ------------------------ home screen ------------------------ */
function showHome() {
  P = null;
  setThemeColors(null);
  const players = loadPlayers();
  $screen.innerHTML = `
    <div class="logo-hero">
      <div class="balls">⚽ 🏈 🏀 🏴‍☠️ 🐉</div>
      <h1 class="hero-title">Brain Camp</h1>
      <div class="subtitle">Math • Reading • Writing — your adventure!</div>
    </div>
    <div class="player-list">
      ${players.map((p) => {
        normalizeProfile(p);
        const t = THEMES[p.themeId] || THEMES.soccer;
        const pa = pathOf(p);
        return `
        <button class="player-card" data-id="${p.id}">
          ${avatarHTML(p, 74)}
          <span class="who">
            <span class="name">${esc(p.name)}</span>
            <span class="meta">${pa.emoji} ${pa.name} • ${t.name} • Lv ${levelOf(p)} • ⭐ ${p.stars}</span>
          </span>
          <span class="theme-emoji">${t.emoji}</span>
        </button>`;
      }).join("")}
    </div>
    <div class="btn-col">
      <button class="btn green big" id="new-player">➕ New Player</button>
      <button class="btn ghost small" id="manage">Grown-ups: voice &amp; players</button>
    </div>
  `;
  document.getElementById("new-player").onclick = () => { sfx.click(); startCreate(); };
  document.getElementById("manage").onclick = () => { sfx.click(); showManage(); };
  $screen.querySelectorAll(".player-card").forEach((el) => {
    el.onclick = () => {
      sfx.click();
      P = normalizeProfile(loadPlayers().find((p) => p.id === el.dataset.id));
      speak(`Welcome back, ${P.name}!`);
      showHub();
    };
  });
}

function showManage() {
  refreshVoices();
  const players = loadPlayers();
  const hasSpeech = "speechSynthesis" in window;
  const voices = hasSpeech ? rankedVoices().slice(0, 8) : [];
  const chosen = hasSpeech ? currentVoice() : null;
  const savedURI = localStorage.getItem(VOICE_KEY);
  $screen.innerHTML = `
    <div class="topbar">
      <button class="btn ghost icon" id="back">⬅️</button>
      <h2>Grown-Ups</h2>
    </div>
    <div class="card">
      <h3>🔊 Reading Voice</h3>
      <p class="subtitle" style="font-size:.9rem">Questions are read out loud. Tap a voice to hear it — the best ones on this device are listed first. On iPad/iPhone you can download extra natural voices in Settings → Accessibility → Spoken Content → Voices.</p>
      ${voices.length ? voices.map((v) => `
        <button class="pick-tile ${chosen && v.voiceURI === chosen.voiceURI ? "selected" : ""}" style="width:100%;text-align:left;display:flex;align-items:center;gap:10px;margin-bottom:8px;padding:10px 14px" data-voice="${esc(v.voiceURI)}">
          <span style="font-size:1.4rem">${chosen && v.voiceURI === chosen.voiceURI ? "✅" : "🗣️"}</span>
          <span style="flex:1">
            <span class="label" style="margin:0">${esc(v.name)}</span>
            <span class="sub">${esc(v.lang)}${v === voices[0] && !savedURI ? " • recommended" : ""}</span>
          </span>
        </button>`).join("")
      : `<p>This browser has no reading voices — the game still works, just without sound.</p>`}
    </div>
    <div class="card">
      <h3>👧 Players</h3>
      ${players.map((p) => `
        <div style="display:flex;align-items:center;gap:12px;padding:8px 0">
          ${avatarHTML(p, 60)}
          <div style="flex:1;font-weight:800">${esc(p.name)}</div>
          <button class="btn small" style="background:linear-gradient(135deg,#ff5d7a,#e0295c)" data-del="${p.id}">Delete</button>
        </div>`).join("") || `<p class="subtitle">No players yet.</p>`}
    </div>
  `;
  document.getElementById("back").onclick = showHome;
  $screen.querySelectorAll("[data-voice]").forEach((b) => {
    b.onclick = () => {
      localStorage.setItem(VOICE_KEY, b.dataset.voice);
      speak("Hi! Let's play Brain Camp! Ready? 3, 2, 1, go!");
      showManage();
    };
  });
  $screen.querySelectorAll("[data-del]").forEach((b) => {
    b.onclick = () => {
      if (confirm("Delete this player and all their progress?")) {
        savePlayers(loadPlayers().filter((p) => p.id !== b.dataset.del));
        showManage();
      }
    };
  });
}

/* --------------------- create-player flow --------------------- */
let draft = null;

function startCreate() {
  draft = newProfile();
  createStepName();
}

function createStepName() {
  setThemeColors(null);
  $screen.innerHTML = `
    <div class="topbar">
      <button class="btn ghost icon" id="back">⬅️</button>
      <h2>Who's playing?</h2>
    </div>
    <div class="card center">
      <p style="font-weight:800">Type your name or nickname:</p>
      <input type="text" id="name-input" maxlength="14" placeholder="Super name!" value="${esc(draft.name)}" autocomplete="off">
      <p style="font-weight:800;margin-top:18px">Pick your path:</p>
      <div class="grid2" id="path-grid">
        ${Object.values(PATHS).map((pa) => `
          <button class="pick-tile ${draft.path === pa.id ? "selected" : ""}" data-path="${pa.id}">
            <span class="big-emoji">${pa.emoji}</span>
            <span class="label">${esc(pa.name)}</span>
            <span class="sub">${esc(pa.line)}</span>
          </button>`).join("")}
      </div>
      <p class="subtitle" style="font-size:.85rem;margin-top:10px">You can switch paths any time from your home screen.</p>
    </div>
    <button class="btn green big" id="next">Next ➡️</button>
  `;
  document.getElementById("back").onclick = showHome;
  const input = document.getElementById("name-input");
  $screen.querySelectorAll("[data-path]").forEach((b) => {
    b.onclick = () => {
      sfx.click();
      draft.path = b.dataset.path;
      draft.age = PATHS[draft.path].age;
      speak(`${PATHS[draft.path].name}! ${PATHS[draft.path].line}`);
      $screen.querySelectorAll("[data-path]").forEach((x) => x.classList.remove("selected"));
      b.classList.add("selected");
    };
  });
  document.getElementById("next").onclick = () => {
    draft.name = input.value.trim() || "Champ";
    sfx.click();
    createStepTheme();
  };
}

function createStepTheme() {
  $screen.innerHTML = `
    <div class="topbar">
      <button class="btn ghost icon" id="back">⬅️</button>
      <h2>Pick your adventure!</h2>
    </div>
    <div class="grid2">
      ${Object.values(THEMES).map((t) => `
        <button class="pick-tile ${draft.themeId === t.id ? "selected" : ""}" data-theme="${t.id}">
          <span class="big-emoji">${t.emoji}</span>
          <span class="label">${t.name}</span>
          <span class="sub">${t.tagline}</span>
        </button>`).join("")}
    </div>
    <button class="btn green big" id="next" style="margin-top:14px">Next ➡️</button>
  `;
  document.getElementById("back").onclick = createStepName;
  $screen.querySelectorAll("[data-theme]").forEach((b) => {
    b.onclick = () => {
      sfx.click();
      draft.themeId = b.dataset.theme;
      setThemeColors(THEMES[draft.themeId]);
      speak(THEMES[draft.themeId].name + "! " + THEMES[draft.themeId].tagline);
      $screen.querySelectorAll("[data-theme]").forEach((x) => x.classList.remove("selected"));
      b.classList.add("selected");
    };
  });
  document.getElementById("next").onclick = () => { sfx.click(); createStepOutfit(); };
}

function createStepOutfit() {
  const t = THEMES[draft.themeId];
  setThemeColors(t);
  const free = t.outfits.filter((o) => !o.cost);
  if (!draft.outfitId || !free.some((o) => o.id === draft.outfitId)) draft.outfitId = free[0].id;
  const render = () => {
    $screen.innerHTML = `
      <div class="topbar">
        <button class="btn ghost icon" id="back">⬅️</button>
        <h2>Pick your ${esc(t.outfitWord)}!</h2>
      </div>
      <div class="card center">${avatarHTML(draft, 130, true)}</div>
      <div class="grid2">
        ${free.map((o) => `
          <button class="pick-tile ${draft.outfitId === o.id ? "selected" : ""}" data-outfit="${o.id}">
            ${jerseySVG(o, 64)}
            <span class="label">${esc(o.label)}</span>
            <span class="sub">${esc(o.sub)}</span>
          </button>`).join("")}
      </div>
      <div class="card center" style="margin-top:12px;font-size:.9rem;opacity:.85">
        🔒 More ${esc(t.outfitWord)}s can be earned in the ${esc(t.terms.shop)}!
      </div>
      <button class="btn green big" id="next">Next ➡️</button>
    `;
    document.getElementById("back").onclick = createStepTheme;
    $screen.querySelectorAll("[data-outfit]").forEach((b) => {
      b.onclick = () => { sfx.click(); draft.outfitId = b.dataset.outfit; render(); };
    });
    document.getElementById("next").onclick = () => { sfx.click(); createStepPhoto(); };
  };
  render();
}

function createStepPhoto() {
  const render = () => {
    $screen.innerHTML = `
      <div class="topbar">
        <button class="btn ghost icon" id="back">⬅️</button>
        <h2>Show us your game face!</h2>
      </div>
      <div class="card center">
        <div class="photo-preview">
          ${draft.photo ? `<img src="${draft.photo}" alt="you">` : draft.face}
        </div>
        <input type="file" id="photo-input" accept="image/*" capture="user" class="hidden">
        <div class="btn-row">
          <button class="btn blue" id="add-photo">📸 Add Photo</button>
          ${draft.photo ? `<button class="btn ghost" id="remove-photo">❌ Remove</button>` : ""}
        </div>
        <p style="font-weight:800;margin-top:16px">…or pick a fun face:</p>
        <div class="face-picker">
          ${FACE_OPTIONS.map((f) => `
            <button class="face-btn ${!draft.photo && draft.face === f ? "selected" : ""}" data-face="${f}">${f}</button>`).join("")}
        </div>
      </div>
      <div class="card center">${avatarHTML(draft, 120, true)}<div style="font-weight:800">${esc(draft.name)}</div></div>
      <button class="btn gold big" id="finish">🎉 Let's Go!</button>
    `;
    document.getElementById("back").onclick = createStepOutfit;
    const fileInput = document.getElementById("photo-input");
    document.getElementById("add-photo").onclick = () => fileInput.click();
    fileInput.onchange = () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          // Downscale + center-crop to a small square so it fits localStorage.
          const S = 160;
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = S;
          const cx = canvas.getContext("2d");
          const side = Math.min(img.width, img.height);
          cx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, S, S);
          draft.photo = canvas.toDataURL("image/jpeg", 0.82);
          render();
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    };
    const rm = document.getElementById("remove-photo");
    if (rm) rm.onclick = () => { draft.photo = null; render(); };
    $screen.querySelectorAll("[data-face]").forEach((b) => {
      b.onclick = () => { sfx.click(); draft.face = b.dataset.face; draft.photo = null; render(); };
    });
    document.getElementById("finish").onclick = () => {
      P = draft;
      saveCurrent();
      sfx.fanfare();
      burstConfetti();
      speak(`Welcome to the team, ${P.name}!`);
      showHub();
    };
  };
  render();
}

/* --------------------------- hub --------------------------- */
function showHub() {
  const t = themeOf(P);
  const pa = pathOf(P);
  setThemeColors(t);
  saveCurrent();
  $screen.innerHTML = `
    <div class="topbar">
      <button class="btn ghost icon" id="back" title="Switch player">🏠</button>
      <div class="spacer"></div>
      <div class="chip coins">🪙 ${P.coins}</div>
      <div class="chip stars">⭐ ${P.stars}</div>
    </div>
    <div class="card center">
      <div class="burst-wrap"><div class="burst"></div>${avatarHTML(P, 140, true)}</div>
      <h2 style="margin:6px 0 0">${esc(P.name)}</h2>
      <div class="subtitle">${t.emoji} ${t.name} • Level ${levelOf(P)}</div>
      <button class="chip" id="path-chip" style="border:none;cursor:pointer;font-family:inherit;margin-top:8px">${pa.emoji} ${esc(pa.name)}</button>
    </div>
    <div class="btn-col">
      <button class="btn green big" id="go-train">💪 ${esc(t.terms.train)}</button>
      <button class="btn blue big" id="go-match">${t.terms.match.scoreEmoji} Play: ${esc(t.terms.match.name)}</button>
      <button class="btn purple big" id="go-progress">📈 My Progress</button>
      <button class="btn purple big" style="background:#8e44ad" id="go-locker">🏆 My Prizes &amp; ${esc(t.terms.hub)}</button>
      <button class="btn gold big" id="go-shop">🛍️ ${esc(t.terms.shop)}</button>
    </div>
  `;
  document.getElementById("back").onclick = () => { sfx.click(); showHome(); };
  document.getElementById("go-train").onclick = () => { sfx.click(); showTrainMenu(); };
  document.getElementById("go-match").onclick = () => { sfx.click(); startMatch(); };
  document.getElementById("go-progress").onclick = () => { sfx.click(); showProgress(); };
  document.getElementById("go-locker").onclick = () => { sfx.click(); showLocker(); };
  document.getElementById("go-shop").onclick = () => { sfx.click(); showShop(); };
  document.getElementById("path-chip").onclick = () => { sfx.click(); showPathSwitch(); };
}

// Grown-up (or brave kid) can move a player between paths any time.
function showPathSwitch() {
  const current = pathOf(P);
  showModal(`
    <div class="modal-emoji">${current.emoji}</div>
    <h2>Pick a Path</h2>
    <p>This changes how hard the questions are.</p>
    <div class="btn-col">
      ${Object.values(PATHS).map((pa) => `
        <button class="btn ${pa.id === current.id ? "gold" : "blue"} big" data-set-path="${pa.id}">
          ${pa.emoji} ${esc(pa.name)} ${pa.id === current.id ? "(now)" : ""}
        </button>`).join("")}
      <button class="btn ghost" id="path-cancel">Never mind</button>
    </div>
  `);
  $overlay.querySelectorAll("[data-set-path]").forEach((b) => {
    b.onclick = () => {
      P.path = b.dataset.setPath;
      P.age = PATHS[P.path].age;
      saveCurrent();
      hideModal();
      speak(`${PATHS[P.path].name}! ${PATHS[P.path].line}`);
      showHub();
    };
  });
  document.getElementById("path-cancel").onclick = hideModal;
}

/* ------------------------ train menu ------------------------ */
function showTrainMenu() {
  const t = themeOf(P);
  const d = t.terms.drills;
  $screen.innerHTML = `
    <div class="topbar">
      <button class="btn ghost icon" id="back">⬅️</button>
      <h2>${esc(t.terms.train)}</h2>
    </div>
    <div class="btn-col">
      ${["math", "reading", "writing"].map((s) => `
        <button class="pick-tile" style="text-align:left;display:flex;align-items:center;gap:14px;padding:16px" data-drill="${s}">
          <span class="big-emoji" style="font-size:2.4rem">${d[s].icon}</span>
          <span>
            <span class="label" style="font-size:1.2rem">${esc(d[s].name)}</span>
            <span class="sub">${esc(d[s].line)}</span>
          </span>
        </button>`).join("")}
    </div>
  `;
  document.getElementById("back").onclick = showHub;
  $screen.querySelectorAll("[data-drill]").forEach((b) => {
    b.onclick = () => { sfx.whistle(); startDrill(b.dataset.drill); };
  });
}

/* ======================= DRILL RUNNER ======================= */

let drill = null;

function startDrill(subject) {
  const t = themeOf(P);
  drill = {
    subject,
    tasks: buildDrill(subject, tierOf(P), t, levelOf(P)),
    idx: 0,
    correct: 0,
  };
  renderDrillTask();
}

function drillProgressHTML() {
  const t = themeOf(P);
  return `<div class="progress-dots">
    ${drill.tasks.map((_, i) => `<span class="dot ${i < drill.idx ? "done" : ""}">${t.terms.match.scoreEmoji}</span>`).join("")}
  </div>`;
}

function renderDrillTask() {
  if (drill.idx >= drill.tasks.length) return finishDrill();
  const task = drill.tasks[drill.idx];
  const t = themeOf(P);
  const header = `
    <div class="topbar">
      <button class="btn ghost icon" id="quit">⬅️</button>
      <div class="spacer"></div>
      <div class="chip">${esc(t.terms.drills[drill.subject].name)}</div>
    </div>
    ${drillProgressHTML()}`;

  const onDone = (r) => {
    if (r.right) {
      drill.correct++;
      recordAnswer(drill.subject, r.firstTry);
    }
    drill.idx++;
    renderDrillTask();
  };
  if (task.kind === "choice") {
    renderChoiceTask(task, header, onDone);
  } else if (task.kind === "tiles") {
    renderTilesTask(task, header, onDone);
  } else {
    // Tracing always counts — effort is the win at this age.
    renderTraceTask(task, header, () => onDone({ right: true, firstTry: true }));
  }
  document.getElementById("quit").onclick = () => {
    speechSynthesis && speechSynthesis.cancel();
    showTrainMenu();
  };
}

function finishDrill() {
  const t = themeOf(P);
  const coins = 6 + drill.correct * 2;
  const stars = drill.correct;
  giveCoins(coins);
  giveStars(stars);
  P.stats.drills++;
  if (drill.subject === "writing") P.stats.writeDrills++;
  pushHistory({ kind: "drill", subject: drill.subject, right: drill.correct, total: drill.tasks.length });
  const sticker = drill.correct >= 4 ? maybeAwardSticker(t) : null;
  const awards = checkAwards();
  saveCurrent();

  sfx.fanfare();
  burstConfetti(t.stickers.slice(0, 4));
  speak(`Drill complete! You got ${drill.correct} out of ${drill.tasks.length}! You earned ${coins} coins!`);

  $screen.innerHTML = `
    <div class="card center" style="margin-top:30px">
      <div class="reward-banner">🎉</div>
      <h2>Drill Complete!</h2>
      ${avatarHTML(P, 110, true)}
      <div class="reward-line">${"⭐".repeat(Math.max(1, drill.correct))}</div>
      <div class="reward-line">${drill.correct} / ${drill.tasks.length} right</div>
      <div class="reward-line">🪙 +${coins} coins</div>
      ${sticker ? `<div class="reward-line">New sticker! <span class="sticker-reveal">${sticker}</span></div>` : ""}
    </div>
    <div class="btn-col">
      <button class="btn green big" id="again">🔁 Play Again</button>
      <button class="btn blue big" id="more">💪 More Drills</button>
      <button class="btn ghost big" id="home">🏟️ Back to ${esc(t.terms.hub)}</button>
    </div>
  `;
  document.getElementById("again").onclick = () => { sfx.whistle(); startDrill(drill.subject); };
  document.getElementById("more").onclick = showTrainMenu;
  document.getElementById("home").onclick = showHub;
  showTrophyPopups(awards);
}

/* -------------------- choice task renderer -------------------- */
function renderChoiceTask(task, headerHTML, done) {
  const cols = task.cols === 1 ? "single-col" : "";
  $screen.innerHTML = `
    ${headerHTML}
    <div class="prompt-card">
      <button class="say-btn" id="say">🔊</button>
      <div class="prompt-text">${task.prompt}</div>
      ${task.visual ? `<div class="prompt-visual">${task.visual}</div>` : ""}
    </div>
    <div class="choices ${cols}">
      ${task.choices.map((c, i) => `<button class="choice-btn" data-i="${i}">${c.html}</button>`).join("")}
    </div>
  `;
  speak(task.speakText);
  document.getElementById("say").onclick = () => speak(task.speakText);

  let attempts = 0;
  let settled = false;
  $screen.querySelectorAll(".choice-btn").forEach((btn) => {
    btn.onclick = () => {
      if (settled) return;
      const c = task.choices[Number(btn.dataset.i)];
      if (c.value === task.answer) {
        settled = true;
        btn.classList.add("correct");
        $screen.querySelectorAll(".choice-btn").forEach((b) => (b.disabled = true));
        sfx.correct();
        const praise = pick(PRAISE_WORDS);
        praisePop(praise);
        speak(praise);
        setTimeout(() => done({ right: true, firstTry: attempts === 0 }), 950);
      } else {
        attempts++;
        btn.classList.add("wrong");
        btn.disabled = true;
        sfx.wrong();
        if (attempts >= 2) {
          settled = true;
          // Show the right answer kindly, then move on.
          $screen.querySelectorAll(".choice-btn").forEach((b) => {
            b.disabled = true;
            if (task.choices[Number(b.dataset.i)].value === task.answer) b.classList.add("reveal");
          });
          speak(`The answer was ${task.answer}. You'll get the next one!`);
          setTimeout(() => done({ right: false, firstTry: false }), 1600);
        } else {
          praisePop(pick(GENTLE_WORDS), true);
          speak(pick(GENTLE_WORDS));
        }
      }
    };
  });
}

/* -------------------- tiles task renderer -------------------- */
function renderTilesTask(task, headerHTML, done) {
  const slots = task.word.split("").map(() => null); // index into tiles, or null
  let attempts = 0;

  $screen.innerHTML = `
    ${headerHTML}
    <div class="prompt-card">
      <button class="say-btn" id="say">🔊</button>
      <div class="prompt-text">${esc(task.prompt)}</div>
      <div class="prompt-visual" style="font-size:3.4rem">${task.emoji}</div>
      <div class="tile-slots" id="slots"></div>
    </div>
    <div class="tile-bank" id="bank">
      ${task.tiles.map((L, i) => `<button class="tile" data-i="${i}">${L}</button>`).join("")}
    </div>
    <div class="btn-row"><button class="btn ghost small" id="clear">🧹 Clear</button></div>
  `;
  speak(task.speakText);
  document.getElementById("say").onclick = () => speak(task.speakText);

  const $slots = document.getElementById("slots");
  const $bank = document.getElementById("bank");

  function drawSlots() {
    $slots.innerHTML = slots
      .map((tileIdx, si) =>
        `<div class="tile-slot ${tileIdx !== null ? "filled" : ""}" data-s="${si}">${tileIdx !== null ? task.tiles[tileIdx] : ""}</div>`)
      .join("");
    $slots.querySelectorAll(".tile-slot").forEach((el) => {
      el.onclick = () => { // tap a filled slot to put the tile back
        const si = Number(el.dataset.s);
        if (slots[si] !== null) {
          $bank.querySelector(`[data-i="${slots[si]}"]`).classList.remove("used");
          slots[si] = null;
          drawSlots();
        }
      };
    });
  }
  drawSlots();

  $bank.querySelectorAll(".tile").forEach((tileBtn) => {
    tileBtn.onclick = () => {
      if (tileBtn.classList.contains("used")) return;
      const empty = slots.indexOf(null);
      if (empty === -1) return;
      sfx.click();
      slots[empty] = Number(tileBtn.dataset.i);
      tileBtn.classList.add("used");
      drawSlots();
      if (!slots.includes(null)) checkWord();
    };
  });

  document.getElementById("clear").onclick = () => {
    slots.forEach((tileIdx, si) => {
      if (tileIdx !== null) $bank.querySelector(`[data-i="${tileIdx}"]`).classList.remove("used");
      slots[si] = null;
    });
    drawSlots();
  };

  function checkWord() {
    const built = slots.map((i) => task.tiles[i]).join("");
    if (built.toLowerCase() === task.word.toLowerCase()) {
      sfx.correct();
      praisePop(pick(PRAISE_WORDS));
      speak(`Yes! ${task.word.split("").join(", ")} spells ${task.word}!`);
      burstConfetti(["✨", "⭐"], 12);
      setTimeout(() => done({ right: true, firstTry: attempts === 0 }), 1300);
    } else {
      attempts++;
      sfx.wrong();
      $slots.parentElement.classList.add("tiles-wrong");
      setTimeout(() => $slots.parentElement.classList.remove("tiles-wrong"), 500);
      if (attempts >= 2) {
        // Show the correct word, then move on.
        speak(`Good try! The word is spelled ${task.word.split("").join(", ")}.`);
        $slots.innerHTML = task.word.split("").map((L) => `<div class="tile-slot filled">${L}</div>`).join("");
        setTimeout(() => done({ right: false, firstTry: false }), 1900);
      } else {
        praisePop(pick(GENTLE_WORDS), true);
        speak("Almost! Try moving the letters around.");
        setTimeout(() => document.getElementById("clear").click(), 600);
      }
    }
  }
}

/* -------------------- trace task renderer -------------------- */
function renderTraceTask(task, headerHTML, done) {
  const isWord = task.glyph.length > 1;
  $screen.innerHTML = `
    ${headerHTML}
    <div class="prompt-card">
      <button class="say-btn" id="say">🔊</button>
      <div class="prompt-text">${esc(task.prompt)}</div>
    </div>
    <div class="trace-wrap">
      <canvas id="trace-canvas" width="320" height="300"></canvas>
    </div>
    <div class="btn-row">
      <button class="btn ghost small" id="restart">🧹 Start Over</button>
      <button class="btn green" id="trace-done" disabled>✅ Done!</button>
    </div>
  `;
  speak(task.speakText);
  document.getElementById("say").onclick = () => speak(task.speakText);

  const canvas = document.getElementById("trace-canvas");
  const cx = canvas.getContext("2d");
  let inked = 0;
  const NEEDED = isWord ? 550 : 320; // rough path length before "Done" unlocks
  const HUES = [0, 35, 60, 130, 200, 260, 300];
  let hueIdx = 0;

  function drawGuide() {
    cx.clearRect(0, 0, canvas.width, canvas.height);
    cx.save();
    cx.fillStyle = "#e3ebf5";
    cx.font = `900 ${isWord ? Math.min(110, 400 / task.glyph.length) : 220}px 'Comic Sans MS', 'Baloo 2', sans-serif`;
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.fillText(task.glyph.toUpperCase(), canvas.width / 2, canvas.height / 2);
    // dashed outline hint
    cx.strokeStyle = "#b9c9dd";
    cx.setLineDash([7, 7]);
    cx.lineWidth = 2;
    cx.strokeText(task.glyph.toUpperCase(), canvas.width / 2, canvas.height / 2);
    cx.restore();
  }
  drawGuide();

  let drawing = false;
  let last = null;
  function pos(e) {
    const r = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: (p.clientX - r.left) * (canvas.width / r.width), y: (p.clientY - r.top) * (canvas.height / r.height) };
  }
  function start(e) { e.preventDefault(); drawing = true; last = pos(e); }
  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = pos(e);
    cx.strokeStyle = `hsl(${HUES[hueIdx % HUES.length]}, 90%, 55%)`;
    cx.lineWidth = 14;
    cx.lineCap = "round";
    cx.lineJoin = "round";
    cx.beginPath();
    cx.moveTo(last.x, last.y);
    cx.lineTo(p.x, p.y);
    cx.stroke();
    inked += Math.hypot(p.x - last.x, p.y - last.y);
    last = p;
    const doneBtn = document.getElementById("trace-done");
    if (inked > NEEDED && doneBtn.disabled) {
      doneBtn.disabled = false;
      sfx.coin();
    }
  }
  function end() { drawing = false; hueIdx++; }
  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", end);

  document.getElementById("restart").onclick = () => {
    inked = 0;
    hueIdx = 0;
    document.getElementById("trace-done").disabled = true;
    drawGuide();
  };
  document.getElementById("trace-done").onclick = () => {
    sfx.correct();
    praisePop("Beautiful! ✍️");
    speak("Beautiful writing!");
    burstConfetti(["✏️", "⭐", "✨"], 14);
    setTimeout(done, 1100);
  };
}

/* ======================= MATCH RUNNER ======================= */

let match = null;

function startMatch() {
  const t = themeOf(P);
  match = { playerScore: 0, rivalScore: 0, steps: 0, rivalSteps: 0 };
  sfx.whistle();
  speak(`It's ${t.terms.match.name} time! Team ${P.name} versus ${t.terms.match.rival}. Answer to ${t.terms.match.steps.join(", then ").toLowerCase()}!`);
  renderMatchQuestion();
}

function matchHeaderHTML() {
  const t = themeOf(P).terms.match;
  return `
    <div class="topbar">
      <button class="btn ghost icon" id="quit">⬅️</button>
      <div class="spacer"></div>
      <div class="chip">${t.scoreEmoji} ${esc(t.name)}</div>
    </div>
    <div class="scoreboard">
      <div class="team">
        <div class="tname">⭐ Team ${esc(P.name)}</div>
        <div class="tscore">${match.playerScore}</div>
      </div>
      <div class="vs">vs</div>
      <div class="team">
        <div class="tname">${t.rivalEmoji} ${esc(t.rival)}</div>
        <div class="tscore">${match.rivalScore}</div>
      </div>
    </div>
    <div class="steps-track">
      ${t.steps.map((s, i) => `
        <span class="step-pill ${i < match.steps ? "done" : i === match.steps ? "next" : ""}">${i < match.steps ? "✅" : ""} ${esc(s)}</span>
        ${i < t.steps.length - 1 ? "➡️" : ""}`).join("")}
    </div>
    ${match.rivalSteps > 0 ? `<div class="rival-warn">${t.rivalEmoji} ${esc(t.rival)} are getting close! (${match.rivalSteps}/3)</div>` : ""}
  `;
}

function renderMatchQuestion() {
  const t = themeOf(P);
  const task = matchQuestion(tierOf(P), t, levelOf(P));
  renderChoiceTask(task, matchHeaderHTML(), (r) => {
    if (r.right) {
      recordAnswer(task.subject, r.firstTry);
      match.steps++;
      if (match.steps >= 3) {
        match.steps = 0;
        match.playerScore++;
        P.stats.goals++;
        return showScoreFlash(true);
      }
    } else {
      match.rivalSteps++;
      if (match.rivalSteps >= 3) {
        match.rivalSteps = 0;
        match.rivalScore++;
        return showScoreFlash(false);
      }
    }
    renderMatchQuestion();
  });
  document.getElementById("quit").onclick = () => {
    speechSynthesis && speechSynthesis.cancel();
    showHub();
  };
}

function showScoreFlash(forPlayer) {
  const t = themeOf(P).terms.match;
  const flash = document.createElement("div");
  flash.className = "score-flash";
  if (forPlayer) {
    sfx.fanfare();
    burstConfetti([t.scoreEmoji, "🎉", "⭐"]);
    speak(t.scoreWord);
    flash.innerHTML = `
      <span class="emoji">${t.scoreEmoji}</span>
      <div class="big">${esc(t.scoreWord)}</div>
      <div style="font-size:1.2rem;font-weight:800;margin-top:8px">Team ${esc(P.name)} scores!</div>`;
  } else {
    sfx.wrong();
    speak(`Oh no, ${t.rival} scored! Let's get it back!`);
    flash.innerHTML = `
      <span style="font-size:4rem">${t.rivalEmoji}</span>
      <div class="big" style="font-size:2rem">${esc(t.rival)} scored!</div>
      <div style="font-size:1.1rem;font-weight:800;margin-top:8px">Let's get it back! 💪</div>`;
  }
  document.body.appendChild(flash);
  setTimeout(() => {
    flash.remove();
    if (match.playerScore >= 3) finishMatch(true);
    else if (match.rivalScore >= 3) finishMatch(false);
    else renderMatchQuestion();
  }, 2100);
}

function finishMatch(won) {
  const t = themeOf(P);
  const coins = won ? 30 : 8;
  const stars = won ? 6 : 2;
  giveCoins(coins);
  giveStars(stars);
  let sticker = null;
  if (won) {
    P.stats.wins++;
    sticker = maybeAwardSticker(t);
  }
  pushHistory({ kind: "match", won: !!won, score: `${match.playerScore}-${match.rivalScore}` });
  const awards = checkAwards();
  saveCurrent();

  if (won) {
    sfx.fanfare();
    burstConfetti([t.terms.match.scoreEmoji, "🏆", "🎉", "⭐"], 40);
    speak(`Final score: ${match.playerScore} to ${match.rivalScore}. ${t.terms.match.winWord}`);
  } else {
    sfx.whistle();
    speak(`So close! Great effort, ${P.name}. Let's practice and play a rematch!`);
  }

  $screen.innerHTML = `
    <div class="card center" style="margin-top:24px">
      <div class="reward-banner">${won ? "🏆" : "💪"}</div>
      <h2>${won ? esc(t.terms.match.winWord) : "So close! What a game!"}</h2>
      <div class="burst-wrap">${won ? '<div class="burst"></div>' : ""}${avatarHTML(P, 120, true)}</div>
      <div class="reward-line">Final Score: ${match.playerScore} – ${match.rivalScore}</div>
      <div class="reward-line">🪙 +${coins} coins &nbsp; ⭐ +${stars} stars</div>
      ${sticker ? `<div class="reward-line">New sticker! <span class="sticker-reveal">${sticker}</span></div>` : ""}
      ${won ? "" : `<div class="subtitle">A little training makes champions! 🌟</div>`}
    </div>
    <div class="btn-col">
      <button class="btn green big" id="again">🔁 ${won ? "Play Again" : "Rematch!"}</button>
      ${won ? "" : `<button class="btn blue big" id="train">💪 ${esc(t.terms.train)}</button>`}
      <button class="btn ghost big" id="home">🏟️ Back to ${esc(t.terms.hub)}</button>
    </div>
  `;
  const trainBtn = document.getElementById("train");
  if (trainBtn) trainBtn.onclick = showTrainMenu;
  document.getElementById("again").onclick = startMatch;
  document.getElementById("home").onclick = showHub;
  showTrophyPopups(awards);
}

/* ======================== MY PROGRESS ======================== */

// Compare recent drill accuracy vs earlier drills for one subject.
function improvementFor(subject) {
  const drills = P.history.filter((h) => h.kind === "drill" && h.subject === subject && h.total);
  if (drills.length < 2) return { enough: false, count: drills.length };
  const recent = drills.slice(-3);
  const earlier = drills.slice(0, -3).length ? drills.slice(0, -3) : [drills[0]];
  const pct = (list) => Math.round((list.reduce((s, h) => s + h.right, 0) / list.reduce((s, h) => s + h.total, 0)) * 100);
  const now = pct(recent);
  const before = pct(earlier);
  return { enough: true, now, before, trend: now > before ? "up" : now < before ? "down" : "flat" };
}

function showProgress() {
  const t = themeOf(P);
  const pa = pathOf(P);
  const subjectLabel = { math: "Math", reading: "Reading", writing: "Writing" };
  const trendBits = {
    up: { emoji: "📈", note: "You're getting better!" },
    flat: { emoji: "➡️", note: "Steady — keep it up!" },
    down: { emoji: "💪", note: "Keep practicing, champ!" },
  };
  $screen.innerHTML = `
    <div class="topbar">
      <button class="btn ghost icon" id="back">⬅️</button>
      <h2>📈 My Progress</h2>
    </div>
    <div class="card center">
      ${avatarHTML(P, 100)}
      <div style="font-weight:800">${esc(P.name)} • ${pa.emoji} ${esc(pa.name)}</div>
    </div>
    <div class="card">
      <h3>⭐ My Skills</h3>
      ${["math", "reading", "writing"].map((s) => {
        const sk = t.skills[s];
        const lv = skillLevel(P, s);
        return `
        <div class="skill-row">
          <div class="skill-head">
            <span>${sk.emoji} <b>${esc(sk.name)}</b> <span class="skill-sub">(${subjectLabel[s]})</span></span>
            <span class="skill-lv">Lv ${lv.level}</span>
          </div>
          <div class="skill-bar"><div class="skill-fill" style="width:${lv.pct}%"></div></div>
        </div>`;
      }).join("")}
      <div class="skill-sub" style="margin-top:6px">Answer questions to level up your moves!</div>
    </div>
    <div class="card">
      <h3>🚀 Am I improving?</h3>
      ${["math", "reading", "writing"].map((s) => {
        const sk = t.skills[s];
        const imp = improvementFor(s);
        if (!imp.enough) {
          return `<div class="trophy-row"><span class="t-emoji">${sk.emoji}</span>
            <span><div class="t-name">${esc(sk.name)}</div>
            <div class="t-desc">Play ${2 - imp.count} more ${subjectLabel[s].toLowerCase()} drill${2 - imp.count === 1 ? "" : "s"} to see your trend!</div></span></div>`;
        }
        const tb = trendBits[imp.trend];
        return `<div class="trophy-row"><span class="t-emoji">${tb.emoji}</span>
          <span><div class="t-name">${esc(sk.name)}: ${imp.now}% lately</div>
          <div class="t-desc">Before: ${imp.before}% — ${tb.note}</div></span></div>`;
      }).join("")}
    </div>
    <div class="card">
      <h3>🧮 Totals</h3>
      <div class="totals-grid">
        <div class="total-box"><b>${P.stats.drills}</b><span>drills done</span></div>
        <div class="total-box"><b>${P.stats.wins}</b><span>matches won</span></div>
        <div class="total-box"><b>${P.stats.rightTotal}</b><span>right answers</span></div>
        <div class="total-box"><b>${P.stats.firstTry}</b><span>first-try ⚡</span></div>
        <div class="total-box"><b>${P.stars}</b><span>stars ⭐</span></div>
        <div class="total-box"><b>${P.gear.length}/${(t.gear || []).length}</b><span>power-ups</span></div>
      </div>
    </div>
  `;
  document.getElementById("back").onclick = showHub;
}

/* ===================== LOCKER / TROPHIES ===================== */

function showLocker() {
  const t = themeOf(P);
  $screen.innerHTML = `
    <div class="topbar">
      <button class="btn ghost icon" id="back">⬅️</button>
      <h2>🏆 ${esc(t.terms.hub)}</h2>
    </div>
    <div class="card center">
      ${avatarHTML(P, 110)}
      <div style="font-weight:800">${esc(P.name)} • Level ${levelOf(P)}</div>
      <div class="subtitle">🪙 ${P.coins} &nbsp; ⭐ ${P.stars}</div>
    </div>
    <div class="card">
      <h3>✨ My Stuff</h3>
      <div class="shelf">
        ${P.unlockedItems.length
          ? P.unlockedItems.map((id) => {
              const item = t.shopItems.find((x) => x.id === id);
              return item ? `<span title="${esc(item.label)}">${item.emoji}</span>` : "";
            }).join("")
          : `<span class="empty-note" style="font-size:1rem">Win coins and visit the ${esc(t.terms.shop)}!</span>`}
      </div>
    </div>
    <div class="card">
      <h3>⚡ Power-Up Gear</h3>
      ${(t.gear || []).map((g) => {
        const owned = P.gear.includes(g.id);
        const m = g.missions[tierOf(P)];
        const have = Math.min(statValue(m.stat), m.need);
        return `
        <div class="trophy-row ${owned ? "" : "locked"}">
          <span class="t-emoji">${g.emoji}</span>
          <span style="flex:1">
            <div class="t-name">${esc(g.name)}</div>
            <div class="t-desc">${owned ? esc(g.power) : `Mission: ${esc(m.desc)}`}</div>
            ${owned ? "" : `<div class="mission-bar"><div class="mission-fill" style="width:${Math.round((have / m.need) * 100)}%"></div></div>`}
          </span>
          <span style="font-weight:800;font-size:.85rem">${owned ? "✅" : `${have}/${m.need}`}</span>
        </div>`;
      }).join("")}
    </div>
    <div class="card">
      <h3>🎨 Sticker Book</h3>
      <div class="sticker-shelf">
        ${P.stickers.length ? P.stickers.join(" ") : `<span class="empty-note">Finish drills to earn stickers!</span>`}
      </div>
    </div>
    <div class="card">
      <h3>🏆 Trophy Case</h3>
      ${TROPHIES.map((tr) => `
        <div class="trophy-row ${P.trophies.includes(tr.id) ? "" : "locked"}">
          <span class="t-emoji">${tr.emoji}</span>
          <span>
            <div class="t-name">${esc(tr.name)}</div>
            <div class="t-desc">${esc(tr.desc)}</div>
          </span>
        </div>`).join("")}
    </div>
  `;
  document.getElementById("back").onclick = showHub;
}

/* ============================ SHOP ============================ */

function showShop() {
  const t = themeOf(P);
  const lockedOutfits = t.outfits.filter((o) => o.cost);
  const render = () => {
    $screen.innerHTML = `
      <div class="topbar">
        <button class="btn ghost icon" id="back">⬅️</button>
        <h2>🛍️ ${esc(t.terms.shop)}</h2>
        <div class="spacer"></div>
        <div class="chip coins">🪙 ${P.coins}</div>
      </div>
      <div class="card">
        <h3>Switch ${esc(t.outfitWord)}</h3>
        <div class="grid3">
          ${t.outfits.filter((o) => !o.cost || P.unlockedOutfits.includes(o.id)).map((o) => `
            <button class="pick-tile ${P.outfitId === o.id ? "selected" : ""}" data-wear="${o.id}">
              ${jerseySVG(o, 52)}
              <span class="sub">${esc(o.label)}</span>
            </button>`).join("")}
        </div>
      </div>
      ${lockedOutfits.some((o) => !P.unlockedOutfits.includes(o.id)) ? `
      <div class="card">
        <h3>⭐ Legend ${esc(t.outfitWord)}s</h3>
        <div class="grid3">
          ${lockedOutfits.filter((o) => !P.unlockedOutfits.includes(o.id)).map((o) => `
            <button class="pick-tile locked" data-buy-outfit="${o.id}">
              ${jerseySVG(o, 52)}
              <span class="sub">${esc(o.label)}</span>
              <span class="cost">🪙 ${o.cost}</span>
            </button>`).join("")}
        </div>
      </div>` : ""}
      <div class="card">
        <h3>🎁 Cool Stuff</h3>
        <div class="grid3">
          ${t.shopItems.map((item) => {
            const owned = P.unlockedItems.includes(item.id);
            return `
            <button class="pick-tile ${owned ? "selected" : P.coins < item.cost ? "locked" : ""}"
              ${owned ? "disabled" : `data-buy-item="${item.id}"`}>
              <span class="big-emoji">${item.emoji}</span>
              <span class="sub">${esc(item.label)}</span>
              <span class="cost">${owned ? "✅ Yours!" : `🪙 ${item.cost}`}</span>
            </button>`;
          }).join("")}
        </div>
      </div>
    `;
    document.getElementById("back").onclick = showHub;
    $screen.querySelectorAll("[data-wear]").forEach((b) => {
      b.onclick = () => {
        sfx.click();
        P.outfitId = b.dataset.wear;
        saveCurrent();
        speak("Looking good!");
        render();
      };
    });
    $screen.querySelectorAll("[data-buy-outfit]").forEach((b) => {
      b.onclick = () => {
        const o = t.outfits.find((x) => x.id === b.dataset.buyOutfit);
        buyThing(o.cost, () => {
          P.unlockedOutfits.push(o.id);
          P.outfitId = o.id;
          speak(`You unlocked the ${o.label} ${t.outfitWord}! Amazing!`);
        }, render);
      };
    });
    $screen.querySelectorAll("[data-buy-item]").forEach((b) => {
      b.onclick = () => {
        const item = t.shopItems.find((x) => x.id === b.dataset.buyItem);
        buyThing(item.cost, () => {
          P.unlockedItems.push(item.id);
          speak(`You got the ${item.label}! It's in your ${t.terms.hub}!`);
        }, render);
      };
    });
  };
  render();
}

function buyThing(cost, apply, render) {
  if (P.coins < cost) {
    sfx.wrong();
    praisePop(`Need ${cost - P.coins} more 🪙`, true);
    speak(`You need ${cost - P.coins} more coins. Play drills to earn them!`);
    return;
  }
  P.coins -= cost;
  apply();
  const awards = checkAwards();
  saveCurrent();
  sfx.coin();
  burstConfetti(["🪙", "🎉"], 16);
  render();
  showTrophyPopups(awards);
}

/* ============================ boot ============================ */
showHome();
