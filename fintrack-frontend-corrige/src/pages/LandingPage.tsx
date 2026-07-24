import { Link } from 'react-router-dom'
import {
  TrendingUp, Shield, BarChart3, Zap, ArrowRight,
  CheckCircle, Star, Menu, X, ChevronRight, PieChart, Bell, Wallet
} from 'lucide-react'
import { useState } from 'react'

const NAV_LINKS = ['Fonctionnalités', 'Témoignages', 'Tarifs', 'À propos']

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Tableaux de bord intelligents',
    desc: 'Visualisez vos finances avec des graphiques interactifs. Comprenez où va chaque franc de votre argent.',
    color: 'from-brand-500 to-brand-600',
  },
  {
    icon: Shield,
    title: 'Sécurité bancaire',
    desc: 'Vos données sont chiffrées avec les mêmes standards que les banques. Votre vie privée est notre priorité.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: TrendingUp,
    title: 'Prévisions & objectifs',
    desc: 'Définissez vos objectifs d\'épargne et suivez vos progrès avec des insights personnalisés.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Bell,
    title: 'Alertes personnalisées',
    desc: 'Recevez des notifications quand vous approchez de vos limites de budget ou dépassez vos objectifs.',
    color: 'from-amber-500 to-amber-600',
  },
  {
    icon: PieChart,
    title: 'Catégorisation auto',
    desc: 'Vos dépenses sont automatiquement classées. Gagnez du temps et restez organisé sans effort.',
    color: 'from-rose-500 to-rose-600',
  },
  {
    icon: Wallet,
    title: 'Multi-comptes',
    desc: 'Gérez tous vos comptes en un seul endroit. Epargne, courant, investissements — tout centralisé.',
    color: 'from-cyan-500 to-cyan-600',
  },
]

const TESTIMONIALS = [
  {
    name: 'Fatou Sow',
    role: 'Entrepreneur, Dakar',
    text: 'FinTrack a complètement changé ma façon de gérer les finances de mon entreprise. J\'ai économisé 30% en un mois !',
    stars: 5,
    avatar: 'FS',
  },
  {
    name: 'Moussa Traoré',
    role: 'Ingénieur, Abidjan',
    text: 'Interface claire et intuitive. Je vois enfin où passe mon argent chaque mois. Indispensable !',
    stars: 5,
    avatar: 'MT',
  },
  {
    name: 'Aminata Koné',
    role: 'Enseignante, Bamako',
    text: 'J\'ai pu atteindre mon objectif d\'épargne en 6 mois grâce aux alertes et aux conseils de l\'app.',
    stars: 5,
    avatar: 'AK',
  },
]

const STATS = [
  { value: '50k+', label: 'Utilisateurs actifs' },
  { value: '2.5M', label: 'Transactions suivies' },
  { value: '98%', label: 'Satisfaction client' },
  { value: '4.9★', label: 'Note moyenne' },
]

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-dark-950 overflow-x-hidden">
      {/* Background ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500 rounded-full opacity-5 blur-3xl" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-blue-500 rounded-full opacity-5 blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-purple-500 rounded-full opacity-5 blur-3xl" />
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <TrendingUp size={16} className="text-dark-950" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">
                Fin<span className="text-brand-400">Track</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map(link => (
                <a key={link} href="#" className="text-dark-300 hover:text-white text-sm transition-colors duration-200">
                  {link}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/auth" className="text-dark-300 hover:text-white text-sm transition-colors">
                Se connecter
              </Link>
              <Link to="/auth" className="btn-primary text-sm py-2 px-4">
                Commencer gratuitement
              </Link>
            </div>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-dark-400 hover:text-white"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden glass border-t border-white/5 px-4 py-6 flex flex-col gap-4">
            {NAV_LINKS.map(link => (
              <a key={link} href="#" className="text-dark-300 text-base" onClick={() => setMobileOpen(false)}>
                {link}
              </a>
            ))}
            <Link to="/auth" className="btn-primary w-full mt-2" onClick={() => setMobileOpen(false)}>
              Commencer gratuitement
            </Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div className="animate-in">
              <div className="inline-flex items-center gap-2 glass-green rounded-full px-4 py-2 text-sm text-brand-400 mb-6">
                <Zap size={14} />
                <span>Nouveau : Export PDF & Excel disponible</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6 tracking-tight">
                Maîtrisez
                <br />
                vos{' '}
                <span className="gradient-text glow-text">finances</span>
                <br />
                personnelles
              </h1>

              <p className="text-dark-300 text-lg sm:text-xl leading-relaxed mb-8 max-w-lg">
                FinTrack vous donne une vue claire et complète de vos revenus, dépenses et épargnes.
                Prenez le contrôle de votre argent dès aujourd'hui.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link to="/auth" className="btn-primary text-base">
                  Démarrer gratuitement
                  <ArrowRight size={18} />
                </Link>
                <Link to="/auth" className="btn-ghost text-base">
                  Voir la démo
                </Link>
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-dark-400">
                {['Sans carte bancaire', 'Gratuit pour toujours', 'Données sécurisées'].map(item => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-brand-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Right - Dashboard preview */}
            <div className="relative animate-in stagger-2 hidden lg:block">
              <div className="relative">
                {/* Main card */}
                <div className="card p-6 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-dark-400 text-sm">Solde total</p>
                      <p className="text-white text-3xl font-bold mt-1">670 000 <span className="text-brand-400 text-lg">FCFA</span></p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center">
                      <Wallet size={22} className="text-brand-400" />
                    </div>
                  </div>

                  {/* Mini bars */}
                  <div className="flex gap-2 items-end mb-4 h-16">
                    {[40, 65, 55, 80, 70, 95].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col gap-1 items-center">
                        <div
                          className="w-full rounded-t bg-brand-500/30 transition-all"
                          style={{ height: `${h * 0.6}%` }}
                        />
                        <div
                          className="w-full rounded-t bg-brand-500"
                          style={{ height: `${h * 0.4}%` }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-xs text-dark-500">
                    {['Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep'].map(m => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-3">
                      <p className="text-dark-400 text-xs">Revenus</p>
                      <p className="text-brand-400 font-bold mt-1">895 000 F</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <p className="text-dark-400 text-xs">Dépenses</p>
                      <p className="text-red-400 font-bold mt-1">225 000 F</p>
                    </div>
                  </div>
                </div>

                {/* Floating card 1 */}
                <div className="absolute -top-6 -right-8 glass rounded-xl p-4 shadow-2xl z-20 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-lg">💼</div>
                    <div>
                      <p className="text-white text-xs font-medium">Salaire reçu</p>
                      <p className="text-brand-400 text-sm font-bold">+650 000 F</p>
                    </div>
                  </div>
                </div>

                {/* Floating card 2 */}
                <div className="absolute -bottom-6 -left-8 glass rounded-xl p-4 shadow-2xl z-20" style={{ animationDelay: '2s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-lg">📈</div>
                    <div>
                      <p className="text-white text-xs font-medium">Objectif épargne</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-20 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                          <div className="w-3/4 h-full bg-purple-500 rounded-full" />
                        </div>
                        <span className="text-purple-400 text-xs">75%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-4 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-dark-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-400 text-sm font-semibold tracking-widest uppercase mb-4">Fonctionnalités</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              Des outils puissants pour analyser, planifier et optimiser vos finances personnelles.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, i) => (
              <div key={i} className="card group cursor-pointer animate-in" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <feat.icon size={22} className="text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feat.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{feat.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-brand-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  En savoir plus <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-dark-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-400 text-sm font-semibold tracking-widest uppercase mb-4">Témoignages</p>
            <h2 className="text-4xl font-bold text-white mb-4">Ils nous font confiance</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-dark-200 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-dark-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Prêt à prendre le<br />
                <span className="gradient-text">contrôle de votre argent ?</span>
              </h2>
              <p className="text-dark-400 text-lg mb-8">
                Rejoignez 50 000+ utilisateurs qui gèrent leurs finances avec FinTrack.
              </p>
              <Link to="/auth" className="btn-primary text-lg py-4 px-8 inline-flex">
                Créer mon compte gratuitement
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <TrendingUp size={14} className="text-dark-950" />
            </div>
            <span className="text-white font-bold">Fin<span className="text-brand-400">Track</span></span>
          </div>
          <p className="text-dark-500 text-sm">© 2024 FinTrack. Tous droits réservés.</p>
          <div className="flex gap-6 text-dark-500 text-sm">
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">CGU</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
