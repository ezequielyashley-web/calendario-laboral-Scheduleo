const ipStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimitIP(ip: string, maxRequests = 20, windowMs = 60 * 1000) {
  const now = Date.now()
  const record = ipStore.get(ip)

  if (!record || now > record.resetTime) {
    ipStore.set(ip, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: maxRequests - 1 }
  }

  if (record.count >= maxRequests) {
    return { success: false, remaining: 0, resetTime: record.resetTime }
  }

  record.count++
  return { success: true, remaining: maxRequests - record.count }
}