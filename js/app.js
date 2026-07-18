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

function speak(text) {
  try {
    if (!("speechSynthesis" in window) || !text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92;
    u.pitch = 1.1;
    const voices = speechSynthesis.getVoices();
    const v = voices.find((v) => /en[-_]/i.test(v.lang) && /female|kid|samantha|zira|google us/i.test(v.name))
      || voices.find((v) => /en[-_]/i.test(v.lang));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) { /* speech is a bonus, never break the game */ }
}
if ("speechSynthesis" in window) speechSynthesis.getVoices(); // warm up voice list

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
    age: 5,
    themeId: "soccer",
    outfitId: null,
    photo: null,   // dataURL
    face: "😀",    // emoji fallback
    coins: 0,
    stars: 0,
    stickers: [],
    trophies: [],
    unlockedOutfits: [],
    unlockedItems: [],
    stats: { drills: 0, wins: 0, mathRight: 0, readRight: 0, writeDrills: 0 },
  };
}

const tierOf = (p) => (p.age <= 5 ? "little" : "big");
const themeOf = (p) => THEMES[p.themeId] || THEMES.soccer;
const levelOf = (p) => 1 + Math.floor((p.stars || 0) / 25);
function outfitOf(p) {
  const t = themeOf(p);
  return t.outfits.find((o) => o.id === p.outfitId) || t.outfits[0];
}

/* --------------------------- avatar --------------------------- */
function jerseySVG(outfit, size = 90) {
  const c = outfit.colors;
  const label = outfit.number || outfit.symbol || "★";
  return `
  <svg width="${size}" height="${size * 0.82}" viewBox="0 0 100 82" aria-hidden="true">
    <path d="M30 6 L14 14 L4 34 L18 42 L20 32 L20 78 L80 78 L80 32 L82 42 L96 34 L86 14 L70 6 Q60 16 50 16 Q40 16 30 6 Z"
      fill="${c.body}" stroke="#22304a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M30 6 L14 14 L4 34 L18 42 L20 32 L22 20 Z" fill="${c.sleeve}" stroke="#22304a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M70 6 L86 14 L96 34 L82 42 L80 32 L78 20 Z" fill="${c.sleeve}" stroke="#22304a" stroke-width="3" stroke-linejoin="round"/>
    <text x="50" y="56" text-anchor="middle" font-size="${label.length > 1 ? 26 : 30}" font-weight="900"
      font-family="Arial, sans-serif" fill="${c.text}">${label}</text>
  </svg>`;
}

function avatarHTML(p, size = 100, bounce = false) {
  const outfit = outfitOf(p);
  const headSize = Math.round(size * 0.52);
  const head = p.photo
    ? `<img src="${p.photo}" alt="">`
    : `<span class="face" style="font-size:${Math.round(headSize * 0.72)}px">${p.face || "😀"}</span>`;
  return `
    <span class="avatar ${bounce ? "bounce" : ""}">
      <span class="head" style="width:${headSize}px;height:${headSize}px">${head}</span>
      ${jerseySVG(outfit, size)}
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

function showTrophyPopups(trophies, done) {
  if (!trophies.length) { done && done(); return; }
  const t = trophies.shift();
  sfx.fanfare();
  burstConfetti(["🏆", "⭐", "🎉"]);
  speak(`New trophy! ${t.name}!`);
  showModal(`
    <div class="modal-emoji">${t.emoji}</div>
    <h2>New Trophy!</h2>
    <div class="reward-line">${esc(t.name)}</div>
    <p>${esc(t.desc)}</p>
    <button class="btn gold big" id="trophy-ok">Yay! 🎉</button>
  `);
  document.getElementById("trophy-ok").onclick = () => {
    hideModal();
    showTrophyPopups(trophies, done);
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
      <h1>Brain Camp</h1>
      <div class="subtitle">Math • Reading • Writing — your adventure!</div>
    </div>
    <div class="player-list">
      ${players.map((p) => {
        const t = THEMES[p.themeId] || THEMES.soccer;
        return `
        <button class="player-card" data-id="${p.id}">
          ${avatarHTML(p, 74)}
          <span class="who">
            <span class="name">${esc(p.name)}</span>
            <span class="meta">${t.name} • Level ${levelOf(p)} • ⭐ ${p.stars}</span>
          </span>
          <span class="theme-emoji">${t.emoji}</span>
        </button>`;
      }).join("")}
    </div>
    <div class="btn-col">
      <button class="btn green big" id="new-player">➕ New Player</button>
      ${players.length ? `<button class="btn ghost small" id="manage">Grown-ups: manage players</button>` : ""}
    </div>
  `;
  document.getElementById("new-player").onclick = () => { sfx.click(); startCreate(); };
  const manage = document.getElementById("manage");
  if (manage) manage.onclick = () => { sfx.click(); showManage(); };
  $screen.querySelectorAll(".player-card").forEach((el) => {
    el.onclick = () => {
      sfx.click();
      P = loadPlayers().find((p) => p.id === el.dataset.id);
      speak(`Welcome back, ${P.name}!`);
      showHub();
    };
  });
}

function showManage() {
  const players = loadPlayers();
  $screen.innerHTML = `
    <div class="topbar">
      <button class="btn ghost icon" id="back">⬅️</button>
      <h2>Manage Players</h2>
    </div>
    ${players.map((p) => `
      <div class="card" style="display:flex;align-items:center;gap:12px">
        ${avatarHTML(p, 60)}
        <div style="flex:1;font-weight:800">${esc(p.name)}</div>
        <button class="btn red small" style="background:var(--red)" data-del="${p.id}">Delete</button>
      </div>`).join("") || `<div class="card center">No players yet.</div>`}
  `;
  document.getElementById("back").onclick = showHome;
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
      <p style="font-weight:800;margin-top:18px">How old are you?</p>
      <div class="grid3" id="age-grid">
        ${[4, 5, 6, 7, 8].map((a) => `
          <button class="pick-tile ${draft.age === a ? "selected" : ""}" data-age="${a}">
            <span class="big-emoji">${a <= 5 ? "🐣" : "🦖"}</span>
            <span class="label">${a}</span>
          </button>`).join("")}
      </div>
    </div>
    <button class="btn green big" id="next">Next ➡️</button>
  `;
  document.getElementById("back").onclick = showHome;
  const input = document.getElementById("name-input");
  $screen.querySelectorAll("[data-age]").forEach((b) => {
    b.onclick = () => {
      sfx.click();
      draft.age = Number(b.dataset.age);
      $screen.querySelectorAll("[data-age]").forEach((x) => x.classList.remove("selected"));
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
      ${avatarHTML(P, 140, true)}
      <h2 style="margin:6px 0 0">${esc(P.name)}</h2>
      <div class="subtitle">${t.emoji} ${t.name} • Level ${levelOf(P)}</div>
    </div>
    <div class="btn-col">
      <button class="btn green big" id="go-train">💪 ${esc(t.terms.train)}</button>
      <button class="btn blue big" id="go-match">${t.terms.match.scoreEmoji} Play: ${esc(t.terms.match.name)}</button>
      <button class="btn purple big" id="go-locker">🏆 My Prizes &amp; ${esc(t.terms.hub)}</button>
      <button class="btn gold big" id="go-shop">🛍️ ${esc(t.terms.shop)}</button>
    </div>
  `;
  document.getElementById("back").onclick = () => { sfx.click(); showHome(); };
  document.getElementById("go-train").onclick = () => { sfx.click(); showTrainMenu(); };
  document.getElementById("go-match").onclick = () => { sfx.click(); startMatch(); };
  document.getElementById("go-locker").onclick = () => { sfx.click(); showLocker(); };
  document.getElementById("go-shop").onclick = () => { sfx.click(); showShop(); };
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

  if (task.kind === "choice") {
    renderChoiceTask(task, header, (wasRight) => {
      if (wasRight) {
        drill.correct++;
        if (drill.subject === "math") P.stats.mathRight++;
        if (drill.subject === "reading") P.stats.readRight++;
      }
      drill.idx++;
      renderDrillTask();
    });
  } else if (task.kind === "tiles") {
    renderTilesTask(task, header, (wasRight) => {
      if (wasRight) drill.correct++;
      drill.idx++;
      renderDrillTask();
    });
  } else {
    renderTraceTask(task, header, () => {
      drill.correct++; // tracing always counts — effort is the win at this age
      drill.idx++;
      renderDrillTask();
    });
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
  const sticker = drill.correct >= 4 ? maybeAwardSticker(t) : null;
  const trophies = checkTrophies();
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
  showTrophyPopups(trophies);
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
        setTimeout(() => done(attempts === 0), 950);
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
          setTimeout(() => done(false), 1600);
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
      setTimeout(() => done(attempts === 0), 1300);
    } else {
      attempts++;
      sfx.wrong();
      $slots.parentElement.classList.add("tiles-wrong");
      setTimeout(() => $slots.parentElement.classList.remove("tiles-wrong"), 500);
      if (attempts >= 2) {
        // Show the correct word, then move on.
        speak(`Good try! The word is spelled ${task.word.split("").join(", ")}.`);
        $slots.innerHTML = task.word.split("").map((L) => `<div class="tile-slot filled">${L}</div>`).join("");
        setTimeout(() => done(false), 1900);
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
  renderChoiceTask(task, matchHeaderHTML(), (wasRight) => {
    if (wasRight) {
      if (task.speakText && /plus|minus|how many|makes/i.test(task.speakText)) P.stats.mathRight++;
      else P.stats.readRight++;
      match.steps++;
      if (match.steps >= 3) {
        match.steps = 0;
        match.playerScore++;
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
  const trophies = checkTrophies();
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
      ${avatarHTML(P, 120, true)}
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
  showTrophyPopups(trophies);
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
  const trophies = checkTrophies();
  saveCurrent();
  sfx.coin();
  burstConfetti(["🪙", "🎉"], 16);
  render();
  showTrophyPopups(trophies);
}

/* ============================ boot ============================ */
showHome();
