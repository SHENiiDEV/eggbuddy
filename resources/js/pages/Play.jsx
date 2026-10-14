import { Head, Link, router } from '@inertiajs/react';
import { Droplets, Gamepad2, Hand, Heart, Lightbulb, LightbulbOff, Pencil, Pill, ShoppingBag, Sparkles, Utensils, Candy, Volume2, VolumeX, Zap, X, ArrowLeft, ArrowRight, Egg, Scale, Trophy, CircleAlert } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Coins, Modal } from '../components/ui.jsx';
import { toast } from '../components/Toasts.jsx';
import Device from '../game/Device.jsx';
import LcdScreen from '../game/LcdScreen.jsx';
import { PetSprite } from '../game/PixelArt.jsx';
import { withLayout } from '../layouts/AppLayout.jsx';
import { api } from '../lib/api.js';
import { getPrefs, setPref } from '../lib/consent.js';
import { duration } from '../lib/format.js';
import { beep } from '../lib/sound.js';

const STAGE_LABEL = { egg: 'Egg', baby: 'Baby', child: 'Child', teen: 'Teen', adult: 'Adult' };
const MOOD_LABEL = {
  happy: 'Feeling great',
  ok: 'Doing fine',
  sad: 'Feeling down',
  sick: 'Under the weather',
  sleeping: 'Fast asleep',
  egg: 'Warming up',
  departed: 'On Egg Planet',
};
const NEED_LABEL = { hungry: 'Hungry', bored: 'Bored', tired: 'Sleepy', dirty: 'Needs a clean', sick: 'Sick' };
const REASON = {
  starved: 'It got too hungry while nobody was around.',
  sick: 'A cold went untreated for too long.',
  lonely: 'It felt lonely for too long.',
};
const ITEM_EMOJI = { onigiri: '🍙', rainbow_candy: '🍭', strawberry_cake: '🍰', energy_milk: '🥛', bubble_bath: '🫧', vitamin_drop: '💊', golden_apple: '🍎' };

export default function Play({ state: initial, items, minigame: gameConfig, memories, speed }) {
  const [state, setState] = useState(initial);
  const [effect, setEffect] = useState(null);
  const [bubble, setBubble] = useState(null);
  const [busy, setBusy] = useState(false);
  const [game, setGame] = useState(null);
  const [sound, setSound] = useState(() => !!getPrefs().sound);
  const [naming, setNaming] = useState(false);
  const [hatchIn, setHatchIn] = useState(initial.pet.hatches_in);
  const prev = useRef(initial.pet);
  const coinsRef = useRef(initial.coins);

  const pet = state.pet;
  const isEgg = pet.status === 'egg';
  const departed = pet.status === 'departed';
  const alive = pet.status === 'alive';

  const say = useCallback((text, error = false) => {
    if (!text) return;
    setBubble({ text, error, id: Date.now() });
  }, []);

  const apply = useCallback(
    (data) => {
      if (!data?.pet) return;
      const before = prev.current;
      setState(data);
      setHatchIn(data.pet.hatches_in);

      if (before.status === 'egg' && data.pet.status === 'alive') {
        setEffect({ type: 'hatch', id: Date.now() });
        say(`It hatched! Say hello to ${data.pet.name}!`);
        beep('hatch', sound);
        if (!data.pet.has_name) setTimeout(() => setNaming(true), 1600);
      } else if (before.stage !== data.pet.stage && data.pet.status === 'alive' && before.status === 'alive') {
        setEffect({ type: 'evolve', id: Date.now() });
        toast(`${data.pet.name} grew into ${data.pet.stage === 'adult' && data.pet.form === 'star' ? 'a Star adult' : `a ${STAGE_LABEL[data.pet.stage].toLowerCase()}`}!`);
      } else if (before.status === 'alive' && data.pet.status === 'departed') {
        say(`${data.pet.name} flew back to Egg Planet...`, true);
      }

      if (data.coins !== coinsRef.current) {
        coinsRef.current = data.coins;
        router.reload({ only: ['auth'] });
      }
      prev.current = data.pet;
    },
    [say, sound],
  );

  const refresh = useCallback(async () => {
    const res = await api('/play/state');
    if (res.ok) apply(res.data);
  }, [apply]);

  // Keep the pet in sync while the page is open.
  useEffect(() => {
    const id = setInterval(() => document.visibilityState === 'visible' && refresh(), 20000);
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  // Egg countdown.
  useEffect(() => {
    if (!isEgg || hatchIn == null) return;
    if (hatchIn <= 0) {
      const t = setTimeout(refresh, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setHatchIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [isEgg, hatchIn, refresh]);

  useEffect(() => {
    if (!bubble) return;
    const t = setTimeout(() => setBubble(null), 4500);
    return () => clearTimeout(t);
  }, [bubble]);

  useEffect(() => {
    if (alive && !pet.has_name && prev.current.status === 'alive' && initial.pet.status === 'alive') setNaming(true);
    // only on first load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const call = async (url, body, effectType) => {
    if (busy) return null;
    setBusy(true);
    beep('press', sound);
    const res = await api(url, { method: 'POST', body });
    setBusy(false);
    if (res.data?.pet) apply(res.data);
    if (res.ok) {
      if (effectType) setEffect({ type: effectType, id: Date.now() });
      say(res.data.message);
      beep('ok', sound);
    } else {
      setEffect({ type: 'refuse', id: Date.now() });
      say(res.data.message, true);
      beep('no', sound);
    }
    return res;
  };

  const act = (action) => {
    const fx = { meal: 'meal', snack: 'snack', clean: 'clean', medicine: 'medicine', pat: 'pat', lights: null }[action];
    return call('/play/act', { action }, fx);
  };

  const giveItem = (item) => call('/play/use', { item }, 'item');

  const startGame = async () => {
    const res = await call('/play/game/start', {}, null);
    if (res?.ok) setGame({ round: 0, rounds: gameConfig.rounds, wins: 0, results: [], last: null });
  };

  const guess = async (dir) => {
    if (!game || busy) return;
    setBusy(true);
    beep('press', sound);
    const res = await api('/play/game/guess', { method: 'POST', body: { guess: dir } });
    setBusy(false);
    if (!res.ok) {
      say(res.data.message, true);
      setGame(null);
      return;
    }
    const r = res.data.round;
    setGame((g) => ({ ...g, round: r.round, wins: r.wins, results: [...(g?.results ?? []), r.correct], last: { guess: r.guess, actual: r.actual, correct: r.correct } }));
    beep(r.correct ? 'ok' : 'no', sound);
    if (r.finished) {
      apply(res.data);
      const reward = r.reward;
      setTimeout(() => {
        setGame(null);
        setEffect({ type: reward.won ? 'win' : 'pat', id: Date.now() });
        say(
          reward.won
            ? `You won ${r.wins}/${r.rounds}!${reward.coins ? ` +${reward.coins} coins` : ''}`
            : `${r.wins}/${r.rounds}. Good try!${reward.coins ? ` +${reward.coins} coins` : ''}`,
        );
        if (reward.won) beep('win', sound);
        if (reward.daily_cap_reached) toast("You've reached today's mini-game coin limit. Come back tomorrow!");
      }, 1300);
    } else {
      setTimeout(() => setGame((g) => (g ? { ...g, last: null } : g)), 1100);
    }
  };

  const newEgg = async () => {
    setBusy(true);
    const res = await api('/play/new-egg', { method: 'POST' });
    setBusy(false);
    if (res.ok) {
      prev.current = res.data.pet;
      setState(res.data);
      setHatchIn(res.data.pet.hatches_in);
      say('A new egg appeared!');
    } else {
      say(res.data.message, true);
    }
  };

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    if (!setPref('sound', next) && next) toast('Sound is on for this visit. Allow functional cookies to remember it.');
    if (next) beep('ok', true);
  };

  const onDeviceButton = (i) => {
    if (game) {
      if (game.last) return;
      if (i === 0) guess('left');
      if (i === 2) guess('right');
      if (i === 1) say('Pick left or right!');
      return;
    }
    if (!alive) return;
    if (i === 0) act('meal');
    if (i === 1) startGame();
    if (i === 2) act('clean');
  };

  const screenPet = { ...pet, hatches_in: hatchIn };
  const lightsOn = !pet.is_asleep;

  return (
    <>
      <Head title={alive ? `${pet.name}` : 'My buddy'} />
      <div className="relative">
        <div className="dot-grid absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:pt-12">
          {/* Title row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="pixel text-xs text-pink-deep">{isEgg ? 'Egg' : departed ? 'In loving memory' : `${STAGE_LABEL[pet.stage]}${pet.form === 'star' ? ' · Star form' : ''}`}</p>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-4xl font-bold sm:text-5xl">{isEgg ? 'Your egg' : pet.name}</h1>
                  {alive && (
                    <button type="button" onClick={() => setNaming(true)} className="rounded-full p-2 text-ink-muted hover:bg-white hover:text-ink" aria-label="Rename">
                      <Pencil className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={toggleSound} className="chip h-10 shadow-toy-sm" aria-label={sound ? 'Mute sounds' : 'Turn sounds on'}>
                {sound ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
              </button>
              <Link href="/top-up" className="chip h-10 shadow-toy-sm">
                <Coins amount={state.coins} />
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_minmax(320px,400px)_1fr] lg:items-start">
            {/* Left: actions */}
            <div className="order-2 lg:order-1">
              {game ? (
                <GamePanel game={game} config={gameConfig} onGuess={guess} busy={busy || !!game.last} onQuit={() => setGame(null)} />
              ) : (
                <ActionsPanel pet={pet} alive={alive} busy={busy} lightsOn={lightsOn} act={act} startGame={startGame} gameConfig={gameConfig} />
              )}
            </div>

            {/* Center: device */}
            <div className="order-1 mx-auto w-full max-w-[320px] sm:max-w-[400px] lg:order-2">
              <div className="relative">
                <div className="h-14">
                  {bubble && (
                    <div
                      key={bubble.id}
                      className={`relative mx-auto w-fit max-w-[92%] animate-pop rounded-2xl border-[3px] border-ink px-4 py-2 text-center text-sm font-extrabold shadow-toy-sm ${bubble.error ? 'bg-peach-soft' : 'bg-white'}`}
                    >
                      {bubble.text}
                      <span className={`absolute -bottom-[10px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-r-[3px] border-b-[3px] border-ink ${bubble.error ? 'bg-peach-soft' : 'bg-white'}`} />
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <Device
                    shell={state.shell}
                    onButton={onDeviceButton}
                    disabled={busy || (!alive && !game)}
                    buttonLabels={game ? ['Left', 'Pick a side', 'Right'] : ['Feed a meal', 'Play Left or Right', 'Clean up']}
                  >
                    <LcdScreen pet={screenPet} effect={effect} game={game} />
                  </Device>
                </div>
              </div>
              {isEgg && (
                <div className="mt-6 text-center">
                  <p className="font-display text-2xl font-semibold">{hatchIn > 0 ? 'Something is wiggling...' : 'Crack!'}</p>
                  <p className="pixel mt-1 text-sm text-ink-muted">{hatchIn > 0 ? `Hatching in ${duration(hatchIn)}` : 'Hatching now'}</p>
                </div>
              )}
              {departed && <DepartedCard pet={pet} onNewEgg={newEgg} busy={busy} />}
              {alive && pet.needs.length > 0 && (
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {pet.needs.map((n) => (
                    <span key={n} className="chip bg-peach-soft text-xs">
                      <CircleAlert className="h-3.5 w-3.5 text-danger" /> {NEED_LABEL[n]}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: stats + bag */}
            <div className="order-3 space-y-6">
              <StatsCard pet={pet} speed={speed} />
              <BagCard items={items} inventory={state.inventory} onUse={giveItem} disabled={busy || !alive || pet.is_asleep || !!game} />
            </div>
          </div>

          {memories.length > 0 && <Memories memories={memories} />}
        </div>
      </div>

      <NameModal open={naming} pet={pet} onClose={() => setNaming(false)} onSaved={(data) => apply(data)} say={say} />
    </>
  );
}

Play.layout = withLayout;

/* ------------------------------------------------------------------ */

function ActionsPanel({ pet, alive, busy, lightsOn, act, startGame, gameConfig }) {
  const sleeping = pet.is_asleep;
  const actions = [
    { key: 'meal', label: 'Meal', icon: Utensils, bg: 'bg-peach', onClick: () => act('meal'), hint: 'Fills the tummy' },
    { key: 'snack', label: 'Snack', icon: Candy, bg: 'bg-pink', onClick: () => act('snack'), hint: 'Yummy, but fattening' },
    { key: 'game', label: 'Play', icon: Gamepad2, bg: 'bg-lemon', onClick: startGame, hint: `Left or Right · -${gameConfig.energy_cost} energy` },
    { key: 'clean', label: 'Clean', icon: Droplets, bg: 'bg-sky', onClick: () => act('clean'), hint: 'Scoop the poop' },
    { key: 'medicine', label: 'Medicine', icon: Pill, bg: 'bg-mint', onClick: () => act('medicine'), hint: 'Only when sick' },
    { key: 'pat', label: 'Pat', icon: Hand, bg: 'bg-lilac', onClick: () => act('pat'), hint: 'A little love' },
  ];

  return (
    <div className="card p-5">
      <p className="pixel mb-4 text-xs text-ink-muted">Care</p>
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-2">
        {actions.map((a) => (
          <button
            key={a.key}
            type="button"
            onClick={a.onClick}
            disabled={!alive || busy || sleeping}
            title={a.hint}
            className="group flex flex-col items-center gap-2 rounded-2xl border-[3px] border-ink bg-white px-2 py-3 shadow-toy-sm transition enabled:hover:-translate-y-0.5 enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:opacity-45"
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl border-[3px] border-ink ${a.bg}`}>
              <a.icon className="h-5.5 w-5.5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-[15px] font-semibold">{a.label}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => act('lights')}
        disabled={!alive || busy}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-[3px] border-ink px-4 py-3 font-display font-semibold shadow-toy-sm transition enabled:hover:-translate-y-0.5 disabled:opacity-45 ${
          lightsOn ? 'bg-ink text-cream' : 'bg-lemon text-ink'
        }`}
      >
        {lightsOn ? <LightbulbOff className="h-5 w-5" /> : <Lightbulb className="h-5 w-5" />}
        {lightsOn ? 'Lights off (sleep)' : 'Lights on (wake up)'}
      </button>
      <p className="mt-4 text-xs leading-5 font-semibold text-ink-muted">
        Tip: the handheld buttons work too. Left feeds, middle plays, right cleans.
      </p>
    </div>
  );
}

function GamePanel({ game, config, onGuess, busy, onQuit }) {
  return (
    <div className="card bg-lemon-soft p-5">
      <div className="flex items-center justify-between">
        <p className="font-display text-2xl font-semibold">Left or Right?</p>
        <button type="button" onClick={onQuit} className="rounded-full p-1.5 text-ink-muted hover:bg-white hover:text-ink" aria-label="Quit game">
          <X className="h-5 w-5" strokeWidth={3} />
        </button>
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        Guess where your buddy will look. Win {config.win_threshold} of {config.rounds} rounds for a big happiness boost and {config.coins_per_win} coins per correct guess.
      </p>
      <div className="mt-5 flex justify-center gap-2" aria-label="Rounds">
        {Array.from({ length: game.rounds }).map((_, i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-md border-[3px] border-ink ${game.results[i] === undefined ? 'bg-white' : game.results[i] ? 'bg-mint' : 'bg-pink'}`}
          />
        ))}
      </div>
      <p className="pixel mt-3 text-center text-sm">
        Round {Math.min(game.round + 1, game.rounds)} / {game.rounds} · Wins {game.wins}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" disabled={busy} onClick={() => onGuess('left')} className="btn btn-secondary btn-lg">
          <ArrowLeft className="h-5 w-5" strokeWidth={3} /> Left
        </button>
        <button type="button" disabled={busy} onClick={() => onGuess('right')} className="btn btn-secondary btn-lg">
          Right <ArrowRight className="h-5 w-5" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

function Meter({ label, value, icon: Icon, color }) {
  const filled = Math.round(value / 10);
  const low = value < 25;
  return (
    <div>
      <div className="flex items-center justify-between text-sm font-extrabold">
        <span className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${low ? 'text-danger' : ''}`} strokeWidth={2.6} /> {label}
        </span>
        <span className={`tabular-nums ${low ? 'text-danger' : 'text-ink-muted'}`}>{value}%</span>
      </div>
      <div className="mt-1.5 flex gap-1" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className={`h-3.5 flex-1 rounded-[3px] border-2 border-ink transition-colors ${i < filled ? (low ? 'bg-danger/80' : color) : 'bg-cream'}`} />
        ))}
      </div>
    </div>
  );
}

function StatsCard({ pet, speed }) {
  const s = pet.stats;
  const age = pet.age_hours < 24 ? `${Math.floor(pet.age_hours)} h` : `${pet.age_days} ${pet.age_days === 1 ? 'day' : 'days'}`;
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="pixel text-xs text-ink-muted">Status</p>
        <span className="chip py-0.5 text-xs">{MOOD_LABEL[pet.mood] ?? 'Doing fine'}</span>
      </div>
      <div className="mt-4 space-y-3.5">
        <Meter label="Hunger" value={s.hunger} icon={Utensils} color="bg-peach" />
        <Meter label="Happiness" value={s.happiness} icon={Heart} color="bg-pink" />
        <Meter label="Energy" value={s.energy} icon={Zap} color="bg-lemon" />
        <Meter label="Hygiene" value={s.hygiene} icon={Sparkles} color="bg-sky" />
        <Meter label="Health" value={s.health} icon={Pill} color="bg-mint" />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-2 text-sm">
        <Stat icon={Egg} label="Age" value={pet.status === 'egg' ? '-' : age} />
        <Stat icon={Scale} label="Weight" value={`${pet.weight} g`} />
        <Stat icon={CircleAlert} label="Care mistakes" value={pet.care_mistakes} />
        <Stat icon={Trophy} label="Games won" value={pet.games_won} />
      </dl>
      {pet.next_stage && pet.status === 'alive' && (
        <p className="mt-4 rounded-xl bg-lilac-soft px-3 py-2 text-xs font-bold">
          Grows into a {pet.next_stage.stage} in about {duration(pet.next_stage.in_seconds)}
          {pet.next_stage.stage === 'adult' && (pet.care_mistakes <= 2 ? ' · on track for Star form!' : '')}
        </p>
      )}
      {speed !== 1 && <p className="mt-2 text-[11px] font-bold text-ink-muted">Test mode: time runs {speed}× faster.</p>}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border-2 border-ink/15 bg-cream px-3 py-2">
      <dt className="flex items-center gap-1.5 text-[11px] font-extrabold text-ink-muted uppercase">
        <Icon className="h-3.5 w-3.5" /> {label}
      </dt>
      <dd className="mt-0.5 font-display text-lg font-semibold">{value}</dd>
    </div>
  );
}

function BagCard({ items, inventory, onUse, disabled }) {
  const owned = items.filter((i) => inventory[i.key] > 0);
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="pixel text-xs text-ink-muted">Bag</p>
        <Link href="/shop?tab=treats" className="flex items-center gap-1 text-xs font-extrabold underline decoration-pink decoration-2 underline-offset-2">
          <ShoppingBag className="h-3.5 w-3.5" /> Shop
        </Link>
      </div>
      {owned.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">Your bag is empty. Treats from the shop give big boosts.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {owned.map((i) => (
            <li key={i.key} className="flex items-center gap-3 rounded-xl border-2 border-ink/15 bg-cream px-3 py-2">
              <span className="text-xl" aria-hidden>{ITEM_EMOJI[i.key] ?? '🎁'}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold">{i.name}</p>
                <p className="text-xs text-ink-muted">× {inventory[i.key]}</p>
              </div>
              <button type="button" disabled={disabled} onClick={() => onUse(i.key)} className="btn btn-sm btn-primary">
                Give
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DepartedCard({ pet, onNewEgg, busy }) {
  return (
    <div className="card mt-6 p-6 text-center">
      <p className="font-display text-2xl font-semibold">{pet.name} flew back to Egg Planet</p>
      <p className="mt-2 text-sm text-ink-soft">
        {REASON[pet.departed_reason] ?? 'It needed more care.'} It reached {pet.age_days} {pet.age_days === 1 ? 'day' : 'days'} old. Your skins and treats are safe.
      </p>
      <button type="button" onClick={onNewEgg} disabled={busy} className="btn btn-primary mt-5">
        <Egg className="h-5 w-5" /> Hatch a new egg
      </button>
    </div>
  );
}

function Memories({ memories }) {
  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl font-semibold">Memories</h2>
      <p className="text-sm text-ink-muted">Buddies you raised before.</p>
      <div className="no-scrollbar mt-5 flex gap-4 overflow-x-auto pb-2">
        {memories.map((m, i) => (
          <div key={i} className="card flex w-40 shrink-0 flex-col items-center p-4 text-center">
            <div className="flex h-20 items-end">
              <PetSprite skin={m.skin} stage={m.stage === 'baby' ? 'baby' : m.stage === 'child' ? 'child' : 'adult'} mood="departed" scale={3} />
            </div>
            <p className="mt-3 font-display font-semibold">{m.name}</p>
            <p className="text-xs text-ink-muted">{m.age_days} days · {m.form === 'star' ? 'Star' : STAGE_LABEL[m.stage]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function NameModal({ open, pet, onClose, onSaved, say }) {
  const [name, setName] = useState(pet.name);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(pet.has_name ? pet.name : '');
      setError(null);
    }
  }, [open, pet.name, pet.has_name]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await api('/play/name', { method: 'POST', body: { name } });
    setSaving(false);
    if (res.ok) {
      onSaved(res.data);
      say(res.data.message);
      onClose();
    } else {
      setError(res.data.errors?.name?.[0] ?? res.data.message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Name your buddy">
      <div className="flex justify-center">
        <div className="rounded-2xl border-[3px] border-ink bg-lcd px-6 py-4">
          <PetSprite skin={pet.skin} stage={pet.stage === 'egg' ? 'baby' : pet.stage} mood="happy" scale={5} />
        </div>
      </div>
      <h2 className="mt-5 text-center font-display text-3xl font-bold">{pet.has_name ? 'Rename your buddy' : 'What’s its name?'}</h2>
      <form onSubmit={save} className="mt-5 space-y-4">
        <input className="input text-center font-display text-xl" maxLength={16} value={name} onChange={(e) => setName(e.target.value)} placeholder={pet.name} autoFocus aria-invalid={error ? 'true' : undefined} />
        {error && <p className="text-center text-sm font-bold text-danger">{error}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Later</button>
          <button type="submit" disabled={saving || !name.trim()} className="btn btn-primary flex-1">Save name</button>
        </div>
      </form>
    </Modal>
  );
}
