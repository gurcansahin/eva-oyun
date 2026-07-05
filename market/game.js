/* Eva Market — oyun mantığı */
(function () {
  "use strict";
  const A = window.EvaAudio, U = window.EvaUI;

  const PRODUCTS = [
    { e: "🍎", n: "Elma", p: 5 },      { e: "🥛", n: "Süt", p: 20 },       { e: "🍞", n: "Ekmek", p: 8 },
    { e: "🧀", n: "Peynir", p: 45 },   { e: "🍌", n: "Muz", p: 12 },       { e: "🥚", n: "Yumurta", p: 30 },
    { e: "🍫", n: "Çikolata", p: 15 }, { e: "🧃", n: "Meyve Suyu", p: 10 },{ e: "🍦", n: "Dondurma", p: 25 },
    { e: "🍪", n: "Kraker", p: 18 },   { e: "🍅", n: "Domates", p: 9 },    { e: "🥕", n: "Havuç", p: 7 }
  ];

  let curIdx = 0, total = 0, cart = [];

  const shelf = document.getElementById("shelf");
  PRODUCTS.forEach(function (p, i) {
    const b = document.createElement("button");
    b.className = "item"; b.title = p.n;
    b.innerHTML = p.e + '<span class="inm">' + p.n + "</span>";
    b.onclick = function () { curIdx = i; showProduct(true); scan(); };
    shelf.appendChild(b);
  });
  function refreshShelf() {
    Array.prototype.forEach.call(shelf.children, function (c, i) { c.classList.toggle("cur", i === curIdx); });
  }

  const prodEl = document.getElementById("product"),
        nameEl = document.getElementById("productName"),
        priceEl = document.getElementById("productPrice");

  function showProduct(pop) {
    const p = PRODUCTS[curIdx];
    prodEl.textContent = p.e; nameEl.textContent = p.n; priceEl.textContent = p.p + " ₺";
    if (pop) { prodEl.classList.remove("pop"); void prodEl.offsetWidth; prodEl.classList.add("pop"); }
    refreshShelf();
  }

  function scan() {
    const p = PRODUCTS[curIdx];
    A.fx.scanBeep(curIdx);
    const beam = document.getElementById("beam");
    beam.classList.remove("on"); void beam.offsetWidth; beam.classList.add("on");

    cart.push(p); total += p.p;
    document.getElementById("total").textContent = total + " ₺";
    renderLines();
    clearStamp();

    setTimeout(function () { curIdx = (curIdx + 1) % PRODUCTS.length; showProduct(true); }, 260);
  }

  function renderLines() {
    const box = document.getElementById("lines");
    if (cart.length === 0) { box.innerHTML = '<div class="empty">Sepet boş...<br>ürün oku!</div>'; return; }
    box.innerHTML = "";
    cart.forEach(function (it) {
      const d = document.createElement("div"); d.className = "rline";
      d.innerHTML = '<span><span class="em">' + it.e + "</span> " + it.n + "</span><span>" + it.p + " ₺</span>";
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
