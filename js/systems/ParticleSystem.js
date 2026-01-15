/**
 * Tower Defense - Particle System
 * Görsel efektler için parçacık sistemi
 */

class Particle {
    constructor(x, y, config) {
        this.x = x;
        this.y = y;
        this.vx = config.vx || (Math.random() - 0.5) * 4;
        this.vy = config.vy || (Math.random() - 0.5) * 4;
        this.size = config.size || 4;
        this.color = config.color || '#fff';
        this.life = config.life || 1;
        this.maxLife = this.life;
        this.gravity = config.gravity || 0;
        this.friction = config.friction || 0.98;
        this.shrink = config.shrink !== false;
        this.fade = config.fade !== false;
    }
    
    update(dt) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.life -= dt;
    }
    
    render(ctx) {
        const alpha = this.fade ? this.life / this.maxLife : 1;
        const size = this.shrink ? this.size * (this.life / this.maxLife) : this.size;
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.5, size), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    
    get alive() { return this.life > 0; }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (!this.particles[i].alive) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        for (const p of this.particles) {
            p.render(ctx);
        }
    }
    
    // ==================== EFEKT TÜRLERİ ====================
    
    /** Patlama efekti */
    explosion(x, y, color = '#ff6600', count = 15) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
            const speed = 2 + Math.random() * 3;
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 3,
                color: color,
                life: 0.4 + Math.random() * 0.3,
                gravity: 0.1,
                friction: 0.95
            }));
        }
    }
    
    /** Düşman ölüm efekti */
    enemyDeath(x, y, color = '#ff0000') {
        // Kan parçacıkları
        for (let i = 0; i < 12; i++) {
            this.particles.push(new Particle(x, y, {
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                size: 2 + Math.random() * 3,
                color: color,
                life: 0.5 + Math.random() * 0.3,
                gravity: 0.15,
                friction: 0.92
            }));
        }
    }
    
    /** Buz efekti */
    ice(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(x, y, {
                vx: (Math.random() - 0.5) * 3,
                vy: -1 - Math.random() * 2,
                size: 2 + Math.random() * 2,
                color: ['#87CEEB', '#E0FFFF', '#B0E0E6'][Math.floor(Math.random() * 3)],
                life: 0.6 + Math.random() * 0.3,
                gravity: -0.02,
                friction: 0.98
            }));
        }
    }
    
    /** Ateş efekti */
    fire(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(x, y, {
                vx: (Math.random() - 0.5) * 2,
                vy: -2 - Math.random() * 2,
                size: 3 + Math.random() * 3,
                color: ['#ff4500', '#ff6600', '#ffcc00'][Math.floor(Math.random() * 3)],
                life: 0.4 + Math.random() * 0.2,
                gravity: -0.05,
                friction: 0.96
            }));
        }
    }
    
    /** Elektrik efekti */
    electric(x, y) {
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 10 + Math.random() * 15;
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                size: 2 + Math.random() * 2,
                color: ['#00ffff', '#ffffff', '#ffff00'][Math.floor(Math.random() * 3)],
                life: 0.2 + Math.random() * 0.15,
                friction: 0.9
            }));
        }
    }
    
    /** Rüzgar efekti */
    wind(x, y) {
        for (let i = 0; i < 5; i++) {
            this.particles.push(new Particle(x, y, {
                vx: 2 + Math.random() * 3,
                vy: (Math.random() - 0.5) * 2,
                size: 2 + Math.random() * 2,
                color: 'rgba(255,255,255,0.6)',
                life: 0.5 + Math.random() * 0.3,
                friction: 0.99
            }));
        }
    }
    
    /** Toprak/Kaya efekti */
    earth(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(x, y, {
                vx: (Math.random() - 0.5) * 4,
                vy: -2 - Math.random() * 3,
                size: 3 + Math.random() * 4,
                color: ['#8B4513', '#A0522D', '#6B4423'][Math.floor(Math.random() * 3)],
                life: 0.6 + Math.random() * 0.3,
                gravity: 0.2,
                friction: 0.9
            }));
        }
    }
    
    /** Altın toplama efekti */
    gold(x, y) {
        for (let i = 0; i < 6; i++) {
            this.particles.push(new Particle(x, y, {
                vx: (Math.random() - 0.5) * 2,
                vy: -2 - Math.random() * 1.5,
                size: 2 + Math.random() * 2,
                color: '#ffd700',
                life: 0.5 + Math.random() * 0.2,
                gravity: -0.03,
                friction: 0.97
            }));
        }
    }
    
    /** Kalkan efekti */
    shield(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                size: 3,
                color: '#00bfff',
                life: 0.4,
                friction: 0.95
            }));
        }
    }
    
    /** Işınlanma efekti */
    teleport(x, y) {
        for (let i = 0; i < 12; i++) {
            this.particles.push(new Particle(x, y, {
                vx: (Math.random() - 0.5) * 1,
                vy: -3 - Math.random() * 2,
                size: 2 + Math.random() * 2,
                color: ['#ff00ff', '#ff66ff', '#ffffff'][Math.floor(Math.random() * 3)],
                life: 0.6 + Math.random() * 0.3,
                gravity: -0.02,
                friction: 0.98
            }));
        }
    }
    
    clear() {
        this.particles = [];
    }
}

// Global instance
const particleSystem = new ParticleSystem();
