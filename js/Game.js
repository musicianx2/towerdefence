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
    
    startNewGame(mapId, difficulty) {
        console.log(`Yeni oyun: ${mapId}, Zorluk: ${difficulty.name}`);
        
        this.currentMapId = mapId;
        this.currentDifficulty = difficulty;
        
        const mapData = mapManager.loadMap(mapId);
        if (!mapData) return;
        
        this.currentMap = mapData;
        this.maxWaves = mapData.maxWaves || 15;
        this.themeColors = mapManager.getThemeColors(mapId);
        this.availableTowers = mapData.availableTowers || ['archer', 'cannon', 'ice'];
        
        // Zorluk ayarları
        this.gold = difficulty.startingGold;
        this.lives = difficulty.startingLives;
        this.prepTimeRemaining = difficulty.prepTime;
        this.currentWave = 0;
        
        // Temizle
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.waveManager.clear();
        
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
        
        this.state = 'preparing';
        this.updateUI();
    }
    
    gameLoop(currentTime) {
        const dt = Math.min((currentTime - this.lastFrameTime) / 1000, 0.1);
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
            } else if (!enemy.alive) {
                this.gold += enemy.reward;
                this.enemies.splice(i, 1);
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
    }
    
    endWave() {
        if (this.currentWave >= this.maxWaves) {
            this.victory();
            return;
        }
        
        this.state = 'preparing';
        this.prepTimeRemaining = this.currentDifficulty.prepTime;
        this.showMessage(`Wave ${this.currentWave} tamamlandı!`, '#00ff00');
    }
    
    victory() {
        this.state = 'victory';
        this.showMessage('🏆 ZAFER! 🏆', '#ffd700', 5000);
        
        // PlayerManager ile kaydet - haritayı tamamla
        const difficultyId = this.currentDifficulty?.id || 'normal';
        playerManager.completeMap(this.currentMapId, this.currentWave, difficultyId);
        
        console.log(`Zafer! ${this.currentMapId} tamamlandı, Wave: ${this.currentWave}`);
        
        // 5 saniye sonra menüye dön
        setTimeout(() => this.returnToMenu(), 5000);
    }
    
    gameOver() {
        this.state = 'game_over';
        this.showMessage('💀 OYUN BİTTİ 💀', '#ff0000', 5000);
        
        // Wave ilerlemesini kaydet (yenilsek bile)
        const difficultyId = this.currentDifficulty?.id || 'normal';
        playerManager.updateWaveProgress(this.currentMapId, this.currentWave, difficultyId);
        
        setTimeout(() => this.returnToMenu(), 5000);
    }
    
    returnToMenu() {
        this.state = 'menu';
        this.hideGameUI();
        this.menuManager.returnToMainMenu();
    }
    
    placeTower(col, row, towerType) {
        const cfg = CONFIG.TOWERS[towerType];
        if (!cfg || this.gold < cfg.cost) {
            this.showMessage('Yetersiz altın!', '#ff6b6b');
            return false;
        }
        
        if (!this.availableTowers.includes(towerType)) {
            this.showMessage('Bu kule bu haritada yok!', '#ff6b6b');
            return false;
        }
        
        const tower = new Tower(towerType, col, row);
        if (!this.grid.placeTower(col, row, tower)) return false;
        
        this.gold -= cfg.cost;
        this.towers.push(tower);
        this.showMessage(`${cfg.name} yerleştirildi!`, '#00ff00');
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
    }
    
    hideGameUI() {
        document.getElementById('tower-panel')?.classList.add('hidden');
        document.getElementById('confirm-menu')?.classList.add('hidden');
    }
    
    showMessage(message, color = '#fff', duration = 2000) {
        this.currentMessage = { text: message, color };
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
        
        for (const tower of this.towers) tower.render(this.ctx);
        for (const enemy of this.enemies) enemy.render(this.ctx);
        for (const proj of this.projectiles) proj.render(this.ctx);
        
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
            this.renderer.drawMessage(this.currentMessage.text, this.currentMessage.color);
        }
        
        this.renderer.drawFPS(this.fps);
    }
}
