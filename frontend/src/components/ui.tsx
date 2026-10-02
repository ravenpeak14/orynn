import { LoaderCircle, type LucideIcon } from 'lucide-react'
import { type ButtonHTMLAttributes, type ReactNode, useEffect, useId, useState } from 'react'
import { ApiError } from '../lib/api'
import { cn } from '../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-accent-strong text-white shadow-accent hover:bg-accent-strong/90',
  secondary: 'border border-line bg-white text-ink shadow-soft hover:bg-white/70',
  ghost: 'text-ink hover:bg-black/5',
  danger: 'bg-danger-soft text-danger hover:bg-danger-soft/70',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-12 px-6 text-base',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  type = 'button',
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 [&_svg]:size-4.5',
        buttonSizes[size],
        buttonVariants[variant],
        className,
      )}
      {...props}
    >
      {loading ? <LoaderCircle className="animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
}

export function IconButton({ label, type = 'button', className, children, ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink transition hover:bg-black/5 active:bg-black/10',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

interface ControlProps {
  id: string
  'aria-invalid'?: true
  'aria-describedby'?: string
}

interface FieldProps {
  label: string
  error?: string
  hint?: string
  className?: string
  children: (control: ControlProps) => ReactNode
}

/** A labelled form control whose error message is announced with it. */
export function Field({ label, error, hint, className, children }: FieldProps) {
  const id = useId()
  const messageId = `${id}-message`
  const message = error ?? hint

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-[13px] font-medium text-ink-muted">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': message ? messageId : undefined,
      })}
      {message && (
        <p id={messageId} className={cn('text-[13px]', error ? 'text-danger' : 'text-ink-muted')}>
          {message}
        </p>
      )}
    </div>
  )
}

interface Choice<T> {
  value: T
  label: string
  icon?: ReactNode
  /** Accessible name when the label is only visual. */
  ariaLabel?: string
}

interface ChoiceChipsProps<T> {
  label: string
  value: T
  options: Choice<T>[]
  onChange: (value: T) => void
  error?: string
}

/** A single-choice group of toggle buttons (categories, reminders, weekdays). */
export function ChoiceChips<T extends string | number | null>({ label, value, options, onChange, error }: ChoiceChipsProps<T>) {
  const labelId = useId()

  return (
    <div className="space-y-1.5">
      <p id={labelId} className="text-[13px] font-medium text-ink-muted">
        {label}
      </p>
      <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={String(option.value)}
              type="button"
              aria-pressed={selected}
              aria-label={option.ariaLabel}
              onClick={() => onChange(option.value)}
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition',
                selected
                  ? 'border-accent bg-accent-soft text-accent-strong'
                  : 'border-line bg-white text-ink hover:bg-black/[0.03]',
              )}
            >
              {option.icon}
              {option.label}
            </button>
          )
        })}
      </div>
      {error && <p className="text-[13px] text-danger">{error}</p>}
    </div>
  )
}

interface SwitchProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function Switch({ label, description, checked, onChange }: SwitchProps) {
  const id = useId()

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-[15px] font-medium">
          {label}
        </label>
        {description && <p className="text-[13px] text-ink-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('relative h-7 w-12 shrink-0 rounded-full transition', checked ? 'bg-accent-strong' : 'bg-black/15')}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </div>
  )
}

interface ConfirmButtonProps {
  children: ReactNode
  confirmLabel?: string
  icon?: ReactNode
  loading?: boolean
  className?: string
  onConfirm: () => void
}

/** A destructive button that needs a second tap within three seconds. */
export function ConfirmButton({ children, confirmLabel = 'Tap again to confirm', icon, loading, className, onConfirm }: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const timer = window.setTimeout(() => setArmed(false), 3000)
    return () => window.clearTimeout(timer)
  }, [armed])

  return (
    <Button
      variant="danger"
      size="lg"
      icon={icon}
      loading={loading}
      className={className}
      onClick={() => {
        if (!armed) return setArmed(true)
        setArmed(false)
        onConfirm()
      }}
    >
      {armed ? confirmLabel : children}
    </Button>
  )
}

interface TagProps {
  icon?: LucideIcon
  tone?: 'neutral' | 'warning'
  children: ReactNode
}

export function Tag({ icon: Icon, tone = 'neutral', children }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded-full px-2 text-[12px] font-medium',
        tone === 'warning' ? 'bg-warning-soft text-warning' : 'bg-black/[0.045] text-ink-muted',
      )}
    >
      {Icon && <Icon className="size-3.5" aria-hidden />}
      {children}
    </span>
  )
}

export function Notice({ tone = 'danger', children }: { tone?: 'danger' | 'warning'; children: ReactNode }) {
  return (
    <p
      role={tone === 'danger' ? 'alert' : undefined}
      className={cn(
        'rounded-md px-3.5 py-2.5 text-sm',
        tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning',
      )}
    >
      {children}
    </p>
  )
}

/**
 * Shows an error that is not already displayed next to a field: network and
 * server errors, and validation messages for fields the form does not render.
 */
export function FormError({ error, fields = [] }: { error: unknown; fields?: string[] }) {
  if (!error) return null

  let message = 'Something went wrong. Please try again.'
  if (error instanceof ApiError) {
    if (error.status === 422) {
      const unshown = Object.entries(error.errors).find(([field]) => !fields.includes(field))
      if (!unshown) return null
      message = unshown[1][0]
    } else {
      message = error.message
    }
  }

  return <Notice>{message}</Notice>
}

interface EmptyStateProps {
  icon: ReactNode
  title: string
  message: string
  action?: ReactNode
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent-strong [&_svg]:size-6">
        {icon}
      </span>
      <p className="mt-5 text-lg font-semibold">{title}</p>
      <p className="mt-1 text-[15px] text-ink-muted">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-white/70 p-5 shadow-soft">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  )
}
