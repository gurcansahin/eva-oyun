/* Eva Oyunlar — ortak UI yardımcıları */
(function (global) {
  "use strict";

  function confetti(n, emojis) {
    const emo = emojis || ["🎉", "⭐", "🌟", "🎈", "✨"];
    for (let i = 0; i < n; i++) {
      const s = document.createElement("div");
      s.className = "conf";
      s.textContent = emo[i % emo.length];
      s.style.left = Math.random() * 100 + "vw";
      s.style.top = "-40px";
      s.style.animationDuration = 1.4 + Math.random() * 1.5 + "s";
      document.body.appendChild(s);
      setTimeout(function () { s.remove(); }, 3200);
    }
  }

  function bigFeedback(emoji) {
    let f = document.getElementById("feedback");
    if (!f) {
      f = document.createElement("div");
      f.id = "feedback"; f.className = "feedback";
      f.innerHTML = '<div class="big" id="fbBig"></div>';
      document.body.appendChild(f);
    }
    const b = document.getElementById("fbBig");
    b.textContent = emoji;
    f.classList.remove("on"); void f.offsetWidth; f.classList.add("on");
    setTimeout(function () { f.classList.remove("on"); }, 800);
  }

  function addHomeButton() {
    const b = document.createElement("button");
    b.className = "home-btn"; b.textContent = "🏠"; b.title = "Ana Menü";
    b.onclick = function () { location.href = "../index.html"; };
    document.body.appendChild(b);
  }

  global.EvaUI = { confetti: confetti, bigFeedback: bigFeedback, addHomeButton: addHomeButton };
})(window);
