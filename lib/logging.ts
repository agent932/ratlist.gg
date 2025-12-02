/**
 * Structured log event interface for application logging.
 * All logs are output as JSON for easy parsing by log aggregation tools.
 */
export type LogEvent = {
  name: string
  level?: 'info' | 'warn' | 'error'
  traceId?: string
  props?: Record<string, unknown>
}

/**
 * Emit a structured JSON log entry to console.
 * 
 * @param options - Log event configuration
 * @param options.name - Event name for categorization
 * @param options.level - Log level (info, warn, error)
 * @param options.traceId - Optional trace ID for request correlation
 * @param options.props - Additional structured properties
 * 
 * @example
 * log({ name: 'user.login', level: 'info', traceId: 'abc123', props: { userId: '123' } })
 */
export function log({ name, level = 'info', traceId, props = {} }: LogEvent) {
  const entry = { t: new Date().toISOString(), level, name, traceId, ...props }
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(entry))
}

/**
 * Create a standardized error response shape for API routes.
 * 
 * @param message - Human-readable error message
 * @param traceId - Optional trace ID for error correlation
 * @param extra - Additional error context to include
 * @returns Structured error object for JSON responses
 * 
 * @example
 * errorShape('User not found', 'trace123', { userId: '456' })
 * // { error: { message: 'User not found' }, traceId: 'trace123', userId: '456' }
 */
export function errorShape(message: string, traceId?: string, extra?: Record<string, unknown>) {
  return { error: { message }, traceId, ...extra }
}
