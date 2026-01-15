/**
 * Tower Defense - Game Class
 * @version 1.1.0
 */

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS.WIDTH;
        this.canvas.height = CONFIG.CANVAS.HEIGHT;
        
        this.grid = new Grid();
        this.renderer = new Renderer(canvas, this.ctx);
        this.menuManager = null;
        this.input = null;
        this.waveManager = null;
        
        this.state = 'menu';
        this.currentMap = null;
        this.currentMapId = null;
        this.currentDifficulty = null;
        this.themeColors = null;
        
        this.gold = 0;
        this.lives = 0;
        this.currentWave = 0;
        this.maxWaves = 0;
        this.prepTimeRemaining = 0;
        
        // Oyun hızı
        this.gameSpeed = 1;
        this.speedOptions = [1, 2, 3];
        
        // Özel yetenekler
        this.abilityCooldowns = {};
        this.selectedAbility = null;
        this.meteorTarget = null;
        
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.availableTowers = [];
        
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        this.fpsUpdateTime = 0;
        
        this.currentMessage = null;
        this.messageTimeout = null;
    }
    
    init() {
        console.log(`Tower Defense v${CONFIG.VERSION}`);
        
        this.menuManager = new MenuManager(this);
        this.input = new InputHandler(this.canvas, this);
        this.waveManager = new WaveManager(this);
        
        this.lastFrameTime = performance.now();
        this.state = 'menu';
        this.hideGameUI();
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    startNewGame(mapId, difficulty, gameMode = null) {
        this.currentGameMode = gameMode || CONFIG.GAME_MODES.classic;
        this.isEndless = this.currentGameMode?.endless || false;
        console.log(`Yeni oyun: ${mapId}, Zorluk: ${difficulty.name}, Mod: ${this.currentGameMode.name}`);
        
        this.currentMapId = mapId;
        this.currentDifficulty = difficulty;
        
        const mapData = mapManager.loadMap(mapId);
        if (!mapData) return;
        
        this.currentMap = mapData;
        this.maxWaves = this.isEndless ? 999 : (mapData.maxWaves || 15);
        this.themeColors = mapManager.getThemeColors(mapId);
        this.availableTowers = mapData.availableTowers || ['archer', 'cannon', 'ice'];
        
        // Zorluk ayarları + Harita bazlı gold
        const baseGold = mapData.startingGold || 150;
        this.gold = Math.round(baseGold * difficulty.goldMultiplier);
        this.lives = difficulty.startingLives;
        this.prepTimeRemaining = difficulty.prepTime;
        this.currentWave = 0;
        
        // Hızı sıfırla
        this.gameSpeed = 1;
        this.updateSpeedButton();
        
        // Temizle
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.waveManager.clear();
        particleSystem.clear();
        
        // Grid yükle
        this.grid.loadMap(mapData);
        
        // Renderer temasını güncelle
        this.renderer.setTheme(this.themeColors);
        
        // UI
        this.showGameUI();
        this.updateTowerMenu();
        this.input.deselectTower();
        
        // Yeni kule mesajı
        if (mapData.newTower && mapData.newTowerMessage) {
            setTimeout(() => this.showMessage(mapData.newTowerMessage, '#4ade80', 3000), 500);
        }
        
        // Endless mode mesajı
        if (this.isEndless) {
            setTimeout(() => this.showMessage('♾️ SONSUZ MOD - Hayatta kal!', '#ffd700', 3000), 1000);
        }
        
        this.state = 'preparing';
        this.updateUI();
    }
    
    gameLoop(currentTime) {
        const rawDt = Math.min((currentTime - this.lastFrameTime) / 1000, 0.1);
        const dt = rawDt * this.gameSpeed; // Hız çarpanı
        this.lastFrameTime = currentTime;
        
        this.updateFPS(currentTime);
        this.update(dt, currentTime);
        this.render();
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    updateFPS(currentTime) {
        this.frameCount++;
        if (currentTime - this.fpsUpdateTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;
        }
    }
    
    update(dt, currentTime) {
        if (this.state === 'menu') {
            this.menuManager.setMousePos(this.input.mousePos.x, this.input.mousePos.y);
            return;
        }
        
        this.input.updateTowerMenuState();
        
        // Particle sistemi her zaman güncelle
        particleSystem.update(dt);
        
        if (this.state === 'preparing') {
            this.prepTimeRemaining -= dt;
            if (this.prepTimeRemaining <= 0) this.startWave();
            this.updateUI();
        } else if (this.state === 'playing') {
            this.waveManager.update(dt);
            this.updateEnemies(dt);
            this.updateTowers(dt, currentTime);
            this.updateProjectiles(dt);
            
            if (this.waveManager.isWaveComplete()) this.endWave();
            if (this.lives <= 0) this.gameOver();
            
            this.updateUI();
        }
    }
    
    updateEnemies(dt) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(dt);
            
            if (enemy.reachedEnd) {
                this.lives -= enemy.damage;
                this.enemies.splice(i, 1);
                this.showMessage(`-${enemy.damage} ❤️`, '#ff0000', 1000);
                soundManager.play('damage');
            } else if (!enemy.alive) {
                // Ölüm particle efekti
                const colors = { neutral: '#90EE90', ice: '#87CEEB', fire: '#FF4500', wind: '#98FB98', earth: '#8B4513' };
                particleSystem.enemyDeath(enemy.x, enemy.y, colors[enemy.element] || '#ff0000');
                
                // Boss split mekanizması
                const splits = enemy.getSplitEnemies();
                if (splits.length > 0) {
                    particleSystem.explosion(enemy.x, enemy.y, '#ffd700', 20);
                    for (const splitData of splits) {
                        const splitEnemy = new Enemy(
                            splitData.type, 
                            this.currentMap.path, 
                            this.currentWave, 
                            this.currentDifficulty
                        );
                        splitEnemy.pathIndex = splitData.pathIndex;
                        splitEnemy.x = splitData.x;
                        splitEnemy.y = splitData.y;
                        splitEnemy.updateTarget();
                        this.enemies.push(splitEnemy);
                    }
                    this.showMessage(`👑 Boss bölündü!`, '#ff6b6b', 1500);
                }
                
                this.gold += enemy.reward;
                particleSystem.gold(enemy.x, enemy.y - 10);
                this.enemies.splice(i, 1);
                soundManager.play('enemyDeath');
            }
        }
    }
    
    updateTowers(dt, currentTime) {
        for (const tower of this.towers) {
            const projectile = tower.update(dt, this.enemies, currentTime);
            if (projectile) this.projectiles.push(projectile);
        }
    }
    
    updateProjectiles(dt) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.update(dt, this.enemies);
            if (!proj.alive) this.projectiles.splice(i, 1);
        }
    }
    
    startWave() {
        this.currentWave++;
        this.state = 'playing';
        this.showMessage(`Wave ${this.currentWave}`, '#ffd700');
        this.waveManager.generateWave(this.currentWave);
        soundManager.play('wave');
    }
    
    endWave() {
        // Endless modda sonsuz devam
        if (!this.isEndless && this.currentWave >= this.maxWaves) {
            this.victory();
            return;
        }
        
        this.state = 'preparing';
        this.prepTimeRemaining = this.currentDifficulty.prepTime;
        
        // Endless modda her 5 wave'de bonus altın
        if (this.isEndless && this.currentWave % 5 === 0) {
            const bonus = 50 + this.currentWave * 5;
            this.gold += bonus;
        }
        // Wave tamamlandı mesajı yok - UI'da görünüyor
    }
    
    victory() {
        this.state = 'victory';
        this.showMessage('🏆 ZAFER! 🏆', '#ffd700', 5000);
        soundManager.play('victory');
        
        // PlayerManager ile kaydet - haritayı tamamla
        const difficultyId = this.currentDifficulty?.id || 'normal';
        playerManager.completeMap(this.currentMapId, this.currentWave, difficultyId);
        
        console.log(`Zafer! ${this.currentMapId} tamamlandı, Wave: ${this.currentWave}`);
        
        // 5 saniye sonra menüye dön
        setTimeout(() => this.returnToMenu(), 5000);
    }
    
    gameOver() {
        this.state = 'game_over';
        
        if (this.isEndless) {
            this.showMessage(`💀 Wave ${this.currentWave}'de yenildin!`, '#ff0000', 5000);
            // Endless highscore kaydet
            playerManager.saveEndlessScore(this.currentMapId, this.currentWave, this.currentDifficulty.id);
        } else {
            this.showMessage('💀 OYUN BİTTİ 💀', '#ff0000', 5000);
        }
        soundManager.play('defeat');
        
        // Wave ilerlemesini kaydet (yenilsek bile)
        const difficultyId = this.currentDifficulty?.id || 'normal';
        playerManager.updateWaveProgress(this.currentMapId, this.currentWave, difficultyId);
        
        setTimeout(() => this.returnToMenu(), 5000);
    }
    
    returnToMenu() {
        this.state = 'menu';
        this.hideGameUI();
        
        // Hızı sıfırla
        this.gameSpeed = 1;
        this.updateSpeedButton();
        
        this.menuManager.returnToMainMenu();
    }
    
    placeTower(col, row, towerType) {
        const cfg = CONFIG.TOWERS[towerType];
        if (!cfg || this.gold < cfg.cost) {
            this.showWarning('Yetersiz altın!');
            return false;
        }
        
        if (!this.availableTowers.includes(towerType)) {
            this.showWarning('Bu kule bu haritada yok!');
            return false;
        }
        
        const tower = new Tower(towerType, col, row);
        if (!this.grid.placeTower(col, row, tower)) return false;
        
        this.gold -= cfg.cost;
        this.towers.push(tower);
        // Kule yerleştirildi - mesaj göstermeye gerek yok
        // Görsel feedback yeterli
        soundManager.play('towerPlace');
        return true;
    }
    
    updateUI() {
        const goldEl = document.getElementById('gold-display');
        const waveEl = document.getElementById('wave-display');
        const livesEl = document.getElementById('lives-display');
        
        if (goldEl) goldEl.textContent = `💰 ${this.gold}`;
        if (livesEl) livesEl.textContent = `❤️ ${this.lives}`;
        
        if (waveEl) {
            if (this.state === 'preparing') {
                waveEl.textContent = `⏱️ ${Math.ceil(this.prepTimeRemaining)}s | Wave: ${this.currentWave + 1}/${this.maxWaves}`;
            } else {
                waveEl.textContent = `📢 Wave: ${this.currentWave}/${this.maxWaves}`;
            }
        }
        
        // Yetenekleri güncelle
        this.updateAbilitiesUI();
    }
    
    updateAbilitiesUI() {
        const now = performance.now();
        
        document.querySelectorAll('.ability-btn').forEach(btn => {
            const abilityId = btn.dataset.ability;
            const cfg = CONFIG.ABILITIES[abilityId];
            if (!cfg) return;
            
            const cooldownEnd = this.abilityCooldowns[abilityId] || 0;
            const remaining = Math.max(0, cooldownEnd - now);
            const onCooldown = remaining > 0;
            const canAfford = this.gold >= cfg.cost;
            
            btn.classList.toggle('on-cooldown', onCooldown);
            btn.classList.toggle('disabled', !canAfford && !onCooldown);
            
            // Cooldown overlay
            const cooldownEl = btn.querySelector('.ability-cooldown');
            if (cooldownEl) {
                const percent = onCooldown ? (remaining / cfg.cooldown) * 100 : 0;
                cooldownEl.style.height = `${percent}%`;
            }
        });
    }
    
    updateTowerMenu() {
        const menu = document.getElementById('tower-menu');
        if (!menu) return;
        
        // Mevcut tower-option'ları güncelle
        document.querySelectorAll('.tower-option').forEach(opt => {
            const towerType = opt.dataset.tower;
            if (this.availableTowers.includes(towerType)) {
                opt.style.display = 'flex';
            } else {
                opt.style.display = 'none';
            }
        });
    }
    
    showGameUI() {
        document.getElementById('ui-overlay')?.classList.remove('hidden');
        document.getElementById('top-bar')?.classList.remove('hidden');
        document.getElementById('tower-panel')?.classList.remove('hidden');
        document.getElementById('abilities-bar')?.classList.remove('hidden');
    }
    
    hideGameUI() {
        document.getElementById('top-bar')?.classList.add('hidden');
        document.getElementById('tower-panel')?.classList.add('hidden');
        document.getElementById('abilities-bar')?.classList.add('hidden');
        document.getElementById('confirm-menu')?.classList.add('hidden');
    }
    
    cycleSpeed() {
        const currentIndex = this.speedOptions.indexOf(this.gameSpeed);
        const nextIndex = (currentIndex + 1) % this.speedOptions.length;
        this.gameSpeed = this.speedOptions[nextIndex];
        this.updateSpeedButton();
    }
    
    updateSpeedButton() {
        const btn = document.getElementById('speed-btn');
        if (btn) {
            btn.textContent = `${this.gameSpeed}x`;
            btn.className = `speed-btn speed-${this.gameSpeed}x`;
        }
    }
    
    // ==================== ÖZEL YETENEKLER ====================
    
    useAbility(abilityId, targetCol = null, targetRow = null) {
        const cfg = CONFIG.ABILITIES[abilityId];
        if (!cfg) return false;
        
        const now = performance.now();
        
        // Cooldown kontrolü
        if (this.abilityCooldowns[abilityId] && now < this.abilityCooldowns[abilityId]) {
            this.showWarning('Yetenek hazır değil!');
            return false;
        }
        
        // Altın kontrolü
        if (this.gold < cfg.cost) {
            this.showWarning('Yetersiz altın!');
            return false;
        }
        
        // Yeteneği uygula
        let success = false;
        
        switch (abilityId) {
            case 'meteor':
                if (targetCol !== null && targetRow !== null) {
                    success = this.useMeteor(targetCol, targetRow, cfg);
                }
                break;
            case 'freeze':
                success = this.useFreeze(cfg);
                break;
            case 'goldRush':
                success = this.useGoldRush(cfg);
                break;
            case 'repair':
                success = this.useRepair(cfg);
                break;
        }
        
        if (success) {
            this.gold -= cfg.cost;
            this.abilityCooldowns[abilityId] = now + cfg.cooldown;
            this.updateUI();
        }
        
        return success;
    }
    
    useMeteor(col, row, cfg) {
        const centerX = col * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2;
        const centerY = row * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2;
        const radiusPixels = cfg.radius * CONFIG.GRID.CELL_SIZE;
        
        let hitCount = 0;
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            const dist = Utils.distance(centerX, centerY, enemy.x, enemy.y);
            if (dist <= radiusPixels) {
                enemy.takeDamage(cfg.damage);
                hitCount++;
            }
        }
        
        // Başarı mesajı yok - görsel efekt yeterli
        soundManager.play('explosion');
        return true;
    }
    
    useFreeze(cfg) {
        let count = 0;
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            enemy.applyEffect('slow', cfg.slowAmount, cfg.duration);
            count++;
        }
        
        // Başarı mesajı yok - görsel efekt yeterli
        soundManager.play('ability');
        return true;
    }
    
    useGoldRush(cfg) {
        this.gold += cfg.goldBonus;
        // Başarı mesajı yok - UI'da görünüyor
        soundManager.play('gold');
        return true;
    }
    
    useRepair(cfg) {
        if (this.lives >= this.currentDifficulty.startingLives) {
            this.showWarning('Can zaten dolu!');
            return false;
        }
        
        this.lives = Math.min(this.lives + cfg.healAmount, this.currentDifficulty.startingLives);
        // Başarı mesajı yok - görsel feedback yeterli
        soundManager.play('ability');
        return true;
    }
    
    // Sadece uyarı/hata mesajları için - köşede küçük
    showWarning(message, duration = 2000) {
        this.currentMessage = { text: message, color: '#ff6b6b', isWarning: true };
        if (this.messageTimeout) clearTimeout(this.messageTimeout);
        this.messageTimeout = setTimeout(() => this.currentMessage = null, duration);
    }
    
    // Önemli bilgi mesajları için (wave, zafer, vs)
    showMessage(message, color = '#fff', duration = 2000) {
        // Sadece önemli mesajları göster
        this.currentMessage = { text: message, color, isWarning: false };
        if (this.messageTimeout) clearTimeout(this.messageTimeout);
        this.messageTimeout = setTimeout(() => this.currentMessage = null, duration);
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.state === 'menu') {
            this.menuManager.render(this.ctx);
            return;
        }
        
        // Oyun render
        this.renderer.clear();
        this.renderer.drawBackground();
        this.renderer.drawGrid(this.grid);
        
        // Seçili kulelerin menzilini göster
        if (this.input.isMultiSelect && this.input.selectedTowers.length > 0) {
            // Toplu seçimde tüm kulelerin menzilini göster
            for (const tower of this.input.selectedTowers) {
                tower.renderRange(this.ctx, true);
            }
        } else if (this.input.selectedTower) {
            this.input.selectedTower.renderRange(this.ctx, true);
        }
        
        for (const tower of this.towers) tower.render(this.ctx);
        for (const enemy of this.enemies) enemy.render(this.ctx);
        for (const proj of this.projectiles) proj.render(this.ctx);
        
        // Parçacık efektleri
        particleSystem.render(this.ctx);
        
        const preview = this.input.getPreviewInfo();
        if (preview) {
            this.renderer.drawRangePreview(preview.col, preview.row, preview.range, preview.isValid);
            this.renderer.drawTowerPreview(preview.col, preview.row, preview.towerType, preview.isValid);
        }
        
        if (this.state === 'preparing' && this.prepTimeRemaining > 0) {
            this.renderer.drawPrepTimer(this.prepTimeRemaining);
        }
        
        if (this.state === 'playing') {
            this.renderer.drawEnemyCount(this.waveManager.getRemainingCount());
        }
        
        if (this.currentMessage) {
            this.renderer.drawMessage(
                this.currentMessage.text, 
                this.currentMessage.color,
                this.currentMessage.isWarning
            );
        }
        
        this.renderer.drawFPS(this.fps);
    }
}
