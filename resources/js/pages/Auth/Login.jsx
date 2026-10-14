import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import AuthShell from '../../components/AuthShell.jsx';
import { Checkbox, PasswordInput, TextInput } from '../../components/ui.jsx';
import { withLayout } from '../../layouts/AppLayout.jsx';

export default function Login({ status }) {
  const form = useForm({ email: '', password: '', remember: false });
  const { data, setData, errors, processing } = form;

  const submit = (e) => {
    e.preventDefault();
    form.post('/login', { onFinish: () => form.reset('password') });
  };

  return (
    <>
      <Head title="Log in" />
      <AuthShell
        title="Welcome back!"
        subtitle={
          <>
            Your buddy missed you. New here?{' '}
            <Link href="/register" className="font-extrabold text-ink underline decoration-pink decoration-[3px] underline-offset-4">
              Hatch an egg
            </Link>
          </>
        }
        shell="mint"
        pet={{ skin: 'bunbun', stage: 'adult', mood: 'happy', status: 'alive', poop: 0, needs: [] }}
      >
        {status && <div className="mb-6 rounded-2xl border-[3px] border-ink bg-mint-soft px-4 py-3 text-sm font-bold">{status}</div>}
        <form onSubmit={submit} className="max-w-md space-y-5">
          <TextInput label="Email" type="email" name="email" autoComplete="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} autoFocus />
          <PasswordInput label="Password" name="password" autoComplete="current-password" value={data.password} onChange={(e) => setData('password', e.target.value)} error={errors.password} />
          <div className="flex items-center justify-between gap-4">
            <Checkbox checked={data.remember} onChange={(v) => setData('remember', v)}>Remember me</Checkbox>
            <Link href="/forgot-password" className="text-sm font-extrabold text-ink underline decoration-pink decoration-2 underline-offset-2">
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={processing}>
            Log in <ArrowRight className="h-5 w-5" strokeWidth={3} />
          </button>
        </form>
      </AuthShell>
    </>
  );
}

Login.layout = withLayout;
