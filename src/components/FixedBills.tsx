import React, { useState } from "react";
import { 
  Zap, 
  Droplets, 
  Wifi, 
  Home, 
  Shield, 
  Tv, 
  MoreHorizontal, 
  Plus, 
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Sparkles,
  Loader2,
  Settings,
  Bell,
  Clock,
  Phone,
  Heart,
  GraduationCap,
  Car,
  ShoppingBag,
  History
} from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";
import { FixedBill, TransactionStatus } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { suggestCategory } from "../services/gemini";
import { differenceInDays, parseISO, startOfDay, format } from "date-fns";

interface FixedBillsProps {
  bills: FixedBill[];
  alertDays: number[];
  onUpdateStatus: (id: string, status: TransactionStatus) => void;
  onUpdateAlertDays: (days: number[]) => void;
  onAdd: (bill: Omit<FixedBill, "id">) => void;
  onUpdate: (id: string, updated: Partial<FixedBill>) => void;
  onDelete: (id: string) => void;
}

const CATEGORIES = [
  { id: "energy", label: "Energia", icon: Zap, color: "text-amber-600 bg-amber-50 border-amber-100 shadow-amber-200/20" },
  { id: "water", label: "Água", icon: Droplets, color: "text-blue-600 bg-blue-50 border-blue-100 shadow-blue-200/20" },
  { id: "internet", label: "Internet", icon: Wifi, color: "text-indigo-600 bg-indigo-50 border-indigo-100 shadow-indigo-200/20" },
  { id: "rent", label: "Moradia", icon: Home, color: "text-emerald-600 bg-emerald-50 border-emerald-100 shadow-emerald-200/20" },
  { id: "insurance", label: "Seguro", icon: Shield, color: "text-rose-600 bg-rose-50 border-rose-100 shadow-rose-200/20" },
  { id: "subscription", label: "Assinaturas", icon: Tv, color: "text-purple-600 bg-purple-50 border-purple-100 shadow-purple-200/20" },
  { id: "phone", label: "Telefone", icon: Phone, color: "text-cyan-600 bg-cyan-50 border-cyan-100 shadow-cyan-200/20" },
  { id: "health", label: "Saúde", icon: Heart, color: "text-red-600 bg-red-50 border-red-100 shadow-red-200/20" },
  { id: "education", label: "Educação", icon: GraduationCap, color: "text-orange-600 bg-orange-50 border-orange-100 shadow-orange-200/20" },
  { id: "transport", label: "Transporte", icon: Car, color: "text-slate-700 bg-slate-100 border-slate-200 shadow-slate-200/20" },
  { id: "shopping", label: "Compras", icon: ShoppingBag, color: "text-pink-600 bg-pink-50 border-pink-100 shadow-pink-200/20" },
  { id: "other", label: "Outros", icon: MoreHorizontal, color: "text-slate-600 bg-slate-50 border-slate-100 shadow-slate-200/20" },
];

export function FixedBills({ 
  bills, 
  alertDays, 
  onUpdateStatus, 
  onUpdateAlertDays,
  onAdd,
  onUpdate,
  onDelete
}: FixedBillsProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<FixedBill | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [newAlertDay, setNewAlertDay] = useState("");
  const [expandedBillId, setExpandedBillId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    category: "other",
    status: "Pendente" as TransactionStatus,
    paymentMethod: "Pix",
    priority: "Média" as any
  });

  const today = startOfDay(new Date());

  const upcomingAlerts = bills
    .filter(b => b.status === "Pendente")
    .flatMap(bill => {
      const dueDate = startOfDay(parseISO(bill.dueDate));
      const daysRemaining = differenceInDays(dueDate, today);
      
      return alertDays
        .filter(days => daysRemaining === days)
        .map(days => ({
          bill,
          daysRemaining: days
        }));
    });

  const pendingCount = bills.filter(b => b.status === "Pendente").length;
  const totalPending = bills.filter(b => b.status === "Pendente").reduce((acc, b) => acc + b.value, 0);

  const handleAddAlertDay = (e: React.FormEvent) => {
    e.preventDefault();
    const day = parseInt(newAlertDay);
    if (!isNaN(day) && !alertDays.includes(day) && day > 0) {
      onUpdateAlertDays([...alertDays, day].sort((a, b) => a - b));
      setNewAlertDay("");
    }
  };

  const handleRemoveAlertDay = (day: number) => {
    onUpdateAlertDays(alertDays.filter(d => d !== day));
  };

  const openAddModal = () => {
    setEditingBill(null);
    setFormData({
      name: "",
      value: "",
      dueDate: format(new Date(), "yyyy-MM-dd"),
      category: "other",
      status: "Pendente",
      paymentMethod: "Pix",
      priority: "Média"
    });
    setIsModalOpen(true);
  };

  const openEditModal = (bill: FixedBill) => {
    setEditingBill(bill);
    setFormData({
      name: bill.name,
      value: bill.value.toString(),
      dueDate: bill.dueDate,
      category: bill.category || "other",
      status: bill.status,
      paymentMethod: bill.paymentMethod || "Pix",
      priority: bill.priority || "Média"
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const billData = {
      name: formData.name,
      value: parseFloat(formData.value),
      dueDate: formData.dueDate,
      category: formData.category,
      status: formData.status,
      paymentMethod: formData.paymentMethod,
      priority: formData.priority
    };

    if (editingBill) {
      onUpdate(editingBill.id, billData);
    } else {
      onAdd(billData);
    }
    setIsModalOpen(false);
  };

  const handleSuggestCategory = async () => {
    if (!formData.name) return;
    setIsSuggesting(true);
    const result = await suggestCategory(formData.name);
    setFormData(prev => ({ ...prev, category: result.category }));
    setIsSuggesting(false);
  };

  const getCategoryIcon = (categoryId?: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
    return category;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Contas Fixas</h2>
          <p className="text-slate-500 mt-1">Gerencie seus compromissos mensais recorrentes</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-3 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl border border-slate-100 shadow-sm transition-all"
            title="Configurações de Alerta"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Nova Conta Fixa
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Configurações de Alerta</h4>
                  <p className="text-slate-500 text-sm">Defina quantos dias antes do vencimento você deseja ser avisado.</p>
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-8">
                {alertDays.map(day => (
                  <motion.span 
                    layout
                    key={day} 
                    className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100"
                  >
                    {day} {day === 1 ? 'dia' : 'dias'} antes
                    <button onClick={() => handleRemoveAlertDay(day)} className="hover:text-emerald-900 p-0.5 hover:bg-emerald-100 rounded-md transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.span>
                ))}
              </div>

              <form onSubmit={handleAddAlertDay} className="flex gap-3 max-w-sm">
                <input 
                  type="number" 
                  placeholder="Ex: 5"
                  className="flex-1 px-5 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  value={newAlertDay}
                  onChange={(e) => setNewAlertDay(e.target.value)}
                />
                <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                  Adicionar
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Automatic Alerts */}
      {upcomingAlerts.length > 0 && (
        <div className="space-y-3">
          {upcomingAlerts.map(({ bill, daysRemaining }, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={`${bill.id}-${idx}`} 
              className="bg-rose-50 border border-rose-100 p-5 rounded-3xl flex items-center gap-5 shadow-sm"
            >
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                <Bell className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-rose-900 font-medium">
                  Atenção! A conta <span className="font-bold underline">{bill.name}</span> vence em <span className="font-bold text-lg">{daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}</span>.
                </p>
              </div>
              <button 
                onClick={() => onUpdateStatus(bill.id, "Pago")}
                className="bg-rose-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-rose-700 transition-all shadow-md shadow-rose-200"
              >
                Pagar Agora
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Summary Banner */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 bg-amber-50 rounded-[28px] flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-amber-500" />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-slate-900">{pendingCount} Contas Pendentes</h4>
            <p className="text-slate-500 text-lg">Total acumulado: <span className="font-black text-slate-900">{formatCurrency(totalPending)}</span></p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status Geral</span>
          <div className="h-3 w-48 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(1 - pendingCount / Math.max(bills.length, 1)) * 100}%` }}
              className="h-full bg-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Bills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {bills.map((bill) => {
            const dueDate = startOfDay(parseISO(bill.dueDate));
            const daysRemaining = differenceInDays(dueDate, today);
            const isOverdue = bill.status === "Pendente" && daysRemaining < 0;
            const isUrgent = bill.status === "Pendente" && daysRemaining >= 0 && daysRemaining <= 3;
            const categoryInfo = getCategoryIcon(bill.category);
            const isExpanded = expandedBillId === bill.id;

            return (
              <motion.div 
                layout
                key={bill.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setExpandedBillId(isExpanded ? null : bill.id)}
                className={cn(
                  "bg-white p-8 rounded-[40px] shadow-sm border transition-all duration-500 group relative overflow-hidden cursor-pointer",
                  isOverdue ? "border-rose-400 bg-rose-50/30 ring-4 ring-rose-500/10 shadow-rose-100" :
                  isUrgent ? "border-amber-300 bg-amber-50/30 ring-4 ring-amber-500/10 shadow-amber-100" : 
                  "border-slate-100 hover:shadow-xl hover:shadow-slate-200/50",
                  isExpanded && "ring-2 ring-slate-900/5 shadow-lg"
                )}
              >
                {isOverdue && (
                  <div className="absolute top-6 right-6">
                    <div className="bg-rose-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-bounce">
                      VENCIDA
                    </div>
                  </div>
                )}
                {isUrgent && (
                  <div className="absolute top-6 right-6">
                    <div className="bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-pulse">
                      URGENTE
                    </div>
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-8">
                  <div className={cn(
                    "w-20 h-20 rounded-[28px] border flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg",
                    categoryInfo.color
                  )}>
                    <categoryInfo.icon className="w-10 h-10" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(bill);
                      }}
                      className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                      title="Editar"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDeleting(bill.id);
                      }}
                      className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-2xl font-bold text-slate-900 truncate">{bill.name}</h4>
                      <span className={cn(
                        "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest",
                        bill.status === "Pago" ? "bg-emerald-100 text-emerald-700" : 
                        isOverdue ? "bg-rose-600 text-white" : "bg-rose-100 text-rose-700"
                      )}>
                        {bill.status}
                      </span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{formatCurrency(bill.value)}</p>
                  </div>

                  <div className="flex items-center gap-4 py-6 border-y border-slate-50">
                    <div className={cn(
                      "flex items-center gap-3 text-sm font-bold",
                      isOverdue ? "text-rose-600" : isUrgent ? "text-amber-600" : "text-slate-500"
                    )}>
                      <CalendarIcon className="w-5 h-5" />
                      Vencimento: {format(parseISO(bill.dueDate), 'dd/MM/yyyy')}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-6 pt-2 pb-6 border-b border-slate-50">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Método</p>
                              <p className="text-sm font-bold text-slate-700">{bill.paymentMethod || "Não informado"}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prioridade</p>
                              <span className={cn(
                                "text-[10px] font-black px-2 py-0.5 rounded border inline-block",
                                bill.priority === "Alta" ? "border-rose-200 text-rose-600 bg-rose-50" :
                                bill.priority === "Média" ? "border-amber-200 text-amber-600 bg-amber-50" :
                                "border-slate-200 text-slate-600 bg-slate-50"
                              )}>
                                {bill.priority || "Média"}
                              </span>
                            </div>
                          </div>

                          {/* Payment History */}
                          <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <History className="w-3 h-3" />
                              Histórico Recente
                            </p>
                            <div className="space-y-2">
                              {bill.paymentHistory && bill.paymentHistory.length > 0 ? (
                                bill.paymentHistory.slice(0, 3).map((payment) => (
                                  <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-slate-700">{format(parseISO(payment.date), 'dd/MM/yyyy')}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{payment.status}</p>
                                      </div>
                                    </div>
                                    <p className="text-xs font-black text-slate-900">{formatCurrency(payment.value)}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-slate-400 italic text-center py-2">Nenhum histórico disponível</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-3">
                    {bill.status === "Pendente" ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(bill.id, "Pago");
                        }}
                        className="flex-1 flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-[24px] font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Marcar como Pago
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(bill.id, "Pendente");
                        }}
                        className="flex-1 flex items-center justify-center gap-3 bg-slate-100 text-slate-600 py-4 rounded-[24px] font-bold hover:bg-slate-200 transition-all active:scale-95"
                      >
                        <Clock className="w-5 h-5" />
                        Reverter
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-xl bg-white rounded-[48px] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900">
                      {editingBill ? "Editar Conta" : "Nova Conta Fixa"}
                    </h3>
                    <p className="text-slate-500 font-medium">Preencha os detalhes do seu compromisso mensal</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"
                  >
                    <X className="w-7 h-7 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Nome da Conta</label>
                    <div className="relative group">
                      <input 
                        required
                        type="text"
                        className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-bold text-slate-900 focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                        placeholder="Ex: Aluguel, Netflix, Luz..."
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={handleSuggestCategory}
                        disabled={isSuggesting || !formData.name}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                        title="Sugerir categoria com IA"
                      >
                        {isSuggesting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Valor Mensal</label>
                      <div className="relative">
                        <span className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">R$</span>
                        <input 
                          required
                          type="number"
                          step="0.01"
                          className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-bold text-slate-900 focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                          placeholder="0,00"
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Data de Vencimento</label>
                      <input 
                        required
                        type="date"
                        className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-bold text-slate-900 focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Método de Pagamento</label>
                      <select 
                        className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-bold text-slate-900 focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none appearance-none"
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      >
                        <option value="Pix">Pix</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Boleto">Boleto</option>
                        <option value="Transferência">Transferência</option>
                        <option value="Dinheiro">Dinheiro</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Prioridade</label>
                      <select 
                        className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-bold text-slate-900 focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none appearance-none"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      >
                        <option value="Baixa">Baixa</option>
                        <option value="Média">Média</option>
                        <option value="Alta">Alta</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Ícone Visual</label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-48 overflow-y-auto p-2 scrollbar-hide">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat.id })}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-[24px] border-2 transition-all duration-300",
                            formData.category === cat.id 
                              ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xl shadow-emerald-100 scale-105" 
                              : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:bg-slate-50"
                          )}
                        >
                          <cat.icon className={cn(
                            "w-6 h-6",
                            formData.category === cat.id ? "text-emerald-600" : "text-slate-400"
                          )} />
                          <span className="text-[9px] font-black uppercase tracking-wider text-center leading-tight">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-[32px] font-black text-xl shadow-2xl shadow-slate-300 transition-all active:scale-[0.98]"
                    >
                      {editingBill ? "Salvar Alterações" : "Confirmar Nova Conta"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleting && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleting(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white w-full max-w-md rounded-[48px] shadow-2xl p-12 text-center"
            >
              <div className="w-24 h-24 bg-rose-50 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                <Trash2 className="w-12 h-12 text-rose-500" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4">Excluir Conta?</h3>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                Esta ação removerá permanentemente a conta <span className="font-bold text-slate-900">"{bills.find(b => b.id === isDeleting)?.name}"</span>. Você tem certeza?
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsDeleting(null)}
                  className="py-5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-[24px] font-bold transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    onDelete(isDeleting);
                    setIsDeleting(null);
                  }}
                  className="py-5 bg-rose-500 hover:bg-rose-600 text-white rounded-[24px] font-bold shadow-xl shadow-rose-200 transition-all active:scale-95"
                >
                  Sim, Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
