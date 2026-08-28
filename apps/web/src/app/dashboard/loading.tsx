export default function DashboardLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nutri-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Carregando dashboard...</p>
      </div>
    </div>
  );
}
