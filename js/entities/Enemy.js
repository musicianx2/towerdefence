/**
 * Tower Defense - Enemy Class
 * Düşman entity'si
 * @version 1.0.0
 */

class Enemy {
    constructor(type, path, waveNumber) {
        const cfg = CONFIG.ENEMIES[type];
        if (!cfg) {
            console.error(`Geçersiz düşman tipi: ${type}`);
            return;
        }
        
        this.id = Utils.generateId();
        this.type = type;
        this.config = cfg;
        this.path = path;
        this.pathIndex = 0;
        
        // Başlangıç pozisyonu
        const startPos = path[0];
        this.x = startPos.col * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2;
        this.y = startPos.row * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2;
        
        // Wave'e göre güçlendirme
        const scaleFactor = 1 + (waveNumber - 1) * 0.15;
        this.maxHealth = Math.floor(cfg.health * scaleFactor);
        this.health = this.maxHealth;
        this.speed = cfg.speed * CONFIG.GRID.CELL_SIZE;
        this.reward = Math.floor(cfg.reward * scaleFactor);
        this.damage = cfg.damage;
        this.color = cfg.color;
        this.size = cfg.size;
        this.powerLevel = Math.min(6, cfg.powerLevel + Math.floor(waveNumber / 4));
        
        // Durum
        this.alive = true;
        this.reachedEnd = false;
        
        // Efektler
        this.slowAmount = 1;
        this.slowTimer = 0;
        this.burnDamage = 0;
        this.burnTimer = 0;
        
        // Hedef
        this.targetX = this.x;
        this.targetY = this.y;
        this.updateTarget();
    }
    
    /**
     * Sonraki hedef noktayı günceller
     */
    updateTarget() {
        if (this.pathIndex < this.path.length - 1) {
            this.pathIndex++;
            const target = this.path[this.pathIndex];
            this.targetX = target.col * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2;
            this.targetY = target.row * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2;
        } else {
            this.reachedEnd = true;
        }
    }
    
    /**
     * Düşmanı günceller
     */
    update(deltaTime) {
        if (!this.alive || this.reachedEnd) return;
        
        // Yavaşlama efekti
        if (this.slowTimer > 0) {
            this.slowTimer -= deltaTime * 1000;
            if (this.slowTimer <= 0) {
                this.slowAmount = 1;
            }
        }
        
        // Yanma hasarı
        if (this.burnTimer > 0) {
            this.burnTimer -= deltaTime * 1000;
            this.takeDamage(this.burnDamage * deltaTime);
        }
        
        // Hareket
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 2) {
            this.updateTarget();
        } else {
            const moveSpeed = this.speed * this.slowAmount * deltaTime;
            this.x += (dx / dist) * moveSpeed;
            this.y += (dy / dist) * moveSpeed;
        }
    }
    
    /**
     * Hasar alır
     */
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.alive = false;
        }
    }
    
    /**
     * Yavaşlatma uygular
     */
    applySlow(amount, duration) {
        this.slowAmount = amount;
        this.slowTimer = duration;
    }
    
    /**
     * Yanma uygular
     */
    applyBurn(damagePerSecond, duration) {
        this.burnDamage = damagePerSecond;
        this.burnTimer = duration;
    }
    
    /**
     * Düşmanı çizer
     */
    render(ctx) {
        if (!this.alive) return;
        
        // Gölge
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + this.size / 2, this.size * 0.8, this.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Gövde
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Yavaşlatma efekti
        if (this.slowTimer > 0) {
            ctx.strokeStyle = '#87ceeb';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        // Yanma efekti
        if (this.burnTimer > 0) {
            ctx.strokeStyle = '#ff4500';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        // Normal kenar
        if (this.slowTimer <= 0 && this.burnTimer <= 0) {
            ctx.strokeStyle = Utils.darkenColor(this.color, 30);
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Can barı
        const barWidth = this.size * 2;
        const barHeight = 4;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.size - 8;
        
        // Arka plan
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Doluluk
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#2ecc71' : 
                        healthPercent > 0.25 ? '#f1c40f' : '#e74c3c';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Güç sembolü
        const symbol = CONFIG.POWER_SYMBOLS[this.powerLevel - 1] || '•';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, this.x, this.y);
    }
}
