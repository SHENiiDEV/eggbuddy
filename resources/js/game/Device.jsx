import { useId } from 'react';
import { INK, shell as shellStyle } from './skins.js';

const VB_W = 300;
const VB_H = 380;
const EGG = 'M150 34 C 72 34 22 128 22 214 C 22 302 80 364 150 364 C 220 364 278 302 278 214 C 278 128 228 34 150 34 Z';
const SCREEN = { x: 70, y: 132, w: 160, h: 134 };
const LCD = { x: 82, y: 144, w: 136, h: 102 };
const BUTTONS = [
  { cx: 104, cy: 312, r: 15 },
  { cx: 150, cy: 322, r: 15 },
  { cx: 196, cy: 312, r: 15 },
];

const pct = (v, total) => `${(v / total) * 100}%`;

function Pattern({ type, color, id }) {
  if (!type) return null;
  const shapes = [];
  const rnd = (i, n) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  for (let i = 0; i < 26; i++) {
    const x = 30 + rnd(i, 1) * 240;
    const y = 50 + rnd(i, 2) * 300;
    // Keep decorations off the screen area.
    if (x > SCREEN.x - 14 && x < SCREEN.x + SCREEN.w + 14 && y > SCREEN.y - 14 && y < SCREEN.y + SCREEN.h + 14) continue;
    const s = 0.7 + rnd(i, 3) * 0.8;
    if (type === 'dots') shapes.push(<circle key={i} cx={x} cy={y} r={4 * s} fill={color} opacity="0.75" />);
    if (type === 'bubbles') shapes.push(<circle key={i} cx={x} cy={y} r={6 * s} fill="none" stroke={color} strokeWidth="2.5" opacity="0.8" />);
    if (type === 'stars')
      shapes.push(
        <path key={i} transform={`translate(${x} ${y}) scale(${s})`} d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z" fill={color} opacity={0.6 + rnd(i, 4) * 0.4} />,
      );
    if (type === 'flowers')
      shapes.push(
        <g key={i} transform={`translate(${x} ${y}) scale(${s}) rotate(${rnd(i, 5) * 72})`} opacity="0.85">
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-5" rx="3.6" ry="5" fill={color} transform={`rotate(${a})`} />
          ))}
          <circle r="2.4" fill="#fff3b8" />
        </g>,
      );
    if (type === 'clouds' && i % 3 === 0)
      shapes.push(
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`} fill={color} opacity="0.85">
          <circle cx="-8" cy="2" r="7" />
          <circle cx="2" cy="-3" r="9" />
          <circle cx="11" cy="3" r="6" />
          <rect x="-15" y="2" width="32" height="7" rx="3.5" />
        </g>,
      );
  }
  return <g clipPath={`url(#${id}-clip)`}>{shapes}</g>;
}

/**
 * The egg-shaped handheld. `children` is rendered inside the LCD.
 * `onButton(index)` fires for the three physical buttons (0 = left, 1 = middle, 2 = right).
 */
export default function Device({ shell = 'strawberry', children, onButton, buttonLabels = ['A', 'B', 'C'], label = 'EGGBUDDY', className = '', disabled = false }) {
  const id = useId().replace(/:/g, '');
  const s = shellStyle(shell);

  return (
    <div className={`relative w-full select-none ${className}`} style={{ aspectRatio: `${VB_W} / ${VB_H}` }}>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={`${id}-body`} x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor={s.from} />
            <stop offset="1" stopColor={s.to} />
          </linearGradient>
          <radialGradient id={`${id}-shine`} cx="0.32" cy="0.22" r="0.5">
            <stop offset="0" stopColor="#ffffff" stopOpacity={s.dark ? 0.28 : 0.65} />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`${id}-clip`}>
            <path d={EGG} />
          </clipPath>
        </defs>

        {/* key ring */}
        <circle cx="150" cy="20" r="13" fill="none" stroke={INK} strokeWidth="5" />
        <rect x="142" y="28" width="16" height="12" rx="4" fill={s.to} stroke={INK} strokeWidth="4" />

        {/* toy shadow + body */}
        <path d={EGG} fill={INK} transform="translate(0 9)" />
        <path d={EGG} fill={`url(#${id}-body)`} opacity={s.translucent ? 0.85 : 1} />
        <Pattern type={s.pattern} color={s.patternColor} id={id} />
        <path d={EGG} fill={`url(#${id}-shine)`} />
        <path d={EGG} fill="none" stroke={INK} strokeWidth="6" />

        {/* label */}
        <text x="150" y="116" textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize="13" letterSpacing="1.5" fill={s.dark ? '#fff6c9' : INK}>
          {label}
        </text>

        {/* screen bezel */}
        <rect x={SCREEN.x} y={SCREEN.y + 6} width={SCREEN.w} height={SCREEN.h} rx="30" fill={INK} />
        <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx="30" fill={s.bezel} stroke={INK} strokeWidth="5" />
        <rect x={LCD.x - 3} y={LCD.y - 3} width={LCD.w + 6} height={LCD.h + 6} rx="9" fill={INK} />
      </svg>

      {/* LCD contents */}
      <div
        className="absolute overflow-hidden rounded-[6px]"
        style={{ left: pct(LCD.x, VB_W), top: pct(LCD.y, VB_H), width: pct(LCD.w, VB_W), height: pct(LCD.h, VB_H) }}
      >
        {children}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,.35)_0%,rgba(255,255,255,0)_38%)]" />
      </div>

      {/* Buttons */}
      {BUTTONS.map((b, i) => (
        <button
          key={i}
          type="button"
          disabled={disabled || !onButton}
          onClick={() => onButton?.(i)}
          aria-label={buttonLabels[i]}
          title={buttonLabels[i]}
          className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-ink transition-transform enabled:cursor-pointer enabled:hover:-translate-y-[55%] enabled:active:translate-y-[-40%] disabled:cursor-default"
          style={{
            left: pct(b.cx, VB_W),
            top: pct(b.cy, VB_H),
            width: pct(b.r * 2, VB_W),
            aspectRatio: '1',
            background: s.button,
            boxShadow: `0 4px 0 ${INK}, inset 0 3px 0 rgba(255,255,255,.7)`,
          }}
        />
      ))}
    </div>
  );
}
