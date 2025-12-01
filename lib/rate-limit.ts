// Simple in-memory rate limiter for development
// Production should use Redis/Upstash

const userCooldowns = new Map<string, number>()
const userDailyCounts = new Map<string, { date: string; count: number }>()

export function checkRateLimit(userId: string): { ok: boolean; reason?: string } {
  const now = Date.now()
  const today = new Date().toISOString().split('T')[0]

  // Check cooldown (30 seconds)
  const lastSubmit = userCooldowns.get(userId)
  if (lastSubmit && now - lastSubmit < 30_000) {
    return { ok: false, reason: 'Please wait 30 seconds between submissions' }
  }

  // Check daily limit (10 per day)
  const dailyRecord = userDailyCounts.get(userId)
  if (dailyRecord?.date === today && dailyRecord.count >= 10) {
    return { ok: false, reason: 'Daily submission limit reached (10/day)' }
  }

  return { ok: true }
}

export function recordSubmission(userId: string) {
  const now = Date.now()
  const today = new Date().toISOString().split('T')[0]

  userCooldowns.set(userId, now)

  const dailyRecord = userDailyCounts.get(userId)
  if (dailyRecord?.date === today) {
    dailyRecord.count++
  } else {
    userDailyCounts.set(userId, { date: today, count: 1 })
  }
}
