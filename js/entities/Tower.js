/**
 * Tower Defense - Tower Class
 * Kule entity'si
 * @version 1.3.0
 */

class Tower {
    constructor(type, col, row) {
        const cfg = CONFIG.TOWERS[type];
        if (!cfg) {
            console.error(`Geçersiz kule tipi: ${type}`);
            return;
        }
        
        this.id = Utils.generateId();
        this.type = type;
        this.config = cfg;
        this.col = col;
        this.row = row;
        
        // Piksel pozisyonu
        this.x = col * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2;
        this.y = row * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2;
        
        // Element
        this.element = cfg.element || 'neutral';
        
        // Özellikler
        this.damage = cfg.damage;
        this.range = cfg.range;
        this.fireRate = cfg.fireRate;
        this.lastFireTime = 0;
        
        // Hedef
        this.targetEnemy = null;
        this.angle = 0;
        
        // Upgrade seviyesi
        this.level = 1;
        this.maxLevel = 3;
    }
    
    /**
     * Menzildeki düşmanları bulur
     */
    findEnemiesInRange(enemies) {
        const rangePixels = this.range * CONFIG.GRID.CELL_SIZE;
        const inRange = [];
        
        for (const enemy of enemies) {
            if (!enemy.alive) continue;
            const dist = Utils.distance(this.x, this.y, enemy.x, enemy.y);
            if (dist <= rangePixels) {
                inRange.push({ enemy, distance: dist });
            }
        }
        
        return inRange;
    }
    
    /**
     * En uygun hedefi seçer
     */
    selectTarget(enemies) {
        const inRange = this.findEnemiesInRange(enemies);
        
        if (inRange.length === 0) {
            this.targetEnemy = null;
            return null;
        }
        
        // Hedefe en yakın olanı seç (path'te en ileride olan)
        inRange.sort((a, b) => b.enemy.pathIndex - a.enemy.pathIndex);
        this.targetEnemy = inRange[0].enemy;
        
        // Açıyı güncelle
        this.angle = Utils.angleBetween(this.x, this.y, this.targetEnemy.x, this.targetEnemy.y);
        
        return this.targetEnemy;
    }
    
    /**
     * Ateş edebilir mi kontrol eder
     */
    canFire(currentTime) {
        return currentTime - this.lastFireTime >= this.fireRate;
    }
    
    /**
     * Ateş eder
     */
    fire(currentTime) {
        if (!this.targetEnemy || !this.targetEnemy.alive) return null;
        
        this.lastFireTime = currentTime;
        soundManager.play('shoot');
        
        // Mermi oluştur
        return new Projectile(this, this.targetEnemy);
    }
    
    /**
     * Kuleyi günceller
     */
    update(deltaTime, enemies, currentTime) {
        // Hedef seç
        this.selectTarget(enemies);
        
        // Ateş et
        if (this.targetEnemy && this.canFire(currentTime)) {
            return this.fire(currentTime);
        }
        
        return null;
    }
    
    /**
     * Kuleyi yükseltir
     */
    upgrade() {
        if (this.level >= this.maxLevel) return false;
        
        this.level++;
        
        // Seviye bonusları: Lv2 = +30%, Lv3 = +60%
        const damageMultiplier = 1 + (this.level - 1) * 0.30;
        const rangeMultiplier = 1 + (this.level - 1) * 0.15;
        const fireRateMultiplier = 1 - (this.level - 1) * 0.12;
        
        this.damage = Math.floor(this.config.damage * damageMultiplier);
        this.range = this.config.range * rangeMultiplier;
        this.fireRate = Math.floor(this.config.fireRate * fireRateMultiplier);
        
        return true;
    }
    
    /**
     * Yükseltme maliyetini hesaplar
     */
    getUpgradeCost() {
        if (this.level >= this.maxLevel) return null;
        
        // Lv2: %75, Lv3: %100 kule fiyatı
        const costMultiplier = this.level === 1 ? 0.75 : 1.0;
        return Math.floor(this.config.cost * costMultiplier);
    }
    
    /**
     * Satış fiyatını hesaplar (zorluk bazlı)
     */
    getSellPrice(difficulty = null) {
        // Toplam harcanan: Kule fiyatı + upgrade maliyetleri
        let totalSpent = this.config.cost;
        if (this.level >= 2) totalSpent += Math.floor(this.config.cost * 0.75);
        if (this.level >= 3) totalSpent += this.config.cost;
        
        // Zorluk bazlı geri kazanım
        let refundRate = 0.75; // Default orta
        if (difficulty) {
            if (difficulty.id === 'easy') refundRate = 1.0;
            else if (difficulty.id === 'normal') refundRate = 0.75;
            else if (difficulty.id === 'hard') refundRate = 0.5;
        }
        
        return Math.floor(totalSpent * refundRate);
    }
    
    /**
     * Kule bilgilerini döndürür
     */
    getInfo(difficulty = null) {
        return {
            name: this.config.name,
            icon: this.config.icon,
            level: this.level,
            maxLevel: this.maxLevel,
            damage: this.damage,
            range: this.range.toFixed(1),
            fireRate: (this.fireRate / 1000).toFixed(1) + 's',
            element: this.element,
            upgradeCost: this.getUpgradeCost(),
            sellPrice: this.getSellPrice(difficulty)
        };
    }
    
    /**
     * Kuleyi çizer
     */
    render(ctx) {
        const size = CONFIG.GRID.CELL_SIZE;
        
        // Taban
        ctx.fillStyle = this.config.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size / 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Kenar
        ctx.strokeStyle = Utils.darkenColor(this.config.color, 20);
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Seviye göstergesi
        if (this.level > 1) {
            ctx.fillStyle = '#ffd700';
            for (let i = 0; i < this.level - 1; i++) {
                ctx.beginPath();
                ctx.arc(this.x - 8 + i * 8, this.y + size / 3, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // İkon
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.config.icon, this.x, this.y);
    }
    
    /**
     * Menzil önizlemesi çizer
     */
    renderRange(ctx, isValid = true) {
        const rangePixels = this.range * CONFIG.GRID.CELL_SIZE;
        
        ctx.fillStyle = isValid ? CONFIG.COLORS.RANGE_VALID : CONFIG.COLORS.RANGE_INVALID;
        ctx.beginPath();
        ctx.arc(this.x, this.y, rangePixels, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = isValid ? 'rgba(0,255,0,0.5)' : 'rgba(255,0,0,0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}
