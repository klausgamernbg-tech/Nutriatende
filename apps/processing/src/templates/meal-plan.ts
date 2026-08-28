// ============================================================
// Nutri Atende — Meal Plan HTML Template
// ============================================================

interface ClinicaConfig {
  template_pdf?: {
    cor_cabecalho?: string;
    rodape_texto?: string;
  };
}

interface ClinicaData {
  nome?: string;
  configuracoes?: ClinicaConfig;
}

interface PlanoData {
  titulo?: string;
  data_inicio: string;
  data_fim?: string;
  calorias_meta?: number;
  proteinas_meta?: number;
  carboidratos_meta?: number;
  gorduras_meta?: number;
  observacoes?: string;
  paciente?: { nome: string; data_nascimento?: string };
  nutricionista?: { nome: string };
  clinica?: ClinicaData;
  itens?: Array<{
    refeicao: string;
    ordem: number;
    alimento: string;
    quantidade?: string;
    calorias?: number;
    proteinas?: number;
    carboidratos?: number;
    gorduras?: number;
    observacoes?: string;
  }>;
}

export function renderMealPlanHTML(plano: PlanoData): string {
  const clinica = plano.clinica || { nome: 'Nutri Atende', configuracoes: {} };
  const config = clinica.configuracoes?.template_pdf || {};
  const corCabecalho = config.cor_cabecalho || '#10B981';
  const rodapeTexto = config.rodape_texto || clinica.nome || 'Nutri Atende';

  // Group items by refeicao
  const refeicoes = new Map<string, typeof plano.itens>();
  if (plano.itens) {
    for (const item of plano.itens) {
      const existing = refeicoes.get(item.refeicao) || [];
      existing.push(item);
      refeicoes.set(item.refeicao, existing);
    }
  }

  // Calculate age if data_nascimento provided
  let idade = '';
  if (plano.paciente?.data_nascimento) {
    const nascimento = new Date(plano.paciente.data_nascimento);
    const hoje = new Date();
    idade = `${Math.floor((hoje.getTime() - nascimento.getTime()) / (365.25 * 24 * 60 * 60 * 1000))} anos`;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.5; }
        
        .header { 
          background: ${corCabecalho}; 
          color: white; 
          padding: 30px; 
          text-align: center;
        }
        .header h1 { font-size: 24px; margin-bottom: 5px; }
        .header p { font-size: 14px; opacity: 0.9; }
        
        .content { padding: 30px; }
        
        .patient-info { 
          display: flex; 
          justify-content: space-between; 
          background: #f9fafb; 
          padding: 20px; 
          border-radius: 8px;
          margin-bottom: 25px;
        }
        .patient-info .col { flex: 1; }
        .patient-info .label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
        .patient-info .value { font-size: 14px; font-weight: bold; margin-top: 2px; }
        
        .macros { 
          display: flex; 
          gap: 15px; 
          margin-bottom: 25px;
        }
        .macro-card {
          flex: 1;
          background: #f0fdf4;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }
        .macro-card .number { font-size: 24px; font-weight: bold; color: #16a34a; }
        .macro-card .label { font-size: 12px; color: #6b7280; margin-top: 4px; }
        
        .refeicao-section { margin-bottom: 25px; }
        .refeicao-title { 
          font-size: 16px; 
          font-weight: bold; 
          color: ${corCabecalho}; 
          padding-bottom: 8px;
          border-bottom: 2px solid ${corCabecalho};
          margin-bottom: 10px;
        }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        th { 
          background: #f9fafb; 
          padding: 10px 12px; 
          text-align: left; 
          font-size: 11px;
          text-transform: uppercase;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }
        td { 
          padding: 10px 12px; 
          border-bottom: 1px solid #f3f4f6;
          font-size: 13px;
        }
        tr:last-child td { border-bottom: none; }
        
        .subtotal { 
          font-size: 12px; 
          color: #6b7280; 
          text-align: right; 
          padding: 5px 12px;
        }
        
        .observacoes {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 8px;
          padding: 15px;
          margin-top: 25px;
        }
        .observacoes h3 { font-size: 14px; color: #92400e; margin-bottom: 8px; }
        .observacoes p { font-size: 13px; color: #78350f; }
        
        .footer { 
          margin-top: 40px; 
          padding-top: 20px; 
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 11px;
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${clinica.nome || 'Nutri Atende'}</h1>
        <p>${plano.titulo || 'Plano Alimentar'}</p>
      </div>
      
      <div class="content">
        <div class="patient-info">
          <div class="col">
            <div class="label">Paciente</div>
            <div class="value">${plano.paciente?.nome || '—'}</div>
          </div>
          <div class="col">
            <div class="label">Idade</div>
            <div class="value">${idade || '—'}</div>
          </div>
          <div class="col">
            <div class="label">Vigência</div>
            <div class="value">
              ${new Date(plano.data_inicio).toLocaleDateString('pt-BR')}
              ${plano.data_fim ? ` — ${new Date(plano.data_fim).toLocaleDateString('pt-BR')}` : ''}
            </div>
          </div>
          <div class="col">
            <div class="label">Nutricionista</div>
            <div class="value">${plano.nutricionista?.nome || '—'}</div>
          </div>
        </div>
        
        ${plano.calorias_meta ? `
        <div class="macros">
          <div class="macro-card">
            <div class="number">${plano.calorias_meta}</div>
            <div class="label">Calorias (kcal)</div>
          </div>
          ${plano.proteinas_meta ? `
          <div class="macro-card">
            <div class="number">${plano.proteinas_meta}g</div>
            <div class="label">Proteínas</div>
          </div>
          ` : ''}
          ${plano.carboidratos_meta ? `
          <div class="macro-card">
            <div class="number">${plano.carboidratos_meta}g</div>
            <div class="label">Carboidratos</div>
          </div>
          ` : ''}
          ${plano.gorduras_meta ? `
          <div class="macro-card">
            <div class="number">${plano.gorduras_meta}g</div>
            <div class="label">Gorduras</div>
          </div>
          ` : ''}
        </div>
        ` : ''}
        
        ${Array.from(refeicoes.entries()).map(([refeicao, itens]) => `
        <div class="refeicao-section">
          <div class="refeicao-title">${refeicao}</div>
          <table>
            <thead>
              <tr>
                <th>Alimento</th>
                <th>Quantidade</th>
                <th style="text-align:right">Kcal</th>
                <th style="text-align:right">P</th>
                <th style="text-align:right">C</th>
                <th style="text-align:right">G</th>
              </tr>
            </thead>
            <tbody>
              ${itens!.map(item => `
              <tr>
                <td>${item.alimento}${item.observacoes ? ` <em>(${item.observacoes})</em>` : ''}</td>
                <td>${item.quantidade || '—'}</td>
                <td style="text-align:right">${item.calorias ? Number(item.calorias).toFixed(0) : '—'}</td>
                <td style="text-align:right">${item.proteinas ? Number(item.proteinas).toFixed(1) : '—'}</td>
                <td style="text-align:right">${item.carboidratos ? Number(item.carboidratos).toFixed(1) : '—'}</td>
                <td style="text-align:right">${item.gorduras ? Number(item.gorduras).toFixed(1) : '—'}</td>
              </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="subtotal">
            Subtotal: ${itens!.reduce((sum, i) => sum + (Number(i.calorias) || 0), 0).toFixed(0)} kcal
            | P: ${itens!.reduce((sum, i) => sum + (Number(i.proteinas) || 0), 0).toFixed(1)}g
            | C: ${itens!.reduce((sum, i) => sum + (Number(i.carboidratos) || 0), 0).toFixed(1)}g
            | G: ${itens!.reduce((sum, i) => sum + (Number(i.gorduras) || 0), 0).toFixed(1)}g
          </div>
        </div>
        `).join('')}
        
        ${plano.observacoes ? `
        <div class="observacoes">
          <h3>📋 Observações</h3>
          <p>${plano.observacoes}</p>
        </div>
        ` : ''}
      </div>
      
      <div class="footer">
        <p>${rodapeTexto}</p>
        <p>Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
        <p>Este plano alimentar é de uso exclusivo do paciente e deve ser seguido sob orientação profissional.</p>
      </div>
    </body>
    </html>
  `;
}
