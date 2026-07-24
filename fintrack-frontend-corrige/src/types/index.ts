export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  currency: string
  monthlyBudget: number
}

export type TransactionType = 'income' | 'expense'

export type Category =
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'food'
  | 'transport'
  | 'housing'
  | 'entertainment'
  | 'health'
  | 'education'
  | 'shopping'
  | 'utilities'
  | 'other'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: Category
  description: string
  date: string
  icon?: string
}

export interface MonthlyData {
  month: string
  income: number
  expense: number
}

export interface CategoryStat {
  category: Category
  amount: number
  percentage: number
  color: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
}
