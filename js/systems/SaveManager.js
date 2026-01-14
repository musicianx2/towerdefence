/**
 * Tower Defense - Save Manager
 * LocalStorage ile ilerleme kaydetme
 * @version 1.0.0
 */

class SaveManager {
    constructor() {
        this.SAVE_KEY = 'td_game_progress';
        this.data = this.getDefaultData();
        this.load();
    }
    
    getDefaultData() {
        return {
            version: CONFIG.VERSION,
            unlockedMaps: ['map1'],
            completedMaps: [],
            highScores: {},
            settings: {
                difficulty: 'normal',
                musicVolume: 0.7,
                sfxVolume: 1.0
            },
            stats: {
                totalGamesPlayed: 0,
                totalWavesCompleted: 0,
                totalEnemiesKilled: 0,
                totalGoldEarned: 0
            }
        };
    }
    
    load() {
        try {
            const saved = localStorage.getItem(this.SAVE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Versiyon kontrolü - eski save'leri güncelle
                if (parsed.version !== CONFIG.VERSION) {
                    console.log('Save versiyon uyumsuz, varsayılan değerler kullanılıyor');
                    this.data = this.mergeData(this.getDefaultData(), parsed);
                } else {
                    this.data = parsed;
                }
                console.log('İlerleme yüklendi:', this.data);
            }
        } catch (e) {
            console.error('Save yükleme hatası:', e);
            this.data = this.getDefaultData();
        }
    }
    
    save() {
        try {
            this.data.version = CONFIG.VERSION;
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(this.data));
            console.log('İlerleme kaydedildi');
        } catch (e) {
            console.error('Save kaydetme hatası:', e);
        }
    }
    
    mergeData(defaultData, savedData) {
        const merged = { ...defaultData };
        if (savedData.unlockedMaps) merged.unlockedMaps = savedData.unlockedMaps;
        if (savedData.completedMaps) merged.completedMaps = savedData.completedMaps;
        if (savedData.highScores) merged.highScores = savedData.highScores;
        if (savedData.settings) merged.settings = { ...merged.settings, ...savedData.settings };
        if (savedData.stats) merged.stats = { ...merged.stats, ...savedData.stats };
        return merged;
    }
    
    // Harita kilidi açma
    unlockMap(mapId) {
        if (!this.data.unlockedMaps.includes(mapId)) {
            this.data.unlockedMaps.push(mapId);
            this.save();
            console.log(`Harita açıldı: ${mapId}`);
            return true;
        }
        return false;
    }
    
    isMapUnlocked(mapId) {
        return this.data.unlockedMaps.includes(mapId);
    }
    
    // Harita tamamlama
    completeMap(mapId, score, difficulty) {
        if (!this.data.completedMaps.includes(mapId)) {
            this.data.completedMaps.push(mapId);
        }
        
        // High score kaydet
        const key = `${mapId}_${difficulty}`;
        if (!this.data.highScores[key] || score > this.data.highScores[key]) {
            this.data.highScores[key] = score;
        }
        
        this.save();
    }
    
    isMapCompleted(mapId) {
        return this.data.completedMaps.includes(mapId);
    }
    
    getHighScore(mapId, difficulty) {
        const key = `${mapId}_${difficulty}`;
        return this.data.highScores[key] || 0;
    }
    
    // Ayarlar
    setDifficulty(difficulty) {
        this.data.settings.difficulty = difficulty;
        this.save();
    }
    
    getDifficulty() {
        return this.data.settings.difficulty || 'normal';
    }
    
    // İstatistikler
    updateStats(stats) {
        this.data.stats.totalGamesPlayed += stats.gamesPlayed || 0;
        this.data.stats.totalWavesCompleted += stats.wavesCompleted || 0;
        this.data.stats.totalEnemiesKilled += stats.enemiesKilled || 0;
        this.data.stats.totalGoldEarned += stats.goldEarned || 0;
        this.save();
    }
    
    getStats() {
        return this.data.stats;
    }
    
    // Tüm ilerlemeyi sil
    reset() {
        this.data = this.getDefaultData();
        this.save();
        console.log('İlerleme sıfırlandı');
    }
}

// Global instance
const saveManager = new SaveManager();
