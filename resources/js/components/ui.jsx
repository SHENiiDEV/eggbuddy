import { Link } from '@inertiajs/react';
import { Check, Eye, EyeOff, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { coins as fmtCoins } from '../lib/format.js';

export function Logo({ className = '', size = 'md', href = '/' }) {
  const s = size === 'lg' ? 'h-11' : size === 'sm' ? 'h-7' : 'h-9';
  return (
    <Link href={href} className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="EggBuddy home">
      <svg viewBox="0 0 64 74" className={`${s} w-auto transition-transform group-hover:-rotate-6`} aria-hidden>
        <path d="M32 6C18 6 7 26 7 43c0 15 11 25 25 25s25-10 25-25C57 26 46 6 32 6z" fill="#3b2346" transform="translate(0 4)" />
        <path d="M32 6C18 6 7 26 7 43c0 15 11 25 25 25s25-10 25-25C57 26 46 6 32 6z" fill="#ff8fba" stroke="#3b2346" strokeWidth="4" />
        <rect x="18" y="30" width="28" height="22" rx="6" fill="#dcefc9" stroke="#3b2346" strokeWidth="3.5" />
        <rect x="25" y="37" width="3.5" height="4" fill="#3b2346" />
        <rect x="35.5" y="37" width="3.5" height="4" fill="#3b2346" />
        <rect x="29" y="44" width="6" height="2.5" fill="#3b2346" />
        <ellipse cx="22" cy="20" rx="5" ry="3" fill="#fff" opacity=".7" transform="rotate(-30 22 20)" />
      </svg>
      <span className="font-display text-[1.45rem] leading-none font-bold tracking-tight text-ink">
        Egg<span className="text-pink-deep">Buddy</span>
      </span>
    </Link>
  );
}

export function CoinIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 12 12" className={className} shapeRendering="crispEdges" aria-hidden>
      <path d="M4 0h4v1h2v1h1v2h1v4h-1v2h-1v1H8v1H4v-1H2v-1H1V8H0V4h1V2h1V1h2z" fill="#3b2346" />
      <path d="M4 1h4v1h2v2h1v4h-1v2H8v1H4v-1H2V8H1V4h1V2h2z" fill="#ffc93c" />
      <path d="M4 2h3v1H4v1H3v3H2V4h1V3h1z" fill="#fff1a8" />
      <path d="M5 4h2v4H5z" fill="#e59b1c" />
      <path d="M9 7h1v1H9v1H8v1H7V9h1V8h1z" fill="#e59b1c" />
    </svg>
  );
}

export function Coins({ amount, className = '', iconClass = 'h-5 w-5' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-extrabold tabular-nums ${className}`}>
      <CoinIcon className={iconClass} />
      {fmtCoins(amount)}
    </span>
  );
}

export function Field({ label, error, hint, children, htmlFor, className = '', optional = false }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="label">
          {label}
          {optional && <span className="ml-1 font-semibold text-ink-muted">(optional)</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs font-semibold text-ink-muted">{hint}</p>}
      {error && (
        <p className="mt-1.5 flex items-start gap-1 text-[13px] font-bold text-danger" role="alert">
          <X className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={3} />
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({ label, error, hint, className = '', id, optional, ...props }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Field label={label} error={error} hint={hint} htmlFor={inputId} className={className} optional={optional}>
      <input id={inputId} className="input" aria-invalid={error ? 'true' : undefined} {...props} />
    </Field>
  );
}

export function PasswordInput({ label, error, hint, className = '', id, ...props }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [show, setShow] = useState(false);
  return (
    <Field label={label} error={error} hint={hint} htmlFor={inputId} className={className}>
      <div className="relative">
        <input id={inputId} type={show ? 'text' : 'password'} className="input pr-12" aria-invalid={error ? 'true' : undefined} {...props} />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1.5 text-ink-muted hover:bg-cream hover:text-ink"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
        </button>
      </div>
    </Field>
  );
}

export function SelectInput({ label, error, hint, className = '', id, children, ...props }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Field label={label} error={error} hint={hint} htmlFor={inputId} className={className}>
      <div className="relative">
        <select id={inputId} className="input appearance-none pr-10" aria-invalid={error ? 'true' : undefined} {...props}>
          {children}
        </select>
        <svg className="pointer-events-none absolute top-1/2 right-4 h-3 w-3 -translate-y-1/2" viewBox="0 0 10 6" aria-hidden>
          <path d="M1 1l4 4 4-4" fill="none" stroke="#3b2346" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Field>
  );
}

export function Checkbox({ checked, onChange, children, error, id, className = '' }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={className}>
      <label htmlFor={inputId} className="flex cursor-pointer items-start gap-3">
        <span className="relative mt-0.5 shrink-0">
          <input id={inputId} type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={error ? 'true' : undefined} />
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-lg border-[3px] bg-white transition peer-focus-visible:ring-4 peer-focus-visible:ring-lilac-soft ${
              error ? 'border-danger' : 'border-ink'
            } ${checked ? 'bg-pink' : ''}`}
          >
            {checked && <Check className="h-4 w-4 text-ink" strokeWidth={4} />}
          </span>
        </span>
        <span className="text-sm leading-6 font-semibold text-ink-soft">{children}</span>
      </label>
      {error && <p className="mt-1.5 ml-9 text-[13px] font-bold text-danger" role="alert">{error}</p>}
    </div>
  );
}

export function Modal({ open, onClose, children, title, className = '', dismissible = true }) {
  useEffect(() => {
    if (!open || !dismissible) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, dismissible]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" onClick={dismissible ? onClose : undefined} />
      <div className={`card relative w-full max-w-md animate-pop p-6 sm:p-7 ${className}`}>
        {dismissible && (
          <button type="button" onClick={onClose} className="absolute top-4 right-4 rounded-full p-1.5 text-ink-muted hover:bg-cream hover:text-ink" aria-label="Close">
            <X className="h-5 w-5" strokeWidth={3} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

export function Badge({ children, className = '' }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-extrabold ${className}`}>{children}</span>;
}

export function PaymentBadges({ className = '', dark = false }) {
  const base = `rounded-lg border-2 px-2.5 py-1 text-[11px] font-extrabold tracking-wide ${dark ? 'border-cream/40 text-cream' : 'border-ink/20 bg-white text-ink'}`;
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className={`${base} italic`}>VISA</span>
      <span className={base}>Mastercard</span>
      <span className={base}>3-D Secure</span>
      <span className={base}>SSL / TLS</span>
    </div>
  );
}

export function SectionTitle({ eyebrow, title, children, className = '', center = true }) {
  return (
    <div className={`${center ? 'mx-auto text-center' : ''} max-w-2xl ${className}`}>
      {eyebrow && <p className="pixel mb-3 text-xs text-pink-deep">{eyebrow}</p>}
      <h2 className="font-display text-4xl leading-[1.05] font-semibold text-ink sm:text-5xl">{title}</h2>
      {children && <p className="mt-4 text-lg leading-relaxed text-ink-soft">{children}</p>}
    </div>
  );
}
