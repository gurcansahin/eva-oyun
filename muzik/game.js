/* Eva Piyano — düşen notalar + serbest piyano
   Cezasız akış: kaçan nota sessizce kaybolur, oyun hiç bitmez. */
(function () {
  "use strict";
  const A = window.EvaAudio, U = window.EvaUI;

  const NOTES = [
    { n: "DO",  f: 261.63, c: "#ff2d78" },
    { n: "RE",  f: 293.66, c: "#ff8c1a" },
    { n: "Mİ",  f: 329.63, c: "#e6b800" },
    { n: "FA",  f: 349.23, c: "#16a34a" },
    { n: "SOL", f: 392.00, c: "#0ea5e9" },
    { n: "LA",  f: 440.00, c: "#8b5cf6" },
    { n: "Sİ",  f: 493.88, c: "#d946ef" },
    { n: "DO▲", f: 523.25, c: "#ff2d55" }
  ];

  // Daha Dün Annemizin (Twinkle Twinkle) — nota dizisi
  const MELODY = [
    0,0,4,4,5,5,4,  3,3,2,2,1,1,0,
    4,4,3,3,2,2,1,  4,4,3,3,2,2,1,
    0,0,4,4,5,5,4,  3,3,2,2,1,1,0
  ];

  function playNote(i) {
    const f = NOTES[i].f;
    A.tone(f, 0.55, "sine", 0.25);
    A.tone(f * 2, 0.3, "sine", 0.07); // yumuşak harmonik
  }

  // ---------- yıldızlar ----------
  let stars = 0;
  const starsEl = document.getElementById("stars");
  const PRAISE = ["Harikasın!", "Süpersin!", "Ne güzel çalıyorsun!", "Bravo!"];
  function addStar() {
    stars++;
    starsEl.textContent = stars;
    if (stars % 10 === 0) {
      U.confetti(20, ["🎵", "🎶", "⭐", "🎉", "💜"]);
      A.say(PRAISE[(stars / 10 - 1) % PRAISE.length]);
    }
  }

  // ---------- düşen notalar ----------
  const fall = document.getElementById("fall");
  const COLS = 4;
  let speed = 55;          // px/sn — yavaş mod
  let spawnEvery = 1500;   // ms
  let melodyPos = 0;
  let tiles = [];          // { el, y }
  let lastSpawn = 0, lastT = 0;

  function spawnTile() {
    const noteIdx = MELODY[melodyPos % MELODY.length];
    melodyPos++;
    const col = Math.floor(Math.random() * COLS);
    const b = document.createElement("button");
    b.className = "tile";
    b.style.background = NOTES[noteIdx].c;
    b.style.left = (col * 25 + 1) + "%";
    b.style.top = "-80px";
    b.innerHTML = "🎵 " + NOTES[noteIdx].n;
    b.onclick = function () { hitTile(b, noteIdx); };
    fall.appendChild(b);
    tiles.push({ el: b, y: -80 });
  }

  function hitTile(el, noteIdx) {
    playNote(noteIdx);
    addStar();
    el.classList.add("hit");
    tiles = tiles.filter(function (t) { return t.el !== el; });
    setTimeout(function () { el.remove(); }, 360);
  }

  function loop(t) {
    if (!lastT) lastT = t;
    const dt = Math.min((t - lastT) / 1000, 0.05);
    lastT = t;

    if (t - lastSpawn > spawnEvery) { lastSpawn = t; spawnTile(); }

    const h = fall.clientHeight;
    tiles = tiles.filter(function (tile) {
      tile.y += speed * dt;
      tile.el.style.top = tile.y + "px";
      if (tile.y > h) {
        // ceza yok: sessizce kaybolur
        tile.el.classList.add("out");
        (function (el) { setTimeout(function () { el.remove(); }, 500); })(tile.el);
        return false;
      }
      return true;
    });

    requestAnimationFrame(loop);
  }

  // ---------- hız seçimi ----------
  const slowBtn = document.getElementById("slowBtn"),
        fastBtn = document.getElementById("fastBtn");
  function setSpeed(fast) {
    speed = fast ? 110 : 55;
    spawnEvery = fast ? 900 : 1500;
    slowBtn.classList.toggle("cur", !fast);
    fastBtn.classList.toggle("cur", fast);
    A.fx.pop();
  }
  slowBtn.onclick = function () { setSpeed(false); };
  fastBtn.onclick = function () { setSpeed(true); };

  // ---------- serbest piyano ----------
  const piano = document.getElementById("piano");
  NOTES.forEach(function (nt, i) {
    const k = document.createElement("button");
    k.className = "pkey";
    k.style.background = nt.c;
    k.textContent = nt.n;
    function press(ev) {
      if (ev) ev.preventDefault();
      playNote(i);
      k.classList.add("lit");
      setTimeout(function () { k.classList.remove("lit"); }, 180);
    }
    k.addEventListener("pointerdown", press);
    piano.appendChild(k);
  });

  // klavye desteği: 1-8 tuşları
  window.addEventListener("keydown", function (e) {
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 8) playNote(n - 1);
  });

  U.addHomeButton();
  requestAnimationFrame(loop);
})();
