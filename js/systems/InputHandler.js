/**
 * Tower Defense - Input Handler
 * Kullanıcı girişi yönetimi
 * @version 1.0.0
 */

class InputHandler {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.game = game;
        
        this.mousePos = { x: 0, y: 0 };
        this.gridPos = { col: -1, row: -1 };
        this.selectedTowerType = null;
        this.pendingPlacement = null;
        this.selectedTower = null; // Seçili mevcut kule
        
        this.init();
    }
    
    init() {
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseleave', () => this.gridPos = { col: -1, row: -1 });
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // Context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Tower menu
        document.querySelectorAll('.tower-option').forEach(opt => {
            opt.addEventListener('click', () => this.selectTower(opt.dataset.tower));
        });
        
        // Confirm buttons
        document.getElementById('confirm-btn')?.addEventListener('click', () => this.confirmPlacement());
        document.getElementById('cancel-btn')?.addEventListener('click', () => this.cancelPlacement());
        
        // Upgrade/Sell buttons
        document.getElementById('upgrade-btn')?.addEventListener('click', () => this.upgradeTower());
        document.getElementById('sell-btn')?.addEventListener('click', () => this.sellTower());
        document.getElementById('close-info-btn')?.addEventListener('click', () => this.closeTowerInfo());
        
        // Start button
        document.getElementById('start-wave-btn')?.addEventListener('click', () => {
            if (this.game.state === 'preparing') {
                this.game.startWave();
            }
        });
        
        // Toggle button
        document.getElementById('tower-toggle')?.addEventListener('click', () => {
            document.getElementById('tower-menu')?.classList.toggle('collapsed');
        });
        
        // Keyboard
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    getCanvasCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }
    
    handleMouseMove(e) {
        const coords = this.getCanvasCoords(e);
        this.mousePos = coords;
        const gp = Utils.pixelToGrid(coords.x, coords.y);
        if (Utils.isInBounds(gp.col, gp.row)) {
            this.gridPos = gp;
        }
    }
    
    handleMouseDown(e) {
        if (e.button !== 0) return;
        const coords = this.getCanvasCoords(e);
        
        // Menüdeyken menü click'lerini işle
        if (this.game.state === 'menu') {
            this.game.menuManager.handleClick(coords.x, coords.y);
            return;
        }
        
        this.handleClick(coords.x, coords.y);
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const coords = this.getCanvasCoords(e);
        this.mousePos = coords;
        
        // Menüdeyken menü click'lerini işle
        if (this.game.state === 'menu') {
            this.game.menuManager.handleClick(coords.x, coords.y);
            return;
        }
        
        const gp = Utils.pixelToGrid(coords.x, coords.y);
        if (Utils.isInBounds(gp.col, gp.row)) {
            this.gridPos = gp;
        }
        this.handleClick(coords.x, coords.y);
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const coords = this.getCanvasCoords(e);
        this.mousePos = coords;
        const gp = Utils.pixelToGrid(coords.x, coords.y);
        if (Utils.isInBounds(gp.col, gp.row)) {
            this.gridPos = gp;
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
    }
    
    handleKeyDown(e) {
        // Menüdeyken tuşları yoksay
        if (this.game.state === 'menu') return;
        
        switch (e.key) {
            case 'Escape':
                if (this.selectedTowerType) {
                    this.deselectTower();
                } else if (this.game.state === 'preparing' || this.game.state === 'playing') {
                    // Oyun içinde ESC = menüye dön (onay iste)
                    if (confirm('Ana menüye dönmek istiyor musun?')) {
                        this.game.returnToMenu();
                    }
                }
                break;
            case '1':
                this.selectTower('archer');
                break;
            case '2':
                this.selectTower('cannon');
                break;
            case '3':
                this.selectTower('ice');
                break;
            case 't':
            case 'T':
                document.getElementById('tower-menu')?.classList.toggle('collapsed');
                break;
            case ' ':
                e.preventDefault();
                if (this.game.state === 'preparing') {
                    this.game.startWave();
                }
                break;
        }
    }
    
    handleClick(x, y) {
        const gp = Utils.pixelToGrid(x, y);
        if (!Utils.isInBounds(gp.col, gp.row)) return;
        
        // Meteor hedef seçimi
        if (this.game.selectedAbility === 'meteor') {
            this.game.useAbility('meteor', gp.col, gp.row);
            this.game.selectedAbility = null;
            document.querySelectorAll('.ability-btn').forEach(b => b.classList.remove('selected'));
            return;
        }
        
        // Kule info menüsü açıkken başka yere tıklanınca kapat
        if (this.selectedTower && !this.selectedTowerType) {
            // Aynı kuleye mi tıkladık kontrol et
            const clickedTower = this.game.towers.find(t => t.col === gp.col && t.row === gp.row);
            if (clickedTower && clickedTower === this.selectedTower) {
                return; // Aynı kule, bir şey yapma
            }
            // Başka yere tıklandı, menüyü kapat
            this.closeTowerInfo();
        }
        
        if (this.selectedTowerType) {
            // Yeni kule yerleştirme modu
            const canPlace = this.game.grid.canPlaceTower(gp.col, gp.row);
            
            if (canPlace) {
                if (this.pendingPlacement &&
                    this.pendingPlacement.col === gp.col &&
                    this.pendingPlacement.row === gp.row) {
                    this.confirmPlacement();
                } else {
                    this.pendingPlacement = {
                        col: gp.col,
                        row: gp.row,
                        towerType: this.selectedTowerType
                    };
                    this.showConfirmMenu();
                }
            } else {
                // Mevcut kuleye mi tıkladık?
                const tower = this.game.towers.find(t => t.col === gp.col && t.row === gp.row);
                if (tower) {
                    this.deselectTower();
                    this.showTowerInfo(tower);
                } else {
                    this.game.showMessage('Buraya kule konulamaz!', '#ff6b6b');
                }
            }
        } else {
            // Mevcut kuleye tıklama - info göster
            const tower = this.game.towers.find(t => t.col === gp.col && t.row === gp.row);
            if (tower) {
                this.showTowerInfo(tower);
            }
        }
    }
    
    selectTower(towerType) {
        const cfg = CONFIG.TOWERS[towerType];
        if (!cfg) return;
        
        if (this.game.gold < cfg.cost) {
            this.game.showMessage('Yetersiz altın!', '#ff6b6b');
            return;
        }
        
        const effectiveWave = this.game.state === 'preparing' ? 
                              this.game.currentWave + 1 : this.game.currentWave;
        
        if (effectiveWave < cfg.unlockWave) {
            this.game.showMessage(`Wave ${cfg.unlockWave}'de açılır!`, '#ffaa00');
            return;
        }
        
        document.querySelectorAll('.tower-option').forEach(o => o.classList.remove('selected'));
        document.querySelector(`[data-tower="${towerType}"]`)?.classList.add('selected');
        
        this.selectedTowerType = towerType;
        this.pendingPlacement = null;
        this.hideConfirmMenu();
    }
    
    deselectTower() {
        this.selectedTowerType = null;
        this.pendingPlacement = null;
        document.querySelectorAll('.tower-option').forEach(o => o.classList.remove('selected'));
        this.hideConfirmMenu();
    }
    
    confirmPlacement() {
        if (!this.pendingPlacement) return;
        
        const { col, row, towerType } = this.pendingPlacement;
        if (this.game.placeTower(col, row, towerType)) {
            this.pendingPlacement = null;
            this.hideConfirmMenu();
        }
    }
    
    cancelPlacement() {
        this.pendingPlacement = null;
        this.hideConfirmMenu();
    }
    
    showConfirmMenu() {
        document.getElementById('confirm-menu')?.classList.remove('hidden');
    }
    
    hideConfirmMenu() {
        document.getElementById('confirm-menu')?.classList.add('hidden');
    }
    
    // ==================== TOWER INFO/UPGRADE ====================
    
    showTowerInfo(tower) {
        this.selectedTower = tower;
        const info = tower.getInfo(this.game.currentDifficulty);
        
        // UI güncelle
        document.getElementById('tower-info-icon').textContent = info.icon;
        document.getElementById('tower-info-name').textContent = info.name;
        document.getElementById('tower-info-level').textContent = `Lv.${info.level}`;
        document.getElementById('stat-damage').textContent = info.damage;
        document.getElementById('stat-range').textContent = info.range;
        document.getElementById('stat-firerate').textContent = info.fireRate;
        
        const upgradeBtn = document.getElementById('upgrade-btn');
        const upgradeCost = document.getElementById('upgrade-cost');
        
        if (info.level >= info.maxLevel) {
            upgradeBtn.disabled = true;
            upgradeCost.textContent = 'MAX';
        } else {
            const canAfford = this.game.gold >= info.upgradeCost;
            upgradeBtn.disabled = !canAfford;
            upgradeCost.textContent = `💰 ${info.upgradeCost}`;
        }
        
        document.getElementById('sell-price').textContent = info.sellPrice;
        
        // Menüyü göster
        document.getElementById('tower-info-menu')?.classList.remove('hidden');
    }
    
    closeTowerInfo() {
        this.selectedTower = null;
        document.getElementById('tower-info-menu')?.classList.add('hidden');
    }
    
    upgradeTower() {
        if (!this.selectedTower) return;
        
        const cost = this.selectedTower.getUpgradeCost();
        if (!cost || this.game.gold < cost) {
            this.game.showMessage('Yetersiz altın!', '#ff6b6b');
            return;
        }
        
        if (this.selectedTower.level >= this.selectedTower.maxLevel) {
            this.game.showMessage('Maksimum seviye!', '#ffaa00');
            return;
        }
        
        this.game.gold -= cost;
        this.selectedTower.upgrade();
        this.game.updateUI();
        this.game.showMessage(`${this.selectedTower.config.icon} Lv.${this.selectedTower.level}!`, '#4ade80');
        soundManager.play('upgrade');
        
        // Info güncelle
        this.showTowerInfo(this.selectedTower);
    }
    
    sellTower() {
        if (!this.selectedTower) return;
        
        const sellPrice = this.selectedTower.getSellPrice(this.game.currentDifficulty);
        const tower = this.selectedTower;
        
        // Grid'i boşalt
        this.game.grid.setCell(tower.col, tower.row, CONFIG.CELL_TYPES.EMPTY);
        
        // Kuleyi listeden çıkar
        const index = this.game.towers.indexOf(tower);
        if (index > -1) {
            this.game.towers.splice(index, 1);
        }
        
        // Altın ver
        this.game.gold += sellPrice;
        this.game.updateUI();
        this.game.showMessage(`+${sellPrice} 💰`, '#ffd700');
        soundManager.play('gold');
        
        this.closeTowerInfo();
    }
    
    showTowerMenu() {
        this.updateTowerMenuState();
    }
    
    updateTowerMenuState() {
        const effectiveWave = this.game.state === 'preparing' ?
                              this.game.currentWave + 1 : this.game.currentWave;
        
        document.querySelectorAll('.tower-option').forEach(opt => {
            const cfg = CONFIG.TOWERS[opt.dataset.tower];
            if (!cfg) return;
            
            const locked = effectiveWave < cfg.unlockWave;
            const poor = this.game.gold < cfg.cost;
            opt.classList.toggle('disabled', locked || poor);
        });
        
        const startBtn = document.getElementById('start-wave-btn');
        if (startBtn) {
            startBtn.classList.toggle('hidden', this.game.state !== 'preparing');
        }
    }
    
    getPreviewInfo() {
        if (!this.selectedTowerType) return null;
        if (this.gridPos.col < 0) return null;
        
        const cfg = CONFIG.TOWERS[this.selectedTowerType];
        const canPlace = this.game.grid.canPlaceTower(this.gridPos.col, this.gridPos.row);
        
        return {
            col: this.pendingPlacement ? this.pendingPlacement.col : this.gridPos.col,
            row: this.pendingPlacement ? this.pendingPlacement.row : this.gridPos.row,
            towerType: this.selectedTowerType,
            range: cfg.range,
            isValid: canPlace,
            isPending: !!this.pendingPlacement
        };
    }
}
