// ============================================================
// Nutri Atende — PDF Generator Service
// Generates PDFs using Playwright for rendering HTML templates
// ============================================================

import { chromium } from 'playwright';
import type { Page } from 'playwright';
import { renderMealPlanHTML } from '../templates/meal-plan.js';

export async function generateMealPlanPDF(plano: any): Promise<Buffer> {
  const browser = await chromium.launch({ headless: true });

  try {
    const page: Page = await browser.newPage();

    // Generate HTML from template
    const html = renderMealPlanHTML(plano);

    // Set HTML content
    await page.setContent(html, { waitUntil: 'networkidle' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm',
      },
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
          <span>Página</span>
          <span class="pageNumber"></span>
          <span>de</span>
          <span class="totalPages"></span>
        </div>
      `,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

export async function generateReceiptPDF(transacao: any): Promise<Buffer> {
  const browser = await chromium.launch({ headless: true });

  try {
    const page: Page = await browser.newPage();

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; border-bottom: 2px solid #10B981; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #10B981; }
          .title { font-size: 18px; margin-top: 10px; color: #333; }
          .info { margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .label { color: #666; }
          .value { font-weight: bold; }
          .total { font-size: 18px; margin-top: 20px; padding: 15px; background: #f0fdf4; border-radius: 8px; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">${transacao.clinica?.nome || 'Nutri Atende'}</div>
          <div class="title">Recibo de Pagamento</div>
        </div>
        
        <div class="info">
          <div class="info-row">
            <span class="label">Número:</span>
            <span class="value">#${String(transacao.recibo_numero || 0).padStart(6, '0')}</span>
          </div>
          <div class="info-row">
            <span class="label">Data:</span>
            <span class="value">${new Date(transacao.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
          <div class="info-row">
            <span class="label">Paciente:</span>
            <span class="value">${transacao.paciente?.nome || '—'}</span>
          </div>
          <div class="info-row">
            <span class="label">Descrição:</span>
            <span class="value">${transacao.descricao || 'Sessão de consulta nutricional'}</span>
          </div>
          <div class="info-row">
            <span class="label">Método:</span>
            <span class="value">${transacao.metodo_pagamento || '—'}</span>
          </div>
        </div>
        
        <div class="total">
          <div class="info-row">
            <span class="label">Valor:</span>
            <span class="value">R$ ${Number(transacao.valor).toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>${transacao.clinica?.nome || ''}</p>
          <p>CNPJ: ${transacao.clinica?.cnpj || '—'}</p>
          <p>Documento gerado eletronicamente</p>
        </div>
      </body>
      </html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
