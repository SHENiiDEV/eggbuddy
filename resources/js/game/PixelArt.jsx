import { memo, useMemo } from 'react';
import { renderIcon, renderPet } from './render.js';

/** Merge horizontal runs of the same colour so a sprite is a handful of rects, not hundreds. */
function runs(pixels) {
  const sorted = [...pixels].sort((a, b) => a.y - b.y || a.x - b.x);
  const out = [];
  for (const p of sorted) {
    const last = out[out.length - 1];
    if (last && last.y === p.y && last.c === p.c && last.x + last.w === p.x) {
      last.w += 1;
    } else {
      out.push({ x: p.x, y: p.y, w: 1, c: p.c });
    }
  }
  return out;
}

/** Renders pixel data as rects. Use inside an <svg> (as a <g>) or standalone. */
export const PixelGroup = memo(function PixelGroup({ art, x = 0, y = 0, flip = false, opacity }) {
  const rects = useMemo(() => runs(art.pixels), [art]);
  const transform = flip ? `translate(${x + art.w},${y}) scale(-1,1)` : `translate(${x},${y})`;

  return (
    <g transform={transform} opacity={opacity}>
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w + 0.02} height={1.02} fill={r.c} />
      ))}
    </g>
  );
});

export function PixelArt({ art, scale = 4, flip = false, className = '', title, style }) {
  return (
    <svg
      viewBox={`0 0 ${art.w} ${art.h}`}
      width={art.w * scale}
      height={art.h * scale}
      shapeRendering="crispEdges"
      className={className}
      style={style}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <PixelGroup art={art} flip={flip} />
    </svg>
  );
}

/** A pet (or egg) sprite as a standalone image. */
export function PetSprite({ skin, stage = 'adult', mood = 'ok', look = 0, blink = false, scale = 4, className = '', title, flip }) {
  const art = useMemo(() => renderPet({ skin, stage, mood, look, blink }), [skin, stage, mood, look, blink]);
  return <PixelArt art={art} scale={scale} className={className} title={title} flip={flip} />;
}

export function PixelIcon({ name, scale = 3, className = '', colors }) {
  const art = useMemo(() => renderIcon(name, colors), [name, colors]);
  return <PixelArt art={art} scale={scale} className={className} />;
}
