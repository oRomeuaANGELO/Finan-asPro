import React from "react";
import { 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown,
  ArrowRight
} from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";
import { FinancialData } from "../types";

interface PlanningProps {
  data: FinancialData;
  onUpdateBudget: (category: string, value: number) => void;
}

export function Planning({ data, onUpdateBudget }: PlanningProps) {
  const actualExpensesByCategory = data.transactions
    .filter((t) => t.type === "Despesa")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.value;
      return acc;
    }, {} as Record<string, number>);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Planejamento Mensal</h2>
        <p className="text-slate-500 mt-1">Defina metas e acompanhe seu orçamento em tempo real</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {data.budgets.map((budget) => {
          const actual = actualExpensesByCategory[budget.category] || 0;
          const diff = budget.planned - actual;
          const percent = budget.planned > 0 ? (actual / budget.planned) * 100 : 0;
          const isOver = actual > budget.planned;

          return (
            <div key={budget.category} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-4 rounded-2xl border transition-colors",
                    isOver ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                  )}>
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{budget.category}</h3>
                    <p className="text-sm text-slate-500">Orçamento mensal</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-8">
                  <div className="text-center md:text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Previsto</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-900">R$</span>
                      <input 
                        type="number" 
                        className="w-24 bg-slate-50 border-none rounded-xl px-2 py-1 font-bold text-lg focus:ring-2 focus:ring-emerald-500/20"
                        value={budget.planned}
                        onChange={(e) => onUpdateBudget(budget.category, parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Realizado</p>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(actual)}</p>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Diferença</p>
                    <p className={cn(
                      "text-lg font-bold flex items-center gap-1.5",
                      diff >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {diff >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {formatCurrency(Math.abs(diff))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className={cn(isOver ? "text-rose-600" : "text-emerald-600")}>
                    {percent.toFixed(1)}% utilizado
                  </span>
                  <span className="text-slate-400">Meta: {formatCurrency(budget.planned)}</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500 shadow-sm",
                      percent > 100 ? "bg-rose-500" : percent > 80 ? "bg-amber-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
                {isOver && (
                  <div className="flex items-center gap-2 text-rose-600 text-sm font-bold bg-rose-50 p-3 rounded-xl border border-rose-100 animate-pulse">
                    <AlertTriangle className="w-4 h-4" />
                    Atenção: Orçamento excedido em {formatCurrency(Math.abs(diff))}!
                  </div>
                )}
                {!isOver && percent > 0 && (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4" />
                    Excelente! Você está dentro da meta para {budget.category}.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
