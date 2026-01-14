/**
 * Tower Defense - Projectile Class
 * Mermi entity'si
 * @version 1.0.0
 */

class Projectile {
    constructor(tower, targetEnemy) {
        this.id = Utils.generateId();
        this.tower = tower;
        this.towerType = tower.type;
        this.targetEnemy = targetEnemy;
        
        // Pozisyon
        this.x = tower.x;
        this.y = tower.y;
        
        // Özellikler
        this.speed = tower.config.projectileSpeed * CONFIG.GRID.CELL_SIZE;
        this.damage = tower.damage;
        this.color = tower.config.projectileColor;
        
        // Özel efektler
        this.slowAmount = tower.config.slowAmount || null;
        this.slowDuration = tower.config.slowDuration || 0;
        this.splashRadius = tower.config.splashRadius || 0;
        this.burnDamage = tower.config.burnDamage || 0;
        this.burnDuration = tower.config.burnDuration || 0;
        this.chainCount = tower.config.chainCount || 0;
        
        // Durum
        this.alive = true;
        this.chainedEnemies = new Set();
    }
    
    /**
     * Mermiyi günceller
     */
    update(deltaTime, enemies) {
        if (!this.alive) return;
        
        // Hedef öldüyse veya yoksa mermiyi yok et
        if (!this.targetEnemy || !this.targetEnemy.alive) {
            this.alive = false;
            return;
        }
        
        // Hedefe doğru hareket
        const dx = this.targetEnemy.x - this.x;
        const dy = this.targetEnemy.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 10) {
            // Hedefe ulaştı
            this.hit(enemies);
        } else {
            // Hareket et
            const moveSpeed = this.speed * deltaTime;
            this.x += (dx / dist) * moveSpeed;
            this.y += (dy / dist) * moveSpeed;
        }
    }
    
    /**
     * Hedefe vurur
     */
    hit(enemies) {
        if (!this.targetEnemy) return;
        
        // Ana hasar
        this.targetEnemy.takeDamage(this.damage);
        
        // Yavaşlatma
        if (this.slowAmount) {
            this.targetEnemy.applySlow(this.slowAmount, this.slowDuration);
        }
        
        // Yanma
        if (this.burnDamage > 0) {
            this.targetEnemy.applyBurn(this.burnDamage, this.burnDuration);
        }
        
        // Alan hasarı
        if (this.splashRadius > 0) {
            this.applySplashDamage(enemies);
        }
        
        // Zincir vuruş
        if (this.chainCount > 0 && this.chainedEnemies.size < this.chainCount) {
            this.chainToNextEnemy(enemies);
            return; // Mermi hala aktif
        }
        
        this.alive = false;
    }
    
    /**
     * Alan hasarı uygular
     */
    applySplashDamage(enemies) {
        const splashRange = this.splashRadius * CONFIG.GRID.CELL_SIZE;
        const splashDamage = this.damage * 0.5;
        
        for (const enemy of enemies) {
            if (enemy === this.targetEnemy || !enemy.alive) continue;
            
            const dist = Utils.distance(this.targetEnemy.x, this.targetEnemy.y, enemy.x, enemy.y);
            if (dist <= splashRange) {
                enemy.takeDamage(splashDamage);
            }
        }
    }
    
    /**
     * Sonraki düşmana zincirler
     */
    chainToNextEnemy(enemies) {
        this.chainedEnemies.add(this.targetEnemy.id);
        
        // En yakın zincirlenmemiş düşmanı bul
        let closestEnemy = null;
        let closestDist = Infinity;
        const chainRange = 3 * CONFIG.GRID.CELL_SIZE;
        
        for (const enemy of enemies) {
            if (!enemy.alive || this.chainedEnemies.has(enemy.id)) continue;
            
            const dist = Utils.distance(this.targetEnemy.x, this.targetEnemy.y, enemy.x, enemy.y);
            if (dist <= chainRange && dist < closestDist) {
                closestDist = dist;
                closestEnemy = enemy;
            }
        }
        
        if (closestEnemy) {
            this.targetEnemy = closestEnemy;
            // Zincir hasarı azalır
            this.damage = Math.floor(this.damage * 0.7);
        } else {
            this.alive = false;
        }
    }
    
    /**
     * Mermiyi çizer
     */
    render(ctx) {
        if (!this.alive) return;
        
        // Ana mermi
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Parıltı
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(this.x - 1, this.y - 1, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Tesla zincir efekti
        if (this.chainCount > 0 && this.chainedEnemies.size > 0) {
            ctx.strokeStyle = '#bf5fff';
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.targetEnemy.x, this.targetEnemy.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
}
