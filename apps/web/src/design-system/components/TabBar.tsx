'use client';

import React, { forwardRef, HTMLAttributes, useState, useEffect, MouseEvent, SVGProps } from 'react';
import { cn } from '@/lib/utils';
import { XIcon } from '@/components/icons';

export interface TabItem {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabBarProps extends HTMLAttributes<HTMLDivElement> {
  value: string | number;
  onValueChange: (value: string | number) => void;
  items: TabItem[];
  variant?: 'default' | 'pill' | 'underline' | 'segmented';
  size?: 'sm' | 'md' | 'lg';
  selectedColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  unselectedColor?: 'neutral' | 'muted';
  stretch?: boolean;
}

const tabBarColor = {
  primary: 'bg-nutri-600 text-white dark:bg-nutri-400 dark:text-nutri-100',
  secondary: 'bg-neutral-600 text-white dark:bg-neutral-400 dark:text-nutri-100',
  success: 'bg-success text-success-foreground dark:bg-success-dark dark:text-success-foreground',
  warning: 'bg-warning text-warning-foreground dark:bg-warning-dark dark:text-warning-foreground',
  error: 'bg-error text-error-foreground dark:bg-error-dark dark:text-error-foreground',
  info: 'bg-info text-info-foreground dark:bg-info-dark dark:text-info-foreground',
};

const neutralColor = 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200';
const mutedColor = 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400';

const sizeStyles = {
  sm: 'h-8 py-1 text-xs',
  md: 'h-10 py-2 text-sm',
  lg: 'h-12 py-2.5 text-base',
};

export const TabBar = forwardRef<HTMLDivElement, TabBarProps>(
  (
    {
      className,
      value,
      onValueChange,
      items,
      variant = 'default',
      size = 'md',
      selectedColor = 'primary',
      unselectedColor = 'neutral',
      stretch = false,
      ...props
    },
    ref,
  ) => {
    const isSelected = (item: TabItem) => String(item.value) === String(value);

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-1 overflow-x-auto',
          'animate-in',
          'data-[state=pending]:animate-[ka-varies_3s_linear_ forwards]',
          'data-[state=recipes]:animate-[ka-varies_5s_linear_ forwards]',
          className,
        )}
        {...props}
      >
        {items.map((item, index) => {
          const selected = isSelected(item);
          const isDisabled = item.disabled || false;
          const color = selected ? (selectedColor || 'primary') : (unselectedColor || 'neutral');
          const textClass = color === 'primary'
            ? 'text-white'
            : color === 'success'
            ? 'text-success-foreground'
            : color === 'warning'
            ? 'text-warning-foreground'
            : color === 'error'
            ? 'text-error-foreground'
            : color === 'info'
            ? 'text-info-foreground'
            : neutralColor.split(' ')[1] === 'text-neutral-700'
            ? 'text-neutral-700 dark:text-neutral-200'
            : 'text-neutral-500 dark:text-neutral-400';

          const bgClass = selected ? (tabBarColor as Record<string, string>)[color] || neutralColor : 'transparent';

          const paddingClass = sizeStyles[size];
          const borderClass = selected ? 'border-transparent' : 'border border-border-light dark:border-neutral-700';

          return (
            <button
              key={index}
              type="button"
              className={cn(
                'flex-1 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
                paddingClass,
                stretch && 'w-full',
                selected ? 'bg-white/10 dark:bg-black/10' : 'bg-transparent',
                borderClass,
                isDisabled && 'opacity-50 pointer-events-none',
                'focus-visible:bg-nutri-600 dark:focus-visible:bg-nutri-400 focus-visible:text-white',
                'hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100',
              )}
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                onValueChange(item.value);
              }}
              disabled={isDisabled}
              aria-selected={selected}
              aria-disabled={isDisabled}
              role="tab"
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </button>
          );
        })}
      </div>
    );
  },
);

TabBar.displayName = 'TabBar';

export interface TabPanelsProps {
  type?: 'single' | 'multiple';
  value: string | number;
  onValueChange: (value: string | number) => void;
  children: React.ReactNode;
}

export const TabPanels = ({
  type = 'single',
  value,
  onValueChange,
  children,
}: TabPanelsProps) => {
  const [values, setValues] = useState<(string | number)[]>([value]);

  const handleChange = (newValue: string | number) => {
    if (type === 'single') {
      setValues([newValue]);
    } else {
      setValues((prev) => {
        const index = prev.indexOf(newValue);
        if (index === -1) return [...prev, newValue];
        return prev.filter((v) => v !== newValue);
      });
    }
    onValueChange(type === 'single' ? newValue : values[values.length - 1]);
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        if (!child || !React.isValidElement(child)) return null;
        const childValue = (child.props as any)?.value;
        return React.cloneElement(child as React.ReactElement<any>, {
          value: childValue,
          onValueChange: handleChange,
        });
      })}
    </div>
  );
};