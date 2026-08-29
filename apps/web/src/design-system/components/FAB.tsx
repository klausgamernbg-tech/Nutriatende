'use client';

import React, { forwardRef, HTMLAttributes, useState, MouseEvent, SVGProps } from 'react';
import { cn } from '@/lib/utils';
import { XIcon } from '@/components/icons';

export interface FABProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

const fabSize = {
  sm: { width: '56px', height: '56px' },
  md: { width: '64px', height: '64px' },
  lg: { width: '72px', height: '72px' },
};

const fabContentSize = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-7 w-7',
};

export const FAB = forwardRef<HTMLDivElement, FABProps>(
  (
    {
      className,
      open = false,
      onToggle,
      onClick,
      children,
      size = 'md',
      color = 'primary',
      ...props
    },
    ref,
  ) => {
    const styles = fabSize[size];
    const contentSize = fabContentSize[size];
    const colorClasses = {
      primary: 'bg-nutri-600 dark:bg-nutri-400 text-white dark:text-nutri-100',
      secondary: 'bg-neutral-600 dark:bg-neutral-300 text-white dark:text-nutri-100',
      success: 'bg-success text-success-dark dark:text-success-foreground',
      warning: 'bg-warning text-warning-dark dark:text-warning-foreground',
      error: 'bg-error text-error-dark dark:text-error-foreground',
      info: 'bg-info text-info-dark dark:text-info-foreground',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex flex-col gap-2',
          styles.width,
          styles.height,
          'rounded-full border border-border-light dark:border-neutral-700 shadow-level4 dark:shadow-level4 overflow-hidden transition-transform transform',
          open && 'rotate-68',
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            'absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center',
            colorClasses[color],
          )}
        >
          {open && <XIcon className={contentSize} aria-label="Fechar" />}
        </div>
        <button
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            if (onToggle) onToggle();
            if (onClick) onClick();
          }}
          className={cn(
            'flex flex-col items-center justify-center w-full h-full rounded-full bg-nutri-600 dark:bg-nutri-400 text-white dark:text-nutri-100 hover:opacity-90 active:opacity-80 transition-opacity',
            contentSize,
            open && 'scale-110',
          )}
        >
          {children}
        </button>
      </div>
    );
  },
);

FAB.displayName = 'FAB';

export interface FABGroupProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onToggle?: () => void;
  children?: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  spacing?: number;
}

export const FABGroup = forwardRef<HTMLDivElement, FABGroupProps>(
  (
    {
      className,
      open = false,
      onToggle,
      children,
      direction = 'vertical',
      spacing = 8,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex flex-col gap-2 transition-all',
          direction === 'horizontal' && 'flex-row',
          direction === 'vertical' && 'space-y-2',
          spacing !== undefined && `gap-${spacing}`,
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            'w-12 h-12 rounded-full border border-border-light dark:border-neutral-700 shadow-level3 dark:shadow-level3 transition-transform transform',
            open && 'rotate-68',
          )}
        >
          {open && <XIcon className="h-5 w-5" aria-label="Fechar" />}
        </div>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          return React.cloneElement(child as React.ReactElement<any>, {
            className: cn(
              (child.props as any).className || '',
              direction === 'horizontal' && 'w-10 h-10',
              direction === 'vertical' && 'w-full h-full',
              open && 'scale-100',
            ),
            style: {
              ...(child.props as any).style,
              margin: spacing !== undefined
                ? direction === 'horizontal'
                  ? `margin-left: ${spacing}px`
                  : `margin-top: ${spacing}px`
                : undefined,
            },
          });
        })}
      </div>
    );
  },
);

FABGroup.displayName = 'FABGroup';