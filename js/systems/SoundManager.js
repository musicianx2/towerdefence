/**
 * Tower Defense - Sound Manager
 * Web Audio API ile ses efektleri
 * @version 1.0.0
 */

class SoundManager {
    constructor() {
        this.enabled = CONFIG.SOUNDS?.enabled ?? true;
        this.volume = CONFIG.SOUNDS?.volume ?? 0.3;
        this.audioContext = null;
        this.initialized = false;
    }
    
    /**
     * Audio Context başlat (kullanıcı etkileşimi gerektirir)
     */
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('SoundManager initialized');
        } catch (e) {
            console.warn('Web Audio API desteklenmiyor:', e);
            this.enabled = false;
        }
    }
    
    /**
     * Ses efekti çal
     */
    play(effectName) {
        if (!this.enabled || !this.initialized) return;
        if (!this.audioContext) this.init();
        
        const effect = CONFIG.SOUNDS?.effects?.[effectName];
        if (!effect) return;
        
        try {
            // Oscillator oluştur
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = effect.type || 'sine';
            oscillator.frequency.value = effect.frequency || 440;
            
            const now = this.audioContext.currentTime;
            const duration = effect.duration || 0.1;
            
            // Volume
            gainNode.gain.setValueAtTime(this.volume, now);
            
            // Rise effect (yükselen ton)
            if (effect.rise) {
                oscillator.frequency.setValueAtTime(effect.frequency * 0.5, now);
                oscillator.frequency.linearRampToValueAtTime(effect.frequency, now + duration);
            }
            
            // Decay effect (azalan)
            if (effect.decay) {
                gainNode.gain.linearRampToValueAtTime(0, now + duration);
            } else {
                gainNode.gain.setValueAtTime(this.volume, now + duration * 0.8);
                gainNode.gain.linearRampToValueAtTime(0, now + duration);
            }
            
            oscillator.start(now);
            oscillator.stop(now + duration);
        } catch (e) {
            // Ses hatası - sessizce geç
        }
    }
    
    /**
     * Çoklu nota çal (melodi)
     */
    playMelody(notes) {
        if (!this.enabled || !this.initialized) return;
        
        notes.forEach((note, i) => {
            setTimeout(() => this.play(note), i * 100);
        });
    }
    
    /**
     * Sesi aç/kapat
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
    
    /**
     * Volume ayarla
     */
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }
}

// Global instance
const soundManager = new SoundManager();

// İlk kullanıcı etkileşiminde başlat
document.addEventListener('click', () => soundManager.init(), { once: true });
document.addEventListener('touchstart', () => soundManager.init(), { once: true });
