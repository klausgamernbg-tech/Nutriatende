// ============================================================
// Nutri Atende — Agenda Page (Interactive Calendar)
// Client component with monthly view, day selection, consultations
// ============================================================

'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Consulta {
  id: string;
  data_hora: string;
  tipo: string;
  status: string;
  valor: number | null;
  paciente: { id: string; nome: string } | null;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_NAMES_FULL = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toDateStr(d: Date) {
  return d.toISOString().split('T')[0];
}

export default function AgendaPage() {
  const supabase = createClient();
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(toDateStr(now));
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch consultations for current month
  useEffect(() => {
    async function load() {
      setLoading(true);
      const firstDay = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
      const lastDay = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${getDaysInMonth(currentYear, currentMonth)}`;

      const { data } = await supabase
        .from('consulta')
        .select('*, paciente:paciente_id (id, nome)')
        .gte('data_hora', firstDay)
        .lte('data_hora', lastDay + 'T23:59:59')
        .order('data_hora', { ascending: true });

      setConsultas(data || []);
      setLoading(false);
    }
    load();
  }, [currentYear, currentMonth]);

  // Map consultations by date
  const consultasByDate = useMemo(() => {
    const map: Record<string, Consulta[]> = {};
    consultas.forEach((c) => {
      const key = c.data_hora.split('T')[0];
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    return map;
  }, [consultas]);

  // Calendar grid
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [firstDay, daysInMonth]);

  const today = toDateStr(now);

  // Selected day consultations
  const selectedConsultas = consultasByDate[selectedDate] || [];

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  function goToday() {
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(toDateStr(now));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-500">
            {consultas.length} consulta{consultas.length !== 1 ? 's' : ''} em {MONTH_NAMES[currentMonth]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="px-3 py-2 text-sm font-medium text-nutri-700 bg-nutri-50 rounded-lg hover:bg-nutri-100 transition"
          >
            Hoje
          </button>
          <Link
            href="/dashboard/consultas/nova"
            className="inline-flex items-center px-4 py-2 bg-nutri-600 text-white text-sm font-medium rounded-lg hover:bg-nutri-700 transition"
          >
            + Nova Consulta
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Month Navigation */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day names header */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {DAY_NAMES.map((day) => (
                <div key={day} className="px-2 py-2 text-center text-xs font-semibold text-gray-500 uppercase">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, i) => {
                if (day === null) {
                  return <div key={`empty-${i}`} className="min-h-[72px] border-b border-r border-gray-50" />;
                }

                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isToday = dateStr === today;
                const isSelected = dateStr === selectedDate;
                const dayConsultas = consultasByDate[dateStr] || [];
                const hasConsultas = dayConsultas.length > 0;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`min-h-[72px] border-b border-r border-gray-50 p-1 text-left transition hover:bg-gray-50 relative ${
                      isSelected ? 'bg-nutri-50 ring-2 ring-inset ring-nutri-500' : ''
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full ${
                        isToday
                          ? 'bg-nutri-600 text-white'
                          : isSelected
                          ? 'text-nutri-700 font-bold'
                          : 'text-gray-700'
                      }`}
                    >
                      {day}
                    </span>
                    {/* Consultation dots */}
                    {hasConsultas && (
                      <div className="flex gap-0.5 mt-0.5 flex-wrap">
                        {dayConsultas.slice(0, 3).map((c, j) => (
                          <span
                            key={j}
                            className={`w-1.5 h-1.5 rounded-full ${
                              c.status === 'confirmada'
                                ? 'bg-green-500'
                                : c.status === 'cancelada'
                                ? 'bg-red-400'
                                : 'bg-blue-500'
                            }`}
                          />
                        ))}
                        {dayConsultas.length > 3 && (
                          <span className="text-[9px] text-gray-500">+{dayConsultas.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 px-6 py-3 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-500">Agendada</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-gray-500">Confirmada</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-xs text-gray-500">Cancelada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Day Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-20">
            <div className="px-6 py-4 border-b border-gray-100 bg-nutri-50">
              <p className="text-sm text-nutri-600 font-medium">
                {selectedDate === today ? 'Hoje' : DAY_NAMES_FULL[new Date(selectedDate + 'T12:00:00').getDay()]}
              </p>
              <p className="text-lg font-bold text-gray-900">
                {new Date(selectedDate + 'T12:00:00').getDate()} de {MONTH_NAMES[new Date(selectedDate + 'T12:00:00').getMonth()]}
              </p>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-nutri-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : selectedConsultas.length > 0 ? (
                <div className="space-y-3">
                  {selectedConsultas.map((c) => (
                    <Link
                      key={c.id}
                      href={`/dashboard/pacientes/${c.paciente?.id}`}
                      className="block p-3 rounded-lg border border-gray-100 hover:border-nutri-200 hover:bg-nutri-50/50 transition"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-gray-900">
                          {new Date(c.data_hora).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            c.status === 'confirmada'
                              ? 'bg-green-100 text-green-700'
                              : c.status === 'cancelada'
                              ? 'bg-red-100 text-red-600'
                              : c.status === 'realizada'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {c.status === 'agendada' && 'Agendada'}
                          {c.status === 'confirmada' && 'Confirmada'}
                          {c.status === 'realizada' && 'Realizada'}
                          {c.status === 'cancelada' && 'Cancelada'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        {c.paciente?.nome ?? 'Paciente'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {c.tipo === 'primeira' && '📋 Primeira consulta'}
                        {c.tipo === 'retorno' && '🔄 Retorno'}
                        {c.tipo === 'avaliação' && '📊 Avaliação'}
                        {c.valor != null && ` • R$ ${c.valor.toFixed(2)}`}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm mb-3">Nenhuma consulta neste dia</p>
                  <Link
                    href="/dashboard/consultas/nova"
                    className="inline-flex items-center px-3 py-1.5 bg-nutri-600 text-white text-xs font-medium rounded-lg hover:bg-nutri-700 transition"
                  >
                    + Agendar consulta
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
