let ctx = null;

const NOTES = {
  press: [[880, 0.05]],
  ok: [[988, 0.07], [1319, 0.09]],
  no: [[330, 0.12], [262, 0.14]],
  win: [[784, 0.08], [988, 0.08], [1319, 0.16]],
  hatch: [[523, 0.08], [659, 0.08], [784, 0.08], [1047, 0.18]],
};

/** Tiny square-wave beeps, like the original handhelds. */
export function beep(kind = 'press', enabled = true) {
  if (!enabled || typeof window === 'undefined') return;
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    let t = ctx.currentTime;
    for (const [freq, len] of NOTES[kind] ?? NOTES.press) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + len);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + len);
      t += len;
    }
  } catch {
    /* audio not available */
  }
}
