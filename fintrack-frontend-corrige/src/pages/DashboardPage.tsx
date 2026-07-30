import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  TrendingUp, LayoutDashboard, ArrowUpCircle, ArrowDownCircle,
  Settings, LogOut, Bell, Search, Menu, X, Plus, ChevronUp, ChevronDown,
  Wallet, Target, PieChart, List, User, Filter, Trash2, CheckCircle,
  AlertCircle, TrendingDown, Calendar, RefreshCw, Edit3, Check, Loader2,
  Lock, Camera, Database
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  BarChart, Bar, LineChart, Line, Legend
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { transactionsApi, usersApi, goalsApi, type CreateTransactionInput, type ApiGoal } from '../lib/endpoints'
import { ApiError } from '../lib/api'
import {
  formatDate, getTotalIncome, getTotalExpense, getBalance,
  CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS, categoriesForType,
} from '../utils/data'
import {
  getCategoryStats, getMonthlyTrend, getIncomeByCategoryMonthly, getWeeklyExpenses,
  categoryDisplayName,
} from '../utils/analytics'
import type { Transaction } from '../types'

/* ─── Constantes ─────────────────────────────────────────────── */
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Vue d'ensemble", id: 'overview'  },
  { icon: ArrowUpCircle,   label: 'Revenus',        id: 'income'    },
  { icon: ArrowDownCircle, label: 'Dépenses',       id: 'expenses'  },
  { icon: PieChart,        label: 'Analytiques',    id: 'analytics' },
  { icon: Target,          label: 'Objectifs',      id: 'goals'     },
  { icon: Settings,        label: 'Paramètres',     id: 'settings'  },
]

/* ─── Utilitaires ────────────────────────────────────────────── */
const fmt = (n: number) => new Intl.NumberFormat('fr-SN').format(n)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 text-xs border border-white/10 shadow-xl">
      <p className="text-dark-300 mb-2 font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {fmt(p.value)} F</p>
      ))}
    </div>
  )
}

/* ─── Composants shared ──────────────────────────────────────── */
function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, color }: {
  title:string; value:string; subtitle?:string; icon:React.ElementType
  trend?:'up'|'down'; trendValue?:string; color:string
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white"/>
        </div>
        {trend && trendValue && (
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend==='up' ? 'text-brand-400 bg-brand-500/10' : 'text-red-400 bg-red-500/10'
          }`}>
            {trend==='up' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}{trendValue}
          </span>
        )}
      </div>
      <p className="text-dark-400 text-sm mb-1">{title}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-dark-500 text-xs mt-1">{subtitle}</p>}
    </div>
  )
}

function TxRow({ tx, onDelete }: { tx:Transaction; onDelete?:(id:string)=>void }) {
  const inc = tx.type === 'income'
  return (
    <div className="flex items-center gap-3 py-3 border-b border-dark-800 last:border-0 hover:bg-dark-800/40 px-2 -mx-2 rounded-xl transition-colors group">
      <div className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center text-lg shrink-0">
        {CATEGORY_ICONS[tx.category]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{tx.description}</p>
        <p className="text-dark-500 text-xs mt-0.5">{CATEGORY_LABELS[tx.category]} · {formatDate(tx.date)}</p>
      </div>
      <span className={`text-sm font-semibold shrink-0 ${inc ? 'text-brand-400' : 'text-red-400'}`}>
        {inc ? '+' : '-'}{fmt(tx.amount)} F
      </span>
      {onDelete && (
        <button onClick={()=>onDelete(tx.id)} className="opacity-0 group-hover:opacity-100 text-dark-600 hover:text-red-400 transition-all ml-1">
          <Trash2 size={14}/>
        </button>
      )}
    </div>
  )
}

/* ─── Modale : nouvelle transaction ──────────────────────────── */
function AddTransactionModal({ onClose, onCreated }: { onClose:()=>void; onCreated:(tx:Transaction)=>void }) {
  const [type, setType] = useState<'income'|'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(categoriesForType('expense')[0] || 'other')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const changeType = (t: 'income'|'expense') => {
    setType(t)
    setCategory(categoriesForType(t)[0] || 'other')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const amountNum = Number(amount)
    if (!amountNum || amountNum <= 0) return setError('Montant invalide.')
    if (!description.trim()) return setError('La description est requise.')
    if (!date) return setError('La date est requise.')

    const payload: CreateTransactionInput = { type, amount: amountNum, category, description: description.trim(), date }
    setSaving(true)
    try {
      const created = await transactionsApi.create(payload)
      onCreated(created)
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de créer la transaction.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}/>
      <form onSubmit={handleSubmit} className="relative card w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">Nouvelle transaction</h3>
          <button type="button" onClick={onClose} className="text-dark-400 hover:text-white"><X size={20}/></button>
        </div>

        <div className="flex bg-dark-800 rounded-xl p-1">
          <button type="button" onClick={()=>changeType('expense')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type==='expense'?'bg-dark-700 text-white':'text-dark-400 hover:text-white'}`}>
            Dépense
          </button>
          <button type="button" onClick={()=>changeType('income')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type==='income'?'bg-dark-700 text-white':'text-dark-400 hover:text-white'}`}>
            Revenu
          </button>
        </div>

        <div>
          <label className="text-dark-400 text-sm block mb-1.5">Montant (F)</label>
          <input className="input-field" type="number" min="1" step="1" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="25000"/>
        </div>

        <div>
          <label className="text-dark-400 text-sm block mb-1.5">Catégorie</label>
          <select className="input-field" value={category} onChange={e=>setCategory(e.target.value)}>
            {categoriesForType(type).map(cat => (
              <option key={cat} value={cat}>{CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-dark-400 text-sm block mb-1.5">Description</label>
          <input className="input-field" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Ex : Marché Sandaga"/>
        </div>

        <div>
          <label className="text-dark-400 text-sm block mb-1.5">Date</label>
          <input className="input-field" type="date" value={date} onChange={e=>setDate(e.target.value)}/>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-70">
          {saving ? <><Loader2 size={16} className="animate-spin"/> Enregistrement...</> : <><Check size={16}/> Ajouter</>}
        </button>
      </form>
    </div>
  )
}

/* ─── VUE : Overview ─────────────────────────────────────────── */
// Vue principale du dashboard : affiche le solde, revenus/dépenses,
// le graphique d'évolution mensuelle et la répartition par catégorie.
// Les données (categoryStats, monthlyData) sont calculées dynamiquement
// à partir des transactions réelles récupérées via l'API.
function OverviewView({ user, transactions, categoryStats, monthlyData }: {
function OverviewView({ user, transactions }: { user:any; transactions:Transaction[] }) {
  const inc   = getTotalIncome(transactions)
  const exp   = getTotalExpense(transactions)
  const bal   = getBalance(transactions)
  const rate  = inc > 0 ? Math.round(((inc - exp) / inc) * 100) : 0

  const monthlyTrend  = getMonthlyTrend(transactions)
  const catStats      = getCategoryStats(transactions, 'expense')
  const budget        = user?.monthlyBudget || 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Solde total"    value={`${fmt(bal)} F`} subtitle="Toutes transactions confondues" icon={Wallet} color="bg-brand-500"/>
        <StatCard title="Revenus"        value={`${fmt(inc)} F`} subtitle="Total cumulé"                    icon={ArrowUpCircle} color="bg-blue-500"/>
        <StatCard title="Dépenses"       value={`${fmt(exp)} F`} subtitle="Total cumulé"                    icon={ArrowDownCircle} color="bg-red-500"/>
        <StatCard title="Taux d'épargne" value={`${rate}%`}      subtitle={rate >= 20 ? 'Bon rythme !' : 'À surveiller'} icon={Target} color="bg-purple-500"/>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white font-semibold">Évolution des finances</h2>
              <p className="text-dark-500 text-xs mt-1">Par mois</p>
            </div>
            <div className="flex gap-4 text-xs text-dark-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block"/>Revenus</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"/>Dépenses</span>
            </div>
          </div>
          {monthlyTrend.length === 0 ? (
            <p className="text-dark-500 text-sm text-center py-12">Pas encore assez de données pour un graphique.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyTrend} margin={{ top:5,right:5,bottom:0,left:0 }}>
                <defs>
                  <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                <XAxis dataKey="month" tick={{fill:'#64748b',fontSize:12}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="income"  name="Revenus"  stroke="#22c55e" strokeWidth={2} fill="url(#gInc)"/>
                <Area type="monotone" dataKey="expense" name="Dépenses" stroke="#ef4444" strokeWidth={2} fill="url(#gExp)"/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="text-white font-semibold mb-1">Répartition dépenses</h2>
          <p className="text-dark-500 text-xs mb-3">Par catégorie</p>
          {catStats.length === 0 ? (
            <p className="text-dark-500 text-sm text-center py-8">Aucune dépense pour l'instant.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <RePieChart>
                  <Pie data={catStats} dataKey="amount" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                    {catStats.map((s,i)=><Cell key={i} fill={s.color} strokeWidth={0}/>)}
                  </Pie>
                  <Tooltip formatter={(v:number)=>[`${fmt(v)} F`,'']}
                    contentStyle={{background:'#0f172a',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'12px',fontSize:'12px'}}/>
                </RePieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-1">
                {catStats.slice(0,5).map((s,i)=>(
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:s.color}}/>
                      <span className="text-dark-300">{categoryDisplayName(s.category)}</span>
                    </div>
                    <span className="text-dark-400">{s.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Transactions récentes</h2>
            <span className="text-dark-500 text-xs">{transactions.length} au total</span>
          </div>
          <div className="overflow-y-auto max-h-64">
            {transactions.length === 0
              ? <p className="text-dark-500 text-sm text-center py-8">Aucune transaction pour l'instant.</p>
              : [...transactions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6).map(tx=><TxRow key={tx.id} tx={tx}/>)
            }
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold">Budget mensuel</h2>
            {budget > 0 && (
              <span className="text-brand-400 text-sm font-semibold">
                {Math.round((exp/budget)*100)}% utilisé
              </span>
            )}
          </div>
          {budget <= 0 ? (
            <p className="text-dark-500 text-sm text-center py-8">
              Définissez un budget mensuel dans <span className="text-dark-300">Paramètres</span> pour suivre votre progression.
            </p>
          ) : catStats.length === 0 ? (
            <p className="text-dark-500 text-sm text-center py-8">Aucune dépense pour l'instant.</p>
          ) : (
            <div className="space-y-4">
              {catStats.slice(0,4).map((s,i)=>{
                const pct=Math.min(100,Math.round((s.amount/budget)*100))
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-300">{categoryDisplayName(s.category)}</span>
                      <span className="text-dark-400 text-xs">{pct}%</span>
                    </div>
                    <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{width:`${pct}%`,background:s.color,boxShadow:`0 0 8px ${s.color}60`}}/>
                    </div>
                    <div className="flex justify-between text-xs text-dark-500">
                      <span>{fmt(s.amount)} F</span><span>{i===0 ? `sur ${fmt(budget)} F de budget` : ''}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── VUE : Revenus ──────────────────────────────────────────── */
function IncomeView({ transactions }: { transactions:Transaction[] }) {
  const incomes = transactions.filter(t=>t.type==='income')
  const total   = getTotalIncome(transactions)
  const best    = incomes.length ? Math.max(...incomes.map(t=>t.amount)) : 0
  const bestTx  = incomes.find(t=>t.amount===best)

  const catStats = getCategoryStats(transactions, 'income')
  const { data: incomeByMonth, categories: incomeCategories } = getIncomeByCategoryMonthly(transactions)

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard title="Total revenus"    value={`${fmt(total)} F`}           subtitle="Cumulé"          icon={ArrowUpCircle} color="bg-brand-500"/>
        <StatCard title="Meilleure entrée" value={`${fmt(best)} F`}            subtitle={bestTx ? categoryDisplayName(bestTx.category) : '—'} icon={TrendingUp} color="bg-blue-500"/>
        <StatCard title="Nb transactions"  value={`${incomes.length}`}         subtitle="Entrées enregistrées" icon={List} color="bg-purple-500"/>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-semibold">Revenus par source</h2>
            <p className="text-dark-500 text-xs mt-1">Par mois</p>
          </div>
        </div>
        {incomeByMonth.length === 0 ? (
          <p className="text-dark-500 text-sm text-center py-12">Aucun revenu pour l'instant.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={incomeByMonth} margin={{top:5,right:5,bottom:0,left:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
              <XAxis dataKey="month" tick={{fill:'#64748b',fontSize:12}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend wrapperStyle={{fontSize:'12px',paddingTop:'12px'}}/>
              {incomeCategories.map((cat,i)=>(
                <Bar key={cat} dataKey={cat} name={categoryDisplayName(cat)} stackId="a"
                  fill={CATEGORY_COLORS[cat] || '#22c55e'} radius={i===incomeCategories.length-1 ? [6,6,0,0] : [0,0,0,0]}/>
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-white font-semibold mb-4">Répartition par source</h2>
          {catStats.length === 0 ? (
            <p className="text-dark-500 text-sm text-center py-8">Aucun revenu pour l'instant.</p>
          ) : (
            <div className="space-y-4">
              {catStats.map((s,i)=>(
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-dark-200">
                      <span>{CATEGORY_ICONS[s.category]}</span>{categoryDisplayName(s.category)}
                    </span>
                    <span className="text-brand-400 text-sm font-semibold">{fmt(s.amount)} F</span>
                  </div>
                  <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{width:`${s.percentage}%`}}/>
                  </div>
                  <span className="text-dark-500 text-xs">{s.percentage}% du total</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-white font-semibold mb-4">Toutes les entrées</h2>
          <div className="overflow-y-auto max-h-72">
            {incomes.length === 0
              ? <p className="text-dark-500 text-sm text-center py-8">Aucun revenu pour l'instant.</p>
              : [...incomes].sort((a,b)=>b.date.localeCompare(a.date)).map(tx=><TxRow key={tx.id} tx={tx}/>)
            }
          </div>
          <div className="mt-4 pt-4 border-t border-dark-800 flex justify-between text-sm">
            <span className="text-dark-400">Total</span>
            <span className="text-brand-400 font-semibold">+{fmt(total)} F</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── VUE : Dépenses ─────────────────────────────────────────── */
function ExpensesView({ transactions, onDelete }: { transactions:Transaction[]; onDelete:(id:string)=>void }) {
  const [filterCat, setFilterCat] = useState('all')

  const expenses = transactions.filter(t=>t.type==='expense')
  const filtered = filterCat==='all' ? expenses : expenses.filter(t=>t.category===filterCat)
  const total    = expenses.reduce((s,t)=>s+t.amount,0)
  const avgDay   = Math.round(total/30)
  const cats     = [...new Set(expenses.map(t=>t.category))]
  const catStats = getCategoryStats(transactions, 'expense')
  const weekly   = getWeeklyExpenses(transactions)

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard title="Total dépenses" value={`${fmt(total)} F`}  subtitle="Cumulé"      icon={ArrowDownCircle} color="bg-red-500"/>
        <StatCard title="Moy. par jour"  value={`${fmt(avgDay)} F`} subtitle="Estimation sur 30 jours" icon={Calendar} color="bg-amber-500"/>
        <StatCard title="Catégorie #1"   value={catStats[0] ? categoryDisplayName(catStats[0].category) : '—'} subtitle={`${fmt(catStats[0]?.amount||0)} F`} icon={TrendingDown} color="bg-orange-500"/>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-white font-semibold mb-1">Évolution hebdomadaire</h2>
          <p className="text-dark-500 text-xs mb-4">Mois le plus récent</p>
          {weekly.length === 0 ? (
            <p className="text-dark-500 text-sm text-center py-12">Aucune dépense pour l'instant.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekly} margin={{top:5,right:5,bottom:0,left:-10}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
                <XAxis dataKey="week" tick={{fill:'#64748b',fontSize:12}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="montant" name="Dépenses" fill="#ef4444" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="text-white font-semibold mb-4">Par catégorie</h2>
          {catStats.length === 0 ? (
            <p className="text-dark-500 text-sm text-center py-8">Aucune dépense pour l'instant.</p>
          ) : (
            <div className="space-y-3">
              {catStats.map((s,i)=>(
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg w-6">{CATEGORY_ICONS[s.category]}</span>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-dark-300">{categoryDisplayName(s.category)}</span>
                      <span className="text-dark-400">{fmt(s.amount)} F</span>
                    </div>
                    <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{width:`${s.percentage}%`,background:s.color}}/>
                    </div>
                  </div>
                  <span className="text-xs text-dark-500 w-8 text-right">{s.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-white font-semibold">Liste des dépenses</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-dark-500"/>
            <button onClick={()=>setFilterCat('all')}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${filterCat==='all'?'bg-brand-500/20 text-brand-400 border border-brand-500/30':'text-dark-400 hover:text-white'}`}>
              Tout
            </button>
            {cats.map(cat=>(
              <button key={cat} onClick={()=>setFilterCat(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${filterCat===cat?'bg-brand-500/20 text-brand-400 border border-brand-500/30':'text-dark-400 hover:text-white'}`}>
                {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto max-h-72">
          {filtered.length===0
            ? <p className="text-dark-500 text-sm text-center py-8">Aucune dépense dans cette catégorie</p>
            : [...filtered].sort((a,b)=>b.date.localeCompare(a.date)).map(tx=><TxRow key={tx.id} tx={tx} onDelete={onDelete}/>)
          }
        </div>
        <div className="mt-4 pt-4 border-t border-dark-800 flex justify-between text-sm">
          <span className="text-dark-400">Total affiché ({filtered.length} transactions)</span>
          <span className="text-red-400 font-semibold">-{fmt(filtered.reduce((s,t)=>s+t.amount,0))} F</span>
        </div>
      </div>
    </div>
  )
}

/* ─── VUE : Analytiques ──────────────────────────────────────── */
function AnalyticsView({ transactions }: { transactions:Transaction[] }) {
  const inc  = getTotalIncome(transactions)
  const exp  = getTotalExpense(transactions)
  const bal  = getBalance(transactions)
  const rate = inc > 0 ? Math.round(((inc-exp)/inc)*100) : 0
  const ratio = exp > 0 ? (inc/exp).toFixed(1) : (inc > 0 ? '∞' : '0.0')

  const monthlyTrend = getMonthlyTrend(transactions)
  const netData = monthlyTrend.map(d=>({ month:d.month, net:d.income-d.expense, income:d.income, expense:d.expense }))
  const catStats = getCategoryStats(transactions, 'expense')
  const topCategory = catStats[0]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-dark-400 text-xs mb-2">Taux d'épargne</p>
          <p className="text-4xl font-bold text-brand-400">{rate}%</p>
          <p className="text-dark-500 text-xs mt-1">{rate >= 20 ? 'Excellent !' : 'Peut mieux faire'}</p>
        </div>
        <div className="card text-center">
          <p className="text-dark-400 text-xs mb-2">Ratio R/D</p>
          <p className="text-4xl font-bold text-blue-400">{ratio}x</p>
          <p className="text-dark-500 text-xs mt-1">Revenus vs Dépenses</p>
        </div>
        <div className="card text-center">
          <p className="text-dark-400 text-xs mb-2">Solde net</p>
          <p className="text-2xl font-bold text-white">{fmt(bal)} F</p>
          <p className="text-dark-500 text-xs mt-1">Toutes transactions</p>
        </div>
        <div className="card text-center">
          <p className="text-dark-400 text-xs mb-2">Transactions</p>
          <p className="text-4xl font-bold text-purple-400">{transactions.length}</p>
          <p className="text-dark-500 text-xs mt-1">Au total</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-semibold">Solde net mensuel</h2>
            <p className="text-dark-500 text-xs mt-1">Différence revenus - dépenses</p>
          </div>
        </div>
        {netData.length === 0 ? (
          <p className="text-dark-500 text-sm text-center py-12">Pas encore assez de données.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={netData} margin={{top:5,right:5,bottom:0,left:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="month" tick={{fill:'#64748b',fontSize:12}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Line type="monotone" dataKey="net"    name="Solde net" stroke="#22c55e" strokeWidth={2.5} dot={{fill:'#22c55e',r:4}}/>
              <Line type="monotone" dataKey="income" name="Revenus"   stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="4 4" dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-white font-semibold mb-5">Revenus vs Dépenses</h2>
          {monthlyTrend.length === 0 ? (
            <p className="text-dark-500 text-sm text-center py-12">Pas encore assez de données.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyTrend} margin={{top:5,right:5,bottom:0,left:-15}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
                <XAxis dataKey="month" tick={{fill:'#64748b',fontSize:12}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend wrapperStyle={{fontSize:'12px'}}/>
                <Bar dataKey="income"  name="Revenus"  fill="#22c55e" radius={[4,4,0,0]}/>
                <Bar dataKey="expense" name="Dépenses" fill="#ef4444" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="text-white font-semibold mb-2">Dépenses par catégorie</h2>
          <p className="text-dark-500 text-xs mb-3">Détail complet</p>
          {catStats.length === 0 ? (
            <p className="text-dark-500 text-sm text-center py-8">Aucune dépense pour l'instant.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={175}>
                <RePieChart>
                  <Pie data={catStats} dataKey="amount" cx="50%" cy="50%" outerRadius={75} paddingAngle={3}
                    label={({percent}: any)=>`${Math.round(percent*100)}%`} labelLine={false}>
                    {catStats.map((s,i)=><Cell key={i} fill={s.color} strokeWidth={0}/>)}
                  </Pie>
                  <Tooltip formatter={(v:number)=>[`${fmt(v)} F`,'']}
                    contentStyle={{background:'#0f172a',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'12px',fontSize:'12px'}}/>
                </RePieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                {catStats.map((s,i)=>(
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:s.color}}/>
                    <span className="text-dark-300 truncate">{categoryDisplayName(s.category)}</span>
                    <span className="text-dark-500 ml-auto">{s.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-white font-semibold mb-4">💡 Insights</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="glass-green rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-brand-400"/>
              <span className="text-brand-400 text-sm font-medium">Point fort</span>
            </div>
            <p className="text-dark-200 text-xs leading-relaxed">
              {rate >= 20
                ? <>Votre taux d'épargne de <strong className="text-white">{rate}%</strong> est excellent. Continuez ainsi !</>
                : <>Votre solde net est de <strong className="text-white">{fmt(bal)} F</strong>. Chaque transaction enregistrée affine cette analyse.</>}
            </p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-amber-400"/>
              <span className="text-amber-400 text-sm font-medium">À surveiller</span>
            </div>
            <p className="text-dark-200 text-xs leading-relaxed">
              {topCategory
                ? <>{categoryDisplayName(topCategory.category)} représente <strong className="text-white">{topCategory.percentage}%</strong> de vos dépenses.</>
                : "Ajoutez des dépenses pour voir apparaître vos catégories principales."}
            </p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-blue-400"/>
              <span className="text-blue-400 text-sm font-medium">Opportunité</span>
            </div>
            <p className="text-dark-200 text-xs leading-relaxed">
              Diversifier vos sources de revenus reste l'un des leviers les plus fiables pour accélérer votre épargne.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── VUE : Objectifs ────────────────────────────────────────── */
function GoalsView() {
  const [goals, setGoals] = useState<ApiGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ name:'', target:'', current:'', icon:'🎯' })

  useEffect(() => {
    let cancelled = false
    goalsApi.list()
      .then(data => { if (!cancelled) setGoals(data) })
      .catch(err => { if (!cancelled) setLoadError(err instanceof ApiError ? err.message : 'Impossible de charger vos objectifs.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const handleAdd = async () => {
    setFormError('')
    if (!form.name || !form.target) return setFormError('Le nom et le montant cible sont requis.')
    setSaving(true)
    try {
      const created = await goalsApi.create({
        name: form.name,
        target: Number(form.target),
        current: Number(form.current) || 0,
        icon: form.icon || '🎯',
        color: '#22c55e',
      })
      setGoals(prev => [...prev, created])
      setForm({ name:'', target:'', current:'', icon:'🎯' })
      setAdding(false)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Impossible de créer l'objectif.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    const previous = goals
    setGoals(prev => prev.filter(g => g.id !== id)) // optimiste
    try {
      await goalsApi.remove(id)
    } catch {
      setGoals(previous) // rollback si la suppression échoue côté serveur
    }
  }

  const totalSaved  = goals.reduce((s,g)=>s+g.current,0)
  const totalTarget = goals.reduce((s,g)=>s+g.target,0)
  const completed   = goals.filter(g=>g.current>=g.target).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-dark-400 gap-2">
        <Loader2 size={20} className="animate-spin"/> Chargement de vos objectifs...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0"/> {loadError}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard title="Total économisé"  value={`${fmt(totalSaved)} F`}  subtitle="Tous objectifs"   icon={Wallet}       color="bg-brand-500"/>
        <StatCard title="Objectif global"  value={`${fmt(totalTarget)} F`} subtitle="À atteindre"      icon={Target}       color="bg-purple-500"/>
        <StatCard title="Complétés"        value={`${completed} / ${goals.length}`} subtitle="Objectifs réussis" icon={CheckCircle} color="bg-blue-500"/>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {goals.map(goal=>{
          const pct  = Math.min(100, Math.round((goal.current/goal.target)*100))
          const done = pct >= 100
          return (
            <div key={goal.id} className={`card relative group ${done?'border border-brand-500/30':''}`}>
              {done && (
                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1 text-xs text-brand-400 bg-brand-500/15 px-2 py-1 rounded-full">
                    <CheckCircle size={11}/> Atteint !
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{goal.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold">{goal.name}</h3>
                  {goal.deadline && (
                    <p className="text-dark-500 text-xs mt-0.5 flex items-center gap-1">
                      <Calendar size={11}/>
                      {new Date(goal.deadline).toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}
                    </p>
                  )}
                </div>
                <button onClick={()=>handleDelete(goal.id)}
                  className="opacity-0 group-hover:opacity-100 text-dark-600 hover:text-red-400 transition-all">
                  <Trash2 size={15}/>
                </button>
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span className="text-dark-400">Économisé</span>
                <span className="text-white font-semibold">{fmt(goal.current)} F</span>
              </div>
              <div className="h-2.5 bg-dark-800 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{width:`${pct}%`,background:done?'#22c55e':goal.color,boxShadow:`0 0 10px ${goal.color}50`}}/>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-dark-500 text-xs">{pct}% complété</span>
                <span className="text-dark-400 text-xs">{fmt(goal.target)} F</span>
              </div>
              {!done && (
                <p className="text-dark-500 text-xs mt-3">
                  Encore <strong className="text-white">{fmt(goal.target-goal.current)} F</strong> à atteindre
                </p>
              )}
            </div>
          )
        })}

        {!adding ? (
          <button onClick={()=>setAdding(true)}
            className="card border-dashed border-dark-600 hover:border-brand-500/50 flex flex-col items-center justify-center gap-3 min-h-[180px] cursor-pointer transition-all">
            <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center">
              <Plus size={22} className="text-dark-500"/>
            </div>
            <p className="text-dark-500 text-sm">Ajouter un objectif</p>
          </button>
        ) : (
          <div className="card space-y-3">
            <h3 className="text-white font-semibold">Nouvel objectif</h3>
            <input className="input-field text-sm py-2.5" placeholder="Nom de l'objectif"
              value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
            <div className="grid grid-cols-2 gap-2">
              <input className="input-field text-sm py-2.5" placeholder="Objectif (F)" type="number"
                value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))}/>
              <input className="input-field text-sm py-2.5" placeholder="Déjà économisé" type="number"
                value={form.current} onChange={e=>setForm(f=>({...f,current:e.target.value}))}/>
            </div>
            <input className="input-field text-sm py-2.5" placeholder="Emoji (ex: 🏠)"
              value={form.icon} onChange={e=>setForm(f=>({...f,icon:e.target.value}))}/>
            {formError && <p className="text-red-400 text-xs">{formError}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={handleAdd} disabled={saving} className="btn-primary flex-1 text-sm py-2 disabled:opacity-70">
                {saving ? <Loader2 size={15} className="animate-spin"/> : <Check size={15}/>} Ajouter
              </button>
              <button onClick={()=>setAdding(false)} className="btn-ghost text-sm py-2 flex-1">
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── VUE : Paramètres ───────────────────────────────────────── */
const MAX_AVATAR_BYTES = 1.5 * 1024 * 1024 // 1.5 Mo côté fichier source

function SettingsView({ user, onLogout, onProfileUpdated, onAccountDeleted, onDeleteAllTransactions }: {
  user:any; onLogout:()=>void; onProfileUpdated:()=>void; onAccountDeleted:()=>void
  onDeleteAllTransactions:(type:'income'|'expense')=>Promise<void>
}) {
  const [form, setForm] = useState({
    name:     user?.name     || '',
    email:    user?.email    || '',
    currency: user?.currency || 'FCFA',
    budget:   String(user?.monthlyBudget || 0),
  })
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar)
  const [avatarError, setAvatarError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError('')
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setAvatarError('Le fichier doit être une image.')
    if (file.size > MAX_AVATAR_BYTES) return setAvatarError('Image trop lourde (max 1,5 Mo).')
    const reader = new FileReader()
    reader.onload = () => setAvatar(reader.result as string)
    reader.onerror = () => setAvatarError('Impossible de lire cette image.')
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setError('')
    setSaving(true)
    try {
      await usersApi.updateMe({
        name: form.name,
        email: form.email,
        currency: form.currency,
        monthlyBudget: Number(form.budget) || 0,
        avatar,
      })
      onProfileUpdated()
      setSaved(true)
      setTimeout(()=>setSaved(false),2500)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de sauvegarder le profil.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card">
        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
          <User size={18} className="text-brand-400"/> Profil utilisateur
        </h2>
        <div className="flex items-center gap-4 mb-5">
          <div className="relative shrink-0">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-brand-500/40"/>
            ) : (
              <div className="w-16 h-16 rounded-full bg-brand-500/20 border-2 border-brand-500/40 flex items-center justify-center text-brand-400 text-2xl font-bold">
                {form.name?.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center text-dark-300 hover:text-white cursor-pointer transition-colors">
              <Camera size={12}/>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
            </label>
          </div>
          <div>
            <p className="text-white font-medium">{form.name}</p>
            <p className="text-dark-500 text-sm">{form.email}</p>
            {avatarError && <p className="text-red-400 text-xs mt-1">{avatarError}</p>}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-dark-400 text-sm block mb-1.5">Nom complet</label>
            <input className="input-field" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          </div>
          <div>
            <label className="text-dark-400 text-sm block mb-1.5">Email</label>
            <input className="input-field" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
          <Wallet size={18} className="text-brand-400"/> Préférences financières
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-dark-400 text-sm block mb-1.5">Devise</label>
            <select className="input-field" value={form.currency} onChange={e=>setForm(f=>({...f,currency:e.target.value}))}>
              <option value="FCFA">FCFA (Franc CFA)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="USD">USD (Dollar)</option>
            </select>
          </div>
          <div>
            <label className="text-dark-400 text-sm block mb-1.5">Budget mensuel (F)</label>
            <input className="input-field" type="number" value={form.budget} onChange={e=>setForm(f=>({...f,budget:e.target.value}))}/>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
      )}

      <div className="flex flex-wrap gap-3">
        <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-70">
          {saving ? <><Loader2 size={16} className="animate-spin"/> Sauvegarde...</>
            : saved ? <><CheckCircle size={16}/> Sauvegardé !</>
            : <><Edit3 size={16}/> Sauvegarder</>}
        </button>
        <button onClick={onLogout} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/5 hover:border-red-500/50 text-sm font-medium transition-all">
          <LogOut size={16}/> Déconnexion
        </button>
      </div>

      <DataManagementCard onDeleteAllTransactions={onDeleteAllTransactions}/>
      <ChangePasswordCard/>
      <DangerZoneCard onAccountDeleted={onAccountDeleted}/>
    </div>
  )
}

/* ─── Carte : Gestion des données (suppression en masse) ────────
   Permet de supprimer d'un coup toutes les dépenses, tous les
   revenus ou tous les objectifs, sans supprimer le compte entier. */
type DataKind = 'expense' | 'income' | 'goals'

function DataManagementCard({ onDeleteAllTransactions }: {
  onDeleteAllTransactions:(type:'income'|'expense')=>Promise<void>
}) {
  const [confirmingKind, setConfirmingKind] = useState<DataKind | null>(null)
  const [deletingKind,   setDeletingKind]   = useState<DataKind | null>(null)
  const [doneKind,       setDoneKind]       = useState<DataKind | null>(null)
  const [error,          setError]          = useState('')

  const ROWS: { kind: DataKind; icon: any; label: string; description: string }[] = [
    { kind: 'expense', icon: ArrowDownCircle, label: 'Toutes les dépenses', description: 'Efface définitivement toutes vos transactions de type dépense.' },
    { kind: 'income',  icon: ArrowUpCircle,   label: 'Tous les revenus',    description: 'Efface définitivement toutes vos transactions de type revenu.' },
    { kind: 'goals',   icon: Target,          label: 'Tous les objectifs', description: 'Efface définitivement tous vos objectifs d\u2019épargne.' },
  ]

  const handleConfirm = async (kind: DataKind) => {
    setError('')
    setDeletingKind(kind)
    try {
      if (kind === 'goals') {
        await goalsApi.removeAll()
      } else {
        await onDeleteAllTransactions(kind)
      }
      setConfirmingKind(null)
      setDoneKind(kind)
      setTimeout(() => setDoneKind(null), 2500)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de supprimer ces données.")
    } finally {
      setDeletingKind(null)
    }
  }

  return (
    <div className="card space-y-4">
      <h2 className="text-white font-semibold flex items-center gap-2">
        <Database size={18} className="text-brand-400"/> Gestion des données
      </h2>
      <p className="text-dark-400 text-sm">
        Supprimez des catégories entières de données sans supprimer votre compte. Ces actions sont irréversibles.
      </p>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="space-y-3">
        {ROWS.map(row => (
          <div key={row.kind} className="rounded-xl border border-dark-700 p-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <row.icon size={18} className="text-dark-400 mt-0.5 shrink-0"/>
                <div>
                  <p className="text-white text-sm font-medium">{row.label}</p>
                  <p className="text-dark-500 text-xs mt-0.5">{row.description}</p>
                </div>
              </div>

              {confirmingKind !== row.kind ? (
                doneKind === row.kind ? (
                  <span className="flex items-center gap-2 text-brand-400 text-sm shrink-0">
                    <CheckCircle size={16}/> Supprimé
                  </span>
                ) : (
                  <button onClick={()=>setConfirmingKind(row.kind)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/5 hover:border-red-500/50 text-xs font-medium transition-all shrink-0">
                    <Trash2 size={14}/> Supprimer
                  </button>
                )
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={()=>handleConfirm(row.kind)} disabled={deletingKind===row.kind}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/90 hover:bg-red-500 text-white text-xs font-medium transition-all disabled:opacity-50">
                    {deletingKind===row.kind ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>}
                    Confirmer
                  </button>
                  <button onClick={()=>setConfirmingKind(null)} disabled={deletingKind===row.kind} className="btn-ghost text-xs py-2">
                    Annuler
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChangePasswordCard() {
  const [form, setForm] = useState({ current:'', next:'', confirm:'' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.current || !form.next) return setError('Tous les champs sont requis.')
    if (form.next.length < 6) return setError('Le nouveau mot de passe doit faire au moins 6 caractères.')
    if (form.next !== form.confirm) return setError('Les mots de passe ne correspondent pas.')
    setSaving(true)
    try {
      await usersApi.changePassword(form.current, form.next)
      setForm({ current:'', next:'', confirm:'' })
      setSaved(true)
      setTimeout(()=>setSaved(false),2500)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de changer le mot de passe.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="text-white font-semibold flex items-center gap-2">
        <Lock size={18} className="text-brand-400"/> Mot de passe
      </h2>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="text-dark-400 text-sm block mb-1.5">Mot de passe actuel</label>
          <input className="input-field" type="password" autoComplete="current-password"
            value={form.current} onChange={e=>setForm(f=>({...f,current:e.target.value}))}/>
        </div>
        <div>
          <label className="text-dark-400 text-sm block mb-1.5">Nouveau mot de passe</label>
          <input className="input-field" type="password" autoComplete="new-password"
            value={form.next} onChange={e=>setForm(f=>({...f,next:e.target.value}))}/>
        </div>
        <div>
          <label className="text-dark-400 text-sm block mb-1.5">Confirmer</label>
          <input className="input-field" type="password" autoComplete="new-password"
            value={form.confirm} onChange={e=>setForm(f=>({...f,confirm:e.target.value}))}/>
        </div>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button type="submit" disabled={saving} className="btn-primary disabled:opacity-70">
        {saving ? <><Loader2 size={16} className="animate-spin"/> Mise à jour...</>
          : saved ? <><CheckCircle size={16}/> Mot de passe changé !</>
          : <><Lock size={16}/> Changer le mot de passe</>}
      </button>
    </form>
  )
}

function DangerZoneCard({ onAccountDeleted }: { onAccountDeleted:()=>void }) {
  const [confirming, setConfirming] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setError('')
    setDeleting(true)
    try {
      await usersApi.deleteMe()
      onAccountDeleted()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de supprimer le compte.')
      setDeleting(false)
    }
  }

  return (
    <div className="card border border-red-500/20 space-y-4">
      <h2 className="text-red-400 font-semibold flex items-center gap-2">
        <AlertCircle size={18}/> Zone dangereuse
      </h2>
      <p className="text-dark-400 text-sm">
        Supprimer votre compte efface définitivement votre profil, vos transactions et vos objectifs. Cette action est irréversible.
      </p>

      {!confirming ? (
        <button onClick={()=>setConfirming(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/5 hover:border-red-500/50 text-sm font-medium transition-all">
          <Trash2 size={16}/> Supprimer mon compte
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-dark-300 text-sm">
            Tapez <strong className="text-white">SUPPRIMER</strong> pour confirmer.
          </p>
          <input className="input-field max-w-xs" value={confirmText} onChange={e=>setConfirmText(e.target.value)} placeholder="SUPPRIMER"/>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleDelete} disabled={confirmText!=='SUPPRIMER' || deleting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/90 hover:bg-red-500 text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {deleting ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16}/>}
              Confirmer la suppression
            </button>
            <button onClick={()=>{ setConfirming(false); setConfirmText(''); setError('') }} className="btn-ghost text-sm">
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── COMPOSANT PRINCIPAL ────────────────────────────────────── */
export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeNav,   setActiveNav]   = useState('overview')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTx, setLoadingTx]     = useState(true)
  const [loadError, setLoadError]     = useState('')
  const [modalOpen, setModalOpen]     = useState(false)
  const { user, logout, refreshUser }  = useAuth()
  const navigate                      = useNavigate()

  useEffect(() => {
    let cancelled = false
    async function loadTransactions() {
      setLoadingTx(true)
      try {
        const data = await transactionsApi.list()
        if (!cancelled) setTransactions(data)
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : 'Impossible de charger vos transactions.')
      } finally {
        if (!cancelled) setLoadingTx(false)
      }
    }
    loadTransactions()
    return () => { cancelled = true }
  }, [])

  const handleLogout = () => { logout(); navigate('/') }

  const handleTransactionCreated = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev])
  }

  const handleDeleteTransaction = async (id: string) => {
    const previous = transactions
    setTransactions(prev => prev.filter(t => t.id !== id)) // optimiste
    try {
      await transactionsApi.remove(id)
    } catch {
      setTransactions(previous) // rollback si la suppression échoue côté serveur
    }
  }

  /** Supprime en une fois toutes les dépenses ou tous les revenus (depuis Paramètres) */
  const handleDeleteAllTransactionsByType = async (type: 'income' | 'expense') => {
    const previous = transactions
    setTransactions(prev => prev.filter(t => t.type !== type)) // optimiste
    try {
      await transactionsApi.removeAllByType(type)
    } catch (err) {
      setTransactions(previous) // rollback si la suppression échoue côté serveur
      throw err
    }
  }

  const inc = getTotalIncome(transactions)
  const exp = getTotalExpense(transactions)

  const PAGE_TITLES: Record<string,string> = {
    overview:  `Bonjour, ${user?.name?.split(' ')[0] || ''} 👋`,
    income:    '💚 Revenus',
    expenses:  '🔴 Dépenses',
    analytics: '📊 Analytiques',
    goals:     '🎯 Objectifs',
    settings:  '⚙️ Paramètres',
  }
  const PAGE_SUBS: Record<string,string> = {
    overview:  'Résumé de vos finances',
    income:    `Total : ${fmt(inc)} F`,
    expenses:  `Total : ${fmt(exp)} F`,
    analytics: 'Analyse détaillée de vos finances',
    goals:     "Suivez vos objectifs d'épargne",
    settings:  'Gérez votre profil et préférences',
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-dark-800">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
            <TrendingUp size={18} className="text-dark-950"/>
          </div>
          <span className="text-white font-bold text-xl">Fin<span className="text-brand-400">Track</span></span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(item=>(
          <button key={item.id}
            onClick={()=>{ setActiveNav(item.id); setSidebarOpen(false) }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeNav===item.id ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20' : 'text-dark-400 hover:text-white hover:bg-dark-800'
            }`}
          >
            <item.icon size={18}/>{item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-dark-800">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-dark-800 transition-colors mb-1">
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-brand-500/30 shrink-0"/>
          ) : (
            <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 text-sm font-bold shrink-0">
              {user?.name?.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-dark-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-dark-400 hover:text-red-400 hover:bg-red-500/5 text-sm transition-all">
          <LogOut size={16}/> Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-dark-900 border-r border-dark-800">
        <SidebarContent/>
      </aside>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={()=>setSidebarOpen(false)}/>
          <aside className="relative w-72 bg-dark-900 border-r border-dark-800 z-10">
            <button onClick={()=>setSidebarOpen(false)} className="absolute top-4 right-4 text-dark-400 hover:text-white">
              <X size={20}/>
            </button>
            <SidebarContent/>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="glass border-b border-dark-800 px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button onClick={()=>setSidebarOpen(true)} className="lg:hidden text-dark-400 hover:text-white">
            <Menu size={22}/>
          </button>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500"/>
              <input type="text" placeholder="Rechercher..." className="input-field pl-9 py-2 text-sm bg-dark-900"/>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="relative w-9 h-9 rounded-xl bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 hover:text-white transition-all">
              <Bell size={18}/>
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full"/>
            </button>
            <button className="w-9 h-9 rounded-xl bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 hover:text-white transition-all">
              <User size={18}/>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* En-tête de page */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{PAGE_TITLES[activeNav]}</h1>
              <p className="text-dark-400 text-sm mt-1">{PAGE_SUBS[activeNav]}</p>
            </div>
            {(activeNav==='overview'||activeNav==='income'||activeNav==='expenses') && (
              <button onClick={()=>setModalOpen(true)} className="btn-primary text-sm py-2.5">
                <Plus size={16}/>
                <span className="hidden sm:inline">Nouvelle transaction</span>
              </button>
            )}
            {activeNav==='analytics' && (
              <button onClick={()=>window.location.reload()} className="btn-ghost text-sm py-2.5">
                <RefreshCw size={15}/> Actualiser
              </button>
            )}
          </div>

          {loadError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0"/> {loadError}
            </div>
          )}

          {loadingTx ? (
            <div className="flex items-center justify-center py-24 text-dark-400 gap-2">
              <Loader2 size={20} className="animate-spin"/> Chargement de vos transactions...
            </div>
          ) : (
            <>
              {activeNav==='overview'  && <OverviewView  user={user} transactions={transactions}/>}
              {activeNav==='income'    && <IncomeView    transactions={transactions}/>}
              {activeNav==='expenses'  && <ExpensesView  transactions={transactions} onDelete={handleDeleteTransaction}/>}
              {activeNav==='analytics' && <AnalyticsView transactions={transactions}/>}
              {activeNav==='goals'     && <GoalsView/>}
              {activeNav==='settings'  && <SettingsView  user={user} onLogout={handleLogout} onProfileUpdated={refreshUser} onAccountDeleted={handleLogout} onDeleteAllTransactions={handleDeleteAllTransactionsByType}/>}
            </>
          )}
        </main>
      </div>

      {modalOpen && (
        <AddTransactionModal onClose={()=>setModalOpen(false)} onCreated={handleTransactionCreated}/>
      )}
    </div>
  )
}
