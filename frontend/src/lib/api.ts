/**
 * Minimal client for the Laravel API using Sanctum's SPA (cookie) mode:
 * the session lives in an HttpOnly cookie and state-changing requests echo
 * the XSRF-TOKEN cookie back in the X-XSRF-TOKEN header. No token is ever
 * stored in JavaScript-readable storage.
 */

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

const OFFLINE_MESSAGE = 'Cannot reach Orynn. Check your connection and try again.'

export type FieldErrors = Record<string, string[]>

export class ApiError extends Error {
  readonly status: number
  readonly errors: FieldErrors

  constructor(status: number, message: string, errors: FieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }

  /** First validation message for a field, if any. */
  field(name: string): string | undefined {
    return this.errors[name]?.[0]
  }
}

export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
  /** Non-blocking notes, e.g. overlapping schedules (BR-009). */
  warnings?: string[]
  meta?: { current_page: number; last_page: number; per_page: number; total: number }
}

function readCookie(name: string): string | undefined {
  const prefix = `${name}=`
  const entry = document.cookie.split('; ').find((cookie) => cookie.startsWith(prefix))

  return entry ? decodeURIComponent(entry.slice(prefix.length)) : undefined
}

let csrfRequest: Promise<void> | null = null

function ensureCsrfCookie(refresh = false): Promise<void> {
  if (!refresh && readCookie('XSRF-TOKEN')) {
    return Promise.resolve()
  }

  csrfRequest ??= fetch(`${API_URL}/sanctum/csrf-cookie`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
    .then((response) => {
      if (!response.ok) throw new ApiError(response.status, 'Could not start a secure session.')
    })
    .catch((error: unknown) => {
      throw error instanceof ApiError ? error : new ApiError(0, OFFLINE_MESSAGE)
    })
    .finally(() => {
      csrfRequest = null
    })

  return csrfRequest
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

async function request<T>(method: Method, path: string, body?: unknown, retried = false): Promise<ApiEnvelope<T>> {
  if (method !== 'GET') {
    await ensureCsrfCookie()
  }

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const xsrfToken = readCookie('XSRF-TOKEN')
  if (xsrfToken) headers['X-XSRF-TOKEN'] = xsrfToken

  let response: Response
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, OFFLINE_MESSAGE)
  }

  // The CSRF token rotates with the session; fetch a fresh one and retry once.
  if (response.status === 419 && !retried) {
    await ensureCsrfCookie(true)
    return request<T>(method, path, body, true)
  }

  const payload = (await response.json().catch(() => null)) as (Partial<ApiEnvelope<T>> & { errors?: FieldErrors }) | null

  if (!response.ok || !payload?.success) {
    throw new ApiError(response.status, payload?.message ?? 'Something went wrong. Please try again.', payload?.errors ?? {})
  }

  return payload as ApiEnvelope<T>
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown = {}) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: (path: string) => request<null>('DELETE', path),
}
