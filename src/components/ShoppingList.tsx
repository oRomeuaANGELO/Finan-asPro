import React, { useState } from "react";
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit2, 
  Calendar,
  Home,
  Car,
  Bed,
  Sparkles,
  Leaf,
  Droplets,
  CircleDot,
  Lightbulb,
  X,
  LayoutGrid,
  List,
  Download,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format, parseISO } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ShoppingItem } from "../types";
import { cn } from "../lib/utils";

interface ShoppingListProps {
  items: ShoppingItem[];
  onAddItem: (item: Omit<ShoppingItem, "id">) => void;
  onUpdateItem: (id: string, updated: Partial<ShoppingItem>) => void;
  onDeleteItem: (id: string) => void;
  onToggleItem: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  CASA: Home,
  CARRO: Car,
  QUARTO: Bed,
  OUTROS: ShoppingBag,
};

const ITEM_ICONS: Record<string, any> = {
  Sparkles: Sparkles,
  Leaf: Leaf,
  Droplets: Droplets,
  CircleDot: CircleDot,
  Lightbulb: Lightbulb,
  ShoppingBag: ShoppingBag,
};

export const ShoppingList: React.FC<ShoppingListProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onToggleItem,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExportSelectionModalOpen, setIsExportSelectionModalOpen] = useState(false);
  const [selectedCategoriesForExport, setSelectedCategoriesForExport] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [newItem, setNewItem] = useState<Omit<ShoppingItem, "id">>({
    name: "",
    category: "CASA",
    date: format(new Date(), "yyyy-MM-dd"),
    completed: false,
    icon: "ShoppingBag",
  });

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const handleSave = () => {
    if (editingItem) {
      onUpdateItem(editingItem.id, newItem);
    } else {
      onAddItem(newItem);
    }
    setIsModalOpen(false);
    setEditingItem(null);
    setNewItem({
      name: "",
      category: "CASA",
      date: format(new Date(), "yyyy-MM-dd"),
      completed: false,
      icon: "ShoppingBag",
    });
  };

  const openEditModal = (item: ShoppingItem) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      category: item.category,
      date: item.date,
      completed: item.completed,
      icon: item.icon || "ShoppingBag",
    });
    setIsModalOpen(true);
  };

  const exportToPDF = (categoryFilters?: string[]) => {
    const doc = new jsPDF();
    const tableData: any[] = [];
    
    const entries = categoryFilters && categoryFilters.length > 0
      ? Object.entries(groupedItems).filter(([cat]) => categoryFilters.includes(cat))
      : Object.entries(groupedItems);

    entries.forEach(([category, categoryItems]: [string, ShoppingItem[]]) => {
      categoryItems.forEach(item => {
        tableData.push([
          item.name,
          category,
          format(parseISO(item.date), 'dd/MM/yyyy'),
          item.completed ? "Concluído" : "Pendente"
        ]);
      });
    });

    if (tableData.length === 0) return;

    doc.setFontSize(20);
    const title = categoryFilters && categoryFilters.length === 1 
      ? `Lista de Compras - ${categoryFilters[0]}`
      : categoryFilters && categoryFilters.length > 1
        ? "Lista de Compras (Seleção)"
        : "Minha Lista de Compras";
    
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);

    autoTable(doc, {
      startY: 35,
      head: [['Item', 'Categoria', 'Data', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
    });

    const fileName = categoryFilters && categoryFilters.length === 1
      ? `lista-${categoryFilters[0].toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
      : categoryFilters && categoryFilters.length > 1
        ? `lista-selecao-${format(new Date(), 'yyyy-MM-dd')}.pdf`
        : `lista-completa-${format(new Date(), 'yyyy-MM-dd')}.pdf`;

    doc.save(fileName);
    setIsExportMenuOpen(false);
    setIsExportSelectionModalOpen(false);
  };

  const handleCustomExport = () => {
    exportToPDF(selectedCategoriesForExport);
  };

  const toggleCategorySelection = (category: string) => {
    setSelectedCategoriesForExport(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-10 h-10 text-indigo-600" />
            Lista de Compras
          </h1>
          <p className="text-slate-500 font-medium mt-1">Organize suas necessidades por categoria</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-xl transition-all",
                viewMode === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
              title="Visualização em Grade"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-xl transition-all",
                viewMode === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
              title="Visualização em Lista"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className={cn(
                "flex items-center justify-center gap-2 bg-white border-2 border-slate-100 hover:border-indigo-100 text-slate-600 hover:text-indigo-600 px-5 py-3 rounded-2xl font-bold transition-all active:scale-95",
                isExportMenuOpen && "border-indigo-500 text-indigo-600"
              )}
              title="Exportar PDF"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">Exportar</span>
            </button>

            <AnimatePresence>
              {isExportMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsExportMenuOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20"
                  >
                    <div className="px-4 py-2 border-b border-slate-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Escolha a lista</p>
                    </div>
                    <button
                      onClick={() => exportToPDF()}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">Lista Completa</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCategoriesForExport([]);
                        setIsExportSelectionModalOpen(true);
                        setIsExportMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                        <Filter className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">Seleção Personalizada</span>
                    </button>
                    {Object.keys(groupedItems).map((category) => {
                      const Icon = CATEGORY_ICONS[category] || ShoppingBag;
                      return (
                        <button
                          key={category}
                          onClick={() => exportToPDF([category])}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-slate-700">{category}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Novo Item</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          type="text"
          placeholder="Buscar itens ou categorias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      {/* List Content */}
      <div className="space-y-12">
        {Object.entries(groupedItems).map(([category, categoryItems]: [string, ShoppingItem[]]) => {
          const CategoryIcon = CATEGORY_ICONS[category] || ShoppingBag;
          return (
            <section key={category} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                  <CategoryIcon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{category}</h2>
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                  {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'itens'}
                </span>
              </div>

              <div className={cn(
                "grid gap-4",
                viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              )}>
                {categoryItems.map((item) => {
                  const ItemIcon = ITEM_ICONS[item.icon || "ShoppingBag"] || ShoppingBag;
                  return (
                    <motion.div
                      layout
                      key={item.id}
                      className={cn(
                        "group relative bg-white rounded-3xl border-2 transition-all hover:shadow-xl hover:shadow-indigo-50/50",
                        item.completed 
                          ? "border-emerald-100 bg-emerald-50/30 hover:border-emerald-200" 
                          : "border-slate-50 hover:border-indigo-100",
                        viewMode === "grid" ? "p-5" : "p-4 flex items-center"
                      )}
                    >
                      <div className={cn(
                        "flex gap-4 w-full",
                        viewMode === "list" ? "items-center" : "items-start"
                      )}>
                        <button
                          onClick={() => onToggleItem(item.id)}
                          className={cn(
                            "transition-colors shrink-0",
                            item.completed ? "text-emerald-500" : "text-slate-300 hover:text-indigo-500"
                          )}
                        >
                          {item.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className={cn(
                            "font-bold truncate transition-all",
                            item.completed ? "text-slate-400 line-through" : "text-slate-800",
                            viewMode === "grid" ? "text-lg" : "text-base"
                          )}>
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <Calendar className="w-3 h-3" />
                              {format(parseISO(item.date), 'dd MMM')}
                            </div>
                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                              <ItemIcon className="w-3 h-3" />
                              {item.icon}
                            </div>
                          </div>
                        </div>

                        <div className={cn(
                          "flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0",
                          viewMode === "grid" ? "flex-col" : "flex-row"
                        )}>
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 hover:bg-indigo-50 rounded-xl text-indigo-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            className="p-2 hover:bg-rose-50 rounded-xl text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-slate-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Nenhum item encontrado</h3>
              <p className="text-slate-500">Tente buscar por outro nome ou categoria</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isExportSelectionModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExportSelectionModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Exportar Seleção
                  </h2>
                  <button
                    onClick={() => setIsExportSelectionModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <p className="text-slate-500 font-medium">Selecione as listas que deseja incluir no PDF:</p>

                <div className="space-y-3">
                  {Object.keys(groupedItems).map((category) => {
                    const Icon = CATEGORY_ICONS[category] || ShoppingBag;
                    const isSelected = selectedCategoriesForExport.includes(category);
                    return (
                      <button
                        key={category}
                        onClick={() => toggleCategorySelection(category)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                          isSelected 
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md" 
                            : "border-slate-50 bg-slate-50 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          isSelected ? "bg-white text-indigo-600" : "bg-white text-slate-400"
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="flex-1 font-bold">{category}</span>
                        {isSelected ? (
                          <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-200" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleCustomExport}
                  disabled={selectedCategoriesForExport.length === 0}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] mt-4"
                >
                  Gerar PDF Selecionado
                </button>
              </div>
            </motion.div>
          </div>
        )}

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
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingItem ? "Editar Item" : "Novo Item"}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Item</label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Ex: Pneus novos"
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                      <select
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 appearance-none"
                      >
                        <option value="CASA">CASA</option>
                        <option value="CARRO">CARRO</option>
                        <option value="QUARTO">QUARTO</option>
                        <option value="OUTROS">OUTROS</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                      <input
                        type="date"
                        value={newItem.date}
                        onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ícone</label>
                    <div className="grid grid-cols-6 gap-2">
                      {Object.keys(ITEM_ICONS).map((iconName) => {
                        const Icon = ITEM_ICONS[iconName];
                        return (
                          <button
                            key={iconName}
                            onClick={() => setNewItem({ ...newItem, icon: iconName })}
                            className={cn(
                              "aspect-square flex items-center justify-center rounded-xl border-2 transition-all",
                              newItem.icon === iconName 
                                ? "border-indigo-500 bg-indigo-50 text-indigo-600 shadow-md" 
                                : "border-slate-50 bg-slate-50 text-slate-400 hover:bg-slate-100"
                            )}
                          >
                            <Icon className="w-5 h-5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={!newItem.name}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] mt-4"
                >
                  {editingItem ? "Salvar Alterações" : "Adicionar à Lista"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
