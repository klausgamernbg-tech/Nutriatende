// ============================================================
// Nutri Atende — Novo Paciente Page
// ============================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const TAG_SUGERIDAS = [
  'emagrecimento',
  'ganho_massa',
  'reeducação_alimentar',
  'gestante',
  'esporte',
  'diabetes',
  'hipertensao',
  'sop',
  'dislipidemia',
  'obstetricia',
];

export default function NovoPacientePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [form, setForm] = useState({
    nome: '',
    data_nascimento: '',
    sexo: '',
    telefone: '',
    email: '',
    cpf: '',
    queixa_principal: '',
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }

    // Get user's clinica_id
    const { data: usuario } = await supabase
      .from('usuario_sistema')
      .select('clinica_id')
      .eq('id', user.id)
      .single();

    if (!usuario) {
      setError('Perfil de usuário não encontrado');
      setLoading(false);
      return;
    }

    // Create patient
    const { data, error: insertError } = await supabase
      .from('paciente')
      .insert({
        clinica_id: usuario.clinica_id,
        nutricionista_responsavel_id: user.id,
        nome: form.nome,
        data_nascimento: form.data_nascimento || null,
        sexo: form.sexo || null,
        telefone: form.telefone || null,
        email: form.email || null,
        cpf: form.cpf || null,
        queixa_principal: form.queixa_principal || null,
        tags: selectedTags.length > 0 ? selectedTags : null,
        consentimento_lgpd: true,
        data_consentimento_lgpd: new Date().toISOString(),
        consentimento_lgpd_versao: '1.0',
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        setError(
          'Já existe um paciente com este email ou CPF cadastrado nesta clínica'
        );
      } else {
        setError(insertError.message);
      }
      setLoading(false);
      return;
    }

    router.push(`/dashboard/pacientes/${data.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/pacientes"
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
        >
          ← Voltar para pacientes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Novo Cadastro de Paciente
        </h1>
        <p className="text-gray-500 mt-1">
          Preencha os dados do paciente para iniciar o atendimento
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Dados Pessoais */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📋 Dados Pessoais
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                name="nome"
                type="text"
                value={form.nome}
                onChange={handleChange}
                required
                minLength={2}
                placeholder="Nome completo do paciente"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Nascimento
              </label>
              <input
                name="data_nascimento"
                type="date"
                value={form.data_nascimento}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sexo
              </label>
              <select
                name="sexo"
                value={form.sexo}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
              >
                <option value="">Selecione...</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                name="telefone"
                type="tel"
                value={form.telefone}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="paciente@email.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF
              </label>
              <input
                name="cpf"
                type="text"
                value={form.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Queixa Principal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🏥 Queixa Principal
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {TAG_SUGERIDAS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      selectedTags.includes(tag)
                        ? 'bg-nutri-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição da Queixa
              </label>
              <textarea
                name="queixa_principal"
                value={form.queixa_principal}
                onChange={handleChange}
                rows={3}
                placeholder="Descreva brevemente a queixa principal e motivo da consulta..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* LGPD Consent */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🔒 Consentimento LGPD
          </h2>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consentimento"
              required
              className="mt-1 h-4 w-4 text-nutri-600 border-gray-300 rounded focus:ring-nutri-500"
            />
            <label htmlFor="consentimento" className="text-sm text-gray-700">
              Confirmo que o paciente foi informado sobre o tratamento de seus
              dados pessoais conforme a{' '}
              <span className="text-nutri-600 font-medium">
                Política de Privacidade e Termo de Consentimento (LGPD)
              </span>
              , e autorizou o cadastro e uso de suas informações para fins de
              atendimento nutricional.
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/dashboard/pacientes"
            className="px-6 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-nutri-600 text-white font-medium rounded-lg hover:bg-nutri-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Paciente'}
          </button>
        </div>
      </form>
    </div>
  );
}
