/**
 * Tower Defense - Harita 1: Orman Yolu
 * Basit S şeklinde path
 * @version 1.0.0
 */

const MAPS = {
    map1: {
        id: 'map1',
        name: 'Orman Yolu',
        difficulty: 1,
        maxWaves: 15,
        size: 'small',
        
        // Spawn ve Base konumları
        spawn: { col: 24, row: 2 },
        base: { col: 0, row: 16 },
        
        // Path noktaları (spawn'dan base'e)
        path: [
            // Üst yatay çizgi (sağdan sola)
            {col:24,row:2},{col:23,row:2},{col:22,row:2},{col:21,row:2},{col:20,row:2},
            {col:19,row:2},{col:18,row:2},{col:17,row:2},{col:16,row:2},{col:15,row:2},
            {col:14,row:2},{col:13,row:2},{col:12,row:2},{col:11,row:2},{col:10,row:2},
            {col:9,row:2},{col:8,row:2},{col:7,row:2},{col:6,row:2},{col:5,row:2},
            {col:4,row:2},
            // İlk dikey iniş
            {col:4,row:3},{col:4,row:4},{col:4,row:5},{col:4,row:6},
            // Orta yatay çizgi (soldan sağa)
            {col:5,row:6},{col:6,row:6},{col:7,row:6},{col:8,row:6},{col:9,row:6},
            {col:10,row:6},{col:11,row:6},{col:12,row:6},{col:13,row:6},{col:14,row:6},
            {col:15,row:6},{col:16,row:6},{col:17,row:6},{col:18,row:6},{col:19,row:6},
            {col:20,row:6},
            // İkinci dikey iniş
            {col:20,row:7},{col:20,row:8},{col:20,row:9},{col:20,row:10},
            // Alt orta yatay çizgi (sağdan sola)
            {col:19,row:10},{col:18,row:10},{col:17,row:10},{col:16,row:10},{col:15,row:10},
            {col:14,row:10},{col:13,row:10},{col:12,row:10},{col:11,row:10},{col:10,row:10},
            {col:9,row:10},{col:8,row:10},{col:7,row:10},{col:6,row:10},{col:5,row:10},
            {col:4,row:10},{col:3,row:10},
            // Son dikey iniş
            {col:3,row:11},{col:3,row:12},{col:3,row:13},{col:3,row:14},{col:3,row:15},
            {col:3,row:16},
            // Kaleye giriş
            {col:2,row:16},{col:1,row:16},{col:0,row:16}
        ],
        
        // Engeller
        obstacles: [
            // Ağaçlar - üst bölge
            {col:0,row:0,type:'TREE'},{col:1,row:0,type:'TREE'},{col:2,row:1,type:'TREE'},
            {col:7,row:0,type:'TREE'},{col:8,row:1,type:'TREE'},{col:12,row:0,type:'TREE'},
            {col:15,row:1,type:'TREE'},
            
            // Ağaçlar - sol bölge
            {col:0,row:4,type:'TREE'},{col:1,row:5,type:'TREE'},
            {col:0,row:8,type:'TREE'},{col:1,row:9,type:'TREE'},
            
            // Ağaçlar - orta bölge
            {col:8,row:4,type:'TREE'},{col:12,row:4,type:'TREE'},{col:16,row:3,type:'TREE'},
            {col:7,row:8,type:'TREE'},{col:11,row:8,type:'TREE'},{col:15,row:8,type:'TREE'},
            
            // Ağaçlar - alt bölge
            {col:6,row:12,type:'TREE'},{col:10,row:13,type:'TREE'},
            {col:14,row:12,type:'TREE'},{col:18,row:13,type:'TREE'},
            {col:8,row:15,type:'TREE'},{col:12,row:16,type:'TREE'},{col:16,row:15,type:'TREE'},
            
            // Ağaçlar - sağ bölge
            {col:22,row:5,type:'TREE'},{col:23,row:8,type:'TREE'},
            {col:21,row:12,type:'TREE'},{col:24,row:15,type:'TREE'},
            
            // Göller - sağ üst
            {col:21,row:0,type:'WATER'},{col:22,row:0,type:'WATER'},{col:21,row:1,type:'WATER'},
            
            // Göller - sağ orta
            {col:23,row:4,type:'WATER'},{col:24,row:4,type:'WATER'},
            {col:23,row:5,type:'WATER'},{col:24,row:5,type:'WATER'},
            
            // Göller - sağ alt
            {col:23,row:10,type:'WATER'},{col:24,row:10,type:'WATER'},{col:24,row:11,type:'WATER'},
            
            // Göller - sol alt
            {col:0,row:12,type:'WATER'},{col:1,row:12,type:'WATER'},{col:0,row:13,type:'WATER'}
        ]
    }
};

/**
 * Harita Yöneticisi
 */
class MapManager {
    constructor() {
        this.currentMap = null;
        this.unlockedMaps = ['map1'];
    }
    
    loadMap(mapId) {
        if (!MAPS[mapId]) {
            console.error(`Harita bulunamadı: ${mapId}`);
            return null;
        }
        this.currentMap = Utils.deepClone(MAPS[mapId]);
        console.log(`Harita yüklendi: ${this.currentMap.name}`);
        return this.currentMap;
    }
    
    unlockNextMap(currentMapId) {
        const mapIds = Object.keys(MAPS);
        const currentIndex = mapIds.indexOf(currentMapId);
        if (currentIndex !== -1 && currentIndex < mapIds.length - 1) {
            const nextMapId = mapIds[currentIndex + 1];
            if (!this.unlockedMaps.includes(nextMapId)) {
                this.unlockedMaps.push(nextMapId);
                console.log(`Yeni harita açıldı: ${MAPS[nextMapId].name}`);
                return nextMapId;
            }
        }
        return null;
    }
    
    isMapUnlocked(mapId) {
        return this.unlockedMaps.includes(mapId);
    }
    
    getAllMaps() {
        return MAPS;
    }
}

// Global instance
const mapManager = new MapManager();
