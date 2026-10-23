// ========================================================
// Solo Leveling System - Game Engine & Sound Controller
// Web Audio SFX, LocalStorage Persistence, Themes & Penalty Zone
// ========================================================

// ========================================================
// 1. Dark, Cinematic Anime SFX Engine (Solo Leveling Aesthetics)
// Zero-dependency, Zero Latency Web Audio API Synthesis
// ========================================================
const SoundEngine = {
    ctx: null,
    muted: false,

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('SOLO_LEVELING_SFX_MUTED', JSON.stringify(this.muted));
        this.updateMuteButton();
        if (!this.muted) {
            this.playClick();
        }
        return this.muted;
    },

    updateMuteButton() {
        const btn = document.getElementById('sfxToggleBtn');
        if (btn) {
            if (this.muted) {
                btn.textContent = '🔇';
                btn.classList.add('muted');
                btn.title = 'SFX Muted (Click to Unmute)';
            } else {
                btn.textContent = '🔊';
                btn.classList.remove('muted');
                btn.title = 'SFX Active (Click to Mute)';
            }
        }
    },

    // Brown/Pink Noise Buffer for Organic Iron, Stone & Atmosphere Textures
    createNoiseBuffer(duration = 1.0) {
        if (!this.ctx) return null;
        const sampleRate = this.ctx.sampleRate;
        const frameCount = Math.floor(sampleRate * duration);
        const buffer = this.ctx.createBuffer(1, frameCount, sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < frameCount; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.025 * white)) / 1.025;
            lastOut = data[i];
            data[i] *= 3.8; // Boost level after brown filter
        }
        return buffer;
    },

    // Soft Saturation / Distortion Curve for Bass & Impact Weight
    createDistortionCurve(amount = 25) {
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }
        return curve;
    },

    // A. Tactical Mechanical Click / Haptic Snap (Replaces arcade beep)
    playClick() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;

            // 1. Low-frequency punch transient
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(95, now);
            osc.frequency.exponentialRampToValueAtTime(32, now + 0.035);

            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.04);

            // 2. High metallic snap tick
            const clickOsc = this.ctx.createOscillator();
            const clickGain = this.ctx.createGain();
            clickOsc.type = 'triangle';
            clickOsc.frequency.setValueAtTime(1800, now);
            clickOsc.frequency.exponentialRampToValueAtTime(350, now + 0.015);

            clickGain.gain.setValueAtTime(0.10, now);
            clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

            clickOsc.connect(clickGain);
            clickGain.connect(this.ctx.destination);
            clickOsc.start(now);
            clickOsc.stop(now + 0.02);
        } catch (e) {
            console.error('SFX Error:', e);
        }
    },

    // B. Heavy Iron Chains Scraping & Slit Collapse Transition (0.75s)
    playSlitCollapse() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const duration = 0.85;

            // 1. Procedural Heavy Iron Chains Scraping Texture
            const noise = this.createNoiseBuffer(duration);
            if (noise) {
                const noiseSource = this.ctx.createBufferSource();
                noiseSource.buffer = noise;

                // Resonant bandpass filter 1 (iron friction)
                const bp1 = this.ctx.createBiquadFilter();
                bp1.type = 'bandpass';
                bp1.frequency.setValueAtTime(780, now);
                bp1.frequency.linearRampToValueAtTime(1450, now + 0.4);
                bp1.frequency.exponentialRampToValueAtTime(450, now + duration);
                bp1.Q.setValueAtTime(14, now);

                // Resonant bandpass filter 2 (metallic screech)
                const bp2 = this.ctx.createBiquadFilter();
                bp2.type = 'bandpass';
                bp2.frequency.setValueAtTime(2400, now);
                bp2.frequency.linearRampToValueAtTime(3100, now + 0.35);
                bp2.frequency.exponentialRampToValueAtTime(800, now + duration);
                bp2.Q.setValueAtTime(18, now);

                const chainGain = this.ctx.createGain();
                chainGain.gain.setValueAtTime(0.01, now);
                chainGain.gain.linearRampToValueAtTime(0.28, now + 0.18);
                chainGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

                noiseSource.connect(bp1);
                noiseSource.connect(bp2);
                bp1.connect(chainGain);
                bp2.connect(chainGain);
                chainGain.connect(this.ctx.destination);

                noiseSource.start(now);
                noiseSource.stop(now + duration);
            }

            // 2. Metallic Ring Modulator Clangs (Chain Links Clattering)
            [540, 890, 1420].forEach((freq, idx) => {
                const clangOsc = this.ctx.createOscillator();
                const clangGain = this.ctx.createGain();
                const startTime = now + (idx * 0.12);

                clangOsc.type = 'sawtooth';
                clangOsc.frequency.setValueAtTime(freq, startTime);
                clangOsc.frequency.exponentialRampToValueAtTime(freq * 0.6, startTime + 0.22);

                const clangFilter = this.ctx.createBiquadFilter();
                clangFilter.type = 'bandpass';
                clangFilter.frequency.setValueAtTime(freq, startTime);
                clangFilter.Q.setValueAtTime(12, startTime);

                clangGain.gain.setValueAtTime(0.09, startTime);
                clangGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

                clangOsc.connect(clangFilter);
                clangFilter.connect(clangGain);
                clangGain.connect(this.ctx.destination);

                clangOsc.start(startTime);
                clangOsc.stop(startTime + 0.25);
            });

            // 3. Deep Sub-Bass Vacuum Implosion
            const subOsc = this.ctx.createOscillator();
            const subGain = this.ctx.createGain();
            const subFilter = this.ctx.createBiquadFilter();
            const waveshaper = this.ctx.createWaveShaper();

            subOsc.type = 'sawtooth';
            subOsc.frequency.setValueAtTime(95, now);
            subOsc.frequency.exponentialRampToValueAtTime(26, now + 0.72);

            subFilter.type = 'lowpass';
            subFilter.frequency.setValueAtTime(380, now);
            subFilter.frequency.exponentialRampToValueAtTime(45, now + 0.72);

            waveshaper.curve = this.createDistortionCurve(30);

            subGain.gain.setValueAtTime(0.05, now);
            subGain.gain.linearRampToValueAtTime(0.35, now + 0.25);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

            subOsc.connect(subFilter);
            subFilter.connect(waveshaper);
            waveshaper.connect(subGain);
            subGain.connect(this.ctx.destination);

            subOsc.start(now);
            subOsc.stop(now + 0.78);

            // 4. Heavy Mechanical Iron Latch at 0.68s
            setTimeout(() => {
                if (this.muted || !this.ctx) return;
                const latchNow = this.ctx.currentTime;
                const latchOsc = this.ctx.createOscillator();
                const latchGain = this.ctx.createGain();
                latchOsc.type = 'triangle';
                latchOsc.frequency.setValueAtTime(135, latchNow);
                latchOsc.frequency.exponentialRampToValueAtTime(30, latchNow + 0.08);

                latchGain.gain.setValueAtTime(0.25, latchNow);
                latchGain.gain.exponentialRampToValueAtTime(0.001, latchNow + 0.08);

                latchOsc.connect(latchGain);
                latchGain.connect(this.ctx.destination);
                latchOsc.start(latchNow);
                latchOsc.stop(latchNow + 0.09);
            }, 680);

        } catch (e) {
            console.error('SFX Error:', e);
        }
    },

    // C. Eerie Atmospheric Echoes & Dark Hologram Card Open
    playCardOpen() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;

            // 1. Atmospheric Reverse Shadow Whoosh
            const noise = this.createNoiseBuffer(0.45);
            if (noise) {
                const noiseSrc = this.ctx.createBufferSource();
                noiseSrc.buffer = noise;
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(160, now);
                filter.frequency.exponentialRampToValueAtTime(2600, now + 0.35);
                filter.Q.setValueAtTime(6, now);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.01, now);
                gain.gain.linearRampToValueAtTime(0.22, now + 0.3);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

                noiseSrc.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);

                noiseSrc.start(now);
                noiseSrc.stop(now + 0.46);
            }

            // 2. Solo Leveling Monarch Dissonant Minor Chord (D3, F3, G#3, C#4)
            // Eerie, ominous, unmistakably royal and otherworldly
            const chordNotes = [146.83, 174.61, 207.65, 277.18];
            chordNotes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + 0.08);

                // Slight subtle detune for ghostly chorusing
                if (idx % 2 === 1) osc.detune.setValueAtTime(4, now);

                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.12, now + 0.22);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

                // Multi-Tap Cavernous Delay
                const delay1 = this.ctx.createDelay();
                delay1.delayTime.setValueAtTime(0.14, now);
                const delayGain1 = this.ctx.createGain();
                delayGain1.gain.setValueAtTime(0.35, now);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                gain.connect(delay1);
                delay1.connect(delayGain1);
                delayGain1.connect(this.ctx.destination);

                osc.start(now + 0.08);
                osc.stop(now + 1.3);
            });

            // 3. Low Sub-Bass Monarch Presence (42Hz)
            const sub = this.ctx.createOscillator();
            const subGain = this.ctx.createGain();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(42, now);
            subGain.gain.setValueAtTime(0.001, now);
            subGain.gain.linearRampToValueAtTime(0.24, now + 0.25);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

            sub.connect(subGain);
            subGain.connect(this.ctx.destination);
            sub.start(now);
            sub.stop(now + 1.0);

        } catch (e) {
            console.error('SFX Error:', e);
        }
    },

    // D. Heavy Mechanical Thud & Dark Vacuum Card Close
    playCardClose() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;

            // 1. Dark Inward Suction
            const noise = this.createNoiseBuffer(0.22);
            if (noise) {
                const noiseSrc = this.ctx.createBufferSource();
                noiseSrc.buffer = noise;
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1400, now);
                filter.frequency.exponentialRampToValueAtTime(80, now + 0.2);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

                noiseSrc.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);

                noiseSrc.start(now);
                noiseSrc.stop(now + 0.24);
            }

            // 2. Heavy Iron Gate / Vault Mechanical Strike
            const punchOsc = this.ctx.createOscillator();
            const punchGain = this.ctx.createGain();
            const waveshaper = this.ctx.createWaveShaper();

            punchOsc.type = 'sawtooth';
            punchOsc.frequency.setValueAtTime(160, now + 0.04);
            punchOsc.frequency.exponentialRampToValueAtTime(26, now + 0.25);

            waveshaper.curve = this.createDistortionCurve(25);

            punchGain.gain.setValueAtTime(0.35, now + 0.04);
            punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            punchOsc.connect(waveshaper);
            waveshaper.connect(punchGain);
            punchGain.connect(this.ctx.destination);

            punchOsc.start(now + 0.04);
            punchOsc.stop(now + 0.38);

            // 3. Damped Metallic Ring Resonance (Iron door locking)
            [310, 465].forEach((freq) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + 0.04);
                osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.16);

                gain.gain.setValueAtTime(0.14, now + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + 0.04);
                osc.stop(now + 0.2);
            });

            // 4. Lingering Sub-Bass Thud (32Hz)
            const sub = this.ctx.createOscillator();
            const subGain = this.ctx.createGain();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(34, now + 0.04);
            subGain.gain.setValueAtTime(0.28, now + 0.04);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

            sub.connect(subGain);
            subGain.connect(this.ctx.destination);
            sub.start(now + 0.04);
            sub.stop(now + 0.58);

        } catch (e) {
            console.error('SFX Error:', e);
        }
    },

    // E. Ethereal Crystal Glass System Chime (Quest Complete)
    playQuestComplete() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            // Majestic crystal fifths: E4, B4, E5, G#5
            const notes = [329.63, 493.88, 659.25, 830.61];

            // Sub-bass anchor
            const sub = this.ctx.createOscillator();
            const subGain = this.ctx.createGain();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(65, now);
            subGain.gain.setValueAtTime(0.18, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
            sub.connect(subGain);
            subGain.connect(this.ctx.destination);
            sub.start(now);
            sub.stop(now + 0.48);

            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const startTime = now + (idx * 0.075);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0.001, startTime);
                gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.7);

                // Delay echo for cathedral feel
                const delay = this.ctx.createDelay();
                delay.delayTime.setValueAtTime(0.12, startTime);
                const delayGain = this.ctx.createGain();
                delayGain.gain.setValueAtTime(0.28, startTime);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                gain.connect(delay);
                delay.connect(delayGain);
                delayGain.connect(this.ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.75);
            });
        } catch (e) {
            console.error('SFX Error:', e);
        }
    },

    // F. Epic Monarch Level-Up Fanfare (Thunder, Sub-Bass & Soaring Minor Triad)
    playLevelUp() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;

            // 1. Initial Sub-Bass Thunder Explosion
            const punch = this.ctx.createOscillator();
            const punchGain = this.ctx.createGain();
            punch.type = 'sine';
            punch.frequency.setValueAtTime(80, now);
            punch.frequency.exponentialRampToValueAtTime(28, now + 0.55);

            punchGain.gain.setValueAtTime(0.35, now);
            punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

            punch.connect(punchGain);
            punchGain.connect(this.ctx.destination);
            punch.start(now);
            punch.stop(now + 0.65);

            // 2. Ascending Shadow Monarch Power Chord (D minor progression)
            const monarchChords = [
                { freq: 110.00, time: 0.00 }, // A2
                { freq: 146.83, time: 0.08 }, // D3
                { freq: 174.61, time: 0.16 }, // F3
                { freq: 220.00, time: 0.24 }, // A3
                { freq: 293.66, time: 0.32 }, // D4
                { freq: 349.23, time: 0.40 }, // F4
                { freq: 440.00, time: 0.48 }, // A4
                { freq: 587.33, time: 0.56 }  // D5
            ];

            monarchChords.forEach(note => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();
                const startTime = now + note.time;

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(note.freq, startTime);

                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(note.freq * 3, startTime);
                filter.frequency.exponentialRampToValueAtTime(note.freq * 0.9, startTime + 0.8);

                gain.gain.setValueAtTime(0.001, startTime);
                gain.gain.linearRampToValueAtTime(0.16, startTime + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.85);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.9);
            });

        } catch (e) {
            console.error('SFX Error:', e);
        }
    },

    // G. S-Rank Penalty Zone Ominous Alarm Siren (Throbbing bass drone + Klaxon)
    playPenaltyAlert() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;

            // 1. Dual Detuned Sawtooth Throbbing Industrial Bass (88Hz & 93Hz)
            [88, 93].forEach(freq => {
                const drone = this.ctx.createOscillator();
                const droneGain = this.ctx.createGain();
                const droneFilter = this.ctx.createBiquadFilter();

                drone.type = 'sawtooth';
                drone.frequency.setValueAtTime(freq, now);

                droneFilter.type = 'lowpass';
                droneFilter.frequency.setValueAtTime(320, now);

                droneGain.gain.setValueAtTime(0.18, now);
                droneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

                drone.connect(droneFilter);
                droneFilter.connect(droneGain);
                droneGain.connect(this.ctx.destination);

                drone.start(now);
                drone.stop(now + 0.9);
            });

            // 2. Piercing Downward Alarm Klaxon (2 Pulses)
            [0, 0.38].forEach(offset => {
                const siren = this.ctx.createOscillator();
                const sirenGain = this.ctx.createGain();
                const startTime = now + offset;

                siren.type = 'sawtooth';
                siren.frequency.setValueAtTime(780, startTime);
                siren.frequency.linearRampToValueAtTime(460, startTime + 0.32);

                sirenGain.gain.setValueAtTime(0.20, startTime);
                sirenGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.33);

                siren.connect(sirenGain);
                sirenGain.connect(this.ctx.destination);

                siren.start(startTime);
                siren.stop(startTime + 0.35);
            });

        } catch (e) {
            console.error('SFX Error:', e);
        }
    },

    // H. Monarch Shadow Extraction / "ARISE" (Sub-Bass Surge + Ethereal Spectral Chime)
    playShadowArise() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;

            // 1. Heavy Sub-Bass Monarch Roar (48Hz -> 24Hz)
            const subOsc = this.ctx.createOscillator();
            const subGain = this.ctx.createGain();
            const subFilter = this.ctx.createBiquadFilter();

            subOsc.type = 'sawtooth';
            subOsc.frequency.setValueAtTime(48, now);
            subOsc.frequency.exponentialRampToValueAtTime(24, now + 0.9);

            subFilter.type = 'lowpass';
            subFilter.frequency.setValueAtTime(220, now);
            subFilter.frequency.exponentialRampToValueAtTime(40, now + 0.9);

            subGain.gain.setValueAtTime(0.01, now);
            subGain.gain.linearRampToValueAtTime(0.38, now + 0.2);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

            subOsc.connect(subFilter);
            subFilter.connect(subGain);
            subGain.connect(this.ctx.destination);
            subOsc.start(now);
            subOsc.stop(now + 1.0);

            // 2. Ghostly Spectral Shadow Swell (Reverse Noise whoosh)
            const noise = this.createNoiseBuffer(0.65);
            if (noise) {
                const noiseSrc = this.ctx.createBufferSource();
                noiseSrc.buffer = noise;
                const bp = this.ctx.createBiquadFilter();
                bp.type = 'bandpass';
                bp.frequency.setValueAtTime(320, now);
                bp.frequency.exponentialRampToValueAtTime(1800, now + 0.55);
                bp.Q.setValueAtTime(9, now);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.01, now);
                gain.gain.linearRampToValueAtTime(0.24, now + 0.45);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

                noiseSrc.connect(bp);
                bp.connect(gain);
                gain.connect(this.ctx.destination);
                noiseSrc.start(now);
                noiseSrc.stop(now + 0.68);
            }

            // 3. Ethereal Vocal Formant Resonance ("ARISE" Chime)
            [220, 330, 550, 880].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const startTime = now + 0.15 + (idx * 0.05);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, startTime);
                osc.frequency.exponentialRampToValueAtTime(freq * 1.05, startTime + 0.8);

                gain.gain.setValueAtTime(0.001, startTime);
                gain.gain.linearRampToValueAtTime(0.14, startTime + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.1);

                const delay = this.ctx.createDelay();
                delay.delayTime.setValueAtTime(0.18, startTime);
                const delayGain = this.ctx.createGain();
                delayGain.gain.setValueAtTime(0.3, startTime);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                gain.connect(delay);
                delay.connect(delayGain);
                delayGain.connect(this.ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 1.2);
            });

        } catch (e) {
            console.error('SFX Error:', e);
        }
    },

    // I. Shadow Equip / Tactical Armor Clank
    playShadowEquip() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(420, now);
            osc.frequency.exponentialRampToValueAtTime(85, now + 0.12);

            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.13);
        } catch (e) {
            console.error('SFX Error:', e);
        }
    }
};

window.SoundEngine = SoundEngine;
window.toggleAudio = function () {
    return SoundEngine.toggleMute();
};

// ========================================================
// 2. Dynamic CSS Theme Switcher (Purple, Red, Blue)
// ========================================================
const ThemeManager = {
    activeTheme: 'purple',

    init() {
        const saved = localStorage.getItem('SOLO_LEVELING_ACTIVE_THEME');
        if (saved && ['purple', 'red', 'blue'].includes(saved)) {
            this.setTheme(saved, false);
        } else {
            this.setTheme('purple', false);
        }
    },

    setTheme(theme, playSound = true) {
        this.activeTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('SOLO_LEVELING_ACTIVE_THEME', theme);

        // Update Theme Switcher Dot Active State
        document.querySelectorAll('.theme-dot').forEach(dot => {
            if (dot.classList.contains(theme)) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        if (playSound) {
            SoundEngine.playClick();
        }
    }
};

window.setSystemTheme = function (theme) {
    ThemeManager.setTheme(theme, true);
};

// ========================================================
// 3. Shadow Army / Shadows Vault Definition
// ========================================================
const SHADOW_ARMY = [
    {
        id: 'igris',
        name: 'IGRIS',
        title: 'Blood-Red Knight Commander',
        requiredLevel: 5,
        icon: '⚔️',
        rank: 'COMMANDER',
        bonuses: { STR: 15, AGI: 12 },
        lore: 'A noble knight of immense loyalty clad in crimson armor, wielding dual longswords with blinding speed.',
        quote: 'My blade and eternal soul belong to the Monarch.'
    },
    {
        id: 'tank',
        name: 'TANK',
        title: 'Alpha Ice Bear Leader',
        requiredLevel: 8,
        icon: '🐻',
        rank: 'ELITE KNIGHT',
        bonuses: { VIT: 20, STR: 10 },
        lore: 'A towering beast from the Red Gate, empowered by shadow flames to crush defenses and guard allies.',
        quote: 'A roaring fortress of abyssal fury and endurance.'
    },
    {
        id: 'iron',
        name: 'IRON',
        title: 'Giant Armored Juggernaut',
        requiredLevel: 12,
        icon: '🛡️',
        rank: 'KNIGHT',
        bonuses: { VIT: 18, INT: 8 },
        lore: 'The extracted knight spirit of Kim Chul. Taunts enemy hordes and pulverizes frontline ranks with colossal warhammers.',
        quote: 'Unshakable vanguard shield for the Sovereign.'
    },
    {
        id: 'kaisel',
        name: 'KAISEL',
        title: 'Demon King Wyvern',
        requiredLevel: 15,
        icon: '🐉',
        rank: 'COMMANDER',
        bonuses: { AGI: 18, INT: 14 },
        lore: 'Sky Sovereign born from Baran’s mount. Soars through dungeon skies unleashing dark tempest breath.',
        quote: 'Wings of obsidian storm sweeping above the battlefield.'
    },
    {
        id: 'beru',
        name: 'BERU',
        title: 'Shadow Marshal of the Swarm',
        requiredLevel: 20,
        icon: '👑',
        rank: 'MARSHAL',
        bonuses: { STR: 25, AGI: 22, INT: 16, VIT: 18 },
        lore: 'The terrifying apex predator of Jeju Island. Kneels solely before the Shadow Monarch, eradicating armies alone.',
        quote: 'My liege... all who stand in your path shall be eradicated.'
    }
];

window.SHADOW_ARMY = SHADOW_ARMY;

function getEquippedShadow() {
    if (!player || !player.equippedShadow) return null;
    return SHADOW_ARMY.find(s => s.id === player.equippedShadow) || null;
}
window.getEquippedShadow = getEquippedShadow;

// ========================================================
// 4. Player Game Data & LocalStorage Persistence
// ========================================================
const STORAGE_KEY = 'SOLO_LEVELING_PLAYER_DATA';

const defaultPlayer = {
    name: 'HONEY BADGER',
    job: 'Shadow Monarch',
    title: 'The One Who Overcame...',
    level: 12,
    xp: 750,
    maxXp: 1000,
    hp: 42200,
    maxHp: 42200,
    mp: 8650,
    maxMp: 8650,
    equippedShadow: 'igris', // Default equipped shadow soldier for Level 12
    stats: {
        STR: 45,
        INT: 38,
        AGI: 30,
        VIT: 40,
        PER: 28
    },
    statBonus: {
        STR: 12,
        INT: 8,
        AGI: 10,
        VIT: 15,
        PER: 6
    },
    remainingPoints: 3
};

const defaultQuests = [
    {
        id: 1,
        title: "HEAVY WEIGHTLIFTING",
        desc: "Complete gym session to gain",
        stat: "STR",
        points: 5,
        xpReward: 50,
        icon: "🏋️‍♂️",
        completed: false
    },
    {
        id: 2,
        title: "WEB DEVELOPMENT & CODE",
        desc: "Build system features to gain",
        stat: "INT",
        points: 4,
        xpReward: 50,
        icon: "💻",
        completed: false
    },
    {
        id: 3,
        title: "DRONE DESIGN & ENGINEERING",
        desc: "Analyze flight dynamics to gain",
        stat: "VIT",
        points: 6,
        xpReward: 75,
        icon: "✈️",
        completed: false
    },
    {
        id: 4,
        title: "100 PUSH-UPS & 10KM CONDITIONING",
        desc: "Execute shadow training to gain",
        stat: "AGI",
        points: 5,
        xpReward: 100,
        icon: "🏃‍♂️",
        completed: false
    }
];

let player = { ...defaultPlayer };
let quests = [...defaultQuests];

// Load Player State from LocalStorage
function loadGameData() {
    try {
        const savedName = localStorage.getItem('SOLO_LEVELING_PLAYER_NAME');
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            player = Object.assign({}, defaultPlayer, parsed.player);
            if (parsed.player && parsed.player.equippedShadow !== undefined) {
                player.equippedShadow = parsed.player.equippedShadow;
            }
            if (Array.isArray(parsed.quests) && parsed.quests.length) {
                quests = parsed.quests;
            }
        }
        if (savedName && savedName.trim() !== '') {
            player.name = savedName.trim();
        }

        const savedMute = localStorage.getItem('SOLO_LEVELING_SFX_MUTED');
        if (savedMute !== null) {
            SoundEngine.muted = JSON.parse(savedMute);
            SoundEngine.updateMuteButton();
        }
    } catch (e) {
        console.warn('LocalStorage load failed, fallback to defaults:', e);
    }
}

// Check if Player Name is already saved in LocalStorage
function hasSavedPlayerName() {
    try {
        const directName = localStorage.getItem('SOLO_LEVELING_PLAYER_NAME');
        if (directName && directName.trim() !== '' && directName !== 'PLAYER') {
            return directName.trim();
        }
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            if (parsed && parsed.player && parsed.player.name && parsed.player.name.trim() !== '' && parsed.player.name !== 'PLAYER') {
                return parsed.player.name.trim();
            }
        }
    } catch (e) {
        console.warn('hasSavedPlayerName error:', e);
    }
    return null;
}
window.hasSavedPlayerName = hasSavedPlayerName;

// Save Player State to LocalStorage
function saveGameData() {
    try {
        localStorage.setItem('SOLO_LEVELING_PLAYER_NAME', player.name);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            player: player,
            quests: quests
        }));
    } catch (e) {
        console.warn('LocalStorage save failed:', e);
    }
}
window.saveGameData = saveGameData;
window.loadGameData = loadGameData;
window.player = player;

// Equip or Dismiss Shadow Soldier
window.equipShadow = function (shadowId) {
    const shadow = SHADOW_ARMY.find(s => s.id === shadowId);
    if (!shadow) return;

    if (player.level < shadow.requiredLevel) {
        SoundEngine.playClick();
        showSystemBanner(`🔒 EXTRACTION LOCKED: Reach Hunter Level ${shadow.requiredLevel} to awaken ${shadow.name}`);
        return;
    }

    if (player.equippedShadow === shadowId) {
        player.equippedShadow = null;
        SoundEngine.playShadowEquip();
        showSystemBanner(`⚔️ SHADOW RECALLED: ${shadow.name} returned to the Shadow Domain`);
    } else {
        player.equippedShadow = shadowId;
        SoundEngine.playShadowArise();
        showSystemBanner(`⚡ ARISE! ${shadow.name} (${shadow.title}) is now your active Shadow Vanguard!`);
    }

    saveGameData();
    updateStatusUI();
    renderShadowVault();
};

// Render Shadow Army Vault Section
function renderShadowVault() {
    const grid = document.getElementById('shadowVaultGrid');
    if (!grid) return;
    grid.innerHTML = '';

    SHADOW_ARMY.forEach(shadow => {
        const isUnlocked = player.level >= shadow.requiredLevel;
        const isEquipped = player.equippedShadow === shadow.id;

        const card = document.createElement('div');
        card.className = `shadow-soldier-card ${isUnlocked ? 'unlocked' : 'locked'} ${isEquipped ? 'equipped' : ''}`;

        const bonusPills = Object.entries(shadow.bonuses)
            .map(([stat, val]) => `<span class="shadow-bonus-pill">+${val} ${stat}</span>`)
            .join(' ');

        card.innerHTML = `
            <div class="shadow-card-inner">
                <div class="shadow-card-glow"></div>
                <div class="shadow-card-header">
                    <span class="shadow-rank-badge ${shadow.rank.toLowerCase().replace(/\s+/g, '-')}">${shadow.rank}</span>
                    <span class="shadow-level-badge ${isUnlocked ? 'met' : 'locked'}">
                        ${isUnlocked ? 'EXTRACTED ✓' : `LVL ${shadow.requiredLevel}+`}
                    </span>
                </div>

                <div class="shadow-icon-box">
                    <span class="shadow-icon-display">${shadow.icon}</span>
                    <div class="shadow-aura-smoke"></div>
                </div>

                <div class="shadow-meta">
                    <h3 class="shadow-name">${shadow.name}</h3>
                    <p class="shadow-title">${shadow.title}</p>
                </div>

                <p class="shadow-lore">${shadow.lore}</p>
                <div class="shadow-quote">"${shadow.quote}"</div>

                <div class="shadow-bonuses-box">
                    <span class="shadow-blessing-label">COMMANDER BLESSING:</span>
                    <div class="shadow-pills-wrap">${bonusPills}</div>
                </div>

                <div class="shadow-action-container">
                    ${!isUnlocked
                        ? `<button class="shadow-btn locked-btn" disabled><span>🔒 REQUIRES LVL ${shadow.requiredLevel}</span></button>`
                        : isEquipped
                            ? `<button class="shadow-btn equipped-btn" onclick="equipShadow('${shadow.id}')"><span>✓ VANGUARD ACTIVE (DISMISS)</span></button>`
                            : `<button class="shadow-btn equip-btn" onclick="equipShadow('${shadow.id}')"><span>ARISE // EQUIP ⚔️</span></button>`
                    }
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}
window.renderShadowVault = renderShadowVault;

// Update Status Screen on BOTH Landing Page & System Modal
function updateStatusUI() {
    const activeShadow = getEquippedShadow();
    const shadowBonus = activeShadow ? activeShadow.bonuses : {};

    // 1. Landing Page Player Status
    const landingLvl = document.getElementById('landingLevelBadge');
    if (landingLvl) landingLvl.innerText = `LVL ${player.level}`;

    const landingName = document.getElementById('landingPlayerName');
    if (landingName) landingName.innerText = player.name.toUpperCase();

    const landingJob = document.getElementById('landingJobTitle');
    if (landingJob) landingJob.innerText = `JOB: ${player.job.toUpperCase()}`;

    const landingXpText = document.getElementById('landingXpText');
    if (landingXpText) landingXpText.innerText = `${player.xp} / ${player.maxXp} XP`;

    const landingXpBar = document.getElementById('landingXpBar');
    if (landingXpBar) {
        const pct = Math.min(100, Math.max(0, (player.xp / player.maxXp) * 100));
        landingXpBar.style.width = `${pct}%`;
    }

    const landingStr = document.getElementById('landingStatSTR');
    if (landingStr) landingStr.innerText = player.stats.STR + (shadowBonus.STR || 0);
    const landingInt = document.getElementById('landingStatINT');
    if (landingInt) landingInt.innerText = player.stats.INT + (shadowBonus.INT || 0);
    const landingAgi = document.getElementById('landingStatAGI');
    if (landingAgi) landingAgi.innerText = player.stats.AGI + (shadowBonus.AGI || 0);
    const landingVit = document.getElementById('landingStatVIT');
    if (landingVit) landingVit.innerText = player.stats.VIT + (shadowBonus.VIT || 0);

    // Landing active commander banner
    const landingShadowBanner = document.getElementById('landingShadowBanner');
    if (landingShadowBanner) {
        if (activeShadow) {
            landingShadowBanner.innerHTML = `
                <div class="active-shadow-chip">
                    <span class="shadow-chip-icon">${activeShadow.icon}</span>
                    <div class="shadow-chip-info">
                        <span class="shadow-chip-label">ACTIVE SHADOW COMMANDER</span>
                        <span class="shadow-chip-name">${activeShadow.name} <small>(${activeShadow.title})</small></span>
                    </div>
                    <span class="shadow-chip-bonuses">+${Object.entries(activeShadow.bonuses).map(([s,v])=>`${v} ${s}`).join(', ')}</span>
                </div>
            `;
            landingShadowBanner.classList.remove('hidden');
        } else {
            landingShadowBanner.innerHTML = `
                <div class="no-shadow-chip">
                    <span>⚔️ NO SHADOW COMMANDER EQUIPPED</span>
                    <a href="#shadow-vault" class="vault-jump-link">OPEN VAULT ⚔️</a>
                </div>
            `;
        }
    }

    // 2. System Modal Status Window
    const modalLvl = document.getElementById('statusModalLvl');
    if (modalLvl) modalLvl.innerText = player.level;

    const modalName = document.getElementById('statusPlayerName');
    if (modalName) modalName.innerText = player.name.toUpperCase();

    const nameDisplay = document.getElementById('playerNameDisplay');
    if (nameDisplay) nameDisplay.innerText = player.name.toUpperCase();

    const sysInputs = document.querySelectorAll('.system-input');
    sysInputs.forEach(input => {
        if (document.activeElement !== input && player.name && player.name !== 'PLAYER') {
            input.value = player.name;
        }
    });

    const modalJob = document.getElementById('statusModalJob');
    if (modalJob) modalJob.innerText = player.job;

    const modalTitle = document.getElementById('statusModalTitle');
    if (modalTitle) modalTitle.innerText = player.title;

    // Active Shadow Slot inside Status Modal
    const modalShadowSlot = document.getElementById('modalShadowSlot');
    if (modalShadowSlot) {
        if (activeShadow) {
            modalShadowSlot.innerHTML = `
                <div class="modal-shadow-badge">
                    <span class="slot-icon">${activeShadow.icon}</span>
                    <div class="slot-details">
                        <span class="slot-tag">SHADOW VANGUARD: <b>${activeShadow.name}</b></span>
                        <span class="slot-quote">"${activeShadow.quote}"</span>
                    </div>
                    <button class="slot-change-btn" onclick="equipShadow('${activeShadow.id}')" title="Dismiss Shadow Soldier">DISMISS ✕</button>
                </div>
            `;
            modalShadowSlot.classList.remove('hidden');
        } else {
            modalShadowSlot.innerHTML = `
                <div class="modal-shadow-empty">
                    <span>NO SHADOW SOLDIER EQUIPPED</span>
                    <button class="slot-change-btn" onclick="closeStatusModal(); const v = document.getElementById('shadow-vault'); if(v) v.scrollIntoView({behavior:'smooth'});" title="View Shadow Army Vault">EXTRACT IN VAULT ⚔️</button>
                </div>
            `;
        }
    }

    const modalHpVal = document.getElementById('statusHpVal');
    if (modalHpVal) modalHpVal.innerText = `${player.hp} / ${player.maxHp}`;
    const modalMpVal = document.getElementById('statusMpVal');
    if (modalMpVal) modalMpVal.innerText = `${player.mp} / ${player.maxMp}`;

    const modalHpBar = document.getElementById('statusHpBar');
    if (modalHpBar) {
        const hpPct = Math.min(100, (player.hp / player.maxHp) * 100);
        modalHpBar.style.width = `${hpPct}%`;
    }
    const modalMpBar = document.getElementById('statusMpBar');
    if (modalMpBar) {
        const mpPct = Math.min(100, (player.mp / player.maxMp) * 100);
        modalMpBar.style.width = `${mpPct}%`;
    }

    const modalStr = document.getElementById('modalStatSTR');
    if (modalStr) modalStr.innerText = player.stats.STR + (shadowBonus.STR || 0);
    const modalBonusStr = document.getElementById('modalBonusSTR');
    if (modalBonusStr) modalBonusStr.innerText = shadowBonus.STR ? `(+${player.statBonus.STR} +${shadowBonus.STR}⚔️)` : `(+${player.statBonus.STR})`;

    const modalVit = document.getElementById('modalStatVIT');
    if (modalVit) modalVit.innerText = player.stats.VIT + (shadowBonus.VIT || 0);
    const modalBonusVit = document.getElementById('modalBonusVIT');
    if (modalBonusVit) modalBonusVit.innerText = shadowBonus.VIT ? `(+${player.statBonus.VIT} +${shadowBonus.VIT}⚔️)` : `(+${player.statBonus.VIT})`;

    const modalAgi = document.getElementById('modalStatAGI');
    if (modalAgi) modalAgi.innerText = player.stats.AGI + (shadowBonus.AGI || 0);
    const modalBonusAgi = document.getElementById('modalBonusAGI');
    if (modalBonusAgi) modalBonusAgi.innerText = shadowBonus.AGI ? `(+${player.statBonus.AGI} +${shadowBonus.AGI}⚔️)` : `(+${player.statBonus.AGI})`;

    const modalInt = document.getElementById('modalStatINT');
    if (modalInt) modalInt.innerText = player.stats.INT + (shadowBonus.INT || 0);
    const modalBonusInt = document.getElementById('modalBonusINT');
    if (modalBonusInt) modalBonusInt.innerText = shadowBonus.INT ? `(+${player.statBonus.INT} +${shadowBonus.INT}⚔️)` : `(+${player.statBonus.INT})`;

    const modalPer = document.getElementById('modalStatPER');
    if (modalPer) modalPer.innerText = player.stats.PER + (shadowBonus.PER || 0);
    const modalBonusPer = document.getElementById('modalBonusPER');
    if (modalBonusPer) modalBonusPer.innerText = `(+${player.statBonus.PER})`;

    const modalPts = document.getElementById('modalRemainingPts');
    if (modalPts) modalPts.innerText = player.remainingPoints;

    // Enable / Disable Stat Point Allocation Buttons
    document.querySelectorAll('.stat-add-btn').forEach(btn => {
        btn.disabled = player.remainingPoints <= 0;
    });
}

// Render Daily Quests in the Preview Wrapper
function renderQuests() {
    const list = document.getElementById('previewQuestList');
    if (!list) return;
    list.innerHTML = '';

    quests.forEach(quest => {
        const item = document.createElement('div');
        item.className = `preview-quest-item ${quest.completed ? 'completed' : ''}`;
        item.innerHTML = `
            <div class="quest-type-icon">${quest.icon}</div>
            <div class="quest-details">
                <h4>${quest.title}</h4>
                <p>${quest.desc} <span class="highlight">+${quest.points} ${quest.stat}</span></p>
            </div>
            <div class="quest-right-meta">
                <span class="quest-reward-tag">+${quest.xpReward} XP</span>
                ${!quest.completed
                    ? `<button class="quest-action-btn" onclick="event.stopPropagation(); completeQuest(${quest.id})">COMPLETE ⚔️</button>`
                    : `<span class="quest-done-tag">DONE ✓</span>`
                }
            </div>
        `;
        list.appendChild(item);
    });
}

// Complete Quest Logic with XP & Stat rewards
window.completeQuest = function (id) {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.completed) return;

    SoundEngine.playQuestComplete();
    quest.completed = true;

    if (player.stats[quest.stat] !== undefined) {
        player.stats[quest.stat] += quest.points;
    }
    player.xp += quest.xpReward;

    // Level-Up Check
    if (player.xp >= player.maxXp) {
        player.level += 1;
        player.xp -= player.maxXp;
        player.maxXp = Math.round(player.maxXp * 1.35);
        player.remainingPoints += 3;
        player.maxHp += 1200;
        player.hp = player.maxHp;
        player.maxMp += 300;
        player.mp = player.maxMp;

        setTimeout(() => {
            SoundEngine.playLevelUp();
            showSystemBanner(`⚡ LEVEL UP! YOU ARE NOW LEVEL ${player.level} (+3 STAT POINTS AVAILABLE)`);
            renderShadowVault();
        }, 300);
    }

    saveGameData();
    updateStatusUI();
    renderQuests();
};

// Allocate Remaining Stat Point in Status Window
window.allocateStatPoint = function (stat) {
    if (player.remainingPoints <= 0) return;
    SoundEngine.playClick();
    player.remainingPoints -= 1;
    player.stats[stat] = (player.stats[stat] || 0) + 1;
    saveGameData();
    updateStatusUI();
};

// Floating Notification Banner for System Events
function showSystemBanner(message) {
    const banner = document.createElement('div');
    banner.style.position = 'fixed';
    banner.style.top = '85px';
    banner.style.left = '50%';
    banner.style.transform = 'translateX(-50%) scale(0.9)';
    banner.style.background = 'var(--theme-bright)';
    banner.style.color = '#000000';
    banner.style.padding = '12px 24px';
    banner.style.fontWeight = '900';
    banner.style.fontSize = '0.9rem';
    banner.style.letterSpacing = '1.5px';
    banner.style.zIndex = '10001';
    banner.style.borderRadius = '4px';
    banner.style.boxShadow = '0 0 25px var(--theme-bright), 0 0 50px rgba(0,0,0,0.8)';
    banner.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    banner.style.opacity = '0';
    banner.innerText = message;

    document.body.appendChild(banner);

    requestAnimationFrame(() => {
        banner.style.transform = 'translateX(-50%) scale(1)';
        banner.style.opacity = '1';
    });

    setTimeout(() => {
        banner.style.transform = 'translateX(-50%) scale(0.9)';
        banner.style.opacity = '0';
        setTimeout(() => {
            if (banner.parentElement) banner.parentElement.removeChild(banner);
        }, 350);
    }, 3500);
}

// ========================================================
// 4. Penalty Zone Overlay System (S-Rank Red Theme & Countdown)
// ========================================================
let penaltyTimerInterval = null;
let penaltySecondsLeft = 4 * 3600; // 04:00:00 default survival time

function formatTime(totalSeconds) {
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

window.openPenaltyZone = function () {
    const overlay = document.getElementById('penaltyOverlay');
    if (!overlay) return;

    SoundEngine.playPenaltyAlert();
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Start live countdown ticker
    const timerEl = document.getElementById('penaltyCountdownTimer');
    if (timerEl) {
        timerEl.innerText = formatTime(penaltySecondsLeft);
    }

    if (penaltyTimerInterval) clearInterval(penaltyTimerInterval);
    penaltyTimerInterval = setInterval(() => {
        if (penaltySecondsLeft > 0) {
            penaltySecondsLeft--;
            if (timerEl) timerEl.innerText = formatTime(penaltySecondsLeft);
        } else {
            clearInterval(penaltyTimerInterval);
        }
    }, 1000);
};

window.closePenaltyZone = function () {
    SoundEngine.playClick();
    const overlay = document.getElementById('penaltyOverlay');
    if (overlay) overlay.classList.add('hidden');
    document.body.style.overflow = '';
    if (penaltyTimerInterval) clearInterval(penaltyTimerInterval);
};

window.survivePenaltyZone = function () {
    SoundEngine.playQuestComplete();
    player.xp += 150;
    player.stats.STR += 2;
    player.stats.AGI += 2;
    player.stats.VIT += 2;

    showSystemBanner(`⚔️ S-RANK PENALTY SURVIVED! REWARD: +150 XP, +2 TO ALL COMBAT STATS`);
    saveGameData();
    updateStatusUI();
    closePenaltyZone();
};

// ========================================================
// 5. Reset System / New Game+ Controller
// ========================================================
window.openResetModal = function () {
    SoundEngine.playClick();
    const overlay = document.getElementById('resetConfirmOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
};

window.closeResetModal = function () {
    SoundEngine.playClick();
    const overlay = document.getElementById('resetConfirmOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }
};

window.executeSystemReset = function () {
    SoundEngine.playSlitCollapse();

    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('SOLO_LEVELING_PLAYER_NAME');
    } catch (e) {
        console.warn('Reset storage failed:', e);
    }

    // Reset player back to Level 1 Rank E Hunter baseline
    player = {
        name: 'PLAYER',
        job: 'None (E-Rank Hunter)',
        title: 'The Weakest Hunter',
        level: 1,
        xp: 0,
        maxXp: 150,
        hp: 1200,
        maxHp: 1200,
        mp: 350,
        maxMp: 350,
        equippedShadow: null,
        stats: {
            STR: 10,
            INT: 10,
            AGI: 10,
            VIT: 10,
            PER: 10
        },
        statBonus: {
            STR: 0,
            INT: 0,
            AGI: 0,
            VIT: 0,
            PER: 0
        },
        remainingPoints: 5
    };

    // Reset all quests
    quests.forEach(q => q.completed = false);

    saveGameData();

    closeResetModal();
    if (typeof window.closeStatusModal === 'function') {
        window.closeStatusModal();
    }

    updateStatusUI();
    renderQuests();
    renderShadowVault();

    showSystemBanner(`⚡ SYSTEM RE-INITIALIZED: RE-AWAKENED AS LEVEL 1 HUNTER (+5 STAT POINTS)`);
};

// Global click sound feedback for interactive elements
document.addEventListener('click', (e) => {
    const target = e.target.closest('button, .nav-item, .system-logo, .stat-add-btn');
    if (target && !target.classList.contains('sfx-toggle-btn')) {
        SoundEngine.playClick();
    }
});

// ========================================================
// Initial Boot
// ========================================================
loadGameData();
ThemeManager.init();
updateStatusUI();
renderQuests();
renderShadowVault();
