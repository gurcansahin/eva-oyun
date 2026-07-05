/* Eva Oyunlar — ortak ses motoru
   Gerçek kayıtlar: assets/sounds/*.mp3
   Sentez efektler: Web Audio API */
(function (global) {
  "use strict";

  // ---------- Web Audio çekirdek ----------
  let ac = null;
  function AC() {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === "suspended") ac.resume();
    return ac;
  }

  let noiseBuf = null;
  function noiseSrc() {
    const c = AC();
    if (!noiseBuf) {
      noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = c.createBufferSource();
    s.buffer = noiseBuf;
    s.loop = true;
    return s;
  }

  function tone(freq, dur, type, vol, when) {
    type = type || "square"; vol = vol == null ? 0.22 : vol; when = when || 0;
    const c = AC(), o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    const t = c.currentTime + when;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function hiss(o) {
    const c = AC();
    const t0 = o.t0 || c.currentTime + 0.001;
    const s = noiseSrc(), bp = c.createBiquadFilter();
    bp.type = o.type || "bandpass";
    bp.frequency.setValueAtTime(o.f || 1000, t0);
    if (o.f1) bp.frequency.linearRampToValueAtTime(o.f1, t0 + o.dur);
    bp.Q.value = o.q || 1;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.peak || 0.15, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    s.connect(bp); bp.connect(g); g.connect(c.destination);
    s.start(t0); s.stop(t0 + o.dur + 0.05);
  }

  // ---------- Gerçek kayıt çalar ----------
  const players = {};
  const SOUND_BASE = (document.currentScript && document.currentScript.dataset.soundBase) || "../assets/sounds/";
  function playFile(key) {
    if (!players[key]) players[key] = new Audio(SOUND_BASE + key + ".mp3");
    const a = players[key];
    a.currentTime = 0;
    const p = a.play();
    if (p && p.catch) p.catch(function () {});
    return a;
  }
  function stopAll() {
    Object.keys(players).forEach(function (k) {
      players[k].pause();
      players[k].currentTime = 0;
    });
  }
  function preload(keys) { keys.forEach(function (k) { if (!players[k]) players[k] = new Audio(SOUND_BASE + k + ".mp3"); }); }

  // ---------- Hazır efektler ----------
  const fx = {
    ding: function () { [660, 880, 1046].forEach(function (f, i) { tone(f, 0.25, "sine", 0.2, i * 0.09); }); },
    buzz: function () { tone(160, 0.28, "square", 0.16); },
    pop:  function () { tone(660, 0.1, "sine", 0.15); tone(880, 0.12, "sine", 0.15, 0.1); },
    scanBeep: function (seed) {
      const base = 880 + ((seed || 0) % 6) * 90;
      tone(base, 0.12, "square", 0.25);
      tone(base * 1.5, 0.09, "square", 0.14, 0.02);
    },
    printer: function () {
      for (let i = 0; i < 14; i++) tone(320 + Math.random() * 80, 0.03, "sawtooth", 0.10, i * 0.05);
      tone(700, 0.15, "sine", 0.15, 0.75);
    },
    cardSwipe: function () {
      tone(200, 0.25, "sawtooth", 0.14);
      tone(1046, 0.1, "sine", 0.2, 0.7);
      tone(1318, 0.14, "sine", 0.2, 0.83);
    },
    // sesi olmayan hayvanlar için sentez
    balik: function () {
      const t = AC().currentTime + 0.01;
      [[180,420,0],[220,520,0.22],[160,380,0.46]].forEach(function (b) {
        const c = AC(), o = c.createOscillator(), g = c.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(b[0], t + b[2]);
        o.frequency.exponentialRampToValueAtTime(b[1], t + b[2] + 0.12);
        g.gain.setValueAtTime(0.0001, t + b[2]);
        g.gain.exponentialRampToValueAtTime(0.25, t + b[2] + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + b[2] + 0.14);
        o.connect(g); g.connect(c.destination);
        o.start(t + b[2]); o.stop(t + b[2] + 0.2);
      });
    },
    kelebek: function () {
      const t = AC().currentTime + 0.01;
      for (let i = 0; i < 7; i++) hiss({ t0: t + i * 0.09, dur: 0.06, peak: 0.07, type: "lowpass", f: 1500, q: 0.7 });
    },
    zurafa: function () {
      const c = AC(), t0 = c.currentTime + 0.01, o = c.createOscillator(), g = c.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(115, t0);
      o.frequency.linearRampToValueAtTime(95, t0 + 0.7);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.16, t0 + 0.1);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.75);
      o.connect(g); g.connect(c.destination);
      o.start(t0); o.stop(t0 + 0.8);
      hiss({ t0: t0, dur: 0.7, peak: 0.06, type: "lowpass", f: 400, q: 0.6 });
    },
    ayi: function () {
      const c = AC(), t0 = c.currentTime + 0.01, o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(92, t0);
      o.frequency.linearRampToValueAtTime(68, t0 + 0.6);
      lp.type = "lowpass"; lp.frequency.value = 300;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.24, t0 + 0.09);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.72);
      o.connect(lp); lp.connect(g); g.connect(c.destination);
      o.start(t0); o.stop(t0 + 0.76);
      hiss({ t0: t0, dur: 0.6, peak: 0.09, type: "lowpass", f: 240, q: 0.5 });
    },
    kurt: function () {
      const c = AC(), t0 = c.currentTime + 0.01, o = c.createOscillator(), g = c.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(330, t0);
      o.frequency.linearRampToValueAtTime(540, t0 + 0.28);
      o.frequency.setValueAtTime(540, t0 + 0.72);
      o.frequency.linearRampToValueAtTime(300, t0 + 1.12);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.2, t0 + 0.16);
      g.gain.setValueAtTime(0.2, t0 + 0.72);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.16);
      o.connect(g); g.connect(c.destination);
      o.start(t0); o.stop(t0 + 1.2);
    },
    kaplan: function () {
      const c = AC(), t0 = c.currentTime + 0.01, o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(165, t0);
      o.frequency.exponentialRampToValueAtTime(88, t0 + 0.5);
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(720, t0);
      lp.frequency.linearRampToValueAtTime(300, t0 + 0.5);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.26, t0 + 0.1);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6);
      o.connect(lp); lp.connect(g); g.connect(c.destination);
      o.start(t0); o.stop(t0 + 0.64);
      hiss({ t0: t0, dur: 0.5, peak: 0.11, type: "bandpass", f: 480, q: 0.8 });
    },
    yunus: function () {
      const c = AC(), t0 = c.currentTime + 0.01;
      [[1800, 2600, 0], [2300, 3100, 0.15], [2000, 2800, 0.3]].forEach(function (b) {
        const o = c.createOscillator(), g = c.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(b[0], t0 + b[2]);
        o.frequency.exponentialRampToValueAtTime(b[1], t0 + b[2] + 0.1);
        g.gain.setValueAtTime(0.0001, t0 + b[2]);
        g.gain.exponentialRampToValueAtTime(0.12, t0 + b[2] + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + b[2] + 0.12);
        o.connect(g); g.connect(c.destination);
        o.start(t0 + b[2]); o.stop(t0 + b[2] + 0.16);
      });
    }
  };

  // ---------- Türkçe konuşma (yalnızca metin; emoji temizlenir) ----------
  function cleanForSpeech(s) {
    return s
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Sesleri (voices) tut; bazı tarayıcılarda asenkron gelir
  let voices = [];
  function loadVoices() { try { voices = speechSynthesis.getVoices() || []; } catch (e) { voices = []; } }
  function trVoice() {
    if (!voices.length) loadVoices();
    for (let i = 0; i < voices.length; i++) if (/^tr\b|tr[-_]/i.test(voices[i].lang || "")) return voices[i];
    return null; // TR ses yoksa null → tarayıcı varsayılan sesi kullanır (fallback)
  }
  if (typeof speechSynthesis !== "undefined") {
    loadVoices();
    try { speechSynthesis.onvoiceschanged = loadVoices; } catch (e) {}
  }

  function say(text, opts) {
    opts = opts || {};
    try {
      if (typeof speechSynthesis === "undefined") return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(cleanForSpeech(text));
      const v = trVoice();
      if (v) u.voice = v;         // TR ses varsa kullan
      u.lang = "tr-TR";           // yoksa da lang ipucu ver; tarayıcı en yakınını seçer
      u.rate = opts.rate || 0.95;
      u.pitch = opts.pitch || 1.1;
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  function shutUp() { try { speechSynthesis.cancel(); } catch (e) {} }

  // ---------- Ses kilidini açma (mobil/tablet autoplay politikası) ----------
  let unlocked = false, soundBtn = null;
  function removeBtn() {
    if (!soundBtn) return;
    const b = soundBtn; soundBtn = null;
    b.classList.add("hide");
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 320);
  }
  function unlock(userTapped) {
    try { AC(); } catch (e) {}                     // AudioContext'i resume et
    try {                                          // konuşma sentezini ısıt
      if (typeof speechSynthesis !== "undefined") {
        loadVoices();
        if (userTapped) { const w = new SpeechSynthesisUtterance(" "); w.volume = 0; speechSynthesis.speak(w); }
      }
    } catch (e) {}
    if (userTapped) { try { fx.pop(); } catch (e) {} } // dokununca duyulur onay
    unlocked = true;
    removeBtn();
  }
  function ensureSoundButton() {
    if (unlocked || soundBtn || !document.body) return;
    soundBtn = document.createElement("button");
    soundBtn.className = "sound-unlock";
    soundBtn.type = "button";
    soundBtn.textContent = "🔊 Sesi Aç";
    soundBtn.addEventListener("click", function () { unlock(true); });
    document.body.appendChild(soundBtn);
  }
  // ilk kullanıcı hareketinde otomatik aç
  ["pointerdown", "touchend", "keydown"].forEach(function (ev) {
    window.addEventListener(ev, function () { unlock(false); }, { once: true, passive: true });
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ensureSoundButton);
  else ensureSoundButton();

  global.EvaAudio = {
    AC: AC, tone: tone, hiss: hiss, playFile: playFile, stopAll: stopAll, preload: preload,
    fx: fx, say: say, shutUp: shutUp, unlock: unlock
  };
})(window);
