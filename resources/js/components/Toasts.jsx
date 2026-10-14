import { usePage } from '@inertiajs/react';
import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export function toast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('toast', { detail: { message, type } }));
}

export default function Toasts() {
  const { toast: flash } = usePage().props;
  const [items, setItems] = useState([]);
  const seq = useRef(0);

  const push = useCallback((message, type) => {
    if (!message) return;
    const id = ++seq.current;
    setItems((list) => [...list.slice(-2), { id, message, type }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 4200);
  }, []);

  useEffect(() => {
    if (flash?.success) push(flash.success, 'success');
    if (flash?.error) push(flash.error, 'error');
  }, [flash, push]);

  useEffect(() => {
    const handler = (e) => push(e.detail.message, e.detail.type);
    window.addEventListener('toast', handler);
    return () => window.removeEventListener('toast', handler);
  }, [push]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex max-w-md animate-pop items-center gap-3 rounded-2xl border-[3px] border-ink px-4 py-3 text-sm font-bold shadow-toy ${
            t.type === 'error' ? 'bg-peach-soft' : 'bg-mint-soft'
          }`}
        >
          {t.type === 'error' ? <CircleAlert className="h-5 w-5 shrink-0 text-danger" /> : <CircleCheck className="h-5 w-5 shrink-0 text-success" />}
          <span>{t.message}</span>
          <button type="button" onClick={() => setItems((l) => l.filter((x) => x.id !== t.id))} className="ml-1 rounded-full p-0.5 text-ink-muted hover:text-ink" aria-label="Dismiss">
            <X className="h-4 w-4" strokeWidth={3} />
          </button>
        </div>
      ))}
    </div>
  );
}
