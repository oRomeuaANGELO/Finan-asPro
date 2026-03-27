import React from "react";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Target, 
  Calendar as CalendarIcon, 
  CreditCard, 
  TrendingUp, 
  LineChart as LineChartIcon,
  BrainCircuit,
  FileText,
  Settings as SettingsIcon,
  Building2,
  ShoppingBag
} from "lucide-react";
import { cn } from "../lib/utils";

import { Logo } from "./Logo";
import { UserProfile } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: UserProfile;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "banks", label: "Bancos", icon: Building2 },
  { id: "transactions", label: "Transações", icon: ArrowLeftRight },
  { id: "planning", label: "Planejamento", icon: Target },
  { id: "calendar", label: "Calendário", icon: CalendarIcon },
  { id: "fixed", label: "Contas Fixas", icon: CreditCard },
  { id: "investments", label: "Investimentos", icon: TrendingUp },
  { id: "shopping", label: "Lista de Compras", icon: ShoppingBag },
  { id: "projection", label: "Projeção", icon: LineChartIcon },
  { id: "reports", label: "Relatórios", icon: FileText },
  { id: "analysis", label: "Análise IA", icon: BrainCircuit },
];

export function Sidebar({ activeTab, setActiveTab, userProfile }: SidebarProps) {
  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 border-r border-slate-800">
      <div className="p-8">
        <Logo />
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              activeTab === item.id 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-transform duration-200",
              activeTab === item.id ? "scale-110" : "group-hover:scale-110"
            )} />
            <span className="font-medium font-display tracking-wide">{item.label}</span>
            {activeTab === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button 
          onClick={() => setActiveTab("settings")}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
            activeTab === "settings" 
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          )}
        >
          <SettingsIcon className={cn(
            "w-5 h-5 transition-transform duration-200",
            activeTab === "settings" ? "scale-110" : "group-hover:scale-110"
          )} />
          <span className="font-medium font-display tracking-wide">Configurações</span>
          {activeTab === "settings" && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          )}
        </button>

        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
          <img 
            src={userProfile.photoUrl || "https://picsum.photos/seed/user/200/200"} 
            alt="Avatar" 
            className="w-8 h-8 rounded-lg object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate">{userProfile.name}</p>
            <p className="text-[10px] text-emerald-400 font-medium">{userProfile.plan}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
