export type LogEvent = {
  name: string
  level?: 'info' | 'warn' | 'error'
  traceId?: string
  props?: Record<string, unknown>
}

export function log({ name, level = 'info', traceId, props = {} }: LogEvent) {
  const entry = { t: new Date().toISOString(), level, name, traceId, ...props }
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(entry))
}

export function errorShape(message: string, traceId?: string, extra?: Record<string, unknown>) {
  return { error: { message }, traceId, ...extra }
}
