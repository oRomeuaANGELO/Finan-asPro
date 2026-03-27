import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Zap, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  BarChart2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import { cn, formatCurrency } from "../lib/utils";

interface MarketData {
  selic: string;
  currencies: {
    usd: { bid: string; pctChange: string };
    eur: { bid: string; pctChange: string };
    btc: { bid: string; pctChange: string };
  };
  stocks: {
    gainers: { symbol: string; change: string; price: string }[];
    losers: { symbol: string; change: string; price: string }[];
  };
  etfs: { symbol: string; change: string; price: string }[];
}

export function MarketDashboard() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMarketData = async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch Currencies from AwesomeAPI (Public, no key)
      const currencyRes = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL");
      const currencyData = await currencyRes.json();

      // 2. Fetch SELIC from BCB API
      const selicRes = await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json");
      const selicJson = await selicRes.json();
      const selicValue = selicJson[0]?.valor || "10.75";

      // 3. Use Gemini to get Stocks and ETFs snapshot (since public APIs for stocks usually need keys)
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Forneça um resumo rápido do mercado financeiro brasileiro e global de hoje (27/03/2026) em formato JSON estrito. O JSON deve ter as chaves: 'acoes_alta', 'acoes_baixa' e 'etfs_valorizados'. Cada item deve ser um objeto com: 'symbol' (ex: PETR4), 'price' (ex: 38.50) e 'change' (ex: +2.5%). Retorne APENAS o JSON.",
        config: {
          responseMimeType: "application/json",
        }
      });

      let aiData;
      try {
        aiData = JSON.parse(response.text);
      } catch (e) {
        console.error("Failed to parse AI response", e);
        aiData = { acoes_alta: [], acoes_baixa: [], etfs_valorizados: [] };
      }

      setData({
        selic: selicValue,
        currencies: {
          usd: { bid: currencyData.USDBRL.bid, pctChange: currencyData.USDBRL.pctChange },
          eur: { bid: currencyData.EURBRL.bid, pctChange: currencyData.EURBRL.pctChange },
          btc: { bid: currencyData.BTCBRL.bid, pctChange: currencyData.BTCBRL.pctChange },
        },
        stocks: {
          gainers: (aiData.acoes_alta || aiData.gainers || []).map((s: any) => ({
            symbol: s.symbol || s.ticker || "N/A",
            change: s.change || s.alta || "0%",
            price: s.price || s.preco || "0.00"
          })),
          losers: (aiData.acoes_baixa || aiData.losers || []).map((s: any) => ({
            symbol: s.symbol || s.ticker || "N/A",
            change: s.change || s.baixa || "0%",
            price: s.price || s.preco || "0.00"
          })),
        },
        etfs: (aiData.etfs_valorizados || aiData.etfs || []).map((s: any) => ({
          symbol: s.symbol || s.ticker || "N/A",
          change: s.change || s.alta || "0%",
          price: s.price || s.preco || "0.00"
        })),
      });
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching market data:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-slate-500 font-medium">Sincronizando com o mercado...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500" />
          Painel de Controle do Mercado
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </span>
          <button 
            onClick={fetchMarketData}
            disabled={isRefreshing}
            className={cn(
              "p-2 rounded-xl transition-all active:scale-95",
              isRefreshing ? "bg-slate-100 text-slate-400" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            )}
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Macro Indicators */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-xl group cursor-help relative overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-4 opacity-70">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Taxa SELIC</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-4xl font-black">{data?.selic}%</h4>
            <span className="text-xs font-medium text-emerald-400">a.a.</span>
          </div>
          
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            whileHover={{ height: "auto", opacity: 1 }}
            className="overflow-hidden"
          >
            <p className="text-slate-400 text-xs mt-4 leading-relaxed border-t border-white/10 pt-4">
              A taxa SELIC é o principal instrumento de política monetária utilizado pelo Banco Central para controlar a inflação. Ela influencia todas as taxas de juros do país.
            </p>
          </motion.div>
          
          <div className="absolute bottom-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart2 className="w-12 h-12" />
          </div>
        </motion.div>

        {/* Currencies */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Dólar (USD)", value: data?.currencies.usd.bid, change: data?.currencies.usd.pctChange, icon: DollarSign, color: "text-blue-500", desc: "Moeda de reserva global, essencial para comércio exterior e investimentos internacionais." },
            { label: "Euro (EUR)", value: data?.currencies.eur.bid, change: data?.currencies.eur.pctChange, icon: Globe, color: "text-indigo-500", desc: "Moeda oficial da Zona do Euro, segunda moeda mais importante do sistema financeiro global." },
            { label: "Bitcoin (BTC)", value: data?.currencies.btc.bid, change: data?.currencies.btc.pctChange, icon: Zap, color: "text-orange-500", desc: "Principal criptoativo do mercado, utilizado como reserva de valor digital e ativo especulativo." },
          ].map((item, idx) => (
            <motion.div 
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-xl bg-slate-50", item.color)}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
                  parseFloat(item.change || "0") >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                  {parseFloat(item.change || "0") >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {item.change}%
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
              <h4 className="text-2xl font-black text-slate-900">
                R$ {parseFloat(item.value || "0").toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h4>

              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                whileHover={{ height: "auto", opacity: 1 }}
                className="overflow-hidden"
              >
                <p className="text-slate-400 text-[10px] mt-4 pt-4 border-t border-slate-50 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Gainers */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer overflow-hidden"
        >
          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Maiores Altas (Ações)
          </h4>
          <div className="space-y-3">
            {data?.stocks.gainers.map((stock, idx) => (
              <div key={`${stock.symbol}-${idx}`} className="flex items-center justify-between p-3 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
                <div>
                  <p className="font-black text-slate-900">{stock.symbol}</p>
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="overflow-hidden hidden group-hover:block"
                  >
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">
                      R$ {stock.price}
                    </p>
                  </motion.div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-600">{stock.change.startsWith('+') ? stock.change : `+${stock.change}`}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Losers */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer overflow-hidden"
        >
          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            Maiores Baixas (Ações)
          </h4>
          <div className="space-y-3">
            {data?.stocks.losers.map((stock, idx) => (
              <div key={`${stock.symbol}-${idx}`} className="flex items-center justify-between p-3 bg-rose-50/30 rounded-2xl border border-rose-100/50">
                <div>
                  <p className="font-black text-slate-900">{stock.symbol}</p>
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="overflow-hidden hidden group-hover:block"
                  >
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">
                      R$ {stock.price}
                    </p>
                  </motion.div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-rose-600">{stock.change}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top ETFs */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer overflow-hidden"
        >
          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-500" />
            ETFs em Destaque
          </h4>
          <div className="space-y-3">
            {data?.etfs.map((etf, idx) => (
              <div key={`${etf.symbol}-${idx}`} className="flex items-center justify-between p-3 bg-blue-50/30 rounded-2xl border border-blue-100/50">
                <div>
                  <p className="font-black text-slate-900">{etf.symbol}</p>
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="overflow-hidden hidden group-hover:block"
                  >
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">
                      R$ {etf.price}
                    </p>
                  </motion.div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-blue-600">+{etf.change}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
