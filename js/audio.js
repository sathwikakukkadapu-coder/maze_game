// js/audio.js
// Procedural Web Audio API Sound Synthesizer
// 100% offline, zero external audio assets, works instantly in any browser.

(function(window) {
    'use strict';

    let audioCtx = null;
    let isMuted = false;

    // Load mute preference from localStorage
    try {
        const saved = localStorage.getItem('teiac_muted');
        if (saved !== null) {
            isMuted = (saved === 'true');
        }
    } catch (e) {
        // Storage unavailable, default to false
    }

    function initContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function setMuted(muted) {
        isMuted = muted;
        try {
            localStorage.setItem('teiac_muted', isMuted ? 'true' : 'false');
        } catch (e) {}
    }

    function toggleMute() {
        setMuted(!isMuted);
        return isMuted;
    }

    function playTone(freq, type, duration, startTime = 0, gainLevel = 0.15) {
        if (isMuted || !audioCtx) return;
        try {
            const now = audioCtx.currentTime + startTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(gainLevel, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {}
    }

    function playPlayerMove() {
        initContext();
        if (isMuted || !audioCtx) return;
        // Crisp, pleasant footstep blip
        playTone(320, 'triangle', 0.08, 0, 0.12);
    }

    function playExitFlee() {
        initContext();
        if (isMuted || !audioCtx) return;
        try {
            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            // Playful upward slide (cartoon scamper)
            osc.frequency.setValueAtTime(450, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.14);
        } catch (e) {}
    }

    function playExitTrapped() {
        initContext();
        if (isMuted || !audioCtx) return;
        // Nervous high shudder/stutter
        playTone(740, 'sawtooth', 0.06, 0, 0.08);
        playTone(700, 'sawtooth', 0.06, 0.07, 0.08);
        playTone(780, 'sawtooth', 0.08, 0.14, 0.08);
    }

    function playBump() {
        initContext();
        if (isMuted || !audioCtx) return;
        try {
            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(110, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.09);

            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.09);
        } catch (e) {}
    }

    function playLevelWin() {
        initContext();
        if (isMuted || !audioCtx) return;
        // Ascending victory fanfare arpeggio (C5, E5, G5, C6)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            playTone(freq, 'triangle', 0.22, idx * 0.09, 0.18);
        });
    }

    function playGameVictory() {
        initContext();
        if (isMuted || !audioCtx) return;
        // Grand victory fanfare
        const notes = [
            { f: 523.25, t: 0.00, d: 0.14 },
            { f: 659.25, t: 0.14, d: 0.14 },
            { f: 783.99, t: 0.28, d: 0.14 },
            { f: 1046.50, t: 0.42, d: 0.35 },
            { f: 880.00, t: 0.70, d: 0.16 },
            { f: 1046.50, t: 0.88, d: 0.60 }
        ];
        notes.forEach(n => {
            playTone(n.f, 'sine', n.d, n.t, 0.22);
            playTone(n.f / 2, 'triangle', n.d, n.t, 0.12);
        });
    }

    function playRestart() {
        initContext();
        if (isMuted || !audioCtx) return;
        try {
            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.15);
        } catch (e) {}
    }

    function playUndo() {
        initContext();
        if (isMuted || !audioCtx) return;
        playTone(480, 'sine', 0.07, 0, 0.10);
        playTone(360, 'sine', 0.07, 0.05, 0.10);
    }

    window.GameAudio = {
        init: initContext,
        setMuted,
        toggleMute,
        isMuted: () => isMuted,
        playPlayerMove,
        playExitFlee,
        playExitTrapped,
        playBump,
        playLevelWin,
        playGameVictory,
        playRestart,
        playUndo
    };

})(typeof window !== 'undefined' ? window : global);
