import type { Transaction } from '../types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from './data'

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

function monthKey(dateStr: string) {
  return dateStr.slice(0, 7) // 'YYYY-MM'
}

function monthLabel(key: string) {
  const [, m] = key.split('-')
  return MONTH_LABELS[Number(m) - 1] || key
}

export interface CategoryStat {
  category: string
  amount: number
  percentage: number
  color: string
}

/** Répartition (montant + %) des transactions d'un type donné, par catégorie. */
export function getCategoryStats(transactions: Transaction[], type: 'income' | 'expense' = 'expense'): CategoryStat[] {
  const filtered = transactions.filter(t => t.type === type)
  const total = filtered.reduce((s, t) => s + t.amount, 0)
  const byCategory = new Map<string, number>()
  for (const t of filtered) byCategory.set(t.category, (byCategory.get(t.category) || 0) + t.amount)

  return Array.from(byCategory.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      color: CATEGORY_COLORS[category] || '#64748b',
    }))
    .sort((a, b) => b.amount - a.amount)
}

export interface MonthlyPoint {
  month: string
  income: number
  expense: number
}

/**
 * Revenus/dépenses par mois, calculés sur les mois réellement présents dans
 * les données (et non "les 6 derniers mois calendaires"), pour que ça reste
 * cohérent même avec des transactions anciennes ou peu nombreuses.
 */
export function getMonthlyTrend(transactions: Transaction[], monthsBack = 6): MonthlyPoint[] {
  const byMonth = new Map<string, { income: number; expense: number }>()
  for (const t of transactions) {
    const key = monthKey(t.date)
    const entry = byMonth.get(key) || { income: 0, expense: 0 }
    if (t.type === 'income') entry.income += t.amount
    else entry.expense += t.amount
    byMonth.set(key, entry)
  }
  const keys = Array.from(byMonth.keys()).sort().slice(-monthsBack)
  return keys.map(key => ({ month: monthLabel(key), ...byMonth.get(key)! }))
}

export interface IncomeByCategoryPoint {
  month: string
  [category: string]: string | number
}

/** Revenus par mois, décomposés par catégorie (pour un graphique en barres empilées). */
export function getIncomeByCategoryMonthly(transactions: Transaction[], monthsBack = 6): {
  data: IncomeByCategoryPoint[]
  categories: string[]
} {
  const incomes = transactions.filter(t => t.type === 'income')
  const categories = Array.from(new Set(incomes.map(t => t.category)))
  const byMonth = new Map<string, Record<string, number>>()
  for (const t of incomes) {
    const key = monthKey(t.date)
    const entry = byMonth.get(key) || {}
    entry[t.category] = (entry[t.category] || 0) + t.amount
    byMonth.set(key, entry)
  }
  const keys = Array.from(byMonth.keys()).sort().slice(-monthsBack)
  const data = keys.map(key => ({ month: monthLabel(key), ...byMonth.get(key)! }))
  return { data, categories }
}

export interface WeeklyPoint {
  week: string
  montant: number
}

/** Dépenses par semaine du mois le plus récent contenant des transactions. */
export function getWeeklyExpenses(transactions: Transaction[]): WeeklyPoint[] {
  const expenses = transactions.filter(t => t.type === 'expense')
  if (expenses.length === 0) return []
  const latestMonth = expenses.map(t => monthKey(t.date)).sort().slice(-1)[0]
  const weeks = [0, 0, 0, 0]
  for (const t of expenses) {
    if (monthKey(t.date) !== latestMonth) continue
    const day = Number(t.date.slice(8, 10))
    const idx = Math.min(3, Math.floor((day - 1) / 7))
    weeks[idx] += t.amount
  }
  return weeks.map((montant, i) => ({ week: `Sem ${i + 1}`, montant }))
}

export function categoryDisplayName(category: string) {
  return CATEGORY_LABELS[category] || category
}
