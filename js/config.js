/**
 * Tower Defense - Oyun Konfigürasyonu
 * Tüm sabitler ve ayarlar
 * @version 1.0.0
 */

const CONFIG = {
    // Versiyon
    VERSION: '1.0.0',
    
    // Canvas ve Grid Ayarları
    CANVAS: { 
        WIDTH: 800, 
        HEIGHT: 600 
    },
    
    GRID: { 
        CELL_SIZE: 32, 
        COLS: 25, 
        ROWS: 18 
    },
    
    // Hücre Tipleri
    CELL_TYPES: {
        EMPTY: 0,
        PATH: 1,
        TREE: 2,
        WATER: 3,
        TOWER: 4,
        SPAWN: 5,
        BASE: 6
    },
    
    // Renk Paleti
    COLORS: {
        // Zemin
        EMPTY: '#4a7c23',
        PATH: '#c9a66b',
        PATH_BORDER: '#8b7355',
        
        // Engeller
        TREE: '#2d5a1d',
        TREE_TRUNK: '#5c4033',
        WATER: '#4a90d9',
        WATER_LIGHT: '#6bb3f0',
        
        // Özel noktalar
        SPAWN: '#ff6b6b',
        BASE: '#ffd700',
        
        // UI
        GRID_LINE: 'rgba(0,0,0,0.1)',
        RANGE_VALID: 'rgba(0, 255, 0, 0.2)',
        RANGE_INVALID: 'rgba(255, 0, 0, 0.2)'
    },
    
    // Oyun Başlangıç Değerleri
    GAME: {
        STARTING_GOLD: 150,
        STARTING_LIVES: 10,
        MAX_WAVES: 15,
        PREPARATION_TIME: 15
    },
    
    // Wave Ayarları
    WAVE: {
        BASE_PREP_TIME: 15,
        PREP_TIME_INCREMENT: 2,
        BASE_ENEMY_COUNT: 5,
        ENEMY_INCREMENT: 3,
        SPAWN_DELAY: 800 // ms
    },
    
    // Kule Tanımları
    TOWERS: {
        archer: {
            id: 'archer',
            name: 'Okçu Kulesi',
            icon: '🏹',
            cost: 50,
            damage: 10,
            range: 3,
            fireRate: 1000,
            unlockWave: 1,
            color: '#8b4513',
            projectileSpeed: 8,
            projectileColor: '#d4a574',
            description: 'Hızlı ateş eden temel kule'
        },
        cannon: {
            id: 'cannon',
            name: 'Top Kulesi',
            icon: '💣',
            cost: 100,
            damage: 30,
            range: 4,
            fireRate: 2000,
            unlockWave: 3,
            splashRadius: 1,
            color: '#4a4a4a',
            projectileSpeed: 5,
            projectileColor: '#333',
            description: 'Alan hasarı verir'
        },
        ice: {
            id: 'ice',
            name: 'Buz Kulesi',
            icon: '❄️',
            cost: 75,
            damage: 5,
            range: 3,
            fireRate: 1500,
            unlockWave: 5,
            slowAmount: 0.5,
            slowDuration: 2000,
            color: '#87ceeb',
            projectileSpeed: 6,
            projectileColor: '#a0e6ff',
            description: 'Düşmanları yavaşlatır'
        },
        fire: {
            id: 'fire',
            name: 'Ateş Kulesi',
            icon: '🔥',
            cost: 150,
            damage: 20,
            range: 2,
            fireRate: 1200,
            unlockWave: 8,
            burnDamage: 5,
            burnDuration: 3000,
            color: '#ff4500',
            projectileSpeed: 7,
            projectileColor: '#ff6a00',
            description: 'Yakarak hasar verir'
        },
        tesla: {
            id: 'tesla',
            name: 'Tesla Kulesi',
            icon: '⚡',
            cost: 200,
            damage: 50,
            range: 5,
            fireRate: 2500,
            unlockWave: 12,
            chainCount: 3,
            color: '#9932cc',
            projectileSpeed: 15,
            projectileColor: '#bf5fff',
            description: 'Zincir şimşek atar'
        }
    },
    
    // Düşman Tanımları
    ENEMIES: {
        basic: {
            id: 'basic',
            name: 'Goblin',
            health: 30,
            speed: 1.5,
            reward: 10,
            damage: 1,
            color: '#90EE90',
            size: 12,
            powerLevel: 1
        },
        fast: {
            id: 'fast',
            name: 'Kurt',
            health: 20,
            speed: 2.5,
            reward: 15,
            damage: 1,
            color: '#A0A0A0',
            size: 10,
            powerLevel: 1
        },
        tank: {
            id: 'tank',
            name: 'Ogre',
            health: 100,
            speed: 0.8,
            reward: 25,
            damage: 1,
            color: '#8B4513',
            size: 16,
            powerLevel: 2
        },
        boss: {
            id: 'boss',
            name: 'Troll',
            health: 250,
            speed: 0.6,
            reward: 100,
            damage: 2,
            color: '#4B0082',
            size: 20,
            powerLevel: 4
        }
    },
    
    // Güç Sembolleri
    POWER_SYMBOLS: ['•', '••', '•••', '★', '★★', '✦'],
    
    // Debug Ayarları
    DEBUG: {
        SHOW_GRID: true,
        SHOW_FPS: true,
        SHOW_PATH_INDEX: false,
        LOG_EVENTS: false
    }
};

// Config'i dondur (değiştirilmesini engelle)
Object.freeze(CONFIG);
Object.freeze(CONFIG.CANVAS);
Object.freeze(CONFIG.GRID);
Object.freeze(CONFIG.CELL_TYPES);
Object.freeze(CONFIG.COLORS);
Object.freeze(CONFIG.GAME);
Object.freeze(CONFIG.WAVE);
Object.freeze(CONFIG.DEBUG);

// Tower ve Enemy objelerini ayrı dondur
Object.keys(CONFIG.TOWERS).forEach(key => Object.freeze(CONFIG.TOWERS[key]));
Object.keys(CONFIG.ENEMIES).forEach(key => Object.freeze(CONFIG.ENEMIES[key]));
