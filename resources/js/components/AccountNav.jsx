import { Link, usePage } from '@inertiajs/react';
import { CreditCard, User } from 'lucide-react';

export default function AccountNav() {
  const { url } = usePage();
  const links = [
    { href: '/account', label: 'Account details', icon: User, active: url === '/account' },
    { href: '/account/payments', label: 'Payments & invoices', icon: CreditCard, active: url.startsWith('/account/payments') },
  ];
  return (
    <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Account">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={`chip px-4 py-2 text-[15px] whitespace-nowrap ${l.active ? 'bg-ink text-cream' : 'shadow-toy-sm hover:-translate-y-0.5'}`}>
          <l.icon className="h-4 w-4" /> {l.label}
        </Link>
      ))}
    </nav>
  );
}
