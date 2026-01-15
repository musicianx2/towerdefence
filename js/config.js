/**
 * Tower Defense - Oyun Konfigürasyonu
 * @version 1.3.0
 */

const CONFIG = {
    VERSION: '1.7.5',
    BUILD: '20250115-13',
    
    CANVAS: { WIDTH: 800, HEIGHT: 600 },
    GRID: { CELL_SIZE: 32, COLS: 25, ROWS: 18 },
    
    CELL_TYPES: {
        EMPTY: 0, PATH: 1, TREE: 2, WATER: 3, TOWER: 4,
        SPAWN: 5, BASE: 6, SNOW: 7, ICE: 8, ROCK: 9,
        LAVA: 10, SAND: 11, CACTUS: 12
    },
    
    // ==================== ELEMENT SİSTEMİ ====================
    ELEMENTS: {
        neutral: { id: 'neutral', name: 'Nötr', icon: '⚪', color: '#888888' },
        fire: { id: 'fire', name: 'Ateş', icon: '🔥', color: '#ff4500' },
        ice: { id: 'ice', name: 'Buz', icon: '❄️', color: '#00bfff' },
        wind: { id: 'wind', name: 'Rüzgar', icon: '💨', color: '#90ee90' },
        earth: { id: 'earth', name: 'Toprak', icon: '🌍', color: '#8b4513' }
    },
    
    // Element hasar çarpanları: DAMAGE_MATRIX[saldıran][hedef]
    DAMAGE_MATRIX: {
        neutral: { neutral: 1.0, fire: 1.0, ice: 1.0, wind: 1.0, earth: 1.0 },
        fire:    { neutral: 1.0, fire: 0.5, ice: 2.0, wind: 1.0, earth: 0.75 },
        ice:     { neutral: 1.0, fire: 2.0, ice: 0.5, wind: 0.75, earth: 1.0 },
        wind:    { neutral: 1.0, fire: 1.0, ice: 0.75, wind: 0.5, earth: 2.0 },
        earth:   { neutral: 1.0, fire: 0.75, ice: 1.0, wind: 2.0, earth: 0.5 }
    },
    
    // ==================== TEMALAR ====================
    THEMES: {
        summer: {
            name: 'Yaz', icon: '🌲',
            EMPTY: '#4a7c23', PATH: '#c9a66b', PATH_BORDER: '#8b7355',
            TREE: '#2d5a1d', TREE_TRUNK: '#5c4033',
            WATER: '#4a90d9', WATER_LIGHT: '#6bb3f0', ROCK: '#808080'
        },
        winter: {
            name: 'Kış', icon: '❄️',
            EMPTY: '#e8f4f4', PATH: '#b8c4c4', PATH_BORDER: '#8a9696',
            TREE: '#1a4a3a', TREE_TRUNK: '#3a2818',
            WATER: '#7ec8e3', WATER_LIGHT: '#a5d8e8',
            SNOW: '#ffffff', ICE: '#b0e0e6', ROCK: '#606080'
        },
        volcanic: {
            name: 'Volkanik', icon: '🌋',
            EMPTY: '#2d1f1f', PATH: '#4a3535', PATH_BORDER: '#3a2525',
            TREE: '#1a0a0a', TREE_TRUNK: '#0d0505',
            ROCK: '#4a4a4a', LAVA: '#ff4500', LAVA_LIGHT: '#ff6a00'
        },
        storm: {
            name: 'Fırtına', icon: '🌪️',
            EMPTY: '#3a4a3a', PATH: '#5a6a5a', PATH_BORDER: '#4a5a4a',
            TREE: '#2a3a2a', TREE_TRUNK: '#1a2a1a',
            ROCK: '#5a5a6a', WATER: '#6a8a9a', WATER_LIGHT: '#8aaaba'
        },
        desert: {
            name: 'Çöl', icon: '🏜️',
            EMPTY: '#d4a574', PATH: '#c9a066', PATH_BORDER: '#a08050',
            CACTUS: '#228b22', ROCK: '#a09080', SAND: '#e8d4a8'
        }
    },
    
    COLORS: {
        EMPTY: '#4a7c23', PATH: '#c9a66b', PATH_BORDER: '#8b7355',
        TREE: '#2d5a1d', TREE_TRUNK: '#5c4033',
        WATER: '#4a90d9', WATER_LIGHT: '#6bb3f0',
        SPAWN: '#ff6b6b', BASE: '#ffd700',
        GRID_LINE: 'rgba(0,0,0,0.1)',
        RANGE_VALID: 'rgba(0,255,0,0.2)',
        RANGE_INVALID: 'rgba(255,0,0,0.2)'
    },
    
    // ==================== ZORLUK ====================
    DIFFICULTY: {
        easy: {
            id: 'easy', name: 'Kolay', icon: '⭐',
            enemyHealthMult: 1.0, enemySpeedMult: 0.9, goldMult: 1.2,
            prepTime: 20, goldMultiplier: 1.3, startingLives: 15
        },
        normal: {
            id: 'normal', name: 'Orta', icon: '⭐⭐',
            enemyHealthMult: 1.3, enemySpeedMult: 1.0, goldMult: 1.0,
            prepTime: 15, goldMultiplier: 1.0, startingLives: 10
        },
        hard: {
            id: 'hard', name: 'Zor', icon: '⭐⭐⭐',
            enemyHealthMult: 1.6, enemySpeedMult: 1.1, goldMult: 0.8,
            prepTime: 10, goldMultiplier: 0.7, startingLives: 5
        }
    },
    
    // ==================== OYUN MODLARI ====================
    GAME_MODES: {
        classic: { id: 'classic', name: 'Klasik', icon: '🎮', waves: 15, endless: false },
        endless: { id: 'endless', name: 'Sonsuz', icon: '♾️', waves: 999, endless: true }
    },
    
    GAME: { STARTING_GOLD: 150, STARTING_LIVES: 10, MAX_WAVES: 15, PREPARATION_TIME: 15 },
    WAVE: { BASE_PREP_TIME: 15, PREP_TIME_INCREMENT: 2, BASE_ENEMY_COUNT: 5, ENEMY_INCREMENT: 3, SPAWN_DELAY: 800 },
    
    // ==================== KULELER ====================
    TOWERS: {
        archer: {
            id: 'archer', name: 'Okçu Kulesi', icon: '🏹', element: 'neutral',
            cost: 50, damage: 10, range: 3, fireRate: 1000,
            color: '#8b4513', projectileSpeed: 8, projectileColor: '#d4a574',
            description: 'Hızlı ateş, tüm düşmanlara eşit hasar'
        },
        cannon: {
            id: 'cannon', name: 'Top Kulesi', icon: '💣', element: 'neutral',
            cost: 100, damage: 30, range: 4, fireRate: 2000, splashRadius: 1,
            color: '#4a4a4a', projectileSpeed: 5, projectileColor: '#333',
            description: 'Alan hasarı, tüm düşmanlara eşit'
        },
        ice: {
            id: 'ice', name: 'Buz Kulesi', icon: '❄️', element: 'ice',
            cost: 75, damage: 8, range: 3, fireRate: 1500,
            slowAmount: 0.5, slowDuration: 2000,
            color: '#87ceeb', projectileSpeed: 6, projectileColor: '#a0e6ff',
            description: 'Yavaşlatır, Fire düşmanlara 2x hasar'
        },
        fire: {
            id: 'fire', name: 'Ateş Kulesi', icon: '🔥', element: 'fire',
            cost: 150, damage: 20, range: 2.5, fireRate: 1200,
            burnDamage: 5, burnDuration: 3000,
            color: '#ff4500', projectileSpeed: 7, projectileColor: '#ff6a00',
            description: 'Yakar, Ice düşmanlara 2x hasar'
        },
        wind: {
            id: 'wind', name: 'Rüzgar Kulesi', icon: '💨', element: 'wind',
            cost: 125, damage: 15, range: 3.5, fireRate: 1100, knockback: 0.5,
            color: '#90ee90', projectileSpeed: 12, projectileColor: '#c0ffc0',
            description: 'Geri iter, Earth düşmanlara 2x hasar'
        },
        earth: {
            id: 'earth', name: 'Toprak Kulesi', icon: '🌍', element: 'earth',
            cost: 175, damage: 35, range: 2.5, fireRate: 2200,
            stunChance: 0.2, stunDuration: 1000,
            color: '#8b4513', projectileSpeed: 4, projectileColor: '#654321',
            description: 'Sersemletir, Wind düşmanlara 2x hasar'
        },
        tesla: {
            id: 'tesla', name: 'Tesla Kulesi', icon: '⚡', element: 'neutral',
            cost: 200, damage: 50, range: 5, fireRate: 2500, chainCount: 3,
            color: '#9932cc', projectileSpeed: 15, projectileColor: '#bf5fff',
            description: 'Zincir şimşek, tüm düşmanlara eşit'
        }
    },
    
    // ==================== DÜŞMANLAR ====================
    ENEMIES: {
        // Neutral
        basic: { id: 'basic', name: 'Goblin', element: 'neutral', health: 30, speed: 1.5, reward: 10, damage: 1, color: '#90EE90', size: 12, powerLevel: 1 },
        fast: { id: 'fast', name: 'Kurt', element: 'neutral', health: 20, speed: 2.5, reward: 15, damage: 1, color: '#A0A0A0', size: 10, powerLevel: 1 },
        tank: { id: 'tank', name: 'Ogre', element: 'neutral', health: 100, speed: 0.8, reward: 25, damage: 1, color: '#8B4513', size: 16, powerLevel: 2 },
        boss: { id: 'boss', name: 'Troll', element: 'neutral', health: 250, speed: 0.6, reward: 100, damage: 2, color: '#4B0082', size: 20, powerLevel: 4, 
            isBoss: true, bossAbility: 'shield', shieldCooldown: 8000, shieldDuration: 3000 },
        
        // Ice
        frost: { id: 'frost', name: 'Buz Golemi', element: 'ice', health: 80, speed: 1.0, reward: 30, damage: 1, color: '#87CEEB', size: 14, powerLevel: 2, slowResist: 0.5 },
        yeti: { id: 'yeti', name: 'Yeti', element: 'ice', health: 400, speed: 0.5, reward: 150, damage: 3, color: '#E0FFFF', size: 22, powerLevel: 5,
            isBoss: true, bossAbility: 'split', splitCount: 2, splitType: 'frost' },
        
        // Fire
        imp: { id: 'imp', name: 'Ateş İblisi', element: 'fire', health: 60, speed: 1.8, reward: 25, damage: 1, color: '#FF6347', size: 11, powerLevel: 2, burnImmune: true },
        lava_giant: { id: 'lava_giant', name: 'Lav Devi', element: 'fire', health: 350, speed: 0.4, reward: 140, damage: 3, color: '#FF4500', size: 24, powerLevel: 5, burnImmune: true,
            isBoss: true, bossAbility: 'teleport', teleportCooldown: 10000 },
        
        // Wind
        fairy: { id: 'fairy', name: 'Hava Perisi', element: 'wind', health: 40, speed: 2.2, reward: 20, damage: 1, color: '#98FB98', size: 9, powerLevel: 1 },
        storm_lord: { id: 'storm_lord', name: 'Fırtına Lordu', element: 'wind', health: 300, speed: 0.7, reward: 130, damage: 2, color: '#4682B4', size: 20, powerLevel: 4,
            isBoss: true, bossAbility: 'shield', shieldCooldown: 6000, shieldDuration: 2500 },
        
        // Earth
        rock_golem: { id: 'rock_golem', name: 'Kaya Golemi', element: 'earth', health: 150, speed: 0.6, reward: 35, damage: 1, color: '#696969', size: 16, powerLevel: 3, stunResist: 0.5 },
        earth_titan: { id: 'earth_titan', name: 'Toprak Titanı', element: 'earth', health: 500, speed: 0.3, reward: 200, damage: 4, color: '#8B7355', size: 26, powerLevel: 6, stunResist: 0.8,
            isBoss: true, bossAbility: 'split', splitCount: 3, splitType: 'rock_golem' }
    },
    
    // ==================== ÖZEL YETENEKLER ====================
    ABILITIES: {
        meteor: {
            id: 'meteor', name: 'Meteor', icon: '☄️',
            cost: 100, cooldown: 30000,
            damage: 150, radius: 2,
            description: 'Seçilen alana büyük hasar'
        },
        freeze: {
            id: 'freeze', name: 'Dondurucu Dalga', icon: '🌊',
            cost: 75, cooldown: 25000,
            slowAmount: 0.3, duration: 4000,
            description: 'Tüm düşmanları yavaşlatır'
        },
        goldRush: {
            id: 'goldRush', name: 'Altın Yağmuru', icon: '💎',
            cost: 50, cooldown: 45000,
            goldBonus: 150,
            description: 'Anında +150 altın'
        },
        repair: {
            id: 'repair', name: 'Tamir', icon: '🔧',
            cost: 60, cooldown: 40000,
            healAmount: 5,
            description: '+5 can geri kazan'
        }
    },
    
    // ==================== SES EFEKTLERİ ====================
    SOUNDS: {
        enabled: true,
        volume: 0.15, // Düşük varsayılan
        effects: {
            shoot: { frequency: 800, duration: 0.05, type: 'square' },
            hit: { frequency: 200, duration: 0.1, type: 'sawtooth' },
            explosion: { frequency: 100, duration: 0.2, type: 'sawtooth', decay: true },
            enemyDeath: { frequency: 300, duration: 0.15, type: 'triangle' },
            towerPlace: { frequency: 500, duration: 0.1, type: 'sine' },
            upgrade: { frequency: 600, duration: 0.15, type: 'sine', rise: true },
            gold: { frequency: 1000, duration: 0.08, type: 'sine' },
            damage: { frequency: 150, duration: 0.2, type: 'sawtooth' },
            victory: { frequency: 800, duration: 0.3, type: 'sine', rise: true },
            defeat: { frequency: 200, duration: 0.4, type: 'sawtooth', decay: true },
            wave: { frequency: 400, duration: 0.2, type: 'square' },
            ability: { frequency: 700, duration: 0.15, type: 'triangle' },
            shield: { frequency: 500, duration: 0.25, type: 'sine' },
            teleport: { frequency: 1200, duration: 0.1, type: 'sine', decay: true }
        }
    },
    
    POWER_SYMBOLS: ['•', '••', '•••', '★', '★★', '✦'],
    
    DEBUG: { SHOW_GRID: true, SHOW_FPS: true, SHOW_PATH_INDEX: false, LOG_EVENTS: false }
};
