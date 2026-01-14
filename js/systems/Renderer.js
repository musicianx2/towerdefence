/**
 * Tower Defense - Renderer
 * Çizim sistemi
 * @version 1.0.0
 */

class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.cellSize = CONFIG.GRID.CELL_SIZE;
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawBackground() {
        this.ctx.fillStyle = CONFIG.COLORS.EMPTY;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawGrid(grid) {
        for (let row = 0; row < grid.rows; row++) {
            for (let col = 0; col < grid.cols; col++) {
                const cell = grid.getCell(col, row);
                this.drawCell(col, row, cell.type);
            }
        }
        if (CONFIG.DEBUG.SHOW_GRID) this.drawGridLines(grid);
    }
    
    drawCell(col, row, cellType) {
        const x = col * this.cellSize;
        const y = row * this.cellSize;
        const size = this.cellSize;
        
        switch (cellType) {
            case CONFIG.CELL_TYPES.PATH: this.drawPath(x, y, size); break;
            case CONFIG.CELL_TYPES.TREE: this.drawTree(x, y, size); break;
            case CONFIG.CELL_TYPES.WATER: this.drawWater(x, y, size); break;
            case CONFIG.CELL_TYPES.SPAWN: this.drawSpawn(x, y, size); break;
            case CONFIG.CELL_TYPES.BASE: this.drawBase(x, y, size); break;
        }
    }
    
    drawPath(x, y, size) {
        this.ctx.fillStyle = CONFIG.COLORS.PATH;
        this.ctx.fillRect(x, y, size, size);
        this.ctx.fillStyle = CONFIG.COLORS.PATH_BORDER;
        this.ctx.fillRect(x, y, size, 3);
        this.ctx.fillRect(x, y + size - 3, size, 3);
    }
    
    drawTree(x, y, size) {
        const cx = x + size / 2, cy = y + size / 2;
        this.ctx.fillStyle = CONFIG.COLORS.TREE_TRUNK;
        this.ctx.fillRect(cx - 3, cy + 2, 6, 10);
        this.ctx.fillStyle = CONFIG.COLORS.TREE;
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - 12);
        this.ctx.lineTo(cx - 12, cy + 4);
        this.ctx.lineTo(cx + 12, cy + 4);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - 16);
        this.ctx.lineTo(cx - 9, cy - 4);
        this.ctx.lineTo(cx + 9, cy - 4);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawWater(x, y, size) {
        this.ctx.fillStyle = CONFIG.COLORS.WATER;
        this.ctx.fillRect(x, y, size, size);
        this.ctx.fillStyle = CONFIG.COLORS.WATER_LIGHT;
        const time = Date.now();
        for (let i = 0; i < 3; i++) {
            const wx = x + ((i * 10 + time / 500) % size);
            const wy = y + size / 2 + Math.sin((wx + time / 200) * 0.5) * 3;
            this.ctx.beginPath();
            this.ctx.arc(wx, wy, 3, 0, Math.PI);
            this.ctx.fill();
        }
    }
    
    drawSpawn(x, y, size) {
        this.drawPath(x, y, size);
        const cx = x + size / 2, cy = y + size / 2;
        this.ctx.fillStyle = CONFIG.COLORS.SPAWN;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, size / 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.moveTo(cx + 6, cy);
        this.ctx.lineTo(cx - 4, cy - 5);
        this.ctx.lineTo(cx - 4, cy + 5);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawBase(x, y, size) {
        this.drawPath(x, y, size);
        const cx = x + size / 2, cy = y + size / 2;
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(cx - 10, cy - 6, 20, 14);
        this.ctx.fillStyle = CONFIG.COLORS.BASE;
        this.ctx.fillRect(cx - 10, cy - 12, 6, 8);
        this.ctx.fillRect(cx - 3, cy - 12, 6, 8);
        this.ctx.fillRect(cx + 4, cy - 12, 6, 8);
        this.ctx.fillStyle = '#5c3317';
        this.ctx.fillRect(cx - 4, cy, 8, 8);
        this.ctx.fillStyle = CONFIG.COLORS.BASE;
        this.ctx.fillRect(cx - 1, cy - 18, 2, 10);
        this.ctx.fillStyle = '#ff0000';
        this.ctx.beginPath();
        this.ctx.moveTo(cx + 1, cy - 18);
        this.ctx.lineTo(cx + 10, cy - 14);
        this.ctx.lineTo(cx + 1, cy - 10);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawGridLines(grid) {
        this.ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
        this.ctx.lineWidth = 1;
        for (let col = 0; col <= grid.cols; col++) {
            this.ctx.beginPath();
            this.ctx.moveTo(col * this.cellSize, 0);
            this.ctx.lineTo(col * this.cellSize, grid.rows * this.cellSize);
            this.ctx.stroke();
        }
        for (let row = 0; row <= grid.rows; row++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, row * this.cellSize);
            this.ctx.lineTo(grid.cols * this.cellSize, row * this.cellSize);
            this.ctx.stroke();
        }
    }
    
    drawRangePreview(col, row, range, isValid) {
        const cx = col * this.cellSize + this.cellSize / 2;
        const cy = row * this.cellSize + this.cellSize / 2;
        const radius = range * this.cellSize;
        
        this.ctx.fillStyle = isValid ? CONFIG.COLORS.RANGE_VALID : CONFIG.COLORS.RANGE_INVALID;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = isValid ? 'rgba(0,255,0,0.5)' : 'rgba(255,0,0,0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        this.ctx.strokeStyle = isValid ? '#00ff00' : '#ff0000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(col * this.cellSize + 2, row * this.cellSize + 2, this.cellSize - 4, this.cellSize - 4);
    }
    
    drawTowerPreview(col, row, towerType, isValid) {
        const cfg = CONFIG.TOWERS[towerType];
        if (!cfg) return;
        const cx = col * this.cellSize + this.cellSize / 2;
        const cy = row * this.cellSize + this.cellSize / 2;
        
        this.ctx.globalAlpha = 0.7;
        this.ctx.fillStyle = isValid ? cfg.color : '#ff0000';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, this.cellSize / 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(cfg.icon, cx, cy);
        this.ctx.globalAlpha = 1.0;
    }
    
    drawFPS(fps) {
        if (!CONFIG.DEBUG.SHOW_FPS) return;
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(this.canvas.width - 60, this.canvas.height - 25, 55, 20);
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`FPS: ${fps}`, this.canvas.width - 8, this.canvas.height - 15);
    }
    
    drawPrepTimer(seconds) {
        const cx = this.canvas.width / 2, cy = 50;
        this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this.ctx.beginPath();
        this.ctx.roundRect(cx - 120, cy - 20, 240, 40, 8);
        this.ctx.fill();
        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`⏱️ Kule yerleştir! Kalan: ${Math.ceil(seconds)}s`, cx, cy);
    }
    
    drawMessage(message, color) {
        const cx = this.canvas.width / 2, cy = this.canvas.height / 2;
        this.ctx.font = 'bold 24px Arial';
        const tw = this.ctx.measureText(message).width;
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.beginPath();
        this.ctx.roundRect(cx - tw / 2 - 30, cy - 30, tw + 60, 60, 10);
        this.ctx.fill();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        this.ctx.fillStyle = color;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(message, cx, cy);
    }
    
    drawEnemyCount(count) {
        const x = 10, y = this.canvas.height - 30;
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(x, y, 100, 25);
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`👹 Kalan: ${count}`, x + 10, y + 12);
    }
}
