import { AudioSettings } from '../types';
import { loadAudioSettings } from './storage';

/**
 * Stop any current ongoing audio/speech playback
 */
export function stopAllAudio(): void {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch (e) {
    console.warn('Could not cancel speech synthesis:', e);
  }
}

/**
 * Web Audio API synthesized sounds
 */
function createAudioContext(): AudioContext | null {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      return ctx;
    }
  } catch (e) {
    console.warn('AudioContext error:', e);
  }
  return null;
}

/**
 * 1. Futuristic Hologram Boot Chime
 */
export function playFuturisticChime(vol = 0.8): void {
  const ctx = createAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(Math.max(0, Math.min(1, vol)) * 0.4, now);
  master.connect(ctx.destination);

  // Sweep
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(440, now);
  osc1.frequency.exponentialRampToValueAtTime(880, now + 0.18);
  osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.35);

  gain1.gain.setValueAtTime(0.01, now);
  gain1.gain.linearRampToValueAtTime(0.3, now + 0.1);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  osc1.connect(gain1);
  gain1.connect(master);
  osc1.start(now);
  osc1.stop(now + 0.6);

  // Sub bass pulse
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(180, now);
  osc2.frequency.exponentialRampToValueAtTime(60, now + 0.5);

  gain2.gain.setValueAtTime(0.3, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  osc2.connect(gain2);
  gain2.connect(master);
  osc2.start(now);
  osc2.stop(now + 0.6);

  // Resonance bell
  const osc3 = ctx.createOscillator();
  const gain3 = ctx.createGain();
  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(1318.51, now + 0.12);
  gain3.gain.setValueAtTime(0.01, now + 0.12);
  gain3.gain.linearRampToValueAtTime(0.25, now + 0.15);
  gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

  osc3.connect(gain3);
  gain3.connect(master);
  osc3.start(now + 0.12);
  osc3.stop(now + 0.7);
}

/**
 * 2. Modern Elegant Bell / Success Ding
 */
export function playModernBell(vol = 0.8): void {
  const ctx = createAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(Math.max(0, Math.min(1, vol)) * 0.35, now);
  master.connect(ctx.destination);

  const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  freqs.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const delay = index * 0.08;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + delay);

    gain.gain.setValueAtTime(0.01, now + delay);
    gain.gain.linearRampToValueAtTime(0.25, now + delay + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.8);

    osc.connect(gain);
    gain.connect(master);

    osc.start(now + delay);
    osc.stop(now + delay + 0.8);
  });
}

/**
 * 3. Cyberpunk Synth Pulse
 */
export function playCyberSynth(vol = 0.8): void {
  const ctx = createAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(Math.max(0, Math.min(1, vol)) * 0.38, now);
  master.connect(ctx.destination);

  // Synth chord
  const chord = [220, 277.18, 329.63, 440]; // A3, C#4, E4, A4
  chord.forEach((f) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(f, now);

    // Low pass filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.2);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.8);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    osc.start(now);
    osc.stop(now + 0.85);
  });
}

/**
 * 4. Text-To-Speech Synthesis (Jarvis Voice)
 */
export function playSpeechGreeting(
  text = 'Welcome home, sir.',
  vol = 0.8,
  pitch = 0.9,
  rate = 0.92
): void {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.max(0.5, Math.min(1.5, rate));
    utterance.pitch = Math.max(0.5, Math.min(1.5, pitch));
    utterance.volume = Math.max(0, Math.min(1, vol));

    const voices = window.speechSynthesis.getVoices();
    const jarvisVoice =
      voices.find(
        (v) =>
          v.lang.includes('en-GB') ||
          v.name.toLowerCase().includes('british') ||
          v.name.toLowerCase().includes('uk english') ||
          v.name.toLowerCase().includes('george') ||
          v.name.toLowerCase().includes('daniel') ||
          v.name.toLowerCase().includes('oliver')
      ) ||
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('guy'))
      ) ||
      voices.find((v) => v.lang.startsWith('id') || v.lang.startsWith('en'));

    if (jarvisVoice) {
      utterance.voice = jarvisVoice;
    }

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 150);
  } catch (err) {
    console.warn('Speech synthesis failed:', err);
  }
}

/**
 * 5. Play Custom Uploaded Audio File (Base64 / Data URL)
 */
export function playCustomUploadedAudio(dataUrl: string, vol = 0.8): Promise<void> {
  return new Promise((resolve) => {
    try {
      const audio = new Audio(dataUrl);
      audio.volume = Math.max(0, Math.min(1, vol));
      audio.onended = () => resolve();
      audio.onerror = () => {
        console.warn('Failed to play custom audio file');
        resolve();
      };
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.warn('Custom audio playback blocked/error:', e);
          resolve();
        });
      }
    } catch (e) {
      console.warn('Custom audio exception:', e);
      resolve();
    }
  });
}

/**
 * Master Main Function to play Login Sound based on configuration
 */
export function playLoginSound(customSettings?: AudioSettings): void {
  const settings = customSettings || loadAudioSettings();
  if (!settings.enabled || settings.preset === 'none') {
    return;
  }

  const vol = (settings.volume ?? 80) / 100;

  switch (settings.preset) {
    case 'custom_upload':
      if (settings.customAudioData) {
        playCustomUploadedAudio(settings.customAudioData, vol);
        if (settings.playSpeech && settings.speechGreetingText) {
          setTimeout(() => {
            playSpeechGreeting(
              settings.speechGreetingText,
              vol,
              settings.speechVoicePitch,
              settings.speechVoiceRate
            );
          }, 800);
        }
      } else {
        // Fallback to futuristic chime if no file uploaded
        playFuturisticChime(vol);
      }
      break;

    case 'futuristic_chime':
      playFuturisticChime(vol);
      if (settings.playSpeech && settings.speechGreetingText) {
        setTimeout(() => {
          playSpeechGreeting(
            settings.speechGreetingText,
            vol,
            settings.speechVoicePitch,
            settings.speechVoiceRate
          );
        }, 300);
      }
      break;

    case 'modern_bell':
      playModernBell(vol);
      if (settings.playSpeech && settings.speechGreetingText) {
        setTimeout(() => {
          playSpeechGreeting(
            settings.speechGreetingText,
            vol,
            settings.speechVoicePitch,
            settings.speechVoiceRate
          );
        }, 400);
      }
      break;

    case 'cyber_synth':
      playCyberSynth(vol);
      if (settings.playSpeech && settings.speechGreetingText) {
        setTimeout(() => {
          playSpeechGreeting(
            settings.speechGreetingText,
            vol,
            settings.speechVoicePitch,
            settings.speechVoiceRate
          );
        }, 450);
      }
      break;

    case 'speech_only':
      playSpeechGreeting(
        settings.speechGreetingText,
        vol,
        settings.speechVoicePitch,
        settings.speechVoiceRate
      );
      break;

    case 'jarvis':
    default:
      playFuturisticChime(vol);
      if (settings.playSpeech) {
        setTimeout(() => {
          playSpeechGreeting(
            settings.speechGreetingText || 'Welcome home, sir.',
            vol,
            settings.speechVoicePitch || 0.9,
            settings.speechVoiceRate || 0.92
          );
        }, 260);
      }
      break;
  }
}
