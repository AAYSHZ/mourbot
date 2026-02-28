import { useState, useRef, useEffect } from 'react'
import BrainrotSlider from '../ui/BrainrotSlider'

interface ChatInputProps {
  onSend: (message: string) => void
  brainrotLevel: number
  onBrainrotChange: (value: number) => void
  lessYap: boolean
  onLessYapChange: (value: boolean) => void
  disabled: boolean
}

export default function ChatInput({
  onSend,
  brainrotLevel,
  onBrainrotChange,
  lessYap,
  onLessYapChange,
  disabled,
}: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-input-area">
      <div className="chat-controls">
        <BrainrotSlider value={brainrotLevel} onChange={onBrainrotChange} />
        <div className="lessyap-control">
          <span className="lessyap-label">Less Yap</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={lessYap}
              onChange={(e) => onLessYapChange(e.target.checked)}
            />
            <span className="toggle-track" />
          </label>
        </div>
      </div>

      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder="say something bestie... 💀"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!input.trim() || disabled}
        >
          ➤
        </button>
      </div>
    </div>
  )
}
