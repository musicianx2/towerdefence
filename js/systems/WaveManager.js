/**
 * Tower Defense - Wave Manager
 * Dalga yönetim sistemi
 * @version 1.0.0
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
        
        // Base düşman sayısı
        const baseCount = CONFIG.WAVE.BASE_ENEMY_COUNT + 
                         (waveNumber - 1) * CONFIG.WAVE.ENEMY_INCREMENT;
        
        for (let i = 0; i < baseCount; i++) {
            let enemyType = this.selectEnemyType(waveNumber, i, baseCount);
            this.spawnQueue.push(enemyType);
        }
        
        this.spawnTimer = 0;
        this.waveActive = true;
        
        if (CONFIG.DEBUG.LOG_EVENTS) {
            console.log(`Wave ${waveNumber}: ${this.spawnQueue.length} düşman hazırlandı`);
            console.log('Kuyruk:', this.spawnQueue);
        }
    }
    
    /**
     * Wave'e ve pozisyona göre düşman tipi seçer
     */
    selectEnemyType(waveNumber, index, totalCount) {
        const isLast = index === totalCount - 1;
        const random = Math.random();
        
        // Boss wave'leri (her 5 wave'de)
        if (waveNumber >= 5 && waveNumber % 5 === 0 && isLast) {
            return 'boss';
        }
        
        // Wave 10+ son düşman boss
        if (waveNumber >= 10 && isLast) {
            return 'boss';
        }
        
        // Wave 8+ tank şansı
        if (waveNumber >= 8 && random < 0.25) {
            return 'tank';
        }
        
        // Wave 5+ tank ve fast şansı
        if (waveNumber >= 5) {
            if (random < 0.2) return 'tank';
            if (random < 0.45) return 'fast';
        }
        
        // Wave 3+ fast şansı
        if (waveNumber >= 3 && random < 0.3) {
            return 'fast';
        }
        
        return 'basic';
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
        const enemy = new Enemy(enemyType, path, this.game.currentWave);
        
        this.game.enemies.push(enemy);
        
        if (CONFIG.DEBUG.LOG_EVENTS) {
            console.log(`Spawn: ${enemy.config.name} (${this.spawnQueue.length} kaldı)`);
        }
    }
    
    /**
     * Wave tamamlandı mı kontrol eder
     */
    isWaveComplete() {
        return this.spawnQueue.length === 0 && this.game.enemies.length === 0;
    }
    
    /**
     * Spawn hızını ayarlar
     */
    setSpawnDelay(delay) {
        this.spawnDelay = delay;
    }
    
    /**
     * Kalan düşman sayısını döndürür
     */
    getRemainingCount() {
        return this.spawnQueue.length + this.game.enemies.length;
    }
    
    /**
     * Wave'i temizler
     */
    clear() {
        this.spawnQueue = [];
        this.spawnTimer = 0;
        this.waveActive = false;
    }
}
