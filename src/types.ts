export type TransactionType = "Receita" | "Despesa";
export type TransactionStatus = "Pago" | "Pendente";
export type Priority = "Alta" | "Média" | "Baixa";

export interface Transaction {
  id: string;
  date: string;
  time: string;
  type: TransactionType;
  category: string;
  subcategory: string;
  description: string;
  paymentMethod: string;
  value: number;
  status: TransactionStatus;
  priority: Priority;
}

export interface Budget {
  category: string;
  planned: number;
}

export interface BillPayment {
  id: string;
  date: string;
  value: number;
  status: TransactionStatus;
}

export interface FixedBill {
  id: string;
  name: string;
  value: number;
  dueDate: string;
  status: TransactionStatus;
  category?: string;
  paymentMethod?: string;
  priority?: Priority;
  paymentHistory?: BillPayment[];
}

export interface Investment {
  id: string;
  category: string;
  name: string;
  value: number;
  quantity?: number;
  averagePrice?: number;
  date: string;
}

export interface SyncLog {
  id: string;
  date: string;
  status: "Sucesso" | "Falha";
  message?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  institution: string;
  balance: number;
  type: "Corrente" | "Poupança" | "Investimento";
  lastSync?: string;
  status: "Sincronizado" | "Desconectado" | "Sincronizando";
  color: string;
  syncHistory?: SyncLog[];
}

export interface UserProfile {
  name: string;
  email: string;
  profession: string;
  birthDate: string;
  photoUrl?: string;
  plan: "Free" | "Premium" | "Enterprise";
  location?: string;
  bio?: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  category: "Casa" | "Veículo" | "Viagem" | "Reserva" | "Outro";
  icon?: string;
  color?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  value?: number;
  date: string;
  completed: boolean;
  icon?: string;
  imageUrl?: string;
}

export interface FinancialData {
  transactions: Transaction[];
  budgets: Budget[];
  fixedBills: FixedBill[];
  investments: Investment[];
  bankAccounts: BankAccount[];
  goals: FinancialGoal[];
  shoppingList: ShoppingItem[];
  userProfile: UserProfile;
  savingsGoalPercent: number;
  alertDays: number[];
}
