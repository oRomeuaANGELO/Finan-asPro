import React from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Flame
} from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";
import { FinancialData } from "../types";
import { motion } from "motion/react";

interface CalendarProps {
  data: FinancialData;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function Calendar({ data }: CalendarProps) {
  // Mock monthly totals for the year
  const monthlyTotals = [
    { month: "Jan", income: 4500, expense: 3200 },
    { month: "Fev", income: 4800, expense: 3500 },
    { month: "Mar", income: 5000, expense: 2800 },
    { month: "Abr", income: 0, expense: 0 },
    { month: "Mai", income: 0, expense: 0 },
    { month: "Jun", income: 0, expense: 0 },
    { month: "Jul", income: 0, expense: 0 },
    { month: "Ago", income: 0, expense: 0 },
    { month: "Set", income: 0, expense: 0 },
    { month: "Out", income: 0, expense: 0 },
    { month: "Nov", income: 0, expense: 0 },
    { month: "Dez", income: 0, expense: 0 },
  ];

  const maxExpense = Math.max(...monthlyTotals.map(m => m.expense));
  const maxSavings = Math.max(...monthlyTotals.map(m => m.income - m.expense));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Calendário Financeiro</h2>
          <p className="text-slate-500 mt-1">Visão estratégica anual por mês</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <button className="p-2 hover:bg-slate-50 rounded-xl transition-all">
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <span className="font-bold text-slate-900 px-4">2026</span>
          <button className="p-2 hover:bg-slate-50 rounded-xl transition-all">
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Annual Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
            <TrendingDown className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Mês com maior gasto</p>
            <h4 className="text-2xl font-bold text-slate-900">Fevereiro</h4>
            <p className="text-rose-600 font-bold mt-1">{formatCurrency(maxExpense)}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Mês com maior economia</p>
            <h4 className="text-2xl font-bold text-slate-900">Março</h4>
            <p className="text-emerald-600 font-bold mt-1">{formatCurrency(maxSavings)}</p>
          </div>
        </div>
      </div>

      {/* Annual Grid */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Heatmap de Consumo Anual
          </h3>
          
          {/* Legend */}
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intensidade:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500">Baixa</span>
              <div className="flex gap-0.5">
                {[0.2, 0.4, 0.6, 0.8, 1].map((op) => (
                  <div 
                    key={op} 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: `rgba(239, 68, 68, ${0.1 + op * 0.5})` }} 
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-slate-500">Alta</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {MONTHS.map((month, index) => {
            const data = monthlyTotals[index];
            const intensity = data.expense > 0 ? (data.expense / maxExpense) : 0;
            const savings = data.income - data.expense;

            return (
              <div 
                key={month} 
                className={cn(
                  "p-6 rounded-3xl border transition-all duration-500 group hover:scale-105 relative overflow-hidden",
                  data.expense === 0 
                    ? "bg-slate-50/30 border-slate-100 opacity-40" 
                    : "shadow-sm"
                )}
                style={data.expense > 0 ? {
                  backgroundColor: `rgba(239, 68, 68, ${0.05 + intensity * 0.2})`,
                  borderColor: `rgba(239, 68, 68, ${0.1 + intensity * 0.3})`,
                } : {}}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={cn(
                    "font-bold text-sm",
                    data.expense > 0 ? "text-rose-900" : "text-slate-400"
                  )}>
                    {month}
                  </span>
                  {data.expense > 0 && (
                    <div 
                      className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)]" 
                      style={{ 
                        backgroundColor: `rgba(239, 68, 68, ${0.4 + intensity * 0.6})`,
                      }} 
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className={data.expense > 0 ? "text-rose-700/60" : "text-slate-400"}>Gastos</span>
                    <span className={data.expense > 0 ? "text-rose-900" : "text-slate-900"}>{formatCurrency(data.expense)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className={data.expense > 0 ? "text-rose-700/60" : "text-slate-400"}>Economia</span>
                    <span className={data.expense > 0 ? "text-emerald-700" : "text-emerald-600"}>{formatCurrency(savings)}</span>
                  </div>
                  <div className="h-1.5 bg-white/50 rounded-full mt-2 overflow-hidden border border-black/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${intensity * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-rose-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.2)]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
