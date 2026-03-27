import React, { useState, useEffect } from "react";
import { 
  BrainCircuit, 
  Sparkles, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp,
  RefreshCw,
  Heart
} from "lucide-react";
import { FinancialData } from "../types";
import { getSmartAnalysis } from "../services/gemini";
import { formatCurrency, cn } from "../lib/utils";

interface SmartAnalysisProps {
  data: FinancialData;
}

export function SmartAnalysis({ data }: SmartAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    const result = await getSmartAnalysis(data);
    setAnalysis(result);
    setLoading(false);
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Análise Inteligente</h2>
          <p className="text-slate-500 mt-1">Insights estratégicos gerados por IA baseados no seu comportamento</p>
        </div>
        <button 
          onClick={runAnalysis}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          Recalcular Insights
        </button>
      </div>

      {loading && !analysis && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center animate-pulse">
            <BrainCircuit className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-slate-500 font-medium animate-pulse">Processando seus dados financeiros...</p>
        </div>
      )}

      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Categories Analysis */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Categorias de Maior Impacto
            </h3>
            <div className="space-y-4">
              {analysis.topCategories?.map((cat: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-900">{cat.category}</p>
                    <p className="text-sm text-slate-500">{formatCurrency(cat.value)}</p>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold",
                    cat.status === "OK" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  )}>
                    {cat.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Emotional Insight */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
            <Heart className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10" />
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5" />
              Insight Comportamental
            </h3>
            <p className="text-indigo-100 leading-relaxed text-lg italic">
              "{analysis.emotionalInsight}"
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-indigo-200">
              <Sparkles className="w-4 h-4" />
              Dica: O controle emocional é a chave para o crescimento.
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Sugestões de Economia
            </h3>
            <ul className="space-y-4">
              {analysis.suggestions?.map((s: string, idx: number) => (
                <li key={idx} className="flex gap-3 text-slate-600 font-medium">
                  <div className="w-6 h-6 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-amber-600">{idx + 1}</span>
                  </div>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Alerts & Trends */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Alertas e Tendências
            </h3>
            <div className="space-y-4">
              {analysis.alerts?.map((a: string, idx: number) => (
                <div key={idx} className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 flex gap-3 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  {a}
                </div>
              ))}
              {analysis.trends?.map((t: string, idx: number) => (
                <div key={idx} className="p-4 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 flex gap-3 font-bold text-sm">
                  <TrendingUp className="w-5 h-5 flex-shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
