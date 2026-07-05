/* Hayvan Dedektifi — oyun mantığı */
(function () {
  "use strict";
  const A = window.EvaAudio, U = window.EvaUI;

  /* Ses kaynağı:
     - varsayılan: assets/sounds/<k>.mp3 (gerçek kayıt)
     - synth: 1  -> Web Audio sentez (A.fx[k])
     - say:   1  -> Türkçe konuşma sentezi (hayvan adını söyler) */
  const ANIMALS = [
    { e: "🐄", n: "İnek",       k: "inek",       f: { milk: 1, farm: 1 } },
    { e: "🐱", n: "Kedi",       k: "kedi",       f: {} },
    { e: "🐶", n: "Köpek",      k: "kopek",      f: {} },
    { e: "🐦", n: "Kuş",        k: "kus",        f: { fly: 1, egg: 1 } },
    { e: "🐟", n: "Balık",      k: "balik",      f: { water: 1, egg: 1 }, synth: 1 },
    { e: "🦆", n: "Ördek",      k: "ordek",      f: { water: 1, fly: 1, egg: 1, farm: 1 } },
    { e: "🐸", n: "Kurbağa",    k: "kurbaga",    f: { water: 1, egg: 1, jump: 1 } },
    { e: "🐔", n: "Tavuk",      k: "tavuk",      f: { egg: 1, farm: 1 } },
    { e: "🦋", n: "Kelebek",    k: "kelebek",    f: { fly: 1 }, synth: 1 },
    { e: "🐝", n: "Arı",        k: "ari",        f: { fly: 1, stripes: 1 } },
    { e: "🐆", n: "Çita",       k: "cita",       f: { fast: 1 } },
    { e: "🐴", n: "At",         k: "at",         f: { fast: 1, farm: 1 } },
    { e: "🦒", n: "Zürafa",     k: "zurafa",     f: { neck: 1, big: 1 }, synth: 1 },
    { e: "🦁", n: "Aslan",      k: "aslan",      f: { big: 1, forest: 1 } },
    { e: "🐍", n: "Yılan",      k: "yilan",      f: { egg: 1, forest: 1 } },
    { e: "🐘", n: "Fil",        k: "fil",        f: { big: 1, forest: 1 } },
    { e: "🐑", n: "Koyun",      k: "koyun",      f: { milk: 1, farm: 1 }, say: 1 },
    { e: "🐐", n: "Keçi",       k: "keci",       f: { milk: 1, farm: 1, jump: 1 }, say: 1 },
    { e: "🐷", n: "Domuz",      k: "domuz",      f: { farm: 1 }, say: 1 },
    { e: "🐰", n: "Tavşan",     k: "tavsan",     f: { jump: 1, fast: 1 }, say: 1 },
    { e: "🐢", n: "Kaplumbağa", k: "kaplumbaga", f: { water: 1, egg: 1 }, say: 1 },
    { e: "🐧", n: "Penguen",    k: "penguen",    f: { water: 1, egg: 1 }, say: 1 },
    { e: "🐻", n: "Ayı",        k: "ayi",        f: { big: 1, forest: 1 }, synth: 1 },
    { e: "🐺", n: "Kurt",       k: "kurt",       f: { fast: 1, forest: 1 }, synth: 1 },
    { e: "🐯", n: "Kaplan",     k: "kaplan",     f: { fast: 1, big: 1, stripes: 1, forest: 1 }, synth: 1 },
    { e: "🐒", n: "Maymun",     k: "maymun",     f: { jump: 1, forest: 1 }, say: 1 },
    { e: "🦓", n: "Zebra",      k: "zebra",      f: { fast: 1, stripes: 1 }, say: 1 },
    { e: "🐬", n: "Yunus",      k: "yunus",      f: { water: 1, fast: 1 }, synth: 1 }
  ];

  const QUESTIONS = [
    { q: "Hangisi suda yaşar? 💧",       key: "water" },
    { q: "Hangisi uçar? 🕊️",            key: "fly" },
    { q: "Hangisi yumurtlar? 🥚",        key: "egg" },
    { q: "Hangisi çok hızlı koşar? 💨",  key: "fast" },
    { q: "Hangisinin boynu uzun? 🦒",    key: "neck" },
    { q: "Hangisi bize süt verir? 🥛",   key: "milk" },
    { q: "Hangisi zıp zıp zıplar? 🤸",   key: "jump" },
    { q: "Hangisi kocaman? 🐘",          key: "big" },
    { q: "Hangisi çizgili? 🦓",          key: "stripes" },
    { q: "Hangisi ormanda yaşar? 🌳",    key: "forest" },
    { q: "Hangisi çiftlikte yaşar? 🚜",  key: "farm" }
  ];

  let mode = "free", qIdx = 0, score = 0, locked = false;
  const grid = document.getElementById("grid");
  let banner = null;

  function render() {
    grid.innerHTML = "";
    ANIMALS.forEach(function (a, i) {
      const b = document.createElement("button");
      b.className = "animal"; b.dataset.i = i;
      b.innerHTML = '<span class="emo">' + a.e + '</span><span class="nm">' + a.n + "</span>";
      b.onclick = function () { tap(b, i); };
      grid.appendChild(b);
    });
  }

  function playAnimal(a) {
    A.stopAll(); A.shutUp();
    if (a.say) { A.say(a.n, { rate: 0.9, pitch: 1.2 }); }
    else if (a.synth) { A.fx[a.k](); }
    else { A.playFile(a.k); }
  }

  /* Büyük "DOĞRU!" afişi — doğru cevabı çok belirgin gösterir */
  function showCorrectBanner() {
    if (!banner) {
      banner = document.createElement("div");
      banner.className = "correct-banner";
      banner.innerHTML = '<span class="cb-check">✅</span><span class="cb-text">DOĞRU!</span>';
      document.body.appendChild(banner);
    }
    banner.classList.remove("show"); void banner.offsetWidth; banner.classList.add("show");
    setTimeout(function () { banner.classList.remove("show"); }, 2000);
  }

  function tap(el, i) {
    if (locked) return;
    const a = ANIMALS[i];
    el.classList.remove("speak"); void el.offsetWidth; el.classList.add("speak");
    playAnimal(a);

    if (mode !== "quiz") return;

    const key = QUESTIONS[qIdx].key;
    if (a.f[key]) {
      locked = true;
      el.classList.remove("speak");
      grid.classList.add("answered");
      el.classList.add("right", "picked");
      // diğer doğru hayvanları da yeşille göster
      Array.prototype.forEach.call(grid.children, function (c) {
        if (ANIMALS[c.dataset.i].f[key] && c !== el) c.classList.add("right");
      });
      score++; updateStars();
      setTimeout(A.fx.ding, 300);
      showCorrectBanner();
      U.bigFeedback("🎉");
      U.confetti(40, ["🎉", "⭐", "🌟", "🎈", "✨", "🐾", "🏆"]);
      setTimeout(function () { A.say("Aferin! Doğru bildin!", { rate: 1, pitch: 1.25 }); }, 650);
      setTimeout(function () { locked = false; nextQuestion(); }, 2600);
    } else {
      el.classList.remove("wrong"); void el.offsetWidth; el.classList.add("wrong");
      setTimeout(A.fx.buzz, 300);
      U.bigFeedback("🤔");
      setTimeout(function () { el.classList.remove("wrong"); }, 600);
    }
  }

  function updateStars() {
    const s = document.getElementById("stars");
    s.textContent = "⭐".repeat(Math.min(score, 12)) + (score > 12 ? " +" + (score - 12) : "");
  }

  function setQuestion() {
    document.getElementById("qText").textContent = QUESTIONS[qIdx].q;
    grid.classList.remove("answered");
    Array.prototype.forEach.call(grid.children, function (c) {
      c.classList.remove("right", "wrong", "picked", "speak");
    });
    A.say(QUESTIONS[qIdx].q);
  }

  function nextQuestion() {
    let n = qIdx;
    if (QUESTIONS.length > 1) { while (n === qIdx) n = Math.floor(Math.random() * QUESTIONS.length); }
    qIdx = n;
    setQuestion();
  }

  function setMode(m) {
    mode = m;
    const free = m === "free";
    document.getElementById("tabFree").classList.toggle("active", free);
    document.getElementById("tabQuiz").classList.toggle("active", !free);
    document.getElementById("questionBox").classList.toggle("show", !free);
    document.getElementById("stars").classList.toggle("show", !free);
    document.getElementById("freehint").classList.toggle("show", free);
    grid.classList.remove("answered");
    Array.prototype.forEach.call(grid.children, function (c) {
      c.classList.remove("right", "wrong", "picked", "speak");
    });
    if (!free) { qIdx = Math.floor(Math.random() * QUESTIONS.length); setQuestion(); }
    else { A.shutUp(); }
  }

  document.getElementById("tabFree").onclick = function () { setMode("free"); };
  document.getElementById("tabQuiz").onclick = function () { A.AC(); setMode("quiz"); };
  document.getElementById("nextBtn").onclick = nextQuestion;

  U.addHomeButton();
  A.preload(ANIMALS.filter(function (a) { return !a.synth && !a.say; }).map(function (a) { return a.k; }));
  render();
  setMode("free");
})();
