'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showClearButton?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      showClearButton = false,
      id: providedId,
      disabled,
      required,
      value,
      onChange,
      onBlur,
      type = 'text',
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const describedBy = [error && errorId, helperText && helperId].filter(Boolean).join(' ') || undefined;

    const handleClear = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onChange) {
        onChange({ target: { name: props.name, value: '' } } as React.ChangeEvent<HTMLInputElement>);
      }
      if (ref && typeof ref === 'object' && 'current' in ref) {
        (ref.current as HTMLInputElement).focus();
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-title-sm text-text-secondary"
          >
            {label}
            {required && <span className="ml-1 text-error" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-tertiary" aria-hidden="true">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            type={type}
            className={cn(
              'w-full rounded-lg border bg-surface-level1',
              'text-body-md text-text-primary placeholder-text-tertiary',
              'transition-fast',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-100 dark:disabled:bg-neutral-800',
              'touch-target-comfortable',
              leftIcon ? 'pl-10' : 'pl-4',
              rightIcon || showClearButton ? 'pr-10' : 'pr-4',
              'py-3',
              error
                ? 'border-error focus:ring-error'
                : 'border-border-light focus:border-border-focus dark:border-neutral-700 dark:focus:border-nutri-500',
            )}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            aria-required={required}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-tertiary" aria-hidden="true">
              {rightIcon}
            </div>
          )}
          {showClearButton && value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-tertiary hover:text-text-secondary transition-fast"
              aria-label="Limpar campo"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-label-sm text-error flex items-center gap-1"
            role="alert"
          >
            <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-label-sm text-text-tertiary">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      id: providedId,
      disabled,
      required,
      value,
      onChange,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const describedBy = [error && errorId, helperText && helperId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-title-sm text-text-secondary"
          >
            {label}
            {required && <span className="ml-1 text-error" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-lg border bg-surface-level1 resize-none',
            'text-body-md text-text-primary placeholder-text-tertiary',
            'transition-fast',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-100 dark:disabled:bg-neutral-800',
            'touch-target-comfortable',
            'p-4',
            error
              ? 'border-error focus:ring-error'
              : 'border-border-light focus:border-border-focus dark:border-neutral-700 dark:focus:border-nutri-500',
          )}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          aria-required={required}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-label-sm text-error flex items-center gap-1"
            role="alert"
          >
            <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-label-sm text-text-tertiary">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      placeholder,
      id: providedId,
      disabled,
      required,
      value,
      onChange,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const describedBy = [error && errorId, helperText && helperId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-title-sm text-text-secondary"
          >
            {label}
            {required && <span className="ml-1 text-error" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              'w-full rounded-lg border bg-surface-level1 appearance-none',
              'text-body-md text-text-primary placeholder-text-tertiary',
              'transition-fast',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-100 dark:disabled:bg-neutral-800',
              'touch-target-comfortable',
              'pl-4 pr-10 py-3',
              error
                ? 'border-error focus:ring-error'
                : 'border-border-light focus:border-border-focus dark:border-neutral-700 dark:focus:border-nutri-500',
            )}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            aria-required={required}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-tertiary" aria-hidden="true">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-label-sm text-error flex items-center gap-1"
            role="alert"
          >
            <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-label-sm text-text-tertiary">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';