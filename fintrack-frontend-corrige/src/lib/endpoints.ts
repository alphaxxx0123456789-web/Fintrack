import { api } from './api'
import type { TransactionType, Category } from '../types'

export interface ApiUser {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  currency: string
  monthlyBudget: number
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface ApiTransaction {
  id: string
  type: TransactionType
  amount: number
  category: Category
  description: string
  date: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface ApiCategory {
  id: string
  key: Category
  label: string
  icon: string
  color: string
  type: 'income' | 'expense' | 'both'
}

export interface AuthResponse {
  accessToken: string
  user: ApiUser
}

export interface CreateTransactionInput {
  type: TransactionType
  amount: number
  category: string
  description: string
  date: string
}

/* ─── Auth ────────────────────────────────────────────────────── */
export const authApi = {
  login: (email: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/register', { name, email, password }),
}

/* ─── Utilisateur courant ────────────────────────────────────── */
export const usersApi = {
  me: (): Promise<ApiUser> => api.get('/users/me'),
  updateMe: (data: Partial<{ name: string; email: string; currency: string; monthlyBudget: number; avatar: string }>): Promise<ApiUser> =>
    api.patch('/users/me', data),
  changePassword: (currentPassword: string, newPassword: string): Promise<{ message: string }> =>
    api.patch('/users/me/password', { currentPassword, newPassword }),
  deleteMe: (): Promise<void> => api.delete('/users/me'),
}

/* ─── Transactions ───────────────────────────────────────────── */
export const transactionsApi = {
  list: (): Promise<ApiTransaction[]> => api.get('/transactions'),
  create: (data: CreateTransactionInput): Promise<ApiTransaction> => api.post('/transactions', data),
  remove: (id: string): Promise<void> => api.delete(`/transactions/${id}`),
  /** Supprime en une fois toutes les dépenses ou tous les revenus de l'utilisateur */
  removeAllByType: (type: TransactionType): Promise<{ deleted: number }> =>
    api.delete(`/transactions/bulk/${type}`),
}

/* ─── Catégories ──────────────────────────────────────────────── */
export const categoriesApi = {
  list: (): Promise<ApiCategory[]> => api.get('/categories'),
}

/* ─── Objectifs d'épargne ─────────────────────────────────────── */
export interface ApiGoal {
  id: string
  name: string
  target: number
  current: number
  color: string
  icon: string
  deadline: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateGoalInput {
  name: string
  target: number
  current?: number
  color?: string
  icon?: string
  deadline?: string
}

export const goalsApi = {
  list: (): Promise<ApiGoal[]> => api.get('/goals'),
  create: (data: CreateGoalInput): Promise<ApiGoal> => api.post('/goals', data),
  update: (id: string, data: Partial<CreateGoalInput>): Promise<ApiGoal> => api.patch(`/goals/${id}`, data),
  remove: (id: string): Promise<void> => api.delete(`/goals/${id}`),
  /** Supprime en une fois tous les objectifs de l'utilisateur */
  removeAll: (): Promise<{ deleted: number }> => api.delete('/goals'),
}
