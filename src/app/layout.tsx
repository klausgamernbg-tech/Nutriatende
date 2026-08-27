// ============================================================
// Nutri Atende — Root Layout
// ============================================================

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nutri Atende — Gestão de Atendimento Nutricional',
  description:
    'Sistema completo de gestão para nutricionistas: cadastro de pacientes, agendamento, planos alimentares, prontuário evolutivo e muito mais.',
  keywords: [
    'nutricionista',
    'nutrição',
    'prontuário',
    'plano alimentar',
    'gestão clínica',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
