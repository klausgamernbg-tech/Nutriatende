'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'list-item' | 'avatar';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animate?: boolean;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = 'text',
      width,
      height,
      lines = 1,
      animate = true,
      ...props
    },
    ref,
  ) => {
    const baseStyles = 'overflow-hidden bg-neutral-200 dark:bg-neutral-800';
    const animationStyles = animate ? 'skeleton' : '';

    const variantStyles = {
      text: 'h-4 rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-lg',
      card: 'rounded-xl',
      'list-item': 'rounded-lg',
      avatar: 'rounded-full',
    };

    if (variant === 'text' && lines > 1) {
      return (
        <div
          ref={ref}
          className={cn('space-y-2', className)}
          {...props}
        >
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                baseStyles,
                animationStyles,
                variantStyles.text,
                i === lines - 1 && 'w-3/4',
              )}
              style={{ width: i === lines - 1 ? '75%' : '100%' }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          animationStyles,
          variantStyles[variant],
          className,
        )}
        style={{
          width: width || (variant === 'circular' || variant === 'avatar' ? height : undefined),
          height: height || (variant === 'text' ? '1rem' : undefined),
        }}
        {...props}
      />
    );
  },
);

Skeleton.displayName = 'Skeleton';

export interface SkeletonCardProps extends HTMLAttributes<HTMLDivElement> {
  showAvatar?: boolean;
  lines?: number;
  animate?: boolean;
}

export const SkeletonCard = forwardRef<HTMLDivElement, SkeletonCardProps>(
  (
    {
      className,
      showAvatar = true,
      lines = 3,
      animate = true,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl bg-surface-level1 dark:bg-surface-level1Dark shadow-level1 dark:shadow-level1 p-4 space-y-3',
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          {showAvatar && (
            <Skeleton variant="avatar" width={40} height={40} animate={animate} />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" height="1.25rem" animate={animate} />
            <Skeleton variant="text" width="40%" height="1rem" animate={animate} />
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} variant="text" width={i === lines - 1 ? '70%' : '100%'} animate={animate} />
          ))}
        </div>
      </div>
    );
  },
);

SkeletonCard.displayName = 'SkeletonCard';

export interface SkeletonListProps extends HTMLAttributes<HTMLDivElement> {
  count?: number;
  showAvatar?: boolean;
  lines?: number;
  animate?: boolean;
}

export const SkeletonList = forwardRef<HTMLDivElement, SkeletonListProps>(
  (
    {
      className,
      count = 5,
      showAvatar = true,
      lines = 2,
      animate = true,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-3', className)}
        {...props}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            {showAvatar && <Skeleton variant="avatar" width={40} height={40} animate={animate} />}
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton variant="text" width="50%" animate={animate} />
              {Array.from({ length: lines - 1 }).map((_, j) => (
                <Skeleton key={j} variant="text" width={`${70 - j * 10}%`} animate={animate} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
);

SkeletonList.displayName = 'SkeletonList';

export interface SkeletonTableProps extends HTMLAttributes<HTMLDivElement> {
  rows?: number;
  columns?: number;
  animate?: boolean;
}

export const SkeletonTable = forwardRef<HTMLDivElement, SkeletonTableProps>(
  (
    {
      className,
      rows = 5,
      columns = 4,
      animate = true,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn('rounded-lg border border-border-light dark:border-neutral-700 overflow-hidden', className)}
        {...props}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light dark:border-neutral-700">
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="p-3 text-left text-label-sm text-text-secondary">
                    <Skeleton variant="text" width="80%" animate={animate} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-border-light/50 dark:border-neutral-700/50 last:border-0">
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <td key={colIndex} className="p-3">
                      <Skeleton variant="text" width="90%" animate={animate} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);

SkeletonTable.displayName = 'SkeletonTable';