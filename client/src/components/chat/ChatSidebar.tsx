import type { Conversation } from '../../lib/chat'

interface ChatSidebarProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNewChat: () => void
  onDelete: (id: string) => void
  isOpen: boolean
  user: any
  onSignOut: () => void
}

export default function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  isOpen,
  user,
  onSignOut,
}: ChatSidebarProps) {
  const userInitial = user?.email?.[0]?.toUpperCase() || '?'

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={onNewChat}>
          ✚ New Chat
        </button>
      </div>

      <div className="sidebar-conversations">
        {conversations.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '24px 12px' }}>
            no convos yet... start yapping 💬
          </p>
        )}
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`conversation-item ${conv.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(conv.id)}
          >
            <span className="conversation-title">💬 {conv.title}</span>
            <button
              className="conversation-delete"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(conv.id)
              }}
            >
              🗑
            </button>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{userInitial}</div>
          <span className="user-email">{user?.email || 'anon'}</span>
          <button className="sign-out-btn" onClick={onSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  )
}
