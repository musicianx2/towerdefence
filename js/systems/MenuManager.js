/**
 * Tower Defense - Menu Manager
 * Ana menü, kullanıcı girişi ve scoreboard
 * @version 1.3.1
 */

class MenuManager {
    constructor(game) {
        this.game = game;
        this.currentScreen = 'main';
        this.selectedMap = null;
        this.selectedDifficulty = 'normal';
        this.animationFrame = 0;
        this.buttons = [];
        this.mousePos = { x: 0, y: 0 };
        
        // Harita scroll
        this.mapScrollIndex = 0;
        this.maxVisibleMaps = 3;
        
        // Ayarlar
        this.soundEnabled = true;
        this.musicEnabled = true;
        
        // Kullanıcı girişi
        this.inputText = '';
        this.inputActive = false;
        this.inputError = '';
        
        // Keyboard listener
        this.setupKeyboardInput();
    }
    
    setupKeyboardInput() {
        document.addEventListener('keydown', (e) => {
            if (!this.inputActive) return;
            
            if (e.key === 'Enter') {
                this.submitPlayerName();
            } else if (e.key === 'Backspace') {
                this.inputText = this.inputText.slice(0, -1);
                this.inputError = '';
            } else if (e.key === 'Escape') {
                // İptal - eğer oyuncu varsa ana menüye dön
                if (playerManager.hasAnyPlayer()) {
                    this.currentScreen = 'main';
                    this.inputActive = false;
                }
            } else if (e.key.length === 1 && this.inputText.length < 15) {
                this.inputText += e.key;
                this.inputError = '';
            }
        });
    }
    
    setMousePos(x, y) {
        this.mousePos = { x, y };
    }
    
    render(ctx) {
        this.animationFrame++;
        this.buttons = [];
        
        // İlk açılışta kullanıcı kontrolü
        if (this.currentScreen === 'main' && !playerManager.getCurrentPlayer()) {
            this.currentScreen = 'player_select';
        }
        
        switch (this.currentScreen) {
            case 'player_select': this.renderPlayerSelect(ctx); break;
            case 'player_create': this.renderPlayerCreate(ctx); break;
            case 'main': this.renderMainMenu(ctx); break;
            case 'map_select': this.renderMapSelect(ctx); break;
            case 'difficulty': this.renderDifficultySelect(ctx); break;
            case 'settings': this.renderSettings(ctx); break;
            case 'scoreboard': this.renderScoreboard(ctx); break;
        }
    }
    
    // ==================== PLAYER SELECT ====================
    
    renderPlayerSelect(ctx) {
        const w = CONFIG.CANVAS.WIDTH, h = CONFIG.CANVAS.HEIGHT;
        
        this.drawBackground(ctx, 'summer');
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, w, h);
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('👤 OYUNCU SEÇ', w/2, 60);
        
        const players = playerManager.getAllPlayers();
        
        if (players.length === 0) {
            ctx.fillStyle = '#888';
            ctx.font = '18px Arial';
            ctx.fillText('Henüz kayıtlı oyuncu yok', w/2, h/2 - 30);
            ctx.fillText('Yeni bir oyuncu oluştur!', w/2, h/2);
        } else {
            // Oyuncu listesi
            const startY = 110;
            const cardH = 60;
            const gap = 10;
            const maxShow = 5;
            
            players.slice(0, maxShow).forEach((player, i) => {
                const y = startY + i * (cardH + gap);
                this.drawPlayerCard(ctx, w/2, y, 350, cardH, player);
            });
            
            if (players.length > maxShow) {
                ctx.fillStyle = '#666';
                ctx.font = '14px Arial';
                ctx.fillText(`+${players.length - maxShow} daha...`, w/2, startY + maxShow * (cardH + gap));
            }
        }
        
        // Butonlar
        this.drawButton(ctx, w/2, h - 70, 250, 50, '➕ YENİ OYUNCU', true, 'create_player');
    }
    
    drawPlayerCard(ctx, cx, y, w, h, player) {
        const x = cx - w/2;
        const hover = this.isHover(x, y, w, h);
        const isCurrentPlayer = playerManager.currentPlayer === player.name;
        
        ctx.fillStyle = isCurrentPlayer ? '#3a5a4a' : (hover ? '#3a3a5a' : '#2a2a4a');
        ctx.strokeStyle = isCurrentPlayer ? '#4ade80' : (hover ? '#ffd700' : '#444');
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 10);
        ctx.fill();
        ctx.stroke();
        
        // Avatar
        ctx.font = '28px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('👤', x + 15, y + h/2 + 10);
        
        // İsim
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(player.name, x + 60, y + 25);
        
        // İlerleme
        ctx.fillStyle = '#888';
        ctx.font = '12px Arial';
        const mapName = MAPS[player.currentMap]?.name || 'Orman Yolu';
        const completedCount = player.completedMaps?.length || 0;
        ctx.fillText(`${mapName} • ${completedCount} harita tamamlandı`, x + 60, y + 45);
        
        // Seç butonu
        if (!isCurrentPlayer) {
            this.buttons.push({ id: 'select_player_' + player.name, x, y, w, h, playerName: player.name });
        } else {
            ctx.fillStyle = '#4ade80';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('✓ Aktif', x + w - 15, y + h/2 + 5);
        }
        
        // Oynat butonu
        if (isCurrentPlayer) {
            this.buttons.push({ id: 'play_current', x, y, w, h });
        }
    }
    
    // ==================== PLAYER CREATE ====================
    
    renderPlayerCreate(ctx) {
        const w = CONFIG.CANVAS.WIDTH, h = CONFIG.CANVAS.HEIGHT;
        
        this.drawBackground(ctx, 'summer');
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(0, 0, w, h);
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('➕ YENİ OYUNCU', w/2, 80);
        
        ctx.fillStyle = '#aaa';
        ctx.font = '16px Arial';
        ctx.fillText('Oyuncu adını gir (2-15 karakter)', w/2, 120);
        
        // Input box
        const inputW = 300, inputH = 50;
        const inputX = w/2 - inputW/2, inputY = 160;
        
        ctx.fillStyle = '#1a1a2e';
        ctx.strokeStyle = this.inputActive ? '#ffd700' : '#555';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(inputX, inputY, inputW, inputH, 10);
        ctx.fill();
        ctx.stroke();
        
        // Input text
        ctx.fillStyle = this.inputText ? '#fff' : '#666';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        const displayText = this.inputText || 'İsim gir...';
        ctx.fillText(displayText, inputX + 15, inputY + 32);
        
        // Cursor
        if (this.inputActive && Math.floor(this.animationFrame / 30) % 2 === 0) {
            const textW = ctx.measureText(this.inputText).width;
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(inputX + 15 + textW + 2, inputY + 12, 2, 26);
        }
        
        // Error message
        if (this.inputError) {
            ctx.fillStyle = '#ff6b6b';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.inputError, w/2, inputY + inputH + 25);
        }
        
        // Input alanını tıklanabilir yap
        this.buttons.push({ id: 'input_focus', x: inputX, y: inputY, w: inputW, h: inputH });
        
        // Butonlar
        this.drawButton(ctx, w/2 - 80, h - 100, 140, 45, '← GERİ', true, 'back_to_player_select');
        this.drawButton(ctx, w/2 + 80, h - 100, 140, 45, '✓ OLUŞTUR', this.inputText.length >= 2, 'submit_player');
        
        // Klavye ipucu
        ctx.fillStyle = '#555';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Enter: Onayla • Escape: İptal', w/2, h - 40);
        
        this.inputActive = true;
    }
    
    submitPlayerName() {
        const result = playerManager.createPlayer(this.inputText);
        if (result.success) {
            this.inputText = '';
            this.inputError = '';
            this.inputActive = false;
            this.currentScreen = 'main';
            if (typeof hideMobileInput === 'function') hideMobileInput();
        } else {
            this.inputError = result.error;
        }
    }
    
    // ==================== MAIN MENU ====================
    
    renderMainMenu(ctx) {
        const w = CONFIG.CANVAS.WIDTH, h = CONFIG.CANVAS.HEIGHT;
        const player = playerManager.getCurrentPlayer();
        
        this.drawBackground(ctx, 'summer');
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, w, h);
        
        // Başlık
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('TOWER DEFENSE', w/2 + 3, 83);
        ctx.fillStyle = '#ffd700';
        ctx.fillText('TOWER DEFENSE', w/2, 80);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = '#87ceeb';
        ctx.fillText('Kule Savunma Oyunu', w/2, 115);
        
        // Hoşgeldin mesajı
        if (player) {
            ctx.fillStyle = '#4ade80';
            ctx.font = '18px Arial';
            ctx.fillText(`👤 Hoşgeldin, ${player.name}!`, w/2, 150);
        }
        
        ctx.font = '11px Arial';
        ctx.fillStyle = '#555';
        ctx.fillText(`v${CONFIG.VERSION} (${CONFIG.BUILD})`, w/2, 175);
        
        // Butonlar
        const btnY = 220;
        const btnGap = 55;
        this.drawButton(ctx, w/2, btnY, 260, 50, '▶  OYNA', true, 'new_game');
        this.drawButton(ctx, w/2, btnY + btnGap, 260, 50, '👤  KULLANICI DEĞİŞTİR', true, 'change_player');
        this.drawButton(ctx, w/2, btnY + btnGap * 2, 260, 50, '🏆  SKOR TABLOSU', true, 'scoreboard');
        this.drawButton(ctx, w/2, btnY + btnGap * 3, 260, 50, '⚙️  AYARLAR', true, 'settings');
        
        this.drawDecorativeTowers(ctx);
    }
    
    // ==================== SCOREBOARD ====================
    
    renderScoreboard(ctx) {
        const w = CONFIG.CANVAS.WIDTH, h = CONFIG.CANVAS.HEIGHT;
        
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, w, h);
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 SKOR TABLOSU', w/2, 50);
        
        const scores = playerManager.getScoreboard();
        
        if (scores.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '18px Arial';
            ctx.fillText('Henüz skor yok', w/2, h/2);
        } else {
            // Tablo başlığı
            const tableX = 80, tableY = 90;
            const rowH = 45;
            const cols = [40, 180, 200, 100]; // #, İsim, Harita, Wave
            
            ctx.fillStyle = '#333';
            ctx.fillRect(tableX, tableY, w - tableX * 2, 35);
            
            ctx.fillStyle = '#888';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('#', tableX + 15, tableY + 23);
            ctx.fillText('OYUNCU', tableX + cols[0] + 10, tableY + 23);
            ctx.fillText('HARİTA', tableX + cols[0] + cols[1] + 10, tableY + 23);
            ctx.fillText('WAVE', tableX + cols[0] + cols[1] + cols[2] + 10, tableY + 23);
            
            // Skorlar
            scores.slice(0, 8).forEach((score, i) => {
                const y = tableY + 35 + i * rowH;
                const isCurrentPlayer = score.name === playerManager.currentPlayer;
                
                // Arka plan
                ctx.fillStyle = isCurrentPlayer ? 'rgba(74, 222, 128, 0.1)' : (i % 2 === 0 ? '#252535' : '#1f1f2f');
                ctx.fillRect(tableX, y, w - tableX * 2, rowH);
                
                // Sıra
                ctx.fillStyle = i < 3 ? ['#ffd700', '#c0c0c0', '#cd7f32'][i] : '#666';
                ctx.font = 'bold 18px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(i < 3 ? ['🥇', '🥈', '🥉'][i] : `${i + 1}`, tableX + 10, y + 28);
                
                // İsim
                ctx.fillStyle = isCurrentPlayer ? '#4ade80' : '#fff';
                ctx.font = '16px Arial';
                ctx.fillText(score.name, tableX + cols[0] + 10, y + 28);
                
                // Harita
                ctx.fillStyle = '#87ceeb';
                ctx.fillText(`${score.mapIcon} ${score.mapName}`, tableX + cols[0] + cols[1] + 10, y + 28);
                
                // Wave
                ctx.fillStyle = '#ffd700';
                ctx.fillText(`Wave ${score.wave}`, tableX + cols[0] + cols[1] + cols[2] + 10, y + 28);
            });
        }
        
        this.drawButton(ctx, w/2, h - 50, 150, 45, '← GERİ', true, 'back');
    }
    
    renderSettings(ctx) {
        const w = CONFIG.CANVAS.WIDTH, h = CONFIG.CANVAS.HEIGHT;
        
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, w, h);
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚙️ AYARLAR', w/2, 60);
        
        // Ayar kartları
        const cardY = 120;
        const cardH = 60;
        const gap = 20;
        
        // Ses ayarı (göstermelik)
        this.drawSettingRow(ctx, w/2, cardY, 'Ses Efektleri', this.soundEnabled, 'sound');
        this.drawSettingRow(ctx, w/2, cardY + cardH + gap, 'Müzik', this.musicEnabled, 'music');
        this.drawSettingRow(ctx, w/2, cardY + (cardH + gap) * 2, 'FPS Göster', CONFIG.DEBUG.SHOW_FPS, 'fps');
        this.drawSettingRow(ctx, w/2, cardY + (cardH + gap) * 3, 'Grid Göster', CONFIG.DEBUG.SHOW_GRID, 'grid');
        
        // İlerlemeyi sıfırla butonu
        this.drawButton(ctx, w/2, h - 140, 220, 45, '🗑️ İlerlemeyi Sıfırla', true, 'reset_progress');
        
        // Geri butonu
        this.drawButton(ctx, w/2, h - 70, 150, 45, '← GERİ', true, 'back');
    }
    
    drawSettingRow(ctx, cx, cy, label, value, id) {
        const w = 400, h = 50;
        const x = cx - w/2;
        
        ctx.fillStyle = '#2a2a4a';
        ctx.beginPath();
        ctx.roundRect(x, cy, w, h, 10);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x + 20, cy + h/2);
        
        // Toggle butonu
        const toggleX = x + w - 70;
        const toggleY = cy + 10;
        const toggleW = 50, toggleH = 30;
        
        ctx.fillStyle = value ? '#2ecc71' : '#555';
        ctx.beginPath();
        ctx.roundRect(toggleX, toggleY, toggleW, toggleH, 15);
        ctx.fill();
        
        // Toggle topuzu
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(value ? toggleX + toggleW - 15 : toggleX + 15, toggleY + 15, 12, 0, Math.PI * 2);
        ctx.fill();
        
        this.buttons.push({ id: 'toggle_' + id, x: toggleX, y: toggleY, w: toggleW, h: toggleH });
    }
    
    renderMapSelect(ctx) {
        const w = CONFIG.CANVAS.WIDTH, h = CONFIG.CANVAS.HEIGHT;
        
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, w, h);
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('HARİTA SEÇ', w/2, 50);
        
        // PlayerManager'dan harita listesi al
        const unlockedMaps = playerManager.getUnlockedMaps();
        const maps = Object.keys(MAPS).map(id => ({
            ...MAPS[id],
            id: id,
            unlocked: unlockedMaps.includes(id)
        }));
        
        // Scroll sınırlarını kontrol et
        const totalMaps = maps.length;
        const maxScroll = Math.max(0, totalMaps - this.maxVisibleMaps);
        this.mapScrollIndex = Math.max(0, Math.min(this.mapScrollIndex, maxScroll));
        
        // Kart boyutları
        const cardW = 200, cardH = 280, gap = 30;
        const visibleMaps = Math.min(this.maxVisibleMaps, totalMaps);
        const totalWidth = visibleMaps * cardW + (visibleMaps - 1) * gap;
        const startX = (w - totalWidth) / 2;
        
        // Sol ok butonu
        if (this.mapScrollIndex > 0) {
            this.drawScrollArrow(ctx, 40, h/2 - 30, 'left');
            this.buttons.push({ id: 'scroll_left', x: 20, y: h/2 - 60, w: 50, h: 80 });
        }
        
        // Sağ ok butonu
        if (this.mapScrollIndex < maxScroll) {
            this.drawScrollArrow(ctx, w - 40, h/2 - 30, 'right');
            this.buttons.push({ id: 'scroll_right', x: w - 70, y: h/2 - 60, w: 50, h: 80 });
        }
        
        // Görünen haritaları çiz
        for (let i = 0; i < visibleMaps; i++) {
            const mapIndex = this.mapScrollIndex + i;
            if (mapIndex < totalMaps) {
                const map = maps[mapIndex];
                this.drawMapCard(ctx, startX + i * (cardW + gap), 90, cardW, cardH, map);
            }
        }
        
        // Sayfa göstergesi
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.mapScrollIndex + 1}-${Math.min(this.mapScrollIndex + visibleMaps, totalMaps)} / ${totalMaps}`, w/2, h - 90);
        
        // Nokta göstergeleri
        const dotY = h - 70;
        const dotGap = 15;
        const dotsStartX = w/2 - ((totalMaps - 1) * dotGap) / 2;
        for (let i = 0; i < totalMaps; i++) {
            const isVisible = i >= this.mapScrollIndex && i < this.mapScrollIndex + visibleMaps;
            ctx.fillStyle = isVisible ? '#ffd700' : '#444';
            ctx.beginPath();
            ctx.arc(dotsStartX + i * dotGap, dotY, isVisible ? 5 : 4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        this.drawButton(ctx, 100, h - 40, 150, 40, '← GERİ', true, 'back');
    }
    
    drawScrollArrow(ctx, x, y, direction) {
        const hover = this.isHover(x - 25, y - 30, 50, 80);
        
        ctx.fillStyle = hover ? '#ffd700' : '#666';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(direction === 'left' ? '◀' : '▶', x, y + 30);
    }
    
    renderDifficultySelect(ctx) {
        const w = CONFIG.CANVAS.WIDTH, h = CONFIG.CANVAS.HEIGHT;
        const map = MAPS[this.selectedMap];
        
        this.drawBackground(ctx, map?.theme || 'summer');
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, w, h);
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${map?.icon || ''} ${map?.name || ''}`, w/2, 55);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#888';
        ctx.fillText(map?.description || '', w/2, 85);
        ctx.fillText(`${map?.maxWaves || 15} Wave`, w/2, 105);
        
        ctx.font = 'bold 22px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText('Zorluk Seç', w/2, 150);
        
        const diffs = Object.values(CONFIG.DIFFICULTY);
        const cardW = 170, cardH = 190, gap = 25;
        const startX = (w - (diffs.length * cardW + (diffs.length-1) * gap)) / 2;
        
        diffs.forEach((diff, i) => {
            this.drawDifficultyCard(ctx, startX + i * (cardW + gap), 175, cardW, cardH, diff);
        });
        
        // Yeni kule bilgisi
        if (map?.newTower) {
            const tower = CONFIG.TOWERS[map.newTower];
            ctx.fillStyle = 'rgba(50,200,50,0.2)';
            ctx.beginPath();
            ctx.roundRect(w/2 - 140, h - 140, 280, 45, 10);
            ctx.fill();
            ctx.fillStyle = '#4ade80';
            ctx.font = 'bold 15px Arial';
            ctx.fillText(`🆕 Yeni Kule: ${tower?.icon} ${tower?.name}`, w/2, h - 118);
        }
        
        this.drawButton(ctx, w/2 - 100, h - 55, 130, 45, '← GERİ', true, 'back_to_maps');
        this.drawButton(ctx, w/2 + 100, h - 55, 130, 45, 'BAŞLA ▶', true, 'start_game');
    }
    
    drawMapCard(ctx, x, y, w, h, map) {
        const locked = !map.unlocked;
        const hover = this.isHover(x, y, w, h) && !locked;
        
        ctx.fillStyle = locked ? '#252535' : (hover ? '#3a3a5a' : '#2a2a4a');
        ctx.strokeStyle = locked ? '#333' : (hover ? '#ffd700' : '#444');
        ctx.lineWidth = hover ? 3 : 2;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 15);
        ctx.fill();
        ctx.stroke();
        
        // İkon
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = locked ? '#444' : '#fff';
        ctx.fillText(locked ? '🔒' : (map.icon || '🗺️'), x + w/2, y + 60);
        
        // İsim
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = locked ? '#555' : '#fff';
        ctx.fillText(map.name, x + w/2, y + 95);
        
        // Açıklama
        ctx.font = '11px Arial';
        ctx.fillStyle = '#777';
        const desc = locked ? 'Önceki haritayı tamamla' : (map.description || '');
        ctx.fillText(desc.substring(0, 28), x + w/2, y + 120);
        
        if (!locked) {
            // Zorluk yıldızları
            ctx.fillStyle = '#ffd700';
            ctx.font = '14px Arial';
            ctx.fillText('⭐'.repeat(map.difficulty || 1), x + w/2, y + 150);
            
            // Wave sayısı
            ctx.fillStyle = '#87ceeb';
            ctx.font = '13px Arial';
            ctx.fillText(`${map.maxWaves || 15} Wave`, x + w/2, y + 175);
            
            // Element bilgisi
            if (map.dominantElement && map.dominantElement !== 'neutral') {
                const elem = CONFIG.ELEMENTS[map.dominantElement];
                ctx.fillStyle = elem?.color || '#888';
                ctx.font = '12px Arial';
                ctx.fillText(`${elem?.icon || ''} ${elem?.name || ''}`, x + w/2, y + 200);
            }
            
            // Seç butonu
            ctx.fillStyle = hover ? '#2ecc71' : '#27ae60';
            ctx.beginPath();
            ctx.roundRect(x + 30, y + h - 50, w - 60, 38, 10);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 15px Arial';
            ctx.fillText('SEÇ', x + w/2, y + h - 27);
        }
        
        if (!locked) {
            this.buttons.push({ id: 'select_map_' + map.id, x, y, w, h, mapId: map.id });
        }
    }
    
    drawDifficultyCard(ctx, x, y, w, h, diff) {
        const selected = this.selectedDifficulty === diff.id;
        const hover = this.isHover(x, y, w, h);
        
        ctx.fillStyle = selected ? '#3a4a5a' : (hover ? '#2a3a4a' : '#1a2a3a');
        ctx.strokeStyle = selected ? '#ffd700' : (hover ? '#666' : '#333');
        ctx.lineWidth = selected ? 3 : 2;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 12);
        ctx.fill();
        ctx.stroke();
        
        ctx.font = '22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(diff.icon, x + w/2, y + 35);
        
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = selected ? '#ffd700' : '#fff';
        ctx.fillText(diff.name, x + w/2, y + 65);
        
        ctx.font = '11px Arial';
        ctx.fillStyle = '#999';
        ctx.fillText(`❤️ ${diff.startingLives} Can`, x + w/2, y + 95);
        ctx.fillText(`💰 ${diff.startingGold} Altın`, x + w/2, y + 115);
        ctx.fillText(`⏱️ ${diff.prepTime}s Hazırlık`, x + w/2, y + 135);
        ctx.fillText(`👹 x${diff.enemyHealthMult} HP`, x + w/2, y + 155);
        
        if (selected) {
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 18px Arial';
            ctx.fillText('✓', x + w - 20, y + 25);
        }
        
        this.buttons.push({ id: 'select_diff_' + diff.id, x, y, w, h, diffId: diff.id });
    }
    
    drawButton(ctx, cx, cy, w, h, text, enabled, id) {
        const x = cx - w/2, y = cy - h/2;
        const hover = enabled && this.isHover(x, y, w, h);
        
        ctx.fillStyle = !enabled ? '#2a2a2a' : (hover ? '#4a4a6a' : '#3a3a5a');
        ctx.strokeStyle = !enabled ? '#333' : (hover ? '#ffd700' : '#555');
        ctx.lineWidth = hover ? 3 : 2;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 12);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = !enabled ? '#555' : '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, cx, cy);
        
        if (enabled) this.buttons.push({ id, x, y, w, h });
    }
    
    drawBackground(ctx, theme) {
        const colors = CONFIG.THEMES?.[theme] || CONFIG.COLORS;
        const w = CONFIG.CANVAS.WIDTH, h = CONFIG.CANVAS.HEIGHT;
        
        ctx.fillStyle = colors.EMPTY || '#4a7c23';
        ctx.fillRect(0, 0, w, h);
        
        ctx.fillStyle = colors.TREE || '#2d5a1d';
        for (let i = 0; i < 15; i++) {
            const tx = (i * 157 + this.animationFrame * 0.05) % (w + 50) - 25;
            const ty = 50 + (i * 97) % (h - 100);
            ctx.beginPath();
            ctx.moveTo(tx, ty - 15);
            ctx.lineTo(tx - 12, ty + 8);
            ctx.lineTo(tx + 12, ty + 8);
            ctx.fill();
        }
    }
    
    drawDecorativeTowers(ctx) {
        const w = CONFIG.CANVAS.WIDTH, h = CONFIG.CANVAS.HEIGHT;
        const t = this.animationFrame * 0.03;
        
        ctx.font = '72px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏰', 90, h - 80 + Math.sin(t) * 5);
        ctx.fillText('🏰', w - 90, h - 80 + Math.sin(t + 1) * 5);
        
        ctx.font = '36px Arial';
        ['👹', '🐺', '👻'].forEach((e, i) => {
            const ex = (this.animationFrame * (0.8 + i * 0.3) + i * 250) % (w + 100) - 50;
            ctx.fillText(e, ex, h - 25);
        });
    }
    
    isHover(x, y, w, h) {
        return this.mousePos.x >= x && this.mousePos.x <= x + w &&
               this.mousePos.y >= y && this.mousePos.y <= y + h;
    }
    
    handleClick(x, y) {
        for (const btn of this.buttons) {
            if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
                // Player management
                if (btn.id === 'create_player') {
                    this.currentScreen = 'player_create';
                    this.inputText = '';
                    this.inputError = '';
                    this.inputActive = true;
                } else if (btn.id === 'back_to_player_select') {
                    this.currentScreen = 'player_select';
                    this.inputActive = false;
                } else if (btn.id === 'submit_player') {
                    this.submitPlayerName();
                    if (typeof hideMobileInput === 'function') hideMobileInput();
                } else if (btn.id === 'input_focus') {
                    this.inputActive = true;
                    // Mobil için HTML input aç
                    if (typeof showMobileInput === 'function') {
                        showMobileInput(this.inputText);
                    }
                } else if (btn.id.startsWith('select_player_')) {
                    playerManager.setCurrentPlayer(btn.playerName);
                    this.currentScreen = 'main';
                } else if (btn.id === 'play_current') {
                    this.currentScreen = 'main';
                } else if (btn.id === 'change_player') {
                    this.currentScreen = 'player_select';
                } else if (btn.id === 'scoreboard') {
                    this.currentScreen = 'scoreboard';
                }
                // Main menu
                else if (btn.id === 'new_game') {
                    this.mapScrollIndex = 0; // Harita seçimine girerken scroll sıfırla
                    this.currentScreen = 'map_select';
                } else if (btn.id === 'scroll_left') {
                    this.mapScrollIndex = Math.max(0, this.mapScrollIndex - 1);
                } else if (btn.id === 'scroll_right') {
                    const totalMaps = Object.keys(MAPS).length;
                    const maxScroll = Math.max(0, totalMaps - this.maxVisibleMaps);
                    this.mapScrollIndex = Math.min(maxScroll, this.mapScrollIndex + 1);
                } else if (btn.id === 'back') {
                    this.currentScreen = 'main';
                } else if (btn.id === 'back_to_maps') {
                    this.currentScreen = 'map_select';
                } else if (btn.id === 'start_game') {
                    this.startGame();
                } else if (btn.id === 'settings') {
                    this.currentScreen = 'settings';
                } else if (btn.id === 'reset_progress') {
                    if (confirm('Tüm oyuncu verileri silinecek. Emin misin?')) {
                        playerManager.resetAllData();
                        this.currentScreen = 'player_select';
                    }
                } else if (btn.id === 'toggle_sound') {
                    this.soundEnabled = !this.soundEnabled;
                } else if (btn.id === 'toggle_music') {
                    this.musicEnabled = !this.musicEnabled;
                } else if (btn.id === 'toggle_fps') {
                    CONFIG.DEBUG.SHOW_FPS = !CONFIG.DEBUG.SHOW_FPS;
                } else if (btn.id === 'toggle_grid') {
                    CONFIG.DEBUG.SHOW_GRID = !CONFIG.DEBUG.SHOW_GRID;
                } else if (btn.id.startsWith('select_map_')) {
                    this.selectedMap = btn.mapId;
                    this.currentScreen = 'difficulty';
                } else if (btn.id.startsWith('select_diff_')) {
                    this.selectedDifficulty = btn.diffId;
                }
                return true;
            }
        }
        return false;
    }
    
    startGame() {
        if (!this.selectedMap) return;
        const difficulty = CONFIG.DIFFICULTY[this.selectedDifficulty];
        this.game.startNewGame(this.selectedMap, difficulty);
    }
    
    show(screen = 'main') {
        this.currentScreen = screen;
        this.buttons = [];
    }
    
    returnToMainMenu() {
        this.currentScreen = 'main';
        this.selectedMap = null;
        this.inputActive = false;
    }
}
