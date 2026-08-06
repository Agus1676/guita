import type { SQLiteDatabase } from 'expo-sqlite';

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

export async function initDatabase(db?: SQLiteDatabase): Promise<void> {
  if (!db) return;
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT DEFAULT '',
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
  `);
}

export async function addTransaction(
  db: SQLiteDatabase | null,
  type: 'income' | 'expense',
  amount: number,
  category: string,
  description: string,
  date: string
): Promise<number> {
  if (!db) return 0;
  const result = await db.runAsync(
    'INSERT INTO transactions (type, amount, category, description, date) VALUES (?, ?, ?, ?, ?)',
    type, amount, category, description, date
  );
  return result.lastInsertRowId;
}

export async function getTransactions(
  db: SQLiteDatabase | null,
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
  if (!db) return [];
  let query = 'SELECT * FROM transactions WHERE 1=1';
  const params: any[] = [];

  if (options?.startDate) {
    query += ' AND date >= ?';
    params.push(options.startDate);
  }
  if (options?.endDate) {
    query += ' AND date <= ?';
    params.push(options.endDate);
  }
  if (options?.type) {
    query += ' AND type = ?';
    params.push(options.type);
  }
  if (options?.category) {
    query += ' AND category = ?';
    params.push(options.category);
  }
  if (options?.search) {
    query += ' AND description LIKE ?';
    params.push(`%${options.search}%`);
  }

  query += ' ORDER BY date DESC, created_at DESC';

  if (options?.limit !== undefined) {
    query += ' LIMIT ?';
    params.push(options.limit);
  }
  if (options?.offset !== undefined) {
    query += ' OFFSET ?';
    params.push(options.offset);
  }

  return await db.getAllAsync<Transaction>(query, ...params);
}

export async function getMonthlyBalance(
  db: SQLiteDatabase | null,
  year: number,
  month: number
): Promise<MonthlyBalance> {
  if (!db) return { income: 0, expense: 0, balance: 0 };
  const startMonthStr = String(month + 1).padStart(2, '0');
  const startDate = `${year}-${startMonthStr}-01`;
  const endDate = `${year}-${startMonthStr}-31`;

  const query = `
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
    FROM transactions 
    WHERE date >= ? AND date <= ?
  `;
  
  const result = await db.getFirstAsync<{ income: number | null, expense: number | null }>(query, startDate, endDate);
  
  const income = result?.income || 0;
  const expense = result?.expense || 0;
  
  return {
    income,
    expense,
    balance: income - expense
  };
}

export async function getCategoryTotals(
  db: SQLiteDatabase | null,
  year: number,
  month: number,
  type: 'income' | 'expense'
): Promise<CategoryTotal[]> {
  if (!db) return [];
  const startMonthStr = String(month + 1).padStart(2, '0');
  const startDate = `${year}-${startMonthStr}-01`;
  const endDate = `${year}-${startMonthStr}-31`;

  const query = `
    SELECT category, SUM(amount) as total
    FROM transactions
    WHERE date >= ? AND date <= ? AND type = ?
    GROUP BY category
    ORDER BY total DESC
  `;

  return await db.getAllAsync<CategoryTotal>(query, startDate, endDate, type);
}

export async function getRecentTransactions(
  db: SQLiteDatabase | null,
  limit: number = 5
): Promise<Transaction[]> {
  if (!db) return [];
  return await db.getAllAsync<Transaction>(
    'SELECT * FROM transactions ORDER BY date DESC, created_at DESC LIMIT ?',
    limit
  );
}

export async function deleteTransaction(
  db: SQLiteDatabase | null,
  id: number
): Promise<void> {
  if (!db) return;
  await db.runAsync('DELETE FROM transactions WHERE id = ?', id);
}
