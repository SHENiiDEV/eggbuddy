import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, Lock } from 'lucide-react';
import AuthShell, { Perks } from '../../components/AuthShell.jsx';
import { Checkbox, PasswordInput, SelectInput, TextInput } from '../../components/ui.jsx';
import { withLayout } from '../../layouts/AppLayout.jsx';

export default function Register({ countries, minAge, maxBirthDate, starterCoins }) {
  const form = useForm({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    date_of_birth: '',
    address_line: '',
    city: '',
    country: '',
    postcode: '',
    terms: false,
  });
  const { data, setData, errors, processing } = form;

  const submit = (e) => {
    e.preventDefault();
    form.post('/register', {
      preserveScroll: true,
      onError: () => {
        requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus());
      },
      onFinish: () => form.reset('password', 'password_confirmation'),
    });
  };

  const bind = (key) => ({
    name: key,
    value: data[key],
    onChange: (e) => setData(key, e.target.value),
    error: errors[key],
  });

  return (
    <>
      <Head title="Create your account" />
      <AuthShell
        title="Hatch your egg"
        subtitle={
          <>
            Already have a buddy?{' '}
            <Link href="/login" className="font-extrabold text-ink underline decoration-pink decoration-[3px] underline-offset-4">
              Log in
            </Link>
          </>
        }
        aside={
          <Perks
            items={[
              `${starterCoins} free coins to start`,
              'Your egg hatches about a minute after sign-up',
              'One-time payments only, never a subscription',
              'Your details are encrypted and never sold',
            ]}
          />
        }
      >
        <form onSubmit={submit} noValidate className="space-y-9">
          <Section n="1" title="Your login">
            <TextInput label="Email" type="email" autoComplete="email" placeholder="you@example.com" className="sm:col-span-2" {...bind('email')} />
            <PasswordInput label="Password" autoComplete="new-password" placeholder="At least 8 characters" hint="Use 8+ characters with letters and numbers." {...bind('password')} />
            <PasswordInput label="Repeat password" autoComplete="new-password" placeholder="Type it again" {...bind('password_confirmation')} />
          </Section>

          <Section n="2" title="About you">
            <TextInput label="Name" autoComplete="given-name" placeholder="Anna" {...bind('first_name')} />
            <TextInput label="Surname" autoComplete="family-name" placeholder="Smith" {...bind('last_name')} />
            <TextInput
              label="Phone number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+44 7700 900123"
              hint="International format with country code."
              {...bind('phone')}
            />
            <TextInput
              label="Date of birth"
              type="date"
              autoComplete="bday"
              max={maxBirthDate}
              min="1900-01-01"
              hint={`You must be ${minAge} or older.`}
              {...bind('date_of_birth')}
            />
          </Section>

          <Section n="3" title="Address" note="Needed by our payment provider to verify card payments.">
            <TextInput
              label="Street, house number, apartment"
              autoComplete="street-address"
              placeholder="12 Baker Street, apt. 4"
              className="sm:col-span-2"
              {...bind('address_line')}
            />
            <TextInput label="City" autoComplete="address-level2" placeholder="London" {...bind('city')} />
            <SelectInput label="Country" autoComplete="country" {...bind('country')}>
              <option value="">Select your country</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </SelectInput>
            <TextInput label="Post code" autoComplete="postal-code" placeholder="NW1 6XE" {...bind('postcode')} />
          </Section>

          <div className="rounded-2xl border-[3px] border-ink bg-cream p-4 sm:p-5">
            <Checkbox checked={data.terms} onChange={(v) => setData('terms', v)} error={errors.terms}>
              I agree to the{' '}
              <a href="/legal/terms" target="_blank" rel="noopener" className="font-extrabold text-ink underline decoration-pink decoration-2 underline-offset-2">
                Terms &amp; Conditions
              </a>{' '}
              and{' '}
              <a href="/legal/privacy" target="_blank" rel="noopener" className="font-extrabold text-ink underline decoration-pink decoration-2 underline-offset-2">
                Privacy Policy
              </a>
              .
            </Checkbox>
          </div>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button type="submit" className="btn btn-primary btn-lg w-full sm:w-auto" disabled={processing}>
              {processing ? 'Warming up your egg...' : 'Create account'} <ArrowRight className="h-5 w-5" strokeWidth={3} />
            </button>
            <p className="flex items-center gap-1.5 text-xs font-bold text-ink-muted">
              <Lock className="h-3.5 w-3.5" /> Secured with TLS encryption
            </p>
          </div>
        </form>
      </AuthShell>
    </>
  );
}

Register.layout = withLayout;

function Section({ n, title, note, children }) {
  return (
    <fieldset>
      <legend className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-ink bg-lemon font-display text-sm font-bold">{n}</span>
        <span className="font-display text-2xl font-semibold">{title}</span>
      </legend>
      {note && <p className="mt-2 ml-11 text-sm text-ink-muted">{note}</p>}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}
