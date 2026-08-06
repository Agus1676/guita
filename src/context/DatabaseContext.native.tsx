import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import * as db from '@/db/database.native';
import { seedSampleData } from '@/utils/sampleData';
import type { Transaction, MonthlyBalance, CategoryTotal } from '@/db/database.native';

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
  const sqliteDb = useSQLiteContext();
  
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
        db.getTransactions(sqliteDb, { startDate, endDate }),
        db.getRecentTransactions(sqliteDb, 5),
        db.getMonthlyBalance(sqliteDb, currentYear, currentMonth),
        db.getCategoryTotals(sqliteDb, currentYear, currentMonth, 'expense')
      ]);

      setTransactions(monthlyTransactions);
      setRecentTransactions(recent);
      setMonthlyBalance(balance);
      setCategoryTotals(catTotals);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sqliteDb, currentYear, currentMonth]);

  useEffect(() => {
    const init = async () => {
      await db.initDatabase(sqliteDb);
      await seedSampleData(sqliteDb);
      await refreshData();
    };
    init();
  }, [sqliteDb, refreshData]);

  const setMonth = useCallback((year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  }, []);

  const addTransaction = useCallback(async (type: 'income' | 'expense', amount: number, category: string, description: string, date: string) => {
    await db.addTransaction(sqliteDb, type, amount, category, description, date);
    await refreshData();
  }, [sqliteDb, refreshData]);

  const deleteTransaction = useCallback(async (id: number) => {
    await db.deleteTransaction(sqliteDb, id);
    await refreshData();
  }, [sqliteDb, refreshData]);

  const searchTransactions = useCallback(async (options?: { startDate?: string; endDate?: string; type?: 'income' | 'expense'; category?: string; search?: string; }) => {
    return await db.getTransactions(sqliteDb, options);
  }, [sqliteDb]);

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
