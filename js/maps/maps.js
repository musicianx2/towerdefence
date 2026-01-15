/**
 * Tower Defense - Harita Tanımları
 * @version 1.3.0
 */

const MAPS = {
    // ==================== HARİTA 1: ORMAN YOLU ====================
    map1: {
        id: 'map1',
        name: 'Orman Yolu',
        description: 'Yemyeşil ormanlardan geçen antik yol',
        theme: 'summer',
        icon: '🌲',
        difficulty: 1,
        maxWaves: 15,
        startingGold: 200,
        dominantElement: 'neutral',
        elementWeights: { neutral: 70, fire: 10, ice: 10, wind: 5, earth: 5 },
        availableTowers: ['archer', 'cannon', 'ice'],
        newTower: null,
        spawn: { col: 24, row: 2 },
        base: { col: 0, row: 16 },
        path: [
            {col:24,row:2},{col:23,row:2},{col:22,row:2},{col:21,row:2},{col:20,row:2},
            {col:19,row:2},{col:18,row:2},{col:17,row:2},{col:16,row:2},{col:15,row:2},
            {col:14,row:2},{col:13,row:2},{col:12,row:2},{col:11,row:2},{col:10,row:2},
            {col:9,row:2},{col:8,row:2},{col:7,row:2},{col:6,row:2},{col:5,row:2},
            {col:4,row:2},{col:4,row:3},{col:4,row:4},{col:4,row:5},{col:4,row:6},
            {col:5,row:6},{col:6,row:6},{col:7,row:6},{col:8,row:6},{col:9,row:6},
            {col:10,row:6},{col:11,row:6},{col:12,row:6},{col:13,row:6},{col:14,row:6},
            {col:15,row:6},{col:16,row:6},{col:17,row:6},{col:18,row:6},{col:19,row:6},
            {col:20,row:6},{col:20,row:7},{col:20,row:8},{col:20,row:9},{col:20,row:10},
            {col:19,row:10},{col:18,row:10},{col:17,row:10},{col:16,row:10},{col:15,row:10},
            {col:14,row:10},{col:13,row:10},{col:12,row:10},{col:11,row:10},{col:10,row:10},
            {col:9,row:10},{col:8,row:10},{col:7,row:10},{col:6,row:10},{col:5,row:10},
            {col:4,row:10},{col:3,row:10},{col:3,row:11},{col:3,row:12},{col:3,row:13},
            {col:3,row:14},{col:3,row:15},{col:3,row:16},{col:2,row:16},{col:1,row:16},{col:0,row:16}
        ],
        obstacles: [
            {col:0,row:0,type:'TREE'},{col:1,row:0,type:'TREE'},{col:7,row:0,type:'TREE'},
            {col:12,row:0,type:'TREE'},{col:15,row:1,type:'TREE'},{col:0,row:4,type:'TREE'},
            {col:8,row:4,type:'TREE'},{col:12,row:4,type:'TREE'},{col:16,row:3,type:'TREE'},
            {col:0,row:8,type:'TREE'},{col:7,row:8,type:'TREE'},{col:11,row:8,type:'TREE'},
            {col:15,row:8,type:'TREE'},{col:6,row:12,type:'TREE'},{col:10,row:13,type:'TREE'},
            {col:14,row:12,type:'TREE'},{col:22,row:5,type:'TREE'},{col:23,row:8,type:'TREE'},
            {col:21,row:0,type:'WATER'},{col:22,row:0,type:'WATER'},{col:23,row:4,type:'WATER'},
            {col:24,row:4,type:'WATER'},{col:0,row:12,type:'WATER'},{col:1,row:12,type:'WATER'}
        ],
        enemyTypes: ['basic', 'fast', 'tank', 'boss'],
        reward: { gold: 500, unlocks: 'map2' }
    },

    // ==================== HARİTA 2: KIŞ KALESİ ====================
    map2: {
        id: 'map2',
        name: 'Kış Kalesi',
        description: 'Dondurucu soğukta buz düşmanları',
        theme: 'winter',
        icon: '❄️',
        difficulty: 2,
        maxWaves: 20,
        startingGold: 250,
        dominantElement: 'ice',
        elementWeights: { neutral: 30, fire: 5, ice: 60, wind: 3, earth: 2 },
        availableTowers: ['archer', 'cannon', 'ice', 'fire'],
        newTower: 'fire',
        newTowerMessage: '🔥 Ateş Kulesi açıldı! Buz düşmanlarına 2x hasar!',
        spawn: { col: 24, row: 9 },
        base: { col: 0, row: 9 },
        path: [
            {col:24,row:9},{col:23,row:9},{col:22,row:9},{col:21,row:9},{col:20,row:9},
            {col:20,row:8},{col:20,row:7},{col:20,row:6},{col:20,row:5},{col:20,row:4},
            {col:20,row:3},{col:20,row:2},{col:19,row:2},{col:18,row:2},{col:17,row:2},
            {col:16,row:2},{col:15,row:2},{col:14,row:2},{col:13,row:2},{col:12,row:2},
            {col:12,row:3},{col:12,row:4},{col:12,row:5},{col:12,row:6},{col:11,row:6},
            {col:10,row:6},{col:9,row:6},{col:8,row:6},{col:7,row:6},{col:6,row:6},
            {col:5,row:6},{col:4,row:6},{col:4,row:7},{col:4,row:8},{col:4,row:9},
            {col:4,row:10},{col:4,row:11},{col:4,row:12},{col:5,row:12},{col:6,row:12},
            {col:7,row:12},{col:8,row:12},{col:9,row:12},{col:10,row:12},{col:11,row:12},
            {col:12,row:12},{col:12,row:13},{col:12,row:14},{col:12,row:15},{col:12,row:16},
            {col:11,row:16},{col:10,row:16},{col:9,row:16},{col:8,row:16},{col:7,row:16},
            {col:6,row:16},{col:5,row:16},{col:4,row:16},{col:3,row:16},{col:2,row:16},
            {col:2,row:15},{col:2,row:14},{col:2,row:13},{col:2,row:12},{col:2,row:11},
            {col:2,row:10},{col:2,row:9},{col:1,row:9},{col:0,row:9}
        ],
        obstacles: [
            {col:0,row:0,type:'ROCK'},{col:1,row:0,type:'ROCK'},{col:24,row:0,type:'ROCK'},
            {col:23,row:0,type:'ROCK'},{col:0,row:17,type:'ROCK'},{col:24,row:17,type:'ROCK'},
            {col:6,row:0,type:'TREE'},{col:10,row:1,type:'TREE'},{col:16,row:0,type:'TREE'},
            {col:8,row:4,type:'TREE'},{col:16,row:4,type:'TREE'},{col:0,row:5,type:'TREE'},
            {col:22,row:6,type:'TREE'},{col:6,row:8,type:'TREE'},{col:14,row:8,type:'TREE'},
            {col:14,row:10,type:'ICE'},{col:15,row:10,type:'ICE'},{col:16,row:10,type:'ICE'},
            {col:14,row:11,type:'ICE'},{col:15,row:11,type:'ICE'},{col:16,row:11,type:'ICE'},
            {col:22,row:13,type:'ICE'},{col:23,row:13,type:'ICE'},{col:24,row:13,type:'ICE'}
        ],
        enemyTypes: ['basic', 'fast', 'frost', 'tank', 'yeti'],
        reward: { gold: 750, unlocks: 'map3' }
    },

    // ==================== HARİTA 3: VOLKAN VADİSİ ====================
    map3: {
        id: 'map3',
        name: 'Volkan Vadisi',
        description: 'Lavların arasında ateş canavarları',
        theme: 'volcanic',
        icon: '🌋',
        difficulty: 3,
        maxWaves: 25,
        startingGold: 300,
        dominantElement: 'fire',
        elementWeights: { neutral: 25, fire: 60, ice: 5, wind: 5, earth: 5 },
        availableTowers: ['archer', 'cannon', 'ice', 'fire', 'earth'],
        newTower: 'earth',
        newTowerMessage: '🌍 Toprak Kulesi açıldı! Sersemletme şansı!',
        spawn: { col: 0, row: 2 },
        base: { col: 24, row: 15 },
        path: [
            {col:0,row:2},{col:1,row:2},{col:2,row:2},{col:3,row:2},{col:4,row:2},
            {col:5,row:2},{col:6,row:2},{col:7,row:2},{col:8,row:2},{col:8,row:3},
            {col:8,row:4},{col:8,row:5},{col:8,row:6},{col:8,row:7},{col:8,row:8},
            {col:9,row:8},{col:10,row:8},{col:11,row:8},{col:12,row:8},{col:13,row:8},
            {col:14,row:8},{col:15,row:8},{col:16,row:8},{col:16,row:9},{col:16,row:10},
            {col:16,row:11},{col:16,row:12},{col:15,row:12},{col:14,row:12},{col:13,row:12},
            {col:12,row:12},{col:11,row:12},{col:10,row:12},{col:9,row:12},{col:8,row:12},
            {col:8,row:13},{col:8,row:14},{col:8,row:15},{col:9,row:15},{col:10,row:15},
            {col:11,row:15},{col:12,row:15},{col:13,row:15},{col:14,row:15},{col:15,row:15},
            {col:16,row:15},{col:17,row:15},{col:18,row:15},{col:19,row:15},{col:20,row:15},
            {col:21,row:15},{col:22,row:15},{col:23,row:15},{col:24,row:15}
        ],
        obstacles: [
            {col:3,row:5,type:'LAVA'},{col:4,row:5,type:'LAVA'},{col:5,row:5,type:'LAVA'},
            {col:3,row:6,type:'LAVA'},{col:4,row:6,type:'LAVA'},{col:5,row:6,type:'LAVA'},
            {col:11,row:4,type:'LAVA'},{col:12,row:4,type:'LAVA'},{col:13,row:4,type:'LAVA'},
            {col:11,row:5,type:'LAVA'},{col:12,row:5,type:'LAVA'},{col:13,row:5,type:'LAVA'},
            {col:19,row:8,type:'LAVA'},{col:20,row:8,type:'LAVA'},{col:21,row:8,type:'LAVA'},
            {col:19,row:9,type:'LAVA'},{col:20,row:9,type:'LAVA'},{col:21,row:9,type:'LAVA'},
            {col:3,row:10,type:'ROCK'},{col:4,row:10,type:'ROCK'},{col:5,row:10,type:'ROCK'},
            {col:20,row:12,type:'ROCK'},{col:21,row:12,type:'ROCK'},{col:22,row:12,type:'ROCK'},
            {col:0,row:0,type:'ROCK'},{col:24,row:0,type:'ROCK'},{col:0,row:17,type:'ROCK'},{col:24,row:17,type:'ROCK'}
        ],
        enemyTypes: ['basic', 'fast', 'imp', 'tank', 'lava_giant'],
        reward: { gold: 1000, unlocks: 'map4' }
    },

    // ==================== HARİTA 4: RÜZGAR TEPELERİ ====================
    map4: {
        id: 'map4',
        name: 'Rüzgar Tepeleri',
        description: 'Fırtınalı tepelerde hava canavarları',
        theme: 'storm',
        icon: '🌪️',
        difficulty: 4,
        maxWaves: 30,
        startingGold: 350,
        dominantElement: 'wind',
        elementWeights: { neutral: 20, fire: 5, ice: 10, wind: 60, earth: 5 },
        availableTowers: ['archer', 'cannon', 'ice', 'fire', 'earth', 'wind'],
        newTower: 'wind',
        newTowerMessage: '💨 Rüzgar Kulesi açıldı! Düşmanları geri iter!',
        spawn: { col: 12, row: 0 },
        base: { col: 12, row: 17 },
        path: [
            {col:12,row:0},{col:12,row:1},{col:12,row:2},{col:11,row:2},{col:10,row:2},
            {col:9,row:2},{col:8,row:2},{col:7,row:2},{col:6,row:2},{col:5,row:2},
            {col:4,row:2},{col:4,row:3},{col:4,row:4},{col:4,row:5},{col:4,row:6},
            {col:5,row:6},{col:6,row:6},{col:7,row:6},{col:8,row:6},{col:9,row:6},
            {col:10,row:6},{col:11,row:6},{col:12,row:6},{col:13,row:6},{col:14,row:6},
            {col:15,row:6},{col:16,row:6},{col:17,row:6},{col:18,row:6},{col:19,row:6},
            {col:20,row:6},{col:20,row:7},{col:20,row:8},{col:20,row:9},{col:20,row:10},
            {col:19,row:10},{col:18,row:10},{col:17,row:10},{col:16,row:10},{col:15,row:10},
            {col:14,row:10},{col:13,row:10},{col:12,row:10},{col:11,row:10},{col:10,row:10},
            {col:9,row:10},{col:8,row:10},{col:7,row:10},{col:6,row:10},{col:5,row:10},
            {col:4,row:10},{col:4,row:11},{col:4,row:12},{col:4,row:13},{col:4,row:14},
            {col:5,row:14},{col:6,row:14},{col:7,row:14},{col:8,row:14},{col:9,row:14},
            {col:10,row:14},{col:11,row:14},{col:12,row:14},{col:12,row:15},{col:12,row:16},{col:12,row:17}
        ],
        obstacles: [
            {col:0,row:4,type:'ROCK'},{col:1,row:4,type:'ROCK'},{col:2,row:4,type:'ROCK'},
            {col:22,row:4,type:'ROCK'},{col:23,row:4,type:'ROCK'},{col:24,row:4,type:'ROCK'},
            {col:0,row:8,type:'TREE'},{col:1,row:8,type:'TREE'},{col:23,row:8,type:'TREE'},
            {col:0,row:12,type:'ROCK'},{col:1,row:12,type:'ROCK'},{col:23,row:12,type:'ROCK'},
            {col:8,row:8,type:'WATER'},{col:9,row:8,type:'WATER'},{col:15,row:8,type:'WATER'},
            {col:16,row:8,type:'WATER'},{col:8,row:12,type:'TREE'},{col:16,row:12,type:'TREE'}
        ],
        enemyTypes: ['basic', 'fast', 'fairy', 'tank', 'storm_lord'],
        reward: { gold: 1500, unlocks: 'map5' }
    },

    // ==================== HARİTA 5: KAYIP TOPRAKLAR ====================
    map5: {
        id: 'map5',
        name: 'Kayıp Topraklar',
        description: 'Çölde toprak devleri bekliyor',
        theme: 'desert',
        icon: '🏜️',
        difficulty: 5,
        maxWaves: 35,
        startingGold: 400,
        dominantElement: 'earth',
        elementWeights: { neutral: 15, fire: 10, ice: 5, wind: 20, earth: 50 },
        availableTowers: ['archer', 'cannon', 'ice', 'fire', 'earth', 'wind', 'tesla'],
        newTower: 'tesla',
        newTowerMessage: '⚡ Tesla Kulesi açıldı! Zincir şimşek!',
        spawn: { col: 0, row: 9 },
        base: { col: 24, row: 9 },
        path: [
            {col:0,row:9},{col:1,row:9},{col:2,row:9},{col:3,row:9},{col:4,row:9},
            {col:4,row:8},{col:4,row:7},{col:4,row:6},{col:4,row:5},{col:4,row:4},
            {col:5,row:4},{col:6,row:4},{col:7,row:4},{col:8,row:4},{col:9,row:4},
            {col:10,row:4},{col:10,row:5},{col:10,row:6},{col:10,row:7},{col:10,row:8},
            {col:10,row:9},{col:10,row:10},{col:10,row:11},{col:10,row:12},{col:10,row:13},
            {col:11,row:13},{col:12,row:13},{col:13,row:13},{col:14,row:13},{col:14,row:12},
            {col:14,row:11},{col:14,row:10},{col:14,row:9},{col:14,row:8},{col:14,row:7},
            {col:14,row:6},{col:14,row:5},{col:14,row:4},{col:15,row:4},{col:16,row:4},
            {col:17,row:4},{col:18,row:4},{col:19,row:4},{col:20,row:4},{col:20,row:5},
            {col:20,row:6},{col:20,row:7},{col:20,row:8},{col:20,row:9},{col:21,row:9},
            {col:22,row:9},{col:23,row:9},{col:24,row:9}
        ],
        obstacles: [
            {col:7,row:7,type:'CACTUS'},{col:7,row:10,type:'CACTUS'},{col:17,row:7,type:'CACTUS'},
            {col:17,row:10,type:'CACTUS'},{col:12,row:7,type:'CACTUS'},{col:12,row:10,type:'CACTUS'},
            {col:2,row:2,type:'ROCK'},{col:3,row:2,type:'ROCK'},{col:22,row:2,type:'ROCK'},
            {col:2,row:15,type:'ROCK'},{col:3,row:15,type:'ROCK'},{col:22,row:15,type:'ROCK'},
            {col:7,row:1,type:'SAND'},{col:8,row:1,type:'SAND'},{col:16,row:1,type:'SAND'},
            {col:17,row:1,type:'SAND'},{col:7,row:16,type:'SAND'},{col:17,row:16,type:'SAND'}
        ],
        enemyTypes: ['basic', 'fast', 'rock_golem', 'tank', 'fairy', 'earth_titan'],
        reward: { gold: 2000, unlocks: null }
    }
};

/**
 * Harita Yöneticisi
 */
class MapManager {
    constructor() {
        this.currentMap = null;
    }
    
    loadMap(mapId) {
        if (!MAPS[mapId]) {
            console.error(`Harita bulunamadı: ${mapId}`);
            return null;
        }
        this.currentMap = Utils.deepClone(MAPS[mapId]);
        console.log(`Harita yüklendi: ${this.currentMap.name} (${this.currentMap.theme})`);
        return this.currentMap;
    }
    
    getMapList() {
        return Object.values(MAPS);
    }
    
    getMapById(mapId) {
        return MAPS[mapId] || null;
    }
    
    getThemeColors(mapId) {
        const map = MAPS[mapId];
        if (!map?.theme || !CONFIG.THEMES) return CONFIG.COLORS;
        return CONFIG.THEMES[map.theme] || CONFIG.THEMES.summer;
    }
    
    getNextMapId(currentMapId) {
        const mapIds = Object.keys(MAPS);
        const index = mapIds.indexOf(currentMapId);
        if (index !== -1 && index < mapIds.length - 1) {
            return mapIds[index + 1];
        }
        return null;
    }
}

const mapManager = new MapManager();
