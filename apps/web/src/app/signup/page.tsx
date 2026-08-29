// ============================================================
// Nutri Atende — Cadastro (Signup) Page
// ============================================================

import Link from 'next/link';
import SignupForm from './signup-form';

export const metadata = {
  title: 'Cadastre-se — Nutri Atende',
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-nutri-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🥗</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Crie sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Comece a gerenciar seus pacientes gratuitamente
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <SignupForm />

        <p className="mt-6 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link href="/login" className="font-medium text-nutri-600 hover:text-nutri-500">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
