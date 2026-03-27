import React from "react";
import { motion } from "motion/react";
import { Wallet } from "lucide-react";

export function Logo() {
  return (
    <motion.div 
      className="flex items-center gap-3 cursor-pointer group"
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-emerald-400 transition-colors duration-300">
        <Wallet className="w-5 h-5 text-white" />
      </div>

      <div className="flex flex-col">
        <span className="text-xl font-bold tracking-tight text-white leading-none font-display">
          Finanças<span className="text-emerald-500">Pro</span>
        </span>
        <span className="text-[9px] text-slate-300 uppercase tracking-[0.4em] font-medium mt-1 font-display">
          Gestão Estratégica
        </span>
      </div>
    </motion.div>
  );
}
