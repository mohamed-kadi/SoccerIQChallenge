import { getSoundMuted, setSoundMuted as persistSoundMuted } from './storageService';

type SoundName = 'correct' | 'incorrect' | 'click';

interface ToneStep {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
}

const TONE_SEQUENCES: Record<Exclude<SoundName, 'click'>, ToneStep[]> = {
  correct: [
    { frequency: 440, duration: 0.18, type: 'sine', gain: 0.12 }, // A4
    { frequency: 554.37, duration: 0.2, type: 'sine', gain: 0.11 }, // C#5
    { frequency: 659.25, duration: 0.26, type: 'sine', gain: 0.1 }, // E5
  ],
  incorrect: [
    { frequency: 330, duration: 0.24, type: 'sine', gain: 0.11 }, // E4
    { frequency: 262, duration: 0.28, type: 'sine', gain: 0.1 },   // C4
  ],
};

let audioContext: AudioContext | null = null;
let initPromise: Promise<void> | null = null;
let audioSupportUnavailable = false;
let isMutedState = getSoundMuted();

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (audioContext) {
    return audioContext;
  }

  if (audioSupportUnavailable) {
    return null;
  }

  const AudioContextCtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextCtor) {
    audioSupportUnavailable = true;
    console.warn('Web Audio API is not supported in this browser.');
    return null;
  }

  audioContext = new AudioContextCtor();
  return audioContext;
};

const createGainEnvelope = (ctx: AudioContext, gainLevel: number, startTime: number, duration: number) => {
  const gain = ctx.createGain();
  // Soft attack and release for smoother sound
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(gainLevel, startTime + Math.min(0.05, duration / 2));
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  gain.connect(ctx.destination);
  return gain;
};

const playToneSequence = (ctx: AudioContext, sequence: ToneStep[]) => {
  let currentTime = ctx.currentTime;

  sequence.forEach(step => {
    const osc = ctx.createOscillator();
    const duration = Math.max(step.duration, 0.05);
    const gainLevel = step.gain ?? 0.15;

    osc.type = step.type ?? 'sine';
    osc.frequency.setValueAtTime(step.frequency, currentTime);

    const gain = createGainEnvelope(ctx, gainLevel, currentTime, duration);
    osc.connect(gain);

    osc.start(currentTime);
    osc.stop(currentTime + duration + 0.02);

    currentTime += duration * 0.85; // slight overlap for a smoother phrase
  });
};

const playGeneratedClick = (ctx: AudioContext) => {
  const now = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(420, now);
  oscillator.frequency.exponentialRampToValueAtTime(360, now + 0.08);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.16);
};

export const initAudioOnInteraction = async (): Promise<void> => {
  if (initPromise) {
    await initPromise;
    return;
  }

  initPromise = (async () => {
    const ctx = getAudioContext();
    if (!ctx) {
      return;
    }

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (error) {
        console.warn('Unable to resume audio context:', error);
      }
    }
  })();

  try {
    await initPromise;
  } finally {
    initPromise = null;
  }
};

export const playSound = async (name: SoundName): Promise<void> => {
  if (isMutedState) {
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) {
    return;
  }

  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (name === 'click') {
      playGeneratedClick(ctx);
      return;
    }

    playToneSequence(ctx, TONE_SEQUENCES[name]);
  } catch (error) {
    console.error(`Failed to play sound "${name}"`, error);
  }
};

export const isMuted = (): boolean => isMutedState;

export const toggleMute = (): boolean => {
  isMutedState = !isMutedState;
  persistSoundMuted(isMutedState);

  if (!isMutedState) {
    void initAudioOnInteraction().catch(() => {});
  }

  return isMutedState;
};

export const setMuted = (muted: boolean): void => {
  isMutedState = muted;
  persistSoundMuted(muted);

  if (!muted) {
    void initAudioOnInteraction().catch(() => {});
  }
};
