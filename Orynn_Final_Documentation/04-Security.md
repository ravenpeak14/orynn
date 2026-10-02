# Orynn — Security Specification

**Version:** 1.2

---

## 1. Security Objectives

Orynn must protect:

- Account credentials
- Personal schedules
- Recurring routines
- Profile data
- Authentication credentials

Primary principle:

> **Never trust the client.**

React is responsible for UX. Laravel is the security boundary.

---

# 2. Authentication

Use Laravel Sanctum.

Protected endpoints:

```text
/timeline
/schedules/*
/schedule-templates/*
/schedule-overrides/*
/categories/*
/me
```

Public endpoints:

```text
/register
/login
```

Selected mode: **Sanctum SPA cookie authentication.** The session is an HttpOnly cookie, so no token is readable by JavaScript or kept in `localStorage`.

Logout invalidates the session and rotates the CSRF token. Changing the password signs out other sessions and "remember me" cookies.

Session lifetime: 120 minutes of inactivity; "Keep me signed in" uses Laravel's remember cookie.

---

# 3. Authorization / Ownership

Every user-owned query must be scoped to the authenticated user.

Bad:

```php
Schedule::findOrFail($id);
```

Preferred:

```php
Schedule::where('user_id', auth()->id())
    ->findOrFail($id);
```

Apply this to:

- schedules
- schedule_templates
- schedule_overrides
- categories

Never trust `user_id` supplied by the frontend.

Foreign keys in request bodies (`category_id`, `schedule_template_id`) are validated the same way: they must exist **and** belong to the authenticated user.

```php
Rule::exists('categories', 'id')->where('user_id', $this->user()->id)
```

---

# 4. IDOR / BOLA Protection

User A must never access User B's resources by changing an ID.

Example:

```text
GET /api/schedules/123
```

If schedule 123 belongs to another user:

```text
Expected: denied / not found
```

Test GET, PUT, PATCH, and DELETE.

---

# 5. Password Security

Use Laravel's password hashing:

```php
Hash::make($password);
```

Never use:

```text
MD5
SHA1
plaintext storage
```

Never log or return passwords.

---

# 6. Validation

All input must be validated server-side.

Examples:

```text
title             required|string|max:255
date              required|date
start_time        required|date_format:H:i
end_time          required|date_format:H:i|after:start_time
day_of_week       integer|between:1,7
reminder_minutes  in:0,5,10,15,30,60
```

Frontend validation is for UX only.

---

# 7. Mass Assignment

Use Laravel `$fillable` or `$guarded`.

Do not include:

```text
user_id
```

as a trusted client field.

Assign ownership server-side:

```php
$data['user_id'] = auth()->id();
```

---

# 8. SQL Injection

Prefer:

- Eloquent
- Query Builder
- Parameter binding

Avoid constructing SQL with raw user input.

---

# 9. XSS

React escapes normal rendered text.

Do not use `dangerouslySetInnerHTML` for untrusted schedule content unless content is sanitized first.

User-controlled fields include:

```text
title
description
category name
```

---

# 10. CSRF

Orynn uses Sanctum SPA cookie authentication:

- The SPA calls `GET /sanctum/csrf-cookie` and echoes the `XSRF-TOKEN` cookie in the `X-XSRF-TOKEN` header on every state-changing request.
- Requests without a valid token receive `419`.
- `SANCTUM_STATEFUL_DOMAINS` lists only the official frontend domain.
- The frontend must send a `Referer`/`Origin` header (keep its `Referrer-Policy` at `strict-origin-when-cross-origin`, not `no-referrer`), because Sanctum uses it to recognise the SPA.

---

# 11. Token Security

Never send authentication tokens through:

```text
URL query parameters
```

Never log tokens.

Production authentication must use HTTPS.

Token/session lifetime and revocation policy should be defined during implementation.

---

# 12. Rate Limiting

Apply stricter limits to:

```text
POST /login
POST /register
```

Also rate-limit authenticated API traffic.

Expected abuse response:

```text
429 Too Many Requests
```

---

# 13. CORS

Production API should only allow the official Orynn frontend origin.

Example:

```text
https://orynn.example.com
```

Avoid unrestricted authenticated CORS:

```text
*
```

---

# 14. HTTPS

Production must use HTTPS.

Protects:

- Login credentials
- Sessions/tokens
- Schedule data
- Profile data

Enable HSTS after HTTPS is correctly configured.

---

# 15. Secrets

Never commit:

```text
.env
```

Use:

```text
.env.example
```

without secrets.

Production secrets include:

```text
APP_KEY
DB_PASSWORD
authentication secrets
third-party credentials
```

---

# 16. Laravel Production Configuration

Production:

```env
APP_ENV=production
APP_DEBUG=false
```

Never expose:

- stack traces
- SQL errors
- environment variables
- credentials

---

# 17. Database Security

MySQL should:

- Not be publicly exposed unless required.
- Use a dedicated application database user.
- Use a strong password.
- Grant only required privileges.
- Have regular backups.

---

# 18. PWA Security

Service worker caching must not accidentally cache sensitive authenticated API responses.

Safe candidates:

```text
static JS
CSS
images
fonts
public assets
```

Review carefully:

```text
private API responses
authentication responses
profile data
schedule data
```

Production PWA requires HTTPS.

---

# 19. Security Headers

Recommended production headers:

```text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
```

Test CSP against the actual PWA before enforcing a strict policy.

---

# 20. Logging

Log:

- Authentication failures
- Important server errors
- Suspicious authorization attempts
- Rate-limit events

Never log:

- Passwords
- Tokens
- API secrets

---

# 21. Backup

Production database should have automated backups.

Recommended baseline:

```text
Daily backup
```

Prefer storing backups separately from the primary application server.

---

# 22. Security Testing

### Unauthorized Access

```text
No token
→ protected endpoint
→ 401
```

### Cross-user Access

```text
User A
→ User B resource
→ denied
```

### Invalid Time

```text
20:00 → 18:00
→ 422
```

### XSS

```html
<script>alert(1)</script>
```

Must render as text, not execute.

### Rate Limit

Repeated login attempts must eventually receive:

```text
429
```

---

# 23. Security Checklist

## Authentication

- [ ] Password hashing
- [ ] Protected routes
- [ ] Login rate limiting
- [ ] Logout/revocation
- [ ] HTTPS

## Authorization

- [ ] User ownership enforced
- [ ] IDOR/BOLA tested
- [ ] `user_id` never trusted from client
- [ ] Templates protected
- [ ] Overrides protected

## API

- [ ] Backend validation
- [ ] CORS restricted
- [ ] Rate limiting
- [ ] Generic production errors

## Frontend/PWA

- [ ] No secrets in frontend bundle
- [ ] No unsafe HTML rendering
- [ ] Sensitive API caching reviewed
- [ ] HTTPS

## Infrastructure

- [ ] `.env` ignored
- [ ] `APP_DEBUG=false`
- [ ] Database access restricted
- [ ] Backups configured
- [ ] Dependencies audited
