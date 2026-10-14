import { Link, usePage } from '@inertiajs/react';
import { Mail, Phone } from 'lucide-react';
import { openCookieSettings } from '../lib/consent.js';
import { PaymentBadges } from './ui.jsx';

export default function SiteFooter() {
  const { company, legal, auth, app } = usePage().props;
  const docs = legal?.documents ?? [];

  return (
    <footer className="mt-auto border-t-[3px] border-ink bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-display text-3xl font-bold">
              Egg<span className="text-pink">Buddy</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-cream/75">
              A retro pocket pet for grown-ups. Hatch it, feed it, play with it and tuck it in at night.
            </p>
            <div className="mt-5 space-y-2 text-sm">
              <a href={`mailto:${company.email}`} className="flex items-center gap-2 font-bold hover:text-pink">
                <Mail className="h-4 w-4" /> {company.email}
              </a>
              {company.phone && (
                <a href={`tel:${company.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 font-bold hover:text-pink">
                  <Phone className="h-4 w-4" /> {company.phone}
                </a>
              )}
              <p className="text-xs text-cream/60">{company.support_hours}</p>
            </div>
          </div>

          <FooterCol title="Play" className="md:col-span-2">
            <FooterLink href={auth?.user ? '/play' : '/register'}>{auth?.user ? 'My buddy' : 'Hatch an egg'}</FooterLink>
            <FooterLink href={auth?.user ? '/shop' : '/#buddies'}>Skins & treats</FooterLink>
            <FooterLink href={auth?.user ? '/top-up' : '/#pricing'}>Coin packages</FooterLink>
            <FooterLink href="/#faq">FAQ</FooterLink>
          </FooterCol>

          <FooterCol title="Legal" className="md:col-span-3">
            {docs.map((d) => (
              <FooterLink key={d.key} href={d.url}>{d.title}</FooterLink>
            ))}
            <li>
              <button type="button" onClick={openCookieSettings} className="text-sm font-semibold text-cream/80 hover:text-pink">
                Cookie settings
              </button>
            </li>
          </FooterCol>

          <FooterCol title="Safe & simple" className="md:col-span-3">
            <li className="text-sm text-cream/80">Adults 18+ only</li>
            <li className="text-sm text-cream/80">One-time payments, no subscriptions</li>
            <li className="text-sm text-cream/80">Coins delivered instantly</li>
            <li className="text-sm text-cream/80">Prices in {app?.currency ?? 'EUR'}, taxes included</li>
            <li className="pt-2">
              <PaymentBadges dark />
            </li>
          </FooterCol>
        </div>

        <div className="mt-12 border-t-2 border-cream/15 pt-6 text-xs leading-6 text-cream/60">
          <p>
            {company.brand} is operated by <strong className="text-cream/85">{company.name}</strong>
            {company.number && <>, registration number {company.number}</>}
            {company.vat_number && <>, VAT {company.vat_number}</>}, registered office: {company.address}
            {company.country && <>, {company.country}</>}. Card payments appear on your statement as{' '}
            <strong className="text-cream/85">{company.descriptor}</strong>.
          </p>
          <p className="mt-1">
            Coins and digital items are virtual, have no cash value and cannot be exchanged for money. {company.brand} is not a gambling service.
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children, className = '' }) {
  return (
    <div className={className}>
      <p className="pixel mb-4 text-xs text-pink">{title}</p>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }) {
  return (
    <li>
      <Link href={href} className="text-sm font-semibold text-cream/80 hover:text-pink">
        {children}
      </Link>
    </li>
  );
}
