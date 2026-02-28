import { useAuth } from './hooks/useAuth'
import AuthLanding from './components/auth/AuthLanding'
import ChatContainer from './components/chat/ChatContainer'

export default function App() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="auth-landing">
        <div className="auth-landing-content">
          <div className="auth-skull">💀</div>
          <span className="shiny-text">MOURBOT</span>
          <p className="auth-tagline">loading the brainrot...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthLanding />
  }

  return <ChatContainer user={user} onSignOut={signOut} />
}
