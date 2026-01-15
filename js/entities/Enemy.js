/**
 * Tower Defense - Enemy Class
 * Düşman entity'si
 * @version 1.3.0
 */

class Enemy {
    constructor(type, path, waveNumber, difficulty = null) {
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
        
        // Element
        this.element = cfg.element || 'neutral';
        
        // Dirençler
        this.slowResist = cfg.slowResist || 0;
        this.stunResist = cfg.stunResist || 0;
        this.burnImmune = cfg.burnImmune || false;
        
        // Başlangıç pozisyonu
        const startPos = path[0];
        this.x = startPos.col * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2;
        this.y = startPos.row * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2;
        
        // Zorluk çarpanları
        const healthMult = difficulty?.enemyHealthMult || 1.0;
        const speedMult = difficulty?.enemySpeedMult || 1.0;
        const goldMult = difficulty?.goldMult || 1.0;
        
        // Wave'e göre güçlendirme + zorluk
        const scaleFactor = 1 + (waveNumber - 1) * 0.15;
        this.maxHealth = Math.floor(cfg.health * scaleFactor * healthMult);
        this.health = this.maxHealth;
        this.baseSpeed = cfg.speed * CONFIG.GRID.CELL_SIZE * speedMult;
        this.speed = this.baseSpeed;
        this.reward = Math.floor(cfg.reward * scaleFactor * goldMult);
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
        this.stunTimer = 0;
        this.knockbackX = 0;
        this.knockbackY = 0;
        
        // Boss özellikleri
        this.isBoss = cfg.isBoss || false;
        this.bossAbility = cfg.bossAbility || null;
        this.abilityTimer = 0;
        this.shieldActive = false;
        this.shieldTimer = 0;
        this.splitOnDeath = cfg.bossAbility === 'split';
        this.splitCount = cfg.splitCount || 0;
        this.splitType = cfg.splitType || null;
        this.teleportCooldown = cfg.teleportCooldown || 10000;
        this.shieldCooldown = cfg.shieldCooldown || 8000;
        this.shieldDuration = cfg.shieldDuration || 3000;
        
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
        
        // Shield timer
        if (this.shieldActive) {
            this.shieldTimer -= deltaTime * 1000;
            if (this.shieldTimer <= 0) {
                this.shieldActive = false;
            }
        }
        
        // Boss yetenek timer
        if (this.isBoss && this.bossAbility) {
            this.abilityTimer -= deltaTime * 1000;
            if (this.abilityTimer <= 0) {
                this.useBossAbility();
            }
        }
        
        // Stun efekti - hareket etme
        if (this.stunTimer > 0) {
            this.stunTimer -= deltaTime * 1000;
            return;
        }
        
        // Yavaşlama efekti
        if (this.slowTimer > 0) {
            this.slowTimer -= deltaTime * 1000;
            if (this.slowTimer <= 0) {
                this.slowAmount = 1;
            }
        }
        
        // Yanma hasarı
        if (this.burnTimer > 0 && !this.burnImmune) {
            this.burnTimer -= deltaTime * 1000;
            this.takeDamage(this.burnDamage * deltaTime);
        }
        
        // Knockback
        if (this.knockbackX !== 0 || this.knockbackY !== 0) {
            this.x += this.knockbackX * deltaTime * 100;
            this.y += this.knockbackY * deltaTime * 100;
            this.knockbackX *= 0.9;
            this.knockbackY *= 0.9;
            if (Math.abs(this.knockbackX) < 0.1) this.knockbackX = 0;
            if (Math.abs(this.knockbackY) < 0.1) this.knockbackY = 0;
        }
        
        // Hareket
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 2) {
            this.updateTarget();
        } else {
            const moveSpeed = this.baseSpeed * this.slowAmount * deltaTime;
            this.x += (dx / dist) * moveSpeed;
            this.y += (dy / dist) * moveSpeed;
        }
    }
    
    /**
     * Hasar alır (element çarpanı ile)
     */
    takeDamage(amount, attackerElement = 'neutral') {
        // Shield aktifse hasar alma
        if (this.shieldActive) {
            return { damage: 0, multiplier: 0, blocked: true };
        }
        
        // Element çarpanı uygula
        const multiplier = CONFIG.DAMAGE_MATRIX[attackerElement]?.[this.element] || 1.0;
        const finalDamage = amount * multiplier;
        
        this.health -= finalDamage;
        if (this.health <= 0) {
            this.health = 0;
            this.alive = false;
        }
        
        return { damage: finalDamage, multiplier };
    }
    
    /**
     * Yavaşlatma uygular
     */
    applySlow(amount, duration) {
        // Slow resist uygula
        const effectiveAmount = amount + (1 - amount) * this.slowResist;
        this.slowAmount = Math.min(this.slowAmount, effectiveAmount);
        this.slowTimer = Math.max(this.slowTimer, duration * (1 - this.slowResist));
    }
    
    /**
     * Genel efekt uygulama (yetenekler için)
     */
    applyEffect(type, amount, duration) {
        switch (type) {
            case 'slow':
                this.applySlow(amount, duration);
                break;
            case 'burn':
                this.applyBurn(amount, duration);
                break;
            case 'stun':
                this.applyStun(duration);
                break;
        }
    }
    
    /**
     * Yanma uygular
     */
    applyBurn(damagePerSecond, duration) {
        if (this.burnImmune) return;
        this.burnDamage = damagePerSecond;
        this.burnTimer = duration;
    }
    
    /**
     * Sersemletme uygular
     */
    applyStun(duration) {
        const effectiveDuration = duration * (1 - this.stunResist);
        if (effectiveDuration > 0) {
            this.stunTimer = Math.max(this.stunTimer, effectiveDuration);
        }
    }
    
    /**
     * Geri itme uygular
     */
    applyKnockback(fromX, fromY, force) {
        const dx = this.x - fromX;
        const dy = this.y - fromY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            this.knockbackX = (dx / dist) * force;
            this.knockbackY = (dy / dist) * force;
        }
    }
    
    // ==================== BOSS YETENEKLERİ ====================
    
    useBossAbility() {
        switch (this.bossAbility) {
            case 'shield':
                this.activateShield();
                this.abilityTimer = this.shieldCooldown;
                break;
            case 'teleport':
                this.teleportForward();
                this.abilityTimer = this.teleportCooldown;
                break;
            // split ölünce tetiklenir, timer ile değil
        }
    }
    
    activateShield() {
        this.shieldActive = true;
        this.shieldTimer = this.shieldDuration;
    }
    
    teleportForward() {
        // Path'te 3-5 adım ileri ışınlan
        const jumpSteps = Math.min(4, this.path.length - this.pathIndex - 1);
        if (jumpSteps > 0) {
            this.pathIndex += jumpSteps;
            const newPos = this.path[this.pathIndex];
            this.x = newPos.col * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2;
            this.y = newPos.row * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2;
            this.updateTarget();
        }
    }
    
    /**
     * Bölünme - öldüğünde çağrılır, yeni düşmanlar döndürür
     */
    getSplitEnemies() {
        if (!this.splitOnDeath || !this.splitType || this.splitCount <= 0) {
            return [];
        }
        
        const splits = [];
        for (let i = 0; i < this.splitCount; i++) {
            splits.push({
                type: this.splitType,
                pathIndex: Math.max(0, this.pathIndex - 1),
                x: this.x + (Math.random() - 0.5) * 20,
                y: this.y + (Math.random() - 0.5) * 20
            });
        }
        return splits;
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
        
        // Shield efekti (gövdeden önce)
        if (this.shieldActive) {
            ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size + 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#00bfff';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        // Gövde
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Boss taç işareti
        if (this.isBoss) {
            ctx.fillStyle = '#ffd700';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('👑', this.x, this.y - this.size - 12);
        }
        
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
        if (this.slowTimer <= 0 && this.burnTimer <= 0 && !this.shieldActive) {
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
