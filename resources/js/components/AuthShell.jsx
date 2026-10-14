import { CheckCircle2 } from 'lucide-react';
import Device from '../game/Device.jsx';
import LcdScreen from '../game/LcdScreen.jsx';

export default function AuthShell({ title, subtitle, children, aside, shell = 'lavender', pet }) {
  return (
    <div className="relative">
      <div className="dot-grid absolute inset-0 opacity-50" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
        <div className="card p-6 sm:p-10">
          <h1 className="font-display text-4xl leading-tight font-bold sm:text-5xl">{title}</h1>
          {subtitle && <div className="mt-3 text-[17px] text-ink-soft">{subtitle}</div>}
          <div className="mt-8">{children}</div>
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <div className="mx-auto w-full max-w-[300px] -rotate-3">
              <Device shell={shell}>
                <LcdScreen pet={pet ?? { skin: 'mochi', stage: 'egg', status: 'egg', hatches_in: 25, poop: 0, needs: [] }} />
              </Device>
            </div>
            {aside && <div className="mt-10">{aside}</div>}
          </div>
        </aside>
      </div>
    </div>
  );
}

export function Perks({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-3 rounded-2xl border-[3px] border-ink bg-white px-4 py-3 text-sm font-bold shadow-toy-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> {t}
        </li>
      ))}
    </ul>
  );
}
