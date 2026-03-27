import React, { useState } from "react";
import { 
  FileText, 
  Download, 
  Calendar, 
  CheckCircle2, 
  Info, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { FinancialData } from "../types";
import { generateAnnualReport, generateMonthlyReport, generateExpenseReport } from "../lib/reportGenerator";
import { formatCurrency, cn } from "../lib/utils";

interface ReportsProps {
  data: FinancialData;
}

export function Reports({ data }: ReportsProps) {
  const [isGeneratingAnnual, setIsGeneratingAnnual] = useState(false);
  const [isGeneratingMonthly, setIsGeneratingMonthly] = useState(false);
  const [isGeneratingExpense, setIsGeneratingExpense] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expenseMonth, setExpenseMonth] = useState(new Date().getMonth());
  const [expenseYear, setExpenseYear] = useState(new Date().getFullYear());

  const currentYear = new Date().getFullYear();
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handleDownloadAnnual = async () => {
    setIsGeneratingAnnual(true);
    setTimeout(() => {
      generateAnnualReport(data, currentYear);
      setIsGeneratingAnnual(false);
    }, 1500);
  };

  const handleDownloadMonthly = async () => {
    setIsGeneratingMonthly(true);
    setTimeout(() => {
      generateMonthlyReport(data, selectedMonth, selectedYear);
      setIsGeneratingMonthly(false);
    }, 1500);
  };

  const handleDownloadExpense = async () => {
    setIsGeneratingExpense(true);
    setTimeout(() => {
      generateExpenseReport(data, expenseMonth, expenseYear);
      setIsGeneratingExpense(false);
    }, 1500);
  };

  const totalIncome = data.transactions
    .filter(t => t.type === "Receita")
    .reduce((acc, t) => acc + t.value, 0);
  const totalExpenses = data.transactions
    .filter(t => t.type === "Despesa")
    .reduce((acc, t) => acc + t.value, 0);
  const balance = totalIncome - totalExpenses;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Relatórios Financeiros</h2>
          <p className="text-slate-500 mt-1">Gere documentos detalhados para análise e declaração</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Annual Report Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-32 h-44 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center group hover:border-emerald-300 transition-all shrink-0">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-xs font-bold text-slate-900">Relatório Anual {currentYear}</p>
              <p className="text-[10px] text-slate-400 mt-1">PDF • Completo</p>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Desempenho Anual</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Resumo abrangente de todas as movimentações do ano de {currentYear}.
                </p>
              </div>

              <button 
                onClick={handleDownloadAnnual}
                disabled={isGeneratingAnnual}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 text-sm"
              >
                {isGeneratingAnnual ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Baixar Anual
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Monthly Report Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-32 h-44 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center group hover:border-blue-300 transition-all shrink-0">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-xs font-bold text-slate-900">Relatório Mensal</p>
              <p className="text-[10px] text-slate-400 mt-1">PDF • Detalhado</p>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Relatório Mensal</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Extrato detalhado com todas as transações e análise de orçamento.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {months.map((month, idx) => (
                    <option key={idx} value={idx}>{month}</option>
                  ))}
                </select>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[currentYear, currentYear - 1, currentYear - 2].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleDownloadMonthly}
                disabled={isGeneratingMonthly}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 text-sm"
              >
                {isGeneratingMonthly ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Baixar Mensal
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Expense Report Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-32 h-44 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center group hover:border-rose-300 transition-all shrink-0">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <TrendingDown className="w-6 h-6 text-rose-500" />
              </div>
              <p className="text-xs font-bold text-slate-900">Relatório de Gastos</p>
              <p className="text-[10px] text-slate-400 mt-1">PDF • Focado em Despesas</p>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Relatório de Gastos</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Análise profunda apenas das suas despesas, categorias e meios de pagamento.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={expenseMonth}
                  onChange={(e) => setExpenseMonth(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {months.map((month, idx) => (
                    <option key={idx} value={idx}>{month}</option>
                  ))}
                </select>
                <select 
                  value={expenseYear}
                  onChange={(e) => setExpenseYear(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {[currentYear, currentYear - 1, currentYear - 2].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleDownloadExpense}
                disabled={isGeneratingExpense}
                className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-rose-200 transition-all active:scale-95 disabled:opacity-50 text-sm"
              >
                {isGeneratingExpense ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Baixar Relatório de Gastos
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Privacidade Garantida
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Seus relatórios são gerados localmente no seu navegador. 
              Nenhum dado financeiro sensível é enviado para nossos servidores durante a geração do PDF.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              Conteúdo do Relatório
            </h4>
            <ul className="space-y-3">
              {[
                "Resumo de Receitas e Despesas",
                "Gráficos de Distribuição",
                "Evolução de Investimentos",
                "Análise de Metas de Poupança",
                "Histórico de Contas Fixas"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Other Reports Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900">Outros Formatos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormatCard 
            title="Extrato em CSV" 
            description="Ideal para importar em outras planilhas ou softwares de contabilidade."
            icon={FileText}
            color="blue"
          />
          <FormatCard 
            title="Resumo de Impostos" 
            description="Agrupamento de despesas dedutíveis para facilitar sua declaração."
            icon={Calendar}
            color="amber"
          />
          <FormatCard 
            title="Análise de Investimentos" 
            description="Relatório focado exclusivamente na performance da sua carteira."
            icon={TrendingUp}
            color="emerald"
          />
        </div>
      </div>
    </div>
  );
}

function FormatCard({ title, description, icon: Icon, color }: any) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  }[color as "blue" | "amber" | "emerald"];

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border", colorClasses)}>
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="font-bold text-slate-900">{title}</h4>
      <p className="text-sm text-slate-500 mt-2 mb-4 leading-relaxed">{description}</p>
      <button className="text-sm font-bold text-slate-900 flex items-center gap-1 group-hover:gap-2 transition-all">
        Disponível em breve
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
