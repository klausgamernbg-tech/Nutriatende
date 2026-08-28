"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    clinica_nome: "",
    clinica_cnpj: "",
    clinica_endereco: "",
    clinica_telefone: "",
    nutricionista_nome: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao configurar conta");
        return;
      }

      // Setup successful — redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white text-3xl font-bold mb-4">
            🥗
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bem-vindo ao Nutri Atende
          </h1>
          <p className="text-gray-500 mt-2">
            Vamos configurar sua conta em poucos passos
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Clinic Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                📋 Sua Clínica
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="clinica_nome"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nome da Clínica *
                  </label>
                  <input
                    id="clinica_nome"
                    name="clinica_nome"
                    type="text"
                    required
                    value={form.clinica_nome}
                    onChange={handleChange}
                    placeholder="Ex: Clínica NutriVida"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="clinica_cnpj"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    CNPJ <span className="text-gray-400">(opcional)</span>
                  </label>
                  <input
                    id="clinica_cnpj"
                    name="clinica_cnpj"
                    type="text"
                    value={form.clinica_cnpj}
                    onChange={handleChange}
                    placeholder="00.000.000/0000-00"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="clinica_endereco"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Endereço <span className="text-gray-400">(opcional)</span>
                  </label>
                  <input
                    id="clinica_endereco"
                    name="clinica_endereco"
                    type="text"
                    value={form.clinica_endereco}
                    onChange={handleChange}
                    placeholder="Rua, número, bairro, cidade - UF"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="clinica_telefone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Telefone da Clínica{" "}
                    <span className="text-gray-400">(opcional)</span>
                  </label>
                  <input
                    id="clinica_telefone"
                    name="clinica_telefone"
                    type="tel"
                    value={form.clinica_telefone}
                    onChange={handleChange}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Nutritionist Section */}
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                👩‍⚕️ Seu Perfil
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="nutricionista_nome"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Seu nome completo *
                  </label>
                  <input
                    id="nutricionista_nome"
                    name="nutricionista_nome"
                    type="text"
                    required
                    value={form.nutricionista_nome}
                    onChange={handleChange}
                    placeholder="Ex: Dra. Maria Silva"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Configurando..." : "Começar a usar 🚀"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Você poderá adicionar mais informações depois nas configurações.
        </p>
      </div>
    </div>
  );
}
