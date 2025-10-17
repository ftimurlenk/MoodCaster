export type TaskKey = 'checkin' | 'generate' | 'post' | 'bonus3'

export type TaskDef = {
  key: TaskKey
  title: string
  points: number
  desc?: string
}

export const TASKS: TaskDef[] = [
  { key: 'checkin',  title: 'Daily check-in', points: 5,  desc: 'Open the app and check in' },
  { key: 'generate', title: 'Generate a cast', points: 10, desc: 'Create an AI draft' },
  { key: 'post',     title: 'Post a cast',     points: 20, desc: 'Share to Farcaster' },
  { key: 'bonus3',   title: '3 casts in a day',points: 25, desc: 'Post 3 casts today' },
]

const LS_NS = 'moodcaster.tasks.v1'

export type DayProgress = {
  done: Record<TaskKey, boolean>
  postedCount: number
}

export type AllProgress = {
  days: Record<string, DayProgress>
}

export const todayKey = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const loadAll = (): AllProgress => {
  try {
    const raw = localStorage.getItem(LS_NS)
    if (!raw) return { days: {} }
    return JSON.parse(raw)
  } catch {
    return { days: {} }
  }
}

export const saveAll = (data: AllProgress) => {
  localStorage.setItem(LS_NS, JSON.stringify(data))
}

export const ensureToday = (): { all: AllProgress; day: DayProgress } => {
  const all = loadAll()
  const key = todayKey()
  if (!all.days[key]) {
    all.days[key] = { done: { checkin:false, generate:false, post:false, bonus3:false }, postedCount: 0 }
    saveAll(all)
  }
  return { all, day: all.days[key] }
}

export const markDone = (t: TaskKey) => {
  const { all, day } = ensureToday()
  day.done[t] = true
  if (t === 'post' && day.postedCount >= 3) {
    day.done.bonus3 = true
  }
  saveAll(all)
}

export const incPosted = () => {
  const { all, day } = ensureToday()
  day.postedCount += 1
  if (day.postedCount >= 3) {
    day.done.bonus3 = true
  }
  saveAll(all)
}

export const getTodayPoints = (): number => {
  const { day } = ensureToday()
  return TASKS.reduce((sum, t) => sum + (day.done[t.key] ? t.points : 0), 0)
}

export const getTotalPoints = (): number => {
  const all = loadAll()
  let total = 0
  for (const key of Object.keys(all.days)) {
    const d = all.days[key]
    total += TASKS.reduce((sum, t) => sum + (d.done[t.key] ? t.points : 0), 0)
  }
  return total
}

export const getStreak = (): number => {
  const all = loadAll()
  const keys = Object.keys(all.days).sort()
  if (!keys.length) return 0
  let streak = 0
  const hasAny = (k: string) => {
    const d = all.days[k]
    return d && Object.values(d.done).some(Boolean)
  }
  const today = new Date()
  let cursor = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
  while (true) {
    const k = cursor.toISOString().substring(0,10)
    if (!all.days[k] || !hasAny(k)) break
    streak += 1
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return streak
}