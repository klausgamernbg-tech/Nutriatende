// ============================================================
// Nutri Atende — Esqueci a Senha
// ============================================================

import Link from 'next/link';
import ForgotPasswordForm from './forgot-password-form';

export const metadata = {
  title: 'Esqueci a senha — Nutri Atende',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-nutri-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🥗</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Esqueceu a senha?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Informe seu email para receber um link de redefinição de senha.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <ForgotPasswordForm />

        <p className="mt-6 text-center text-sm text-gray-600">
          Lembrou a senha?{' '}
          <Link href="/login" className="font-medium text-nutri-600 hover:text-nutri-500">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
