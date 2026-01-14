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
        
        if (this.selectedTowerType) {
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
                this.game.showMessage('Buraya kule konulamaz!', '#ff6b6b');
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
