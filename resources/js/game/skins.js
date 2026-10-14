/*
 * Look of every skin. Names, prices and rarity live in config/skins.php;
 * the keys here must match it.
 */

export const INK = '#3b2346';
export const EYE = '#2b1a33';

export const PALETTES = {
  mochi: { b: '#fffaf3', s: '#ecd6c6', l: '#ffffff', a: '#79c98a', h: '#79c98a', n: '#ff8fb0', c: '#ffb3c9', k: '#ecd6c6' },
  pipi: { b: '#ffe066', s: '#f0b232', l: '#fff4b3', a: '#ff9b3d', h: '#ff9b3d', n: '#ff9b3d', c: '#ffad9e', k: '#ff9b3d' },
  bunbun: { b: '#f6f0ff', s: '#d9caf5', l: '#ffffff', a: '#ffb8d3', h: '#ffb8d3', n: '#ff86b1', c: '#ffb8d3', k: '#d9caf5' },
  neko: { b: '#ffc79e', s: '#ec9d6a', l: '#ffe2cc', a: '#fff1e3', h: '#ffb08a', n: '#ff7fa0', c: '#ff9fb4', k: '#ec9d6a' },
  kumo: { b: '#ffffff', s: '#dfd8ef', l: '#ffffff', a: '#d8cfee', h: '#c79f74', n: '#ff8fb0', c: '#ffb3c9', k: '#8a7ea8' },
  boo: { b: '#eef6ff', s: '#c4d9f3', l: '#ffffff', a: '#c4d9f3', h: '#c4d9f3', n: '#ff8fb0', c: '#ffb6cf', k: '#c4d9f3' },
  drako: { b: '#8fe3b5', s: '#55bb88', l: '#c8f6dc', a: '#fff0b3', h: '#ffcd52', n: '#ff8fb0', c: '#ff9fbf', k: '#55bb88' },
};

export const RARITY = {
  common: { label: 'Common', bg: 'bg-sky-soft', dot: '#9bd5ff' },
  rare: { label: 'Rare', bg: 'bg-lilac-soft', dot: '#c9b6ff' },
  epic: { label: 'Epic', bg: 'bg-lemon-soft', dot: '#ffc93c' },
};

/*
 * Device shells. "from"/"to" make the body gradient, "button" colours the three
 * buttons, "bezel" frames the screen and "pattern" adds a decoration.
 */
export const SHELLS = {
  strawberry: { from: '#ffc6db', to: '#ff8fba', button: '#fff3b8', bezel: '#fff0f5', pattern: 'dots', patternColor: '#ffffff' },
  lavender: { from: '#e6dbff', to: '#b79cff', button: '#ffe27a', bezel: '#f6f1ff', pattern: null },
  mint: { from: '#cdf6e2', to: '#86d9b2', button: '#ff9fbf', bezel: '#f0fcf6', pattern: null },
  peach: { from: '#ffdcc8', to: '#ffa97f', button: '#9bd5ff', bezel: '#fff3ec', pattern: null },
  lemon: { from: '#fff6be', to: '#ffd84a', button: '#ff8fba', bezel: '#fffbe6', pattern: 'dots', patternColor: '#ffffff' },
  sky: { from: '#d9f0ff', to: '#8fcaf6', button: '#ffffff', bezel: '#f2faff', pattern: 'clouds', patternColor: '#ffffff' },
  sakura: { from: '#fff0f6', to: '#ffbcd6', button: '#ff6fa3', bezel: '#ffffff', pattern: 'flowers', patternColor: '#ff8fba' },
  jelly: { from: '#d8f6ff', to: '#8fd8f5', button: '#ff8fba', bezel: '#f4fdff', pattern: 'bubbles', patternColor: '#ffffff', translucent: true },
  galaxy: { from: '#4b3a8c', to: '#1d1745', button: '#ffd36e', bezel: '#efeaff', pattern: 'stars', patternColor: '#fff6c9', dark: true },
};

export function palette(skin) {
  return PALETTES[skin] ?? PALETTES.mochi;
}

export function shell(key) {
  return SHELLS[key] ?? SHELLS.strawberry;
}
