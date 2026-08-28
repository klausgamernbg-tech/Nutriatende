'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Erro ao carregar o dashboard
        </h2>
        <p className="text-gray-500 mb-1 text-sm">
          {error.message || 'Ocorreu um erro inesperado'}
        </p>
        {error.digest && (
          <p className="text-gray-400 text-xs mb-4">
            ID do erro: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="px-4 py-2 bg-nutri-600 text-white rounded-lg hover:bg-nutri-700 transition mt-4"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
