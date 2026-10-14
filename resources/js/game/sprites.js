/*
 * Pixel-art masks for every pet skin.
 *
 * Letters are palette keys (see PALETTES in skins.js):
 *   b body · a accent · h horns/tuft · n nose · k legs/feet · s wings (shade)
 * "." is transparent. Outlines, shading and highlights are added
 * automatically by render.js, so masks only describe silhouettes and colours.
 * Faces (eyes, mouth, cheeks) are drawn on top at the anchors given here, which
 * is what lets one sprite show every mood.
 */

export const BABY = {
  rows: [
    '...bbbbb...',
    '.bbbbbbbbb.',
    'bbbbbbbbbbb',
    'bbbbbbbbbbb',
    'bbbbbbbbbbb',
    'bbbbbbbbbbb',
    '.bbbbbbbbb.',
    '..bbbbbbb..',
  ],
  eyes: [[3, 1], [7, 1]],
  mouth: [4, 4],
  cheeks: [[1, 4], [9, 4]],
};

export const EGG = {
  rows: [
    '...bbb...',
    '..bbbbb..',
    '.bbabbbb.',
    '.bbbbbab.',
    'bbbbbbbbb',
    'bbabbbbbb',
    'bbbbbbabb',
    'bbbbbbbbb',
    '.bbbbbbb.',
    '..bbbbb..',
  ],
};

export const SPRITES = {
  mochi: {
    child: {
      rows: [
        '.....a.....',
        '....aa.....',
        '..bbbbbbb..',
        '.bbbbbbbbb.',
        'bbbbbbbbbbb',
        'bbbbbbbbbbb',
        'bbbbbbbbbbb',
        'bbbbbbbbbbb',
        '.bbbbbbbbb.',
      ],
      eyes: [[3, 3], [7, 3]],
      mouth: [4, 6],
      cheeks: [[1, 6], [9, 6]],
    },
    adult: {
      rows: [
        '.......aa......',
        '......aaa......',
        '......a........',
        '....bbbbbbb....',
        '..bbbbbbbbbbb..',
        '.bbbbbbbbbbbbb.',
        'bbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbb',
        '.bbbbbbbbbbbbb.',
        '..bbbbbbbbbbb..',
      ],
      eyes: [[4, 7], [10, 7]],
      mouth: [6, 9],
      cheeks: [[2, 9], [12, 9]],
    },
  },

  pipi: {
    child: {
      rows: [
        '.....h.....',
        '...bbbbb...',
        '..bbbbbbb..',
        '.bbbbbbbbb.',
        '.bbbbbbbbb.',
        'sbbbaaabbbs',
        'sbbbbabbbbs',
        '.bbbbbbbbb.',
        '..bbbbbbb..',
        '...k...k...',
      ],
      eyes: [[3, 3], [7, 3]],
      mouth: null,
      cheeks: [[2, 5], [8, 5]],
    },
    adult: {
      rows: [
        '......h.h......',
        '.......h.......',
        '.....bbbbb.....',
        '...bbbbbbbbb...',
        '..bbbbbbbbbbb..',
        '..bbbbbbbbbbb..',
        '.bbbbbbbbbbbbb.',
        '.bbbbbbbbbbbbb.',
        'sbbbbbaaabbbbbs',
        'ssbbbbbabbbbbss',
        '.bbbbbbbbbbbbb.',
        '..bbbbbbbbbbb..',
        '...bbbbbbbbb...',
        '.....k...k.....',
      ],
      eyes: [[4, 6], [10, 6]],
      mouth: null,
      cheeks: [[3, 8], [11, 8]],
    },
  },

  bunbun: {
    child: {
      rows: [
        '..bb...bb..',
        '..ba...ab..',
        '..ba...ab..',
        '.bbbbbbbbb.',
        'bbbbbbbbbbb',
        'bbbbbbbbbbb',
        'bbbbbnbbbbb',
        'bbbbbbbbbbb',
        '.bbbbbbbbb.',
        '..kk...kk..',
      ],
      eyes: [[3, 4], [7, 4]],
      mouth: [4, 7],
      cheeks: [[1, 6], [9, 6]],
    },
    adult: {
      rows: [
        '...bbb...bbb...',
        '...bab...bab...',
        '...bab...bab...',
        '...bab...bab...',
        '...bbb...bbb...',
        '..bbbbbbbbbbb..',
        '.bbbbbbbbbbbbb.',
        '.bbbbbbbbbbbbb.',
        'bbbbbbbbbbbbbbb',
        'bbbbbbbnbbbbbbb',
        'bbbbbbbbbbbbbbb',
        '.bbbbbbbbbbbbb.',
        '..bbbbbbbbbbb..',
        '...kk.....kk...',
      ],
      eyes: [[4, 7], [10, 7]],
      mouth: [6, 10],
      cheeks: [[2, 9], [12, 9]],
    },
  },

  neko: {
    child: {
      rows: [
        'b.........b',
        'bb.......bb',
        'babbbbbbbab',
        'bbbbbbbbbbb',
        'bbbbbbbbbbb',
        'bbbbbnbbbbb',
        'bbbbbbbbbbb',
        '.bbbbbbbbb.',
        '..baaaaab.b',
        '..bb...bbb.',
      ],
      eyes: [[3, 3], [7, 3]],
      mouth: [4, 6],
      cheeks: [[1, 5], [9, 5]],
    },
    adult: {
      rows: [
        '.b...........b.',
        '.bb.........bb.',
        '.bab.......bab.',
        '.bbbbbbbbbbbbb.',
        'bbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbb',
        'bbbbbbbnbbbbbbb',
        'bbbbbbbbbbbbbbb',
        '.bbbbbbbbbbbbb.',
        '...bbbbbbbbb...',
        '...bbaaaaabb.bb',
        '...bbaaaaabbbb.',
        '...bb.....bb...',
      ],
      eyes: [[4, 5], [10, 5]],
      mouth: [6, 8],
      cheeks: [[2, 7], [12, 7]],
    },
  },

  kumo: {
    child: {
      rows: [
        '.bb.bbb.bb.',
        'bbbbbbbbbbb',
        'hbaaaaaaabh',
        'baaaaaaaaab',
        'baaaaaaaaab',
        'bbaaaaaaabb',
        'bbbbbbbbbbb',
        '.bb.bbb.bb.',
        '..k.....k..',
      ],
      eyes: [[3, 2], [7, 2]],
      mouth: [4, 5],
      cheeks: [[2, 5], [8, 5]],
    },
    adult: {
      rows: [
        '..bb..bbb..bb..',
        '.bbbbbbbbbbbbb.',
        'bbbbbbbbbbbbbbb',
        'hhbaaaaaaaaabhh',
        'hbaaaaaaaaaaabh',
        '.baaaaaaaaaaab.',
        '.baaaaaaaaaaab.',
        'bbaaaaaaaaaaabb',
        'bbbaaaaaaaaabbb',
        'bbbbbbbbbbbbbbb',
        '.bbbbbbbbbbbbb.',
        '..bb.bbbbb.bb..',
        '...k.......k...',
      ],
      eyes: [[4, 5], [10, 5]],
      mouth: [6, 7],
      cheeks: [[3, 7], [11, 7]],
    },
  },

  boo: {
    child: {
      rows: [
        '...bbbbb...',
        '.bbbbbbbbb.',
        'bbbbbbbbbbb',
        'bbbbbbbbbbb',
        'bbbbbbbbbbb',
        'bbbbbbbbbbb',
        'bbbbbbbbbbb',
        'b.bbb.bbb.b',
      ],
      eyes: [[3, 2], [7, 2]],
      mouth: [4, 5],
      cheeks: [[1, 5], [9, 5]],
    },
    adult: {
      rows: [
        '.....bbbbb.....',
        '...bbbbbbbbb...',
        '..bbbbbbbbbbb..',
        '.bbbbbbbbbbbbb.',
        '.bbbbbbbbbbbbb.',
        '.bbbbbbbbbbbbb.',
        'bbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbb',
        '.bbbbbbbbbbbbb.',
        '.bbbbbbbbbbbbb.',
        '.bbbbbbbbbbbbb.',
        '.bb.bbb.bbb.bb.',
        '.b...b...b...b.',
      ],
      eyes: [[4, 5], [10, 5]],
      mouth: [6, 8],
      cheeks: [[2, 7], [12, 7]],
    },
  },

  drako: {
    child: {
      rows: [
        '..h.....h..',
        '..hbbbbbh..',
        '.bbbbbbbbb.',
        'bbbbbbbbbbb',
        'bbbbbbbbbbb',
        'bbbbbbbbbbb',
        'sbbbaaabbbs',
        '.bbbaaabbb.',
        '..bbbbbbb.b',
        '..bb...bbb.',
      ],
      eyes: [[3, 2], [7, 2]],
      mouth: [4, 5],
      cheeks: [[1, 5], [9, 5]],
    },
    adult: {
      rows: [
        '....h.....h....',
        '....hbbbbbh....',
        '...bbbbbbbbb...',
        '..bbbbbbbbbbb..',
        '..bbbbbbbbbbb..',
        '.bbbbbbbbbbbbb.',
        '.bbbbbbbbbbbbb.',
        '.bbbbbbbbbbbbb.',
        '..bbbbbbbbbbb..',
        'ssbbbbaaabbbbss',
        '.sbbbbaaabbbbs.',
        '...bbbaaabbb.bb',
        '...bbbbbbbbbbb.',
        '...bb.....bb...',
      ],
      eyes: [[4, 5], [10, 5]],
      mouth: [6, 7],
      cheeks: [[2, 7], [12, 7]],
    },
  },
};

/** Small pixel icons used on the LCD. "o" = ink, other letters map to ICON_COLORS. */
export const ICONS = {
  poop: ['..o..', '.obo.', '.obbo', 'obbbo', 'ooooo'],
  skull: ['.ooo.', 'owowo', 'owwwo', '.oww.', '.o.o.'],
  heart: ['.r.r.', 'rrrrr', 'rrrrr', '.rrr.', '..r..'],
  note: ['..oo', '..oo', '..o.', 'ooo.', 'oo..'],
  alert: ['o', 'o', 'o', '.', 'o'],
  star: ['..y..', '.yyy.', 'yyyyy', '.yyy.', '.y.y.'],
  crown: ['y.y.y', 'yyyyy', 'yryry', 'yyyyy'],
  halo: ['.yyy.', 'y...y', '.yyy.'],
  zz: ['ooo.', '..o.', '.o..', 'ooo.'],
  meal: ['.ggg.', 'gwwwg', 'gwwwg', '.ggg.', '..o..'], // onigiri
  snack: ['.rr..', 'rwrr.', 'rrrr.', '.rr..', '..o..'], // lollipop
  pill: ['.rr.', 'rrww', 'rrww', '.ww.'],
  bubble: ['.bb.', 'b..b', 'b..b', '.bb.'],
  check: ['....o', '...o.', 'o.o..', '.o...'],
  cross: ['o...o', '.o.o.', '..o..', '.o.o.', 'o...o'],
  arrowLeft: ['..o', '.oo', 'ooo', '.oo', '..o'],
  arrowRight: ['o..', 'oo.', 'ooo', 'oo.', 'o..'],
  sparkle: ['..w..', '..w..', 'ww.ww', '..w..', '..w..'],
  stink: ['.o.', 'o..', '.o.', '..o'],
};

export const ICON_COLORS = {
  o: '#2b1a33',
  b: '#8a5a3c',
  w: '#ffffff',
  r: '#ff5c8a',
  y: '#ffc93c',
  g: '#3b2346',
};
