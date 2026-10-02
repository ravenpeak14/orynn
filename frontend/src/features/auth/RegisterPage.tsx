import { type FormEvent, useState } from 'react'
import { Link } from 'react-router'
import { Button, Field, FormError } from '../../components/ui'
import { ApiError } from '../../lib/api'
import { deviceTimeZone } from '../../lib/date'
import { inputClass } from '../../lib/styles'
import { type RegisterInput, useRegister } from './api'
import { AuthLayout } from './AuthLayout'

export function RegisterPage() {
  const register = useRegister()
  const [form, setForm] = useState<RegisterInput>(() => ({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    timezone: deviceTimeZone(),
  }))
  const error = register.error instanceof ApiError ? register.error : null

  const update = (field: keyof RegisterInput) => (event: { target: { value: string } }) =>
    setForm({ ...form, [field]: event.target.value })

  function submit(event: FormEvent) {
    event.preventDefault()
    register.mutate(form)
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Plan your routine once, see it every day."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent-strong hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Name" error={error?.field('name')}>
          {(control) => (
            <input {...control} autoComplete="name" required value={form.name} onChange={update('name')} className={inputClass} />
          )}
        </Field>

        <Field label="Email" error={error?.field('email')}>
          {(control) => (
            <input
              {...control}
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={update('email')}
              className={inputClass}
            />
          )}
        </Field>

        <Field label="Password" hint="At least 8 characters, with letters and numbers." error={error?.field('password')}>
          {(control) => (
            <input
              {...control}
              type="password"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={update('password')}
              className={inputClass}
            />
          )}
        </Field>

        <Field label="Confirm password">
          {(control) => (
            <input
              {...control}
              type="password"
              autoComplete="new-password"
              required
              value={form.password_confirmation}
              onChange={update('password_confirmation')}
              className={inputClass}
            />
          )}
        </Field>

        <p className="text-[13px] text-ink-muted">
          Your timezone: <span className="font-medium text-ink">{form.timezone}</span>. You can change it later in Settings.
        </p>

        <FormError error={register.error} fields={['name', 'email', 'password']} />

        <Button type="submit" size="lg" loading={register.isPending} className="w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}
