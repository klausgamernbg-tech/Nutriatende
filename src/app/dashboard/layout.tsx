// ============================================================
// Nutri Atende — Dashboard Layout
// Sidebar + Main content area
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Pacientes', href: '/dashboard/pacientes', icon: '👥' },
  { name: 'Agenda', href: '/dashboard/agenda', icon: '📅' },
  { name: 'Consultas', href: '/dashboard/consultas', icon: '📋' },
  { name: 'Planos Alimentares', href: '/dashboard/planos', icon: '🍽️' },
  { name: 'Prontuário', href: '/dashboard/prontuario', icon: '📁' },
];

const secondaryNav = [
  { name: 'Configurações', href: '/dashboard/configuracoes', icon: '⚙️' },
  { name: 'Ajuda', href: '/dashboard/ajuda', icon: '❓' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-nutri-500 rounded-lg flex items-center justify-center">
              <span className="text-lg">🥗</span>
            </div>
            <span className="font-bold text-lg text-gray-900">Nutri Atende</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-nutri-50 text-nutri-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Secondary nav */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <nav className="space-y-1">
            {secondaryNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <h2 className="text-lg font-semibold text-gray-900 lg:hidden">
            Nutri Atende
          </h2>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700">
              <span className="text-xl">🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-nutri-100 rounded-full flex items-center justify-center text-nutri-700 font-medium text-sm">
                CN
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Dr. Carlos</p>
                <p className="text-xs text-gray-500">Nutricionista</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
