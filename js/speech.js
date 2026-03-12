// הקראה קולית עם צלילים
const Speech = {
    synthesis: window.speechSynthesis,
    currentUtterance: null,
    isPaused: false,
    currentIndex: 0,
    instructions: [],
    settings: null,
    onLineChange: null,
    
    // צלילים
    sounds: {
        start: () => Speech.playBeep(800, 0.1, 0.1),
        end: () => Speech.playBeep(600, 0.1, 0.15),
        step: () => Speech.playBeep(400, 0.05, 0.05)
    },
    
    playBeep: (frequency, duration, volume) => {
        if (!Speech.settings || !Speech.settings.soundEffects) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        gainNode.gain.value = volume;
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    },
    
    init: (instructions, settings, onLineChange) => {
        Speech.instructions = instructions;
        Speech.settings = settings;
        Speech.onLineChange = onLineChange;
        Speech.currentIndex = 0;
        Speech.isPaused = false;
        
        // ביטול הקראה קודמת
        Speech.synthesis.cancel();
    },
    
    getAvailableVoices: () => {
        const voices = Speech.synthesis.getVoices();
        const heVoices = voices.filter(v => v.lang.includes('he') || v.lang.includes('iw'));
        const enVoices = voices.filter(v => v.lang.includes('en'));
        
        // בחירת קול עברית יותר טוב - מנסה למצוא קול איכותי
        let heVoice = heVoices.find(v => 
            v.name.includes('Microsoft') || 
            v.name.includes('Google') ||
            v.localService === false
        ) || heVoices[0];
        
        return {
            'he': heVoice || voices[0],
            'en': enVoices[0] || voices[0]
        };
    },
    
    speak: (text) => {
        return new Promise((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = Speech.settings.speechRate || 1.0;
            
            const availableVoices = Speech.getAvailableVoices();
            const voiceName = Speech.settings.voiceName || 'he';
            
            // קביעת שפה
            if (voiceName === 'en') {
                utterance.lang = 'en-US';
            } else {
                utterance.lang = 'he-IL';
            }
            
            // בחירת הקול המתאים
            const selectedVoice = availableVoices[voiceName];
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            
            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();
            
            Speech.synthesis.speak(utterance);
            Speech.currentUtterance = utterance;
        });
    },
    
    start: async () => {
        Speech.isPaused = false;
        Speech.sounds.start();
        
        for (let i = Speech.currentIndex; i < Speech.instructions.length; i++) {
            if (Speech.isPaused) {
                Speech.currentIndex = i;
                return;
            }
            
            Speech.sounds.step();
            
            // עדכון השורה הנוכחית
            if (Speech.onLineChange) {
                Speech.onLineChange(i);
            }
            
            // הקראת השורה
            await Speech.speak(Speech.instructions[i]);
            
            // המתנה בין שורות
            if (i < Speech.instructions.length - 1) {
                await Speech.delay(Speech.settings.speechDelay || 2000);
            }
        }
        
        // סיום הקראה
        Speech.sounds.end();
        Speech.currentIndex = 0;
        if (Speech.onLineChange) {
            Speech.onLineChange(-1);
        }
    },
    
    pause: () => {
        Speech.isPaused = true;
        Speech.synthesis.cancel();
    },
    
    resume: () => {
        if (Speech.isPaused) {
            Speech.start();
        }
    },
    
    stop: () => {
        Speech.isPaused = true;
        Speech.currentIndex = 0;
        Speech.synthesis.cancel();
        if (Speech.onLineChange) {
            Speech.onLineChange(-1);
        }
    },
    
    delay: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};
