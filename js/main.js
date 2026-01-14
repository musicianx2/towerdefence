/**
 * Tower Defense - Main Entry Point
 * Mobil uyumlu başlatıcı
 * @version 1.3.0
 */

let game = null;
let mobileInput = null;

/**
 * Sayfa yüklenince başlat
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('='.repeat(50));
    console.log(`Tower Defense v${CONFIG.VERSION} (Build: ${CONFIG.BUILD})`);
    console.log('='.repeat(50));
    
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('Canvas bulunamadı!');
        return;
    }
    
    // Mobil input referansı
    mobileInput = document.getElementById('mobile-name-input');
    setupMobileInput();
    
    // Canvas'ı ekrana sığdır
    resizeCanvas(canvas);
    window.addEventListener('resize', () => resizeCanvas(canvas));
    window.addEventListener('orientationchange', () => {
        setTimeout(() => resizeCanvas(canvas), 100);
    });
    
    try {
        game = new Game(canvas);
        game.init();
        window.game = game;
    } catch (error) {
        console.error('Oyun başlatma hatası:', error);
    }
    
    // PWA Install prompt
    setupInstallPrompt();
});

/**
 * Canvas'ı ekrana sığdır
 */
function resizeCanvas(canvas) {
    const container = document.getElementById('game-container');
    if (!container) return;
    
    const baseWidth = CONFIG.CANVAS.WIDTH;
    const baseHeight = CONFIG.CANVAS.HEIGHT;
    
    // Ekran boyutları
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Oran hesapla
    const scaleX = screenWidth / baseWidth;
    const scaleY = screenHeight / baseHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Max 1x
    
    // Canvas boyutunu ayarla
    canvas.width = baseWidth;
    canvas.height = baseHeight;
    
    // Container'ı scale et
    const finalWidth = baseWidth * scale;
    const finalHeight = baseHeight * scale;
    
    container.style.width = finalWidth + 'px';
    container.style.height = finalHeight + 'px';
    canvas.style.width = finalWidth + 'px';
    canvas.style.height = finalHeight + 'px';
    
    // Scale faktörünü kaydet (touch için)
    canvas.dataset.scale = scale;
    
    console.log(`Canvas: ${baseWidth}x${baseHeight} → ${Math.round(finalWidth)}x${Math.round(finalHeight)} (${Math.round(scale*100)}%)`);
}

/**
 * Mobil isim girişi ayarları
 */
function setupMobileInput() {
    if (!mobileInput) return;
    
    // Input değişince MenuManager'a bildir
    mobileInput.addEventListener('input', (e) => {
        if (game?.menuManager) {
            game.menuManager.inputText = e.target.value;
            game.menuManager.inputError = '';
        }
    });
    
    // Enter'a basınca submit
    mobileInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (game?.menuManager) {
                game.menuManager.submitPlayerName();
            }
            hideMobileInput();
        }
    });
    
    // Focus kaybedince gizle
    mobileInput.addEventListener('blur', () => {
        // Küçük gecikme - buton tıklaması için
        setTimeout(() => {
            if (document.activeElement !== mobileInput) {
                hideMobileInput();
            }
        }, 200);
    });
}

/**
 * Mobil input'u göster
 */
function showMobileInput(currentText = '') {
    if (!mobileInput) return;
    
    mobileInput.value = currentText;
    mobileInput.classList.add('active');
    
    // Mobil cihazlarda klavyeyi aç
    setTimeout(() => {
        mobileInput.focus();
        mobileInput.click();
    }, 50);
}

/**
 * Mobil input'u gizle
 */
function hideMobileInput() {
    if (!mobileInput) return;
    
    mobileInput.classList.remove('active');
    mobileInput.blur();
}

/**
 * Mobil input aktif mi?
 */
function isMobileInputActive() {
    return mobileInput?.classList.contains('active');
}

/**
 * Sayfa görünürlük değişince
 */
document.addEventListener('visibilitychange', () => {
    if (!game) return;
    if (document.hidden) {
        hideMobileInput();
    }
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
    
    document.getElementById('install-btn')?.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('PWA Install:', outcome);
        deferredPrompt = null;
        hideInstallBanner();
    });
    
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
 * Service Worker güncelleme
 */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Yeni versiyon, sayfa yenileniyor...');
        window.location.reload();
    });
}
