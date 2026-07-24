import type { Transaction } from '../types'

export const CATEGORY_LABELS: Record<string, string> = {
  salary: 'Salaire',
  freelance: 'Freelance',
  investment: 'Investissement',
  food: 'Alimentation',
  transport: 'Transport',
  housing: 'Logement',
  entertainment: 'Loisirs',
  health: 'Santé',
  education: 'Éducation',
  shopping: 'Shopping',
  utilities: 'Factures',
  other: 'Autre',
}

// Couleurs alignées sur celles définies côté backend (src/database/seed.ts)
export const CATEGORY_COLORS: Record<string, string> = {
  salary: '#22c55e',
  freelance: '#3b82f6',
  investment: '#a855f7',
  food: '#ef4444',
  transport: '#06b6d4',
  housing: '#f59e0b',
  entertainment: '#ec4899',
  health: '#14b8a6',
  education: '#6366f1',
  shopping: '#8b5cf6',
  utilities: '#f97316',
  other: '#64748b',
}

export const CATEGORY_ICONS: Record<string, string> = {
  salary: '💼',
  freelance: '💻',
  investment: '📈',
  food: '🍽️',
  transport: '🚗',
  housing: '🏠',
  entertainment: '🎬',
  health: '⚕️',
  education: '📚',
  shopping: '🛍️',
  utilities: '⚡',
  other: '📦',
}

// Type autorisé par catégorie, aligné sur le backend (src/database/seed.ts)
export const CATEGORY_TYPES: Record<string, 'income' | 'expense' | 'both'> = {
  salary: 'income',
  freelance: 'income',
  investment: 'income',
  food: 'expense',
  transport: 'expense',
  housing: 'expense',
  entertainment: 'expense',
  health: 'expense',
  education: 'expense',
  shopping: 'expense',
  utilities: 'expense',
  other: 'both',
}

export function categoriesForType(type: 'income' | 'expense'): string[] {
  return Object.keys(CATEGORY_TYPES).filter(k => CATEGORY_TYPES[k] === type || CATEGORY_TYPES[k] === 'both')
}

export function formatCurrency(amount: number, currency = 'FCFA'): string {
  if (currency === 'FCFA') {
    return new Intl.NumberFormat('fr-SN').format(amount) + ' FCFA'
  }
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function getTotalIncome(transactions: Transaction[]): number {
  return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
}

export function getTotalExpense(transactions: Transaction[]): number {
  return transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
}

export function getBalance(transactions: Transaction[]): number {
  return getTotalIncome(transactions) - getTotalExpense(transactions)
}
