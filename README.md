# Tower Defense 🏰

Strateji tabanlı kule savunma oyunu.

## 🎮 Nasıl Oynanır

1. **Kule Seç:** Sağdaki menüden veya 1-2-3 tuşlarıyla
2. **Yerleştir:** Yeşil alana tıkla, sonra onayla
3. **Başlat:** Space tuşu veya BAŞLAT butonu
4. **Savun:** Düşmanların kaleye ulaşmasını engelle!

## 🎯 Kontroller

| Tuş | Aksiyon |
|-----|---------|
| 1 | Okçu Kulesi |
| 2 | Top Kulesi |
| 3 | Buz Kulesi |
| T | Menü aç/kapat |
| Space | Wave başlat |
| ESC | Seçimi iptal |

## 🏗️ Kuleler

| Kule | Maliyet | Özellik |
|------|---------|---------|
| 🏹 Okçu | 50 | Hızlı ateş |
| 💣 Top | 100 | Alan hasarı |
| ❄️ Buz | 75 | Yavaşlatma |
| 🔥 Ateş | 150 | Yanma hasarı |
| ⚡ Tesla | 200 | Zincir şimşek |

## 👹 Düşmanlar

| Düşman | Özellik |
|--------|---------|
| Goblin | Normal |
| Kurt | Hızlı |
| Ogre | Dayanıklı |
| Troll | Boss |

## 🛠️ Geliştirme

### Gereksinimler
- Modern web tarayıcısı
- VS Code (önerilir)
- Live Server eklentisi

### Kurulum

```bash
git clone https://github.com/musicianx2/towerdefence.git
cd towerdefence
# VS Code'da aç, Live Server ile çalıştır
```

### Yapı

```
tower-defense/
├── index.html
├── manifest.json
├── sw.js
├── css/
│   └── style.css
├── js/
│   ├── config.js
│   ├── utils.js
│   ├── Game.js
│   ├── main.js
│   ├── entities/
│   │   ├── Enemy.js
│   │   ├── Tower.js
│   │   └── Projectile.js
│   ├── systems/
│   │   ├── Grid.js
│   │   ├── WaveManager.js
│   │   ├── Renderer.js
│   │   └── InputHandler.js
│   └── maps/
│       └── map1.js
└── assets/
    └── images/
```

## 📱 PWA

Uygulama PWA olarak çalışır:
- Offline destek
- Ana ekrana eklenebilir
- Mobil uyumlu

## 📄 Lisans

MIT

## 🤝 Katkı

Pull request'ler kabul edilir!
