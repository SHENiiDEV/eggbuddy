import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CircleX, Clock, Download, FileText, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Coins } from '../../components/ui.jsx';
import { PetSprite, PixelIcon } from '../../game/PixelArt.jsx';
import { withLayout } from '../../layouts/AppLayout.jsx';
import { api } from '../../lib/api.js';
import { dateTime } from '../../lib/format.js';

export default function PaymentShow({ payment: initial, balance: initialBalance }) {
  const [payment, setPayment] = useState(initial);
  const [balance, setBalance] = useState(initialBalance);

  // While the provider confirms the payment, check back every few seconds.
  useEffect(() => {
    if (payment.status !== 'pending') return;
    const id = setInterval(async () => {
      const res = await api(`/payments/${payment.id}/status`);
      if (res.ok) {
        setPayment(res.data.payment);
        setBalance(res.data.balance);
      }
    }, 3000);
    return () => clearInterval(id);
  }, [payment.status, payment.id]);

  const paid = payment.status === 'paid';
  const pending = payment.status === 'pending';

  return (
    <>
      <Head title={paid ? 'Payment successful' : pending ? 'Confirming payment' : 'Payment not completed'} />
      <div className="relative">
        <div className="dot-grid absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-xl px-4 py-12 sm:py-16">
          <div className="card overflow-hidden text-center">
            <div className={`relative flex h-48 items-end justify-center border-b-[3px] border-ink ${paid ? 'bg-mint-soft' : pending ? 'bg-lemon-soft' : 'bg-peach-soft'}`}>
              {paid && (
                <>
                  <PixelIcon name="heart" scale={5} className="absolute top-8 left-16 animate-float" />
                  <PixelIcon name="star" scale={5} className="absolute top-10 right-16 animate-float [animation-delay:.6s]" />
                </>
              )}
              <div className="mb-6">
                <PetSprite skin="pipi" stage="adult" mood={paid ? 'happy' : pending ? 'ok' : 'sad'} scale={6} />
              </div>
            </div>
            <div className="p-7">
              {paid && (
                <>
                  <h1 className="font-display text-4xl font-bold">Payment successful!</h1>
                  <p className="mt-3 text-ink-soft">
                    <strong className="text-ink">{payment.total_coins.toLocaleString('en-US')} coins</strong> have been added to your wallet. We’ve emailed your receipt with a PDF invoice.
                  </p>
                  <div className="mx-auto mt-6 grid max-w-sm gap-2 rounded-2xl border-[3px] border-ink bg-cream p-4 text-left text-sm">
                    <Line label="Paid" value={payment.amount_formatted} />
                    <Line label="Package" value={payment.description} />
                    <Line label="Date" value={dateTime(payment.paid_at)} />
                    {payment.invoice && <Line label="Invoice" value={payment.invoice.number} />}
                    <Line label="New balance" value={<Coins amount={balance} iconClass="h-4 w-4" />} />
                  </div>
                  <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link href="/play" className="btn btn-primary">
                      Back to my buddy <ArrowRight className="h-4 w-4" strokeWidth={3} />
                    </Link>
                    {payment.invoice && (
                      <a href={`${payment.invoice.url}?download=1`} className="btn btn-secondary">
                        <Download className="h-4 w-4" /> Invoice PDF
                      </a>
                    )}
                  </div>
                </>
              )}
              {pending && (
                <>
                  <h1 className="flex items-center justify-center gap-2 font-display text-4xl font-bold">
                    <Clock className="h-8 w-8 animate-spin [animation-duration:3s]" /> Almost there
                  </h1>
                  <p className="mt-3 text-ink-soft">We’re waiting for confirmation from the payment provider. This page updates by itself. You can safely leave it; coins are added as soon as the payment is confirmed.</p>
                </>
              )}
              {!paid && !pending && (
                <>
                  <h1 className="flex items-center justify-center gap-2 font-display text-4xl font-bold">
                    <CircleX className="h-8 w-8 text-danger" /> {payment.status === 'cancelled' ? 'Payment cancelled' : payment.status === 'expired' ? 'Payment expired' : 'Payment failed'}
                  </h1>
                  <p className="mt-3 text-ink-soft">
                    {payment.failure_reason ? `${payment.failure_reason}. ` : ''}You have not been charged. You can try again, or use another card.
                  </p>
                  <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link href={`/top-up?package=${payment.package}`} className="btn btn-primary">
                      <RotateCcw className="h-4 w-4" /> Try again
                    </Link>
                    <Link href="/play" className="btn btn-secondary">Back to my buddy</Link>
                  </div>
                </>
              )}
            </div>
          </div>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs font-semibold text-ink-muted">
            <FileText className="h-3.5 w-3.5" /> All payments and invoices are in{' '}
            <Link href="/account/payments" className="underline">your account</Link>.
          </p>
        </div>
      </div>
    </>
  );
}

PaymentShow.layout = withLayout;

function Line({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-ink-muted">{label}</span>
      <span className="text-right font-extrabold">{value}</span>
    </div>
  );
}
