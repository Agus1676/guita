export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
}

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Comida', icon: 'fast-food', color: '#FF6B6B', type: 'expense' },
  { id: 'credit_card', name: 'Tarjeta Crédito', icon: 'card', color: '#8B5CF6', type: 'expense' },
  { id: 'transport', name: 'Transporte', icon: 'car', color: '#4ECDC4', type: 'expense' },
  { id: 'entertainment', name: 'Entretenimiento', icon: 'game-controller', color: '#FFE66D', type: 'expense' },
  { id: 'home', name: 'Hogar', icon: 'home', color: '#6C63FF', type: 'expense' },
  { id: 'health', name: 'Salud', icon: 'medkit', color: '#FF8A5C', type: 'expense' },
  { id: 'subscriptions', name: 'Suscripciones', icon: 'play-circle', color: '#EC4899', type: 'expense' },
  { id: 'shopping', name: 'Compras', icon: 'bag-handle', color: '#F59E0B', type: 'expense' },
  { id: 'education', name: 'Educación', icon: 'school', color: '#45B7D1', type: 'expense' },
  { id: 'clothing', name: 'Ropa', icon: 'shirt', color: '#DDA0DD', type: 'expense' },
  { id: 'services', name: 'Servicios', icon: 'document-text', color: '#98D8C8', type: 'expense' },
  { id: 'other_expense', name: 'Otros', icon: 'ellipsis-horizontal-circle', color: '#A0A0B8', type: 'expense' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salario', icon: 'cash', color: '#00D09C', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: 'laptop', color: '#6C63FF', type: 'income' },
  { id: 'investments', name: 'Inversiones', icon: 'trending-up', color: '#4ECDC4', type: 'income' },
  { id: 'gift', name: 'Regalo', icon: 'gift', color: '#FFB6C1', type: 'income' },
  { id: 'other_income', name: 'Otros ingresos', icon: 'wallet', color: '#45B7D1', type: 'income' },
];

export const ALL_CATEGORIES: Category[] = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryById(id: string): Category | undefined {
  return ALL_CATEGORIES.find(cat => cat.id === id);
}

export function getCategoriesByType(type: 'income' | 'expense'): Category[] {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}
