import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import * as db from '@/db/database.web';
import { seedSampleData } from '@/utils/sampleData';
import type { Transaction, MonthlyBalance, CategoryTotal } from '@/db/database.web';

interface DatabaseContextType {
  transactions: Transaction[];
  recentTransactions: Transaction[];
  monthlyBalance: MonthlyBalance;
  categoryTotals: CategoryTotal[];
  
  currentYear: number;
  currentMonth: number;
  setMonth: (year: number, month: number) => void;
  
  addTransaction: (type: 'income' | 'expense', amount: number, category: string, description: string, date: string) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  refreshData: () => Promise<void>;
  
  searchTransactions: (options?: { startDate?: string; endDate?: string; type?: 'income' | 'expense'; category?: string; search?: string; }) => Promise<Transaction[]>;
  
  isLoading: boolean;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [monthlyBalance, setMonthlyBalance] = useState<MonthlyBalance>({ income: 0, expense: 0, balance: 0 });
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const startMonthStr = String(currentMonth + 1).padStart(2, '0');
      const startDate = `${currentYear}-${startMonthStr}-01`;
      const endDate = `${currentYear}-${startMonthStr}-31`;

      const [monthlyTransactions, recent, balance, catTotals] = await Promise.all([
        db.getTransactions(null, { startDate, endDate }),
        db.getRecentTransactions(null, 5),
        db.getMonthlyBalance(null, currentYear, currentMonth),
        db.getCategoryTotals(null, currentYear, currentMonth, 'expense')
      ]);

      setTransactions(monthlyTransactions);
      setRecentTransactions(recent);
      setMonthlyBalance(balance);
      setCategoryTotals(catTotals);
    } catch (error) {
      console.error('Error refreshing data (web):', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    const init = async () => {
      await db.initDatabase();
      await seedSampleData(null);
      await refreshData();
    };
    init();
  }, [refreshData]);

  const setMonth = useCallback((year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  }, []);

  const addTransaction = useCallback(async (type: 'income' | 'expense', amount: number, category: string, description: string, date: string) => {
    await db.addTransaction(null, type, amount, category, description, date);
    await refreshData();
  }, [refreshData]);

  const deleteTransaction = useCallback(async (id: number) => {
    await db.deleteTransaction(null, id);
    await refreshData();
  }, [refreshData]);

  const searchTransactions = useCallback(async (options?: { startDate?: string; endDate?: string; type?: 'income' | 'expense'; category?: string; search?: string; }) => {
    return await db.getTransactions(null, options);
  }, []);

  return (
    <DatabaseContext.Provider
      value={{
        transactions,
        recentTransactions,
        monthlyBalance,
        categoryTotals,
        currentYear,
        currentMonth,
        setMonth,
        addTransaction,
        deleteTransaction,
        refreshData,
        searchTransactions,
        isLoading
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabaseContext() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabaseContext must be used within a DatabaseProvider');
  }
  return context;
}
