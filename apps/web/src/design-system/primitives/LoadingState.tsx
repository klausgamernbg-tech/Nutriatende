import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Carregando...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-nutri-200 border-t-nutri-600 animate-spin" />
      </div>
      <p className="mt-4 text-sm text-gray-500">{message}</p>
    </div>
  );
}
