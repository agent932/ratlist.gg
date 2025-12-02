import { NextRequest, NextResponse } from 'next/server'
import { errorShape, log } from './logging'

/**
 * Generate a unique trace ID for request tracking and error correlation.
 * Combines random string with timestamp for uniqueness.
 * 
 * @returns A unique trace ID string
 */
function traceId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

/**
 * Higher-order function that wraps API route handlers with error handling.
 * Automatically catches errors, logs them, and returns standardized error responses.
 * 
 * @param handler - The API route handler function to wrap
 * @returns Wrapped handler with error handling
 * 
 * @example
 * export const GET = withErrorHandling(async (req) => {
 *   // Your handler logic
 *   return NextResponse.json({ data: 'success' });
 * });
 */
export function withErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
) {
  return async (req: NextRequest) => {
    const t = traceId()
    try {
      const res = await handler(req)
      return res
    } catch (e: unknown) {
      log({ name: 'route.error', level: 'error', traceId: t, props: { message: (e as Error)?.message } })
      return NextResponse.json(errorShape('Unexpected error', t), { status: 500 })
    }
  }
}

/**
 * Create a standardized 400 Bad Request response.
 * 
 * @param message - Error message describing the bad request
 * @returns NextResponse with 400 status and error shape
 */
export function badRequest(message: string) {
  return NextResponse.json(errorShape(message), { status: 400 })
}

/**
 * Create a standardized 401 Unauthorized response.
 * 
 * @param message - Error message (defaults to 'Unauthorized')
 * @returns NextResponse with 401 status and error shape
 */
export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json(errorShape(message), { status: 401 })
}

/**
 * Create a standardized 404 Not Found response.
 * 
 * @param message - Error message (defaults to 'Not found')
 * @returns NextResponse with 404 status and error shape
 */
export function notFound(message = 'Not found') {
  return NextResponse.json(errorShape(message), { status: 404 })
}
