/**
 * Short synthesised blips, for interfaces that need a sound but not an asset.
 * Web Audio only — a handful of oscillator cycles costs nothing to ship,
 * whereas three sample files would be three requests and a `public/` folder to
 * keep in sync.
 *
 * The context is built on the first `play`, never at import: browsers refuse
 * one outside a user gesture, and a refused context stays `suspended` forever.
 */

export type Tone = "start" | "eat" | "over";

interface ToneSpec {
  readonly type: OscillatorType;
  /** Hertz at the attack, then at the release — equal values hold the pitch. */
  readonly from: number;
  readonly to: number;
  readonly seconds: number;
}

/** Square waves carry over laptop speakers; 0.05 keeps them out of the way. */
const PEAK = 0.05;

const TONES: Record<Tone, ToneSpec> = {
  start: { type: "square", from: 440, to: 660, seconds: 0.1 },
  eat: { type: "square", from: 880, to: 880, seconds: 0.06 },
  over: { type: "sawtooth", from: 220, to: 70, seconds: 0.4 },
};

export interface Beeper {
  play(tone: Tone): void;
  close(): void;
}

type AudioContextConstructor = typeof AudioContext;

function audioContextClass(): AudioContextConstructor | null {
  if (typeof window === "undefined") return null;

  // Safari only exposes the prefixed constructor, which the DOM lib doesn't
  // declare — hence the widened window rather than a plain `window.`.
  const scope = window as Window &
    typeof globalThis & { webkitAudioContext?: AudioContextConstructor };

  return scope.AudioContext ?? scope.webkitAudioContext ?? null;
}

/**
 * Answers with a beeper whose `play` is a no-op where Web Audio is missing, so
 * callers never branch on support — a silent game is still a game.
 */
export function createBeeper(): Beeper {
  let context: AudioContext | null = null;

  return {
    play(tone) {
      const Constructor = audioContextClass();
      if (!Constructor) return;

      context ??= new Constructor();
      // Safari suspends the context until a gesture reaches it, and a
      // suspended context swallows the note silently.
      if (context.state === "suspended") void context.resume();

      const spec = TONES[tone];
      const now = context.currentTime;
      const end = now + spec.seconds;

      const oscillator = context.createOscillator();
      oscillator.type = spec.type;
      oscillator.frequency.setValueAtTime(spec.from, now);
      oscillator.frequency.exponentialRampToValueAtTime(spec.to, end);

      // Ramping to zero is undefined on an exponential ramp, hence the floor.
      const gain = context.createGain();
      gain.gain.setValueAtTime(PEAK, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now);
      oscillator.stop(end);
    },

    close() {
      void context?.close();
      context = null;
    },
  };
}
