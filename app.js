const LESSONS = {
  "Greetings": [
    ["Hello","Salam / Hello","Hello, how are you?"],["Good morning","Subah bakhair","Good morning, teacher."],
    ["Thank you","Shukriya","Thank you for your help."],["Please","Meherbani","Please sit down."],
    ["Sorry","Maazrat","Sorry, I am late."],["Goodbye","Khuda hafiz","Goodbye, see you tomorrow."]],
  "Daily verbs": [
    ["Eat","Khana","I eat rice every day."],["Drink","Peena","She drinks water."],
    ["Sleep","Sona","We sleep at night."],["Read","Parhna","He reads a book."],
    ["Write","Likhna","I write my name."],["Walk","Chalna","They walk to school."]],
  "Numbers & days": [
    ["One","Ek","I have one pen."],["Five","Paanch","Five students are here."],
    ["Ten","Das","Ten minutes left."],["Monday","Peer","School starts on Monday."],
    ["Friday","Jumma","Friday is a short day."],["Today","Aaj","Today is sunny."]],
  "Family & home": [
    ["Mother","Ammi","My mother cooks well."],["Father","Abbu","My father works hard."],
    ["Brother","Bhai","My brother is tall."],["House","Ghar","This is my house."],
    ["Door","Darwaza","Close the door."],["Water","Pani","I need some water."]]
};
const ALL = Object.values(LESSONS).flat();
const $ = id => document.getElementById(id);
const speak = t => { if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance(t); u.lang = "en-US"; u.rate = .85; speechSynthesis.cancel(); speechSynthesis.speak(u); } };

/* Lessons */
const tabs = $("tabs"), cards = $("cards");
function showLesson(name) {
  [...tabs.children].forEach(b => b.setAttribute("aria-selected", b.textContent === name));
  cards.innerHTML = "";
  LESSONS[name].forEach(([en, ur, ex]) => {
    const c = document.createElement("div"); c.className = "card";
    const h = document.createElement("h3"), s = document.createElement("span"), b = document.createElement("button");
    s.textContent = en; b.textContent = "🔊"; b.setAttribute("aria-label", "Hear " + en); b.onclick = () => speak(en + ". " + ex);
    h.append(s, b);
    const u = document.createElement("div"); u.className = "ur"; u.textContent = ur;
    const e = document.createElement("p"); e.className = "ex"; e.textContent = ex;
    c.append(h, u, e); cards.append(c);
  });
}
Object.keys(LESSONS).forEach(n => { const b = document.createElement("button"); b.textContent = n; b.setAttribute("role", "tab"); b.onclick = () => showLesson(n); tabs.append(b); });
showLesson(Object.keys(LESSONS)[0]);

/* Quiz */
const qb = $("quizBox"); let qs = [], qi = 0, score = 0;
const shuffle = a => a.map(x => [Math.random(), x]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
function startQuiz() {
  qs = shuffle(ALL).slice(0, 8).map(w => ({ w, opts: shuffle([w[1], ...shuffle(ALL.filter(x => x[1] !== w[1])).slice(0, 3).map(x => x[1])]) }));
  qi = 0; score = 0; renderQ();
}
function renderQ() {
  qb.innerHTML = "";
  if (qi >= qs.length) {
    const p = document.createElement("p"); p.className = "q";
    p.textContent = `You scored ${score} out of ${qs.length}. ` + (score >= 6 ? "Great work!" : "Keep practising, you are improving.");
    const r = document.createElement("button"); r.className = "btn"; r.textContent = "Try again"; r.onclick = startQuiz;
    qb.append(p, r); return;
  }
  const { w, opts } = qs[qi];
  const m = document.createElement("div"); m.className = "meta"; m.textContent = `Question ${qi + 1} of ${qs.length}`;
  const q = document.createElement("div"); q.className = "q"; q.textContent = `What is the meaning of "${w[0]}"?`;
  const o = document.createElement("div"); o.className = "opts";
  opts.forEach(t => {
    const b = document.createElement("button"); b.textContent = t;
    b.onclick = () => {
      const right = t === w[1]; if (right) score++;
      b.className = right ? "ok" : "no";
      [...o.children].forEach(x => { x.disabled = true; if (x.textContent === w[1]) x.className = "ok"; });
      const n = document.createElement("button"); n.className = "btn"; n.style.marginTop = "14px";
      n.textContent = qi + 1 < qs.length ? "Next question" : "See my score";
      n.onclick = () => { qi++; renderQ(); }; o.after(n); n.focus();
    };
    o.append(b);
  });
  qb.append(m, q, o);
}
startQuiz();

/* AI Guide */
const chat = $("chat"), log = $("log"), inp = $("inp");
const TOPICS = [
  [/am.*is.*are|is.*am.*are|\bto be\b/, "Am / is / are:\n• I → am (I am a student)\n• He, she, it → is (She is happy)\n• You, we, they → are (They are friends)"],
  [/\ba an the\b|article|\ban\b/, "Articles:\n• a → before consonant sounds (a book)\n• an → before vowel sounds (an apple)\n• the → a specific thing (the book on the table)"],
  [/past|yesterday/, "Simple past: add -ed to most verbs.\nI walk → I walked.\nSome are irregular: go → went, eat → ate, see → saw."],
  [/present|tense/, "Simple present is for habits and facts.\nI eat rice. She eats rice (add -s for he/she/it)."],
  [/plural/, "Plural: add -s (book → books). After s, sh, ch, x add -es (box → boxes). Irregular: child → children."],
  [/\bi\b.*\bme\b|pronoun|\bhe\b.*\bshe\b/, "Pronouns replace names:\nI/me, you, he/him, she/her, it, we/us, they/them.\nExample: Ali is my friend. He is kind."],
  [/question|\bwh\b|what.*where|who.*when/, "Question words:\n• What = kya • Where = kahan • When = kab\n• Who = kaun • Why = kyun • How = kaise\nExample: Where do you live?"],
  [/future|will\b|tomorrow/, "Future: use will + verb.\nI will study tomorrow. She will come at 5."],
  [/continuous|ing\b|right now/, "Present continuous: am/is/are + verb-ing for actions happening now.\nI am reading. They are playing."],
  [/preposition|\bin\b.*\bon\b|\bon\b.*\bat\b/, "Prepositions:\n• in = andar (in the room)\n• on = upar (on the table)\n• at = kisi jagah/waqt par (at school, at 5 o'clock)"],
  [/negative|\bnot\b|don'?t|doesn'?t/, "Negative sentences:\nI do not (don't) like tea. She does not (doesn't) like tea.\nWith am/is/are: add not (He is not here)."],
  [/adjective|opposite/, "Adjectives describe nouns: a big house, a small cat.\nOpposites: big/small, hot/cold, happy/sad, fast/slow."],
  [/tip|improve|practice|practise|how.*learn/, "Tips:\n1. Learn 5 new words daily.\n2. Say each word aloud (tap 🔊).\n3. Make your own sentence.\n4. Take the quiz every day."]
];
function say(t, me) { const d = document.createElement("div"); d.className = "msg " + (me ? "me" : "bot"); d.textContent = t; log.append(d); log.scrollTop = log.scrollHeight; }
function localReply(q) {
  const s = q.toLowerCase().trim();
  const w = ALL.find(x => s.includes(x[0].toLowerCase()) || s.includes(x[1].toLowerCase().split(" / ")[0]));
  if (w) return `${w[0]} = ${w[1]}\nExample: ${w[2]}`;
  for (const [re, ans] of TOPICS) if (re.test(s)) return ans;
  if (/hello|hi\b|salam|assalam/.test(s)) return "Hello! Main aapka English guide hoon. Kisi lafz ka matlab, grammar, ya practice tips poochein.";
  if (/quiz/.test(s)) { location.hash = "#quiz"; return "Quiz section khol diya. Best of luck!"; }
  return "Main abhi ye samajh nahi saka. Try karein: \"meaning of hello\", \"am is are\", \"articles\", \"past tense\" ya \"tips\".";
}
const hist = [];
async function ask(q) {
  q = q.trim(); if (!q) return; say(q, true); inp.value = "";
  if (window.AI_ENDPOINT) {
    const wait = document.createElement("div"); wait.className = "msg bot"; wait.textContent = "Soch raha hoon…"; log.append(wait);
    try {
      const r = await fetch(window.AI_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q, history: hist.slice(-8) }) });
      const j = await r.json(); wait.remove();
      if (j.answer) { hist.push({ role: "user", content: q }, { role: "assistant", content: j.answer }); return say(j.answer); }
    } catch (e) { wait.remove(); }
  }
  say(localReply(q));
}
["meaning of hello", "am is are", "articles", "tips"].forEach(t => { const b = document.createElement("button"); b.textContent = t; b.onclick = () => ask(t); $("hints").append(b); });
$("form").onsubmit = e => { e.preventDefault(); ask(inp.value); };
function toggle(open) { chat.hidden = !open; $("fab").style.display = open ? "none" : ""; if (open) inp.focus(); }
$("fab").onclick = () => toggle(true); $("navAsk").onclick = () => toggle(true); $("close").onclick = () => toggle(false);
say("Assalam o Alaikum! Main aapka AI Guide hoon. Kisi lafz ka matlab ya grammar ke baare mein poochein.");
