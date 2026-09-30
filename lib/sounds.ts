// Sound Effects System for FocusFlow
// Web Audio API based - no external dependencies, works offline

export type SoundType =
  | "pomodoro-start"
  | "pomodoro-focus-end"
  | "pomodoro-break-end"
  | "countdown-complete"
  | "stopwatch-lap"
  | "stopwatch-done"
  | "achievement-unlock"
  | "streak-milestone"
  | "level-up"
  | "topic-complete"
  | "habit-tick"
  | "error"
  | "click"
  | "hover";

interface SoundConfig {
  frequencies: number[];        // frequencies in Hz
  durations: number[];          // durations in ms
  type?: OscillatorType;        // 'sine' | 'square' | 'sawtooth' | 'triangle'
  volume?: number;              // 0-1
  delay?: number;               // delay between notes in ms
  envelope?: { attack: number; decay: number; sustain: number; release: number };
}

const SOUNDS: Record<SoundType, SoundConfig> = {
  "pomodoro-start": {
    frequencies: [523.25, 659.25, 783.99], // C5, E5, G5 - major chord
    durations: [120, 120, 200],
    type: "sine",
    volume: 0.3,
    delay: 60,
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.2 },
  },
  "pomodoro-focus-end": {
    frequencies: [880, 1046.5, 1318.51], // A5, C6, E6 - bright celebration
    durations: [150, 150, 300],
    type: "sine",
    volume: 0.4,
    delay: 80,
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.3 },
  },
  "pomodoro-break-end": {
    frequencies: [659.25, 783.99, 987.77], // E5, G5, B5 - gentle return
    durations: [180, 180, 250],
    type: "sine",
    volume: 0.35,
    delay: 70,
    envelope: { attack: 0.02, decay: 0.2, sustain: 0.3, release: 0.4 },
  },
  "countdown-complete": {
    frequencies: [783.99, 1046.5, 1318.51, 1567.98], // G5, C6, E6, G6 - fanfare
    durations: [120, 120, 120, 400],
    type: "triangle",
    volume: 0.4,
    delay: 70,
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.3 },
  },
  "stopwatch-lap": {
    frequencies: [1046.5], // C6 - quick tick
    durations: [60],
    type: "sine",
    volume: 0.25,
    envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.1 },
  },
  "stopwatch-done": {
    frequencies: [523.25, 659.25, 783.99, 1046.5], // C5, E5, G5, C6
    durations: [100, 100, 100, 300],
    type: "sine",
    volume: 0.35,
    delay: 60,
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.3 },
  },
  "achievement-unlock": {
    frequencies: [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98], // C5-E5-G5-C6-E6-G6 - full arpeggio
    durations: [80, 80, 80, 80, 80, 500],
    type: "sine",
    volume: 0.45,
    delay: 50,
    envelope: { attack: 0.01, decay: 0.05, sustain: 0.5, release: 0.5 },
  },
  "streak-milestone": {
    frequencies: [659.25, 880, 1046.5, 1318.51, 1760], // E5-A5-C6-E6-A6 - ascending
    durations: [100, 100, 100, 100, 400],
    type: "triangle",
    volume: 0.4,
    delay: 60,
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.4 },
  },
  "level-up": {
    frequencies: [392, 523.25, 659.25, 783.99, 1046.5, 1318.51], // G4-C5-E5-G5-C6-E6
    durations: [100, 100, 100, 100, 100, 600],
    type: "sine",
    volume: 0.5,
    delay: 50,
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.6 },
  },
  "topic-complete": {
    frequencies: [783.99, 987.77, 1174.66], // G5, B5, D6 - satisfying resolution
    durations: [150, 150, 250],
    type: "sine",
    volume: 0.3,
    delay: 70,
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.3 },
  },
  "habit-tick": {
    frequencies: [1046.5], // C6 - crisp
    durations: [50],
    type: "square",
    volume: 0.2,
    envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.05 },
  },
  "error": {
    frequencies: [277.18, 246.94], // C#4, B3 - dissonant
    durations: [200, 300],
    type: "sawtooth",
    volume: 0.3,
    delay: 0,
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.2 },
  },
  "click": {
    frequencies: [1500],
    durations: [15],
    type: "sine",
    volume: 0.1,
    envelope: { attack: 0.001, decay: 0.01, sustain: 0, release: 0.02 },
  },
  "hover": {
    frequencies: [2000],
    durations: [10],
    type: "sine",
    volume: 0.05,
    envelope: { attack: 0.001, decay: 0.01, sustain: 0, release: 0.01 },
  },
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private masterVolume = 0.5;
  private unlocked = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  async unlock() {
    if (this.unlocked) return;
    const ctx = this.getContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    this.unlocked = true;
  }

  play(type: SoundType, options?: { volume?: number; playbackRate?: number }) {
    if (!this.enabled) return;

    const config = SOUNDS[type];
    if (!config) return;

    const ctx = this.getContext();
    const volume = (options?.volume ?? 1) * this.masterVolume * (config.volume ?? 1);
    const playbackRate = options?.playbackRate ?? 1;

    const now = ctx.currentTime;

    config.frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = config.type ?? "sine";
      osc.frequency.value = freq * playbackRate;

      const dur = (config.durations[i] ?? config.durations[0]) / 1000;
      const delay = (config.delay ?? 0) / 1000 * i;

      const env = config.envelope ?? { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.2 };
      const peakTime = now + delay + env.attack;
      const decayEnd = peakTime + env.decay;
      const releaseStart = peakTime + env.decay + dur * env.sustain;

      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(volume, peakTime);
      gain.gain.linearRampToValueAtTime(volume * env.sustain, decayEnd);
      gain.gain.linearRampToValueAtTime(0, releaseStart + env.release);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(releaseStart + env.release + 0.05);
    });
  }

  // Convenience methods for common sounds
  pomodoroStart() { this.play("pomodoro-start"); }
  pomodoroFocusEnd() { this.play("pomodoro-focus-end"); }
  pomodoroBreakEnd() { this.play("pomodoro-break-end"); }
  countdownComplete() { this.play("countdown-complete"); }
  stopwatchLap() { this.play("stopwatch-lap"); }
  stopwatchDone() { this.play("stopwatch-done"); }
  achievementUnlock() { this.play("achievement-unlock"); }
  streakMilestone() { this.play("streak-milestone"); }
  levelUp() { this.play("level-up"); }
  topicComplete() { this.play("topic-complete"); }
  habitTick() { this.play("habit-tick"); }
  error() { this.play("error"); }
  click() { this.play("click"); }
  hover() { this.play("hover"); }
}

export const soundEngine = new SoundEngine();

// React hook for easy use
export function useSound() {
  return soundEngine;
}

// Auto-unlock on first user interaction
if (typeof window !== "undefined") {
  const unlock = () => {
    soundEngine.unlock();
    document.removeEventListener("click", unlock);
    document.removeEventListener("keydown", unlock);
  };
  document.addEventListener("click", unlock, { once: true });
  document.addEventListener("keydown", unlock, { once: true });
}
// ---- Compat API for sessions page + popup (FocusFlow) ----
const FF_SOUND_KEY = "ff_sound_enabled_v1";

export type FFPlaySound =
  | "click" | "pop" | "success" | "delete"
  | "achievement" | "timer" | "whoosh" | "error";

export function isSoundEnabled(): boolean {
  try {
    const v = localStorage.getItem(FF_SOUND_KEY);
    const on = v === null ? true : v === "1";
    soundEngine.setEnabled(on);
    return on;
  } catch { return true; }
}

export function setSoundEnabled(on: boolean) {
  try { localStorage.setItem(FF_SOUND_KEY, on ? "1" : "0"); } catch {}
  soundEngine.setEnabled(on);
}

export function playSound(type: FFPlaySound) {
  switch (type) {
    case "achievement": soundEngine.achievementUnlock(); break;
    case "timer": soundEngine.countdownComplete(); break;
    case "success": soundEngine.topicComplete(); break;
    case "whoosh": soundEngine.pomodoroBreakEnd(); break;
    case "delete":
    case "error": soundEngine.error(); break;
    case "pop":
    case "click":
    default: soundEngine.click(); break;
  }
}

// sync engine enabled state with saved preference on load
if (typeof window !== "undefined") {
  try {
    const v = localStorage.getItem(FF_SOUND_KEY);
    soundEngine.setEnabled(v === null ? true : v === "1");
  } catch {}
}
