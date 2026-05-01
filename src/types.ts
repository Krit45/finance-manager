export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id?: string;
  uid: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note?: string;
  isRecurring?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  currency?: string;
  monthlyBudget?: number;
  theme?: 'light' | 'dark';
  role?: 'admin' | 'user';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
}

export const CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', icon: 'Utensils', color: 'bg-orange-500', type: 'expense' },
  { id: 'travel', name: 'Travel', icon: 'Plane', color: 'bg-blue-500', type: 'expense' },
  { id: 'bills', name: 'Bills', icon: 'Receipt', color: 'bg-red-500', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: 'bg-purple-500', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Film', color: 'bg-pink-500', type: 'expense' },
  { id: 'health', name: 'Health', icon: 'HeartPulse', color: 'bg-green-500', type: 'expense' },
  { id: 'salary', name: 'Salary', icon: 'Wallet', color: 'bg-emerald-500', type: 'income' },
  { id: 'investment', name: 'Investment', icon: 'TrendingUp', color: 'bg-indigo-500', type: 'income' },
  { id: 'other_income', name: 'Other Income', icon: 'PlusCircle', color: 'bg-teal-500', type: 'income' },
  { id: 'other_expense', name: 'Other Expense', icon: 'MinusCircle', color: 'bg-gray-500', type: 'expense' },
];
