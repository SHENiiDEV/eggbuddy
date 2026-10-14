import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle, Egg, CreditCard, Shirt, Star } from 'lucide-react';
import { useState } from 'react';
import AccountNav from '../../components/AccountNav.jsx';
import { Checkbox, Coins, Modal, PasswordInput, SelectInput, TextInput } from '../../components/ui.jsx';
import { withLayout } from '../../layouts/AppLayout.jsx';
import { date } from '../../lib/format.js';

export default function Profile({ profile, countries, maxBirthDate, stats }) {
  const details = useForm({
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,
    phone: profile.phone,
    date_of_birth: profile.date_of_birth,
    address_line: profile.address_line,
    city: profile.city,
    country: countries.some((c) => c.code === profile.country) ? profile.country : '',
    postcode: profile.postcode,
  });
  const password = useForm({ current_password: '', password: '', password_confirmation: '' });
  const [closing, setClosing] = useState(false);

  const bind = (key) => ({ value: details.data[key] ?? '', onChange: (e) => details.setData(key, e.target.value), error: details.errors[key] });

  return (
    <>
      <Head title="Account" />
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:pt-12">
        <p className="pixel text-xs text-pink-deep">Account</p>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Hi, {profile.first_name}!</h1>
        <div className="mt-6">
          <AccountNav />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard icon={null} label="Coins" value={<Coins amount={stats.coins} />} />
          <StatCard icon={Egg} label="Buddies raised" value={stats.pets_raised} />
          <StatCard icon={Star} label="Star adults" value={stats.star_adults} />
          <StatCard icon={Shirt} label="Skins owned" value={stats.skins_owned} />
          <StatCard icon={CreditCard} label="Top-ups" value={stats.payments} />
        </div>

        <section className="card mt-8 p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold">Personal & billing details</h2>
          <p className="mt-1 text-sm text-ink-soft">Used for your card payments and invoices. Please keep them accurate.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              details.put('/account', { preserveScroll: true });
            }}
            className="mt-6 grid gap-5 sm:grid-cols-2"
          >
            <TextInput label="Name" autoComplete="given-name" {...bind('first_name')} />
            <TextInput label="Surname" autoComplete="family-name" {...bind('last_name')} />
            <TextInput label="Email" type="email" autoComplete="email" {...bind('email')} />
            <TextInput label="Phone number" type="tel" autoComplete="tel" hint="International format, e.g. +44 7700 900123" {...bind('phone')} />
            <TextInput label="Date of birth" type="date" max={maxBirthDate} {...bind('date_of_birth')} />
            <TextInput label="Street, house number, apartment" autoComplete="street-address" {...bind('address_line')} />
            <TextInput label="City" autoComplete="address-level2" {...bind('city')} />
            <SelectInput label="Country" autoComplete="country" {...bind('country')}>
              <option value="">Select your country</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </SelectInput>
            <TextInput label="Post code" autoComplete="postal-code" {...bind('postcode')} />
            <div className="flex items-end justify-end sm:col-span-2">
              <button type="submit" className="btn btn-primary" disabled={details.processing || !details.isDirty}>
                Save details
              </button>
            </div>
          </form>
          <p className="mt-4 text-xs font-semibold text-ink-muted">
            Member since {date(profile.created_at)} · Terms v{profile.terms_version} accepted on {date(profile.terms_accepted_at)}
          </p>
        </section>

        <section className="card mt-8 p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold">Password</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              password.put('/account/password', { preserveScroll: true, onSuccess: () => password.reset() });
            }}
            className="mt-6 grid gap-5 sm:grid-cols-3"
          >
            <PasswordInput label="Current password" autoComplete="current-password" value={password.data.current_password} onChange={(e) => password.setData('current_password', e.target.value)} error={password.errors.current_password} />
            <PasswordInput label="New password" autoComplete="new-password" value={password.data.password} onChange={(e) => password.setData('password', e.target.value)} error={password.errors.password} />
            <PasswordInput label="Repeat new password" autoComplete="new-password" value={password.data.password_confirmation} onChange={(e) => password.setData('password_confirmation', e.target.value)} error={password.errors.password_confirmation} />
            <div className="flex justify-end sm:col-span-3">
              <button type="submit" className="btn btn-secondary" disabled={password.processing}>Update password</button>
            </div>
          </form>
        </section>

        <section className="mt-8 rounded-[1.75rem] border-[3px] border-dashed border-danger/60 p-6 sm:p-8">
          <h2 className="flex items-center gap-2 font-display text-2xl font-semibold"><AlertTriangle className="h-6 w-6 text-danger" /> Close account</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            Closing your account deletes your profile, pets, skins and coins. We keep payment records and invoices as required by accounting law. Unused purchased coins may be refundable under our Refund Policy, so contact support first if you’d like a refund.
          </p>
          <button type="button" onClick={() => setClosing(true)} className="btn btn-secondary btn-sm mt-5 text-danger">Close my account</button>
        </section>
      </div>

      <CloseAccountModal open={closing} onClose={() => setClosing(false)} />
    </>
  );
}

Profile.layout = withLayout;

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border-[3px] border-ink bg-white px-4 py-3 shadow-toy-sm">
      <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-ink-muted uppercase">{Icon && <Icon className="h-3.5 w-3.5" />} {label}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}

function CloseAccountModal({ open, onClose }) {
  const form = useForm({ password: '', confirm: false });
  return (
    <Modal open={open} onClose={onClose} title="Close account">
      <h2 className="font-display text-3xl font-bold">Close your account?</h2>
      <p className="mt-2 text-sm text-ink-soft">This can’t be undone. Your buddy, skins and coins will be gone.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.delete('/account', { preserveScroll: true });
        }}
        className="mt-5 space-y-4"
      >
        <PasswordInput label="Your password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} error={form.errors.password} autoComplete="current-password" />
        <Checkbox checked={form.data.confirm} onChange={(v) => form.setData('confirm', v)} error={form.errors.confirm}>
          I understand my pets, skins and coins will be permanently deleted.
        </Checkbox>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Keep it</button>
          <button type="submit" disabled={form.processing} className="btn flex-1 bg-danger text-white">Close account</button>
        </div>
      </form>
    </Modal>
  );
}
