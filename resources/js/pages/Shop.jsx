import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, Lock, Minus, Plus, ShoppingBag, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CoinIcon, Coins, Modal } from '../components/ui.jsx';
import Device from '../game/Device.jsx';
import LcdScreen from '../game/LcdScreen.jsx';
import { PetSprite } from '../game/PixelArt.jsx';
import { RARITY } from '../game/skins.js';
import { withLayout } from '../layouts/AppLayout.jsx';
import { coins as fmt } from '../lib/format.js';

const ITEM_EMOJI = { onigiri: '🍙', rainbow_candy: '🍭', strawberry_cake: '🍰', energy_milk: '🥛', bubble_bath: '🫧', vitamin_drop: '💊', golden_apple: '🍎' };
const EFFECT_LABEL = { hunger: 'Hunger', happiness: 'Happy', energy: 'Energy', health: 'Health', weight: 'Weight' };

export default function Shop({ skins, items, owned, inventory, equipped, pet, tab: initialTab }) {
  const { auth } = usePage().props;
  const balance = auth.user.coins;
  const [tab, setTab] = useState(initialTab);
  const [preview, setPreview] = useState({ pet: equipped.pet, shell: equipped.shell });
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  // Follow the server when something gets equipped (e.g. right after buying it).
  useEffect(() => {
    setPreview({ pet: equipped.pet, shell: equipped.shell });
  }, [equipped.pet, equipped.shell]);

  const isOwned = (type, key) => owned[type]?.includes(key);
  const post = (url, data, onDone) => {
    setBusy(true);
    router.post(url, data, {
      preserveScroll: true,
      preserveState: true,
      onFinish: () => {
        setBusy(false);
        onDone?.();
      },
    });
  };

  const buy = (skin) => post('/shop/skins', { type: skin.type, skin: skin.key, equip: true }, () => setConfirm(null));
  const equip = (skin) => post('/shop/skins/equip', { type: skin.type, skin: skin.key });

  const previewPet = {
    skin: preview.pet,
    stage: pet.status === 'alive' && pet.stage !== 'baby' ? pet.stage : 'adult',
    form: pet.form,
    mood: 'happy',
    status: 'alive',
    poop: 0,
    needs: [],
  };

  const tabs = [
    { key: 'pets', label: 'Buddies', count: skins.pets.length },
    { key: 'shells', label: 'Shells', count: skins.shells.length },
    { key: 'treats', label: 'Treats', count: items.length },
  ];

  return (
    <>
      <Head title="Shop" />
      <div className="relative">
        <div className="dot-grid absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:pt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="pixel text-xs text-pink-deep">Shop</p>
              <h1 className="font-display text-4xl font-bold sm:text-5xl">Skins & treats</h1>
              <p className="mt-2 text-ink-soft">Unlock new looks with coins. Everything you buy is yours to keep.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="chip h-11 px-4 text-base shadow-toy-sm">
                <Coins amount={balance} />
              </span>
              <Link href="/top-up" className="btn btn-primary btn-sm h-11">
                <Plus className="h-4 w-4" strokeWidth={3} /> Get coins
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[340px_1fr]">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="card p-6">
                <p className="pixel text-xs text-ink-muted">Preview</p>
                <div className="mx-auto mt-4 w-full max-w-[260px]">
                  <Device shell={preview.shell}>
                    <LcdScreen pet={previewPet} />
                  </Device>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2 text-center text-xs font-bold">
                  <div className="rounded-xl bg-cream px-2 py-2">
                    Buddy
                    <br />
                    <span className="font-display text-sm">{skins.pets.find((p) => p.key === preview.pet)?.name}</span>
                  </div>
                  <div className="rounded-xl bg-cream px-2 py-2">
                    Shell
                    <br />
                    <span className="font-display text-sm">{skins.shells.find((s) => s.key === preview.shell)?.name}</span>
                  </div>
                </div>
                {(preview.pet !== equipped.pet || preview.shell !== equipped.shell) && (
                  <button type="button" onClick={() => setPreview({ pet: equipped.pet, shell: equipped.shell })} className="mt-3 w-full text-center text-xs font-extrabold underline decoration-pink decoration-2 underline-offset-2">
                    Reset to what I’m wearing
                  </button>
                )}
              </div>
            </aside>

            <div>
              <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.key}
                    onClick={() => setTab(t.key)}
                    className={`chip px-4 py-2 text-[15px] transition ${tab === t.key ? 'bg-ink text-cream shadow-none' : 'shadow-toy-sm hover:-translate-y-0.5'}`}
                  >
                    {t.label} <span className={`rounded-full px-1.5 text-xs ${tab === t.key ? 'bg-cream/20' : 'bg-cream'}`}>{t.count}</span>
                  </button>
                ))}
              </div>

              {tab === 'pets' && (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {skins.pets.map((s) => (
                    <SkinCard
                      key={s.key}
                      skin={s}
                      owned={isOwned('pet', s.key)}
                      equipped={equipped.pet === s.key}
                      previewing={preview.pet === s.key}
                      balance={balance}
                      busy={busy}
                      onPreview={() => setPreview((p) => ({ ...p, pet: s.key }))}
                      onBuy={() => setConfirm(s)}
                      onEquip={() => equip(s)}
                      art={<PetSprite skin={s.key} stage="adult" mood={preview.pet === s.key ? 'happy' : 'ok'} scale={5} />}
                    />
                  ))}
                </div>
              )}

              {tab === 'shells' && (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {skins.shells.map((s) => (
                    <SkinCard
                      key={s.key}
                      skin={s}
                      owned={isOwned('shell', s.key)}
                      equipped={equipped.shell === s.key}
                      previewing={preview.shell === s.key}
                      balance={balance}
                      busy={busy}
                      onPreview={() => setPreview((p) => ({ ...p, shell: s.key }))}
                      onBuy={() => setConfirm(s)}
                      onEquip={() => equip(s)}
                      art={
                        <div className="w-24">
                          <Device shell={s.key}>
                            <LcdScreen pet={{ ...previewPet, stage: 'baby' }} />
                          </Device>
                        </div>
                      }
                    />
                  ))}
                </div>
              )}

              {tab === 'treats' && (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((i) => (
                    <TreatCard key={i.key} item={i} have={inventory[i.key] ?? 0} balance={balance} busy={busy} onBuy={(qty) => post('/shop/items', { item: i.key, quantity: qty })} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Confirm purchase">
        {confirm && (
          <div className="text-center">
            <div className="mx-auto flex h-36 w-full items-center justify-center rounded-2xl border-[3px] border-ink bg-lcd">
              {confirm.type === 'pet' ? (
                <PetSprite skin={confirm.key} stage="adult" mood="happy" scale={6} />
              ) : (
                <div className="w-24">
                  <Device shell={confirm.key}>
                    <LcdScreen pet={{ ...previewPet, stage: 'baby' }} />
                  </Device>
                </div>
              )}
            </div>
            <h2 className="mt-5 font-display text-3xl font-bold">Unlock {confirm.name}?</h2>
            <p className="mt-2 text-ink-soft">
              This costs <strong className="text-ink">{fmt(confirm.price)} coins</strong>. You’ll have {fmt(balance - confirm.price)} left.
            </p>
            <div className="mt-6 flex gap-3">
              <button type="button" className="btn btn-secondary flex-1" onClick={() => setConfirm(null)}>Not now</button>
              <button type="button" className="btn btn-primary flex-1" disabled={busy} onClick={() => buy(confirm)}>
                <CoinIcon className="h-5 w-5" /> Unlock
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

Shop.layout = withLayout;

function SkinCard({ skin, owned, equipped, previewing, balance, busy, onPreview, onBuy, onEquip, art }) {
  const affordable = balance >= skin.price;
  const rarity = RARITY[skin.rarity] ?? RARITY.common;
  return (
    <div className={`card flex flex-col p-4 transition ${previewing ? 'ring-4 ring-pink/60' : ''}`}>
      <button type="button" onClick={onPreview} className="relative flex h-40 items-center justify-center rounded-2xl border-[3px] border-ink bg-lcd transition hover:brightness-105" aria-label={`Preview ${skin.name}`}>
        {art}
        <span className={`absolute top-2.5 left-2.5 rounded-full border-2 border-ink px-2 py-0.5 text-[11px] font-extrabold ${rarity.bg}`}>{rarity.label}</span>
        {equipped && (
          <span className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full border-2 border-ink bg-mint px-2 py-0.5 text-[11px] font-extrabold">
            <Check className="h-3 w-3" strokeWidth={4} /> On
          </span>
        )}
      </button>
      <div className="mt-4 flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-xl leading-tight font-semibold">{skin.name}</p>
          {skin.blurb && <p className="mt-1 text-xs text-ink-soft">{skin.blurb}</p>}
        </div>
      </div>
      <div className="mt-auto pt-4">
        {equipped ? (
          <button type="button" disabled className="btn btn-sm w-full bg-mint">
            <Check className="h-4 w-4" strokeWidth={3} /> Equipped
          </button>
        ) : owned ? (
          <button type="button" disabled={busy} onClick={onEquip} className="btn btn-sm btn-secondary w-full">
            <Sparkles className="h-4 w-4" /> Equip
          </button>
        ) : (
          <button type="button" disabled={busy || !affordable} onClick={onBuy} className="btn btn-sm btn-primary w-full" title={affordable ? undefined : 'Not enough coins'}>
            {affordable ? <CoinIcon className="h-4.5 w-4.5" /> : <Lock className="h-4 w-4" />} {fmt(skin.price)}
          </button>
        )}
        {!owned && !affordable && (
          <Link href="/top-up" className="mt-2 block text-center text-xs font-extrabold underline decoration-pink decoration-2 underline-offset-2">
            Need {fmt(skin.price - balance)} more coins
          </Link>
        )}
      </div>
    </div>
  );
}

function TreatCard({ item, have, balance, busy, onBuy }) {
  const [qty, setQty] = useState(1);
  const total = item.price * qty;
  const affordable = balance >= total;
  return (
    <div className="card flex flex-col p-4">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-[3px] border-ink bg-lemon-soft text-3xl" aria-hidden>
          {ITEM_EMOJI[item.key] ?? '🎁'}
        </div>
        <div className="min-w-0">
          <p className="font-display text-xl leading-tight font-semibold">{item.name}</p>
          <p className="mt-1 text-xs text-ink-soft">{item.description}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {Object.entries(item.effects).map(([k, v]) =>
          k === 'clean' ? (
            <span key={k} className="rounded-full bg-sky-soft px-2 py-0.5 text-[11px] font-extrabold">Cleans</span>
          ) : k === 'cure' ? (
            <span key={k} className="rounded-full bg-mint-soft px-2 py-0.5 text-[11px] font-extrabold">Cures</span>
          ) : (
            <span key={k} className="rounded-full bg-cream px-2 py-0.5 text-[11px] font-extrabold">
              {EFFECT_LABEL[k] ?? k} {v > 0 ? '+' : ''}
              {v}
            </span>
          ),
        )}
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <div className="flex items-center rounded-full border-[3px] border-ink bg-white">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-1.5" aria-label="Fewer">
            <Minus className="h-4 w-4" strokeWidth={3} />
          </button>
          <span className="w-6 text-center font-extrabold tabular-nums">{qty}</span>
          <button type="button" onClick={() => setQty((q) => Math.min(10, q + 1))} className="p-1.5" aria-label="More">
            <Plus className="h-4 w-4" strokeWidth={3} />
          </button>
        </div>
        <button type="button" disabled={busy || !affordable} onClick={() => onBuy(qty)} className="btn btn-sm btn-primary">
          <CoinIcon className="h-4.5 w-4.5" /> {fmt(total)}
        </button>
      </div>
      <p className="mt-2 flex items-center gap-1 text-xs font-bold text-ink-muted">
        <ShoppingBag className="h-3.5 w-3.5" /> In your bag: {have}
      </p>
    </div>
  );
}
