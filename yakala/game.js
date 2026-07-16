/* Yakala Yakala! — kovalamaca, yakalanmak zaferdir 🤗
   Mod 1 (Beni Yakala): Eva'yı parmağınla kaçır; yakalayıcı yakalayınca gıdıklama şöleni.
   Mod 2 (Ben Yakalarım): Eva parmaktan kaçar; dokunup yakalayınca kahkaha.
   Cezasız: yakalanmak da yakalamak da kutlanır. */
(function () {
  "use strict";
  const A = window.EvaAudio, U = window.EvaUI;

  const CHASERS = [
    { e: "🐶", n: "Köpekçik" },
    { e: "🧸", n: "Ayıcık" },
    { e: "👨", n: "Baba" }
  ];
  const TAUNTS = ["Geliyorum!", "Seni yakalayacağım!", "Nereye kaçıyorsun?", "Yaklaşıyorum!"];
  const CATCH1 = ["Yakaladım! Gıdı gıdı gıdı!", "Hop! Yakalandın! Gıdı gıdı!", "Yakaladım seni! Gıdı gıdı gıdı!"];
  const CATCH2 = ["Yakaladın beni! Hi hi hi!", "Beni buldun! Hi hi hi!", "Tekrar yakaladın! Hi hi!"];

  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[ri(0, arr.length - 1)]; }

  // kıkırdama + gıdıklama sentez sesleri
  function giggle() {
    for (let i = 0; i < 5; i++) A.tone(650 + Math.random() * 550, 0.07, "sine", 0.16, i * 0.065);
  }
  function tickle() {
    for (let i = 0; i < 10; i++) A.tone(500 + Math.random() * 700, 0.05, "square", 0.1, i * 0.05);
  }

  let stars = 0;
  const starsEl = document.getElementById("stars");
  function addStar() { stars++; starsEl.textContent = stars; }

  const menuEl = document.getElementById("menu"),
        playEl = document.getElementById("play"),
        progEl = document.getElementById("playProg"),
        arena = document.getElementById("arena"),
        evaEl = document.getElementById("evaChr"),
        chaserEl = document.getElementById("chaserChr"),
        fxEl = document.getElementById("catchFx"),
        fxTxt = document.getElementById("catchTxt");

  function showScreen(el) { [menuEl, playEl].forEach(function (s) { s.hidden = s !== el; }); }

  // ---------- menüler ----------
  function card(emo, nm, ds, onTap) {
    const b = document.createElement("button");
    b.className = "lvl";
    b.innerHTML = '<span class="emo">' + emo + '</span><div class="nm">' + nm + '</div><div class="ds">' + ds + "</div>";
    b.onclick = onTap;
    menuEl.appendChild(b);
  }
  function renderMenu() {
    showScreen(menuEl);
    menuEl.innerHTML = "";
    card("🤗", "Beni Yakala!", "kaç kaç... gıdı gıdı!", function () { A.fx.pop(); renderChaserMenu(); });
    card("🖐️", "Ben Yakalarım!", "Eva'yı parmağınla yakala", function () { A.fx.pop(); startPlay(2, null); });
  }
  function renderChaserMenu() {
    menuEl.innerHTML = '<div class="mtitle">Seni kim yakalasın?</div>';
    CHASERS.forEach(function (c) {
      card(c.e, c.n, "beni " + c.n.toLowerCase() + " kovalasın!", function () { startPlay(1, c); });
    });
    const back = document.createElement("button");
    back.className = "candy back"; back.textContent = "⬅️ Geri";
    back.style.flexBasis = "100%"; back.style.maxWidth = "220px";
    back.onclick = function () { A.fx.pop(); renderMenu(); };
    menuEl.appendChild(back);
  }

  // ---------- oyun durumu ----------
  let mode = 0, chaser = null, running = false, caught = false, raf = 0;
  let eva = { x: 0, y: 0 }, ch = { x: 0, y: 0, speed: 0 };
  let finger = null, catches = 0, fleeTime = 0, lastTaunt = 0, lastGiggle = 0;
  const M = 34; // kenarlardan pay

  function arenaSize() { return { w: arena.clientWidth, h: arena.clientHeight }; }
  function clampPos(p) {
    const s = arenaSize();
    p.x = Math.max(M, Math.min(s.w - M, p.x));
    p.y = Math.max(M, Math.min(s.h - M, p.y));
  }
  function dist(a, b) { const dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
  function render() {
    evaEl.style.transform = "translate(" + (eva.x - 30) + "px," + (eva.y - 34) + "px)";
    if (mode === 1) chaserEl.style.transform = "translate(" + (ch.x - 30) + "px," + (ch.y - 34) + "px)";
  }

  function startPlay(m, c) {
    mode = m; chaser = c; catches = 0; caught = false; finger = null; fleeTime = 0;
    showScreen(playEl);
    fxEl.hidden = true;
    chaserEl.hidden = m !== 1;
    if (c) chaserEl.querySelector(".b").textContent = c.e;
    progEl.textContent = m === 1 ? (c.n + " geliyor... Kaç kaç kaç!") : "Eva kaçıyor... Dokun ve yakala!";
    resetRound();
    A.fx.pop();
    A.say(m === 1 ? (c.n + " geliyor! Parmağınla kaç kaç kaç!") : "Eva kaçıyor! Dokun ve yakala!");
    running = true;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }

  function resetRound() {
    const s = arenaSize();
    eva.x = s.w / 2; eva.y = s.h / 2;
    // yakalayıcı rastgele bir köşeden gelir; her yakalamada birazcık hızlanır
    const corners = [[M, M], [s.w - M, M], [M, s.h - M], [s.w - M, s.h - M]];
    const k = corners[ri(0, 3)];
    ch.x = k[0]; ch.y = k[1];
    ch.speed = 1.7 + Math.min(catches * 0.12, 1.2);
    wander.t = 0;
    fleeTime = 0;
    render();
  }

  // ---------- parmak takibi ----------
  function fingerPos(e) {
    const r = arena.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  arena.addEventListener("pointerdown", function (e) { finger = fingerPos(e); });
  arena.addEventListener("pointermove", function (e) { if (e.buttons || e.pointerType === "touch") finger = fingerPos(e); });
  ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
    arena.addEventListener(ev, function () { finger = null; });
  });

  // ---------- oyun döngüsü ----------
  const wander = { x: 0, y: 0, t: 0 };
  function loop(ts) {
    if (!running) return;
    if (!caught) {
      if (mode === 1) stepMode1(ts);
      else stepMode2(ts);
      clampPos(eva); if (mode === 1) clampPos(ch);
      render();
    }
    raf = requestAnimationFrame(loop);
  }

  // Mod 1: Eva parmağı izler, yakalayıcı Eva'yı kovalar
  function stepMode1(ts) {
    if (finger) {
      eva.x += (finger.x - eva.x) * 0.2;
      eva.y += (finger.y - eva.y) * 0.2;
    }
    const d = dist(ch, eva);
    if (d > 1) {
      ch.x += ((eva.x - ch.x) / d) * ch.speed;
      ch.y += ((eva.y - ch.y) / d) * ch.speed;
    }
    ch.speed = Math.min(ch.speed + 0.0022, 8.5); // yavaşça hızlanır → er geç mutlaka yakalar
    if (ts - lastTaunt > 5200 && Math.random() < 0.012) {
      lastTaunt = ts;
      A.say(pick(TAUNTS));
    }
    if (d < 56) doCatch();
  }

  // Mod 2: Eva parmaktan kaçar (yorulunca yavaşlar), dokununca yakalanır
  function stepMode2(ts) {
    const s = arenaSize();
    if (finger && dist(finger, eva) < 170) {
      const d = Math.max(dist(finger, eva), 1);
      // yorulma sayacı tur içinde birikmeli (sıfırlanmaz) → minik parmaklar da mutlaka yakalar
      const tired = fleeTime > 3000;
      const sp = tired ? 1.4 : 3.5;
      eva.x += ((eva.x - finger.x) / d) * sp;
      eva.y += ((eva.y - finger.y) / d) * sp;
      // duvara sıkışınca yana kaç
      if (eva.x <= M || eva.x >= s.w - M) eva.y += (eva.y > s.h / 2 ? -1 : 1) * sp * 1.4;
      if (eva.y <= M || eva.y >= s.h - M) eva.x += (eva.x > s.w / 2 ? -1 : 1) * sp * 1.4;
      fleeTime += 16;
      if (ts - lastGiggle > 1600) { lastGiggle = ts; giggle(); }
    } else {
      wander.t -= 16;
      if (wander.t <= 0) {
        wander.x = ri(M, s.w - M); wander.y = ri(M, s.h - M);
        wander.t = ri(1800, 3200);
      }
      const d = Math.max(dist(wander, eva), 1);
      if (d > 8) {
        eva.x += ((wander.x - eva.x) / d) * 1.6;
        eva.y += ((wander.y - eva.y) / d) * 1.6;
      }
    }
    if (finger && dist(finger, eva) < 55) doCatch();
  }

  // ---------- yakalama şöleni ----------
  function doCatch() {
    caught = true;
    catches++;
    addStar();
    A.fx.ding();
    tickle();
    fxTxt.textContent = mode === 1 ? "YAKALANDIN! 🤗" : "YAKALADIN! 🎉";
    fxEl.hidden = false;
    U.confetti(16, ["🎉", "⭐", "💛", "🎈", "✨"]);
    A.say(pick(mode === 1 ? CATCH1 : CATCH2));
    progEl.textContent = "Yakalama: " + catches + " ⭐";
    if (catches % 5 === 0) {
      U.confetti(30, ["🏆", "🎉", "⭐", "💖", "✨"]);
      setTimeout(function () { A.say("Beş kere daha! Süpersin!"); }, 1400);
    }
    setTimeout(function () {
      if (!running) return;
      fxEl.hidden = true;
      caught = false;
      resetRound();
      if (mode === 1) A.say("Kaç kaç kaç!");
    }, 2300);
  }

  document.getElementById("backBtn").onclick = function () {
    A.fx.pop(); A.shutUp();
    running = false; cancelAnimationFrame(raf);
    renderMenu();
  };

  U.addHomeButton();
  renderMenu();
})();
