import { Head, useForm } from '@inertiajs/react';
import AuthShell from '../../components/AuthShell.jsx';
import { PasswordInput, TextInput } from '../../components/ui.jsx';
import { withLayout } from '../../layouts/AppLayout.jsx';

export default function ResetPassword({ token, email }) {
  const form = useForm({ token, email, password: '', password_confirmation: '' });

  const submit = (e) => {
    e.preventDefault();
    form.post('/reset-password', { onFinish: () => form.reset('password', 'password_confirmation') });
  };

  return (
    <>
      <Head title="Choose a new password" />
      <AuthShell title="Choose a new password" subtitle="Make it a good one. At least 8 characters with letters and numbers." shell="peach">
        <form onSubmit={submit} className="max-w-md space-y-5">
          <TextInput label="Email" type="email" autoComplete="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} />
          <PasswordInput label="New password" autoComplete="new-password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} error={form.errors.password} />
          <PasswordInput label="Repeat new password" autoComplete="new-password" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} error={form.errors.password_confirmation} />
          <button type="submit" className="btn btn-primary w-full" disabled={form.processing}>
            Save new password
          </button>
        </form>
      </AuthShell>
    </>
  );
}

ResetPassword.layout = withLayout;
