import { type FormEvent, useState } from 'react'
import { Button, Field, FormError } from '../../components/ui'
import { ApiError } from '../../lib/api'
import { inputClass } from '../../lib/styles'
import { type PasswordInput, useUpdatePassword } from '../auth/api'

const EMPTY: PasswordInput = { current_password: '', password: '', password_confirmation: '' }

export function PasswordForm() {
  const update = useUpdatePassword()
  const [form, setForm] = useState<PasswordInput>(EMPTY)
  const error = update.error instanceof ApiError ? update.error : null

  const input = (field: keyof PasswordInput, autoComplete: string) => (control: object) => (
    <input
      {...control}
      type="password"
      autoComplete={autoComplete}
      value={form[field]}
      onChange={(event) => setForm({ ...form, [field]: event.target.value })}
      className={inputClass}
    />
  )

  function submit(event: FormEvent) {
    event.preventDefault()
    update.mutate(form, { onSuccess: () => setForm(EMPTY) })
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field label="Current password" error={error?.field('current_password')}>
        {input('current_password', 'current-password')}
      </Field>
      <Field label="New password" hint="At least 8 characters, with letters and numbers." error={error?.field('password')}>
        {input('password', 'new-password')}
      </Field>
      <Field label="Confirm new password">{input('password_confirmation', 'new-password')}</Field>

      <FormError error={update.error} fields={['current_password', 'password']} />

      <Button type="submit" variant="secondary" loading={update.isPending} disabled={!form.current_password || !form.password}>
        Update password
      </Button>
      <p className="text-[13px] text-ink-muted">Other devices will be signed out.</p>
    </form>
  )
}
