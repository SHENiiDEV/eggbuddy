import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, Clock3, Headphones, Heart, Moon, Pill, ShieldCheck, Sparkles, Undo2, Utensils, Zap, Droplets, Gamepad2, Plus, Minus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Device from '../game/Device.jsx';
import LcdScreen from '../game/LcdScreen.jsx';
import { PetSprite, PixelIcon } from '../game/PixelArt.jsx';
import { RARITY, SHELLS } from '../game/skins.js';
import { withLayout } from '../layouts/AppLayout.jsx';
import { CoinIcon, Coins, PaymentBadges, SectionTitle } from '../components/ui.jsx';
import { coins as fmtCoins } from '../lib/format.js';

export default function Home({ skins, items, packages, custom, game }) {
  const { auth, company } = usePage().props;
  const user = auth?.user;
  const start = user ? '/play' : '/register';

  return (
    <>
      <Head title="Your retro pocket pet" />
      <Hero skins={skins} start={start} user={user} starterCoins={game.starter_coins} />
      <Marquee />
      <HowItWorks game={game} />
      <LifeCycle />
      <CareSection game={game} />
      <Buddies skins={skins} start={start} />
      <Pricing packages={packages} custom={custom} items={items} skins={skins} start={user ? '/top-up' : '/register'} />
      <Trust company={company} />
      <Faq company={company} game={game} />
      <FinalCta start={start} user={user} starterCoins={game.starter_coins} />
    </>
  );
}

Home.layout = withLayout;

/* ------------------------------------------------------------------ */

function Hero({ skins, start, user, starterCoins }) {
  const pets = skins.pets.map((p) => p.key);
  const shells = Object.keys(SHELLS);
  const [petIdx, setPetIdx] = useState(0);
  const [shell, setShell] = useState('strawberry');
  const [effect, setEffect] = useState(null);
  const [poop, setPoop] = useState(2);
  const [touched, setTouched] = useState(false);
  const [bubble, setBubble] = useState('Psst... press my buttons!');

  useEffect(() => {
    if (touched) return;
    const id = setInterval(() => {
      setPetIdx((i) => (i + 1) % pets.length);
      setShell(shells[Math.floor(Math.random() * shells.length)]);
    }, 4200);
    return () => clearInterval(id);
  }, [touched, pets.length]);

  useEffect(() => {
    if (poop > 0) return;
    const id = setTimeout(() => setPoop(1), 12000);
    return () => clearTimeout(id);
  }, [poop]);

  const press = (i) => {
    setTouched(true);
    const type = ['meal', 'pat', 'clean'][i];
    setEffect({ type, id: Date.now() });
    if (type === 'clean') setPoop(0);
    setBubble(['Nom nom nom!', 'Hehe, that tickles!', poop ? 'Sparkling clean!' : 'Already squeaky clean!'][i]);
  };

  const pet = {
    skin: pets[petIdx],
    stage: 'adult',
    form: petIdx % 3 === 2 ? 'star' : 'normal',
    mood: 'happy',
    poop,
    is_sick: false,
    is_asleep: false,
    needs: poop > 1 ? ['dirty'] : [],
    status: 'alive',
  };

  return (
    <section className="relative overflow-hidden">
      <div className="dot-grid absolute inset-0 opacity-60" />
      <Floaters />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pt-12 pb-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20 lg:pb-28">
        <div>
          <span className="chip animate-pop bg-lemon shadow-toy-sm">
            <Sparkles className="h-4 w-4" /> Your 90s pocket pet is back
          </span>
          <h1 className="mt-6 font-display text-[3.2rem] leading-[0.95] font-bold text-ink sm:text-7xl lg:text-[5.4rem]">
            Hatch it.
            <br />
            Love it.
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">Watch it grow.</span>
              <span className="absolute inset-x-0 bottom-1 -z-0 h-5 -rotate-1 rounded-full bg-pink/70 sm:h-7" />
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
            EggBuddy is a tiny virtual pet that lives in a candy-coloured handheld. Feed it, play with it, clean up after it and tuck it in at night.
            Care well and it grows into something truly special.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href={start} className="btn btn-primary btn-lg">
              {user ? 'Visit my buddy' : 'Hatch your free egg'} <ArrowRight className="h-5 w-5" strokeWidth={3} />
            </Link>
            <a href="#how" className="btn btn-secondary btn-lg">
              How it works
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-ink-soft">
            <li className="flex items-center gap-1.5"><BadgeCheck className="h-4.5 w-4.5 text-success" /> Free to play</li>
            <li className="flex items-center gap-1.5"><CoinIcon className="h-4.5 w-4.5" /> {starterCoins} coins welcome gift</li>
            <li className="flex items-center gap-1.5"><ShieldCheck className="h-4.5 w-4.5 text-success" /> Adults 18+</li>
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[400px]">
          <div className="absolute -top-2 left-0 z-10 max-w-[200px] sm:-left-12 animate-float rounded-2xl border-[3px] border-ink bg-white px-4 py-2.5 text-sm font-extrabold shadow-toy-sm" style={{ '--r': '-4deg' }}>
            {bubble}
            <span className="absolute -bottom-[11px] left-8 h-4 w-4 rotate-45 border-r-[3px] border-b-[3px] border-ink bg-white" />
          </div>
          <div className="absolute inset-x-8 top-16 bottom-10 -z-0 rounded-full bg-lilac/60 blur-3xl" />
          <Device shell={shell} onButton={press} buttonLabels={['Feed', 'Pat', 'Clean']}>
            <LcdScreen pet={pet} effect={effect} />
          </Device>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Choose a shell colour">
            {shells.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setTouched(true);
                  setShell(k);
                }}
                className={`h-8 w-8 rounded-full border-[3px] border-ink transition hover:-translate-y-0.5 ${shell === k ? 'ring-4 ring-ink/20 scale-110' : ''}`}
                style={{ background: `linear-gradient(135deg, ${SHELLS[k].from}, ${SHELLS[k].to})` }}
                aria-label={`${k} shell`}
                title={k}
              />
            ))}
          </div>
          <p className="mt-3 text-center text-xs font-bold text-ink-muted">Try it: the buttons feed, pat and clean. Tap a colour to change the shell.</p>
        </div>
      </div>
    </section>
  );
}

function Floaters() {
  const items = [
    { icon: 'star', cls: 'left-[44%] top-[9%]', r: '10deg', d: '1.2s' },
    { icon: 'heart', cls: 'left-[49%] top-[44%] hidden lg:block', r: '-8deg', d: '0s' },
    { icon: 'meal', cls: 'left-[45%] bottom-[13%] hidden lg:block', r: '6deg', d: '2s' },
    { icon: 'snack', cls: 'right-[3%] top-[12%]', r: '-12deg', d: '.6s' },
    { icon: 'heart', cls: 'right-[3%] top-[58%]', r: '12deg', d: '1.8s' },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
      {items.map((it, i) => (
        <div key={i} className={`absolute ${it.cls} animate-float`} style={{ '--r': it.r, animationDelay: it.d }}>
          <PixelIcon name={it.icon} scale={6} />
        </div>
      ))}
    </div>
  );
}

function Marquee() {
  const words = ['Feed', 'Play', 'Clean', 'Sleep', 'Heal', 'Evolve', 'Dress up', 'Repeat'];
  const row = [...words, ...words, ...words];
  return (
    <div className="overflow-hidden border-y-[3px] border-ink bg-ink py-4 text-cream" aria-hidden>
      <div className="flex w-max animate-marquee gap-8">
        {[...row, ...row].map((w, i) => (
          <span key={i} className="pixel flex items-center gap-8 text-lg">
            {w} <span className="text-pink">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function HowItWorks({ game }) {
  const steps = [
    { n: '01', title: 'Hatch your egg', text: `Sign up and an egg appears on your screen. In about ${Math.round(game.hatch_seconds / 60) || 1} minute something small and squeaky wiggles out.`, art: <PetSprite stage="egg" skin="mochi" scale={5} />, bg: 'bg-pink-soft' },
    { n: '02', title: 'Care like it’s 1997', text: 'Serve meals and snacks, clean up the little messes, give medicine when it sniffles and switch the lights off at bedtime.', art: <PetSprite stage="baby" skin="pipi" mood="happy" scale={5} />, bg: 'bg-lemon-soft' },
    { n: '03', title: 'Watch it evolve', text: 'Baby, child, teen, adult. Every care mistake counts: raise it with love and it becomes a rare Star adult.', art: <PetSprite stage="child" skin="bunbun" scale={5} />, bg: 'bg-lilac-soft' },
    { n: '04', title: 'Play & collect', text: 'Win coins in the classic Left-or-Right game and spend them on new buddies, shell colours and tasty treats.', art: <PetSprite stage="adult" skin="drako" mood="happy" scale={4} />, bg: 'bg-mint-soft' },
  ];
  return (
    <section id="how" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle eyebrow="How it works" title="Four tiny steps to a very big friendship">
          No downloads, no app store. Your buddy lives right here in your browser, on your phone or laptop.
        </SectionTitle>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.n} className="card group relative flex flex-col p-6 transition hover:-translate-y-1" style={{ rotate: `${[-1, 1, -0.5, 0.8][i]}deg` }}>
              <div className={`flex h-36 items-center justify-center rounded-2xl border-[3px] border-ink ${s.bg}`}>
                <div className="transition group-hover:scale-110">{s.art}</div>
              </div>
              <p className="pixel mt-5 text-xs text-pink-deep">Step {s.n}</p>
              <h3 className="mt-1 font-display text-2xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-6 text-ink-soft">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LifeCycle() {
  const stages = [
    { stage: 'egg', label: 'Egg', time: 'Day 0' },
    { stage: 'baby', label: 'Baby', time: 'First hour' },
    { stage: 'child', label: 'Child', time: 'Day 1' },
    { stage: 'adult', label: 'Teen & Adult', time: 'Day 1–3' },
    { stage: 'adult', label: 'Star adult', time: 'If you’re good', star: true },
  ];
  return (
    <section className="relative border-y-[3px] border-ink bg-lilac-soft py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionTitle eyebrow="Life cycle" title="From wobbly egg to superstar" center={false}>
            Your buddy grows in real time. Fewer care mistakes mean a happier, shinier grown-up.
          </SectionTitle>
          <span className="chip bg-white shadow-toy-sm"><Clock3 className="h-4 w-4" /> Runs in real time, even while you’re away</span>
        </div>
        <div className="no-scrollbar mt-12 -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
          {stages.map((s, i) => (
            <div key={i} className="relative min-w-[170px] snap-start">
              <div className="card flex h-48 flex-col items-center justify-end overflow-hidden bg-lcd p-4">
                {s.star && <PixelIcon name="crown" scale={5} className="mb-1" />}
                <PetSprite stage={s.stage} skin="neko" mood={s.star ? 'happy' : 'ok'} scale={s.stage === 'egg' || s.stage === 'baby' ? 6 : s.stage === 'child' ? 6 : 5} />
              </div>
              <p className="mt-4 font-display text-xl font-semibold">{s.label}</p>
              <p className="pixel text-xs text-ink-muted">{s.time}</p>
              {i < stages.length - 1 && <ArrowRight className="absolute top-20 -right-5 z-10 hidden h-6 w-6 sm:block" strokeWidth={3} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CareSection({ game }) {
  const needs = [
    { icon: Utensils, name: 'Hunger', text: 'Meals fill the tummy, snacks make it smile (and a little chubby).', color: 'bg-peach', value: 72 },
    { icon: Heart, name: 'Happiness', text: 'Pats, treats and games keep spirits high.', color: 'bg-pink', value: 88 },
    { icon: Zap, name: 'Energy', text: 'Turn the lights off for a nap. Tired buddies get grumpy.', color: 'bg-lemon', value: 54 },
    { icon: Droplets, name: 'Hygiene', text: 'Yes, it poops. Clean up fast or it may catch a cold.', color: 'bg-sky', value: 40 },
    { icon: Pill, name: 'Health', text: 'Medicine cures colds. Neglect is what really hurts.', color: 'bg-mint', value: 95 },
  ];
  return (
    <section className="py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionTitle eyebrow="Five little needs" title="Simple to learn, impossible not to love" center={false}>
            Every need slowly drops over time. Keep an eye on the attention icon and your buddy will thank you with hearts.
          </SectionTitle>
          <div className="mt-10 space-y-4">
            {needs.map((n) => (
              <div key={n.name} className="flex items-center gap-4 rounded-2xl border-[3px] border-ink bg-white p-4 shadow-toy-sm">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-[3px] border-ink ${n.color}`}>
                  <n.icon className="h-6 w-6" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-lg font-semibold">{n.name}</p>
                    <div className="flex gap-0.5" aria-hidden>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <span key={i} className={`h-3 w-2.5 rounded-[2px] border border-ink ${i < Math.round(n.value / 10) ? n.color : 'bg-cream'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-ink-soft">{n.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="card col-span-full overflow-hidden bg-ink p-7 text-cream">
            <div className="flex items-center gap-3">
              <Moon className="h-6 w-6 text-lemon" />
              <p className="font-display text-2xl font-semibold">Lights out, sleepyhead</p>
            </div>
            <p className="mt-3 text-cream/80">
              When your buddy gets tired, switch off the lights and it sleeps soundly, burning less energy while you’re at work or asleep yourself.
            </p>
            <div className="mt-6 flex justify-center rounded-2xl bg-[#1d2233] py-6">
              <PetSprite skin="boo" stage="adult" mood="sleeping" scale={5} />
            </div>
          </div>
          <div className="card bg-lemon-soft p-6">
            <Gamepad2 className="h-7 w-7" />
            <p className="mt-3 font-display text-xl font-semibold">Left or Right?</p>
            <p className="mt-2 text-sm text-ink-soft">Guess where your buddy will look. Win 3 of 5 rounds for coins and a big happiness boost (up to {game.daily_coin_cap} coins a day).</p>
          </div>
          <div className="card bg-mint-soft p-6">
            <Sparkles className="h-7 w-7" />
            <p className="mt-3 font-display text-xl font-semibold">Star form</p>
            <p className="mt-2 text-sm text-ink-soft">Reach adulthood with 2 care mistakes or fewer and your buddy earns a golden crown, forever.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Buddies({ skins, start }) {
  const [selected, setSelected] = useState(skins.pets[0]?.key);
  return (
    <section id="buddies" className="scroll-mt-24 border-y-[3px] border-ink bg-pink-soft py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle eyebrow="Skins" title="Pick your buddy. Then dress up its home.">
          Every skin really changes your pet and handheld in the game. Unlock them with coins you win or buy.
        </SectionTitle>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {skins.pets.map((p) => (
            <button
              type="button"
              key={p.key}
              onMouseEnter={() => setSelected(p.key)}
              onFocus={() => setSelected(p.key)}
              className="card group flex flex-col p-4 text-left transition hover:-translate-y-1"
            >
              <div className="relative flex h-40 items-center justify-center rounded-2xl border-[3px] border-ink bg-lcd">
                <PetSprite skin={p.key} stage="adult" mood={selected === p.key ? 'happy' : 'ok'} scale={6} />
                <span className={`absolute top-2.5 left-2.5 rounded-full border-2 border-ink px-2 py-0.5 text-[11px] font-extrabold ${RARITY[p.rarity]?.bg}`}>{RARITY[p.rarity]?.label}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="font-display text-2xl font-semibold">{p.name}</p>
                {p.price === 0 ? <span className="chip bg-mint py-0.5 text-xs">Free</span> : <Coins amount={p.price} className="text-sm" iconClass="h-4 w-4" />}
              </div>
              <p className="mt-1 text-sm text-ink-soft">{p.blurb}</p>
            </button>
          ))}
          <Link href={start} className="card flex flex-col items-center justify-center gap-3 bg-ink p-6 text-center text-cream transition hover:-translate-y-1">
            <PetSprite stage="egg" skin="drako" scale={6} />
            <p className="font-display text-2xl font-semibold">Who’s in your egg?</p>
            <span className="btn btn-primary btn-sm">Find out <ArrowRight className="h-4 w-4" /></span>
          </Link>
        </div>

        <div className="mt-20">
          <h3 className="text-center font-display text-3xl font-semibold">Nine handheld shells</h3>
          <p className="mt-2 text-center text-ink-soft">From Strawberry Milk to a twinkling Starry Night.</p>
          <div className="no-scrollbar -mx-4 mt-10 flex gap-6 overflow-x-auto px-4 pb-6 lg:mx-0 lg:grid lg:grid-cols-9 lg:gap-4 lg:overflow-visible lg:px-0">
            {skins.shells.map((s) => (
              <div key={s.key} className="w-32 shrink-0 text-center lg:w-auto">
                <div className="mx-auto w-28 transition hover:-translate-y-1 hover:-rotate-3 lg:w-full">
                  <Device shell={s.key}>
                    <LcdScreen pet={{ skin: selected, stage: 'baby', mood: 'ok', poop: 0, status: 'alive', needs: [] }} />
                  </Device>
                </div>
                <p className="mt-3 text-sm leading-tight font-extrabold">{s.name}</p>
                <p className="text-xs font-bold text-ink-muted">{s.price === 0 ? 'Free' : `${fmtCoins(s.price)} coins`}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing({ packages, custom, items, skins, start }) {
  const examples = useMemo(() => {
    const golden = items.find((i) => i.key === 'golden_apple');
    const drako = skins.pets.find((p) => p.key === 'drako');
    const galaxy = skins.shells.find((s) => s.key === 'galaxy');
    return [golden, drako, galaxy].filter(Boolean);
  }, [items, skins]);

  return (
    <section id="pricing" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle eyebrow="Coins" title="Free to play. Coins if you fancy.">
          Coins unlock skins and treats faster. Everything is optional: you can earn coins every day by playing.
        </SectionTitle>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((p, i) => (
            <div key={p.key} className={`card relative flex flex-col p-6 ${p.featured ? 'bg-lemon-soft lg:-translate-y-3' : ''}`}>
              {p.featured && <span className="chip absolute -top-4 left-1/2 -translate-x-1/2 bg-pink text-xs shadow-toy-sm">Most popular</span>}
              <div className="flex h-20 items-end gap-1">
                {Array.from({ length: i + 1 }).map((_, k) => (
                  <CoinIcon key={k} className="h-10 w-10" />
                ))}
              </div>
              <p className="mt-5 font-display text-2xl font-semibold">{p.name}</p>
              <p className="mt-1 text-3xl font-extrabold tabular-nums">{fmtCoins(p.coins)} <span className="text-base font-bold text-ink-muted">coins</span></p>
              <p className={`mt-1 text-sm font-extrabold ${p.bonus ? 'text-pink-deep' : 'text-transparent'}`}>{p.bonus ? `+ ${fmtCoins(p.bonus)} bonus coins` : '-'}</p>
              <div className="mt-6 flex items-end justify-between border-t-2 border-dashed border-ink/20 pt-4">
                <p className="font-display text-3xl font-bold">{p.price_formatted}</p>
                <Link href={`${start}${start === '/top-up' ? `?package=${p.key}` : ''}`} className="btn btn-sm btn-primary">
                  Get coins
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-[1.75rem] border-[3px] border-dashed border-ink p-6">
            <p className="font-display text-xl font-semibold">What do coins buy?</p>
            <ul className="mt-4 space-y-3">
              {examples.map((e) => (
                <li key={e.key} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-bold">{e.name}</span>
                  <Coins amount={e.price} iconClass="h-4 w-4" />
                </li>
              ))}
            </ul>
          </div>
          <ul className="grid gap-3 text-sm font-bold text-ink-soft sm:grid-cols-2">
            {[
              'Prices in EUR, all taxes included',
              'One-time payments, never a subscription',
              `Custom amount from ${custom.min_formatted} to ${custom.max_formatted}`,
              'Coins delivered instantly, PDF invoice by email',
              'Secure card payments with 3-D Secure',
              '14-day goodwill refund on unused coins',
            ].map((t) => (
              <li key={t} className="flex items-start gap-2 rounded-2xl bg-white/70 p-3">
                <BadgeCheck className="h-5 w-5 shrink-0 text-success" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-6 text-center text-xs font-semibold text-ink-muted">
          Coins are virtual, have no cash value and cannot be exchanged for money. See our{' '}
          <Link href="/legal/terms" className="underline">Terms</Link> and <Link href="/legal/refunds" className="underline">Refund Policy</Link>.
        </p>
      </div>
    </section>
  );
}

function Trust({ company }) {
  const items = [
    { icon: ShieldCheck, title: 'Secure payments', text: 'Card payments are processed by a PCI DSS certified provider with 3-D Secure. We never see your card number.', bg: 'bg-mint' },
    { icon: Zap, title: 'Instant delivery', text: 'Coins land in your wallet seconds after payment, with a PDF invoice in your inbox.', bg: 'bg-lemon' },
    { icon: Undo2, title: 'Fair refunds', text: 'Changed your mind? Unused coins can be refunded within 14 days of purchase.', bg: 'bg-sky' },
    { icon: Headphones, title: 'Real humans', text: `Questions? Write to ${company.email}. We usually reply within one business day.`, bg: 'bg-pink' },
  ];
  return (
    <section className="border-y-[3px] border-ink bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div key={it.title}>
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-ink shadow-toy-sm ${it.bg}`}>
                <it.icon className="h-7 w-7" strokeWidth={2.4} />
              </div>
              <p className="mt-4 font-display text-xl font-semibold">{it.title}</p>
              <p className="mt-1.5 text-sm leading-6 text-ink-soft">{it.text}</p>
            </div>
          ))}
        </div>
        <PaymentBadges className="mt-12 justify-center" />
      </div>
    </section>
  );
}

function Faq({ company, game }) {
  const qa = [
    ['Is EggBuddy free?', `Yes. Creating an account and caring for your buddy is free, and you get ${game.starter_coins} coins as a welcome gift. Coin packages are optional and only speed up unlocking skins and treats.`],
    ['What happens if I forget about my buddy?', 'Needs drop slowly in real time and your buddy naps when it gets tired. If it is neglected for a long time it may get sick, and eventually it will fly back to Egg Planet. You can always hatch a new egg, and every skin you own stays with you.'],
    ['Do I have to play every day?', 'Not at all. Checking in a few times a day is plenty. Turning the lights off at night slows everything down so your buddy sleeps peacefully.'],
    ['What are coins and can I cash them out?', 'Coins are a virtual in-game currency for skins and treats. They have no cash value and cannot be exchanged for money or prizes. EggBuddy is a game, not gambling.'],
    ['How do payments work?', 'You pick a package or a custom amount and pay once by card on a secure payment page. There are no subscriptions and we never charge you automatically. You get a PDF invoice by email right away.'],
    ['Can I get a refund?', 'Yes: if you were charged by mistake, did not receive your coins, or you ask within 14 days and haven’t used the coins from that purchase. See the Refund & Cancellation Policy for details.'],
    ['Why do you ask for my address and date of birth?', 'Card payment providers require the cardholder’s full details to prevent fraud and to run 3-D Secure checks, and EggBuddy is for adults 18+. We never sell your data. See our Privacy Policy.'],
    ['How do I contact support?', `Email ${company.email}${company.phone ? ` or call ${company.phone}` : ''}. ${company.support_hours}.`],
  ];
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionTitle eyebrow="FAQ" title="Good questions" />
        <div className="mt-12 space-y-3">
          {qa.map(([q, a], i) => (
            <div key={q} className={`rounded-2xl border-[3px] border-ink bg-white transition ${open === i ? 'shadow-toy' : ''}`}>
              <button type="button" onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" aria-expanded={open === i}>
                <span className="font-display text-lg font-semibold">{q}</span>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[3px] border-ink ${open === i ? 'bg-pink' : 'bg-cream'}`}>
                  {open === i ? <Minus className="h-4 w-4" strokeWidth={3} /> : <Plus className="h-4 w-4" strokeWidth={3} />}
                </span>
              </button>
              {open === i && <p className="px-5 pb-5 leading-7 text-ink-soft">{a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta({ start, user, starterCoins }) {
  return (
    <section className="px-4 sm:px-6">
      <div className="card relative mx-auto max-w-6xl overflow-hidden bg-pink p-8 sm:p-14">
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="relative grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 className="font-display text-4xl leading-tight font-bold sm:text-6xl">Your egg is getting cold.</h2>
            <p className="mt-4 max-w-lg text-lg font-semibold text-ink/80">
              Create your account in a minute, get {starterCoins} free coins and meet your buddy. It’s been waiting since 1997.
            </p>
            <Link href={start} className="btn btn-lemon btn-lg mt-8">
              {user ? 'Back to my buddy' : 'Hatch my egg'} <ArrowRight className="h-5 w-5" strokeWidth={3} />
            </Link>
          </div>
          <div className="mx-auto w-full max-w-[260px] rotate-6">
            <Device shell="lemon">
              <LcdScreen pet={{ skin: 'mochi', stage: 'egg', status: 'egg', hatches_in: 12, poop: 0, needs: [] }} />
            </Device>
          </div>
        </div>
      </div>
    </section>
  );
}
