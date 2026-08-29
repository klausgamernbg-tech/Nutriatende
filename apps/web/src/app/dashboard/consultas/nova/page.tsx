// ============================================================
// Nutri Atende — Nova Consulta Page
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function NovaConsultaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pacienteId = searchParams.get('paciente_id') || '';

  const [pacientes, setPacientes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    paciente_id: pacienteId,
    data: new Date().toISOString().split('T')[0],
    hora: '09:00',
    tipo: 'retorno',
    valor: '',
    duracao_minutos: '50',
    observacoes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('paciente')
      .select('id, nome')
      .eq('status', 'ativo')
      .order('nome')
      .then(({ data }) => setPacientes(data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Não autenticado');
        return;
      }

      const dataHora = `${formData.data}T${formData.hora}:00`;

      const { error: insertError } = await supabase.from('consulta').insert({
        paciente_id: formData.paciente_id,
        nutricionista_id: user.id,
        data_hora: dataHora,
        tipo: formData.tipo,
        status: 'agendada',
        valor: formData.valor ? Number(formData.valor) : null,
        duracao_minutos: Number(formData.duracao_minutos),
        observacoes: formData.observacoes || null,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      router.push('/dashboard/consultas');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar consulta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href="/dashboard/consultas"
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
        >
          ← Voltar para consultas
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nova Consulta</h1>
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
        </div>

        {/* Date and time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">📅 Data e Horário</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                required
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
              <input
                type="time"
                required
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">📋 Detalhes</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
                >
                  <option value="primeira">Primeira consulta</option>
                  <option value="retorno">Retorno</option>
                  <option value="avaliacao">Avaliação</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duração (min)</label>
                <input
                  type="number"
                  value={formData.duracao_minutos}
                  onChange={(e) => setFormData({ ...formData, duracao_minutos: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder="Opcional"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Notas internas sobre a consulta..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none resize-none"
              />
            </div>
          </div>
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
            {loading ? 'Agendando...' : 'Agendar Consulta'}
          </button>
          <Link
            href="/dashboard/consultas"
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
