import * as dbNative from '@/db/database.native';
import * as dbWeb from '@/db/database.web';
import { Platform } from 'react-native';

export interface SampleTransaction {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export const SAMPLE_TRANSACTIONS: SampleTransaction[] = [
  // MARZO 2026
  { type: 'income', amount: 390000, category: 'salary', description: 'Sueldo Marzo', date: '2026-03-01' },
  { type: 'income', amount: 80000, category: 'freelance', description: 'Consultoría Freelance', date: '2026-03-10' },
  { type: 'expense', amount: 78000, category: 'credit_card', description: 'Resumen Tarjeta Visa', date: '2026-03-10' },
  { type: 'expense', amount: 48000, category: 'food', description: 'Supermercado Coto', date: '2026-03-05' },
  { type: 'expense', amount: 22000, category: 'services', description: 'Luz + Gas + Internet', date: '2026-03-08' },
  { type: 'expense', amount: 20000, category: 'transport', description: 'Carga Nafta YPF', date: '2026-03-12' },
  { type: 'expense', amount: 18000, category: 'entertainment', description: 'Restaurante / Cena', date: '2026-03-18' },
  { type: 'expense', amount: 14000, category: 'health', description: 'Gimnasio Pase Libre', date: '2026-03-02' },

  // ABRIL 2026
  { type: 'income', amount: 400000, category: 'salary', description: 'Sueldo Abril', date: '2026-04-01' },
  { type: 'income', amount: 110000, category: 'freelance', description: 'App Mobile React Native', date: '2026-04-14' },
  { type: 'expense', amount: 82000, category: 'credit_card', description: 'Resumen Tarjeta MasterCard', date: '2026-04-10' },
  { type: 'expense', amount: 51000, category: 'food', description: 'Supermercado Carrefour', date: '2026-04-04' },
  { type: 'expense', amount: 38000, category: 'shopping', description: 'Zapatillas y ropa', date: '2026-04-16' },
  { type: 'expense', amount: 24000, category: 'services', description: 'Expensas e Impuestos', date: '2026-04-07' },
  { type: 'expense', amount: 21000, category: 'transport', description: 'Nafta + Carga SUBE', date: '2026-04-20' },
  { type: 'expense', amount: 12000, category: 'health', description: 'Farmacia', date: '2026-04-11' },

  // MAYO 2026
  { type: 'income', amount: 410000, category: 'salary', description: 'Sueldo Mayo', date: '2026-05-01' },
  { type: 'income', amount: 45000, category: 'other_income', description: 'Venta de artículo usado', date: '2026-05-20' },
  { type: 'expense', amount: 89000, category: 'credit_card', description: 'Resumen Tarjeta Visa', date: '2026-05-10' },
  { type: 'expense', amount: 55000, category: 'food', description: 'Supermercado Jumbo', date: '2026-05-06' },
  { type: 'expense', amount: 32000, category: 'entertainment', description: 'Entradas Concierto + Cine', date: '2026-05-15' },
  { type: 'expense', amount: 25000, category: 'transport', description: 'Combustible YPF', date: '2026-05-19' },
  { type: 'expense', amount: 15000, category: 'health', description: 'Gimnasio', date: '2026-05-02' },
  { type: 'expense', amount: 8500, category: 'subscriptions', description: 'Netflix + Spotify', date: '2026-05-01' },

  // JUNIO 2026
  { type: 'income', amount: 420000, category: 'salary', description: 'Sueldo Junio', date: '2026-06-01' },
  { type: 'income', amount: 30000, category: 'gift', description: 'Regalo Cumpleaños', date: '2026-06-12' },
  { type: 'expense', amount: 85000, category: 'credit_card', description: 'Resumen Tarjeta Visa', date: '2026-06-10' },
  { type: 'expense', amount: 52000, category: 'food', description: 'Supermercado Carrefour', date: '2026-06-04' },
  { type: 'expense', amount: 35000, category: 'clothing', description: 'Zapatillas deportivas', date: '2026-06-22' },
  { type: 'expense', amount: 24000, category: 'entertainment', description: 'Cine + Teatro', date: '2026-06-15' },
  { type: 'expense', amount: 22000, category: 'transport', description: 'Carga SUBE + Nafta', date: '2026-06-18' },

  // JULIO 2026
  { type: 'income', amount: 450000, category: 'salary', description: 'Sueldo Julio', date: '2026-07-01' },
  { type: 'income', amount: 95000, category: 'freelance', description: 'Diseño UX/UI Freelance', date: '2026-07-15' },
  { type: 'expense', amount: 98400, category: 'credit_card', description: 'Resumen Tarjeta MasterCard', date: '2026-07-10' },
  { type: 'expense', amount: 58000, category: 'food', description: 'Supermercado Jumbo', date: '2026-07-05' },
  { type: 'expense', amount: 42000, category: 'shopping', description: 'Ropa e indumentaria', date: '2026-07-18' },
  { type: 'expense', amount: 26000, category: 'services', description: 'Luz + Gas + Internet', date: '2026-07-08' },
  { type: 'expense', amount: 16000, category: 'health', description: 'Cuota Gimnasio', date: '2026-07-02' },
  { type: 'expense', amount: 14500, category: 'health', description: 'Farmacia', date: '2026-07-12' },

  // AGOSTO 2026
  { type: 'income', amount: 450000, category: 'salary', description: 'Sueldo Agosto', date: '2026-08-01' },
  { type: 'income', amount: 120000, category: 'freelance', description: 'Proyecto Web React Native', date: '2026-08-03' },
  { type: 'expense', amount: 112000, category: 'credit_card', description: 'Resumen Tarjeta Visa', date: '2026-08-04' },
  { type: 'expense', amount: 64500, category: 'food', description: 'Supermercado Coto', date: '2026-08-02' },
  { type: 'expense', amount: 28000, category: 'transport', description: 'Nafta YPF', date: '2026-08-03' },
  { type: 'expense', amount: 8500, category: 'subscriptions', description: 'Netflix + Spotify', date: '2026-08-01' },
  { type: 'expense', amount: 18200, category: 'entertainment', description: 'Cena con amigos', date: '2026-08-04' },
];

export async function forceSeedSampleData(sqliteDb?: any): Promise<void> {
  const db = Platform.OS === 'web' ? dbWeb : dbNative;

  // Insert all 6 months of sample transactions
  for (const t of SAMPLE_TRANSACTIONS) {
    // Check if already inserted to prevent duplicates
    const existing = await db.getTransactions(sqliteDb, { search: t.description, startDate: t.date, endDate: t.date });
    if (existing.length === 0) {
      await db.addTransaction(sqliteDb, t.type, t.amount, t.category, t.description, t.date);
    }
  }
}

export async function seedSampleData(sqliteDb?: any): Promise<void> {
  await forceSeedSampleData(sqliteDb);
}
