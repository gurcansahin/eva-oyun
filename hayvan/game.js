/* Hayvan Dedektifi — oyun mantığı */
(function () {
  "use strict";
  const A = window.EvaAudio, U = window.EvaUI;

  /* k: ses dosyası anahtarı (assets/sounds/<k>.mp3) — synth:1 ise sentez çalar */
  const ANIMALS = [
    { e: "🐄", n: "İnek",    k: "inek",    f: {} },
    { e: "🐱", n: "Kedi",    k: "kedi",    f: {} },
    { e: "🐶", n: "Köpek",   k: "kopek",   f: {} },
    { e: "🐦", n: "Kuş",     k: "kus",     f: { fly: 1, egg: 1 } },
    { e: "🐟", n: "Balık",   k: "balik",   f: { water: 1, egg: 1 }, synth: 1 },
    { e: "🦆", n: "Ördek",   k: "ordek",   f: { water: 1, fly: 1, egg: 1 } },
    { e: "🐸", n: "Kurbağa", k: "kurbaga", f: { water: 1, egg: 1 } },
    { e: "🐔", n: "Tavuk",   k: "tavuk",   f: { egg: 1 } },
    { e: "🦋", n: "Kelebek", k: "kelebek", f: { fly: 1 }, synth: 1 },
    { e: "🐝", n: "Arı",     k: "ari",     f: { fly: 1 } },
    { e: "🐆", n: "Çita",    k: "cita",    f: { fast: 1 } },
    { e: "🐴", n: "At",      k: "at",      f: { fast: 1 } },
    { e: "🦒", n: "Zürafa",  k: "zurafa",  f: { neck: 1 }, synth: 1 },
    { e: "🦁", n: "Aslan",   k: "aslan",   f: {} },
    { e: "🐍", n: "Yılan",   k: "yilan",   f: { egg: 1 } },
    { e: "🐘", n: "Fil",     k: "fil",     f: {} }
  ];

  const QUESTIONS = [
    { q: "Hangisi suda yaşar? 💧", key: "water" },
    { q: "Hangisi uçar? 🕊️", key: "fly" },
    { q: "Hangisi yumurtlar? 🥚", key: "egg" },
    { q: "Hangisi en hızlı? 💨", key: "fast" },
    { q: "Hangisinin boynu uzun? 🦒", key: "neck" }
  ];

  let mode = "free", qIdx = 0, score = 0, locked = false;
  const grid = document.getElementById("grid");

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
    A.stopAll();
    if (a.synth) { A.fx[a.k](); }
    else { A.playFile(a.k); }
  }

  function tap(el, i) {
    if (locked) return;
    const a = ANIMALS[i];
    el.classList.remove("speak"); void el.offsetWidth; el.classList.add("speak");
    playAnimal(a);

    if (mode === "quiz") {
      const key = QUESTIONS[qIdx].key;
      if (a.f[key]) {
        locked = true;
        el.classList.add("right");
        score++; updateStars();
        setTimeout(A.fx.ding, 400);
        U.bigFeedback("🎉");
        U.confetti(26, ["🎉", "⭐", "🌟", "🎈", "✨", "🐾"]);
        Array.prototype.forEach.call(grid.children, function (c) {
          if (ANIMALS[c.dataset.i].f[key] && c !== el) c.classList.add("right");
        });
        setTimeout(function () { locked = false; nextQuestion(); }, 2200);
      } else {
        el.classList.remove("wrong"); void el.offsetWidth; el.classList.add("wrong");
        setTimeout(A.fx.buzz, 300);
        U.bigFeedback("🤔");
        setTimeout(function () { el.classList.remove("wrong"); }, 600);
      }
    }
  }

  function updateStars() {
    const s = document.getElementById("stars");
    s.textContent = "⭐".repeat(Math.min(score, 12)) + (score > 12 ? " +" + (score - 12) : "");
  }

  function setQuestion() {
    document.getElementById("qText").textContent = QUESTIONS[qIdx].q;
    Array.prototype.forEach.call(grid.children, function (c) { c.classList.remove("right", "wrong"); });
    A.say(QUESTIONS[qIdx].q);
  }
  function nextQuestion() { qIdx = (qIdx + 1) % QUESTIONS.length; setQuestion(); }

  function setMode(m) {
    mode = m;
    const free = m === "free";
    document.getElementById("tabFree").classList.toggle("active", free);
    document.getElementById("tabQuiz").classList.toggle("active", !free);
    document.getElementById("questionBox").classList.toggle("show", !free);
    document.getElementById("stars").classList.toggle("show", !free);
    document.getElementById("freehint").classList.toggle("show", free);
    Array.prototype.forEach.call(grid.children, function (c) { c.classList.remove("right", "wrong", "speak"); });
    if (!free) { setQuestion(); } else { A.shutUp(); }
  }

  document.getElementById("tabFree").onclick = function () { setMode("free"); };
  document.getElementById("tabQuiz").onclick = function () { A.AC(); setMode("quiz"); };
  document.getElementById("nextBtn").onclick = nextQuestion;

  U.addHomeButton();
  A.preload(ANIMALS.filter(function (a) { return !a.synth; }).map(function (a) { return a.k; }));
  render();
  setMode("free");
})();
