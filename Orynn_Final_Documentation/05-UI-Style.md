# Orynn — UI Style Guide

**Version:** 1.2  
**Design Direction:** Mobile-first Timeline + Soft Glassmorphism

---

# 1. Design Philosophy

Orynn should feel like:

> **A calm digital pocket planner focused on time.**

The interface should prioritize:

1. Time
2. Current activity
3. Daily flow
4. Recurring routine
5. Fast interaction

Avoid turning Orynn into a generic productivity dashboard.

---

# 2. Primary Visual Reference

The core layout is a vertical daily timeline:

```text
07:00   ●
        │
        │  Swimming Training
        │  07:00 — 09:00
        │
09:00   ●
        │
        ┄  FREE TIME
        │
10:00   ●
        │
        │  University
        │  10:00 — 12:00
```

The timeline is the main identity of Orynn.

---

# 3. Mobile-First Rule

Design at mobile width first.

Primary target:

```text
iPhone-sized viewport
```

Desktop is an expansion of the mobile experience, not a separate product.

Minimum considerations:

- Comfortable touch targets
- Bottom navigation
- Floating action button
- One-handed interaction
- Vertical scrolling
- No hover-dependent core actions

---

# 4. Main Screen Structure

```text
┌──────────────────────────┐
│ Header                   │
│ Month / controls         │
├──────────────────────────┤
│ Date selector            │
├──────────────────────────┤
│                          │
│ Daily timeline           │
│                          │
│ 07:00 ● Activity         │
│       │                  │
│ 09:00 ┄ Free time        │
│       │                  │
│ 10:00 ● Activity         │
│                          │
├──────────────────────────┤
│ Bottom navigation        │
└──────────────────────────┘
```

---

# 5. Navigation

Recommended mobile navigation:

```text
Today
Weekly
Settings
```

The date selector lives directly inside Today.

Calendar does not need to be a separate primary navigation item because date navigation is integrated into the Today experience.

---

# 6. Today Screen

### Header

```text
September
2026
```

Use a compact header.

### Date Selector

Horizontal date selector:

```text
Mon  Tue  Wed  Thu  Fri  Sat  Sun
28   29   30    1    2    3    4
```

Weeks start on Monday, matching the Weekly screen and the API's ISO weekdays.

Selected date uses a soft filled/outlined pill. Today is marked with a small accent dot.

---

# 7. Timeline

Each activity contains:

```text
Time
Timeline node
Title
Time range
Category
Optional reminder/status
```

Example:

```text
07:00   ●   Swimming Training
            07:00 — 09:00
            Sport
```

Use a continuous vertical line to communicate chronology.

---

# 8. Current Activity

The currently active schedule may receive stronger visual emphasis.

Example:

```text
┌─────────────────────────┐
│ NOW                     │
│                         │
│ Coding                  │
│ 19:00 — 21:00           │
│                         │
│ █████████░░░░           │
│ 1h 12m remaining        │
└─────────────────────────┘
```

The progress indicator represents the current position in time.

It is not time tracking.

---

# 9. Weekly Schedule Screen

Weekly is the configuration area for recurring routines.

Example:

```text
Weekly Schedule

MON   TUE   WED   THU   FRI   SAT   SUN

MONDAY

07:00
Swimming Training
07:00 — 09:00

10:00
University
10:00 — 12:00

19:00
Coding
19:00 — 21:00
```

The user edits the recurring template here.

---

# 10. Glassmorphism Rules

Glassmorphism is a supporting visual language, not the entire UI.

### Use glass for:

- Selected date
- Current activity
- Bottom sheets
- Floating action button
- Important interactive surfaces

### Avoid:

- Making every activity a large glass card.
- Excessive blur.
- Excessive transparency.
- Low-contrast text.
- Glass over visually noisy backgrounds.

Principle:

> **Timeline first, glass second.**

---

# 11. Color System

Base:

```text
Background       #F7F7F5
Text             #181818
Secondary Text   #6F6F6F
Border           rgba(0,0,0,0.08)
Glass Surface    rgba(255,255,255,0.55)
```

Primary accent:

```text
Purple           #7567E8   (fills, dots, rings, FAB)
Purple Strong    #6557D8   (accent text and filled buttons)
Purple Soft      #EEEBFD   (selected chips and navigation)
```

Contrast notes: secondary text was darkened from #777777 to #6F6F6F to reach 4.5:1 on the background. White text on #7567E8 is about 4.2:1, so buttons with text use the stronger purple (about 5.4:1).

Category accents should be soft/pastel.

Example:

```text
Sport       Green
University  Blue
Work        Orange
Study       Purple
Personal    Pink
Other       Gray
```

Do not use highly saturated colors for large surfaces.

---

# 12. Typography

Recommended:

```text
Inter
```

Hierarchy:

```text
Page title       24–28px
Section title    18–20px
Activity title   16–18px
Time             13–14px
Metadata         12–13px
```

Use font weight to create hierarchy rather than excessive color.

---

# 13. Spacing

Use a consistent 4px-based spacing scale:

```text
4
8
12
16
20
24
32
```

Avoid arbitrary spacing values unless necessary.

---

# 14. Radius

Recommended:

```text
Small       8px
Medium      14px
Large       20px
BottomSheet 28px
FAB         999px
```

The overall interface should feel rounded but not cartoonish.

---

# 15. Shadows

Use soft shadows only.

Avoid:

```text
heavy black shadows
```

Preferred visual hierarchy:

```text
subtle border
+
subtle shadow
+
optional blur
```

---

# 16. Floating Action Button

The primary create action is a floating `+`.

```text
        ╭─────╮
        │  +  │
        ╰─────╯
```

The FAB should be:

- Circular
- Easy to reach
- Visually prominent
- Consistent across Today and Weekly where creation is relevant

---

# 17. Create Schedule UI

Prefer a mobile bottom sheet.

Fields:

```text
Activity
Date
Start time
End time
Category
Reminder
Description
```

Primary action:

```text
Save Schedule
```

Do not force the user through multiple screens for a simple schedule.

---

# 18. Empty State

Use human language.

Instead of:

```text
No data found.
```

Use:

```text
Nothing planned.

Your day is wide open.

+ Add schedule
```

---

# 19. Interaction Principles

### Tap

Open detail.

### Swipe date

Move to previous/next date where appropriate.

### Floating +

Create.

### Long press

Optional future shortcut for edit/delete.

Core actions must never depend on gestures alone.

---

# 20. Responsive Behavior

### Mobile

```text
Single column
Bottom navigation
Floating action button
Vertical timeline
```

### Tablet

```text
Single primary timeline
More horizontal breathing room
```

### Desktop

```text
Sidebar navigation
Centered timeline/content
Larger date selector
```

The visual language remains identical.

---

# 21. Component Naming

Recommended React component structure:

```text
OrynnApp
├── AppShell
├── TopBar
├── DateSelector
├── Timeline
│   ├── TimelineItem
│   ├── TimelineNode
│   └── FreeTimeBlock
├── CurrentActivity
├── FloatingActionButton
├── BottomNavigation
├── ScheduleSheet
├── ScheduleDetail
└── WeeklySchedule
```

---

# 22. Design Tokens

Frontend should centralize:

- Colors
- Typography
- Radius
- Spacing
- Shadows
- Glass blur
- Animation duration

This prevents each component from inventing its own visual style.

---

# 23. Animation

Animations should be subtle.

Good:

```text
150–250ms
```

Use for:

- Bottom sheet
- Date selection
- FAB interaction
- Current activity state

Avoid excessive animation on every timeline item.

---

# 24. Accessibility

- Minimum comfortable touch target.
- Semantic buttons.
- Form labels.
- Keyboard support on desktop.
- Sufficient text contrast.
- Do not communicate status through color alone.

---

# 25. UI Golden Rule

> **Orynn should show the user's day, not show off the interface.**

The timeline and schedule remain the primary content.

Glassmorphism, gradients, icons, shadows, and animations support the timeline rather than competing with it.
