'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'status';
  size?: 'sm' | 'md' | 'lg';
  status?: 'agendada' | 'confirmada' | 'realizada' | 'cancelada' | 'nao_compareceu' | 'ativo' | 'manutencao' | 'inativo';
  dot?: boolean;
}

const variantStyles = {
  default: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200',
  success: 'bg-success-light text-success dark:bg-success-dark dark:text-success-foreground',
  warning: 'bg-warning-light text-warning dark:bg-warning-dark dark:text-warning-foreground',
  error: 'bg-error-light text-error dark:bg-error-dark dark:text-error-foreground',
  info: 'bg-info-light text-info dark:bg-info-dark dark:text-info-foreground',
  status: '', // handled by status prop
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-label-sm gap-1',
  md: 'px-2.5 py-1 text-label-md gap-1.5',
  lg: 'px-3 py-1.5 text-label-lg gap-2',
};

const statusStyles = {
  agendada: 'bg-status-agendada-bg text-status-agendada-text border border-status-agendada-border',
  confirmada: 'bg-status-confirmada-bg text-status-confirmada-text border border-status-confirmada-border',
  realizada: 'bg-status-realizada-bg text-status-realizada-text border border-status-realizada-border',
  cancelada: 'bg-status-cancelada-bg text-status-cancelada-text border border-status-cancelada-border',
  nao_compareceu: 'bg-status-nao-compareceu-bg text-status-nao-compareceu-text border border-status-nao-compareceu-border',
  ativo: 'bg-status-ativo-bg text-status-ativo-text',
  manutencao: 'bg-status-manutencao-bg text-status-manutencao-text',
  inativo: 'bg-status-inativo-bg text-status-inativo-text',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      status,
      dot = false,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles = 'inline-flex items-center font-medium rounded-full border-0';
    const statusStyle = status ? statusStyles[status] : variantStyles[variant];

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          sizeStyles[size],
          statusStyle,
          className,
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full flex-shrink-0',
              status
                ? 'bg-current'
                : variant === 'success'
                ? 'bg-success'
                : variant === 'warning'
                ? 'bg-warning'
                : variant === 'error'
                ? 'bg-error'
                : variant === 'info'
                ? 'bg-info'
                : 'bg-current',
            )}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';