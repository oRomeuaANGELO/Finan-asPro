import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  RefreshCw, 
  Trash2, 
  CreditCard, 
  Building2, 
  Wallet, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  ArrowRightLeft,
  History,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { BankAccount, SyncLog } from "../types";
import { formatCurrency, cn } from "../lib/utils";

interface BankAccountsProps {
  accounts: BankAccount[];
  onAdd: (account: Omit<BankAccount, "id">) => void;
  onDelete: (id: string) => void;
  onSync: (id: string) => void;
}

export function BankAccounts({ accounts, onAdd, onDelete, onSync }: BankAccountsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [newAccount, setNewAccount] = useState<Omit<BankAccount, "id">>({
    name: "",
    institution: "",
    balance: 0,
    type: "Corrente",
    status: "Desconectado",
    color: "bg-emerald-500"
  });

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  const handleSyncAll = async () => {
    const syncPromises = accounts.map(acc => onSync(acc.id));
    await Promise.all(syncPromises);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newAccount);
    setIsModalOpen(false);
    setNewAccount({
      name: "",
      institution: "",
      balance: 0,
      type: "Corrente",
      status: "Desconectado",
      color: "bg-emerald-500"
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight font-display">Instituições Financeiras</h2>
          <p className="text-slate-500 mt-1">Gerencie e sincronize suas contas bancárias em tempo real.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncAll}
            disabled={accounts.some(a => a.status === "Sincronizando")}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={cn("w-5 h-5", accounts.some(a => a.status === "Sincronizando") && "animate-spin")} />
            Sincronizar Tudo
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Conectar Banco
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Saldo Total Consolidado</p>
              <h3 className="text-2xl font-bold text-slate-900 font-display">{formatCurrency(totalBalance)}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Instituições Ativas</p>
              <h3 className="text-2xl font-bold text-slate-900 font-display">{accounts.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Última Sincronização</p>
              <h3 className="text-2xl font-bold text-slate-900 font-display">Agora</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {accounts.map((account) => (
            <motion.div
              key={account.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              <div className={cn("h-24 p-6 flex items-start justify-between", account.color)}>
                <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setExpandedHistoryId(expandedHistoryId === account.id ? null : account.id)}
                    className={cn(
                      "p-2 backdrop-blur-md rounded-xl text-white transition-all",
                      expandedHistoryId === account.id ? "bg-white/40 shadow-lg" : "bg-white/20 hover:bg-white/30"
                    )}
                    title="Histórico de Sincronização"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onSync(account.id)}
                    className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30 transition-colors"
                    disabled={account.status === "Sincronizando"}
                  >
                    <RefreshCw className={cn("w-4 h-4", account.status === "Sincronizando" && "animate-spin")} />
                  </button>
                  <button 
                    onClick={() => onDelete(account.id)}
                    className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-red-500/50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 -mt-8 bg-white rounded-t-[32px] relative">
                <AnimatePresence>
                  {expandedHistoryId === account.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-6"
                    >
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            Histórico de Sincronização
                          </h5>
                          <span className="text-[10px] font-bold text-slate-500">Últimas 3</span>
                        </div>
                        <div className="space-y-3">
                          {account.syncHistory?.map((log) => (
                            <div key={log.id} className="flex items-start gap-3 group/log">
                              <div className={cn(
                                "mt-0.5 p-1 rounded-lg",
                                log.status === "Sucesso" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                              )}>
                                {log.status === "Sucesso" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-[11px] font-bold text-slate-700">
                                    {new Date(log.date).toLocaleDateString("pt-BR")} às {new Date(log.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                  </p>
                                  <span className={cn(
                                    "text-[9px] font-bold px-1.5 py-0.5 rounded-md",
                                    log.status === "Sucesso" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                  )}>
                                    {log.status}
                                  </span>
                                </div>
                                {log.message && (
                                  <p className="text-[10px] text-slate-500 truncate">{log.message}</p>
                                )}
                              </div>
                            </div>
                          ))}
                          {(!account.syncHistory || account.syncHistory.length === 0) && (
                            <p className="text-[10px] text-slate-400 text-center py-2 italic">Nenhum histórico disponível</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 font-display">{account.institution}</h4>
                    <p className="text-sm text-slate-500">{account.name}</p>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    account.status === "Sincronizado" ? "bg-emerald-50 text-emerald-600" : 
                    account.status === "Sincronizando" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"
                  )}>
                    {account.status}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Saldo em Conta</p>
                    <h3 className="text-2xl font-bold text-slate-900 font-display">{formatCurrency(account.balance)}</h3>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>{account.type}</span>
                    </div>
                    {account.lastSync && (
                      <p className="text-[10px] text-slate-400">
                        Sincronizado há {Math.floor((new Date().getTime() - new Date(account.lastSync).getTime()) / 60000)} min
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Account Placeholder */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-all group"
        >
          <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-emerald-50 transition-colors">
            <Plus className="w-8 h-8" />
          </div>
          <span className="font-bold font-display">Adicionar Nova Instituição</span>
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100">
                <h3 className="text-2xl font-bold text-slate-900 font-display">Conectar Nova Conta</h3>
                <p className="text-slate-500">Insira os detalhes da sua instituição financeira.</p>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Instituição</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: Nubank, Itaú..."
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      value={newAccount.institution}
                      onChange={(e) => setNewAccount({ ...newAccount, institution: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Nome da Conta</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: Principal, Reserva..."
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Saldo Inicial</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 transition-all text-xl font-bold"
                    value={newAccount.balance || ""}
                    onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Tipo de Conta</label>
                    <select
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      value={newAccount.type}
                      onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value as any })}
                    >
                      <option value="Corrente">Corrente</option>
                      <option value="Poupança">Poupança</option>
                      <option value="Investimento">Investimento</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Cor do Card</label>
                    <div className="flex gap-2 p-2 bg-slate-50 rounded-2xl">
                      {["bg-emerald-500", "bg-purple-600", "bg-orange-500", "bg-blue-600", "bg-yellow-400"].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewAccount({ ...newAccount, color })}
                          className={cn(
                            "w-8 h-8 rounded-lg transition-all",
                            color,
                            newAccount.color === color ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "opacity-60 hover:opacity-100"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Confirmar Conexão
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
