// Web Audio API sound synthesis for Collar Buzzer and notification chimes

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Triggers the ESP32 collar buzzer locator / recall frequency (3-burst 2400Hz pulse)
 */
export function playCollarBuzzerTone(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(2400, now + i * 0.18);

      gain.gain.setValueAtTime(0, now + i * 0.18);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.18 + 0.02);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.18 + 0.12);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.18 + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.18);
      osc.stop(now + i * 0.18 + 0.15);
    }
  } catch (err) {
    console.warn('Web Audio not allowed without user gesture yet:', err);
  }
}

/**
 * Friendly chime for marking meal fed or updating vaccination
 */
export function playSuccessChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  } catch (err) {
    console.warn('Audio chime failed:', err);
  }
}

/**
 * Subtle alert tone for warning or scared alert
 */
export function playAlertTone(isUrgent: boolean = false): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isUrgent ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(isUrgent ? 880 : 440, now);
    osc.frequency.exponentialRampToValueAtTime(isUrgent ? 660 : 330, now + 0.3);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (err) {
    console.warn('Audio alert failed:', err);
  }
}
