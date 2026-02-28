import { useState } from 'react'
import AuthModal from './AuthModal'

export default function AuthLanding() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="auth-landing">
      <div className="auth-landing-content">
        <div className="auth-skull">💀</div>
        <span className="shiny-text">MOURBOT</span>
        <p className="auth-tagline">
          your chronically online AI bestie. memes, vibes, and actual intelligence. no cap fr fr.
        </p>
        <button className="auth-enter-btn" onClick={() => setShowModal(true)}>
          Enter MOURBOT 🔥
        </button>
      </div>

      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}
