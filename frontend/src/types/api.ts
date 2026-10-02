/** Shapes returned by the Orynn API (see 02-API-Spec.md). */

export type ScheduleStatus = 'scheduled' | 'completed' | 'cancelled'

export type CategoryColor = 'gray' | 'green' | 'blue' | 'orange' | 'purple' | 'pink' | 'red' | 'yellow' | 'teal'

export interface User {
  id: number
  name: string
  email: string
  timezone: string
  created_at: string | null
}

export interface Category {
  id: number
  name: string
  icon: string | null
  color: CategoryColor | null
}

export interface Schedule {
  id: number
  title: string
  description: string | null
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  status: ScheduleStatus
  reminder_minutes: number | null
  category_id: number | null
  category?: Category | null
}

export interface ScheduleTemplate {
  id: number
  title: string
  description: string | null
  /** ISO weekday: 1 = Monday ... 7 = Sunday. */
  day_of_week: number
  start_time: string
  end_time: string
  duration_minutes: number
  reminder_minutes: number | null
  is_active: boolean
  category_id: number | null
  category?: Category | null
}

export interface ScheduleOverride {
  id: number
  schedule_template_id: number
  date: string
  action: 'cancel' | 'modify'
  status: 'scheduled' | 'completed'
  title: string | null
  description: string | null
  start_time: string | null
  end_time: string | null
  reminder_minutes: number | null
  category_id: number | null
  category?: Category | null
}

interface TimelineItemBase {
  /** Stable key: "schedule-{id}" or "template-{id}-{date}". */
  key: string
  is_modified: boolean
  title: string
  description: string | null
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  status: ScheduleStatus
  reminder_minutes: number | null
  category: Category | null
  has_conflict: boolean
}

/** A one-off schedule. */
export interface ManualTimelineItem extends TimelineItemBase {
  source: 'manual'
  schedule_id: number
  template_id: null
  override_id: null
}

/** One occurrence of a weekly template, with its override applied. */
export interface RecurringTimelineItem extends TimelineItemBase {
  source: 'weekly_template'
  schedule_id: null
  template_id: number
  override_id: number | null
}

export type TimelineItem = ManualTimelineItem | RecurringTimelineItem

export interface FreeTime {
  start_time: string
  end_time: string
  duration_minutes: number
}

export interface Timeline {
  date: string
  day_of_week: number
  schedules: TimelineItem[]
  free_time: FreeTime[]
}

export interface ScheduleInput {
  title: string
  description: string | null
  date: string
  start_time: string
  end_time: string
  category_id: number | null
  reminder_minutes: number | null
}

export interface TemplateInput {
  title: string
  description: string | null
  day_of_week: number
  start_time: string
  end_time: string
  category_id: number | null
  reminder_minutes: number | null
  is_active: boolean
}

/** Null fields inherit from the template; reminder_minutes 0 switches a reminder off. */
export interface OverrideInput {
  schedule_template_id?: number
  date?: string
  action?: 'cancel' | 'modify'
  status?: 'scheduled' | 'completed'
  title?: string | null
  description?: string | null
  category_id?: number | null
  start_time?: string | null
  end_time?: string | null
  reminder_minutes?: number | null
}

export interface CategoryInput {
  name: string
  icon: string | null
  color: CategoryColor | null
}
