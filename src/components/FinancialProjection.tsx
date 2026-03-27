import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  ArrowRight, 
  Info,
  LineChart as LineChartIcon,
  Zap,
  Plus,
  Edit2,
  Trash2,
  Home,
  Car,
  Plane,
  Star,
  CheckCircle2,
  Clock,
  X
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { formatCurrency, cn } from "../lib/utils";
import { FinancialData, FinancialGoal } from "../types";

interface FinancialProjectionProps {
  data: FinancialData;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  onAddGoal: (goal: Omit<FinancialGoal, "id">) => void;
  onUpdateGoal: (id: string, updated: Partial<FinancialGoal>) => void;
  onDeleteGoal: (id: string) => void;
}

export function FinancialProjection({ 
  data, 
  totalIncome, 
  totalExpenses, 
  balance,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal
}: FinancialProjectionProps) {
  const [years, setYears] = useState(5);
  const [annualReturn, setAnnualReturn] = useState(8); // 8% default
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [formData, setFormData] = useState<Omit<FinancialGoal, "id">>({
    name: "",
    targetValue: 0,
    currentValue: 0,
    deadline: new Date().toISOString().split('T')[0],
    category: "Outro",
    color: "bg-indigo-500"
  });
  
  const monthlySavings = totalIncome - totalExpenses;
  const currentAssets = data.investments.reduce((acc, i) => acc + i.value, 0);

  const projectionData = useMemo(() => {
    const months = years * 12;
    const monthlyReturnRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
    let currentBalance = currentAssets;
    
    const results = [];
    
    for (let i = 0; i <= months; i++) {
      if (i > 0) {
        // Add monthly savings and apply interest
        currentBalance = (currentBalance + monthlySavings) * (1 + monthlyReturnRate);
      }
      
      // Only push data for every 6 months or the first/last to keep chart clean
      if (i % 6 === 0 || i === months) {
        results.push({
          month: i,
          year: (i / 12).toFixed(1),
          label: i === 0 ? "Hoje" : `${(i / 12).toFixed(0)} anos`,
          valor: Math.round(currentBalance),
          investido: Math.round(currentAssets + monthlySavings * i)
        });
      }
    }
    return results;
  }, [years, annualReturn, monthlySavings, currentAssets]);

  const finalValue = projectionData[projectionData.length - 1].valor;
  const totalInvested = projectionData[projectionData.length - 1].investido;
  const totalInterest = finalValue - totalInvested;

  const handleOpenModal = (goal?: FinancialGoal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        name: goal.name,
        targetValue: goal.targetValue,
        currentValue: goal.currentValue,
        deadline: goal.deadline,
        category: goal.category,
        color: goal.color
      });
    } else {
      setEditingGoal(null);
      setFormData({
        name: "",
        targetValue: 0,
        currentValue: 0,
        deadline: new Date().toISOString().split('T')[0],
        category: "Outro",
        color: "bg-indigo-500"
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoal) {
      onUpdateGoal(editingGoal.id, formData);
    } else {
      onAddGoal(formData);
    }
    setIsModalOpen(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Casa": return Home;
      case "Veículo": return Car;
      case "Viagem": return Plane;
      case "Reserva": return Zap;
      default: return Star;
    }
  };

  const calculateRemainingMonths = (deadline: string) => {
    const now = new Date();
    const target = new Date(deadline);
    const diff = target.getTime() - now.getTime();
    const months = Math.ceil(diff / (1000 * 60 * 60 * 24 * 30));
    return months > 0 ? months : 0;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Projeção de Futuro</h2>
          <p className="text-slate-500 mt-1">Simule o crescimento do seu patrimônio ao longo do tempo</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 px-3">
            <span className="text-sm font-bold text-slate-500">Anos:</span>
            <select 
              className="bg-slate-50 border-none rounded-xl px-2 py-1 font-bold text-slate-900 focus:ring-0"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value))}
            >
              <option value={1}>1 ano</option>
              <option value={3}>3 anos</option>
              <option value={5}>5 anos</option>
              <option value={10}>10 anos</option>
              <option value={20}>20 anos</option>
            </select>
          </div>
          <div className="w-px h-6 bg-slate-100" />
          <div className="flex items-center gap-2 px-3">
            <span className="text-sm font-bold text-slate-500">Retorno Anual:</span>
            <div className="flex items-center gap-1">
              <input 
                type="number" 
                className="w-16 bg-slate-50 border-none rounded-xl px-2 py-1 font-bold text-slate-900 focus:ring-0"
                value={annualReturn}
                onChange={(e) => setAnnualReturn(parseFloat(e.target.value))}
              />
              <span className="text-sm font-bold text-slate-900">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 group">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Patrimônio Projetado</p>
          <h4 className="text-3xl font-black text-slate-900">{formatCurrency(finalValue)}</h4>
          <p className="text-emerald-600 text-sm font-bold mt-4 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Em {years} anos
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Investido</p>
          <h4 className="text-3xl font-black text-slate-900">{formatCurrency(totalInvested)}</h4>
          <p className="text-slate-500 text-sm font-medium mt-4">Capital próprio aportado</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Juros Acumulados</p>
          <h4 className="text-3xl font-black text-emerald-600">{formatCurrency(totalInterest)}</h4>
          <p className="text-slate-500 text-sm font-medium mt-4">Rendimento do tempo</p>
        </div>
      </div>

      {/* Projection Chart */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <LineChartIcon className="w-5 h-5 text-indigo-500" />
            Curva de Crescimento Patrimonial
          </h3>
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-slate-500">Patrimônio Total</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <span className="text-slate-500">Total Investido</span>
            </div>
          </div>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="colorPatrimonio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="valor" 
                name="Patrimônio Total"
                stroke="#6366f1" 
                fillOpacity={1} 
                fill="url(#colorPatrimonio)" 
                strokeWidth={4} 
              />
              <Area 
                type="monotone" 
                dataKey="investido" 
                name="Total Investido"
                stroke="#cbd5e1" 
                fill="transparent" 
                strokeWidth={2} 
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategy Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" />
            Poder dos Juros Compostos
          </h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-lg">Aporte Mensal: {formatCurrency(monthlySavings)}</p>
                <p className="text-slate-400 text-sm">Baseado no seu saldo atual de receitas e despesas.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-bold text-lg">Tempo: {years} anos</p>
                <p className="text-slate-400 text-sm">O tempo é o fator mais importante no crescimento exponencial.</p>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-sm italic text-slate-300">
                "Os juros compostos são a oitava maravilha do mundo. Aquele que entende, ganha; aquele que não entende, paga."
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Info className="w-6 h-6 text-blue-500" />
            Análise da Projeção
          </h3>
          <div className="space-y-4">
            <p className="text-slate-600 leading-relaxed">
              Com base no seu comportamento atual, você está economizando <span className="font-bold text-emerald-600">{formatCurrency(monthlySavings)}</span> por mês.
            </p>
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-sm font-bold text-blue-800">Cenário Otimista:</p>
              <p className="text-sm text-blue-700 mt-1">
                Se você conseguir aumentar seu aporte em 10%, seu patrimônio final seria de <span className="font-bold">{formatCurrency(finalValue * 1.1)}</span>.
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-sm font-bold text-amber-800">Dica de Especialista:</p>
              <p className="text-sm text-amber-700 mt-1">
                Mantenha seu custo de vida estável enquanto sua renda cresce para acelerar drasticamente esta curva.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Future Plans & Goals Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Planos Futuros & Sonhos</h3>
            <p className="text-slate-500 mt-1">Acompanhe o progresso dos seus objetivos de vida</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200"
          >
            <Plus className="w-5 h-5" />
            Novo Plano
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.goals.map((goal) => {
            const Icon = getCategoryIcon(goal.category);
            const progress = (goal.currentValue / goal.targetValue) * 100;
            const remainingMonths = calculateRemainingMonths(goal.deadline);
            const monthlyRequired = remainingMonths > 0 
              ? (goal.targetValue - goal.currentValue) / remainingMonths 
              : 0;

            return (
              <div key={goal.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-500">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg", goal.color || "bg-indigo-500")}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">{goal.name}</h4>
                      <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                        <Calendar className="w-4 h-4" />
                        Meta: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenModal(goal)}
                      className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Progresso</p>
                      <p className="text-2xl font-black text-slate-900">
                        {formatCurrency(goal.currentValue)} <span className="text-slate-400 text-sm font-bold">/ {formatCurrency(goal.targetValue)}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-emerald-600">{progress.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-1000", goal.color || "bg-indigo-500")}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tempo Restante</p>
                        <p className="text-sm font-bold text-slate-900">{remainingMonths} meses</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aporte Sugerido</p>
                        <p className="text-sm font-bold text-slate-900">{formatCurrency(monthlyRequired)}/mês</p>
                      </div>
                    </div>
                  </div>

                  {progress >= 100 && (
                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-bold">Objetivo Alcançado! Parabéns!</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{editingGoal ? "Editar Plano" : "Novo Plano de Futuro"}</h3>
                <p className="text-slate-500 text-sm">Defina seus objetivos e acompanhe o progresso</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors shadow-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nome do Sonho/Plano</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Compra da Casa Própria"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 focus:border-indigo-500 focus:ring-0 transition-all font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Valor Alvo</label>
                  <input 
                    type="number"
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 focus:border-indigo-500 focus:ring-0 transition-all font-medium"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Valor Já Reservado</label>
                  <input 
                    type="number"
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 focus:border-indigo-500 focus:ring-0 transition-all font-medium"
                    value={formData.currentValue}
                    onChange={(e) => setFormData({ ...formData, currentValue: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Data Limite</label>
                  <input 
                    type="date"
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 focus:border-indigo-500 focus:ring-0 transition-all font-medium"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Categoria</label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 focus:border-indigo-500 focus:ring-0 transition-all font-medium"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  >
                    <option value="Casa">Casa</option>
                    <option value="Veículo">Veículo</option>
                    <option value="Viagem">Viagem</option>
                    <option value="Reserva">Reserva</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">Cor de Destaque</label>
                <div className="flex gap-3">
                  {["bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-rose-500", "bg-amber-500", "bg-indigo-500"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={cn(
                        "w-10 h-10 rounded-full transition-all duration-300",
                        color,
                        formData.color === color ? "ring-4 ring-slate-200 scale-110 shadow-lg" : "opacity-60 hover:opacity-100"
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-4 rounded-2xl font-bold transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200"
                >
                  {editingGoal ? "Salvar Alterações" : "Criar Plano"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
