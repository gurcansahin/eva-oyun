# Eva'nın Oyunları 🎈

Duru Eva için eğitici mini oyun koleksiyonu. Statik PWA — sunucu, veritabanı, framework yok. Tamamen offline çalışır.

## Oyunlar

| Oyun | Klasör | Ne öğretir |
|---|---|---|
| 🛒 Eva Market | `market/` | Kasa/alışveriş rol oyunu: ürün okutma (SPACE veya dokunma), adetli sepet, fiş, kart ödeme, sayılar |
| 🐾 Hayvan Dedektifi | `hayvan/` | Gerçek hayvan sesleri + özellik bilmecesi (suda yaşar / uçar / yumurtlar / en hızlı / uzun boyun) |
| 🎹 Eva Piyano | `muzik/` | Cezasız piano tiles: düşen notalara dokun + serbest 8 tuşlu piyano (Web Audio do-re-mi) |
| 🔢 Sayı Ustası | `matematik/` | Rakam tanıma/sayma + toplama, çıkarma, çarpma, bölme — kademeli seviye, sesli soru ve övgü |
| 🎡 Eva Akademi | `akademi/` | Etkinlik kitabından 7 mini oyun: ♻️ geri dönüşüm (sürükle-bırak, resmi Sıfır Atık renkleri), 🇬🇧 İngilizce dinle-bul (en-US sesli: zıt anlamlılar/aile/yiyecekler), 🥦 sağlıklı-sağlıksız ayırma, 🔗 sebep-sonuç (durum + 3 seçenek, doğruda sesli açıklama), 🌑 gölge bulmaca (emoji silüeti), 🔍 kaç tane? (görsel dikkat + sayma), 🧠 görsel hafıza (3×3 tablo ezberle-yanıtla) |
| 🤗 Yakala Yakala | `yakala/` | Kovalamaca — yakalanmak zaferdir: "Beni Yakala" (parmakla kaçır, 🐶/🧸/👨 kovalar, yakalanınca gıdıklama şöleni) + "Ben Yakalarım" (Eva parmaktan kaçar, yorulunca yavaşlar, dokununca yakalanır) |

## Proje yapısı

```
eva-oyunlar/
├── index.html              # Hub: oyun seçim menüsü
├── manifest.webmanifest    # PWA manifest (tam ekran, ana ekran ikonu)
├── sw.js                   # Service worker: her şeyi önbelleğe alır → offline
├── icons/                  # PWA ikonları (192/512)
├── assets/
│   ├── css/common.css      # Ortak tasarım: renk değişkenleri, butonlar, konfeti
│   ├── js/audio.js         # Ortak ses motoru (EvaAudio): kayıt çalar + Web Audio sentez + TR konuşma
│   ├── js/ui.js            # Ortak UI (EvaUI): konfeti, büyük emoji geri bildirim, ana menü butonu
│   └── sounds/*.mp3        # 13 gerçek hayvan kaydı (mono, ~3sn, loudnorm ile normalize)
├── temizle.html            # Acil durum: SW + önbelleği sıfırlar, ana sayfaya döner
├── market/                 # index.html + style.css + game.js
├── hayvan/                 # index.html + style.css + game.js
├── muzik/                  # index.html + style.css + game.js
├── matematik/              # index.html + style.css + game.js
├── akademi/                # index.html + style.css + game.js
└── yakala/                 # index.html + style.css + game.js
```

## Mimari kurallar

- **Ses**: Tüm oyunlar `EvaAudio` kullanır. Gerçek kayıt → `EvaAudio.playFile("kedi")`. Efekt/sentez → `EvaAudio.fx.*`. Konuşma → `EvaAudio.say("...")` (emoji'leri otomatik temizler, `tr-TR`).
- **UI**: Konfeti/geri bildirim → `EvaUI`. Her oyun sol üstte 🏠 ana menü butonu alır (`EvaUI.addHomeButton()`).
- **Yeni oyun eklemek**: klasör aç → `index.html + style.css + game.js` → `assets/js/audio.js` ve `ui.js`'i içe aktar → hub'a kart ekle → `sw.js`'te `ASSETS` listesine dosyaları ekle ve `VERSION`'ı artır.
- **Ses eklemek**: mp3'ü `assets/sounds/`e koy (öneri: `ffmpeg -i in -t 3 -ac 1 -ar 22050 -b:a 40k -af loudnorm out.mp3`), `sw.js` listesine ekle.
- `sw.js`'te **her deploy'da `VERSION` artırılmalı** — yoksa tabletler eski önbelleği kullanmaya devam eder.

## Çalıştırma

Yerel test (service worker `file://` ile çalışmaz, HTTP gerekir):
```bash
cd eva-oyunlar && python3 -m http.server 8080
# http://localhost:8080
```

## Deploy

**Cloudflare Pages** (önerilen — Fompor sitesiyle aynı yerde):
Dashboard → Workers & Pages → Create → Pages → Upload assets → klasörü sürükle. Build ayarı yok, framework preset "None".

**Vercel**:
```bash
cd eva-oyunlar && vercel --prod
```

## Tablete kurulum (Eva modu)

1. Deploy URL'sini tablette Safari/Chrome ile aç.
2. iPad: Paylaş → **Ana Ekrana Ekle**. Android: menü → **Uygulamayı yükle**.
3. Ana ekrandaki ikondan aç → tam ekran, tarayıcı çubuğu yok, internet gerekmez.
4. iPad'de ek olarak **Güdümlü Erişim** (Ayarlar → Erişilebilirlik) açılırsa Eva uygulamadan çıkamaz.

## Ses kaynakları

Gerçek hayvan kayıtları açık GitHub depolarından alınıp yeniden işlendi (kısaltma + mono + loudness normalizasyonu). Balık, kelebek, zürafa için Web Audio sentezi kullanılır (bu hayvanların ikonik/karakteristik sesi yoktur).
