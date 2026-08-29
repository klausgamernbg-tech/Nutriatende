'use client';

import { Fragment, ReactNode, forwardRef, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Button } from '../primitives/Button';
import { XIcon } from '@/components/icons';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: ReactNode;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      description,
      children,
      size = 'md',
      showCloseButton = true,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      footer,
      ...props
    },
    ref,
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
      if (isOpen) {
        previousActiveElement.current = document.activeElement as HTMLElement;
        document.body.style.overflow = 'hidden';
        modalRef.current?.focus();
      } else {
        document.body.style.overflow = '';
        previousActiveElement.current?.focus();
      }
      return () => {
        document.body.style.overflow = '';
      };
    }, [isOpen]);

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!isOpen) return;
        if (event.key === 'Escape' && closeOnEscape) {
          onClose();
        }
        if (event.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          if (focusableElements?.length) {
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
            if (event.shiftKey && document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeOnEscape]);

    if (!isOpen) return null;

    const modalContent = (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? undefined : 'modal-title'}
        aria-describedby={description ? undefined : 'modal-description'}
      >
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />
        <div
          ref={modalRef}
          tabIndex={-1}
          className={cn(
            'relative w-full bg-surface-level1 dark:bg-surface-level1Dark rounded-xl shadow-level4 dark:shadow-level4',
            'animate-scale-in',
            'max-h-[90vh] overflow-hidden flex flex-col',
            sizeStyles[size],
            (props as any).className,
          )}
          role="document"
          {...props}
        >
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between gap-4 p-4 border-b border-border-light dark:border-neutral-700">
              <div>
                {title && (
                  <h2
                    id="modal-title"
                    className="text-title-lg font-semibold text-text-primary"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="mt-1 text-body-sm text-text-secondary">
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  aria-label="Fechar modal"
                  className="flex-shrink-0"
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              )}
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>
          {footer && (
            <div className="flex items-center justify-end gap-2 p-4 border-t border-border-light dark:border-neutral-700">
              {footer}
            </div>
          )}
        </div>
      </div>
    );

    if (typeof window === 'undefined') return null;

    return createPortal(modalContent, document.body);
  },
);

Modal.displayName = 'Modal';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-body-md text-text-secondary">{message}</p>
    </Modal>
  );
};

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

export const AlertDialog = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = 'Entendido',
  variant = 'info',
}: AlertDialogProps) => {
  const variantStyles = {
    info: 'text-info border-info-light dark:border-info-dark bg-info-light/50 dark:bg-info-dark/50',
    success: 'text-success border-success-light dark:border-success-dark bg-success-light/50 dark:bg-success-dark/50',
    warning: 'text-warning border-warning-light dark:border-warning-dark bg-warning-light/50 dark:bg-warning-dark/50',
    error: 'text-error border-error-light dark:border-error-dark bg-error-light/50 dark:bg-error-dark/50',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <Button variant="primary" onClick={onClose} className="w-full sm:w-auto">
          {confirmText}
        </Button>
      }
    >
      <div className={cn('p-4 rounded-lg border', variantStyles[variant])}>
        <p className="text-body-md">{message}</p>
      </div>
    </Modal>
  );
};