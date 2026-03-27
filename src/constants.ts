import { Transaction, Budget, FixedBill, Investment, BankAccount, UserProfile, FinancialGoal, ShoppingItem } from "./types";

export const CATEGORIES = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Lazer",
  "Investimentos",
  "Saúde",
  "Educação",
  "Outros",
];

export const DEFAULT_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Lilly",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Toby",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe",
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: "Romeu Angelo",
  email: "romeuangelo999@gmail.com",
  profession: "Estrategista Financeiro",
  birthDate: "1995-05-15",
  plan: "Premium",
  location: "São Paulo, Brasil",
  bio: "Focado em liberdade financeira e investimentos de longo prazo.",
  photoUrl: "https://picsum.photos/seed/romeu/200/200"
};

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "1",
    name: "Conta Principal",
    institution: "Nubank",
    balance: 2450.80,
    type: "Corrente",
    lastSync: new Date().toISOString(),
    status: "Sincronizado",
    color: "bg-purple-600",
    syncHistory: [
      { id: "h1", date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: "Sucesso", message: "Sincronização automática concluída" },
      { id: "h2", date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: "Sucesso", message: "Sincronização manual concluída" },
      { id: "h3", date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), status: "Falha", message: "Erro de conexão com o banco" },
    ]
  },
  {
    id: "2",
    name: "Reserva",
    institution: "Itaú",
    balance: 15200.00,
    type: "Poupança",
    lastSync: new Date().toISOString(),
    status: "Sincronizado",
    color: "bg-orange-500",
    syncHistory: [
      { id: "h4", date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), status: "Sucesso", message: "Sincronização automática concluída" },
    ]
  },
  {
    id: "3",
    name: "Investimentos",
    institution: "XP Investimentos",
    balance: 84500.00,
    type: "Investimento",
    lastSync: new Date().toISOString(),
    status: "Sincronizado",
    color: "bg-yellow-400",
    syncHistory: [
      { id: "h5", date: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), status: "Sucesso", message: "Sincronização automática concluída" },
    ]
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    date: "2026-03-01",
    time: "10:00",
    type: "Receita",
    category: "Salário",
    subcategory: "Principal",
    description: "Salário Mensal",
    paymentMethod: "Transferência",
    value: 5000,
    status: "Pago",
    priority: "Alta",
  },
  {
    id: "2",
    date: "2026-03-05",
    time: "14:30",
    type: "Despesa",
    category: "Moradia",
    subcategory: "Aluguel",
    description: "Aluguel do Apartamento",
    paymentMethod: "Boleto",
    value: 1500,
    status: "Pago",
    priority: "Alta",
  },
  {
    id: "3",
    date: "2026-03-10",
    time: "18:00",
    type: "Despesa",
    category: "Alimentação",
    subcategory: "Supermercado",
    description: "Compras do mês",
    paymentMethod: "Cartão de Crédito",
    value: 800,
    status: "Pago",
    priority: "Média",
  },
  {
    id: "4",
    date: "2026-03-15",
    time: "09:00",
    type: "Despesa",
    category: "Transporte",
    subcategory: "Combustível",
    description: "Abastecimento",
    paymentMethod: "Débito",
    value: 200,
    status: "Pago",
    priority: "Média",
  },
  {
    id: "5",
    date: "2026-03-20",
    time: "20:00",
    type: "Despesa",
    category: "Lazer",
    subcategory: "Cinema",
    description: "Ingressos e pipoca",
    paymentMethod: "Pix",
    value: 120,
    status: "Pago",
    priority: "Baixa",
  },
];

export const INITIAL_BUDGETS: Budget[] = [
  { category: "Moradia", planned: 1600 },
  { category: "Alimentação", planned: 1000 },
  { category: "Transporte", planned: 400 },
  { category: "Lazer", planned: 300 },
  { category: "Saúde", planned: 200 },
  { category: "Educação", planned: 500 },
  { category: "Outros", planned: 200 },
];

export const INITIAL_FIXED_BILLS: FixedBill[] = [
  { 
    id: "1", 
    name: "Internet", 
    value: 100, 
    dueDate: "2026-03-10", 
    status: "Pago", 
    category: "internet",
    paymentHistory: [
      { id: "h1", date: "2026-02-10", value: 100, status: "Pago" },
      { id: "h2", date: "2026-01-10", value: 100, status: "Pago" },
      { id: "h3", date: "2025-12-10", value: 95, status: "Pago" },
    ]
  },
  { 
    id: "2", 
    name: "Energia", 
    value: 150, 
    dueDate: "2026-03-15", 
    status: "Pago", 
    category: "energy",
    paymentHistory: [
      { id: "h4", date: "2026-02-15", value: 142, status: "Pago" },
      { id: "h5", date: "2026-01-15", value: 165, status: "Pago" },
      { id: "h6", date: "2025-12-15", value: 130, status: "Pago" },
    ]
  },
  { 
    id: "3", 
    name: "Água", 
    value: 50, 
    dueDate: "2026-03-20", 
    status: "Pago", 
    category: "water",
    paymentHistory: [
      { id: "h7", date: "2026-02-20", value: 48, status: "Pago" },
      { id: "h8", date: "2026-01-20", value: 52, status: "Pago" },
      { id: "h9", date: "2025-12-20", value: 45, status: "Pago" },
    ]
  },
  { 
    id: "4", 
    name: "Streaming", 
    value: 40, 
    dueDate: "2026-03-25", 
    status: "Pendente", 
    category: "subscription",
    paymentHistory: [
      { id: "h10", date: "2026-02-25", value: 40, status: "Pago" },
      { id: "h11", date: "2026-01-25", value: 40, status: "Pago" },
      { id: "h12", date: "2025-12-25", value: 35, status: "Pago" },
    ]
  },
];

export const INITIAL_INVESTMENTS: Investment[] = [
  { id: "1", category: "Renda Fixa", name: "Tesouro Selic 2029", value: 5000, date: "2026-01-01" },
  { id: "2", category: "Ações", name: "PETR4", value: 2000, quantity: 50, averagePrice: 40, date: "2026-02-01" },
  { id: "3", category: "Fundo de Emergência", name: "CDB 100% CDI", value: 3000, date: "2026-03-01" },
];

export const INITIAL_GOALS: FinancialGoal[] = [
  {
    id: "1",
    name: "Compra de Casa",
    targetValue: 500000,
    currentValue: 150000,
    deadline: "2030-12-31",
    category: "Casa",
    color: "bg-emerald-500",
  },
  {
    id: "2",
    name: "Novo Veículo",
    targetValue: 80000,
    currentValue: 25000,
    deadline: "2027-06-30",
    category: "Veículo",
    color: "bg-blue-500",
  },
  {
    id: "3",
    name: "Viagem Europa",
    targetValue: 20000,
    currentValue: 8000,
    deadline: "2026-12-15",
    category: "Viagem",
    color: "bg-purple-500",
  },
];

export const INITIAL_SHOPPING_LIST: ShoppingItem[] = [
  {
    id: "1",
    name: "Produtos de Limpeza",
    category: "CASA",
    date: "2026-03-28",
    completed: false,
    icon: "Sparkles"
  },
  {
    id: "2",
    name: "Verduras e Legumes",
    category: "CASA",
    date: "2026-03-28",
    completed: false,
    icon: "Leaf"
  },
  {
    id: "3",
    name: "Óleo para o motor",
    category: "CARRO",
    date: "2026-04-05",
    completed: false,
    icon: "Droplets"
  },
  {
    id: "4",
    name: "Pneus novos",
    category: "CARRO",
    date: "2026-05-10",
    completed: false,
    icon: "CircleDot"
  },
  {
    id: "5",
    name: "Lâmpada LED",
    category: "QUARTO",
    date: "2026-03-29",
    completed: true,
    icon: "Lightbulb"
  }
];
