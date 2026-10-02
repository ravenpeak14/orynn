import { type FormEvent, useState } from 'react'
import { Link } from 'react-router'
import { Button, Field, FormError } from '../../components/ui'
import { ApiError } from '../../lib/api'
import { inputClass } from '../../lib/styles'
import { type LoginInput, useLogin } from './api'
import { AuthLayout } from './AuthLayout'

export function LoginPage() {
  const login = useLogin()
  const [form, setForm] = useState<LoginInput>({ email: '', password: '', remember: true })
  const error = login.error instanceof ApiError ? login.error : null

  function submit(event: FormEvent) {
    event.preventDefault()
    login.mutate(form)
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to see your day."
      footer={
        <>
          New to Orynn?{' '}
          <Link to="/register" className="font-semibold text-accent-strong hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Email" error={error?.field('email')}>
          {(control) => (
            <input
              {...control}
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className={inputClass}
            />
          )}
        </Field>

        <Field label="Password" error={error?.field('password')}>
          {(control) => (
            <input
              {...control}
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className={inputClass}
            />
          )}
        </Field>

        <label className="flex items-center gap-2.5 text-[15px]">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={(event) => setForm({ ...form, remember: event.target.checked })}
            className="size-4 accent-accent-strong"
          />
          Keep me signed in
        </label>

        <FormError error={login.error} fields={['email', 'password']} />

        <Button type="submit" size="lg" loading={login.isPending} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}
