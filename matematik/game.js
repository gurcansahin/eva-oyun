/* Sayı Ustası — rakam tanıma + 4 işlem
   Kademeli: Sayılar → Toplama → Çıkarma → Çarpma → Bölme
   Cezasız: yanlışta tekrar denenir, doğruda konfeti + övgü. */
(function () {
  "use strict";
  const A = window.EvaAudio, U = window.EvaUI;

  const EMOJIS = ["🍎", "🍓", "🍌", "🎈", "⭐", "🐤", "🌸", "🚗"];
  const PRAISE = ["Aferin!", "Süpersin!", "Harikasın!", "Çok güzel!", "Bravo!"];
  const ROUND = 10; // her seviyede soru sayısı

  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pickEmoji() { return EMOJIS[ri(0, EMOJIS.length - 1)]; }
  function rep(e, n) { return new Array(n + 1).join(e + " ").trim(); }

  // Her üretici: { html, speech, ans } döner
  function makeCount() {
    const n = ri(1, 9), e = pickEmoji();
    return {
      html: '<div class="obj">' + rep(e, n) + '</div><div class="ask">Kaç tane var?</div>',
      speech: "Kaç tane var? Sayalım!",
      ans: n
    };
  }
  function makeAdd() {
    const a = ri(1, 5), b = ri(1, 4), e = pickEmoji();
    return {
      html: '<div class="obj">' + rep(e, a) + '</div><div class="big">' + a + " + " + b + ' = ?</div><div class="obj">' + rep(e, b) + "</div>",
      speech: a + " artı " + b + " kaç eder?",
      ans: a + b
    };
  }
  function makeSub() {
    const a = ri(2, 9), b = ri(1, a - 1), e = pickEmoji();
    return {
      html: '<div class="obj">' + rep(e, a) + '</div><div class="big">' + a + " − " + b + " = ?</div>",
      speech: a + " eksi " + b + " kaç eder?",
      ans: a - b
    };
  }
  function makeMul() {
    const a = ri(2, 5), b = ri(2, 5);
    return {
      html: '<div class="big">' + a + " × " + b + ' = ?</div><div class="ask">' + a + " kere " + b + "</div>",
      speech: a + " çarpı " + b + " kaç eder?",
      ans: a * b
    };
  }
  function makeDiv() {
    const b = ri(2, 5), q = ri(1, 5), a = b * q;
    return {
      html: '<div class="big">' + a + " ÷ " + b + ' = ?</div><div class="ask">' + a + " şekeri " + b + " arkadaşa paylaştır</div>",
      speech: a + " bölü " + b + " kaç eder?",
      ans: q
    };
  }

  const LEVELS = [
    { n: "Sayılar",  e: "🔢", make: makeCount },
    { n: "Toplama",  e: "➕", make: makeAdd },
    { n: "Çıkarma",  e: "➖", make: makeSub },
    { n: "Çarpma",   e: "✖️", make: makeMul },
    { n: "Bölme",    e: "➗", make: makeDiv }
  ];
  const completed = {}; // seviye index → bitirme sayısı

  let stars = 0;
  const starsEl = document.getElementById("stars");
  function addStar() { stars++; starsEl.textContent = stars; }

  const menuEl = document.getElementById("menu"),
        gameEl = document.getElementById("game"),
        progEl = document.getElementById("prog"),
        qboxEl = document.getElementById("qbox"),
        ansEl  = document.getElementById("answers");

  // ---------- seviye menüsü ----------
  function renderMenu() {
    menuEl.innerHTML = "";
    LEVELS.forEach(function (lv, i) {
      const b = document.createElement("button");
      b.className = "lvl";
      b.innerHTML = '<span class="emo">' + lv.e + '</span><div class="nm">' + lv.n + '</div>' +
                    '<div class="done">' + (completed[i] ? "🏆".repeat(Math.min(completed[i], 3)) : "") + "</div>";
      b.onclick = function () { startLevel(i); };
      menuEl.appendChild(b);
    });
  }

  // ---------- oyun akışı ----------
  let curLevel = 0, qNo = 0, cur = null, locked = false;

  function startLevel(i) {
    curLevel = i; qNo = 0;
    menuEl.hidden = true; gameEl.hidden = false;
    A.fx.pop();
    A.say(LEVELS[i].n + " oyunu başlıyor!");
    setTimeout(nextQuestion, 1200);
  }

  function backToMenu() {
    gameEl.hidden = true; menuEl.hidden = false;
    renderMenu();
  }
  document.getElementById("backBtn").onclick = function () { A.fx.pop(); backToMenu(); };

  function makeOptions(ans) {
    const set = [ans];
    while (set.length < 3) {
      let d = ans + (Math.random() < 0.5 ? -1 : 1) * ri(1, 3);
      if (d < 0) d = ans + ri(1, 3);
      if (set.indexOf(d) === -1) set.push(d);
    }
    // karıştır
    for (let i = set.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)), t = set[i];
      set[i] = set[j]; set[j] = t;
    }
    return set;
  }

  function nextQuestion() {
    qNo++;
    if (qNo > ROUND) { finishLevel(); return; }
    cur = LEVELS[curLevel].make();
    locked = false;
    progEl.textContent = "Soru " + qNo + "/" + ROUND;
    qboxEl.innerHTML = cur.html;
    ansEl.innerHTML = "";
    makeOptions(cur.ans).forEach(function (v) {
      const b = document.createElement("button");
      b.className = "candy ans"; b.textContent = v;
      b.onclick = function () { answer(b, v); };
      ansEl.appendChild(b);
    });
    A.say(cur.speech);
  }

  function answer(btn, v) {
    if (locked) return;
    if (v === cur.ans) {
      locked = true;
      addStar();
      A.fx.ding();
      U.bigFeedback(["🎉", "⭐", "🌟", "💚", "🏆"][qNo % 5]);
      A.say(PRAISE[ri(0, PRAISE.length - 1)]);
      if (qNo % 5 === 0) U.confetti(12, ["⭐", "🎉", "✨"]);
      setTimeout(nextQuestion, 1100);
    } else {
      A.fx.buzz();
      btn.classList.add("shake");
      setTimeout(function () { btn.classList.remove("shake"); }, 450);
      A.say("Bir daha dene!");
    }
  }

  function finishLevel() {
    completed[curLevel] = (completed[curLevel] || 0) + 1;
    U.confetti(30, ["🎉", "🏆", "⭐", "🎈", "💚", "✨"]);
    A.fx.ding();
    A.say("Bravo! Hepsini bitirdin! Sen bir sayı ustasısın!");
    qboxEl.innerHTML = '<div class="big">🏆</div><div class="ask">Seviye tamam! Süpersin!</div>';
    ansEl.innerHTML = "";
    progEl.textContent = "⭐ " + ROUND + " soru bitti!";
    setTimeout(backToMenu, 2600);
  }

  U.addHomeButton();
  renderMenu();
})();
