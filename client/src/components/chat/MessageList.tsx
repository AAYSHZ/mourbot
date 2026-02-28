import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Message } from '../../lib/chat'

interface MessageListProps {
  messages: Message[]
  streamingContent: string
  isStreaming: boolean
}

export default function MessageList({ messages, streamingContent, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="messages-container">
        <div className="empty-chat">
          <div className="empty-chat-skull">💀</div>
          <h3>whatup bestie</h3>
          <p>ask me anything, roast me, or just vibe. i'm chronically online so i got you fr fr 🔥</p>
        </div>
      </div>
    )
  }

  return (
    <div className="messages-container">
      {messages.map((msg) => (
        <div key={msg.id} className={`message ${msg.role === 'user' ? 'user' : 'bot'}`}>
          <div className="message-avatar">
            {msg.role === 'user' ? '👤' : '💀'}
          </div>
          <div className="message-content">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
            {msg.gifUrl && (
              <img
                src={msg.gifUrl}
                alt="GIF"
                className="message-gif"
                loading="lazy"
              />
            )}
          </div>
        </div>
      ))}

      {isStreaming && (
        <div className="message bot">
          <div className="message-avatar">💀</div>
          <div className="message-content">
            {streamingContent ? (
              <ReactMarkdown>{streamingContent}</ReactMarkdown>
            ) : (
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            )}
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
