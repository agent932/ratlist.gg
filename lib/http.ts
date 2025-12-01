import { NextRequest, NextResponse } from 'next/server'
import { errorShape, log } from './logging'

function traceId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function withErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
) {
  return async (req: NextRequest) => {
    const t = traceId()
    try {
      const res = await handler(req)
      return res
    } catch (e: any) {
      log({ name: 'route.error', level: 'error', traceId: t, props: { message: e?.message } })
      return NextResponse.json(errorShape('Unexpected error', t), { status: 500 })
    }
  }
}

export function badRequest(message: string) {
  return NextResponse.json(errorShape(message), { status: 400 })
}

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json(errorShape(message), { status: 401 })
}

export function notFound(message = 'Not found') {
  return NextResponse.json(errorShape(message), { status: 404 })
}
