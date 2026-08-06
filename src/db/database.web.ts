import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
}

export interface MonthlyBalance {
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
}

const STORAGE_KEY = 'guita_transactions_web_v1';

async function getAllStoredTransactions(): Promise<Transaction[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading web storage:', e);
    return [];
  }
}

async function saveAllStoredTransactions(transactions: Transaction[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving web storage:', e);
  }
}

export async function initDatabase(_db?: any): Promise<void> {
  const existing = await AsyncStorage.getItem(STORAGE_KEY);
  if (!existing) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
}

export async function addTransaction(
  _db: any,
  type: 'income' | 'expense',
  amount: number,
  category: string,
  description: string,
  date: string
): Promise<number> {
  const transactions = await getAllStoredTransactions();
  const newId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
  const newTx: Transaction = {
    id: newId,
    type,
    amount,
    category,
    description,
    date,
    created_at: new Date().toISOString(),
  };
  transactions.push(newTx);
  await saveAllStoredTransactions(transactions);
  return newId;
}

export async function getTransactions(
  _db: any,
  options?: {
    startDate?: string;
    endDate?: string;
    type?: 'income' | 'expense';
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }
): Promise<Transaction[]> {
  let transactions = await getAllStoredTransactions();

  if (options?.startDate) {
    transactions = transactions.filter(t => t.date >= options.startDate!);
  }
  if (options?.endDate) {
    transactions = transactions.filter(t => t.date <= options.endDate!);
  }
  if (options?.type) {
    transactions = transactions.filter(t => t.type === options.type);
  }
  if (options?.category) {
    transactions = transactions.filter(t => t.category === options.category);
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    transactions = transactions.filter(t => t.description.toLowerCase().includes(q));
  }

  transactions.sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return b.created_at.localeCompare(a.created_at);
  });

  if (options?.offset !== undefined || options?.limit !== undefined) {
    const start = options.offset || 0;
    const end = options.limit !== undefined ? start + options.limit : transactions.length;
    transactions = transactions.slice(start, end);
  }

  return transactions;
}

export async function getMonthlyBalance(
  _db: any,
  year: number,
  month: number
): Promise<MonthlyBalance> {
  const transactions = await getAllStoredTransactions();
  const startMonthStr = String(month + 1).padStart(2, '0');
  const startDate = `${year}-${startMonthStr}-01`;
  const endDate = `${year}-${startMonthStr}-31`;

  const monthlyTxs = transactions.filter(t => t.date >= startDate && t.date <= endDate);

  let income = 0;
  let expense = 0;

  for (const t of monthlyTxs) {
    if (t.type === 'income') {
      income += t.amount;
    } else if (t.type === 'expense') {
      expense += t.amount;
    }
  }

  return {
    income,
    expense,
    balance: income - expense,
  };
}

export async function getCategoryTotals(
  _db: any,
  year: number,
  month: number,
  type: 'income' | 'expense'
): Promise<CategoryTotal[]> {
  const transactions = await getAllStoredTransactions();
  const startMonthStr = String(month + 1).padStart(2, '0');
  const startDate = `${year}-${startMonthStr}-01`;
  const endDate = `${year}-${startMonthStr}-31`;

  const filtered = transactions.filter(t => t.date >= startDate && t.date <= endDate && t.type === type);

  const totalsMap: { [cat: string]: number } = {};
  for (const t of filtered) {
    totalsMap[t.category] = (totalsMap[t.category] || 0) + t.amount;
  }

  const result: CategoryTotal[] = Object.keys(totalsMap).map(cat => ({
    category: cat,
    total: totalsMap[cat],
  }));

  result.sort((a, b) => b.total - a.total);

  return result;
}

export async function getRecentTransactions(
  _db: any,
  limit: number = 5
): Promise<Transaction[]> {
  return await getTransactions(_db, { limit });
}

export async function deleteTransaction(
  _db: any,
  id: number
): Promise<void> {
  let transactions = await getAllStoredTransactions();
  transactions = transactions.filter(t => t.id !== id);
  await saveAllStoredTransactions(transactions);
}
