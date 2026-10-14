import { useEffect, useMemo, useRef, useState } from 'react';
import { PixelGroup } from './PixelArt.jsx';
import { renderIcon, renderPet } from './render.js';

export const LCD_W = 40;
export const LCD_H = 30;
const GROUND = 27;

export function useTicker(ms = 500) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  return tick;
}

const icon = (name, colors) => renderIcon(name, colors);
const ICON_CACHE = {};
const cached = (name, colors) => {
  const key = name + JSON.stringify(colors ?? {});
  return (ICON_CACHE[key] ??= icon(name, colors));
};

function moodFor(pet, effect, game) {
  if (game?.last) return game.last.correct ? 'happy' : 'sad';
  if (effect && ['meal', 'snack', 'item'].includes(effect.type)) return 'eating';
  if (effect && ['pat', 'happy', 'hatch', 'evolve', 'win'].includes(effect.type)) return 'happy';
  if (effect?.type === 'refuse') return 'surprised';
  if (pet.is_asleep) return 'sleeping';
  return pet.mood && pet.mood !== 'ok' ? pet.mood : 'ok';
}

/**
 * The pet's little LCD world: 48x36 "real" pixels scaled up with crisp edges.
 * Props:
 *  pet    - presented pet state from the server (or a demo object)
 *  effect - { type, id } short animation triggered by the last action
 *  game   - minigame state { round, rounds, wins, last: {guess, actual, correct} }
 */
export default function LcdScreen({ pet, effect = null, game = null, className = '' }) {
  const tick = useTicker(500);
  const [pos, setPos] = useState({ x: LCD_W / 2, dir: 1 });
  const effectStart = useRef({ id: null, tick: 0 });

  if (effect && effectStart.current.id !== effect.id) {
    effectStart.current = { id: effect.id, tick };
  }
  const elapsed = effect ? tick - effectStart.current.tick : 99;
  const activeEffect = effect && elapsed < 6 ? effect : null;

  const isEgg = pet.status === 'egg' || pet.stage === 'egg';
  const departed = pet.status === 'departed';
  const sleeping = pet.is_asleep && !isEgg && !departed;
  const busy = !!activeEffect || !!game;

  // Wander around like a real pocket pet.
  useEffect(() => {
    if (isEgg || departed || sleeping || busy) {
      setPos((p) => ({ ...p, x: LCD_W / 2 }));
      return;
    }
    if (tick % 2 !== 0) return;
    setPos((p) => {
      const step = (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 3));
      const next = Math.max(12, Math.min(LCD_W - 12, p.x + step));
      return { x: next, dir: next === p.x ? p.dir : Math.sign(next - p.x) };
    });
  }, [tick, isEgg, departed, sleeping, busy]);

  const mood = moodFor(pet, activeEffect, game);
  const blink = tick % 9 === 0 && mood === 'ok';
  const look = game?.last ? (game.last.actual === 'left' ? -1 : 1) : 0;

  const crack = isEgg && pet.hatches_in != null && pet.hatches_in <= 20 ? Math.min(1, (20 - pet.hatches_in) / 20 + 0.1) : 0;

  const art = useMemo(() => {
    if (departed) return renderPet({ skin: pet.skin, stage: 'baby', mood: 'departed' });
    return renderPet({ skin: pet.skin, stage: isEgg ? 'egg' : pet.stage, mood, look, blink, crack: Math.round(crack * 9) / 9 });
  }, [pet.skin, pet.stage, isEgg, departed, mood, look, blink, crack]);

  const bob = sleeping ? 0 : tick % 2;
  let px = Math.round(pos.x - art.w / 2);
  let py = GROUND - art.h + (isEgg ? 0 : -bob);
  if (isEgg && pet.hatches_in != null && pet.hatches_in <= 30) px += tick % 2 === 0 ? -1 : 1;
  if (departed) py = 7 + Math.round(Math.sin(tick / 2) * 1.5);
  if (activeEffect?.type === 'refuse') px += tick % 2 === 0 ? -1 : 1;
  const flip = !busy && !isEgg && pos.dir < 0 && !sleeping;

  const showStar = pet.form === 'star' && !isEgg && !departed;
  const needsAttention = !isEgg && !departed && !sleeping && (pet.needs?.length ?? 0) > 0;

  return (
    <svg viewBox={`0 0 ${LCD_W} ${LCD_H}`} className={`block h-full w-full ${className}`} shapeRendering="crispEdges" aria-hidden>
      <defs>
        <pattern id="lcd-grid" width="1" height="1" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" fill="#d6ebc1" />
          <rect width="0.92" height="0.92" fill="#dcefc9" />
        </pattern>
      </defs>
      <rect width={LCD_W} height={LCD_H} fill="url(#lcd-grid)" />

      {/* Status row */}
      {needsAttention && tick % 2 === 0 && <PixelGroup art={cached('alert')} x={2} y={2} />}
      {game && <GameHud game={game} tick={tick} />}

      {/* Pet */}
      <PixelGroup art={art} x={px} y={py} flip={flip} />

      {showStar && <PixelGroup art={cached('crown')} x={px + Math.round(art.w / 2) - 2} y={py - 5} />}
      {showStar && tick % 4 < 2 && <PixelGroup art={cached('sparkle')} x={px - 6} y={py + 2} />}
      {departed && <PixelGroup art={cached('halo')} x={px + Math.round(art.w / 2) - 2} y={py - 4} />}

      {pet.is_sick && !isEgg && !departed && tick % 2 === 0 && <PixelGroup art={cached('skull')} x={Math.min(LCD_W - 7, px + art.w + 1)} y={py - 2} />}

      {/* Poop */}
      {!isEgg && !departed &&
        Array.from({ length: pet.poop ?? 0 }).map((_, i) => {
          const x = LCD_W - 6 - i * 6;
          return (
            <g key={i}>
              <PixelGroup art={cached('poop')} x={x} y={GROUND - 5} />
              <PixelGroup art={cached('stink')} x={x + 1 + (tick % 2)} y={GROUND - 10} />
            </g>
          );
        })}

      {/* Effects */}
      {activeEffect && <Effect effect={activeEffect} elapsed={elapsed} px={px} py={py} art={art} tick={tick} />}

      {/* Lights off */}
      {sleeping && (
        <g>
          <rect width={LCD_W} height={LCD_H} fill="#1d2233" opacity="0.78" />
          <PixelGroup art={cached('zz', { o: '#dcefc9' })} x={px + art.w - 1} y={py - 4 - (tick % 3)} />
          <PixelGroup art={cached('zz', { o: '#9fb58a' })} x={px + art.w + 4} y={py - 9 - (tick % 3)} />
        </g>
      )}
    </svg>
  );
}

function GameHud({ game, tick }) {
  const dots = [];
  for (let i = 0; i < game.rounds; i++) {
    const result = game.results?.[i];
    dots.push(
      <rect key={i} x={LCD_W / 2 - game.rounds * 2 + i * 4} y={2} width={3} height={3} fill={result === undefined ? '#b7cfa3' : result ? '#3b2346' : '#ff5c8a'} />,
    );
  }

  return (
    <g>
      {dots}
      {!game.last && tick % 2 === 0 && (
        <>
          <PixelGroup art={cached('arrowLeft')} x={2} y={13} />
          <PixelGroup art={cached('arrowRight')} x={LCD_W - 5} y={13} />
        </>
      )}
      {game.last && <PixelGroup art={cached(game.last.correct ? 'check' : 'cross')} x={game.last.actual === 'left' ? 3 : LCD_W - 8} y={7} />}
    </g>
  );
}

function Effect({ effect, elapsed, px, py, art, tick }) {
  const midY = py + Math.round(art.h / 2);
  switch (effect.type) {
    case 'meal':
    case 'snack':
    case 'item': {
      if (elapsed > 4) return null;
      const name = effect.type === 'snack' ? 'snack' : 'meal';
      return <PixelGroup art={cached(name)} x={px - 7} y={midY - (elapsed % 2)} opacity={elapsed > 3 ? 0.4 : 1} />;
    }
    case 'clean': {
      const x = LCD_W - elapsed * 12;
      return (
        <g>
          <rect x={x} y={0} width={2} height={LCD_H} fill="#3b2346" />
          <rect x={x + 3} y={0} width={1} height={LCD_H} fill="#3b2346" opacity="0.5" />
          {elapsed > 1 && <PixelGroup art={cached('sparkle')} x={px + art.w} y={py} />}
        </g>
      );
    }
    case 'medicine':
      return elapsed < 4 ? <PixelGroup art={cached('pill')} x={px + art.w + 1} y={py + 2 - (elapsed % 2)} /> : null;
    case 'pat':
    case 'happy':
    case 'win':
    case 'hatch':
    case 'evolve':
      return (
        <g>
          <PixelGroup art={cached('heart')} x={px - 6} y={py + 2 - elapsed * 2} opacity={1 - elapsed * 0.15} />
          <PixelGroup art={cached('heart')} x={px + art.w + 1} y={py + 5 - elapsed * 2} opacity={1 - elapsed * 0.15} />
          {(effect.type === 'hatch' || effect.type === 'evolve') && tick % 2 === 0 && (
            <>
              <PixelGroup art={cached('sparkle')} x={2} y={6} />
              <PixelGroup art={cached('sparkle')} x={LCD_W - 7} y={10} />
            </>
          )}
        </g>
      );
    case 'note':
      return <PixelGroup art={cached('note')} x={px + art.w + 1} y={py - elapsed} />;
    default:
      return null;
  }
}
