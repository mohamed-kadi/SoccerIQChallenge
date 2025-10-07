import { getSoundMuted, setSoundMuted as persistSoundMuted } from './storageService';

type SampleSoundName = 'correct' | 'incorrect';
type SoundName = SampleSoundName | 'click';

const SAMPLE_SOUNDS: Record<SampleSoundName, string> = {
  // Correct Answer (short, positive chime)
  correct:
    'data:audio/wav;base64,UklGRmIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAP//AwDE/wEABQAC/v8A/P8A/P8EAAwABv/1/vT+7P7l/tD+8v4QAP//BQLs/qL+qP2t/Iz9APxH/Ar8Qv0y/fL9Gv8pAAMABf/V/dj+7f8mACwAJP/7/vz+nP6Q/lT+QP5k/nP+fv6G/pL+oP6s/rT+uP66/rT+sP6b/oH+ZP5Q/j7+Qv5B/kb+UP5t/oX+nv6p/rj+wf7I/tL+3v7j/uX+6f7t/vL+9f73/vj++f78/v7/AP8D/wX/B/8J/wr/DP8O/xH/E/8W/xj/Gv8c/x//If8l/yz/N/8+/0f/U/9m/3H/gv+U/6n/vP/J/9n/7//9/wQADQAgAC8ARABSAGIAcQCBAJAAnwClAKsArwCwALUAvgC/AMQAyQDMANIA1ADZANwA3gDfAOEA4wDlAOYA6ADpAOwA7gDvAPIA9gD5APwA/QD+AP8AAQAEAAcACQALAA0ADwARABMAFQAXABkAGwAdAB8AIQEjAScBKgEtAS8BMgE1AS8BLQEpASUBIwEgAB0AGQAVABEADQAIAPz++f7u/s/+iP4G/532L/XF74TrEueB4YHcWN1C2hPZCNf70R/PHs1rzAbLYsmIyAXGPcAwv7i+u7yqvqq6j7l0uGa5vbb+tzS3qbf3t/S3+Lh+uSy6u7x8vi///T/DAAkACYAKgAqACgAJwAlACIAIAAdABsAGQAXABUAFAAUABQAFgAZABwAHgAgACIAJAAkACMAJAAnACkALAAvADEAMwA2ADgAOwA9AD8AQgBEAEcASQBLAE0ATwBSAFUAVwBZAFsAXQBfAGIAZABnAHEAcwB1AAAA',
  // Incorrect Answer (short, lower-pitched buzz)
  incorrect:
    'data:audio/wav;base64,UklGRmIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAIA/gD+AP0A/gD6APkC+wL8AvoC/QL3AvoC+gL2AvYC8gLxAuwC5wLaAtUCygLGAtMC3QLkAugC8AL+AvwD/wP6A/AD/gP8A/kD/AP6A/wD/QP9A/kD+AP3Av0C/gL5AvcC+QL3AvMC7ALmAusC4wLZAtMCyALDAscCywLPAtcC3QLfAuUC6wLxAvcC/wL9AwID/gT5BPYF8ATuBO8E8gT6BPoF/gYABwgCCAcIAggGBwIABv8E/gT+BPoE9ATtBOAE3wTbBNQEzwTOBM8E1gTZBN4E5gTrBPUE+QX8Bv8HAAgACAAGAAQAAgAAAAEAAv8D/gX/B/8I/wj/CP8H/wX/A/8A//3+9P7x/vD+7/7t/u3+7v7w/vL+9f75/v//AwAFAAgACwANABEAEwAVABcAGQAbAB0AHwAhACMALQAwADYARABPAHEApQC/ANMA9QADABQAOwBeAKoA3wD8ABIAOgBbAKYAuwDXAPAAAQARAC4AUgCYAMQA5QD4AAwAJQBHAGoAvQDgAPkA/v/+/+H/5v9BAKwA3gDyABEANQBUAJwAyADfAPwAAgAWADcAVgCfAMwA4QD2AAAAEQAtAFUAnQDKANwA9AAAABEALgBTALoA3wD/ABcARwCgANAA9wAJAEAAowDXAPkA/v+l/8sAyQCGAMsA7gAfAFMAqADWAPUA/'
};

const SAMPLE_SOUND_NAMES = Object.keys(SAMPLE_SOUNDS) as SampleSoundName[];

let audioContext: AudioContext | null = null;
let initPromise: Promise<void> | null = null;
let audioSupportUnavailable = false;
let hasPreloadedSamples = false;
let isMutedState = getSoundMuted();

const decodedBuffers = new Map<SampleSoundName, AudioBuffer>();

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

const decodeBase64ToArrayBuffer = (dataUrl: string): ArrayBuffer => {
  const base64 = dataUrl.includes(',')
    ? dataUrl.substring(dataUrl.indexOf(',') + 1)
    : dataUrl;
  const binaryString = window.atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
};

const loadSampleBuffer = async (name: SampleSoundName): Promise<AudioBuffer | null> => {
  const ctx = getAudioContext();
  if (!ctx) {
    return null;
  }

  if (decodedBuffers.has(name)) {
    return decodedBuffers.get(name) ?? null;
  }

  try {
    const arrayBuffer = decodeBase64ToArrayBuffer(SAMPLE_SOUNDS[name]);
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    decodedBuffers.set(name, audioBuffer);
    return audioBuffer;
  } catch (error) {
    console.error(`Failed to decode audio for "${name}"`, error);
    return null;
  }
};

const playGeneratedClick = (ctx: AudioContext) => {
  const now = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(880, now);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.07);
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
        return;
      }
    }

    if (!hasPreloadedSamples) {
      await Promise.all(SAMPLE_SOUND_NAMES.map(name => loadSampleBuffer(name)));
      hasPreloadedSamples = true;
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

    const buffer = await loadSampleBuffer(name);
    if (!buffer) {
      return;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
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
