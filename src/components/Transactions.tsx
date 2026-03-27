import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ArrowUp, 
  ArrowDown,
  Calendar as CalendarIcon,
  Clock,
  Tag,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ArrowRightLeft,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Wallet
} from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";
import { Transaction, TransactionType, TransactionStatus, Priority } from "../types";
import { CATEGORIES } from "../constants";

interface TransactionsProps {
  transactions: Transaction[];
  onAdd: (t: any) => void;
  onUpdate: (id: string, t: any) => void;
  onDelete: (id: string) => void;
}

export function Transactions({ transactions, onAdd, onUpdate, onDelete }: TransactionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<TransactionType | "Todos">("Todos");
  const [filterSubcategory, setFilterSubcategory] = useState<string>("Todas");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const subcategories = Array.from(
    new Set(transactions.map((t) => t.subcategory).filter(Boolean))
  ).sort();

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "Todos" || t.type === filterType;
    const matchesSubcategory = filterSubcategory === "Todas" || t.subcategory === filterSubcategory;
    return matchesSearch && matchesType && matchesSubcategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Transações</h2>
          <p className="text-slate-500 mt-1">Controle detalhado de entradas e saídas</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-emerald-200 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Nova Transação
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por descrição ou categoria..." 
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["Todos", "Receita", "Despesa"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={cn(
                "flex-1 py-3 rounded-2xl text-sm font-medium transition-all",
                filterType === type 
                  ? "bg-slate-900 text-white shadow-md" 
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="relative">
          <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm appearance-none cursor-pointer text-slate-600 font-medium"
            value={filterSubcategory}
            onChange={(e) => setFilterSubcategory(e.target.value)}
          >
            <option value="Todas">Todas Subcategorias</option>
            {subcategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        <button className="flex items-center justify-center gap-2 bg-slate-50 text-slate-600 px-4 py-3 rounded-2xl hover:bg-slate-100 transition-all text-sm font-medium">
          <Filter className="w-4 h-4" />
          Filtros Avançados
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data / Hora</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição / Categoria</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Prioridade</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map((t) => (
                <React.Fragment key={t.id}>
                  <tr 
                    onClick={() => toggleRow(t.id)}
                    className={cn(
                      "hover:bg-slate-50/50 transition-colors group cursor-pointer",
                      expandedRowId === t.id && "bg-slate-50/80"
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(t.date).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {t.time}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">{t.description}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Tag className="w-3.5 h-3.5 text-slate-400" />
                          {t.category} • {t.subcategory}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                        t.type === "Receita" 
                          ? "bg-emerald-50 text-emerald-600" 
                          : "bg-rose-50 text-rose-600"
                      )}>
                        {t.type === "Receita" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-sm font-bold",
                        t.type === "Receita" ? "text-emerald-600" : "text-slate-900"
                      )}>
                        {t.type === "Despesa" && "- "}{formatCurrency(t.value)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                        t.status === "Pago" 
                          ? "bg-blue-50 text-blue-600" 
                          : "bg-amber-50 text-amber-600"
                      )}>
                        {t.status === "Pago" ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {expandedRowId === t.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        <span className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded border",
                          t.priority === "Alta" ? "border-rose-200 text-rose-600 bg-rose-50" :
                          t.priority === "Média" ? "border-amber-200 text-amber-600 bg-amber-50" :
                          "border-slate-200 text-slate-600 bg-slate-50"
                        )}>
                          {t.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(t);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(t.id);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRowId === t.id && (
                    <tr className="bg-slate-50/30 animate-in slide-in-from-top-2 duration-200">
                      <td colSpan={7} className="px-6 py-6 border-t border-slate-100/50">
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="space-y-4">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Informações Gerais</h4>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <CreditCard className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Método</p>
                                    <p className="text-sm font-semibold text-slate-700">{t.paymentMethod}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                    <Tag className="w-4 h-4 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Subcategoria</p>
                                    <p className="text-sm font-semibold text-slate-700">{t.subcategory || "Nenhuma"}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prioridade & Status</h4>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center",
                                    t.priority === "Alta" ? "bg-rose-50" : t.priority === "Média" ? "bg-amber-50" : "bg-slate-50"
                                  )}>
                                    <AlertCircle className={cn(
                                      "w-4 h-4",
                                      t.priority === "Alta" ? "text-rose-600" : t.priority === "Média" ? "text-amber-600" : "text-slate-600"
                                    )} />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Prioridade</p>
                                    <p className="text-sm font-semibold text-slate-700">{t.priority}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center",
                                    t.status === "Pago" ? "bg-emerald-50" : "bg-amber-50"
                                  )}>
                                    {t.status === "Pago" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-amber-600" />}
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                                    <p className="text-sm font-semibold text-slate-700">{t.status}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Data & Hora</h4>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                    <CalendarIcon className="w-4 h-4 text-slate-600" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Data</p>
                                    <p className="text-sm font-semibold text-slate-700">{new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-slate-600" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Horário</p>
                                    <p className="text-sm font-semibold text-slate-700">{t.time}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resumo</h4>
                              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-500 leading-relaxed italic">
                                  "{t.description}" - Esta transação de {t.type.toLowerCase()} no valor de {formatCurrency(t.value)} foi classificada como {t.category.toLowerCase()}.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTransactions.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Nenhuma transação encontrada</h3>
            <p className="text-slate-500">Tente ajustar seus filtros ou faça uma nova busca.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <TransactionModal 
          initialData={editingTransaction || undefined}
          onClose={handleCloseModal} 
          onSave={(t) => {
            if (editingTransaction) {
              onUpdate(editingTransaction.id, t);
            } else {
              onAdd(t);
            }
            handleCloseModal();
          }} 
        />
      )}
    </div>
  );
}

function TransactionModal({ initialData, onClose, onSave }: { initialData?: Transaction, onClose: () => void, onSave: (t: any) => void }) {
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    time: initialData?.time || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    type: initialData?.type || "Despesa" as TransactionType,
    category: initialData?.category || CATEGORIES[0],
    subcategory: initialData?.subcategory || "",
    description: initialData?.description || "",
    paymentMethod: initialData?.paymentMethod || "Pix",
    value: initialData?.value || 0,
    status: initialData?.status || "Pago" as TransactionStatus,
    priority: initialData?.priority || "Média" as Priority,
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-900">{initialData ? "Editar Transação" : "Nova Transação"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all">
            <Plus className="w-6 h-6 rotate-45 text-slate-400" />
          </button>
        </div>
        <form className="p-8 space-y-6" onSubmit={(e) => {
          e.preventDefault();
          onSave(formData);
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Tipo</label>
              <div className="flex gap-2">
                {["Receita", "Despesa"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type as any })}
                    className={cn(
                      "flex-1 py-3 rounded-2xl text-sm font-bold transition-all",
                      formData.type === type 
                        ? type === "Receita" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Valor</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-lg"
                  value={formData.value || ""}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Data</label>
              <input 
                type="date" 
                required
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Categoria</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="Salário">Salário</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Subcategoria</label>
              <input 
                type="text" 
                placeholder="Ex: Supermercado, Aluguel..."
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Método de Pagamento</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <option value="Pix">Pix</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Boleto">Boleto</option>
                <option value="Transferência">Transferência</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Status</label>
              <div className="flex gap-2">
                {["Pago", "Pendente"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: status as any })}
                    className={cn(
                      "flex-1 py-3 rounded-2xl text-sm font-bold transition-all",
                      formData.status === status 
                        ? "bg-blue-600 text-white" 
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Prioridade</label>
              <div className="flex gap-2">
                {["Baixa", "Média", "Alta"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p as any })}
                    className={cn(
                      "flex-1 py-3 rounded-2xl text-sm font-bold transition-all",
                      formData.priority === p 
                        ? p === "Alta" ? "bg-rose-600 text-white" : p === "Média" ? "bg-amber-600 text-white" : "bg-slate-600 text-white"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">Descrição</label>
              <input 
                type="text" 
                required
                placeholder="Ex: Compras no mercado..."
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 rounded-2xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              {initialData ? "Atualizar Transação" : "Salvar Transação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
