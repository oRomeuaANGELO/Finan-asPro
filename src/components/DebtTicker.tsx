import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, X, Calendar } from "lucide-react";
import { FixedBill } from "../types";
import { formatCurrency } from "../lib/utils";

interface DebtTickerProps {
  bills: FixedBill[];
}

export function DebtTicker({ bills }: DebtTickerProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Filter bills that are pending and due soon (within 5 days)
  const pendingBills = bills.filter(bill => {
    if (bill.status === "Pago") return false;
    const dueDate = new Date(bill.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 5;
  });

  useEffect(() => {
    if (pendingBills.length > 0) {
      // Show after a short delay
      const showTimer = setTimeout(() => setIsVisible(true), 2000);
      
      // Hide after 15 seconds
      const hideTimer = setTimeout(() => setIsVisible(false), 17000);
      
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [pendingBills.length]);

  if (pendingBills.length === 0) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="fixed bottom-0 left-64 right-0 z-40"
        >
          <div className="bg-slate-900 border-t border-slate-800 h-10 flex items-center overflow-hidden shadow-2xl">
            {/* Label */}
            <div className="bg-rose-600 h-full px-4 flex items-center gap-2 z-10 shadow-[5px_0_15px_rgba(0,0,0,0.3)]">
              <AlertCircle className="w-4 h-4 text-white animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-tighter whitespace-nowrap">
                Alertas Urgentes
              </span>
            </div>

            {/* Ticker Track */}
            <div className="flex-1 relative h-full flex items-center overflow-hidden">
              <motion.div
                animate={{ x: ["100%", "-100%"] }}
                transition={{
                  repeat: Infinity,
                  duration: 25,
                  ease: "linear",
                }}
                className="flex items-center gap-12 whitespace-nowrap px-8"
              >
                {/* Duplicate the list to ensure smooth continuous scroll */}
                {[...pendingBills, ...pendingBills].map((bill, idx) => (
                  <div key={`${bill.id}-${idx}`} className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(bill.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-slate-200">
                      {bill.name}:
                    </span>
                    <span className="text-xs font-black text-rose-400">
                      {formatCurrency(bill.value)}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-slate-700 mx-2" />
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Close Button */}
            <button 
              onClick={() => setIsVisible(false)}
              className="px-4 h-full bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-white transition-colors z-10 border-l border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
