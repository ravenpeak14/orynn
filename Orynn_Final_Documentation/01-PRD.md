# Orynn — Product Requirements Document

**Version:** 1.2  
**Platform:** Responsive Web / PWA  
**Design Direction:** Mobile-first Timeline + Soft Glassmorphism

---

## 1. Product Vision

Orynn is a personal daily scheduling application designed around one simple question:

> **"What am I doing today, and when?"**

Orynn visualizes a user's day as a chronological timeline and combines two types of schedules:

1. **Weekly Schedule** — recurring routines that happen on specific days of the week.
2. **Daily Schedule** — one-off activities created for a specific date.

The daily timeline resolves both sources into one clear view.

---

## 2. Goals

- Make daily schedules understandable at a glance.
- Make recurring weekly routines easy to configure.
- Make one-off schedule creation fast.
- Show free time naturally between activities.
- Provide reminders for important activities.
- Work comfortably on iPhone and desktop through a responsive PWA.
- Keep the interface calm, minimal, and time-centric.

---

## 3. Target User

Orynn is designed primarily for individuals who need personal time planning:

- Students
- Developers
- Athletes
- Freelancers
- Professionals
- Users with recurring routines

---

## 4. Core Features

### 4.1 Authentication

- Register
- Login
- Logout
- View profile
- Update profile
- Change password

### 4.2 Today / Daily Timeline

The main screen displays:

- Month and selected date
- Horizontal date selector
- Current activity
- Daily activities
- Activity duration
- Activity category
- Reminder status
- Free-time gaps

### 4.3 Weekly Schedule

Users can define recurring activities by weekday.

Example:

```text
Monday
07:00–09:00 Swimming Training
10:00–12:00 University
19:00–21:00 Coding
```

The weekly schedule acts as a reusable template.

### 4.4 Daily Schedule

Users can create one-off activities:

```text
27 September 2026
14:00–15:00 Dentist
```

A daily schedule does not need to belong to a weekly template.

### 4.5 Schedule Override

A recurring schedule can be modified for one specific date.

Examples:

- Skip this occurrence.
- Change the time for this occurrence.
- Change the title/category for this occurrence.

The original weekly template remains unchanged.

### 4.6 Categories

Users can organize activities into categories such as:

- Sport
- University
- Work
- Study
- Personal
- Other

### 4.7 Reminders

Supported reminder values:

- None
- 5 minutes
- 10 minutes
- 15 minutes
- 30 minutes
- 60 minutes before activity

In the MVP, reminders are stored and shown on the timeline. Delivering notifications (Web Push) is part of V1.1 "Better notification support".

### 4.8 Free Time

Free time is calculated from gaps between scheduled activities.

Free-time periods are derived data and are not stored as schedule records.

---

## 5. Schedule Model

Orynn uses:

```text
Weekly Template
       ↓
Date resolution
       ↓
Daily Timeline
       ↑
One-off Schedule
       ↓
Override
```

A recurring schedule should not be copied indefinitely into future dates.

The system resolves the applicable weekly templates when a date is viewed.

---

## 6. Functional Requirements

| ID | Requirement |
|---|---|
| FR-001 | User can register |
| FR-002 | User can login/logout |
| FR-003 | User can manage profile |
| FR-004 | User can view a selected date |
| FR-005 | User can create a one-off schedule |
| FR-006 | User can edit/delete a one-off schedule |
| FR-007 | User can create weekly schedule templates |
| FR-008 | User can edit/delete weekly templates |
| FR-009 | User can assign a category |
| FR-010 | User can configure reminders |
| FR-011 | System resolves weekly templates into the selected date |
| FR-012 | User can override a recurring occurrence |
| FR-013 | System displays schedules chronologically |
| FR-014 | System calculates free-time gaps |
| FR-015 | User can mark an activity completed/cancelled |
| FR-016 | User can use Orynn as a PWA |

---

## 7. Business Rules

### BR-001 Ownership

Every user-owned record belongs to exactly one authenticated user.

### BR-002 Valid Time

`end_time` must be later than `start_time`.

### BR-003 Same-Day Activity

MVP activities start and finish on the same date.

### BR-004 Weekly Template

A weekly template has exactly one weekday.

```text
1 = Monday
2 = Tuesday
3 = Wednesday
4 = Thursday
5 = Friday
6 = Saturday
7 = Sunday
```

These are ISO-8601 weekdays. Weeks start on Monday everywhere in the UI.

### BR-005 Template Resolution

When a date is opened, Orynn finds active templates whose `day_of_week` matches the date.

### BR-006 Override Priority

For a recurring occurrence:

```text
Override > Weekly Template
```

A cancelled occurrence stays visible on the timeline as "Skipped", so it can be restored, but it no longer counts as busy time: it is excluded from free-time and overlap calculations. The same applies to a one-off schedule with status `cancelled`.

A recurring occurrence is marked completed through its override (`status = completed`); the template is never changed.

### BR-007 Manual Schedule

One-off schedules exist independently of weekly templates.

### BR-008 Free Time

Free time is calculated from sorted activities and is not persisted.

### BR-009 Overlap

Overlapping schedules are allowed. The API returns a `warnings` list when a create or update overlaps another activity, and every timeline item carries a `has_conflict` flag.

### BR-010 Timezone

Each user has an IANA timezone (e.g. `Asia/Jakarta`). It decides which date is "today" and what "now" means for the current activity. Schedule times are wall-clock times in that timezone.

---

## 8. MVP Scope

### Included

- Authentication
- Today timeline
- Date selector
- Weekly schedule templates
- One-off schedules
- Schedule overrides
- Categories
- Reminders
- Free-time calculation
- Responsive UI
- PWA
- Basic security

### Excluded

- Google Calendar integration
- Team collaboration
- AI scheduling
- Social features
- Advanced analytics
- Complex project/task management
- Multi-user calendars

---

## 9. Future Roadmap

### V1.1

- Recurring template improvements
- Better notification support
- Weekly overview
- Schedule search

### V1.2

- Calendar integration
- Schedule templates/presets
- Statistics

### V2

- Smart scheduling
- AI-assisted planning
- Advanced analytics

---

## 10. Success Criteria

- A user can create a one-off schedule quickly.
- A user can define a weekly routine once and see it on the correct dates.
- A recurring occurrence can be overridden without changing the weekly template.
- The daily timeline correctly combines recurring and one-off schedules.
- User A cannot access User B's schedule data.
- UI is comfortable on iPhone-sized screens and scales to desktop.
