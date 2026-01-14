/**
 * Tower Defense - Wave Manager
 * Element bazlı dalga yönetim sistemi
 * @version 1.3.0
 */

class WaveManager {
    constructor(game) {
        this.game = game;
        this.spawnQueue = [];
        this.spawnTimer = 0;
        this.spawnDelay = CONFIG.WAVE.SPAWN_DELAY;
        this.waveActive = false;
    }
    
    /**
     * Wave için düşman listesi oluşturur
     */
    generateWave(waveNumber) {
        this.spawnQueue = [];
        
        const map = this.game.currentMap;
        const maxWaves = map?.maxWaves || 15;
        
        // Base düşman sayısı (harita zorluğuna göre artar)
        const baseCount = CONFIG.WAVE.BASE_ENEMY_COUNT + 
                         (waveNumber - 1) * CONFIG.WAVE.ENEMY_INCREMENT;
        
        // Haritanın element ağırlıkları
        const weights = map?.elementWeights || { neutral: 100 };
        const enemyTypes = map?.enemyTypes || ['basic', 'fast', 'tank', 'boss'];
        
        for (let i = 0; i < baseCount; i++) {
            let enemyType = this.selectEnemyType(waveNumber, i, baseCount, weights, enemyTypes, maxWaves);
            this.spawnQueue.push(enemyType);
        }
        
        // Kuyruğu karıştır (boss hariç)
        this.shuffleQueue();
        
        this.spawnTimer = 0;
        this.waveActive = true;
        
        if (CONFIG.DEBUG.LOG_EVENTS) {
            console.log(`Wave ${waveNumber}: ${this.spawnQueue.length} düşman`);
        }
    }
    
    /**
     * Wave'e ve harita elementine göre düşman tipi seçer
     */
    selectEnemyType(waveNumber, index, totalCount, weights, allowedTypes, maxWaves) {
        const isLast = index === totalCount - 1;
        const progress = waveNumber / maxWaves; // 0-1 arası ilerleme
        
        // Boss wave'leri
        if (this.shouldSpawnBoss(waveNumber, isLast, maxWaves)) {
            return this.selectBossType(allowedTypes);
        }
        
        // Element seç
        const element = this.selectElement(weights);
        
        // Bu elemente ait düşmanları filtrele
        const eligibleEnemies = allowedTypes.filter(type => {
            const cfg = CONFIG.ENEMIES[type];
            if (!cfg) return false;
            if (cfg.powerLevel >= 4) return false; // Boss'ları hariç tut
            return cfg.element === element;
        });
        
        // Eğer bu elementte düşman yoksa neutral kullan
        if (eligibleEnemies.length === 0) {
            return this.selectNeutralEnemy(waveNumber, allowedTypes);
        }
        
        // Wave ilerledikçe güçlü düşman şansı artar
        return this.selectByPower(eligibleEnemies, progress);
    }
    
    /**
     * Element ağırlıklarına göre element seçer
     */
    selectElement(weights) {
        const total = Object.values(weights).reduce((a, b) => a + b, 0);
        let random = Math.random() * total;
        
        for (const [element, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) return element;
        }
        
        return 'neutral';
    }
    
    /**
     * Boss spawn edilmeli mi?
     */
    shouldSpawnBoss(waveNumber, isLast, maxWaves) {
        // Son wave her zaman boss
        if (waveNumber === maxWaves && isLast) return true;
        
        // Her 5 wave'de boss
        if (waveNumber >= 5 && waveNumber % 5 === 0 && isLast) return true;
        
        // Wave 10+ son düşman boss şansı
        if (waveNumber >= 10 && isLast && Math.random() < 0.5) return true;
        
        return false;
    }
    
    /**
     * İzin verilen boss tipini seçer
     */
    selectBossType(allowedTypes) {
        const bosses = allowedTypes.filter(type => {
            const cfg = CONFIG.ENEMIES[type];
            return cfg && cfg.powerLevel >= 4;
        });
        
        if (bosses.length === 0) return 'boss'; // Fallback
        return bosses[Math.floor(Math.random() * bosses.length)];
    }
    
    /**
     * Neutral düşman seçer
     */
    selectNeutralEnemy(waveNumber, allowedTypes) {
        const neutrals = allowedTypes.filter(type => {
            const cfg = CONFIG.ENEMIES[type];
            return cfg && cfg.element === 'neutral' && cfg.powerLevel < 4;
        });
        
        if (neutrals.length === 0) return 'basic';
        
        // Wave'e göre güçlü düşman şansı
        if (waveNumber >= 8 && Math.random() < 0.3 && neutrals.includes('tank')) {
            return 'tank';
        }
        if (waveNumber >= 3 && Math.random() < 0.4 && neutrals.includes('fast')) {
            return 'fast';
        }
        
        return neutrals[Math.floor(Math.random() * neutrals.length)];
    }
    
    /**
     * Güç seviyesine göre düşman seçer
     */
    selectByPower(enemies, progress) {
        // İlerlemeye göre güçlü düşman şansı
        const powerThreshold = Math.random();
        
        if (progress > 0.7 && powerThreshold < 0.4) {
            // Güçlü düşman tercih et
            const strong = enemies.filter(t => CONFIG.ENEMIES[t]?.powerLevel >= 2);
            if (strong.length > 0) return strong[Math.floor(Math.random() * strong.length)];
        }
        
        if (progress > 0.4 && powerThreshold < 0.3) {
            const medium = enemies.filter(t => CONFIG.ENEMIES[t]?.powerLevel >= 1);
            if (medium.length > 0) return medium[Math.floor(Math.random() * medium.length)];
        }
        
        return enemies[Math.floor(Math.random() * enemies.length)];
    }
    
    /**
     * Kuyruğu karıştırır (boss en sonda kalır)
     */
    shuffleQueue() {
        // Boss'ları ayır
        const bosses = [];
        const others = [];
        
        for (const type of this.spawnQueue) {
            if (CONFIG.ENEMIES[type]?.powerLevel >= 4) {
                bosses.push(type);
            } else {
                others.push(type);
            }
        }
        
        // Diğerlerini karıştır
        for (let i = others.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [others[i], others[j]] = [others[j], others[i]];
        }
        
        // Boss'ları sona ekle
        this.spawnQueue = [...others, ...bosses];
    }
    
    /**
     * Wave'i günceller
     */
    update(deltaTime) {
        if (this.spawnQueue.length === 0) {
            this.waveActive = false;
            return;
        }
        
        this.spawnTimer += deltaTime * 1000;
        
        if (this.spawnTimer >= this.spawnDelay) {
            this.spawnTimer = 0;
            this.spawnNextEnemy();
        }
    }
    
    /**
     * Sıradaki düşmanı spawn eder
     */
    spawnNextEnemy() {
        if (this.spawnQueue.length === 0) return;
        
        const enemyType = this.spawnQueue.shift();
        const path = this.game.currentMap.path;
        const difficulty = this.game.currentDifficulty;
        const enemy = new Enemy(enemyType, path, this.game.currentWave, difficulty);
        
        if (enemy.config) {
            this.game.enemies.push(enemy);
            
            if (CONFIG.DEBUG.LOG_EVENTS) {
                const elem = CONFIG.ELEMENTS[enemy.element];
                console.log(`Spawn: ${elem?.icon || ''} ${enemy.config.name}`);
            }
        }
    }
    
    isWaveComplete() {
        return this.spawnQueue.length === 0 && this.game.enemies.length === 0;
    }
    
    setSpawnDelay(delay) {
        this.spawnDelay = delay;
    }
    
    getRemainingCount() {
        return this.spawnQueue.length + this.game.enemies.length;
    }
    
    clear() {
        this.spawnQueue = [];
        this.spawnTimer = 0;
        this.waveActive = false;
    }
}
