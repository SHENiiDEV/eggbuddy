import { Link } from '@inertiajs/react';
import { Cookie } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getConsent, setConsent } from '../lib/consent.js';

export default function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [functional, setFunctional] = useState(true);

  useEffect(() => {
    const current = getConsent();
    if (!current) setOpen(true);
    else setFunctional(!!current.functional);

    const openSettings = () => {
      setFunctional(!!getConsent()?.functional);
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener('open-cookie-settings', openSettings);
    return () => window.removeEventListener('open-cookie-settings', openSettings);
  }, []);

  const save = (value) => {
    setConsent({ functional: value });
    setOpen(false);
    setDetails(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-5" role="dialog" aria-label="Cookie settings">
      <div className="card mx-auto max-w-3xl animate-pop p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[3px] border-ink bg-lemon sm:flex">
            <Cookie className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-semibold">We use a few cookies</h2>
            <p className="mt-1 text-sm leading-6 text-ink-soft">
              Strictly necessary cookies keep you logged in and protect payments. With your permission we also remember small
              preferences, like game sounds. No advertising or tracking cookies. Read our{' '}
              <Link href="/legal/cookies" className="font-bold text-ink underline decoration-pink decoration-2 underline-offset-2">
                Cookie Policy
              </Link>
              .
            </p>

            {details && (
              <div className="mt-4 space-y-2.5">
                <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-ink/15 bg-cream px-4 py-3">
                  <div>
                    <p className="text-sm font-extrabold">Strictly necessary</p>
                    <p className="text-xs text-ink-muted">Login session, security (XSRF), remember-me, your cookie choice.</p>
                  </div>
                  <span className="text-xs font-extrabold text-success">Always on</span>
                </div>
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 border-ink/15 bg-cream px-4 py-3">
                  <div>
                    <p className="text-sm font-extrabold">Functional</p>
                    <p className="text-xs text-ink-muted">Remembers game preferences such as sound on/off.</p>
                  </div>
                  <span className="relative inline-flex">
                    <input type="checkbox" className="peer sr-only" checked={functional} onChange={(e) => setFunctional(e.target.checked)} />
                    <span className="h-7 w-12 rounded-full border-[3px] border-ink bg-white transition peer-checked:bg-mint" />
                    <span className="absolute top-1 left-1 h-5 w-5 rounded-full border-2 border-ink bg-white transition peer-checked:translate-x-5" />
                  </span>
                </label>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2.5">
              {details ? (
                <button type="button" className="btn btn-primary btn-sm" onClick={() => save(functional)}>
                  Save choices
                </button>
              ) : (
                <>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => save(true)}>
                    Accept all
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => save(false)}>
                    Necessary only
                  </button>
                  <button type="button" className="btn btn-sm border-transparent bg-transparent shadow-none hover:shadow-none" onClick={() => setDetails(true)}>
                    Customise
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
