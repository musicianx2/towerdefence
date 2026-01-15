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
        this.theme = CONFIG.THEMES.summer; // Varsayılan tema
    }
    
    setTheme(theme) {
        this.theme = theme;
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawBackground() {
        this.ctx.fillStyle = this.theme.EMPTY || CONFIG.COLORS.EMPTY;
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
            case CONFIG.CELL_TYPES.ROCK: this.drawRock(x, y, size); break;
            case CONFIG.CELL_TYPES.ICE: this.drawIce(x, y, size); break;
            case CONFIG.CELL_TYPES.LAVA: this.drawLava(x, y, size); break;
            case CONFIG.CELL_TYPES.SAND: this.drawSand(x, y, size); break;
            case CONFIG.CELL_TYPES.CACTUS: this.drawCactus(x, y, size); break;
        }
    }
    
    drawLava(x, y, size) {
        // Lava base
        this.ctx.fillStyle = this.theme.LAVA || '#ff4500';
        this.ctx.fillRect(x, y, size, size);
        // Parlak noktalar
        this.ctx.fillStyle = this.theme.LAVA_LIGHT || '#ff6a00';
        this.ctx.beginPath();
        this.ctx.arc(x + 8, y + 10, 4, 0, Math.PI * 2);
        this.ctx.arc(x + 22, y + 20, 3, 0, Math.PI * 2);
        this.ctx.arc(x + 14, y + 26, 5, 0, Math.PI * 2);
        this.ctx.fill();
        // Karanlık noktalar
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.beginPath();
        this.ctx.arc(x + 18, y + 8, 3, 0, Math.PI * 2);
        this.ctx.arc(x + 6, y + 22, 4, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawSand(x, y, size) {
        this.ctx.fillStyle = this.theme.SAND || '#e8d4a8';
        this.ctx.fillRect(x, y, size, size);
        // Kum dalgaları
        this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 2, y + 10);
        this.ctx.quadraticCurveTo(x + 16, y + 6, x + 30, y + 10);
        this.ctx.moveTo(x + 2, y + 22);
        this.ctx.quadraticCurveTo(x + 16, y + 26, x + 30, y + 22);
        this.ctx.stroke();
    }
    
    drawCactus(x, y, size) {
        const cx = x + size / 2, cy = y + size / 2;
        // Gövde
        this.ctx.fillStyle = this.theme.CACTUS || '#228b22';
        this.ctx.fillRect(cx - 4, cy - 10, 8, 20);
        // Kollar
        this.ctx.fillRect(cx - 12, cy - 4, 8, 6);
        this.ctx.fillRect(cx - 12, cy - 10, 4, 8);
        this.ctx.fillRect(cx + 4, cy, 8, 6);
        this.ctx.fillRect(cx + 8, cy - 6, 4, 8);
        // Dikenler
        this.ctx.fillStyle = '#1a5a1a';
        for (let i = 0; i < 5; i++) {
            this.ctx.fillRect(cx - 3 + (i % 2) * 4, cy - 8 + i * 4, 2, 2);
        }
    }
    
    drawRock(x, y, size) {
        const cx = x + size / 2, cy = y + size / 2;
        this.ctx.fillStyle = this.theme.ROCK || '#808080';
        this.ctx.beginPath();
        this.ctx.moveTo(cx - 10, cy + 8);
        this.ctx.lineTo(cx - 8, cy - 6);
        this.ctx.lineTo(cx + 2, cy - 10);
        this.ctx.lineTo(cx + 12, cy - 4);
        this.ctx.lineTo(cx + 10, cy + 10);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.fillStyle = Utils.lightenColor(this.theme.ROCK || '#808080', 20);
        this.ctx.beginPath();
        this.ctx.moveTo(cx - 6, cy - 4);
        this.ctx.lineTo(cx, cy - 8);
        this.ctx.lineTo(cx + 6, cy - 2);
        this.ctx.lineTo(cx + 2, cy + 2);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawIce(x, y, size) {
        // Donmuş su
        this.ctx.fillStyle = this.theme.ICE || '#b0e0e6';
        this.ctx.fillRect(x, y, size, size);
        // Parlama efekti
        this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
        this.ctx.beginPath();
        this.ctx.moveTo(x + 5, y + 5);
        this.ctx.lineTo(x + 15, y + 5);
        this.ctx.lineTo(x + 10, y + 12);
        this.ctx.closePath();
        this.ctx.fill();
        // Çatlak çizgileri
        this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 8, y + 15);
        this.ctx.lineTo(x + 20, y + 25);
        this.ctx.moveTo(x + 22, y + 10);
        this.ctx.lineTo(x + 28, y + 20);
        this.ctx.stroke();
    }
    
    drawPath(x, y, size) {
        this.ctx.fillStyle = this.theme.PATH || CONFIG.COLORS.PATH;
        this.ctx.fillRect(x, y, size, size);
        this.ctx.fillStyle = this.theme.PATH_BORDER || CONFIG.COLORS.PATH_BORDER;
        this.ctx.fillRect(x, y, size, 3);
        this.ctx.fillRect(x, y + size - 3, size, 3);
    }
    
    drawTree(x, y, size) {
        const cx = x + size / 2, cy = y + size / 2;
        this.ctx.fillStyle = this.theme.TREE_TRUNK || CONFIG.COLORS.TREE_TRUNK;
        this.ctx.fillRect(cx - 3, cy + 2, 6, 10);
        this.ctx.fillStyle = this.theme.TREE || CONFIG.COLORS.TREE;
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
        
        // Kış temasında kar ekle
        if (this.theme.SNOW) {
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.arc(cx - 5, cy - 8, 3, 0, Math.PI * 2);
            this.ctx.arc(cx + 5, cy - 5, 2, 0, Math.PI * 2);
            this.ctx.arc(cx, cy - 14, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawWater(x, y, size) {
        this.ctx.fillStyle = this.theme.WATER || CONFIG.COLORS.WATER;
        this.ctx.fillRect(x, y, size, size);
        this.ctx.fillStyle = this.theme.WATER_LIGHT || CONFIG.COLORS.WATER_LIGHT;
        const time = Date.now();
        for (let i = 0; i < 3; i++) {
            const wx = x + ((i * 10 + time / 500) % size);
            const wy = y + size / 2 + Math.sin((wx + time / 200) * 0.5) * 3;
            this.ctx.beginPath();
            this.ctx.arc(wx, wy, 3, 0, Math.PI);
            this.ctx.fill();
        }
        
        // Kış temasında buz efekti
        if (this.theme.ICE) {
            this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x + 5, y + 5);
            this.ctx.lineTo(x + size - 5, y + size - 5);
            this.ctx.moveTo(x + size - 5, y + 5);
            this.ctx.lineTo(x + 5, y + size - 5);
            this.ctx.stroke();
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
    
    drawMessage(message, color, isWarning = false) {
        if (isWarning) {
            // Uyarı mesajları - sol alt köşede küçük
            const x = 120, y = this.canvas.height - 60;
            this.ctx.font = 'bold 14px Arial';
            const tw = this.ctx.measureText(message).width;
            
            this.ctx.fillStyle = 'rgba(0,0,0,0.85)';
            this.ctx.beginPath();
            this.ctx.roundRect(x - 10, y - 12, tw + 20, 24, 6);
            this.ctx.fill();
            
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            this.ctx.fillStyle = color;
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(message, x, y);
        } else {
            // Önemli mesajlar (zafer, yenilgi) - ortada büyük
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
