// ============================================================
// Nutri Atende — Register New Measurements Page
// ============================================================

'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function NovaMedidaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    peso: '',
    altura: '',
    circunferencia_cintura: '',
    circunferencia_quadril: '',
    circunferencia_braco: '',
    circunferencia_coxa: '',
    percentual_gordura: '',
    massa_magra: '',
    agua_corporal: '',
    metodo: 'manual',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const body: any = {
        paciente_id: id,
        metodo_avaliacao: form.metodo,
      };

      if (form.peso) body.peso = parseFloat(form.peso);
      if (form.altura) body.altura = parseFloat(form.altura);
      if (form.circunferencia_cintura) body.circunferencia_cintura = parseFloat(form.circunferencia_cintura);
      if (form.circunferencia_quadril) body.circunferencia_quadril = parseFloat(form.circunferencia_quadril);
      if (form.circunferencia_braco) body.circunferencia_braco = parseFloat(form.circunferencia_braco);
      if (form.circunferencia_coxa) body.circunferencia_coxa = parseFloat(form.circunferencia_coxa);
      if (form.percentual_gordura) body.percentual_gordura = parseFloat(form.percentual_gordura);
      if (form.massa_magra) body.massa_magra = parseFloat(form.massa_magra);
      if (form.agua_corporal) body.agua_corporal = parseFloat(form.agua_corporal);

      const res = await fetch('/api/medidas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erro ao salvar medidas');
        return;
      }

      router.push(`/dashboard/pacientes/${id}`);
    } catch {
      setError('Erro de conexão');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href={`/dashboard/pacientes/${id}`} className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
          ← Voltar ao prontuário
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nova Medida</h1>
        <p className="text-gray-500 mt-1">Registre as medidas antropométricas do paciente</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        {/* Método */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🔬 Método de Avaliação</h2>
          <select name="metodo" value={form.metodo} onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none">
            <option value="manual">Manual (balança + fita métrica)</option>
            <option value="bioimpedancia">Bioimpedância</option>
            <option value="dobras_cutaneas">Dobras Cutâneas</option>
          </select>
        </div>

        {/* Peso e Altura */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⚖️ Peso e Altura</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
              <input name="peso" type="number" step="0.1" value={form.peso} onChange={handleChange}
                placeholder="70.5"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Altura (m)</label>
              <input name="altura" type="number" step="0.01" value={form.altura} onChange={handleChange}
                placeholder="1.75"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none" />
            </div>
          </div>
          {form.peso && form.altura && (
            <p className="mt-2 text-sm text-gray-500">
              IMC: <span className="font-medium text-gray-900">
                {(parseFloat(form.peso) / Math.pow(parseFloat(form.altura), 2)).toFixed(1)} kg/m²
              </span>
            </p>
          )}
        </div>

        {/* Circunferências */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📐 Circunferências (cm)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cintura</label>
              <input name="circunferencia_cintura" type="number" step="0.1" value={form.circunferencia_cintura} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quadril</label>
              <input name="circunferencia_quadril" type="number" step="0.1" value={form.circunferencia_quadril} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Braço</label>
              <input name="circunferencia_braco" type="number" step="0.1" value={form.circunferencia_braco} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coxa</label>
              <input name="circunferencia_coxa" type="number" step="0.1" value={form.circunferencia_coxa} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none" />
            </div>
          </div>
        </div>

        {/* Composição Corporal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Composição Corporal</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">% Gordura</label>
              <input name="percentual_gordura" type="number" step="0.1" value={form.percentual_gordura} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Massa Magra (kg)</label>
              <input name="massa_magra" type="number" step="0.1" value={form.massa_magra} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Água Corporal (L)</label>
              <input name="agua_corporal" type="number" step="0.1" value={form.agua_corporal} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link href={`/dashboard/pacientes/${id}`}
            className="px-6 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition">
            Cancelar
          </Link>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-nutri-600 text-white font-medium rounded-lg hover:bg-nutri-700 disabled:opacity-50 transition">
            {saving ? 'Salvando...' : 'Registrar Medidas'}
          </button>
        </div>
      </form>
    </div>
  );
}
