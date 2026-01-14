/**
 * Tower Defense - Main Entry Point
 * Oyun başlatıcı
 * @version 1.0.0
 */

// Global game instance
let game = null;

/**
 * Sayfa yüklenince başlat
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM yüklendi...');
    
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('Canvas bulunamadı!');
        return;
    }
    
    try {
        game = new Game(canvas);
        game.init();
        window.game = game; // Debug için
    } catch (error) {
        console.error('Oyun başlatma hatası:', error);
    }
    
    // PWA Install prompt
    setupInstallPrompt();
});

/**
 * Sayfa görünürlük değişince
 */
document.addEventListener('visibilitychange', () => {
    if (!game) return;
    // İleride pause/resume eklenebilir
});

/**
 * PWA Install prompt ayarları
 */
let deferredPrompt = null;

function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallBanner();
    });
    
    // Install button
    document.getElementById('install-btn')?.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('PWA Install:', outcome);
        deferredPrompt = null;
        hideInstallBanner();
    });
    
    // Close button
    document.getElementById('install-close')?.addEventListener('click', () => {
        hideInstallBanner();
    });
}

function showInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) banner.classList.remove('hidden');
}

function hideInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) banner.classList.add('hidden');
}

/**
 * Service Worker güncelleme kontrolü
 */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Yeni versiyon yüklendi, sayfa yenileniyor...');
        window.location.reload();
    });
}
