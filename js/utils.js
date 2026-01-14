/**
 * Tower Defense - Utility Functions
 * Genel amaçlı yardımcı fonksiyonlar
 * @version 1.0.0
 */

const Utils = {
    /**
     * Grid koordinatını piksel koordinatına çevirir (hücre merkezi)
     */
    gridToPixel(col, row) {
        const s = CONFIG.GRID.CELL_SIZE;
        return { 
            x: col * s + s / 2, 
            y: row * s + s / 2 
        };
    },
    
    /**
     * Piksel koordinatını grid koordinatına çevirir
     */
    pixelToGrid(x, y) {
        const s = CONFIG.GRID.CELL_SIZE;
        return { 
            col: Math.floor(x / s), 
            row: Math.floor(y / s) 
        };
    },
    
    /**
     * İki nokta arasındaki mesafeyi hesaplar
     */
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },
    
    /**
     * Koordinatın grid sınırları içinde olup olmadığını kontrol eder
     */
    isInBounds(col, row) {
        return col >= 0 && col < CONFIG.GRID.COLS && 
               row >= 0 && row < CONFIG.GRID.ROWS;
    },
    
    /**
     * Rengi daha koyu yapar
     */
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    },
    
    /**
     * Rengi daha açık yapar
     */
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    },
    
    /**
     * Deep clone yapar
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    /**
     * Rastgele tam sayı üretir (min ve max dahil)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Bir değeri belirli aralıkta sınırlar
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    /**
     * İki nokta arasındaki açıyı hesaplar (radyan)
     */
    angleBetween(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },
    
    /**
     * Dereceyi radyana çevirir
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    },
    
    /**
     * Radyanı dereceye çevirir
     */
    toDegrees(radians) {
        return radians * (180 / Math.PI);
    },
    
    /**
     * Benzersiz ID üretir
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },
    
    /**
     * Zamanı formatlar (saniye -> MM:SS)
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    /**
     * Sayıyı kısaltır (1000 -> 1K)
     */
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    },
    
    /**
     * Linear interpolation
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },
    
    /**
     * Ease out quad
     */
    easeOutQuad(t) {
        return t * (2 - t);
    },
    
    /**
     * Ease in out quad
     */
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
};

// Utils'i dondur
Object.freeze(Utils);
