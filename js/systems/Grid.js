/**
 * Tower Defense - Grid System
 * Harita grid yönetimi
 * @version 1.0.0
 */

class Grid {
    constructor() {
        this.cols = CONFIG.GRID.COLS;
        this.rows = CONFIG.GRID.ROWS;
        this.cellSize = CONFIG.GRID.CELL_SIZE;
        this.cells = [];
        this.pathCells = new Set();
        
        this.init();
    }
    
    /**
     * Grid'i başlatır
     */
    init() {
        this.cells = [];
        this.pathCells.clear();
        
        for (let row = 0; row < this.rows; row++) {
            this.cells[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.cells[row][col] = {
                    type: CONFIG.CELL_TYPES.EMPTY,
                    tower: null,
                    data: null
                };
            }
        }
    }
    
    /**
     * Harita verisini grid'e uygular
     */
    loadMap(mapData) {
        this.init();
        
        // Path'i işle
        if (mapData.path && mapData.path.length > 0) {
            mapData.path.forEach((point, index) => {
                if (this.isValidCell(point.col, point.row)) {
                    this.cells[point.row][point.col].type = CONFIG.CELL_TYPES.PATH;
                    this.cells[point.row][point.col].data = { pathIndex: index };
                    this.pathCells.add(`${point.col},${point.row}`);
                }
            });
        }
        
        // Spawn noktası
        if (mapData.spawn) {
            const { col, row } = mapData.spawn;
            if (this.isValidCell(col, row)) {
                this.cells[row][col].type = CONFIG.CELL_TYPES.SPAWN;
            }
        }
        
        // Base
        if (mapData.base) {
            const { col, row } = mapData.base;
            if (this.isValidCell(col, row)) {
                this.cells[row][col].type = CONFIG.CELL_TYPES.BASE;
            }
        }
        
        // Engeller
        if (mapData.obstacles) {
            mapData.obstacles.forEach(obstacle => {
                if (this.isValidCell(obstacle.col, obstacle.row)) {
                    const cellType = CONFIG.CELL_TYPES[obstacle.type];
                    if (cellType !== undefined) {
                        this.cells[obstacle.row][obstacle.col].type = cellType;
                    }
                }
            });
        }
        
        if (CONFIG.DEBUG.LOG_EVENTS) {
            console.log(`Grid yüklendi: ${this.cols}x${this.rows}, Path: ${this.pathCells.size} hücre`);
        }
    }
    
    /**
     * Koordinatın geçerli olup olmadığını kontrol eder
     */
    isValidCell(col, row) {
        return col >= 0 && col < this.cols && row >= 0 && row < this.rows;
    }
    
    /**
     * Hücre tipini döndürür
     */
    getCellType(col, row) {
        if (!this.isValidCell(col, row)) return null;
        return this.cells[row][col].type;
    }
    
    /**
     * Hücre verisini döndürür
     */
    getCell(col, row) {
        if (!this.isValidCell(col, row)) return null;
        return this.cells[row][col];
    }
    
    /**
     * Kule konulabilir mi kontrol eder
     */
    canPlaceTower(col, row) {
        if (!this.isValidCell(col, row)) return false;
        return this.cells[row][col].type === CONFIG.CELL_TYPES.EMPTY;
    }
    
    /**
     * Kule yerleştirir
     */
    placeTower(col, row, tower) {
        if (!this.canPlaceTower(col, row)) {
            return false;
        }
        
        this.cells[row][col].type = CONFIG.CELL_TYPES.TOWER;
        this.cells[row][col].tower = tower;
        
        if (CONFIG.DEBUG.LOG_EVENTS) {
            console.log(`Kule yerleştirildi: (${col}, ${row})`);
        }
        return true;
    }
    
    /**
     * Kuleyi kaldırır
     */
    removeTower(col, row) {
        if (!this.isValidCell(col, row)) return null;
        
        const cell = this.cells[row][col];
        if (cell.type !== CONFIG.CELL_TYPES.TOWER) return null;
        
        const tower = cell.tower;
        cell.type = CONFIG.CELL_TYPES.EMPTY;
        cell.tower = null;
        
        return tower;
    }
    
    /**
     * Path hücresi mi kontrol eder
     */
    isPathCell(col, row) {
        return this.pathCells.has(`${col},${row}`);
    }
    
    /**
     * Hücrenin merkez koordinatını döndürür
     */
    getCellCenter(col, row) {
        return {
            x: col * this.cellSize + this.cellSize / 2,
            y: row * this.cellSize + this.cellSize / 2
        };
    }
    
    /**
     * Piksel koordinatından hücre döndürür
     */
    getCellFromPixel(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        if (!this.isValidCell(col, row)) return null;
        return { col, row };
    }
    
    /**
     * Menzildeki hücreleri döndürür
     */
    getCellsInRange(centerCol, centerRow, range) {
        const cells = [];
        const rangePixels = range * this.cellSize;
        const center = this.getCellCenter(centerCol, centerRow);
        
        const minCol = Math.max(0, centerCol - Math.ceil(range));
        const maxCol = Math.min(this.cols - 1, centerCol + Math.ceil(range));
        const minRow = Math.max(0, centerRow - Math.ceil(range));
        const maxRow = Math.min(this.rows - 1, centerRow + Math.ceil(range));
        
        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                const cellCenter = this.getCellCenter(col, row);
                const dist = Utils.distance(center.x, center.y, cellCenter.x, cellCenter.y);
                if (dist <= rangePixels) {
                    cells.push({ col, row });
                }
            }
        }
        
        return cells;
    }
    
    /**
     * Tüm kuleleri döndürür
     */
    getAllTowers() {
        const towers = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.cells[row][col].type === CONFIG.CELL_TYPES.TOWER) {
                    towers.push({
                        col,
                        row,
                        tower: this.cells[row][col].tower
                    });
                }
            }
        }
        return towers;
    }
}
