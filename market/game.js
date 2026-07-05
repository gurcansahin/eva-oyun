/* Eva Market — oyun mantığı */
(function () {
  "use strict";
  const A = window.EvaAudio, U = window.EvaUI;

  const CATEGORIES = [
    { id: "sebze",    n: "🍎 Meyve & Sebze" },
    { id: "kahvalti", n: "🥛 Süt & Kahvaltı" },
    { id: "kasap",    n: "🥩 Kasap" },
    { id: "atistir",  n: "🍭 Atıştırmalık" },
    { id: "oyuncak",  n: "🧸 Oyuncak" }
  ];

  const PRODUCTS = [
    { e: "🍎", n: "Elma", p: 5, c: "sebze" },
    { e: "🍌", n: "Muz", p: 12, c: "sebze" },
    { e: "🍅", n: "Domates", p: 9, c: "sebze" },
    { e: "🥕", n: "Havuç", p: 7, c: "sebze" },
    { e: "🥬", n: "Ispanak", p: 11, c: "sebze" },
    { e: "🍆", n: "Patlıcan", p: 13, c: "sebze" },
    { e: "🥒", n: "Salatalık", p: 6, c: "sebze" },
    { e: "🥦", n: "Brokoli", p: 14, c: "sebze" },
    { e: "💮", n: "Karnabahar", p: 12, c: "sebze" },
    { e: "🌿", n: "Semizotu", p: 8, c: "sebze" },
    { e: "🌱", n: "Maydanoz", p: 4, c: "sebze" },
    { e: "🧅", n: "Soğan", p: 5, c: "sebze" },
    { e: "🧄", n: "Sarımsak", p: 6, c: "sebze" },
    { e: "🥛", n: "Süt", p: 20, c: "kahvalti" },
    { e: "🧀", n: "Peynir", p: 45, c: "kahvalti" },
    { e: "🧈", n: "Beyaz Peynir", p: 40, c: "kahvalti" },
    { e: "🥚", n: "Yumurta", p: 30, c: "kahvalti" },
    { e: "🍞", n: "Ekmek", p: 8, c: "kahvalti" },
    { e: "🥩", n: "Et", p: 90, c: "kasap" },
    { e: "🍗", n: "Tavuk", p: 60, c: "kasap" },
    { e: "🐟", n: "Balık", p: 70, c: "kasap" },
    { e: "🍫", n: "Çikolata", p: 15, c: "atistir" },
    { e: "🧃", n: "Meyve Suyu", p: 10, c: "atistir" },
    { e: "🍦", n: "Dondurma", p: 25, c: "atistir" },
    { e: "🍪", n: "Kraker", p: 18, c: "atistir" },
    { e: "🦄", n: "Unicorn Oyuncak", p: 120, c: "oyuncak" },
    { e: "🧲", n: "Mıknatıs Oyuncak", p: 80, c: "oyuncak" },
    { e: "👱‍♀️", n: "Barbie Bebek", p: 150, c: "oyuncak" }
  ];

  let curIdx = 0, total = 0;
  let cart = [];

  function cartEntry(i) {
    for (let k = 0; k < cart.length; k++) if (cart[k].idx === i) return cart[k];
    return null;
  }
  function qtyOf(i) { const e = cartEntry(i); return e ? e.qty : 0; }

  const shelf = document.getElementById("shelf");
  const itemBtns = [];
  CATEGORIES.forEach(function (cat) {
    const h = document.createElement("div");
    h.className = "cat"; h.textContent = cat.n;
    shelf.appendChild(h);
    PRODUCTS.forEach(function (p, i) {
      if (p.c !== cat.id) return;
      const b = document.createElement("button");
      b.className = "item"; b.title = p.n;
      b.innerHTML = p.e + '<span class="inm">' + p.n + '</span><span class="qty" hidden></span>';
      b.onclick = function () { pick(i); };
      shelf.appendChild(b);
      itemBtns[i] = b;
    });
  });

  function refreshShelf() {
    itemBtns.forEach(function (b, i) {
      if (!b) return;
      b.classList.toggle("cur", i === curIdx);
      const q = qtyOf(i), qEl = b.querySelector(".qty");
      qEl.hidden = q === 0;
      qEl.textContent = q;
    });
  }

  const prodEl = document.getElementById("product"),
        nameEl = document.getElementById("productName"),
        priceEl = document.getElementById("productPrice"),
        qtyEl = document.getElementById("productQty");

  function showProduct(pop) {
    const p = PRODUCTS[curIdx];
    prodEl.textContent = p.e; nameEl.textContent = p.n; priceEl.textContent = p.p + " ₺";
    const q = qtyOf(curIdx);
    qtyEl.textContent = q > 0 ? "× " + q : "";
    if (pop) { prodEl.classList.remove("pop"); void prodEl.offsetWidth; prodEl.classList.add("pop"); }
    refreshShelf();
  }

  function pick(i) {
    if (i !== curIdx) {
      curIdx = i;
      showProduct(true);
      A.say(PRODUCTS[i].n);
    }
    scan();
  }

  function scan() {
    const p = PRODUCTS[curIdx];
    A.fx.scanBeep(curIdx);
    const beam = document.getElementById("beam");
    beam.classList.remove("on"); void beam.offsetWidth; beam.classList.add("on");

    let e = cartEntry(curIdx);
    if (!e) { e = { idx: curIdx, qty: 0 }; cart.push(e); }
    e.qty++; total += p.p;

    document.getElementById("total").textContent = total + " ₺";
    qtyEl.textContent = "× " + e.qty;
    qtyEl.classList.remove("pop"); void qtyEl.offsetWidth; qtyEl.classList.add("pop");

    renderLines();
    refreshShelf();
    clearStamp();
  }

  function renderLines() {
    const box = document.getElementById("lines");
    if (cart.length === 0) { box.innerHTML = '<div class="empty">Sepet boş...<br>ürün oku!</div>'; return; }
    box.innerHTML = "";
    cart.forEach(function (it) {
      const p = PRODUCTS[it.idx];
      const d = document.createElement("div"); d.className = "rline";
      d.innerHTML =
        '<span><span class="em">' + p.e + "</span> " + p.n +
        ' <span class="q">× ' + it.qty + "</span></span><span>" + (p.p * it.qty) + " ₺</span>";
      box.appendChild(d);
    });
    const t = document.createElement("div"); t.className = "rtotal";
    t.innerHTML = "<span>TOPLAM</span><span>" + total + " ₺</span>";
    box.appendChild(t);
    document.getElementById("receipt").scrollTop = 1e6;
  }

  function clearStamp() {
    document.getElementById("stamp").classList.remove("show");
    document.getElementById("okMsg").classList.remove("show");
  }

  document.getElementById("scanBtn").onclick = scan;

  document.getElementById("printBtn").onclick = function () {
    if (cart.length === 0) { A.fx.buzz(); return; }
    A.fx.printer();
    document.getElementById("receipt").animate(
      [{ transform: "translateY(-6px)" }, { transform: "translateY(0)" }],
      { duration: 400, easing: "ease-out" }
    );
    U.confetti(14, ["🎉", "⭐", "🍬", "🎈", "💛"]);
  };

  document.getElementById("cardBtn").onclick = function () {
    if (cart.length === 0) { A.fx.buzz(); return; }
    const ov = document.getElementById("cardAnim"),
          cc = document.getElementById("ccard"),
          ok = document.getElementById("okMsg");
    ov.classList.add("on"); cc.classList.remove("swipe"); ok.classList.remove("show");
    void cc.offsetWidth; cc.classList.add("swipe");
    A.fx.cardSwipe();
    setTimeout(function () { ok.classList.add("show"); }, 700);
    setTimeout(function () {
      ov.classList.remove("on");
      document.getElementById("stamp").classList.add("show");
      U.confetti(24, ["🎉", "⭐", "🍬", "🎈", "💛", "✨"]);
    }, 1500);
  };

  document.getElementById("resetBtn").onclick = function () {
    cart = []; total = 0; curIdx = 0;
    document.getElementById("total").textContent = "0 ₺";
    renderLines(); clearStamp(); showProduct(true);
    A.fx.pop();
  };

  window.addEventListener("keydown", function (e) {
    if (e.code === "Space" || e.key === " ") { e.preventDefault(); scan(); }
  });

  U.addHomeButton();
  showProduct(false);
})();
