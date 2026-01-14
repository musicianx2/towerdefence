/**
 * Tower Defense - Player Manager
 * Kullanıcı ve ilerleme yönetimi
 * @version 1.2.0
 */

class PlayerManager {
    constructor() {
        this.players = this.loadPlayers();
        this.currentPlayer = this.loadCurrentPlayer();
    }
    
    // ==================== PLAYER CRUD ====================
    
    createPlayer(name) {
        name = name.trim();
        if (!name || name.length < 2) {
            return { success: false, error: 'İsim en az 2 karakter olmalı' };
        }
        if (name.length > 15) {
            return { success: false, error: 'İsim en fazla 15 karakter olabilir' };
        }
        if (this.players[name]) {
            return { success: false, error: 'Bu isim zaten kullanılıyor' };
        }
        
        this.players[name] = {
            name: name,
            createdAt: new Date().toISOString(),
            currentMap: 'map1',
            completedMaps: [],
            highestWave: {},
            totalPlayTime: 0,
            lastPlayed: new Date().toISOString()
        };
        
        this.savePlayers();
        this.setCurrentPlayer(name);
        
        console.log(`Yeni oyuncu oluşturuldu: ${name}`);
        return { success: true, player: this.players[name] };
    }
    
    getPlayer(name) {
        return this.players[name] || null;
    }
    
    getCurrentPlayer() {
        if (!this.currentPlayer) return null;
        return this.players[this.currentPlayer] || null;
    }
    
    setCurrentPlayer(name) {
        if (this.players[name]) {
            this.currentPlayer = name;
            localStorage.setItem('td_current_player', name);
            console.log(`Aktif oyuncu: ${name}`);
            return true;
        }
        return false;
    }
    
    getAllPlayers() {
        return Object.values(this.players);
    }
    
    deletePlayer(name) {
        if (this.players[name]) {
            delete this.players[name];
            this.savePlayers();
            if (this.currentPlayer === name) {
                this.currentPlayer = null;
                localStorage.removeItem('td_current_player');
            }
            return true;
        }
        return false;
    }
    
    // ==================== PROGRESS ====================
    
    /**
     * Harita tamamlandığında çağrılır (ZAFER)
     */
    completeMap(mapId, wave, difficulty) {
        const player = this.getCurrentPlayer();
        if (!player) return false;
        
        // Tamamlanan haritalara ekle
        if (!player.completedMaps.includes(mapId)) {
            player.completedMaps.push(mapId);
        }
        
        // En yüksek wave güncelle
        const key = `${mapId}_${difficulty}`;
        if (!player.highestWave[key] || wave > player.highestWave[key]) {
            player.highestWave[key] = wave;
        }
        
        // Genel en yüksek wave (zorluk farketmez)
        if (!player.highestWave[mapId] || wave > player.highestWave[mapId]) {
            player.highestWave[mapId] = wave;
        }
        
        // Sonraki haritayı aç
        const nextMapId = this.getNextMapId(mapId);
        if (nextMapId && player.currentMap === mapId) {
            player.currentMap = nextMapId;
        }
        
        player.lastPlayed = new Date().toISOString();
        this.savePlayers();
        
        console.log(`${player.name} haritayı tamamladı: ${mapId}, Wave: ${wave}`);
        return true;
    }
    
    /**
     * Wave ilerlemesi kaydet (oyun içinde)
     */
    updateWaveProgress(mapId, wave, difficulty) {
        const player = this.getCurrentPlayer();
        if (!player) return;
        
        const key = `${mapId}_${difficulty}`;
        if (!player.highestWave[key] || wave > player.highestWave[key]) {
            player.highestWave[key] = wave;
        }
        
        // Genel en yüksek wave
        if (!player.highestWave[mapId] || wave > player.highestWave[mapId]) {
            player.highestWave[mapId] = wave;
        }
        
        player.lastPlayed = new Date().toISOString();
        this.savePlayers();
    }
    
    /**
     * Oyun süresi ekle
     */
    addPlayTime(seconds) {
        const player = this.getCurrentPlayer();
        if (!player) return;
        
        player.totalPlayTime += seconds;
        player.lastPlayed = new Date().toISOString();
        this.savePlayers();
    }
    
    /**
     * Harita açık mı kontrol et
     */
    isMapUnlocked(mapId) {
        const player = this.getCurrentPlayer();
        if (!player) return mapId === 'map1';
        
        if (mapId === 'map1') return true;
        
        // Önceki harita tamamlanmış mı?
        const mapOrder = Object.keys(MAPS);
        const mapIndex = mapOrder.indexOf(mapId);
        if (mapIndex <= 0) return true;
        
        const prevMapId = mapOrder[mapIndex - 1];
        return player.completedMaps.includes(prevMapId);
    }
    
    /**
     * Tüm açık haritaları döndür
     */
    getUnlockedMaps() {
        const player = this.getCurrentPlayer();
        const unlocked = ['map1'];
        
        if (!player) return unlocked;
        
        const mapOrder = Object.keys(MAPS);
        for (let i = 1; i < mapOrder.length; i++) {
            const prevMapId = mapOrder[i - 1];
            if (player.completedMaps.includes(prevMapId)) {
                unlocked.push(mapOrder[i]);
            }
        }
        
        return unlocked;
    }
    
    getNextMapId(currentMapId) {
        const mapOrder = Object.keys(MAPS);
        const index = mapOrder.indexOf(currentMapId);
        if (index !== -1 && index < mapOrder.length - 1) {
            return mapOrder[index + 1];
        }
        return null;
    }
    
    // ==================== SCOREBOARD ====================
    
    /**
     * Skor tablosu için sıralı liste döndür
     */
    getScoreboard() {
        const scores = [];
        
        for (const player of Object.values(this.players)) {
            // En iyi performansı bul
            let bestMap = 'map1';
            let bestWave = 0;
            
            const mapOrder = Object.keys(MAPS);
            
            // Tamamlanan haritalardan en ileriyi bul
            for (const mapId of mapOrder) {
                const wave = player.highestWave[mapId] || 0;
                const mapIndex = mapOrder.indexOf(mapId);
                const bestMapIndex = mapOrder.indexOf(bestMap);
                
                // Daha ileri harita veya aynı haritada daha yüksek wave
                if (mapIndex > bestMapIndex || (mapIndex === bestMapIndex && wave > bestWave)) {
                    if (wave > 0 || player.completedMaps.includes(mapId)) {
                        bestMap = mapId;
                        bestWave = wave;
                    }
                }
            }
            
            // Tamamlanan harita varsa, en ileriyi göster
            if (player.completedMaps.length > 0) {
                const lastCompleted = player.completedMaps[player.completedMaps.length - 1];
                const lastCompletedIndex = mapOrder.indexOf(lastCompleted);
                const bestMapIndex = mapOrder.indexOf(bestMap);
                
                if (lastCompletedIndex >= bestMapIndex) {
                    bestMap = lastCompleted;
                    bestWave = MAPS[lastCompleted]?.maxWaves || 15;
                }
            }
            
            scores.push({
                name: player.name,
                mapId: bestMap,
                mapName: MAPS[bestMap]?.name || bestMap,
                mapIcon: MAPS[bestMap]?.icon || '🗺️',
                wave: bestWave,
                completedMaps: player.completedMaps.length,
                totalPlayTime: player.totalPlayTime,
                lastPlayed: player.lastPlayed
            });
        }
        
        // Sırala: Tamamlanan harita sayısı > En ileri harita > En yüksek wave
        scores.sort((a, b) => {
            if (b.completedMaps !== a.completedMaps) {
                return b.completedMaps - a.completedMaps;
            }
            const mapOrder = Object.keys(MAPS);
            const aMapIndex = mapOrder.indexOf(a.mapId);
            const bMapIndex = mapOrder.indexOf(b.mapId);
            if (bMapIndex !== aMapIndex) {
                return bMapIndex - aMapIndex;
            }
            return b.wave - a.wave;
        });
        
        return scores;
    }
    
    // ==================== STORAGE ====================
    
    savePlayers() {
        try {
            localStorage.setItem('td_players', JSON.stringify(this.players));
        } catch (e) {
            console.error('Oyuncu kaydetme hatası:', e);
        }
    }
    
    loadPlayers() {
        try {
            const data = localStorage.getItem('td_players');
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Oyuncu yükleme hatası:', e);
        }
        return {};
    }
    
    loadCurrentPlayer() {
        try {
            return localStorage.getItem('td_current_player') || null;
        } catch (e) {
            return null;
        }
    }
    
    // ==================== UTILS ====================
    
    formatPlayTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}s ${mins}d`;
        }
        return `${mins}d`;
    }
    
    hasAnyPlayer() {
        return Object.keys(this.players).length > 0;
    }
    
    resetAllData() {
        this.players = {};
        this.currentPlayer = null;
        localStorage.removeItem('td_players');
        localStorage.removeItem('td_current_player');
        console.log('Tüm oyuncu verileri silindi');
    }
}

// Global instance
const playerManager = new PlayerManager();
