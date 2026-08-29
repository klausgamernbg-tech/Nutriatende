// ============================================================
// Nutri Atende — Novo Plano Alimentar Page
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function NovoPlanoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pacienteId = searchParams.get('paciente_id') || '';

  const [pacientes, setPacientes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    paciente_id: pacienteId,
    titulo: '',
    calorias_meta: '',
    proteinas_meta: '',
    carboidratos_meta: '',
    gorduras_meta: '',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: '',
    observacoes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/pacientes/list')
      .then((r) => r.json())
      .then((json) => setPacientes(json.data || []))
      .catch(() => setPacientes([]));
  }, []);

  // Auto-calculate macros from calories (default distribution)
  const calcMacros = (calorias: string) => {
    const cal = Number(calorias);
    if (!cal || cal <= 0) return;
    setFormData((prev) => ({
      ...prev,
      calorias_meta: calorias,
      proteinas_meta: String(Math.round((cal * 0.3) / 4)), // 30% protein
      carboidratos_meta: String(Math.round((cal * 0.45) / 4)), // 45% carbs
      gorduras_meta: String(Math.round((cal * 0.25) / 9)), // 25% fat
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/planos-alimentares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_id: formData.paciente_id,
          titulo: formData.titulo || undefined,
          calorias_meta: formData.calorias_meta ? Number(formData.calorias_meta) : undefined,
          proteinas_meta: formData.proteinas_meta ? Number(formData.proteinas_meta) : undefined,
          carboidratos_meta: formData.carboidratos_meta ? Number(formData.carboidratos_meta) : undefined,
          gorduras_meta: formData.gorduras_meta ? Number(formData.gorduras_meta) : undefined,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim || undefined,
          status: 'rascunho',
          observacoes: formData.observacoes || undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Erro ao criar plano');
        return;
      }

      router.push('/dashboard/planos');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar plano');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href="/dashboard/planos"
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
        >
          ← Voltar para planos
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Novo Plano Alimentar</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">👤 Paciente</h2>
          <select
            required
            value={formData.paciente_id}
            onChange={(e) => setFormData({ ...formData, paciente_id: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
          >
            <option value="">Selecione o paciente</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
          {pacientes.length === 0 && (
            <p className="text-sm text-gray-400 mt-2">
              Nenhum paciente encontrado. Cadastre um paciente primeiro.
            </p>
          )}
        </div>

        {/* Plan details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">📋 Dados do Plano</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título do plano
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Plano de emagrecimento — Fase 1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data início
                </label>
                <input
                  type="date"
                  required
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data fim (opcional)
                </label>
                <input
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition targets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">🎯 Metas Nutricionais</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta calórica (kcal/dia)
              </label>
              <input
                type="number"
                value={formData.calorias_meta}
                onChange={(e) => calcMacros(e.target.value)}
                placeholder="Ex: 1800"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Preencha as calorias e os macros serão calculados automaticamente
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proteína (g)
                </label>
                <input
                  type="number"
                  value={formData.proteinas_meta}
                  onChange={(e) => setFormData({ ...formData, proteinas_meta: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carboidrato (g)
                </label>
                <input
                  type="number"
                  value={formData.carboidratos_meta}
                  onChange={(e) => setFormData({ ...formData, carboidratos_meta: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gordura (g)
                </label>
                <input
                  type="number"
                  value={formData.gorduras_meta}
                  onChange={(e) => setFormData({ ...formData, gorduras_meta: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">📝 Observações</h2>
          <textarea
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            placeholder="Observações clínicas, restrições, preferências..."
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !formData.paciente_id}
            className="px-6 py-2.5 bg-nutri-600 text-white font-medium rounded-lg hover:bg-nutri-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando...' : 'Criar Plano'}
          </button>
          <Link
            href="/dashboard/planos"
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
