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

// Speed button handler
document.addEventListener('click', (e) => {
    if (e.target.id === 'speed-btn' && game) {
        game.cycleSpeed();
    }
});

// Ability buttons handler
document.addEventListener('click', (e) => {
    const abilityBtn = e.target.closest('.ability-btn');
    if (!abilityBtn || !game) return;
    
    const abilityId = abilityBtn.dataset.ability;
    if (!abilityId) return;
    
    // Meteor için hedef seçimi gerekiyor
    if (abilityId === 'meteor') {
        if (game.selectedAbility === 'meteor') {
            // İptal et
            game.selectedAbility = null;
            abilityBtn.classList.remove('selected');
            game.showMessage('Meteor iptal edildi', '#888');
        } else {
            // Seç
            document.querySelectorAll('.ability-btn').forEach(b => b.classList.remove('selected'));
            game.selectedAbility = 'meteor';
            abilityBtn.classList.add('selected');
            game.showMessage('Haritada hedef seç!', '#ff4500');
        }
    } else {
        // Diğer yetenekler direkt kullanılır
        game.useAbility(abilityId);
    }
});

// Keyboard shortcut for speed (H key)
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'h' && game && game.state !== 'menu') {
        game.cycleSpeed();
    }
    // M tuşu ile mute toggle
    if (e.key.toLowerCase() === 'm' && game && game.state !== 'menu') {
        toggleMute();
    }
});

// ==================== SES KONTROL ====================

// Ses menüsü toggle
document.addEventListener('click', (e) => {
    if (e.target.id === 'sound-btn' || e.target.closest('#sound-btn')) {
        document.getElementById('sound-menu')?.classList.toggle('hidden');
    } else if (!e.target.closest('#sound-menu')) {
        document.getElementById('sound-menu')?.classList.add('hidden');
    }
});

// Volume slider
document.getElementById('volume-slider')?.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    soundManager.setVolume(value / 100);
    document.getElementById('volume-value').textContent = `${value}%`;
    updateSoundButton();
    
    // localStorage'a kaydet
    localStorage.setItem('td_volume', value);
});

// Mute button
document.getElementById('mute-btn')?.addEventListener('click', toggleMute);

function toggleMute() {
    const isEnabled = soundManager.toggle();
    updateSoundButton();
    updateMuteButton(isEnabled);
    
    // localStorage'a kaydet
    localStorage.setItem('td_sound_enabled', isEnabled);
}

function updateSoundButton() {
    const btn = document.getElementById('sound-btn');
    if (!btn) return;
    
    if (!soundManager.enabled) {
        btn.textContent = '🔇';
        btn.classList.add('muted');
    } else if (soundManager.volume < 0.3) {
        btn.textContent = '🔉';
        btn.classList.remove('muted');
    } else {
        btn.textContent = '🔊';
        btn.classList.remove('muted');
    }
}

function updateMuteButton(isEnabled) {
    const btn = document.getElementById('mute-btn');
    if (!btn) return;
    
    if (isEnabled) {
        btn.textContent = '🔇 Sessize Al';
        btn.classList.remove('unmute');
    } else {
        btn.textContent = '🔊 Sesi Aç';
        btn.classList.add('unmute');
    }
}

// Sayfa yüklenince kayıtlı ses ayarlarını yükle
function loadSoundSettings() {
    const savedVolume = localStorage.getItem('td_volume');
    const savedEnabled = localStorage.getItem('td_sound_enabled');
    
    if (savedVolume !== null) {
        const vol = parseInt(savedVolume);
        soundManager.setVolume(vol / 100);
        const slider = document.getElementById('volume-slider');
        if (slider) slider.value = vol;
        const valueEl = document.getElementById('volume-value');
        if (valueEl) valueEl.textContent = `${vol}%`;
    }
    
    if (savedEnabled !== null) {
        soundManager.enabled = savedEnabled === 'true';
        updateMuteButton(soundManager.enabled);
    }
    
    updateSoundButton();
}

// DOM yüklenince ayarları yükle
document.addEventListener('DOMContentLoaded', loadSoundSettings);

/**
 * Service Worker güncelleme
 */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Yeni versiyon, sayfa yenileniyor...');
        window.location.reload();
    });
}
