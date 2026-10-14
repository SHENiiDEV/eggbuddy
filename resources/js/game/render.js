import { BABY, EGG, ICONS, ICON_COLORS, SPRITES } from './sprites.js';
import { EYE, INK, palette } from './skins.js';

const TEAR = '#6ec6ff';
const TONGUE = '#ff6b8b';

/**
 * Turn a mask into coloured pixels with a 1px ink outline, soft shading on the
 * bottom/right edges and a highlight on the top-left. Returns
 * { w, h, pixels: [{x, y, c}] , offset } where offset maps mask -> pixel coords.
 */
function build(rows, pal, { shade = true } = {}) {
  const mh = rows.length;
  const mw = Math.max(...rows.map((r) => r.length));
  const w = mw + 2;
  const h = mh + 2;
  const filled = (x, y) => y >= 0 && y < mh && x >= 0 && x < mw && rows[y][x] !== undefined && rows[y][x] !== '.';

  const grid = Array.from({ length: h }, () => Array(w).fill(null));

  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      const ch = rows[y][x];
      if (!ch || ch === '.') continue;
      let color = pal[ch] ?? pal.b;
      if (shade && ch === 'b') {
        const bottomEdge = !filled(x, y + 1);
        const rightEdge = !filled(x + 1, y);
        const topEdge = !filled(x, y - 1);
        const leftEdge = !filled(x - 1, y);
        if (bottomEdge || (rightEdge && !topEdge)) color = pal.s;
        else if (topEdge && leftEdge) color = pal.l;
      }
      grid[y + 1][x + 1] = color;
    }
  }

  // Outline: every empty pixel touching a filled one (4-neighbourhood).
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x]) continue;
      const mx = x - 1;
      const my = y - 1;
      if (filled(mx + 1, my) || filled(mx - 1, my) || filled(mx, my + 1) || filled(mx, my - 1)) {
        grid[y][x] = INK;
      }
    }
  }

  return { w, h, grid };
}

const EYE_SHAPES = {
  open: [[0, 0], [0, 1]],
  happy: [[-1, 1], [0, 0], [1, 1]],
  closed: [[-1, 1], [0, 1], [1, 1]],
  sad: [[0, 1]],
  sick: [[-1, 0], [1, 0], [0, 1], [-1, 2], [1, 2]],
  wide: [[0, 0], [0, 1], [1, 0], [1, 1]],
};

const MOUTH_SHAPES = {
  smile: [[0, 0], [1, 1], [2, 0]],
  open: [[0, 0], [1, 0], [2, 0], [0, 1, TONGUE], [1, 1, TONGUE], [2, 1, TONGUE], [1, 2]],
  flat: [[0, 1], [1, 1], [2, 1]],
  frown: [[0, 1], [1, 0], [2, 1]],
  o: [[1, 0], [0, 1], [2, 1], [1, 2]],
};

function face(mood, look = 0, blink = false) {
  switch (mood) {
    case 'sleeping':
      return { eyes: 'closed', mouth: 'flat', cheeks: true };
    case 'sick':
      return { eyes: 'sick', mouth: 'frown', cheeks: false, sweat: true };
    case 'sad':
      return { eyes: 'sad', mouth: 'frown', cheeks: false, tear: true };
    case 'eating':
      return { eyes: blink ? 'closed' : 'happy', mouth: 'open', cheeks: true };
    case 'happy':
      return { eyes: blink ? 'closed' : 'happy', mouth: 'open', cheeks: true };
    case 'surprised':
      return { eyes: 'wide', mouth: 'o', cheeks: true };
    case 'departed':
      return { eyes: 'closed', mouth: 'smile', cheeks: true };
    default:
      return { eyes: blink ? 'closed' : 'open', mouth: 'smile', cheeks: true, look };
  }
}

function spriteFor(skin, stage) {
  if (stage === 'egg') return EGG;
  if (stage === 'baby') return BABY;
  const set = SPRITES[skin] ?? SPRITES.mochi;
  return stage === 'child' ? set.child : set.adult;
}

/**
 * @returns {{w:number,h:number,pixels:Array<{x:number,y:number,c:string}>}}
 */
export function renderPet({ skin = 'mochi', stage = 'adult', mood = 'ok', look = 0, blink = false, crack = 0 }) {
  const pal = palette(skin);
  const def = spriteFor(skin, stage);

  if (stage === 'egg') {
    const eggPal = { ...pal, b: '#fffdf7', s: '#eadfd2', l: '#ffffff', a: pal.b === '#ffffff' || pal.b === '#fffaf3' ? '#ffb3c9' : pal.s };
    const { w, h, grid } = build(def.rows, eggPal);
    if (crack > 0) {
      // A zig-zag crack across the middle of the shell.
      const y = Math.floor(h / 2);
      const zig = [[1, 0], [2, -1], [3, 0], [4, 1], [5, 0], [6, -1], [7, 0], [8, 1], [9, 0]];
      zig.slice(0, Math.ceil(zig.length * crack)).forEach(([x, dy]) => {
        if (x < w - 1 && grid[y + dy]) grid[y + dy][x] = INK;
      });
    }
    return flatten(w, h, grid);
  }

  const { w, h, grid } = build(def.rows, pal);
  const f = face(mood, look, blink);
  const put = (x, y, c = EYE) => {
    const px = x + 1;
    const py = y + 1;
    if (py >= 0 && py < h && px >= 0 && px < w) grid[py][px] = c;
  };

  if (def.cheeks && f.cheeks) def.cheeks.forEach(([x, y]) => put(x, y, pal.c));
  def.eyes.forEach(([x, y], i) => {
    const dx = f.look ?? 0;
    (EYE_SHAPES[f.eyes] ?? EYE_SHAPES.open).forEach(([ox, oy]) => put(x + ox + dx, y + oy));
    if (f.tear && i === 0) put(x, y + 2, TEAR);
    if (f.sweat && i === 1) put(x + 2, y - 1, TEAR);
  });
  if (def.mouth) {
    const [mx, my] = def.mouth;
    (MOUTH_SHAPES[f.mouth] ?? MOUTH_SHAPES.smile).forEach(([ox, oy, c]) => put(mx + ox, my + oy, c ?? EYE));
  }

  return flatten(w, h, grid);
}

export function renderIcon(name, colors = {}) {
  const rows = ICONS[name] ?? [];
  const pixels = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === '.') return;
      pixels.push({ x, y, c: colors[ch] ?? ICON_COLORS[ch] ?? ICON_COLORS.o });
    });
  });
  return { w: Math.max(0, ...rows.map((r) => r.length)), h: rows.length, pixels };
}

function flatten(w, h, grid) {
  const pixels = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x]) pixels.push({ x, y, c: grid[y][x] });
    }
  }
  return { w, h, pixels };
}
