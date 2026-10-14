import { Head, Link } from '@inertiajs/react';
import { Download, FileText, Plus } from 'lucide-react';
import AccountNav from '../../components/AccountNav.jsx';
import { withLayout } from '../../layouts/AppLayout.jsx';
import { dateTime } from '../../lib/format.js';

const STATUS = {
  paid: { label: 'Paid', cls: 'bg-mint' },
  pending: { label: 'Pending', cls: 'bg-lemon' },
  failed: { label: 'Failed', cls: 'bg-peach' },
  cancelled: { label: 'Cancelled', cls: 'bg-cream' },
  expired: { label: 'Expired', cls: 'bg-cream' },
  refunded: { label: 'Refunded', cls: 'bg-sky' },
};

const TYPE = { starter: 'Welcome gift', top_up: 'Top-up', skin: 'Skin', item: 'Treat', minigame: 'Mini-game', refund: 'Refund' };

export default function Payments({ payments, transactions }) {
  const rows = payments.data;
  return (
    <>
      <Head title="Payments & invoices" />
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:pt-12">
        <p className="pixel text-xs text-pink-deep">Account</p>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Payments & invoices</h1>
        <div className="mt-6">
          <AccountNav />
        </div>

        <section className="card mt-8 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b-[3px] border-ink px-6 py-4">
            <h2 className="font-display text-xl font-semibold">Top-ups</h2>
            <Link href="/top-up" className="btn btn-primary btn-sm"><Plus className="h-4 w-4" strokeWidth={3} /> Top up</Link>
          </div>
          {rows.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto h-10 w-10 text-ink-muted" />
              <p className="mt-3 font-bold">No payments yet</p>
              <p className="text-sm text-ink-muted">Your invoices will appear here after your first top-up.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-cream text-[11px] font-extrabold text-ink-muted uppercase">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-3 py-3">Package</th>
                    <th className="px-3 py-3">Coins</th>
                    <th className="px-3 py-3">Amount</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id} className="border-t-2 border-ink/10">
                      <td className="px-6 py-3.5 font-semibold whitespace-nowrap">{dateTime(p.paid_at ?? p.created_at)}</td>
                      <td className="px-3 py-3.5">{p.description}</td>
                      <td className="px-3 py-3.5 font-bold tabular-nums">{p.total_coins.toLocaleString('en-US')}</td>
                      <td className="px-3 py-3.5 font-extrabold tabular-nums">{p.amount_formatted}</td>
                      <td className="px-3 py-3.5">
                        <span className={`rounded-full border-2 border-ink px-2 py-0.5 text-xs font-extrabold ${STATUS[p.status]?.cls}`}>{STATUS[p.status]?.label ?? p.status}</span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {p.invoice ? (
                          <div className="flex items-center justify-end gap-2">
                            <a href={p.invoice.url} target="_blank" rel="noopener" className="font-bold underline decoration-pink decoration-2 underline-offset-2">{p.invoice.number}</a>
                            <a href={`${p.invoice.url}?download=1`} className="rounded-full p-1.5 hover:bg-cream" aria-label={`Download ${p.invoice.number}`}>
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
                        ) : p.status === 'pending' ? (
                          <Link href={`/payments/${p.id}`} className="text-xs font-bold underline">Check status</Link>
                        ) : (
                          <span className="text-ink-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {payments.links && payments.last_page > 1 && (
            <div className="flex flex-wrap gap-2 border-t-2 border-ink/10 px-6 py-4">
              {payments.links.map((l, i) =>
                l.url ? (
                  <Link key={i} href={l.url} preserveScroll className={`chip py-1 text-xs ${l.active ? 'bg-ink text-cream' : ''}`} dangerouslySetInnerHTML={{ __html: l.label }} />
                ) : null,
              )}
            </div>
          )}
        </section>

        <section className="card mt-8 overflow-hidden">
          <div className="border-b-[3px] border-ink px-6 py-4">
            <h2 className="font-display text-xl font-semibold">Coin history</h2>
            <p className="text-xs text-ink-muted">Your latest 30 coin movements.</p>
          </div>
          <ul className="divide-y-2 divide-ink/10">
            {transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-4 px-6 py-3 text-sm">
                <div>
                  <p className="font-bold">{t.description}</p>
                  <p className="text-xs text-ink-muted">{TYPE[t.type] ?? t.type} · {dateTime(t.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-extrabold tabular-nums ${t.amount > 0 ? 'text-success' : 'text-ink'}`}>{t.amount > 0 ? '+' : ''}{t.amount.toLocaleString('en-US')}</p>
                  <p className="text-xs text-ink-muted tabular-nums">bal. {t.balance_after.toLocaleString('en-US')}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

Payments.layout = withLayout;
