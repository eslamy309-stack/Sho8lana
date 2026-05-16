import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-xl border border-neutral-200 bg-white px-4 py-2',
        'text-sm font-sans text-neutral-900 placeholder:text-neutral-400',
        'transition-colors duration-200',
        'focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input }
