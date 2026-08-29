'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Skeleton } from './Skeleton';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  illustration?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'default' | 'search' | 'offline' | 'error' | 'permission';
  size?: 'sm' | 'md' | 'lg';
}

const illustrations = {
  default: (
    <svg className="w-24 h-24 text-nutri-300 dark:text-nutri-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  search: (
    <svg className="w-24 h-24 text-nutri-300 dark:text-nutri-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="8" x2="14" y2="14" />
      <line x1="14" y1="14" x2="8" y2="8" />
    </svg>
  ),
  offline: (
    <svg className="w-24 h-24 text-nutri-300 dark:text-nutri-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.59 3.42A16 16 0 0 0 2 12.55" />
    </svg>
  ),
  error: (
    <svg className="w-24 h-24 text-error-light dark:text-error-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  permission: (
    <svg className="w-24 h-24 text-warning-light dark:text-warning-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

const variantConfigs = {
  default: { icon: illustrations.default, title: 'Nenhum dado encontrado', description: 'Não há informações para exibir no momento.' },
  search: { icon: illustrations.search, title: 'Nenhum resultado', description: 'Tente ajustar sua busca ou filtros.' },
  offline: { icon: illustrations.offline, title: 'Você está offline', description: 'Os dados serão sincronizados quando a conexão for restabelecida.' },
  error: { icon: illustrations.error, title: 'Erro ao carregar', description: 'Ocorreu um problema inesperado. Tente novamente.' },
  permission: { icon: illustrations.permission, title: 'Permissão necessária', description: 'Conceda a permissão para acessar este recurso.' },
};

const sizeStyles = {
  sm: 'py-8 px-4',
  md: 'py-12 px-6',
  lg: 'py-16 px-8',
};

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      title,
      description,
      illustration,
      action,
      variant = 'default',
      size = 'md',
      ...props
    },
    ref,
  ) => {
    const config = variantConfigs[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        <div className="mb-4" aria-hidden="true">
          {illustration || config.icon}
        </div>
        <h3 className="text-headline-sm font-semibold text-text-primary mb-2">
          {title || config.title}
        </h3>
        {(description || config.description) && (
          <p className="text-body-md text-text-secondary max-w-sm mx-auto mb-6">
            {description || config.description}
          </p>
        )}
        {action && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {action}
          </div>
        )}
      </div>
    );
  },
);

EmptyState.displayName = 'EmptyState';

export interface LoadingStateProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  overlay?: boolean;
}

export const LoadingState = forwardRef<HTMLDivElement, LoadingStateProps>(
  (
    {
      className,
      variant = 'spinner',
      size = 'md',
      text,
      overlay = false,
      ...props
    },
    ref,
  ) => {
    const sizeStyles = {
      sm: { spinner: 'h-6 w-6', dots: 'h-2 w-2', text: 'text-body-sm' },
      md: { spinner: 'h-8 w-8', dots: 'h-2.5 w-2.5', text: 'text-body-md' },
      lg: { spinner: 'h-12 w-12', dots: 'h-3 w-3', text: 'text-body-lg' },
    };

    const s = sizeStyles[size];

    const spinner = (
      <svg
        className={cn('animate-spin text-nutri-600', s.spinner)}
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
    );

    const dots = (
      <div className="flex items-center gap-1" aria-hidden="true">
        <span className={cn('rounded-full bg-nutri-600 animate-bounce', s.dots)} style={{ animationDelay: '0ms' }} />
        <span className={cn('rounded-full bg-nutri-600 animate-bounce', s.dots)} style={{ animationDelay: '150ms' }} />
        <span className={cn('rounded-full bg-nutri-600 animate-bounce', s.dots)} style={{ animationDelay: '300ms' }} />
      </div>
    );

    const pulse = (
      <Skeleton variant="text" width="60%" height="1.5rem" animate />
    );

    const content = (
      <div className={cn('flex flex-col items-center justify-center gap-4', overlay && 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm', className)}>
        {variant === 'spinner' && spinner}
        {variant === 'dots' && dots}
        {variant === 'pulse' && pulse}
        {variant === 'skeleton' && (
          <div className="space-y-3 w-full max-w-md">
            <Skeleton variant="text" width="40%" animate />
            <Skeleton variant="text" width="60%" animate />
            <Skeleton variant="text" width="80%" animate />
          </div>
        )}
        {text && <p className={cn(s.text, 'text-text-secondary')}>{text}</p>}
      </div>
    );

    if (overlay) {
      return <div ref={ref} {...props}>{content}</div>;
    }

    return (
      <div ref={ref} className={cn('flex flex-col items-center justify-center py-12', className)} {...props}>
        {content}
      </div>
    );
  },
);

LoadingState.displayName = 'LoadingState';

export interface PageLoadingProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export const PageLoading = forwardRef<HTMLDivElement, PageLoadingProps>(
  ({ className, title = 'Carregando...', description, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('min-h-[60vh] flex flex-col items-center justify-center px-4', className)}
      {...props}
    >
      <LoadingState variant="spinner" size="lg" />
      <h2 className="text-headline-sm font-semibold text-text-primary mt-4">{title}</h2>
      {description && <p className="text-body-md text-text-secondary mt-1">{description}</p>}
    </div>
  ),
);

PageLoading.displayName = 'PageLoading';