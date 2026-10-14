import { Head, Link, useForm } from '@inertiajs/react';
import AuthShell from '../../components/AuthShell.jsx';
import { TextInput } from '../../components/ui.jsx';
import { withLayout } from '../../layouts/AppLayout.jsx';

export default function ForgotPassword({ status }) {
  const form = useForm({ email: '' });

  const submit = (e) => {
    e.preventDefault();
    form.post('/forgot-password');
  };

  return (
    <>
      <Head title="Reset password" />
      <AuthShell
        title="Forgot your password?"
        subtitle="No worries. Enter your email and we will send you a link to choose a new one."
        shell="sky"
        pet={{ skin: 'kumo', stage: 'adult', mood: 'sleeping', is_asleep: true, status: 'alive', poop: 0, needs: [] }}
      >
        {status && <div className="mb-6 rounded-2xl border-[3px] border-ink bg-mint-soft px-4 py-3 text-sm font-bold">{status}</div>}
        <form onSubmit={submit} className="max-w-md space-y-5">
          <TextInput label="Email" type="email" autoComplete="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} autoFocus />
          <button type="submit" className="btn btn-primary w-full" disabled={form.processing}>
            Send reset link
          </button>
          <p className="text-sm font-bold">
            <Link href="/login" className="underline decoration-pink decoration-2 underline-offset-2">Back to log in</Link>
          </p>
        </form>
      </AuthShell>
    </>
  );
}

ForgotPassword.layout = withLayout;
