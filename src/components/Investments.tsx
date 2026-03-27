import React, { useState } from "react";
import { 
  TrendingUp, 
  ShieldCheck, 
  BarChart3, 
  PieChart as PieChartIcon,
  ArrowUpRight,
  Plus,
  Target,
  Edit2,
  Trash2,
  X,
  Save,
  Home,
  Car,
  Plane,
  Zap,
  Star,
  Clock,
  CheckCircle2,
  Wallet
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { MarketDashboard } from "./MarketDashboard";
import { formatCurrency, formatPercent, cn } from "../lib/utils";
import { FinancialData, Investment } from "../types";

interface InvestmentsProps {
  data: FinancialData;
  onSetGoal: (val: number) => void;
  onAdd: (investment: Omit<Investment, "id">) => void;
  onUpdate: (id: string, updated: Partial<Investment>) => void;
  onDelete: (id: string) => void;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export function Investments({ data, onSetGoal, onAdd, onUpdate, onDelete }: InvestmentsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    value: 0,
    quantity: 0,
    averagePrice: 0,
    date: new Date().toISOString().split("T")[0]
  });

  const totalInvested = data.investments.reduce((acc, i) => acc + i.value, 0);
  const totalBankBalance = data.bankAccounts.reduce((acc, a) => acc + a.balance, 0);
  const totalWealth = totalInvested + totalBankBalance;
  const emergencyFund = data.investments.find(i => i.category === "Fundo de Emergência")?.value || 0;
  
  const totalGoalsTarget = data.goals.reduce((acc, g) => acc + g.targetValue, 0);
  const totalGoalsCurrent = data.goals.reduce((acc, g) => acc + g.currentValue, 0);
  const overallGoalsProgress = totalGoalsTarget > 0 ? (totalGoalsCurrent / totalGoalsTarget) * 100 : 0;

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

  const investmentData = data.investments.reduce((acc, i) => {
    const existing = acc.find(item => item.name === i.category);
    if (existing) {
      existing.value += i.value;
    } else {
      acc.push({ name: i.category, value: i.value });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  const evolutionData = [
    { name: "Jan", valor: totalInvested * 0.85 },
    { name: "Fev", valor: totalInvested * 0.92 },
    { name: "Mar", valor: totalInvested },
  ];

  const handleOpenModal = (investment?: Investment) => {
    if (investment) {
      setEditingInvestment(investment);
      setFormData({
        category: investment.category,
        name: investment.name,
        value: investment.value,
        quantity: investment.quantity || 0,
        averagePrice: investment.averagePrice || 0,
        date: investment.date
      });
    } else {
      setEditingInvestment(null);
      setFormData({
        category: "",
        name: "",
        value: 0,
        quantity: 0,
        averagePrice: 0,
        date: new Date().toISOString().split("T")[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      // Only include quantity and averagePrice if they are greater than 0
      quantity: formData.quantity > 0 ? formData.quantity : undefined,
      averagePrice: formData.averagePrice > 0 ? formData.averagePrice : undefined,
    };

    if (editingInvestment) {
      onUpdate(editingInvestment.id, payload);
    } else {
      onAdd(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Reserva e Investimentos</h2>
          <p className="text-slate-500 mt-1">Construa seu patrimônio com estratégia</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Novo Investimento
        </button>
      </div>

      <MarketDashboard />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-24 h-24" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Patrimônio Total</p>
          <h4 className="text-3xl font-black text-slate-900">{formatCurrency(totalWealth)}</h4>
          <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold mt-4">
            <ArrowUpRight className="w-4 h-4" />
            Investido: {formatCurrency(totalInvested)}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet className="w-24 h-24" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Saldo em Contas</p>
          <h4 className="text-3xl font-black text-slate-900">{formatCurrency(totalBankBalance)}</h4>
          <p className="text-slate-500 text-sm font-medium mt-4">{data.bankAccounts.length} contas ativas</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-24 h-24" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Fundo de Emergência</p>
          <h4 className="text-3xl font-black text-slate-900">{formatCurrency(emergencyFund)}</h4>
          <p className="text-slate-500 text-sm font-medium mt-4">Meta: 6 meses de despesas</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Target className="w-24 h-24" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Meta de Economia</p>
          <div className="flex items-center gap-4 mt-2">
            <input 
              type="number" 
              className="w-20 bg-slate-50 border-none rounded-xl px-2 py-1 font-black text-2xl focus:ring-0"
              value={data.savingsGoalPercent}
              onChange={(e) => onSetGoal(parseInt(e.target.value))}
            />
            <span className="text-2xl font-black text-slate-900">%</span>
          </div>
          <p className="text-slate-500 text-sm font-medium mt-4">Da sua renda mensal</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-blue-500" />
            Distribuição de Ativos
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={investmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {investmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            Evolução Patrimonial
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData}>
                <defs>
                  <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `R$ ${v}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Area type="monotone" dataKey="valor" stroke="#10b981" fillOpacity={1} fill="url(#colorValor)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Long Term Goals Integration */}
      {data.goals.length > 0 && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-6 h-6 text-indigo-500" />
                Progresso das Metas de Longo Prazo
              </h3>
              <p className="text-slate-500 text-sm mt-1">Seu patrimônio total em relação aos seus sonhos</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Cobertura Geral</p>
              <p className="text-2xl font-black text-indigo-600">{overallGoalsProgress.toFixed(1)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.goals.map((goal) => {
              const Icon = getCategoryIcon(goal.category);
              const progress = (goal.currentValue / goal.targetValue) * 100;
              const remainingMonths = calculateRemainingMonths(goal.deadline);
              
              return (
                <div key={goal.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-sm", goal.color || "bg-indigo-500")}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 truncate">{goal.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {remainingMonths} meses restantes
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">{formatCurrency(goal.currentValue)}</span>
                      <span className="text-slate-900">{formatCurrency(goal.targetValue)}</span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-100">
                      <div 
                        className={cn("h-full transition-all duration-1000", goal.color || "bg-indigo-500")}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{progress.toFixed(0)}%</span>
                      {progress >= 100 && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Investment List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-bottom border-slate-50 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Meus Ativos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ativo</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Categoria</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Qtd / P.M.</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Valor Total</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.investments.map((investment) => (
                <tr key={investment.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{investment.name}</span>
                      <span className="text-xs text-slate-400">{new Date(investment.date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{investment.category}</span>
                  </td>
                  <td className="px-8 py-5">
                    {investment.quantity ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{investment.quantity} un.</span>
                        <span className="text-xs text-slate-400">P.M: {formatCurrency(investment.averagePrice || 0)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="font-bold text-emerald-600">{formatCurrency(investment.value)}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(investment)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(investment.id)}
                        className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                {editingInvestment ? "Editar Investimento" : "Novo Investimento"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Categoria</label>
                <select 
                  required
                  className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Ações">Ações (Stocks)</option>
                  <option value="Renda Fixa">Renda Fixa</option>
                  <option value="Fundo de Emergência">Fundo de Emergência</option>
                  <option value="Cripto">Cripto</option>
                  <option value="Fundos Imobiliários">Fundos Imobiliários (FIIs)</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Nome do Ativo</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: PETR4, Tesouro Selic, Bitcoin..."
                  className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Quantidade (Opcional)</label>
                  <input 
                    type="number"
                    step="0.000001"
                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={formData.quantity || ""}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Preço Médio (Opcional)</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={formData.averagePrice || ""}
                    onChange={(e) => setFormData({ ...formData, averagePrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Valor Atual Total</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                  <input 
                    type="number"
                    required
                    step="0.01"
                    className="w-full bg-slate-50 border-slate-200 rounded-2xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={formData.value || ""}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                {formData.quantity > 0 && formData.averagePrice > 0 && (
                  <p className="text-xs text-slate-400 mt-1">
                    Custo de aquisição: {formatCurrency(formData.quantity * formData.averagePrice)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Data</label>
                <input 
                  type="date"
                  required
                  className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {editingInvestment ? "Salvar Alterações" : "Adicionar Investimento"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
