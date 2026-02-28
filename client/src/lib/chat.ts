import { supabase } from './supabase'
import { searchGif, extractGifTag } from './giphy'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  gifUrl?: string | null
  createdAt: string
}

export interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

// Send a message and get streaming response from backend
export async function sendMessage(
  messages: { role: string; content: string }[],
  brainrotLevel: number,
  lessYap: boolean,
  onChunk: (text: string) => void,
  onGif: (url: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({ messages, brainrotLevel, lessYap }),
    })

    if (!res.ok) {
      const err = await res.text()
      onError(err || 'Failed to get response')
      return
    }

    const reader = res.body?.getReader()
    if (!reader) {
      onError('No response stream')
      return
    }

    const decoder = new TextDecoder()
    let fullText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            // Process GIF tags from the full response
            const { cleanText, gifQuery } = extractGifTag(fullText)
            if (gifQuery) {
              onChunk('') // Signal for clean text
              const gifUrl = await searchGif(gifQuery)
              if (gifUrl) onGif(gifUrl)
            }
            onDone()
            return
          }
          try {
            const parsed = JSON.parse(data)
            const text = parsed.text || parsed.content || ''
            if (text) {
              fullText += text
              onChunk(text)
            }
          } catch {
            // Non-JSON chunk, treat as raw text
            if (data.trim()) {
              fullText += data
              onChunk(data)
            }
          }
        }
      }
    }
    
    // If stream ended without [DONE]
    const { gifQuery } = extractGifTag(fullText)
    if (gifQuery) {
      const gifUrl = await searchGif(gifQuery)
      if (gifUrl) onGif(gifUrl)
    }
    onDone()
  } catch (err: any) {
    onError(err.message || 'Network error')
  }
}

// Conversation CRUD
export async function getConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching conversations:', error)
    return []
  }
  return (data || []).map((c: any) => ({
    id: c.id,
    title: c.title,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }))
}

export async function createConversation(title: string): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data, error } = await supabase
    .from('conversations')
    .insert({ title, user_id: session.user.id })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating conversation:', error)
    return null
  }
  return data.id
}

export async function deleteConversation(id: string): Promise<boolean> {
  const { error } = await supabase.from('conversations').delete().eq('id', id)
  return !error
}

export async function updateConversationTitle(id: string, title: string) {
  await supabase.from('conversations').update({ title, updated_at: new Date().toISOString() }).eq('id', id)
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }
  return (data || []).map((m: any) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    gifUrl: m.gif_url,
    createdAt: m.created_at,
  }))
}

export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  gifUrl?: string | null,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      gif_url: gifUrl || null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error saving message:', error)
    return null
  }

  // Update conversation timestamp
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  return data.id
}
