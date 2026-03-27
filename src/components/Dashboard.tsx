import React from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart as PieChartIcon, 
  BarChart as BarChartIcon, 
  LineChart as LineChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from "recharts";
import { formatCurrency, formatPercent, cn } from "../lib/utils";
import { FinancialData } from "../types";

interface DashboardProps {
  data: FinancialData;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsPercent: number;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#64748b"];

export function Dashboard({ data, totalIncome, totalExpenses, balance, savingsPercent }: DashboardProps) {
  const categoryData = Object.entries(
    data.transactions
      .filter((t) => t.type === "Despesa")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.value;
        return acc;
      }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const getMonthlyStats = () => {
    const stats = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('pt-BR', { month: 'short' });
      
      const monthTransactions = data.transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear();
      });
      
      const receita = monthTransactions
        .filter(t => t.type === 'Receita')
        .reduce((acc, t) => acc + t.value, 0);
        
      const despesa = monthTransactions
        .filter(t => t.type === 'Despesa')
        .reduce((acc, t) => acc + t.value, 0);
        
      stats.push({
        name: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1).replace('.', ''),
        receita,
        despesa
      });
    }
    return stats;
  };

  const monthlyData = getMonthlyStats();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthExpenses = data.transactions.filter(t => {
    const tDate = new Date(t.date);
    return t.type === "Despesa" && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
  });

  const spentByCategory = currentMonthExpenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.value;
    return acc;
  }, {} as Record<string, number>);

  const budgetAlerts = data.budgets.map(budget => {
    const spent = spentByCategory[budget.category] || 0;
    const diff = spent - budget.planned;
    const percent = (spent / budget.planned) * 100;
    return {
      category: budget.category,
      planned: budget.planned,
      spent,
      diff,
      percent,
      isOver: diff > 0
    };
  }).sort((a, b) => b.diff - a.diff);

  const overBudgetItems = budgetAlerts.filter(a => a.isOver);

  return (
    <div className="space-y-8">
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Visão Executiva</h2>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
          <CalendarIcon className="w-4 h-4" />
          <span className="capitalize">
            {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total de Receitas", value: totalIncome, icon: TrendingUp, color: "emerald", trend: "+12%" },
          { title: "Total de Despesas", value: totalExpenses, icon: TrendingDown, color: "rose", trend: "+5%", isNegative: true },
          { title: "Saldo Atual", value: balance, icon: Wallet, color: "blue", trend: "+8%" },
          { title: "Economia", value: savingsPercent, icon: PieChartIcon, color: "amber", trend: "+2%", isPercent: true },
        ].map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <KPICard {...kpi} />
          </motion.div>
        ))}
      </div>

      {/* Budget Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Controle de Gastos Excedentes</h3>
              <p className="text-sm text-slate-500">Categorias que ultrapassaram o orçamento planejado este mês</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Excedido</span>
            <p className="text-xl font-bold text-rose-600">
              {formatCurrency(overBudgetItems.reduce((acc, curr) => acc + curr.diff, 0))}
            </p>
          </div>
        </div>

        {overBudgetItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {overBudgetItems.map((item, idx) => (
              <div key={item.category} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <AlertTriangle className="w-12 h-12 text-rose-600" />
                </div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-bold text-slate-700">{item.category}</span>
                  <span className="text-xs font-bold px-2 py-1 bg-rose-100 text-rose-700 rounded-lg">
                    +{formatPercent((item.percent - 100) / 100)}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Planejado: {formatCurrency(item.planned)}</span>
                    <span className="text-rose-600 font-bold">Gasto: {formatCurrency(item.spent)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-rose-500 rounded-full" 
                      style={{ width: '100%' }}
                    />
                  </div>
                  <p className="text-xs text-rose-600 font-medium">
                    Excedeu em <span className="font-bold">{formatCurrency(item.diff)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 bg-emerald-50/50 rounded-2xl border border-dashed border-emerald-200">
            <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
            <h4 className="text-lg font-bold text-emerald-900">Tudo sob controle!</h4>
            <p className="text-sm text-emerald-700">Nenhum orçamento foi excedido até o momento este mês.</p>
          </div>
        )}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribution by Category */}
        <motion.div 
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-emerald-500" />
              Gastos por Categoria
            </h3>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Comparison */}
        <motion.div 
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <BarChartIcon className="w-5 h-5 text-blue-500" />
              Comparativo Mensal
            </h3>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `R$ ${v}`} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="despesa" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Evolution Over Time */}
        <motion.div 
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-amber-500" />
              Evolução de Gastos
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `R$ ${v}`} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="despesa" 
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color, trend, isPercent = false, isNegative = false }: any) {
  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  }[color as "emerald" | "rose" | "blue" | "amber"];

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-2xl border transition-colors group-hover:scale-110 duration-300", colorClasses)}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
          isNegative ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
        )}>
          {isNegative ? <ArrowUpRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-slate-900 font-display">
          {isPercent ? formatPercent(value) : formatCurrency(value)}
        </h4>
      </div>
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
