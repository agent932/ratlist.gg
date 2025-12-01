import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({ ok: true, time: new Date().toISOString() })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
