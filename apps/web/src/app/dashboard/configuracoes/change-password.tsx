'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (currentPassword === newPassword) {
      setError('A nova senha deve ser diferente da atual');
      return;
    }

    setLoading(true);

    // Re-authenticate with current password first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      setError('Usuário não encontrado');
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      setError('Senha atual incorreta');
      setLoading(false);
      return;
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess('Senha alterada com sucesso!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Senha atual
        </label>
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-nutri-500 focus:border-nutri-500 outline-none"
          placeholder="Digite sua senha atual"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nova senha
        </label>
        <input
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-nutri-500 focus:border-nutri-500 outline-none"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar nova senha
        </label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-nutri-500 focus:border-nutri-500 outline-none"
          placeholder="Repita a nova senha"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2.5 bg-nutri-600 text-white text-sm font-medium rounded-lg hover:bg-nutri-700 transition disabled:opacity-50"
      >
        {loading ? 'Alterando...' : 'Alterar senha'}
      </button>
    </form>
  );
}
