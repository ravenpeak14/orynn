import { LogOut } from 'lucide-react'
import { Button, Section } from '../../components/ui'
import { useLogout, useUser } from '../auth/api'
import { CategoryList } from './CategoryList'
import { InstallCard } from './InstallCard'
import { PasswordForm } from './PasswordForm'
import { ProfileForm } from './ProfileForm'

export function SettingsPage() {
  const user = useUser()
  const logout = useLogout()

  return (
    <>
      <header className="pt-2 pb-5">
        <h1 className="text-[28px] leading-none font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-ink-muted">{user.email}</p>
      </header>

      <div className="space-y-5">
        <Section title="Profile">
          <ProfileForm />
        </Section>

        <Section title="Categories">
          <CategoryList />
        </Section>

        <Section title="Password">
          <PasswordForm />
        </Section>

        <Section title="App">
          <InstallCard />
        </Section>

        <Button variant="secondary" size="lg" icon={<LogOut />} loading={logout.isPending} onClick={() => logout.mutate()} className="w-full">
          Sign out
        </Button>
      </div>
    </>
  )
}
