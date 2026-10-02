# Orynn — Database Schema

**Version:** 1.2  
**Database:** MySQL  
**ORM:** Laravel Eloquent

---

# 1. Entity Overview

```text
users
 ├── categories
 ├── schedules
 ├── schedule_templates
 └── schedule_overrides
          │
          └── schedule_templates
```

Core tables:

```text
users
categories
schedules
schedule_templates
schedule_overrides
personal_access_tokens
```

---

# 2. users

| Column | Type | Key | Description |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK | User ID |
| name | VARCHAR(255) | | Name |
| email | VARCHAR(255) | UNIQUE | Email |
| email_verified_at | TIMESTAMP NULL | | Verification |
| password | VARCHAR(255) | | Hashed password |
| timezone | VARCHAR(64) | | IANA timezone, default `UTC` (BR-010) |
| remember_token | VARCHAR(100) NULL | | Laravel token |
| created_at | TIMESTAMP NULL | | Created |
| updated_at | TIMESTAMP NULL | | Updated |

---

# 3. categories

| Column | Type | Key | Description |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK | Category ID |
| user_id | BIGINT UNSIGNED | FK | Owner |
| name | VARCHAR(100) | | Category name |
| icon | VARCHAR(100) NULL | | Icon identifier |
| color | VARCHAR(50) NULL | | UI color token |
| created_at | TIMESTAMP NULL | | Created |
| updated_at | TIMESTAMP NULL | | Updated |

Relations:

```text
categories.user_id → users.id
```

Unique:

```text
UNIQUE(user_id, name)
```

Delete:

```text
user deleted → CASCADE
```

---

# 4. schedule_templates

Stores recurring weekly routines.

| Column | Type | Key | Description |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK | Template ID |
| user_id | BIGINT UNSIGNED | FK | Owner |
| category_id | BIGINT UNSIGNED NULL | FK | Category |
| title | VARCHAR(255) | | Activity title |
| description | TEXT NULL | | Description |
| day_of_week | TINYINT UNSIGNED | INDEX | 1–7 |
| start_time | TIME | | Start |
| end_time | TIME | | End |
| reminder_minutes | SMALLINT UNSIGNED NULL | | Reminder |
| is_active | BOOLEAN | INDEX | Active flag |
| created_at | TIMESTAMP NULL | | Created |
| updated_at | TIMESTAMP NULL | | Updated |

Relations:

```text
schedule_templates.user_id
→ users.id

schedule_templates.category_id
→ categories.id
```

Recommended deletes:

```text
user → CASCADE
category → SET NULL
```

---

# 5. schedules

Stores one-off daily schedules.

| Column | Type | Key | Description |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK | Schedule ID |
| user_id | BIGINT UNSIGNED | FK | Owner |
| category_id | BIGINT UNSIGNED NULL | FK | Category |
| title | VARCHAR(255) | | Activity |
| description | TEXT NULL | | Description |
| date | DATE | INDEX | Date |
| start_time | TIME | | Start |
| end_time | TIME | | End |
| reminder_minutes | SMALLINT UNSIGNED NULL | | Reminder |
| status | VARCHAR(20) | INDEX | Status |
| created_at | TIMESTAMP NULL | | Created |
| updated_at | TIMESTAMP NULL | | Updated |

Allowed status:

```text
scheduled
completed
cancelled
```

Important:

A schedule is a **one-off activity**. Recurring weekly behavior is stored in `schedule_templates`.

---

# 6. schedule_overrides

Stores exceptions to weekly templates.

| Column | Type | Key | Description |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK | Override ID |
| user_id | BIGINT UNSIGNED | FK | Owner |
| schedule_template_id | BIGINT UNSIGNED | FK | Template |
| date | DATE | INDEX | Occurrence date |
| action | VARCHAR(20) | | cancel/modify |
| status | VARCHAR(20) | | scheduled/completed for this occurrence, default `scheduled` |
| title | VARCHAR(255) NULL | | Modified title |
| description | TEXT NULL | | Modified description |
| category_id | BIGINT UNSIGNED NULL | FK | Modified category |
| start_time | TIME NULL | | Modified start |
| end_time | TIME NULL | | Modified end |
| reminder_minutes | SMALLINT UNSIGNED NULL | | Modified reminder |
| created_at | TIMESTAMP NULL | | Created |
| updated_at | TIMESTAMP NULL | | Updated |

Allowed:

```text
action:
cancel
modify

status:
scheduled
completed
```

Nullable fields mean "inherit from the template". `reminder_minutes = 0` explicitly switches off the template's reminder for that date.

Relations:

```text
schedule_overrides.user_id
→ users.id

schedule_overrides.schedule_template_id
→ schedule_templates.id

schedule_overrides.category_id
→ categories.id
```

Recommended deletes:

```text
template deleted → CASCADE overrides
category deleted → SET NULL
user deleted → CASCADE
```

Recommended unique constraint:

```text
UNIQUE(user_id, schedule_template_id, date)
```

This prevents duplicate overrides for the same occurrence.

---

# 7. sessions and personal_access_tokens

`sessions` (Laravel standard) stores the SPA login sessions, because Orynn uses Sanctum's cookie mode.

`personal_access_tokens` (Sanctum standard) is created but unused in the MVP; it is kept for future non-browser clients.

---

# 8. ERD

```text
┌───────────────┐
│     users     │
└───────┬───────┘
        │
        ├──────────────┐
        │              │
        ▼              ▼
┌───────────────┐ ┌─────────────────────┐
│  categories   │ │ schedule_templates  │
└───────┬───────┘ └──────────┬──────────┘
        │                    │
        │                    │
        │             ┌──────▼────────────┐
        │             │ schedule_overrides│
        │             └───────────────────┘
        │
        └──────────────┐
                       ▼
                ┌─────────────┐
                │  schedules  │
                └─────────────┘
```

---

# 9. Timeline Resolution

For a selected date:

```text
date = 2026-09-28
day_of_week = Monday
        │
        ▼
Find active schedule_templates
where day_of_week = 1
        │
        ▼
Find overrides for 2026-09-28
        │
        ▼
Apply override
(fields, completed status, cancel)
        │
        ▼
Add one-off schedules
        │
        ▼
Sort by start_time
        │
        ▼
Flag overlaps, then calculate
free-time gaps (cancelled excluded)
        │
        ▼
Return Timeline
```

---

# 10. Indexes

Recommended:

```sql
INDEX schedules_user_date
ON schedules(user_id, date);

INDEX templates_user_day
ON schedule_templates(user_id, day_of_week);

INDEX templates_user_active
ON schedule_templates(user_id, is_active);

INDEX overrides_user_date
ON schedule_overrides(user_id, date);

UNIQUE overrides_occurrence
ON schedule_overrides(user_id, schedule_template_id, date);
```

---

# 11. Free Time

Free time is derived and never stored.

Example:

```text
07:00–09:00 Swimming
10:00–12:00 University
19:00–21:00 Coding
```

Result:

```text
09:00–10:00 Free
12:00–19:00 Free
```

---

# 12. Migration Order

```text
1. users
2. personal_access_tokens
3. categories
4. schedule_templates
5. schedules
6. schedule_overrides
```
