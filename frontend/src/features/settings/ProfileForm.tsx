import { type FormEvent, useMemo, useState } from 'react'
import { Button, Field, FormError } from '../../components/ui'
import { ApiError } from '../../lib/api'
import { inputClass } from '../../lib/styles'
import { type ProfileInput, useUpdateProfile, useUser } from '../auth/api'

function timeZones(current: string): string[] {
  const zones = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : []
  return zones.includes(current) ? zones : [current, ...zones]
}

export function ProfileForm() {
  const user = useUser()
  const update = useUpdateProfile()
  const [form, setForm] = useState<ProfileInput>({ name: user.name, email: user.email, timezone: user.timezone })
  const zones = useMemo(() => timeZones(user.timezone), [user.timezone])

  const error = update.error instanceof ApiError ? update.error : null
  const unchanged = form.name === user.name && form.email === user.email && form.timezone === user.timezone

  function submit(event: FormEvent) {
    event.preventDefault()
    update.mutate(form)
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field label="Name" error={error?.field('name')}>
        {(control) => (
          <input
            {...control}
            autoComplete="name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className={inputClass}
          />
        )}
      </Field>

      <Field label="Email" error={error?.field('email')}>
        {(control) => (
          <input
            {...control}
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className={inputClass}
          />
        )}
      </Field>

      <Field label="Timezone" hint="Decides what “today” and “now” mean on your timeline." error={error?.field('timezone')}>
        {(control) => (
          <select
            {...control}
            value={form.timezone}
            onChange={(event) => setForm({ ...form, timezone: event.target.value })}
            className={inputClass}
          >
            {zones.map((zone) => (
              <option key={zone} value={zone}>
                {zone.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        )}
      </Field>

      <FormError error={update.error} fields={['name', 'email', 'timezone']} />

      <Button type="submit" loading={update.isPending} disabled={unchanged}>
        Save changes
      </Button>
    </form>
  )
}
