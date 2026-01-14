/**
 * Tower Defense - Game Class
 * Ana oyun mantığı
 * @version 1.0.0
 */

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Canvas boyutu
        this.canvas.width = CONFIG.CANVAS.WIDTH;
        this.canvas.height = CONFIG.CANVAS.HEIGHT;
        
        // Sistemler
        this.grid = new Grid();
        this.renderer = new Renderer(canvas, this.ctx);
        this.input = null;
        this.waveManager = null;
        
        // Oyun durumu
        this.state = 'loading';
        this.currentMap = null;
        
        // Oyun değişkenleri
        this.gold = CONFIG.GAME.STARTING_GOLD;
        this.lives = CONFIG.GAME.STARTING_LIVES;
        this.currentWave = 0;
        this.maxWaves = CONFIG.GAME.MAX_WAVES;
        this.prepTimeRemaining = 0;
        
        // Entity koleksiyonları
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        
        // FPS
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        this.fpsUpdateTime = 0;
        
        // Mesaj
        this.currentMessage = null;
        this.messageTimeout = null;
    }
    
    /**
     * Oyunu başlatır
     */
    init() {
        console.log(`Tower Defense v${CONFIG.VERSION} başlatılıyor...`);
        
        this.input = new InputHandler(this.canvas, this);
        this.waveManager = new WaveManager(this);
        
        this.loadMap('map1');
        this.input.showTowerMenu();
        
        this.lastFrameTime = performance.now();
        this.state = 'preparing';
        this.prepTimeRemaining = CONFIG.WAVE.BASE_PREP_TIME;
        
        requestAnimationFrame((t) => this.gameLoop(t));
        
        console.log('Oyun başlatıldı!');
        console.log('Kontroller: 1-3: Kule seç, T: Menü, Space: Başlat, ESC: İptal');
    }
    
    /**
     * Harita yükler
     */
    loadMap(mapId) {
        const data = mapManager.loadMap(mapId);
        if (!data) return false;
        
        this.currentMap = data;
        this.maxWaves = data.maxWaves || CONFIG.GAME.MAX_WAVES;
        this.grid.loadMap(data);
        
        return true;
    }
    
    /**
     * Ana oyun döngüsü
     */
    gameLoop(currentTime) {
        const dt = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;
        
        this.updateFPS(currentTime);
        this.update(dt, currentTime);
        this.render();
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    /**
     * FPS hesaplar
     */
    updateFPS(currentTime) {
        this.frameCount++;
        if (currentTime - this.fpsUpdateTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;
        }
    }
    
    /**
     * Oyunu günceller
     */
    update(dt, currentTime) {
        this.input.updateTowerMenuState();
        
        switch (this.state) {
            case 'preparing':
                this.prepTimeRemaining -= dt;
                this.updateUI();
                if (this.prepTimeRemaining <= 0) {
                    this.startWave();
                }
                break;
                
            case 'playing':
                this.waveManager.update(dt);
                this.updateEnemies(dt);
                this.updateTowers(dt, currentTime);
                this.updateProjectiles(dt);
                
                if (this.waveManager.isWaveComplete()) {
                    this.endWave();
                }
                
                if (this.lives <= 0) {
                    this.state = 'game_over';
                    this.showMessage('OYUN BİTTİ!', '#ff0000', 5000);
                }
                
                this.updateUI();
                break;
        }
    }
    
    /**
     * Düşmanları günceller
     */
    updateEnemies(dt) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(dt);
            
            if (enemy.reachedEnd) {
                this.lives -= enemy.damage;
                this.enemies.splice(i, 1);
                this.showMessage(`-${enemy.damage} ❤️`, '#ff0000', 1000);
            } else if (!enemy.alive) {
                this.gold += enemy.reward;
                this.enemies.splice(i, 1);
            }
        }
    }
    
    /**
     * Kuleleri günceller
     */
    updateTowers(dt, currentTime) {
        for (const tower of this.towers) {
            const projectile = tower.update(dt, this.enemies, currentTime);
            if (projectile) {
                this.projectiles.push(projectile);
            }
        }
    }
    
    /**
     * Mermileri günceller
     */
    updateProjectiles(dt) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.update(dt, this.enemies);
            
            if (!proj.alive) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    /**
     * Wave başlatır
     */
    startWave() {
        this.currentWave++;
        this.state = 'playing';
        this.showMessage(`Wave ${this.currentWave}`, '#ffd700');
        this.waveManager.generateWave(this.currentWave);
    }
    
    /**
     * Wave bitirir
     */
    endWave() {
        if (this.currentWave >= this.maxWaves) {
            this.state = 'victory';
            this.showMessage('🏆 ZAFER! 🏆', '#ffd700', 10000);
            return;
        }
        
        this.state = 'preparing';
        this.prepTimeRemaining = CONFIG.WAVE.BASE_PREP_TIME +
                                 (this.currentWave * CONFIG.WAVE.PREP_TIME_INCREMENT / 2);
        this.showMessage(`Wave ${this.currentWave} tamamlandı!`, '#00ff00');
    }
    
    /**
     * Kule yerleştirir
     */
    placeTower(col, row, towerType) {
        const cfg = CONFIG.TOWERS[towerType];
        if (!cfg) return false;
        
        if (this.gold < cfg.cost) {
            this.showMessage('Yetersiz altın!', '#ff6b6b');
            return false;
        }
        
        const tower = new Tower(towerType, col, row);
        if (!this.grid.placeTower(col, row, tower)) {
            return false;
        }
        
        this.gold -= cfg.cost;
        this.towers.push(tower);
        this.showMessage(`${cfg.name} yerleştirildi!`, '#00ff00');
        
        return true;
    }
    
    /**
     * UI günceller
     */
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
    }
    
    /**
     * Mesaj gösterir
     */
    showMessage(message, color = '#fff', duration = 2000) {
        this.currentMessage = { text: message, color };
        if (this.messageTimeout) clearTimeout(this.messageTimeout);
        this.messageTimeout = setTimeout(() => {
            this.currentMessage = null;
        }, duration);
    }
    
    /**
     * Oyunu çizer
     */
    render() {
        this.renderer.clear();
        this.renderer.drawBackground();
        this.renderer.drawGrid(this.grid);
        
        // Kuleler
        for (const tower of this.towers) {
            tower.render(this.ctx);
        }
        
        // Düşmanlar
        for (const enemy of this.enemies) {
            enemy.render(this.ctx);
        }
        
        // Mermiler
        for (const proj of this.projectiles) {
            proj.render(this.ctx);
        }
        
        // Önizleme
        const preview = this.input.getPreviewInfo();
        if (preview) {
            this.renderer.drawRangePreview(preview.col, preview.row, preview.range, preview.isValid);
            this.renderer.drawTowerPreview(preview.col, preview.row, preview.towerType, preview.isValid);
        }
        
        // Hazırlık sayacı
        if (this.state === 'preparing' && this.prepTimeRemaining > 0) {
            this.renderer.drawPrepTimer(this.prepTimeRemaining);
        }
        
        // Kalan düşman
        if (this.state === 'playing') {
            this.renderer.drawEnemyCount(this.waveManager.getRemainingCount());
        }
        
        // Mesaj
        if (this.currentMessage) {
            this.renderer.drawMessage(this.currentMessage.text, this.currentMessage.color);
        }
        
        // FPS
        this.renderer.drawFPS(this.fps);
    }
    
    /**
     * Oyunu sıfırlar
     */
    restart() {
        this.gold = CONFIG.GAME.STARTING_GOLD;
        this.lives = CONFIG.GAME.STARTING_LIVES;
        this.currentWave = 0;
        this.prepTimeRemaining = CONFIG.WAVE.BASE_PREP_TIME;
        
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        
        this.waveManager.clear();
        
        if (this.currentMap) {
            this.grid.loadMap(this.currentMap);
        }
        
        this.state = 'preparing';
        this.input.deselectTower();
        this.updateUI();
    }
}
