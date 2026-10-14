import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, Check, FlaskConical, Lock, Pencil, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';
import { Checkbox, CoinIcon, Coins, PaymentBadges } from '../../components/ui.jsx';
import { withLayout } from '../../layouts/AppLayout.jsx';
import { coins as fmt, money } from '../../lib/format.js';

export default function TopUp({ packages, custom, billing, billingComplete, gatewayAvailable, testMode, selected }) {
  const { auth, company, app } = usePage().props;
  const currency = app.currency;
  const initial = packages.find((p) => p.key === selected)?.key ?? packages.find((p) => p.featured)?.key ?? packages[0]?.key;

  const form = useForm({ package: initial, amount: '', accept_terms: false, immediate_supply: false });
  const { data, setData, errors, processing } = form;

  const customMinor = Math.round((parseFloat(String(data.amount).replace(',', '.')) || 0) * 100);
  const quote = useMemo(() => {
    if (data.package === 'custom') {
      return { name: 'Custom amount', coins: Math.floor((customMinor / 100) * custom.coins_per_unit), bonus: 0, price: customMinor };
    }
    const p = packages.find((x) => x.key === data.package);
    return p ? { name: p.name, coins: p.coins, bonus: p.bonus, price: p.price } : null;
  }, [data.package, customMinor, packages, custom]);

  const customInvalid = data.package === 'custom' && (customMinor < custom.min || customMinor > custom.max);
  const canPay = gatewayAvailable && billingComplete && quote && !customInvalid && data.accept_terms && data.immediate_supply;

  const submit = (e) => {
    e.preventDefault();
    form.transform((d) => ({ ...d, amount: d.package === 'custom' ? customMinor : null }));
    form.post('/top-up', { preserveScroll: true });
  };

  return (
    <>
      <Head title="Top up coins" />
      <div className="relative">
        <div className="dot-grid absolute inset-0 opacity-50" />
        <form onSubmit={submit} className="relative mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:pt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="pixel text-xs text-pink-deep">Top up</p>
              <h1 className="font-display text-4xl font-bold sm:text-5xl">Get more coins</h1>
              <p className="mt-2 text-ink-soft">One-time payment. Coins arrive instantly, invoice by email.</p>
            </div>
            <span className="chip h-11 px-4 text-base shadow-toy-sm">
              Balance: <Coins amount={auth.user.coins} />
            </span>
          </div>

          {testMode && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border-[3px] border-dashed border-ink bg-lemon-soft px-4 py-3 text-sm font-bold">
              <FlaskConical className="mt-0.5 h-5 w-5 shrink-0" />
              Test mode is on: payments go to a built-in test page and no real money is charged. Connect your payment provider before going live.
            </div>
          )}
          {!gatewayAvailable && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border-[3px] border-ink bg-peach-soft px-4 py-3 text-sm font-bold">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /> Top-ups are temporarily unavailable. Please try again later.
            </div>
          )}

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
            <div>
              <fieldset>
                <legend className="font-display text-2xl font-semibold">1. Choose a package</legend>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {packages.map((p, i) => {
                    const active = data.package === p.key;
                    return (
                      <label key={p.key} className={`card relative flex cursor-pointer items-center gap-4 p-5 transition hover:-translate-y-0.5 ${active ? 'bg-lemon-soft ring-4 ring-pink/50' : ''}`}>
                        <input type="radio" name="package" value={p.key} checked={active} onChange={() => setData('package', p.key)} className="sr-only" />
                        {p.featured && <span className="chip absolute -top-3.5 right-4 bg-pink py-0.5 text-[11px] shadow-toy-sm">Most popular</span>}
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-[3px] border-ink bg-white">
                          <div className="relative">
                            <CoinIcon className="h-8 w-8" />
                            {i > 0 && <CoinIcon className="absolute -top-2 -right-3 h-5 w-5" />}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-lg leading-tight font-semibold">{p.name}</p>
                          <p className="text-xl font-extrabold tabular-nums">{fmt(p.coins)} <span className="text-sm font-bold text-ink-muted">coins</span></p>
                          {p.bonus > 0 && <p className="text-xs font-extrabold text-pink-deep">+ {fmt(p.bonus)} bonus</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-display text-2xl font-bold">{p.price_formatted}</p>
                          <span className={`ml-auto mt-1 flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-ink ${active ? 'bg-pink' : 'bg-white'}`}>
                            {active && <Check className="h-3.5 w-3.5" strokeWidth={4} />}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {custom.enabled && (
                  <label className={`card mt-4 flex cursor-pointer flex-col gap-4 p-5 sm:flex-row sm:items-center ${data.package === 'custom' ? 'bg-lemon-soft ring-4 ring-pink/50' : ''}`}>
                    <input type="radio" name="package" value="custom" checked={data.package === 'custom'} onChange={() => setData('package', 'custom')} className="sr-only" />
                    <div className="flex-1">
                      <p className="font-display text-lg font-semibold">Custom amount</p>
                      <p className="text-sm text-ink-soft">
                        Any amount from {custom.min_formatted} to {custom.max_formatted}. {fmt(custom.coins_per_unit)} coins per {money(100, currency)}.
                      </p>
                    </div>
                    <div className="w-full sm:w-48">
                      <div className="relative">
                        <span className="absolute top-1/2 left-4 -translate-y-1/2 font-extrabold text-ink-muted">{currency === 'EUR' ? '€' : currency}</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min={custom.min / 100}
                          max={custom.max / 100}
                          step="0.01"
                          placeholder={(custom.min / 100).toFixed(2)}
                          value={data.amount}
                          onFocus={() => setData('package', 'custom')}
                          onChange={(e) => setData((d) => ({ ...d, package: 'custom', amount: e.target.value }))}
                          className="input pl-9 text-right font-extrabold"
                          aria-invalid={errors.amount || (data.package === 'custom' && data.amount && customInvalid) ? 'true' : undefined}
                          aria-label="Custom amount"
                        />
                      </div>
                    </div>
                  </label>
                )}
                {(errors.amount || errors.package) && <p className="mt-2 text-sm font-bold text-danger">{errors.amount || errors.package}</p>}
              </fieldset>

              <fieldset className="mt-10">
                <legend className="flex w-full items-center justify-between gap-3 font-display text-2xl font-semibold">
                  2. Billing details
                  <Link href="/account" className="chip py-1 text-xs shadow-toy-sm">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                </legend>
                <div className="card mt-5 grid gap-x-6 gap-y-3 p-5 text-sm sm:grid-cols-2">
                  <Detail label="Name" value={`${billing.first_name} ${billing.last_name}`} />
                  <Detail label="Email" value={billing.email} />
                  <Detail label="Phone" value={billing.phone} />
                  <Detail label="Date of birth" value={billing.date_of_birth} />
                  <Detail label="Address" value={`${billing.address_line}, ${billing.postcode} ${billing.city}`} />
                  <Detail label="Country" value={billing.country_name} />
                </div>
                {!billingComplete && (
                  <p className="mt-3 flex items-center gap-2 text-sm font-bold text-danger">
                    <AlertTriangle className="h-4 w-4" /> Please complete your details in your account before paying.
                  </p>
                )}
                {errors.billing && <p className="mt-2 text-sm font-bold text-danger">{errors.billing}</p>}
                <p className="mt-3 text-xs font-semibold text-ink-muted">These details are sent to our payment provider to authorise your card payment and are printed on your invoice.</p>
              </fieldset>
            </div>

            {/* Summary */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="card overflow-hidden">
                <div className="border-b-[3px] border-ink bg-ink px-6 py-4 text-cream">
                  <p className="font-display text-xl font-semibold">Order summary</p>
                </div>
                <div className="p-6">
                  {quote && (
                    <dl className="space-y-2.5 text-sm">
                      <Row label="Package" value={quote.name} />
                      <Row label="Coins" value={fmt(quote.coins)} />
                      {quote.bonus > 0 && <Row label="Bonus coins" value={`+ ${fmt(quote.bonus)}`} accent />}
                      <Row label="You receive" value={<Coins amount={quote.coins + quote.bonus} iconClass="h-4 w-4" />} />
                      <div className="border-t-2 border-dashed border-ink/20 pt-3">
                        <div className="flex items-end justify-between">
                          <dt className="font-extrabold">Total</dt>
                          <dd className="font-display text-3xl font-bold">{customInvalid ? '-' : money(quote.price, currency)}</dd>
                        </div>
                        <p className="mt-1 text-right text-xs font-semibold text-ink-muted">Taxes included · charged once</p>
                      </div>
                    </dl>
                  )}

                  <div className="mt-6 space-y-4">
                    <Checkbox checked={data.accept_terms} onChange={(v) => setData('accept_terms', v)} error={errors.accept_terms}>
                      I agree to the{' '}
                      <a href="/legal/terms" target="_blank" rel="noopener" className="font-extrabold text-ink underline decoration-pink decoration-2 underline-offset-2">Terms &amp; Conditions</a>{' '}
                      and the{' '}
                      <a href="/legal/refunds" target="_blank" rel="noopener" className="font-extrabold text-ink underline decoration-pink decoration-2 underline-offset-2">Refund &amp; Cancellation Policy</a>.
                    </Checkbox>
                    <Checkbox checked={data.immediate_supply} onChange={(v) => setData('immediate_supply', v)} error={errors.immediate_supply}>
                      I want my coins delivered immediately and understand that I lose my right of withdrawal once they are credited to my account.
                    </Checkbox>
                  </div>

                  <button type="submit" disabled={!canPay || processing} className="btn btn-primary btn-lg mt-6 w-full">
                    <Lock className="h-5 w-5" /> {processing ? 'Redirecting...' : quote && !customInvalid ? `Pay ${money(quote.price, currency)}` : 'Pay securely'}
                  </button>

                  <p className="mt-4 flex items-start gap-2 text-xs leading-5 font-semibold text-ink-muted">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
                    You will be taken to our payment provider’s secure page. We never see or store your card number. The charge appears on your statement as {company.descriptor}.
                  </p>
                  <PaymentBadges className="mt-4" />
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </>
  );
}

TopUp.layout = withLayout;

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-extrabold text-ink-muted uppercase">{label}</p>
      <p className="font-bold break-words">{value || <span className="text-danger">Missing</span>}</p>
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-soft">{label}</dt>
      <dd className={`font-extrabold ${accent ? 'text-pink-deep' : ''}`}>{value}</dd>
    </div>
  );
}
