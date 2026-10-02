# Orynn — API Specification

**Version:** 1.2  
**Backend:** Laravel REST API  
**Format:** JSON  
**Authentication:** Laravel Sanctum (SPA cookie mode)

---

## 1. Base URL

Development:

```text
http://localhost:8000/api
```

Production:

```text
https://api.example.com/api
```

Production must use HTTPS.

---

## 2. Standard Response

Success:

```json
{
  "success": true,
  "message": "Request successful.",
  "data": {}
}
```

Validation/error:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {}
}
```

Optional top-level keys on success:

- `warnings`: non-blocking notes, e.g. `["Overlaps with Gym (16:00–17:30)."]` (BR-009).
- `meta`: pagination (`current_page`, `last_page`, `per_page`, `total`) for `GET /schedules` and `GET /schedule-overrides`, which accept `per_page` (1–100, default 50).

Error messages never expose internals. Common statuses: `401` unauthenticated, `404` not found (also for records owned by another user), `419` expired CSRF token, `422` validation, `429` rate limited.

---

## 3. Authentication

Orynn uses Sanctum's SPA mode: the session lives in an HttpOnly cookie, and no token is stored in JavaScript.

1. `GET /sanctum/csrf-cookie` (outside `/api`) sets the `XSRF-TOKEN` cookie.
2. Every `POST`, `PUT`, `PATCH` and `DELETE` sends that value back in the `X-XSRF-TOKEN` header.
3. Requests must come from a stateful frontend domain (`SANCTUM_STATEFUL_DOMAINS`) and include credentials.

### POST /register

Create an account, sign in, and create the default categories (Sport, University, Work, Study, Personal, Other).

```json
{
  "name": "Samuel",
  "email": "samuel@example.com",
  "password": "StrongPassword123!",
  "password_confirmation": "StrongPassword123!",
  "timezone": "Asia/Jakarta"
}
```

`timezone` is optional (default `UTC`); the frontend sends the device timezone.

### POST /login

```json
{
  "email": "samuel@example.com",
  "password": "StrongPassword123!",
  "remember": true
}
```

### POST /logout

**Auth:** Required. Invalidates the session and rotates the CSRF token.

### GET /me

**Auth:** Required

```json
{ "id": 1, "name": "Samuel", "email": "samuel@example.com", "timezone": "Asia/Jakarta", "created_at": "2026-09-28T09:32:45+00:00" }
```

### PUT /me

Update profile: `name`, `email`, `timezone`.

### PUT /me/password

Change password: `current_password`, `password`, `password_confirmation`. Other sessions and "remember me" cookies are signed out.

---

# 4. Dashboard / Timeline

## GET /timeline

Return the resolved timeline for a date.

Query:

```text
GET /api/timeline?date=2026-09-28
```

`date` is optional; without it, the API uses today in the user's timezone.

Response:

```json
{
  "success": true,
  "message": "Request successful.",
  "data": {
    "date": "2026-09-28",
    "day_of_week": 1,
    "schedules": [
      {
        "key": "template-3-2026-09-28",
        "source": "weekly_template",
        "schedule_id": null,
        "template_id": 3,
        "override_id": null,
        "is_modified": false,
        "title": "Swimming Training",
        "description": "Sprint training",
        "date": "2026-09-28",
        "start_time": "07:00",
        "end_time": "09:00",
        "duration_minutes": 120,
        "status": "scheduled",
        "reminder_minutes": 15,
        "category": { "id": 1, "name": "Sport", "icon": "activity", "color": "green" },
        "has_conflict": false
      },
      {
        "key": "schedule-20",
        "source": "manual",
        "schedule_id": 20,
        "template_id": null,
        "override_id": null,
        "is_modified": false,
        "title": "Dentist",
        "description": "Routine checkup",
        "date": "2026-09-28",
        "start_time": "14:00",
        "end_time": "15:00",
        "duration_minutes": 60,
        "status": "scheduled",
        "reminder_minutes": 30,
        "category": { "id": 4, "name": "Personal", "icon": "heart", "color": "pink" },
        "has_conflict": false
      }
    ],
    "free_time": [
      {
        "start_time": "09:00",
        "end_time": "14:00",
        "duration_minutes": 300
      }
    ]
  }
}
```

Item fields:

| Field | Meaning |
|---|---|
| `key` | Stable identifier: `schedule-{id}` or `template-{template_id}-{date}` (occurrences are not stored) |
| `schedule_id` | Set for one-off schedules; use it with `/schedules/{id}` |
| `template_id` | Set for weekly occurrences |
| `override_id` | The occurrence's override, if any; use it with `/schedule-overrides/{id}` |
| `is_modified` | The override changes title, time, category, reminder or description |
| `status` | `scheduled`, `completed` or `cancelled` (a cancelled occurrence is shown as skipped) |
| `has_conflict` | Overlaps another non-cancelled item |

Free time is calculated from non-cancelled items only, between the first and last activity.

The timeline endpoint is the main endpoint consumed by the Today screen.

---

# 5. Daily Schedules

## GET /schedules

Query:

```text
date=2026-09-28
status=scheduled
category_id=1
```

## GET /schedules/{id}

Get a stored one-off schedule.

## POST /schedules

Create a one-off schedule.

```json
{
  "title": "Dentist",
  "description": "Routine checkup",
  "date": "2026-09-28",
  "start_time": "14:00",
  "end_time": "15:00",
  "category_id": 4,
  "reminder_minutes": 30
}
```

## PUT /schedules/{id}

Update a one-off schedule.

## DELETE /schedules/{id}

Delete a one-off schedule.

## PATCH /schedules/{id}/status

```json
{
  "status": "completed"
}
```

Allowed:

```text
scheduled
completed
cancelled
```

---

# 6. Weekly Schedule Templates

## GET /schedule-templates

Optional filter:

```text
day_of_week=1
```

## GET /schedule-templates/{id}

Get a template.

## POST /schedule-templates

```json
{
  "title": "Swimming Training",
  "description": "Sprint training",
  "day_of_week": 1,
  "start_time": "07:00",
  "end_time": "09:00",
  "category_id": 1,
  "reminder_minutes": 15,
  "is_active": true
}
```

## PUT /schedule-templates/{id}

Update template.

## DELETE /schedule-templates/{id}

Delete template.

---

# 7. Schedule Overrides

An override changes a recurring occurrence on one specific date without modifying its weekly template.

## GET /schedule-overrides

Query:

```text
date=2026-09-28
```

## POST /schedule-overrides

Example: cancel Monday's recurring swimming.

```json
{
  "schedule_template_id": 3,
  "date": "2026-09-28",
  "action": "cancel"
}
```

Example: move it.

```json
{
  "schedule_template_id": 3,
  "date": "2026-09-28",
  "action": "modify",
  "title": "Swimming Training",
  "start_time": "08:00",
  "end_time": "10:00",
  "category_id": 1
}
```

Example: mark this occurrence as done.

```json
{
  "schedule_template_id": 3,
  "date": "2026-09-28",
  "action": "modify",
  "status": "completed"
}
```

Allowed actions:

```text
cancel
modify
```

Rules:

- Fields left out or `null` inherit from the template.
- `reminder_minutes: 0` switches off a reminder inherited from the template.
- `status` is `scheduled` or `completed`; cancelling is done with `action: cancel`.
- `date` must fall on the template's weekday, and each occurrence can have only one override.
- The final start and end times (override value, else template value) must still form a valid range.

## PUT/PATCH /schedule-overrides/{id}

Partial update: only the fields that are sent change. The template and date of an override cannot be changed.

## DELETE /schedule-overrides/{id}

Remove override and restore normal template behavior.

---

# 8. Categories

## GET /categories

## POST /categories

```json
{
  "name": "Sport",
  "icon": "activity",
  "color": "green"
}
```

`name` is unique per user. `color` is a UI token: `gray`, `green`, `blue`, `orange`, `purple`, `pink`, `red`, `yellow`, `teal`. `icon` is a lowercase identifier such as `activity` or `book-open`.

## PUT /categories/{id}

## DELETE /categories/{id}

---

# 9. Route Summary

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | /register | No | Register |
| POST | /login | No | Login |
| POST | /logout | Yes | Logout |
| GET | /me | Yes | Current user |
| PUT | /me | Yes | Update profile |
| PUT | /me/password | Yes | Change password |
| GET | /timeline | Yes | Resolved daily timeline |
| GET | /schedules | Yes | One-off schedules |
| POST | /schedules | Yes | Create one-off |
| GET | /schedules/{id} | Yes | Detail |
| PUT | /schedules/{id} | Yes | Update |
| DELETE | /schedules/{id} | Yes | Delete |
| PATCH | /schedules/{id}/status | Yes | Status |
| GET | /schedule-templates | Yes | Weekly templates |
| POST | /schedule-templates | Yes | Create template |
| GET | /schedule-templates/{id} | Yes | Template detail |
| PUT | /schedule-templates/{id} | Yes | Update |
| DELETE | /schedule-templates/{id} | Yes | Delete |
| GET | /schedule-overrides | Yes | Overrides |
| POST | /schedule-overrides | Yes | Create override |
| PUT | /schedule-overrides/{id} | Yes | Update |
| DELETE | /schedule-overrides/{id} | Yes | Remove override |
| GET | /categories | Yes | Categories |
| POST | /categories | Yes | Create category |
| PUT | /categories/{id} | Yes | Update category |
| DELETE | /categories/{id} | Yes | Delete category |

---

# 10. Validation

"owned" means the row must exist **and** belong to the authenticated user; another user's ID fails validation exactly like a missing ID.

### Schedule

```text
title             required|string|max:255
description       nullable|string|max:2000
date              required|date_format:Y-m-d
start_time        required|date_format:H:i
end_time          required|date_format:H:i|after:start_time
category_id       nullable|integer|owned(categories)
reminder_minutes  nullable|in:0,5,10,15,30,60   (0 is stored as null)
```

### Template

```text
title             required|string|max:255
description       nullable|string|max:2000
day_of_week       required|integer|between:1,7
start_time        required|date_format:H:i
end_time          required|date_format:H:i|after:start_time
category_id       nullable|integer|owned(categories)
reminder_minutes  nullable|in:0,5,10,15,30,60   (0 is stored as null)
is_active         boolean
```

### Override

```text
schedule_template_id required|integer|owned(schedule_templates)   (create only)
date                 required|date_format:Y-m-d                    (create only)
action               required|in:cancel,modify                     (optional on update)
status               in:scheduled,completed
title                nullable|string|max:255
description          nullable|string|max:2000
category_id          nullable|integer|owned(categories)
start_time           nullable|date_format:H:i
end_time             nullable|date_format:H:i
reminder_minutes     nullable|in:0,5,10,15,30,60

date must match the template's day_of_week
one override per (template, date)
final end_time > final start_time
```

---

# 11. Authorization

Every protected resource must be scoped to the authenticated user.

Never accept `user_id` as trusted ownership input.

Example:

```php
Schedule::where('user_id', auth()->id())
    ->findOrFail($id);
```

The same principle applies to templates, overrides, and categories.
