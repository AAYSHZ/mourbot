import { useState } from 'react'
import { supabase } from '../../lib/supabase'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleGoogleSignIn = async () => {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) setError(error.message)
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isSignUp) {
        // Sign up WITHOUT email confirmation — user gets logged in immediately
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // No email redirect — skip confirmation entirely
            data: { display_name: email.split('@')[0] },
          },
        })
        if (error) throw error

        // If Supabase returned a session, user is auto-logged in (confirmation disabled)
        if (data.session) {
          // Success! Auth state listener in useAuth will pick this up
          onClose()
          return
        }

        // If no session but user exists, try signing in directly
        // This handles the case where confirmation might still be on
        if (data.user && !data.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (signInError) {
            // If sign-in also fails, the email confirmation is probably on
            setError('Account created! If you see this, disable "Confirm email" in Supabase Dashboard → Authentication → Providers → Email.')
          } else {
            onClose()
          }
          return
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          // If user doesn't exist, auto-create account and sign in
          if (error.message.includes('Invalid login credentials')) {
            setError('wrong email or password bestie 💀 try again or sign up')
          } else {
            throw error
          }
          return
        }
        onClose()
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>✕</button>
        
        <h2>💀 {isSignUp ? 'Join the chaos' : 'Welcome back'}</h2>
        <p className="auth-modal-subtitle">
          {isSignUp ? 'create an account to unlock the brainrot' : 'sign in to continue the brainrot'}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <button className="google-btn" onClick={handleGoogleSignIn}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-divider">or</div>

        <form className="auth-form" onSubmit={handleEmailAuth}>
          <input
            className="auth-input"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="auth-input"
            type="password"
            placeholder="password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? '...' : isSignUp ? 'Create Account 🚀' : 'Sign In 💀'}
          </button>
        </form>

        <div className="auth-toggle">
          {isSignUp ? 'already have an account? ' : "don't have an account? "}
          <button onClick={() => { setIsSignUp(!isSignUp); setError(null) }}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  )
}
