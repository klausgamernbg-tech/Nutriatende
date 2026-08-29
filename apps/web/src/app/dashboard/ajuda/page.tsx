// ============================================================
// Nutri Atende — Ajuda Page
// ============================================================

export default function AjudaPage() {
  const faqItems = [
    {
      pergunta: 'Como cadastrar um novo paciente?',
      resposta:
        'Vá em Pacientes → + Novo Paciente. Preencha os dados básicos (nome, data de nascimento, telefone e email). O sistema validará duplicidade automaticamente.',
    },
    {
      pergunta: 'Como agendar uma consulta?',
      resposta:
        'Vá em Consultas → + Nova Consulta. Selecione o paciente, data, horário e tipo da consulta. Você pode configurar lembretes automáticos.',
    },
    {
      pergunta: 'Como criar um plano alimentar?',
      resposta:
        'Acesse o prontuário do paciente → + Criar Plano Alimentar. Defina a meta calórica e os macronutrientes. O sistema distribui automaticamente por refeição.',
    },
    {
      pergunta: 'Como registrar medidas corporais?',
      resposta:
        'No prontuário do paciente → + Registrar Medidas. Informe peso, altura e circunferências. O IMC é calculado automaticamente.',
    },
    {
      pergunta: 'Meus dados estão seguros?',
      resposta:
        'Sim! Todos os dados são criptografados em trânsito e repouso. Seguimos rigorosamente a LGPD. Você pode exportar ou solicitar exclusão de dados a qualquer momento.',
    },
    {
      pergunta: 'Posso acessar pelo celular?',
      resposta:
        'Sim! O sistema é responsivo e funciona bem em qualquer dispositivo. Em breve teremos um app nativo para pacientes.',
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ajuda</h1>
        <p className="text-gray-500">Dúvidas frequentes e suporte</p>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">❓ Perguntas Frequentes</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {faqItems.map((item, idx) => (
            <details key={idx} className="group">
              <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition font-medium text-gray-900 flex items-center justify-between">
                {item.pergunta}
                <span className="text-gray-400 group-open:rotate-180 transition">▼</span>
              </summary>
              <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
                {item.resposta}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">📞 Precisa de ajuda?</h2>
        <p className="text-sm text-gray-600 mb-4">
          Entre em contato com nosso suporte técnico para resolver dúvidas ou reportar problemas.
        </p>
        <div className="flex gap-3">
          <a
            href="mailto:suporte@nutriatende.com.br"
            className="px-4 py-2 bg-nutri-600 text-white rounded-lg hover:bg-nutri-700 transition text-sm font-medium"
          >
            📧 Enviar email
          </a>
          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
          >
            💬 WhatsApp
          </a>
        </div>
      </div>

      {/* Version */}
      <div className="text-center text-sm text-gray-400">
        Nutri Atende v1.0.0 — Nível 1 (Atendimento Básico)
      </div>
    </div>
  );
}
