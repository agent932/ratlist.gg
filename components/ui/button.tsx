import { Slot } from '@radix-ui/react-slot'
import { cn } from '../../lib/cn'
import { ButtonHTMLAttributes, forwardRef } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
  variant?: 'default' | 'outline'
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, asChild, variant = 'default', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref as any}
        className={cn(
          'inline-flex items-center justify-center rounded text-sm font-medium transition-colors',
          variant === 'default' && 'bg-brand text-brand-foreground hover:opacity-90',
          variant === 'outline' && 'border border-white/10 bg-transparent hover:bg-white/5',
          'px-3 py-2',
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
