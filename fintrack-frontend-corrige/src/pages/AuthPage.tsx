import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

type AuthMode = 'login' | 'register' | 'reset'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [showPass, setShowPass] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')

  const { login, register, resetPassword, loading, error: authError } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'login') {
      if (!form.email || !form.password) return setError('Veuillez remplir tous les champs.')
      const ok = await login(form.email, form.password)
      if (ok) navigate('/dashboard')
      else setError(authError || 'Connexion impossible.')
    } else if (mode === 'register') {
      if (!form.name || !form.email || !form.password) return setError('Veuillez remplir tous les champs.')
      if (form.password !== form.confirm) return setError('Les mots de passe ne correspondent pas.')
      if (form.password.length < 6) return setError('Le mot de passe doit faire au moins 6 caractères.')
      const ok = await register(form.name, form.email, form.password)
      if (ok) navigate('/dashboard')
      else setError(authError || 'Inscription impossible.')
    } else {
      if (!form.email) return setError('Veuillez entrer votre adresse email.')
      await resetPassword(form.email)
      setResetSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-dark-900">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-500 rounded-full opacity-10 blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-blue-500 rounded-full opacity-10 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp size={18} className="text-dark-950" />
            </div>
            <span className="text-white font-bold text-xl">Fin<span className="text-brand-400">Track</span></span>
          </Link>

          {/* Center quote */}
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Votre argent,<br />
              <span className="gradient-text">vos règles.</span>
            </h2>
            <p className="text-dark-400 text-lg leading-relaxed max-w-sm">
              Rejoignez des milliers d'utilisateurs qui ont repris le contrôle de leurs finances personnelles avec FinTrack.
            </p>

            {/* Mini stats */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { v: '50k+', l: 'Utilisateurs' },
                { v: '98%', l: 'Satisfaction' },
                { v: '0 FCFA', l: 'Pour commencer' },
              ].map((s, i) => (
                <div key={i} className="glass rounded-xl p-4 text-center">
                  <div className="text-brand-400 font-bold text-xl">{s.v}</div>
                  <div className="text-dark-500 text-xs mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="glass rounded-2xl p-6">
            <p className="text-dark-200 text-sm leading-relaxed mb-4">
              "Grâce à FinTrack, j'ai réussi à économiser 200 000 FCFA en 3 mois. L'interface est simple et les graphiques me motivent chaque jour."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-500/30 flex items-center justify-center text-brand-400 text-sm font-bold">FB</div>
              <div>
                <p className="text-white text-sm font-medium">Fatima Baldé</p>
                <p className="text-dark-500 text-xs">Comptable, Conakry</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <TrendingUp size={16} className="text-dark-950" />
            </div>
            <span className="text-white font-bold text-lg">Fin<span className="text-brand-400">Track</span></span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto">
          {/* Back button for reset */}
          {mode === 'reset' && (
            <button
              onClick={() => { setMode('login'); setResetSent(false) }}
              className="flex items-center gap-2 text-dark-400 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft size={16} />
              Retour à la connexion
            </button>
          )}

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {mode === 'login' && 'Bon retour 👋'}
              {mode === 'register' && 'Créer un compte'}
              {mode === 'reset' && 'Mot de passe oublié'}
            </h1>
            <p className="text-dark-400">
              {mode === 'login' && 'Connectez-vous à votre espace FinTrack'}
              {mode === 'register' && 'Commencez à suivre vos finances gratuitement'}
              {mode === 'reset' && 'Entrez votre email pour réinitialiser votre mot de passe'}
            </p>
          </div>

          {/* Mode tabs for login/register */}
          {mode !== 'reset' && (
            <div className="flex bg-dark-800 rounded-xl p-1 mb-8">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === 'login'
                    ? 'bg-dark-700 text-white shadow'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === 'register'
                    ? 'bg-dark-700 text-white shadow'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                Inscription
              </button>
            </div>
          )}

          {/* Reset success */}
          {resetSent ? (
            <div className="glass-green rounded-2xl p-6 text-center animate-in">
              <CheckCircle size={48} className="text-brand-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">Email envoyé !</h3>
              <p className="text-dark-400 text-sm">
                Un lien de réinitialisation a été envoyé à <span className="text-brand-400">{form.email}</span>
              </p>
              <button
                onClick={() => { setMode('login'); setResetSent(false) }}
                className="mt-6 btn-primary w-full"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name field (register only) */}
              {mode === 'register' && (
                <div className="animate-in">
                  <label className="block text-dark-300 text-sm mb-2">Nom complet</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Amadou Diallo"
                    className="input-field"
                    autoComplete="name"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-dark-300 text-sm mb-2">Adresse email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="vous@exemple.com"
                  className="input-field"
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              {mode !== 'reset' && (
                <div>
                  <label className="block text-dark-300 text-sm mb-2">Mot de passe</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="input-field pr-12"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm password (register) */}
              {mode === 'register' && (
                <div className="animate-in">
                  <label className="block text-dark-300 text-sm mb-2">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    name="confirm"
                    value={form.confirm}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input-field"
                    autoComplete="new-password"
                  />
                </div>
              )}

              {/* Forgot password link */}
              {mode === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-brand-400 hover:text-brand-300 text-sm transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm animate-in">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-base py-3.5 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Chargement...</>
                ) : mode === 'login' ? (
                  'Se connecter'
                ) : mode === 'register' ? (
                  'Créer mon compte'
                ) : (
                  'Envoyer le lien'
                )}
              </button>

              {/* Terms for register */}
              {mode === 'register' && (
                <p className="text-dark-500 text-xs text-center mt-4">
                  En vous inscrivant, vous acceptez nos{' '}
                  <a href="#" className="text-brand-400 hover:underline">Conditions d'utilisation</a>
                  {' '}et notre{' '}
                  <a href="#" className="text-brand-400 hover:underline">Politique de confidentialité</a>.
                </p>
              )}
            </form>
          )}

          {/* Back to home */}
          <div className="mt-8 text-center">
            <Link to="/" className="text-dark-500 hover:text-dark-300 text-sm transition-colors flex items-center justify-center gap-1.5">
              <ArrowLeft size={14} />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
