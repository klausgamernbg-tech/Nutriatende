// ============================================================
// Nutri Atende — Prontuário Page
// ============================================================

import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function ProntuarioPage() {
  const supabase = createAdminClient();

  // Get patients with their last consultation
  const { data: pacientes } = await supabase
    .from('paciente')
    .select('id, nome, status, created_at')
    .order('nome', { ascending: true })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prontuário</h1>
        <p className="text-gray-500">
          Acesse o prontuário completo de cada paciente
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {pacientes && pacientes.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {pacientes.map((paciente: any) => (
              <Link
                key={paciente.id}
                href={`/dashboard/pacientes/${paciente.id}`}
                className="flex items-center justify-between p-6 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-nutri-100 rounded-full flex items-center justify-center text-nutri-700 font-medium">
                    {paciente.nome
                      .split(' ')
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{paciente.nome}</h3>
                    <p className="text-sm text-gray-500">
                      Paciente desde {new Date(paciente.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-nutri-600 hover:text-nutri-700 font-medium">
                  Abrir prontuário →
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">Nenhum paciente cadastrado</p>
            <Link
              href="/dashboard/pacientes/novo"
              className="inline-flex items-center px-4 py-2 bg-nutri-600 text-white rounded-lg hover:bg-nutri-700 transition"
            >
              + Cadastrar primeiro paciente
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
