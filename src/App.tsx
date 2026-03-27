/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Transactions } from "./components/Transactions";
import { Planning } from "./components/Planning";
import { Calendar } from "./components/Calendar";
import { FixedBills } from "./components/FixedBills";
import { BankAccounts } from "./components/BankAccounts";
import { Investments } from "./components/Investments";
import { ShoppingList } from "./components/ShoppingList";
import { FinancialProjection } from "./components/FinancialProjection";
import { Reports } from "./components/Reports";
import { SmartAnalysis } from "./components/SmartAnalysis";
import { Settings } from "./components/Settings";
import { DebtTicker } from "./components/DebtTicker";
import { useFinancialData } from "./hooks/useFinancialData";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { 
    data, 
    totalIncome, 
    totalExpenses, 
    balance, 
    savingsPercent,
    alertDays,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateBudget,
    addFixedBill,
    updateFixedBill,
    deleteFixedBill,
    addBankAccount,
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
    updateUserProfile
  } = useFinancialData(activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard 
            data={data} 
            totalIncome={totalIncome} 
            totalExpenses={totalExpenses} 
            balance={balance} 
            savingsPercent={savingsPercent} 
          />
        );
      case "banks":
        return (
          <BankAccounts 
            accounts={data.bankAccounts} 
            onAdd={addBankAccount} 
            onDelete={deleteBankAccount} 
            onSync={syncBankAccount} 
          />
        );
      case "transactions":
        return (
          <Transactions 
            transactions={data.transactions} 
            onAdd={addTransaction} 
            onUpdate={updateTransaction}
            onDelete={deleteTransaction} 
          />
        );
      case "planning":
        return (
          <Planning 
            data={data} 
            onUpdateBudget={updateBudget} 
          />
        );
      case "calendar":
        return <Calendar data={data} />;
      case "fixed":
        return (
          <FixedBills 
            bills={data.fixedBills} 
            alertDays={alertDays}
            onUpdateAlertDays={setAlertDays}
            onUpdateStatus={(id, status) => updateFixedBill(id, { status })} 
            onAdd={addFixedBill}
            onUpdate={updateFixedBill}
            onDelete={deleteFixedBill}
          />
        );
      case "investments":
        return (
          <Investments 
            data={data} 
            onSetGoal={setSavingsGoal} 
            onAdd={addInvestment}
            onUpdate={updateInvestment}
            onDelete={deleteInvestment}
          />
        );
      case "shopping":
        return (
          <ShoppingList 
            items={data.shoppingList}
            onAddItem={addShoppingItem}
            onUpdateItem={updateShoppingItem}
            onDeleteItem={deleteShoppingItem}
            onToggleItem={toggleShoppingItem}
          />
        );
      case "projection":
        return (
          <FinancialProjection 
            data={data} 
            totalIncome={totalIncome} 
            totalExpenses={totalExpenses} 
            balance={balance} 
            onAddGoal={addGoal}
            onUpdateGoal={updateGoal}
            onDeleteGoal={deleteGoal}
          />
        );
      case "reports":
        return <Reports data={data} />;
      case "analysis":
        return <SmartAnalysis data={data} />;
      case "settings":
        return (
          <Settings 
            alertDays={alertDays} 
            onUpdateAlertDays={setAlertDays} 
            userProfile={data.userProfile}
            onUpdateProfile={updateUserProfile}
          />
        );
      default:
        return <Dashboard data={data} totalIncome={totalIncome} totalExpenses={totalExpenses} balance={balance} savingsPercent={savingsPercent} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userProfile={data.userProfile} />
      
      <main className="flex-1 ml-64 p-10">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <DebtTicker bills={data.fixedBills} />
    </div>
  );
}
