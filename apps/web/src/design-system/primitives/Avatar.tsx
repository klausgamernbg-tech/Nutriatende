'use client';

import React, { HTMLAttributes, forwardRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'busy' | 'away';
  statusPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const sizeStyles = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  xxl: 'w-24 h-24 text-xl',
};

const statusSizeStyles = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
  xxl: 'w-5 h-5',
};

const statusPositionStyles = {
  'bottom-right': 'bottom-0 right-0',
  'bottom-left': 'bottom-0 left-0',
  'top-right': 'top-0 right-0',
  'top-left': 'top-0 left-0',
};

const statusColors = {
  online: 'bg-success border-surface-level1 dark:border-surface-level1Dark',
  offline: 'bg-neutral-400 border-surface-level1 dark:border-surface-level1Dark',
  busy: 'bg-error border-surface-level1 dark:border-surface-level1Dark',
  away: 'bg-warning border-surface-level1 dark:border-surface-level1Dark',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-nutri-100 text-nutri-700 dark:bg-nutri-900/50 dark:text-nutri-300',
    'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
    'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt,
      name,
      size = 'md',
      shape = 'circle',
      status,
      statusPosition = 'bottom-right',
      children,
      ...props
    },
    ref,
  ) => {
    const initials = useMemo(() => (name ? getInitials(name) : '?'), [name]);
    const bgColor = useMemo(() => (name ? getColorFromName(name) : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'), [name]);
    const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

    if (children) {
      return (
        <div
          ref={ref}
          className={cn(
            'inline-flex items-center justify-center overflow-hidden font-medium',
            sizeStyles[size],
            shapeClass,
            className,
          )}
          {...props}
        >
          {children}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center overflow-hidden font-medium',
          sizeStyles[size],
          shapeClass,
          className,
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className={cn(
              'w-full h-full flex items-center justify-center',
              bgColor,
            )}
            aria-label={name || 'Avatar'}
          >
            {initials}
          </div>
        )}
        {status && (
          <span
            className={cn(
              'absolute rounded-full border-2',
              statusSizeStyles[size],
              statusColors[status],
              statusPositionStyles[statusPosition],
            )}
            aria-label={`Status: ${status}`}
          />
        )}
        {!src && !name && (
          <svg
            className="w-full h-full text-neutral-400 dark:text-neutral-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21c0-3.07-1.64-5.64-4-6.66V21h12v-3.34c-2.36 1.02-4 3.59-4 6.66z" />
          </svg>
        )}
      </div>
    );
  },
);

Avatar.displayName = 'Avatar';

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  spacing?: number;
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, children, max = 5, size = 'md', spacing = -8, ...props }, ref) => {
    const validChildren = Array.isArray(children)
      ? children.filter((child) => !!child).slice(0, max)
      : [];

    return (
      <div
        ref={ref}
        className={cn('flex items-center', className)}
        {...props}
        aria-label={validChildren.length > 1 ? `Group of ${validChildren.length} avatars` : undefined}
      >
        {validChildren.map((child, index) => (
          <div
            key={index}
            className="relative"
            style={{
              zIndex: validChildren.length - index,
              marginLeft: index === 0 ? 0 : spacing,
            }}
          >
            {child}
          </div>
        ))}
        {React.Children.count(children) > max && (
          <div
            className={cn(
              'inline-flex items-center justify-center overflow-hidden font-medium border-2 border-surface-level1 dark:border-surface-level1Dark',
              sizeStyles[size],
              'rounded-full',
            )}
            aria-label={`${React.Children.count(children) - max} more`}
          >
            +{React.Children.count(children) - max}
          </div>
        )}
      </div>
    );
  },
);

AvatarGroup.displayName = 'AvatarGroup';