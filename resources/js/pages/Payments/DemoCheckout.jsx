import { Head, router, usePage } from '@inertiajs/react';
import { FlaskConical, Lock, X } from 'lucide-react';
import { useState } from 'react';
import { Coins } from '../../components/ui.jsx';
import { withLayout } from '../../layouts/AppLayout.jsx';

/**
 * Hosted page of the built-in TEST gateway. It deliberately collects no card
 * data: a real provider's page replaces it once a PSP driver is configured.
 */
export default function DemoCheckout({ payment, billing, completeUrl }) {
  const { company } = usePage().props;
  const [busy, setBusy] = useState(null);

  const finish = (outcome) => {
    setBusy(outcome);
    router.post(completeUrl, { outcome }, { onFinish: () => setBusy(null) });
  };

  return (
    <>
      <Head title="Test payment" />
      <div className="mx-auto max-w-lg px-4 py-12 sm:py-16">
        <div className="mb-5 flex items-start gap-3 rounded-2xl border-[3px] border-dashed border-ink bg-lemon-soft px-4 py-3 text-sm font-bold">
          <FlaskConical className="mt-0.5 h-5 w-5 shrink-0" />
          <span>
            TEST MODE. This is a simulated payment page. No card is charged and no money moves. In production your payment provider’s secure page appears here instead.
          </span>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b-[3px] border-ink bg-ink px-6 py-4 text-cream">
            <p className="font-display text-xl font-semibold">Test checkout</p>
            <span className="pixel rounded-full bg-lemon px-2.5 py-1 text-[10px] text-ink">Sandbox</span>
          </div>
          <div className="space-y-5 p-6">
            <div>
              <p className="text-xs font-extrabold text-ink-muted uppercase">Merchant</p>
              <p className="font-bold">{company.name}</p>
            </div>
            <div className="rounded-2xl border-[3px] border-ink bg-cream p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold">{payment.description}</span>
                <Coins amount={payment.total_coins} iconClass="h-4 w-4" className="text-sm" />
              </div>
              <div className="mt-3 flex items-end justify-between border-t-2 border-dashed border-ink/20 pt-3">
                <span className="font-extrabold">Amount</span>
                <span className="font-display text-3xl font-bold">{payment.amount_formatted}</span>
              </div>
            </div>
            <div className="text-sm">
              <p className="text-xs font-extrabold text-ink-muted uppercase">Cardholder</p>
              <p className="font-bold">{billing.name}</p>
              <p className="text-ink-soft">{billing.email}</p>
              <p className="text-ink-soft">{billing.address}</p>
            </div>

            <div className="grid gap-3 pt-2">
              <button type="button" onClick={() => finish('approve')} disabled={!!busy} className="btn btn-primary btn-lg w-full">
                <Lock className="h-5 w-5" /> {busy === 'approve' ? 'Approving...' : `Approve test payment`}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => finish('decline')} disabled={!!busy} className="btn btn-secondary w-full">
                  Simulate decline
                </button>
                <button type="button" onClick={() => finish('cancel')} disabled={!!busy} className="btn btn-secondary w-full">
                  <X className="h-4 w-4" strokeWidth={3} /> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-xs font-semibold text-ink-muted">Order {payment.id}</p>
      </div>
    </>
  );
}

DemoCheckout.layout = withLayout;
