import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import * as React from 'react'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-sans font-semibold',
    'cursor-pointer select-none',                           // always pointer, never text-select on tap
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-brand-600 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.97] active:brightness-95',             // press feedback
  ],
  {
    variants: {
      variant: {
        primary:      'bg-brand-600 text-white hover:bg-brand-700 shadow-sm hover:shadow-md',
        secondary:    'bg-transparent text-brand-600 border-[1.5px] border-brand-600 hover:bg-brand-50',
        ghost:        'bg-transparent text-neutral-700 hover:bg-neutral-100 border-[1.5px] border-neutral-200',
        'ghost-dark': 'bg-transparent text-white border-[1.5px] border-white/25 hover:bg-white/10',
        white:        'bg-white text-neutral-900 hover:bg-neutral-50 shadow-sm',
        danger:       'bg-danger-500 text-white hover:bg-danger-600',
        violet:       'bg-violet-600 text-white hover:bg-violet-700',
      },
      size: {
        sm:  'h-10 px-4  text-xs  rounded-lg',   // bumped from h-8 → h-10 (40px min touch)
        md:  'h-10 px-5  text-sm',
        lg:  'h-12 px-6  text-base',
        xl:  'h-14 px-8  text-lg  rounded-2xl',
        icon:'h-11 w-11  rounded-xl p-0',         // 44px × 44px touch target
      },
    },
    defaultVariants: { variant: 'primary', size: 'lg' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
