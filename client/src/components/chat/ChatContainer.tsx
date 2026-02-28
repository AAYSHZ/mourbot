import { useState, useEffect, useCallback } from 'react'
import ChatSidebar from './ChatSidebar'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import {
  sendMessage,
  getConversations,
  createConversation,
  deleteConversation,
  getMessages,
  saveMessage,
  updateConversationTitle,
  type Message,
  type Conversation,
} from '../../lib/chat'
import { extractGifTag } from '../../lib/giphy'

interface ChatContainerProps {
  user: any
  onSignOut: () => void
}

export default function ChatContainer({ user, onSignOut }: ChatContainerProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [brainrotLevel, setBrainrotLevel] = useState(50)
  const [lessYap, setLessYap] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId)
    } else {
      setMessages([])
    }
  }, [activeConvId])

  const loadConversations = async () => {
    const convs = await getConversations()
    setConversations(convs)
  }

  const loadMessages = async (convId: string) => {
    const msgs = await getMessages(convId)
    setMessages(msgs)
  }

  const handleNewChat = useCallback(() => {
    setActiveConvId(null)
    setMessages([])
    setSidebarOpen(false)
  }, [])

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConvId(id)
    setSidebarOpen(false)
  }, [])

  const handleDeleteConversation = useCallback(async (id: string) => {
    await deleteConversation(id)
    if (activeConvId === id) {
      setActiveConvId(null)
      setMessages([])
    }
    loadConversations()
  }, [activeConvId])

  const handleSend = useCallback(async (content: string) => {
    if (isStreaming) return

    let convId = activeConvId

    // Create new conversation if needed
    if (!convId) {
      const title = content.length > 40 ? content.slice(0, 40) + '...' : content
      convId = await createConversation(title)
      if (!convId) return
      setActiveConvId(convId)
    }

    // Add user message
    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    saveMessage(convId, 'user', content)

    // Build message history for API
    const msgHistory = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }))

    // Start streaming
    setIsStreaming(true)
    setStreamingContent('')
    let fullResponse = ''
    let gifUrl: string | null = null

    await sendMessage(
      msgHistory,
      brainrotLevel,
      lessYap,
      (chunk) => {
        fullResponse += chunk
        setStreamingContent(fullResponse)
      },
      (url) => {
        gifUrl = url
      },
      async () => {
        setIsStreaming(false)
        const { cleanText } = extractGifTag(fullResponse)
        const botMsg: Message = {
          id: `temp-bot-${Date.now()}`,
          role: 'assistant',
          content: cleanText,
          gifUrl,
          createdAt: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, botMsg])
        setStreamingContent('')
        saveMessage(convId!, 'assistant', cleanText, gifUrl)

        // Update conversation title if it's the first exchange
        if (messages.length === 0) {
          const title = content.length > 40 ? content.slice(0, 40) + '...' : content
          await updateConversationTitle(convId!, title)
        }
        loadConversations()
      },
      (error) => {
        setIsStreaming(false)
        setStreamingContent('')
        const errMsg: Message = {
          id: `temp-err-${Date.now()}`,
          role: 'assistant',
          content: `bro the server is tweaking rn 💀 error: ${error}`,
          createdAt: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, errMsg])
      },
    )
  }, [activeConvId, messages, brainrotLevel, lessYap, isStreaming])

  return (
    <div className="chat-layout">
      <ChatSidebar
        conversations={conversations}
        activeId={activeConvId}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        onDelete={handleDeleteConversation}
        isOpen={sidebarOpen}
        user={user}
        onSignOut={onSignOut}
      />

      <main className="chat-main">
        <ChatHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <MessageList
          messages={messages}
          streamingContent={streamingContent}
          isStreaming={isStreaming}
        />

        <ChatInput
          onSend={handleSend}
          brainrotLevel={brainrotLevel}
          onBrainrotChange={setBrainrotLevel}
          lessYap={lessYap}
          onLessYapChange={setLessYap}
          disabled={isStreaming}
        />
      </main>
    </div>
  )
}
