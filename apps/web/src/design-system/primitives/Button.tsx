'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-nutri-600 text-white hover:bg-nutri-700 active:bg-nutri-800 focus:ring-nutri-500 disabled:bg-nutri-200 dark:disabled:bg-nutri-800',
  secondary: 'bg-nutri-50 text-nutri-700 border border-nutri-200 hover:bg-nutri-100 active:bg-nutri-200 focus:ring-nutri-500 dark:bg-nutri-900/30 dark:text-nutri-300 dark:border-nutri-800 dark:hover:bg-nutri-900/50',
  tertiary: 'bg-transparent text-nutri-600 hover:bg-nutri-50 active:bg-nutri-100 focus:ring-nutri-500 dark:text-nutri-400 dark:hover:bg-nutri-900/30',
  destructive: 'bg-error text-error-foreground hover:bg-error-dark active:bg-error-dark focus:ring-error disabled:bg-error-light dark:disabled:bg-error-dark',
  outline: 'bg-transparent text-nutri-600 border-2 border-nutri-300 hover:bg-nutri-50 active:bg-nutri-100 focus:ring-nutri-500 dark:text-nutri-400 dark:border-nutri-700 dark:hover:bg-nutri-900/30',
  ghost: 'bg-transparent text-nutri-600 hover:bg-nutri-50 active:bg-nutri-100 focus:ring-nutri-500 dark:text-nutri-400 dark:hover:bg-nutri-900/30',
};

const sizeStyles = {
  sm: 'h-9 px-3 text-label-md gap-1.5',
  md: 'h-10 px-4 text-label-lg gap-2',
  lg: 'h-12 px-6 text-label-lg gap-2',
  xl: 'h-14 px-8 text-title-md gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-lg',
          'transition-fast press-scale',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:press-scale-none',
          'touch-target-comfortable',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>}
        <span className={cn('truncate', loading && 'invisible')}>{children}</span>
        {!loading && rightIcon && <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';