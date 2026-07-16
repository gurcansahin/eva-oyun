/* Eva Akademi — etkinlik kitabından ilhamla 7 mini oyun:
   ♻️ Geri Dönüşüm, 🇬🇧 İngilizce, 🥦 Sağlıklı mı?, 🔗 Sebep-Sonuç,
   🌑 Gölge Bulmaca, 🔍 Kaç Tane?, 🧠 Görsel Hafıza
   Cezasız: yanlışta tekrar denenir, doğruda konfeti + övgü. */
(function () {
  "use strict";
  const A = window.EvaAudio, U = window.EvaUI;

  const PRAISE = ["Aferin!", "Süpersin!", "Harikasın!", "Çok güzel!", "Bravo!"];
  const ROUND = 10;

  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function praiseTR() { return PRAISE[ri(0, PRAISE.length - 1)]; }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)), t = a[i];
      a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // ---------- İngilizce konuşma (audio.js TR konuşur; burada en-US) ----------
  function enVoice() {
    let vs = [];
    try { vs = speechSynthesis.getVoices() || []; } catch (e) {}
    for (let i = 0; i < vs.length; i++) if (/^en[-_]/i.test(vs[i].lang || "")) return vs[i];
    return null;
  }
  function sayEN(text, opts) {
    opts = opts || {};
    try {
      if (typeof speechSynthesis === "undefined") return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = enVoice();
      if (v) u.voice = v;
      u.lang = "en-US";
      u.rate = opts.rate || 0.8;
      u.pitch = opts.pitch || 1.05;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  // ---------- veri: geri dönüşüm ----------
  // Renkler resmi Sıfır Atık standardı: kağıt mavi, plastik sarı, cam yeşil, metal gri, pil kırmızı
  const RECYCLE_BINS = [
    { id: "kagit",   nm: "KAĞIT",   e: "📄", c: "#3b82f6" },
    { id: "plastik", nm: "PLASTİK", e: "🧴", c: "#eab308" },
    { id: "cam",     nm: "CAM",     e: "🍾", c: "#16a34a" },
    { id: "metal",   nm: "METAL",   e: "🥫", c: "#6b7280" },
    { id: "pil",     nm: "PİL",     e: "🔋", c: "#ef4444" }
  ];
  const RECYCLE_ITEMS = [
    { e: "🔋", n: "Pil", bin: "pil" },
    { e: "🪫", n: "Bitmiş Pil", bin: "pil" },
    { e: "🧴", n: "Şampuan Şişesi", bin: "plastik" },
    { e: "🥤", n: "Pet Bardak", bin: "plastik" },
    { e: "🛍️", n: "Naylon Poşet", bin: "plastik" },
    { e: "🪥", n: "Diş Fırçası", bin: "plastik" },
    { e: "🥫", n: "Konserve Kutusu", bin: "metal" },
    { e: "🥄", n: "Metal Kaşık", bin: "metal" },
    { e: "🔩", n: "Vida", bin: "metal" },
    { e: "🗝️", n: "Eski Anahtar", bin: "metal" },
    { e: "📦", n: "Karton Koli", bin: "kagit" },
    { e: "📰", n: "Gazete", bin: "kagit" },
    { e: "📄", n: "Kağıt", bin: "kagit" },
    { e: "✉️", n: "Zarf", bin: "kagit" },
    { e: "🍾", n: "Cam Şişe", bin: "cam" },
    { e: "🫙", n: "Kavanoz", bin: "cam" },
    { e: "🥂", n: "Cam Bardak", bin: "cam" }
  ];

  // ---------- veri: sağlıklı mı ----------
  const HEALTH_BINS = [
    { id: "iyi",  nm: "SAĞLIKLI",  e: "😊", c: "#16a34a" },
    { id: "kotu", nm: "SAĞLIKSIZ", e: "😟", c: "#ef4444" }
  ];
  const HEALTH_ITEMS = [
    { e: "🍎", n: "Elma", en: "Apple", bin: "iyi" },
    { e: "🍌", n: "Muz", en: "Banana", bin: "iyi" },
    { e: "🍊", n: "Portakal", en: "Orange", bin: "iyi" },
    { e: "🍓", n: "Çilek", en: "Strawberry", bin: "iyi" },
    { e: "🍅", n: "Domates", en: "Tomato", bin: "iyi" },
    { e: "🥕", n: "Havuç", en: "Carrot", bin: "iyi" },
    { e: "🥒", n: "Salatalık", en: "Cucumber", bin: "iyi" },
    { e: "🥦", n: "Brokoli", en: "Broccoli", bin: "iyi" },
    { e: "🍇", n: "Üzüm", en: "Grapes", bin: "iyi" },
    { e: "🥛", n: "Süt", en: "Milk", bin: "iyi" },
    { e: "🍔", n: "Hamburger", en: "Burger", bin: "kotu" },
    { e: "🍟", n: "Patates Kızartması", en: "Fries", bin: "kotu" },
    { e: "🍫", n: "Çikolata", en: "Chocolate", bin: "kotu" },
    { e: "🍬", n: "Şeker", en: "Candy", bin: "kotu" },
    { e: "🥤", n: "Gazoz", en: "Soda", bin: "kotu" },
    { e: "🌭", n: "Sosisli", en: "Hot dog", bin: "kotu" },
    { e: "🍩", n: "Donut", en: "Donut", bin: "kotu" },
    { e: "🍪", n: "Kurabiye", en: "Cookie", bin: "kotu" }
  ];

  // ---------- veri: ingilizce dinle-bul ----------
  const QUIZ_SETS = {
    zit: { nm: "Zıt Anlamlılar", e: "🐰🐢", words: [
      { e: "👵", en: "Old" },   { e: "👶", en: "Young" },
      { e: "🐘", en: "Big" },   { e: "🐭", en: "Small" },
      { e: "🐇", en: "Fast" },  { e: "🐢", en: "Slow" },
      { e: "😃", en: "Happy" }, { e: "😢", en: "Sad" },
      { e: "🥵", en: "Hot" },   { e: "🥶", en: "Cold" },
      { e: "🐍", en: "Long" },  { e: "🐛", en: "Short" }
    ] },
    aile: { nm: "Ailem", e: "👨‍👩‍👧", words: [
      { e: "👩", en: "Mother" },      { e: "👨", en: "Father" },
      { e: "👵", en: "Grandmother" }, { e: "👴", en: "Grandfather" },
      { e: "👦", en: "Brother" },     { e: "👧", en: "Sister" },
      { e: "👶", en: "Baby" },        { e: "🙋‍♀️", en: "Me" }
    ] },
    yemek: { nm: "Yiyecekler", e: "🍎", words: [
      { e: "🍎", en: "Apple" },      { e: "🍌", en: "Banana" },
      { e: "🍊", en: "Orange" },     { e: "🍓", en: "Strawberry" },
      { e: "🍅", en: "Tomato" },     { e: "🥕", en: "Carrot" },
      { e: "🥒", en: "Cucumber" },   { e: "🥔", en: "Potato" },
      { e: "🍔", en: "Burger" },     { e: "🍫", en: "Chocolate" }
    ] }
  };

  // ---------- veri: gölge bulmaca ----------
  const SHADOW_GROUPS = [
    [ { e: "⛵", n: "Yelkenli" }, { e: "🚗", n: "Araba" }, { e: "🚁", n: "Helikopter" }, { e: "🚂", n: "Tren" },
      { e: "✈️", n: "Uçak" }, { e: "🚜", n: "Traktör" }, { e: "🚲", n: "Bisiklet" }, { e: "🚀", n: "Roket" } ],
    [ { e: "🐘", n: "Fil" }, { e: "🦒", n: "Zürafa" }, { e: "🐰", n: "Tavşan" }, { e: "🐢", n: "Kaplumbağa" },
      { e: "🦋", n: "Kelebek" }, { e: "🐟", n: "Balık" }, { e: "🐓", n: "Horoz" }, { e: "🦀", n: "Yengeç" } ],
    [ { e: "🍎", n: "Elma" }, { e: "🍌", n: "Muz" }, { e: "🍓", n: "Çilek" }, { e: "🥕", n: "Havuç" },
      { e: "🍇", n: "Üzüm" }, { e: "🍍", n: "Ananas" } ],
    [ { e: "⚽", n: "Top" }, { e: "🎈", n: "Balon" }, { e: "🧸", n: "Ayıcık" }, { e: "🌂", n: "Şemsiye" },
      { e: "⭐", n: "Yıldız" }, { e: "🏠", n: "Ev" }, { e: "🌻", n: "Çiçek" }, { e: "👟", n: "Ayakkabı" } ]
  ];

  // ---------- veri: görsel hafıza ----------
  const MEM_SHAPES = [
    { e: "🔵", n: "mavi daire" }, { e: "🔴", n: "kırmızı daire" },
    { e: "🟨", n: "sarı kare" }, { e: "🟦", n: "mavi kare" },
    { e: "🔺", n: "üçgen" }, { e: "⭐", n: "yıldız" },
    { e: "💚", n: "yeşil kalp" }, { e: "🟣", n: "mor daire" }
  ];

  // ---------- veri: sebep-sonuç ----------
  const CAUSE_QS = [
    { qe: "🌧️", q: "Yağmur yağarsa ne yaparız?", why: "Yağmurda ıslanmamak için şemsiye açarız!",
      opts: [{ e: "☔", t: "Şemsiye açarız", ok: true }, { e: "🕶️", t: "Güneş gözlüğü takarız" }, { e: "🪁", t: "Uçurtma uçururuz" }] },
    { qe: "🥶", q: "Hava çok soğuksa ne giyeriz?", why: "Soğukta üşümemek için mont giyeriz!",
      opts: [{ e: "🧥", t: "Mont giyeriz", ok: true }, { e: "👙", t: "Mayo giyeriz" }, { e: "🩳", t: "Şort giyeriz" }] },
    { qe: "🍫", q: "Çok şeker yersek ne olur?", why: "Çok şeker dişleri çürütür, az yemeliyiz!",
      opts: [{ e: "🦷", t: "Dişlerimiz çürür", ok: true }, { e: "💪", t: "Güçleniriz" }, { e: "📏", t: "Boyumuz uzar" }] },
    { qe: "🌱", q: "Çiçeğe su verirsek ne olur?", why: "Su verince çiçekler büyür, rengarenk açar!",
      opts: [{ e: "🌸", t: "Büyür ve açar", ok: true }, { e: "🥀", t: "Hemen solar" }, { e: "🦋", t: "Kelebek olur" }] },
    { qe: "🍽️", q: "Yemekten önce ne yaparız?", why: "Mikroplardan korunmak için ellerimizi yıkarız!",
      opts: [{ e: "🧼", t: "Ellerimizi yıkarız", ok: true }, { e: "😴", t: "Uyuruz" }, { e: "📺", t: "Televizyon açarız" }] },
    { qe: "🪥", q: "Dişlerimizi fırçalarsak ne olur?", why: "Fırçalayınca dişlerimiz tertemiz parlar!",
      opts: [{ e: "✨", t: "Pırıl pırıl parlar", ok: true }, { e: "🥶", t: "Dişlerimiz üşür" }, { e: "🎨", t: "Rengi değişir" }] },
    { qe: "☀️", q: "Güneş açınca kardan adam ne olur?", why: "Güneş sıcaktır, kar erir, su olur!",
      opts: [{ e: "💧", t: "Erir", ok: true }, { e: "🕺", t: "Dans eder" }, { e: "📏", t: "Büyür" }] },
    { qe: "💡", q: "Düğmeye basarsak ne olur?", why: "Elektrik düğmesi lambayı yakar!",
      opts: [{ e: "💡", t: "Lamba yanar", ok: true }, { e: "🌧️", t: "Yağmur yağar" }, { e: "🚗", t: "Araba gelir" }] },
    { qe: "😴", q: "Uykumuz gelirse ne yaparız?", why: "Güzelce uyuruz, sabah dinç kalkarız!",
      opts: [{ e: "🛏️", t: "Yatağa gideriz", ok: true }, { e: "⚽", t: "Top oynarız" }, { e: "🍰", t: "Pasta yeriz" }] },
    { qe: "🌰", q: "Tohumu toprağa ekersek ne olur?", why: "Tohum toprakta büyür, koca bir ağaç olur!",
      opts: [{ e: "🌳", t: "Ağaç büyür", ok: true }, { e: "🚀", t: "Roket olur" }, { e: "🍭", t: "Şeker çıkar" }] },
    { qe: "❄️", q: "Karda oynarsak ellerimize ne takarız?", why: "Eldiven ellerimizi sıcacık tutar!",
      opts: [{ e: "🧤", t: "Eldiven takarız", ok: true }, { e: "🩴", t: "Terlik takarız" }, { e: "🎩", t: "Şapka takarız" }] },
    { qe: "🦠", q: "Ellerimizi hiç yıkamazsak ne olur?", why: "Mikroplar bizi hasta etmesin diye elleri yıkarız!",
      opts: [{ e: "🤒", t: "Hasta olabiliriz", ok: true }, { e: "🦸", t: "Süper güç kazanırız" }, { e: "🌈", t: "Gökkuşağı çıkar" }] },
    { qe: "🧸", q: "Oyuncaklarımızı toplarsak ne olur?", why: "Odamız tertemiz olur, oyuncaklar kaybolmaz!",
      opts: [{ e: "✨", t: "Odamız tertemiz olur", ok: true }, { e: "🌧️", t: "Yağmur yağar" }, { e: "🐘", t: "Fil gelir" }] },
    { qe: "🥛", q: "Süt içersek ne olur?", why: "Süt kemiklerimizi güçlendirir!",
      opts: [{ e: "💪", t: "Kemiklerimiz güçlenir", ok: true }, { e: "🐄", t: "İnek oluruz" }, { e: "🎈", t: "Uçarız" }] },
    { qe: "🔌", q: "Prize dokunursak ne olur?", why: "Prizlere asla dokunmayız, elektrik çarpar, çok tehlikeli!",
      opts: [{ e: "⚡", t: "Elektrik çarpar, tehlikeli!", ok: true }, { e: "🎵", t: "Müzik çalar" }, { e: "🍭", t: "Şeker verir" }] },
    { qe: "🚦", q: "Kırmızı ışık yanarsa ne yaparız?", why: "Kırmızıda dururuz, yeşil yanınca geçeriz!",
      opts: [{ e: "✋", t: "Dururuz", ok: true }, { e: "🏃", t: "Koşarak geçeriz" }, { e: "🕺", t: "Dans ederiz" }] }
  ];
  let causeQueue = [];

  // ---------- veri: kaç tane? ----------
  const COUNT_THEMES = [
    [ { e: "🚁", n: "helikopter" }, { e: "🚗", n: "araba" }, { e: "🚂", n: "tren" }, { e: "⛵", n: "yelkenli" }, { e: "🚲", n: "bisiklet" } ],
    [ { e: "🐦", n: "kuş" }, { e: "🐟", n: "balık" }, { e: "🐰", n: "tavşan" }, { e: "🐢", n: "kaplumbağa" }, { e: "🦋", n: "kelebek" } ],
    [ { e: "🍎", n: "elma" }, { e: "🍌", n: "muz" }, { e: "🍓", n: "çilek" }, { e: "🥕", n: "havuç" }, { e: "🍇", n: "üzüm" } ]
  ];
  const NUM_TR = ["Bir", "İki", "Üç", "Dört", "Beş", "Altı", "Yedi", "Sekiz", "Dokuz", "On"];

  const completed = {}; // oyun anahtarı → bitirme sayısı

  let stars = 0;
  const starsEl = document.getElementById("stars");
  function addStar() { stars++; starsEl.textContent = stars; }

  const menuEl = document.getElementById("menu"),
        sortEl = document.getElementById("sort"),
        quizEl = document.getElementById("quiz"),
        pickEl = document.getElementById("pick"),
        countEl = document.getElementById("count");

  function showScreen(el) {
    [menuEl, sortEl, quizEl, pickEl, countEl].forEach(function (s) { s.hidden = s !== el; });
  }
  function trophies(key) {
    return completed[key] ? "🏆".repeat(Math.min(completed[key], 3)) : "";
  }
  function menuCard(emo, nm, ds, key, onTap) {
    const b = document.createElement("button");
    b.className = "lvl";
    b.innerHTML = '<span class="emo">' + emo + '</span><div class="nm">' + nm + '</div>' +
                  '<div class="ds">' + ds + '</div><div class="done">' + trophies(key) + "</div>";
    b.onclick = onTap;
    menuEl.appendChild(b);
  }

  // ---------- menüler ----------
  function renderMenu() {
    showScreen(menuEl);
    menuEl.innerHTML = "";
    menuCard("♻️", "Geri Dönüşüm", "çöpü doğru kutuya at", "geri", function () {
      startSort({ key: "geri", bins: RECYCLE_BINS, items: RECYCLE_ITEMS,
                  intro: "Geri dönüşüm oyunu! Çöpleri doğru kutuya sürükle!" });
    });
    menuCard("🇬🇧", "İngilizce", "dinle ve bul", "en", renderEnglishMenu);
    menuCard("🥦", "Sağlıklı mı?", "😊 veya 😟 seç", "saglik", function () {
      startSort({ key: "saglik", bins: HEALTH_BINS, items: HEALTH_ITEMS,
                  intro: "Sağlıklı yiyecekleri gülen yüze, sağlıksızları üzgün yüze at!" });
    });
    menuCard("🌑", "Gölge Bulmaca", "doğru gölgeyi bul", "golge", function () {
      startPick({ key: "golge", total: 8, render: renderShadowQ,
                  intro: "Gölge bulmaca! Resmin gölgesini bul!" });
    });
    menuCard("🔗", "Sebep-Sonuç", "ne olur? düşün, seç", "sebep", function () {
      causeQueue = shuffle(CAUSE_QS);
      startPick({ key: "sebep", total: 8, render: renderCauseQ,
                  intro: "Sebep sonuç oyunu! İyi dinle, düşün, doğru cevabı seç!" });
    });
    menuCard("🔍", "Kaç Tane?", "bul, dokun, say", "kac", startCount);
    menuCard("🧠", "Hafıza", "bak, aklında tut", "hafiza", function () {
      startPick({ key: "hafiza", total: 6, render: renderMemoryQ,
                  intro: "Hafıza oyunu! Şekillere dikkatle bak, aklında tut!" });
    });
  }

  function renderEnglishMenu() {
    A.fx.pop();
    menuEl.innerHTML = "";
    Object.keys(QUIZ_SETS).forEach(function (k) {
      const s = QUIZ_SETS[k];
      menuCard(s.e, s.nm, "dinle ve bul", "en-" + k, function () { startQuiz(k); });
    });
    const back = document.createElement("button");
    back.className = "candy back"; back.textContent = "⬅️ Oyunlar";
    back.style.flexBasis = "100%"; back.style.maxWidth = "220px";
    back.onclick = function () { A.fx.pop(); renderMenu(); };
    menuEl.appendChild(back);
  }

  // ---------- sürükle-bırak motoru ----------
  const sortProg = document.getElementById("sortProg"),
        itemEl = document.getElementById("dragItem"),
        binsEl = document.getElementById("bins");

  let sortGame = null, sortQueue = [], sortNo = 0, curItem = null, sortLock = false;

  function startSort(game) {
    sortGame = game;
    sortQueue = shuffle(game.items).slice(0, ROUND);
    sortNo = 0; curItem = null; sortLock = false;
    itemEl.hidden = true;
    showScreen(sortEl);
    binsEl.innerHTML = "";
    binsEl.className = "bins n" + game.bins.length;
    game.bins.forEach(function (b) {
      const el = document.createElement("button");
      el.className = "bin"; el.dataset.bin = b.id;
      el.style.setProperty("--c", b.c);
      el.innerHTML = '<span class="bemo">' + b.e + '</span><span class="bnm">' + b.nm + "</span>";
      el.onclick = function () { drop(b.id, el); };
      binsEl.appendChild(el);
    });
    sortProg.textContent = game.bins[0].nm === "SAĞLIKLI" ? "Yiyecek 0/" + sortQueue.length : "Çöp 0/" + sortQueue.length;
    A.fx.pop();
    A.say(game.intro);
    setTimeout(nextSortItem, 1800);
  }

  function speakItem(it) {
    if (it.en) { sayEN(it.en); }        // sağlıklı mı: İngilizce ismi öğret
    else { A.say(it.n); }               // geri dönüşüm: Türkçe adı
  }

  function nextSortItem() {
    if (sortGame === null || sortEl.hidden) return;
    if (sortNo >= sortQueue.length) { finishSort(); return; }
    curItem = sortQueue[sortNo];
    sortNo++;
    sortLock = false;
    sortProg.textContent = (sortGame.key === "saglik" ? "Yiyecek " : "Çöp ") + sortNo + "/" + sortQueue.length;
    itemEl.innerHTML = '<span class="iemo">' + curItem.e + '</span><span class="inm">' + curItem.n + "</span>" +
                       (curItem.en ? '<span class="ien">' + curItem.en + "</span>" : "");
    itemEl.hidden = false;
    itemEl.style.transform = "";
    itemEl.classList.remove("gone");
    itemEl.classList.remove("pop-in"); void itemEl.offsetWidth; itemEl.classList.add("pop-in");
    speakItem(curItem);
  }

  function drop(binId, binEl) {
    if (sortLock || !curItem) return;
    if (binId === curItem.bin) {
      sortLock = true;
      addStar();
      A.fx.ding();
      binEl.classList.add("yum");
      setTimeout(function () { binEl.classList.remove("yum"); }, 500);
      itemEl.classList.add("gone");
      U.bigFeedback(["🎉", "⭐", "🌟", "💚", "🏆"][sortNo % 5]);
      A.say(praiseTR());
      if (sortNo % 5 === 0) U.confetti(12, ["⭐", "🎉", "✨"]);
      setTimeout(nextSortItem, 1000);
    } else {
      A.fx.buzz();
      binEl.classList.add("shake");
      setTimeout(function () { binEl.classList.remove("shake"); }, 450);
      A.say("Bir daha dene!");
    }
  }

  function finishSort() {
    completed[sortGame.key] = (completed[sortGame.key] || 0) + 1;
    U.confetti(30, ["🎉", "🏆", "⭐", "🎈", "💚", "✨"]);
    A.fx.ding();
    A.say("Bravo! Hepsini bitirdin! Süpersin!");
    itemEl.innerHTML = '<span class="iemo">🏆</span><span class="inm">Hepsi tamam! Süpersin!</span>';
    itemEl.hidden = false;
    itemEl.style.transform = "";
    itemEl.classList.remove("gone");
    sortProg.textContent = "⭐ " + sortQueue.length + " tanesi bitti!";
    sortGame = null;
    setTimeout(renderMenu, 2600);
  }

  // sürükleme: pointer olayları + kutu üstüne bırakınca drop
  let dragOn = false, sx = 0, sy = 0, moved = false;
  function binAt(x, y) {
    const kids = binsEl.children;
    for (let i = 0; i < kids.length; i++) {
      const r = kids[i].getBoundingClientRect();
      if (x >= r.left - 8 && x <= r.right + 8 && y >= r.top - 14 && y <= r.bottom + 8) return kids[i];
    }
    return null;
  }
  function hoverBin(el) {
    const kids = binsEl.children;
    for (let i = 0; i < kids.length; i++) kids[i].classList.toggle("hot", kids[i] === el);
  }
  itemEl.addEventListener("pointerdown", function (e) {
    if (sortLock || !curItem) return;
    dragOn = true; moved = false; sx = e.clientX; sy = e.clientY;
    itemEl.classList.add("drag");
    try { itemEl.setPointerCapture(e.pointerId); } catch (err) {}
  });
  itemEl.addEventListener("pointermove", function (e) {
    if (!dragOn) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) + Math.abs(dy) > 8) moved = true;
    itemEl.style.transform = "translate(" + dx + "px," + dy + "px) scale(1.12)";
    hoverBin(binAt(e.clientX, e.clientY));
  });
  function endDrag(e) {
    if (!dragOn) return;
    dragOn = false;
    itemEl.classList.remove("drag");
    hoverBin(null);
    if (!moved) {                       // dokunma: ismi tekrar söyle
      itemEl.style.transform = "";
      if (curItem) speakItem(curItem);
      return;
    }
    const hit = binAt(e.clientX, e.clientY);
    if (hit) drop(hit.dataset.bin, hit);
    if (!sortLock) itemEl.style.transform = "";   // yanlışsa / boşa bırakınca geri dön
  }
  itemEl.addEventListener("pointerup", endDrag);
  itemEl.addEventListener("pointercancel", endDrag);

  document.getElementById("sortBack").onclick = function () {
    A.fx.pop(); A.shutUp(); sortGame = null; renderMenu();
  };

  // ---------- ingilizce dinle-bul motoru ----------
  const quizProg = document.getElementById("quizProg"),
        qText = document.getElementById("qText"),
        optsEl = document.getElementById("opts"),
        speakBtn = document.getElementById("speakBtn");

  let quizKey = null, quizQueue = [], quizNo = 0, quizCur = null, quizLock = false;

  function startQuiz(key) {
    quizKey = key;
    quizQueue = shuffle(QUIZ_SETS[key].words).slice(0, ROUND);
    quizNo = 0;
    showScreen(quizEl);
    qText.textContent = ""; optsEl.innerHTML = "";
    quizProg.textContent = QUIZ_SETS[key].nm;
    A.fx.pop();
    A.say(QUIZ_SETS[key].nm + " oyunu! Dinle ve doğru resmi bul!");
    setTimeout(nextQuizQ, 2000);
  }

  function nextQuizQ() {
    if (quizKey === null || quizEl.hidden) return;
    if (quizNo >= quizQueue.length) { finishQuiz(); return; }
    quizCur = quizQueue[quizNo];
    quizNo++;
    quizLock = false;
    quizProg.textContent = "Soru " + quizNo + "/" + quizQueue.length;
    qText.innerHTML = 'Hangisi: <b>' + quizCur.en.toUpperCase() + "</b>?";
    const others = shuffle(QUIZ_SETS[quizKey].words.filter(function (w) { return w.en !== quizCur.en; })).slice(0, 2);
    optsEl.innerHTML = "";
    shuffle([quizCur].concat(others)).forEach(function (w) {
      const b = document.createElement("button");
      b.className = "opt";
      b.innerHTML = '<span class="oemo">' + w.e + '</span><span class="oen">' + w.en + "</span>";
      b.onclick = function () { quizAnswer(b, w); };
      optsEl.appendChild(b);
    });
    sayEN(quizCur.en);
  }

  function quizAnswer(btn, w) {
    if (quizLock) return;
    if (w.en === quizCur.en) {
      quizLock = true;
      addStar();
      A.fx.ding();
      btn.classList.add("win");
      U.bigFeedback(["🎉", "⭐", "🌟", "💚", "🏆"][quizNo % 5]);
      sayEN(quizCur.en + "!");
      setTimeout(function () { A.say(praiseTR()); }, 1100);
      if (quizNo % 5 === 0) U.confetti(12, ["⭐", "🎉", "✨"]);
      setTimeout(nextQuizQ, 1500);
    } else {
      A.fx.buzz();
      btn.classList.add("shake");
      setTimeout(function () { btn.classList.remove("shake"); }, 450);
      sayEN(w.en);                       // yanlışa dokununca onun adını da öğren
      setTimeout(function () { A.say("Bir daha dene!"); }, 900);
    }
  }

  function finishQuiz() {
    completed["en-" + quizKey] = (completed["en-" + quizKey] || 0) + 1;
    U.confetti(30, ["🎉", "🏆", "⭐", "🎈", "💚", "✨"]);
    A.fx.ding();
    qText.innerHTML = "🏆 Hepsi tamam! Süpersin!";
    optsEl.innerHTML = "";
    quizProg.textContent = "⭐ " + quizQueue.length + " soru bitti!";
    A.say("Bravo! Hepsini bildin! İngilizcen harika!");
    quizKey = null;
    setTimeout(renderMenu, 2600);
  }

  speakBtn.onclick = function () { if (quizCur) sayEN(quizCur.en); };
  document.getElementById("quizBack").onclick = function () {
    A.fx.pop(); A.shutUp(); quizKey = null; renderMenu();
  };

  // ---------- seçmeli oyun motoru: gölge bulmaca + görsel hafıza ----------
  const pickProg = document.getElementById("pickProg"),
        pickGrid = document.getElementById("pickGrid"),
        pickQ = document.getElementById("pickQ"),
        pickOpts = document.getElementById("pickOpts");

  let pickGame = null, pickNo = 0, pickToken = 0, pickLock = false, memTimer = null;

  function startPick(game) {
    pickGame = game; pickNo = 0; pickLock = false;
    showScreen(pickEl);
    pickGrid.hidden = true;
    pickQ.innerHTML = ""; pickOpts.innerHTML = "";
    pickProg.textContent = "";
    A.fx.pop();
    A.say(game.intro);
    schedulePick(2000);
  }
  function schedulePick(ms) {
    const tok = ++pickToken;
    setTimeout(function () {
      if (pickGame && !pickEl.hidden && tok === pickToken) nextPick();
    }, ms);
  }
  function nextPick() {
    if (pickNo >= pickGame.total) { finishPick(); return; }
    pickNo++; pickLock = false;
    pickProg.textContent = "Soru " + pickNo + "/" + pickGame.total;
    pickGame.render();
  }
  function renderPickOpts(list) {
    pickOpts.innerHTML = "";
    list.forEach(function (o) {
      const b = document.createElement("button");
      b.className = "opt";
      b.innerHTML = o.html;
      b.onclick = function () { pickAnswer(b, o.ok, o.after); };
      pickOpts.appendChild(b);
    });
  }
  function pickAnswer(btn, ok, after) {
    if (pickLock) return;
    if (ok) {
      pickLock = true;
      addStar();
      A.fx.ding();
      btn.classList.add("win");
      U.bigFeedback(["🎉", "⭐", "🌟", "💚", "🏆"][pickNo % 5]);
      if (after) after(btn);
      if (pickNo % 5 === 0) U.confetti(12, ["⭐", "🎉", "✨"]);
      schedulePick(1500);
    } else {
      A.fx.buzz();
      btn.classList.add("shake");
      setTimeout(function () { btn.classList.remove("shake"); }, 450);
      A.say("Bir daha dene!");
    }
  }
  function finishPick() {
    completed[pickGame.key] = (completed[pickGame.key] || 0) + 1;
    U.confetti(30, ["🎉", "🏆", "⭐", "🎈", "💚", "✨"]);
    A.fx.ding();
    A.say("Bravo! Hepsini bildin! Süpersin!");
    pickQ.innerHTML = "🏆 Hepsi tamam! Süpersin!";
    pickOpts.innerHTML = "";
    pickGrid.hidden = true;
    pickGame = null;
    setTimeout(renderMenu, 2600);
  }
  document.getElementById("pickBack").onclick = function () {
    A.fx.pop(); A.shutUp();
    pickToken++; clearInterval(memTimer);
    pickGame = null; renderMenu();
  };

  // sebep-sonuç sorusu: durum + 3 seçenek, doğrusunda açıklama
  function renderCauseQ() {
    const item = causeQueue[(pickNo - 1) % causeQueue.length];
    pickGrid.hidden = true;
    pickQ.innerHTML = '<span class="qemo">' + item.qe + "</span>" + item.q;
    A.say(item.q);
    renderPickOpts(shuffle(item.opts).map(function (o) {
      return {
        html: '<span class="oemo">' + o.e + '</span><span class="oen ocause">' + o.t + "</span>",
        ok: !!o.ok,
        after: function () { A.say(item.why + " " + praiseTR()); }
      };
    }));
  }

  // gölge bulmaca sorusu: renkli resim + 3 siyah gölge
  function renderShadowQ() {
    const group = SHADOW_GROUPS[ri(0, SHADOW_GROUPS.length - 1)];
    const three = shuffle(group).slice(0, 3), target = three[0];
    pickGrid.hidden = true;
    pickQ.innerHTML = '<span class="qemo">' + target.e + "</span>Bunun gölgesi hangisi?";
    A.say(target.n + "! Gölgesini bul!");
    renderPickOpts(shuffle(three).map(function (w) {
      return {
        html: '<span class="oemo shadow">' + w.e + "</span>",
        ok: w.e === target.e,
        after: function (btn) {
          btn.querySelector(".oemo").classList.remove("shadow"); // gölge renklenir!
          A.say(target.n + "! " + praiseTR());
        }
      };
    }));
  }

  // görsel hafıza sorusu: 3×3 tabloyu ezberle, kapat, sor
  function renderMemoryQ() {
    const palette = shuffle(MEM_SHAPES).slice(0, 4);
    const cells = [];
    for (let i = 0; i < 9; i++) cells.push(palette[ri(0, palette.length - 1)]);
    pickGrid.hidden = false;
    pickGrid.innerHTML = cells.map(function (c) { return '<div class="mcell">' + c.e + "</div>"; }).join("");
    pickOpts.innerHTML = "";
    let left = 5;
    pickQ.innerHTML = "🧠 Dikkatle bak! ⏳ " + left;
    A.say("Dikkatle bak, aklında tut!");
    clearInterval(memTimer);
    memTimer = setInterval(function () {
      if (!pickGame || pickEl.hidden) { clearInterval(memTimer); return; }
      left--;
      if (left > 0) { pickQ.innerHTML = "🧠 Dikkatle bak! ⏳ " + left; return; }
      clearInterval(memTimer);
      Array.prototype.forEach.call(pickGrid.children, function (c) { c.textContent = "❓"; });
      askMemory(cells, palette);
    }, 1000);
  }

  function revealMemory(cells) {
    Array.prototype.forEach.call(pickGrid.children, function (c, i) { c.textContent = cells[i].e; });
  }

  function askMemory(cells, palette) {
    if (Math.random() < 0.5) {
      // konum sorusu
      const POS = [[4, "Tam ortadaki"], [0, "Sol üstteki"], [2, "Sağ üstteki"], [6, "Sol alttaki"], [8, "Sağ alttaki"]];
      const p = POS[ri(0, POS.length - 1)], answer = cells[p[0]];
      pickQ.textContent = p[1] + " şekil neydi?";
      A.say(p[1] + " şekil neydi?");
      const opts = [answer].concat(shuffle(palette.filter(function (s) { return s.e !== answer.e; })).slice(0, 2));
      renderPickOpts(shuffle(opts).map(function (o) {
        return {
          html: '<span class="oemo">' + o.e + "</span>",
          ok: o.e === answer.e,
          after: function () { revealMemory(cells); A.say(answer.n + "! " + praiseTR()); }
        };
      }));
    } else {
      // sayma sorusu (tabloda gerçekten olan bir şekil sorulur)
      const present = palette.filter(function (s) { return cells.some(function (c) { return c.e === s.e; }); });
      const s = present[ri(0, present.length - 1)];
      const n = cells.filter(function (c) { return c.e === s.e; }).length;
      pickQ.innerHTML = 'Kaç tane <span class="qemo-sm">' + s.e + "</span> vardı?";
      A.say("Kaç tane " + s.n + " vardı?");
      const nums = [n];
      while (nums.length < 3) {
        const d = Math.max(1, n + ri(-2, 2));
        if (nums.indexOf(d) === -1) nums.push(d);
      }
      renderPickOpts(shuffle(nums).map(function (v) {
        return {
          html: '<span class="oen">' + v + "</span>",
          ok: v === n,
          after: function () { revealMemory(cells); A.say(NUM_TR[n - 1] + " tane! " + praiseTR()); }
        };
      }));
    }
  }

  // ---------- kaç tane? motoru: bul, dokun, say ----------
  const countProg = document.getElementById("countProg"),
        countQEl = document.getElementById("countQ"),
        fieldEl = document.getElementById("countField"),
        numsEl = document.getElementById("countNums");
  const COUNT_ROUND = 6;

  let countOn = false, countNo = 0, countTarget = null, countNeed = 0, countFound = 0, countLock = false;

  function startCount() {
    countOn = true; countNo = 0;
    showScreen(countEl);
    fieldEl.innerHTML = ""; numsEl.innerHTML = ""; countQEl.textContent = ""; countProg.textContent = "";
    A.fx.pop();
    A.say("Dikkatli bak! Sorduklarımı bul, dokun ve say!");
    setTimeout(function () { if (countOn && !countEl.hidden) nextCountQ(); }, 2200);
  }

  function nextCountQ() {
    if (countNo >= COUNT_ROUND) { finishCount(); return; }
    countNo++; countLock = false; countFound = 0;
    countProg.textContent = "Soru " + countNo + "/" + COUNT_ROUND;
    numsEl.innerHTML = "";
    const theme = shuffle(COUNT_THEMES[ri(0, COUNT_THEMES.length - 1)]).slice(0, 3);
    countTarget = theme[0];
    countNeed = ri(3, 5);
    const items = [];
    for (let i = 0; i < countNeed; i++) items.push(theme[0]);
    for (let i = ri(2, 4); i > 0; i--) items.push(theme[1]);
    for (let i = ri(2, 4); i > 0; i--) items.push(theme[2]);
    // 15 yuva: 3 satır × 5 sütun + hafif dağınıklık
    const slots = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++)
      slots.push([10 + c * 20 + ri(-4, 4), 16 + r * 33 + ri(-6, 6)]);
    const order = shuffle(slots);
    fieldEl.innerHTML = "";
    shuffle(items).forEach(function (it, i) {
      const b = document.createElement("button");
      b.className = "citem";
      b.style.left = order[i][0] + "%";
      b.style.top = order[i][1] + "%";
      b.innerHTML = '<span class="ce">' + it.e + "</span>";
      b.onclick = function () { tapCountItem(b, it); };
      fieldEl.appendChild(b);
    });
    countQEl.innerHTML = 'Kaç tane <span class="qemo-sm">' + countTarget.e + "</span> var? Dokun ve say!";
    A.say("Kaç tane " + countTarget.n + " var? Hepsine dokun!");
  }

  function tapCountItem(b, it) {
    if (countLock || b.classList.contains("found")) return;
    if (it.e === countTarget.e) {
      b.classList.add("found");
      countFound++;
      A.fx.pop();
      A.say(NUM_TR[Math.min(countFound, 10) - 1] + "!");
      if (countFound === countNeed) setTimeout(showCountNums, 800);
    } else {
      A.fx.buzz();
      b.classList.add("shake");
      setTimeout(function () { b.classList.remove("shake"); }, 450);
    }
  }

  function showCountNums() {
    if (!countOn || countEl.hidden) return;
    A.say("Kaç tane saydın? Sayıya dokun!");
    const nums = [countNeed];
    while (nums.length < 3) {
      const d = Math.max(1, countNeed + ri(-2, 2));
      if (nums.indexOf(d) === -1) nums.push(d);
    }
    numsEl.innerHTML = "";
    shuffle(nums).forEach(function (v) {
      const b = document.createElement("button");
      b.className = "candy cnum"; b.textContent = v;
      b.onclick = function () { countNumAnswer(b, v); };
      numsEl.appendChild(b);
    });
  }

  function countNumAnswer(b, v) {
    if (countLock) return;
    if (v === countNeed) {
      countLock = true;
      addStar();
      A.fx.ding();
      U.bigFeedback(["🎉", "⭐", "🌟", "💚", "🏆"][countNo % 5]);
      A.say(NUM_TR[countNeed - 1] + " " + countTarget.n + "! " + praiseTR());
      if (countNo % 3 === 0) U.confetti(12, ["⭐", "🎉", "✨"]);
      setTimeout(function () { if (countOn && !countEl.hidden) nextCountQ(); }, 1600);
    } else {
      A.fx.buzz();
      b.classList.add("shake");
      setTimeout(function () { b.classList.remove("shake"); }, 450);
      A.say("Bir daha say bakalım!");
    }
  }

  function finishCount() {
    completed["kac"] = (completed["kac"] || 0) + 1;
    U.confetti(30, ["🎉", "🏆", "⭐", "🎈", "💚", "✨"]);
    A.fx.ding();
    A.say("Bravo! Hepsini saydın! Süpersin!");
    countQEl.innerHTML = "🏆 Hepsi tamam! Süpersin!";
    fieldEl.innerHTML = ""; numsEl.innerHTML = "";
    countProg.textContent = "⭐ " + COUNT_ROUND + " soru bitti!";
    countOn = false;
    setTimeout(renderMenu, 2600);
  }

  document.getElementById("countBack").onclick = function () {
    A.fx.pop(); A.shutUp(); countOn = false; renderMenu();
  };

  U.addHomeButton();
  renderMenu();
})();
