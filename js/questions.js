/* ============================================================
   Brain Camp — question generators
   Tier "little" ≈ age 4-6, tier "big" ≈ age 7-9.
   Every generator returns a task object:
     { kind: "choice", prompt, speakText, visual, choices, answer, cols }
     { kind: "tiles",  prompt, speakText, word, emoji, tiles }
     { kind: "trace",  prompt, speakText, glyph }
   ============================================================ */

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sampleN(arr, n) { return shuffle(arr).slice(0, n); }

// Build numeric choice list: the answer + distinct nearby distractors.
function numberChoices(answer, count = 4, spread = 3) {
  const set = new Set([answer]);
  let guard = 0;
  while (set.size < count && guard++ < 200) {
    const d = answer + randInt(-spread, spread);
    if (d >= 0 && d !== answer) set.add(d);
  }
  let filler = answer + count;
  while (set.size < count) set.add(filler++);
  return shuffle([...set]).map((n) => ({ html: String(n), value: String(n) }));
}

function emojiGroup(emoji, n) {
  let out = "";
  for (let i = 0; i < n; i++) {
    out += emoji;
    if ((i + 1) % 5 === 0 && i + 1 < n) out += "<br>";
  }
  return `<span class="emoji-group">${out}</span>`;
}

/* ============================ MATH ============================ */

function mathQuestion(tier, theme, level) {
  return tier === "little" ? mathLittle(theme, level) : mathBig(theme, level);
}

function mathLittle(theme, level) {
  const thing = theme.terms.thingCounted;
  const type = pick(["count", "count", "add", "add", "bigger", "missing"]);

  if (type === "count") {
    const n = randInt(2, Math.min(10, 5 + level));
    return {
      kind: "choice",
      prompt: "How many do you see?",
      speakText: "How many do you see? Count them!",
      visual: emojiGroup(thing, n),
      choices: numberChoices(n, 4, 2),
      answer: String(n),
    };
  }

  if (type === "add") {
    const a = randInt(1, 4 + Math.min(level, 3));
    const b = randInt(1, 4);
    return {
      kind: "choice",
      prompt: "Add them up!",
      speakText: `What is ${a} plus ${b}?`,
      visual: `${emojiGroup(thing, a)} <span class="mathline">+</span> ${emojiGroup(thing, b)}<div class="mathline">${a} + ${b} = ?</div>`,
      choices: numberChoices(a + b, 4, 2),
      answer: String(a + b),
    };
  }

  if (type === "bigger") {
    let a = randInt(1, 10);
    let b = randInt(1, 10);
    while (b === a) b = randInt(1, 10);
    const answer = Math.max(a, b);
    return {
      kind: "choice",
      prompt: "Which number is bigger?",
      speakText: `Which number is bigger? ${a}, or ${b}?`,
      visual: "",
      choices: shuffle([
        { html: String(a), value: String(a) },
        { html: String(b), value: String(b) },
      ]),
      answer: String(answer),
    };
  }

  // missing number in a sequence
  const start = randInt(1, 6);
  const seq = [start, start + 1, start + 2, start + 3];
  const missIdx = randInt(1, 2);
  const answer = seq[missIdx];
  const shown = seq.map((n, i) => (i === missIdx ? "❓" : n)).join(", ");
  return {
    kind: "choice",
    prompt: "What number is missing?",
    speakText: `What number is missing? ${seq.map((n, i) => (i === missIdx ? "hmm" : n)).join(", ")}`,
    visual: `<div class="mathline">${shown}</div>`,
    choices: numberChoices(answer, 4, 2),
    answer: String(answer),
  };
}

function mathBig(theme, level) {
  const type = pick(["add", "sub", "add", "sub", "missing-addend", "skip", "word", "doubles"]);
  const top = level >= 3 ? 50 : 20; // numbers grow as the player levels up

  if (type === "add") {
    const a = randInt(3, top);
    const b = randInt(2, Math.min(20, top));
    return {
      kind: "choice",
      prompt: "Solve it!",
      speakText: `What is ${a} plus ${b}?`,
      visual: `<div class="mathline">${a} + ${b} = ?</div>`,
      choices: numberChoices(a + b, 4, 4),
      answer: String(a + b),
    };
  }

  if (type === "sub") {
    const a = randInt(5, top);
    const b = randInt(1, a - 1);
    return {
      kind: "choice",
      prompt: "Solve it!",
      speakText: `What is ${a} minus ${b}?`,
      visual: `<div class="mathline">${a} − ${b} = ?</div>`,
      choices: numberChoices(a - b, 4, 4),
      answer: String(a - b),
    };
  }

  if (type === "missing-addend") {
    const total = randInt(8, 20);
    const a = randInt(1, total - 1);
    const answer = total - a;
    return {
      kind: "choice",
      prompt: "Find the missing number!",
      speakText: `${a} plus what makes ${total}?`,
      visual: `<div class="mathline">${a} + ❓ = ${total}</div>`,
      choices: numberChoices(answer, 4, 3),
      answer: String(answer),
    };
  }

  if (type === "skip") {
    const by = pick([2, 5, 10]);
    const startMult = randInt(1, 4);
    const seq = [by * startMult, by * (startMult + 1), by * (startMult + 2)];
    const answer = by * (startMult + 3);
    return {
      kind: "choice",
      prompt: `Count by ${by}s!`,
      speakText: `Count by ${by}s. ${seq.join(", ")}, and then what comes next?`,
      visual: `<div class="mathline">${seq.join(", ")}, ❓</div>`,
      choices: numberChoices(answer, 4, by),
      answer: String(answer),
    };
  }

  if (type === "word") {
    const noun = pick(theme.terms.problemNouns);
    const a = randInt(3, 12);
    const b = randInt(2, 8);
    const addMode = Math.random() < 0.6;
    const text = addMode
      ? `You got ${a} ${noun}, then ${b} more. How many in all?`
      : `You had ${a + b} ${noun} and used ${b}. How many are left?`;
    return {
      kind: "choice",
      prompt: text,
      speakText: text,
      visual: `<div>${theme.terms.thingCounted}</div>`,
      choices: numberChoices(addMode ? a + b : a, 4, 3),
      answer: String(addMode ? a + b : a),
    };
  }

  // doubles
  const n = randInt(3, 10);
  return {
    kind: "choice",
    prompt: "Double it!",
    speakText: `What is ${n} plus ${n}?`,
    visual: `<div class="mathline">${n} + ${n} = ?</div>`,
    choices: numberChoices(n * 2, 4, 3),
    answer: String(n * 2),
  };
}

/* =========================== READING =========================== */

function readingQuestion(tier, theme) {
  return tier === "little" ? readingLittle() : readingBig(theme);
}

function readingLittle() {
  const type = pick(["letter-match", "starts-with", "sight-word", "rhyme"]);

  if (type === "letter-match") {
    const letters = sampleN("ABCDEFGHJKMNPQRT".split(""), 4);
    const target = letters[0];
    return {
      kind: "choice",
      prompt: `Find the little ${target}!`,
      speakText: `This is the big letter ${target}. Can you find the little ${target}?`,
      visual: `<div class="mathline">${target}</div>`,
      choices: shuffle(letters.map((L) => ({ html: L.toLowerCase(), value: L }))),
      answer: target,
    };
  }

  if (type === "starts-with") {
    const options = sampleN(PICTURE_WORDS, 3);
    const target = options[0];
    const letter = target.word[0].toUpperCase();
    return {
      kind: "choice",
      prompt: `Which one starts with ${letter}?`,
      speakText: `Which one starts with the letter ${letter}? ${options.map((o) => o.word).join(", or ")}?`,
      visual: `<div class="mathline">${letter}</div>`,
      choices: shuffle(options.map((o) => ({
        html: `<span class="choice-emoji">${o.emoji}</span><span class="choice-word">${o.word}</span>`,
        value: o.word,
      }))),
      answer: target.word,
    };
  }

  if (type === "sight-word") {
    const words = sampleN(SIGHT_WORDS_LITTLE, 4);
    const target = words[0];
    return {
      kind: "choice",
      prompt: "Find the word!",
      speakText: `Find the word: ${target}. ... ${target}.`,
      visual: `<div style="font-size:1rem;opacity:.7">Tap 🔊 to hear it again</div>`,
      choices: shuffle(words.map((w) => ({ html: w, value: w }))),
      answer: target,
      speakOnly: true,
    };
  }

  // rhyme
  const set = pick(RHYME_SETS);
  const options = shuffle([set.rhyme, ...sampleN(set.wrong, 2)]);
  return {
    kind: "choice",
    prompt: `What rhymes with ${set.base.word.toUpperCase()}?`,
    speakText: `What rhymes with ${set.base.word}? ${options.map((o) => o.word).join(", or ")}?`,
    visual: `<div class="mathline">${set.base.emoji} ${set.base.word}</div>`,
    choices: options.map((o) => ({
      html: `<span class="choice-emoji">${o.emoji}</span><span class="choice-word">${o.word}</span>`,
      value: o.word,
    })),
    answer: set.rhyme.word,
  };
}

function readingBig(theme) {
  const type = pick(["spell-pick", "rhyme", "opposite", "sentence", "sight-word"]);

  if (type === "spell-pick") {
    const ch = pick(SPELL_CHALLENGES);
    return {
      kind: "choice",
      prompt: "Which spelling is right?",
      speakText: `How do you spell this word?`,
      visual: `<div class="mathline">${ch.emoji}</div>`,
      choices: shuffle(ch.options.map((o) => ({ html: o, value: o }))),
      answer: ch.answer,
      cols: 1,
    };
  }

  if (type === "rhyme") {
    const set = pick(RHYME_SETS);
    const options = shuffle([set.rhyme, ...sampleN(set.wrong, 2)]);
    return {
      kind: "choice",
      prompt: `Which word rhymes with "${set.base.word}"?`,
      speakText: `Which word rhymes with ${set.base.word}?`,
      visual: "",
      choices: options.map((o) => ({ html: o.word, value: o.word })),
      answer: set.rhyme.word,
    };
  }

  if (type === "opposite") {
    const pairIdx = randInt(0, OPPOSITES.length - 1);
    const [a, b] = OPPOSITES[pairIdx];
    const wrongPool = OPPOSITES.filter((_, i) => i !== pairIdx).map((p) => p[1]);
    const options = shuffle([b, ...sampleN(wrongPool, 2)]);
    return {
      kind: "choice",
      prompt: `What is the opposite of "${a}"?`,
      speakText: `What is the opposite of ${a}?`,
      visual: "",
      choices: options.map((o) => ({ html: o, value: o })),
      answer: b,
    };
  }

  if (type === "sentence") {
    const s = pick(SENTENCES_BIG);
    const options = shuffle([s.answer, ...s.wrong]);
    return {
      kind: "choice",
      prompt: s.text,
      speakText: s.text.replace("___", "blank"),
      visual: "",
      choices: options.map((o) => ({ html: o, value: o })),
      answer: s.answer,
    };
  }

  // sight-word (harder list, read aloud)
  const words = sampleN(SIGHT_WORDS_BIG, 4);
  const target = words[0];
  return {
    kind: "choice",
    prompt: "Find the word!",
    speakText: `Find the word: ${target}. ... ${target}.`,
    visual: `<div style="font-size:1rem;opacity:.7">Tap 🔊 to hear it again</div>`,
    choices: shuffle(words.map((w) => ({ html: w, value: w }))),
    answer: target,
    speakOnly: true,
  };
}

/* =========================== WRITING =========================== */

function writingTask(tier, index) {
  // Mix tracing and tile-building; tracing first to warm up.
  if (tier === "little") {
    if (index % 2 === 0) {
      const glyph = pick("ABCDEFGHIKLMNOPRSTU23456789".split(""));
      return {
        kind: "trace",
        prompt: `Trace the ${/[0-9]/.test(glyph) ? "number" : "letter"} ${glyph}!`,
        speakText: `Use your finger to trace the ${/[0-9]/.test(glyph) ? "number" : "letter"} ${glyph}.`,
        glyph,
      };
    }
    const w = pick(TILE_WORDS_LITTLE);
    return {
      kind: "tiles",
      prompt: `Build the word: ${w.word.toUpperCase()}`,
      speakText: `Build the word ${w.word}. ${w.word.split("").join(", ")} spells ${w.word}!`,
      word: w.word,
      emoji: w.emoji,
      tiles: shuffle(w.word.split("")),
    };
  }

  // big kids
  if (index % 3 === 0) {
    const w = pick(TILE_WORDS_LITTLE);
    return {
      kind: "trace",
      prompt: `Trace the word: ${w.word}`,
      speakText: `Trace the whole word: ${w.word}.`,
      glyph: w.word,
    };
  }
  const w = pick(TILE_WORDS_BIG);
  const decoys = sampleN("bcdfgmprst".split("").filter((c) => !w.word.includes(c)), 2);
  return {
    kind: "tiles",
    prompt: `Spell the word you see!`,
    speakText: `Spell the word ${w.word}.`,
    word: w.word,
    emoji: w.emoji,
    tiles: shuffle([...w.word.split(""), ...decoys]),
  };
}

/* ======================= DRILL / MATCH BUILDERS ======================= */

const DRILL_LENGTH = 5;

function buildDrill(subject, tier, theme, level) {
  const tasks = [];
  for (let i = 0; i < DRILL_LENGTH; i++) {
    let t;
    if (subject === "math") t = mathQuestion(tier, theme, level);
    else if (subject === "reading") t = readingQuestion(tier, theme);
    else t = writingTask(tier, i);
    t.subject = subject;
    tasks.push(t);
  }
  return tasks;
}

// Matches use only tap-to-answer questions (math + reading mix).
function matchQuestion(tier, theme, level) {
  const subject = Math.random() < 0.5 ? "math" : "reading";
  const t = subject === "math" ? mathQuestion(tier, theme, level) : readingQuestion(tier, theme);
  t.subject = subject;
  return t;
}
