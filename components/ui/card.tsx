import { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('rounded border border-white/10 bg-white/5 p-4', className)}>{children}</div>
}
