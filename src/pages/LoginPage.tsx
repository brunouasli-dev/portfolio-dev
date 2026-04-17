import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import { isSupabaseConfigured } from '../lib/client'

function translateLoginError(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes('invalid login credentials')) {
    return 'Email ou senha inválidos.'
  }

  if (normalized.includes('email not confirmed')) {
    return 'Seu email ainda não foi confirmado.'
  }

  if (normalized.includes('too many requests')) {
    return 'Muitas tentativas de login. Tente novamente em instantes.'
  }

  return message
}

export function LoginPage() {
  const { login, ready, session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(!isSupabaseConfigured ? 'pinguim-eletrico@gmail.com' : '')
  const [password, setPassword] = useState(!isSupabaseConfigured ? 'pinguim-trovoada' : '')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const redirectTo =
    typeof location.state === 'object' &&
    location.state &&
    'from' in location.state &&
    typeof location.state.from === 'string'
      ? location.state.from
      : '/admin'

  if (ready && session) {
    return <Navigate to="/admin" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')

    try {
      await login(email, password)
      navigate(redirectTo, { replace: true })
    } catch (submissionError) {
      if (submissionError instanceof Error) {
        setError(translateLoginError(submissionError.message))
      } else {
        setError('Não foi possível entrar.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-panel panel">
        <div className="auth-header">
          <h1>Login</h1>
          {!isSupabaseConfigured ? (
            <p className="form-message">
              Modo local ativo. O painel usa dados mock e aceita qualquer email e senha.
            </p>
          ) : null}
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@dominio.com"
              required
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={
                  isSupabaseConfigured ? 'Sua senha do Supabase Auth' : 'Qualquer senha para o modo local'
                }
                required
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error ? <div className="form-message error">{error}</div> : null}

          <button className="button-primary auth-submit" type="submit" disabled={busy}>
            <LogIn size={18} />
            {busy ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </section>
  )
}
