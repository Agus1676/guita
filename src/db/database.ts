import { Platform } from 'react-native';
import * as webDb from './database.web';

let nativeDb: any = null;
if (Platform.OS !== 'web') {
  try {
    nativeDb = require('./database.native');
  } catch (e) {}
}

export const initDatabase = (db: any) => Platform.OS === 'web' ? webDb.initDatabase() : nativeDb?.initDatabase(db);
export const addTransaction = (db: any, type: any, amount: any, category: any, description: any, date: any) => 
  Platform.OS === 'web' ? webDb.addTransaction(type, amount, category, description, date) : nativeDb?.addTransaction(db, type, amount, category, description, date);
export const getTransactions = (db: any, options: any) => 
  Platform.OS === 'web' ? webDb.getTransactions(options) : nativeDb?.getTransactions(db, options);
export const getMonthlyBalance = (db: any, year: any, month: any) => 
  Platform.OS === 'web' ? webDb.getMonthlyBalance(year, month) : nativeDb?.getMonthlyBalance(db, year, month);
export const getCategoryTotals = (db: any, year: any, month: any, type: any) => 
  Platform.OS === 'web' ? webDb.getCategoryTotals(year, month, type) : nativeDb?.getCategoryTotals(db, year, month, type);
export const getRecentTransactions = (db: any, limit?: any) => 
  Platform.OS === 'web' ? webDb.getRecentTransactions(limit) : nativeDb?.getRecentTransactions(db, limit);
export const deleteTransaction = (db: any, id: any) => 
  Platform.OS === 'web' ? webDb.deleteTransaction(id) : nativeDb?.deleteTransaction(db, id);

export type { Transaction, MonthlyBalance, CategoryTotal } from './database.web';
