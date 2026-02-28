import ShinyText from '../ui/ShinyText'

interface ChatHeaderProps {
  onToggleSidebar: () => void
}

export default function ChatHeader({ onToggleSidebar }: ChatHeaderProps) {
  return (
    <div className="chat-header">
      <div className="chat-header-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar}>☰</button>
        <ShinyText text="MOURBOT" />
      </div>
      <div className="chat-header-status">
        <span className="status-dot" />
        chronically online
      </div>
    </div>
  )
}
