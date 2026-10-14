import { Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, CreditCard, Gamepad2, LogOut, Menu, Plus, ShoppingBag, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Coins, Logo } from './ui.jsx';

const guestLinks = [
  { href: '/#how', label: 'How it works' },
  { href: '/#buddies', label: 'Buddies' },
  { href: '/#pricing', label: 'Coins' },
  { href: '/#faq', label: 'FAQ' },
];

const userLinks = [
  { href: '/play', label: 'My buddy', icon: Gamepad2 },
  { href: '/shop', label: 'Shop', icon: ShoppingBag },
  { href: '/top-up', label: 'Top up', icon: Plus },
];

export default function SiteHeader() {
  const { auth } = usePage().props;
  const url = usePage().url;
  const user = auth?.user;
  const [mobile, setMobile] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setMobile(false);
    setMenu(false);
  }, [url]);

  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenu(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const logout = () => router.post('/logout');
  const active = (href) => url === href || url.startsWith(href + '/') || url.startsWith(href + '?');

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {(user ? userLinks : guestLinks).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-2 font-display text-[17px] font-medium transition ${
                user && active(l.href) ? 'bg-ink text-cream' : 'text-ink hover:bg-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/top-up" className="chip hidden shadow-toy-sm transition hover:-translate-y-0.5 sm:inline-flex" title="Your coins - top up">
                <Coins amount={user.coins} />
                <span className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-pink">
                  <Plus className="h-3.5 w-3.5" strokeWidth={3.5} />
                </span>
              </Link>
              <div className="relative hidden md:block" ref={menuRef}>
                <button type="button" onClick={() => setMenu((m) => !m)} className="chip gap-2 py-1.5 pr-2.5 shadow-toy-sm" aria-expanded={menu}>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-lilac font-display text-sm font-bold">
                    {user.first_name?.[0]}
                  </span>
                  <span className="max-w-28 truncate">{user.first_name}</span>
                  <ChevronDown className={`h-4 w-4 transition ${menu ? 'rotate-180' : ''}`} strokeWidth={3} />
                </button>
                {menu && (
                  <div className="card absolute right-0 mt-3 w-60 animate-pop overflow-hidden p-2">
                    <MenuLink href="/account" icon={User}>Account details</MenuLink>
                    <MenuLink href="/account/payments" icon={CreditCard}>Payments & invoices</MenuLink>
                    <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold hover:bg-cream">
                      <LogOut className="h-4.5 w-4.5" /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-full px-4 py-2 font-display text-[17px] font-medium hover:bg-white sm:inline-flex">
                Log in
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm hidden sm:inline-flex">
                Hatch an egg
              </Link>
            </>
          )}
          <button type="button" className="chip p-2 md:hidden" onClick={() => setMobile((m) => !m)} aria-label="Menu" aria-expanded={mobile}>
            {mobile ? <X className="h-5 w-5" strokeWidth={3} /> : <Menu className="h-5 w-5" strokeWidth={3} />}
          </button>
        </div>
      </div>

      {mobile && (
        <div className="border-t-[3px] border-ink bg-cream px-4 pt-3 pb-5 md:hidden">
          {user && (
            <div className="mb-3 flex items-center justify-between rounded-2xl border-[3px] border-ink bg-white px-4 py-3">
              <span className="font-bold">Hi, {user.first_name}!</span>
              <Coins amount={user.coins} />
            </div>
          )}
          <nav className="grid gap-1" aria-label="Mobile">
            {(user ? [...userLinks, { href: '/account', label: 'Account details' }, { href: '/account/payments', label: 'Payments & invoices' }] : guestLinks).map((l) => (
              <Link key={l.href} href={l.href} className="rounded-xl px-3 py-3 font-display text-lg font-medium hover:bg-white">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex gap-2">
            {user ? (
              <button type="button" onClick={logout} className="btn btn-secondary btn-sm w-full">
                Log out
              </button>
            ) : (
              <>
                <Link href="/login" className="btn btn-secondary btn-sm flex-1">Log in</Link>
                <Link href="/register" className="btn btn-primary btn-sm flex-1">Hatch an egg</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({ href, icon: Icon, children }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-cream">
      <Icon className="h-4.5 w-4.5" /> {children}
    </Link>
  );
}
