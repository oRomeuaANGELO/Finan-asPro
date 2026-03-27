import { useState, useEffect } from "react";
import { Transaction, Budget, FixedBill, Investment, BankAccount, UserProfile, FinancialData, FinancialGoal, ShoppingItem } from "../types";
import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS, INITIAL_FIXED_BILLS, INITIAL_INVESTMENTS, INITIAL_BANK_ACCOUNTS, INITIAL_USER_PROFILE, INITIAL_GOALS, INITIAL_SHOPPING_LIST } from "../constants";
import { bankSyncService } from "../services/bankSyncService";

export function useFinancialData() {
  const [data, setData] = useState<FinancialData>(() => {
    const saved = localStorage.getItem("financial_data");
    const initialData: FinancialData = {
      transactions: INITIAL_TRANSACTIONS,
      budgets: INITIAL_BUDGETS,
      fixedBills: INITIAL_FIXED_BILLS,
      investments: INITIAL_INVESTMENTS,
      bankAccounts: INITIAL_BANK_ACCOUNTS,
      goals: INITIAL_GOALS,
      shoppingList: INITIAL_SHOPPING_LIST,
      userProfile: INITIAL_USER_PROFILE,
      savingsGoalPercent: 20,
      alertDays: [1, 3],
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return {
            ...initialData,
            ...parsed,
            // Ensure arrays exist even if missing or null in parsed data
            transactions: Array.isArray(parsed.transactions) ? parsed.transactions : initialData.transactions,
            budgets: Array.isArray(parsed.budgets) ? parsed.budgets : initialData.budgets,
            fixedBills: Array.isArray(parsed.fixedBills) ? parsed.fixedBills : initialData.fixedBills,
            investments: Array.isArray(parsed.investments) ? parsed.investments : initialData.investments,
            bankAccounts: Array.isArray(parsed.bankAccounts) ? parsed.bankAccounts : initialData.bankAccounts,
            goals: Array.isArray(parsed.goals) ? parsed.goals : initialData.goals,
            shoppingList: Array.isArray(parsed.shoppingList) ? parsed.shoppingList : initialData.shoppingList,
            userProfile: parsed.userProfile || initialData.userProfile,
            alertDays: Array.isArray(parsed.alertDays) ? parsed.alertDays : initialData.alertDays,
          };
        }
      } catch (e) {
        console.error("Error parsing financial data:", e);
      }
    }
    return initialData;
  });

  useEffect(() => {
    localStorage.setItem("financial_data", JSON.stringify(data));
  }, [data]);

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = { ...transaction, id: crypto.randomUUID() };
    setData((prev) => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions],
    }));
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) => (t.id === id ? { ...t, ...updated } : t)),
    }));
  };

  const deleteTransaction = (id: string) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
  };

  const updateBudget = (category: string, planned: number) => {
    setData((prev) => ({
      ...prev,
      budgets: prev.budgets.map((b) => (b.category === category ? { ...b, planned } : b)),
    }));
  };

  const addFixedBill = (bill: Omit<FixedBill, "id">) => {
    const newBill = { ...bill, id: crypto.randomUUID() };
    setData((prev) => ({
      ...prev,
      fixedBills: [...prev.fixedBills, newBill],
    }));
  };

  const updateFixedBill = (id: string, updated: Partial<FixedBill>) => {
    setData((prev) => ({
      ...prev,
      fixedBills: prev.fixedBills.map((b) => (b.id === id ? { ...b, ...updated } : b)),
    }));
  };

  const deleteFixedBill = (id: string) => {
    setData((prev) => ({
      ...prev,
      fixedBills: prev.fixedBills.filter((b) => b.id !== id),
    }));
  };

  const addBankAccount = (account: Omit<BankAccount, "id">) => {
    const newAccount = { ...account, id: crypto.randomUUID() };
    setData((prev) => ({
      ...prev,
      bankAccounts: [...prev.bankAccounts, newAccount],
    }));
  };

  const updateBankAccount = (id: string, updated: Partial<BankAccount>) => {
    setData((prev) => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map((b) => (b.id === id ? { ...b, ...updated } : b)),
    }));
  };

  const deleteBankAccount = (id: string) => {
    setData((prev) => ({
      ...prev,
      bankAccounts: prev.bankAccounts.filter((b) => b.id !== id),
    }));
  };

  const syncBankAccount = async (id: string) => {
    const account = data.bankAccounts.find(b => b.id === id);
    if (!account) return;

    updateBankAccount(id, { status: "Sincronizando" });
    
    try {
      const response = await bankSyncService.fetchUpdatedBalance(id, account.institution);
      
      updateBankAccount(id, { 
        status: response.status, 
        lastSync: response.lastSync,
        balance: response.newBalance
      });
    } catch (error) {
      console.error("Failed to sync bank account:", error);
      updateBankAccount(id, { status: "Desconectado" });
    }
  };

  const addInvestment = (investment: Omit<Investment, "id">) => {
    const newInvestment = { ...investment, id: crypto.randomUUID() };
    setData((prev) => ({
      ...prev,
      investments: [...prev.investments, newInvestment],
    }));
  };

  const updateInvestment = (id: string, updated: Partial<Investment>) => {
    setData((prev) => ({
      ...prev,
      investments: prev.investments.map((i) => (i.id === id ? { ...i, ...updated } : i)),
    }));
  };

  const deleteInvestment = (id: string) => {
    setData((prev) => ({
      ...prev,
      investments: prev.investments.filter((i) => i.id !== id),
    }));
  };

  const addGoal = (goal: Omit<FinancialGoal, "id">) => {
    const newGoal = { ...goal, id: crypto.randomUUID() };
    setData((prev) => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));
  };

  const updateGoal = (id: string, updated: Partial<FinancialGoal>) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...updated } : g)),
    }));
  };

  const deleteGoal = (id: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  };

  const addShoppingItem = (item: Omit<ShoppingItem, "id">) => {
    const newItem = { ...item, id: crypto.randomUUID() };
    setData((prev) => ({
      ...prev,
      shoppingList: [...prev.shoppingList, newItem],
    }));
  };

  const updateShoppingItem = (id: string, updated: Partial<ShoppingItem>) => {
    setData((prev) => ({
      ...prev,
      shoppingList: prev.shoppingList.map((i) => (i.id === id ? { ...i, ...updated } : i)),
    }));
  };

  const deleteShoppingItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      shoppingList: prev.shoppingList.filter((i) => i.id !== id),
    }));
  };

  const toggleShoppingItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      shoppingList: prev.shoppingList.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i)),
    }));
  };

  const setSavingsGoal = (percent: number) => {
    setData((prev) => ({ ...prev, savingsGoalPercent: percent }));
  };

  const setAlertDays = (days: number[]) => {
    setData((prev) => ({ ...prev, alertDays: days }));
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setData((prev) => ({
      ...prev,
      userProfile: { ...prev.userProfile, ...profile },
    }));
  };

  // Calculations
  const totalIncome = data.transactions
    .filter((t) => t.type === "Receita")
    .reduce((acc, t) => acc + t.value, 0);

  const totalExpenses = data.transactions
    .filter((t) => t.type === "Despesa")
    .reduce((acc, t) => acc + t.value, 0);

  const balance = totalIncome - totalExpenses;
  const savingsPercent = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  return {
    data,
    totalIncome,
    totalExpenses,
    balance,
    savingsPercent,
    alertDays: data.alertDays,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateBudget,
    addFixedBill,
    updateFixedBill,
    deleteFixedBill,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    syncBankAccount,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addGoal,
    updateGoal,
    deleteGoal,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    toggleShoppingItem,
    setSavingsGoal,
    setAlertDays,
    updateUserProfile,
  };
}
