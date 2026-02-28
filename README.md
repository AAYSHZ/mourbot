# 💀 MOURBOT - Your Chronically Online AI Bestie

A meme-powered AI chatbot built with React, Node.js, Google Gemini, and Supabase.

## Features

- 🧠 **Gemini AI** with streaming responses
- 🎛️ **Brainrot Slider** (0–100) — Calm → Cooked → Tweaking
- 🤫 **Less Yap Mode** — concise responses
- 🎬 **GIF Integration** via Giphy API
- 🔒 **Auth** — Google OAuth + Email via Supabase
- 💬 **Chat History** — saved to Supabase PostgreSQL
- 🎨 **Premium Dark UI** — glassmorphism, animations, gradients

---

## 🗄️ Supabase SQL Setup

> **Copy-paste the following SQL into your Supabase SQL Editor and run it.** This creates all the tables, policies, and indexes needed.

Go to your Supabase Dashboard → **SQL Editor** → **New Query** → paste → **Run**.

```sql
-- ============================================
-- MOURBOT - Supabase Database Setup
-- Run this ENTIRE script in the SQL Editor
-- ============================================

-- 1. Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  gif_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for conversations
-- Users can only see their own conversations
CREATE POLICY "Users can view own conversations"
  ON public.conversations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own conversations
CREATE POLICY "Users can create own conversations"
  ON public.conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON public.conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own conversations
CREATE POLICY "Users can delete own conversations"
  ON public.conversations
  FOR DELETE
  USING (auth.uid() = user_id);

-- 6. RLS Policies for messages
-- Users can view messages in their own conversations
CREATE POLICY "Users can view own messages"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Users can insert messages in their own conversations
CREATE POLICY "Users can insert own messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Users can delete messages in their own conversations
CREATE POLICY "Users can delete own messages"
  ON public.messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);

-- ============================================
-- ✅ DONE! Your database is ready for MOURBOT
-- ============================================
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)
- A Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### 1. Run the SQL Setup

Copy the SQL above into your **Supabase SQL Editor** and run it.

### 2. Set up the Server

```bash
cd server
```

Edit `.env` and add your **Gemini API key**:

```
GEMINI_API_KEY=your_actual_gemini_api_key
```

Start the server:

```bash
npm run dev
```

### 3. Set up the Client

```bash
cd client
npm run dev
```

Open **http://localhost:5173** → you'll see the MOURBOT landing page! 🎉

---

## 🔐 Auth Setup (Google OAuth)

To enable "Continue with Google":

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Enable **Google**
3. Add your **Google Client ID** and **Client Secret** (from [Google Cloud Console](https://console.cloud.google.com/apis/credentials))
4. Set **Authorized redirect URI** on Google Cloud to:
   ```
   https://httxcjzsuvwfxiqfkldp.supabase.co/auth/v1/callback
   ```
5. Email/password auth works out of the box ✅

---

## 📁 Project Structure

```
mourbot/
├── client/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # AuthLanding, AuthModal
│   │   │   ├── chat/           # ChatContainer, Sidebar, Header, Messages, Input
│   │   │   └── ui/             # ShinyText, BrainrotSlider
│   │   ├── config/             # lore.ts
│   │   ├── hooks/              # useAuth.ts
│   │   ├── lib/                # supabase.ts, chat.ts, giphy.ts
│   │   ├── App.tsx
│   │   └── index.css
│   └── package.json
├── server/                     # Node.js Backend (Express)
│   ├── routes/chat.js          # POST /api/chat (SSE streaming)
│   ├── lib/
│   │   ├── gemini.js           # Google Gemini SDK
│   │   ├── giphy.js            # Giphy search
│   │   └── systemPrompt.js     # Dynamic prompt builder
│   ├── index.js
│   └── package.json
└── README.md
```

---

## 🎛️ How the Brainrot Slider Works

| Level  | Mode        | Behavior                                 |
| ------ | ----------- | ---------------------------------------- |
| 0–30   | 😌 Calm     | Casually online, mild slang              |
| 31–69  | 🗿 Mid      | Standard shitposting, Gen Z energy       |
| 70–85  | 🔥 Cooked   | Maximum brainrot, aggressive emojis      |
| 86–100 | 💀 Tweaking | No filter, full demon time, feral energy |

---

## 🛠️ Environment Variables

### Server (`server/.env`)

| Variable         | Description                                            |
| ---------------- | ------------------------------------------------------ |
| `GEMINI_API_KEY` | **Required** — Google Gemini API key                   |
| `GIPHY_API_KEY`  | Giphy API key (pre-filled)                             |
| `PORT`           | Server port (default: 3001)                            |
| `CLIENT_URL`     | Frontend URL for CORS (default: http://localhost:5173) |

### Client (`client/.env`)

| Variable                 | Description                       |
| ------------------------ | --------------------------------- |
| `VITE_SUPABASE_URL`      | Supabase project URL (pre-filled) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (pre-filled)    |
| `VITE_GIPHY_API_KEY`     | Giphy API key (pre-filled)        |

---

## 👨‍💻 Creator

Made with 💀 by **Aayush Oswal** ([@wbm.9](https://instagram.com/wbm.9))

- Instagram: [@wbm.9](https://instagram.com/wbm.9)
- Telegram: [@releive](https://t.me/releive)
- Website: [lookzero.in](https://lookzero.in)
