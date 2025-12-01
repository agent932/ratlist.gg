import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn('w-full rounded border border-white/10 bg-black/40 px-3 py-2 outline-none ring-brand/50 focus:ring', className)}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
