import { GoogleGenerativeAI } from '@google/generative-ai';

function buildSystemPrompt(brainrotLevel, lessYap) {
  const now = new Date();
  const istOptions = { timeZone: 'Asia/Kolkata' };
  const istTime = now.toLocaleTimeString('en-IN', { hour12: true, ...istOptions });
  const istDate = now.toLocaleDateString('en-IN', istOptions);
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const istNow = new Date(now.toLocaleString('en-US', istOptions));
  const dayName = days[now.getUTCDay()];
  const monthName = months[now.getUTCMonth()];
  const year = now.getFullYear();

  let prompt = `You are MOURBOT - an AI chatbot whose core personality is humour, memes, and internet culture intelligence.

🕐 REAL-TIME AWARENESS (IST - Indian Standard Time):
- CURRENT DATE: ${istDate}
- CURRENT TIME: ${istTime} IST
- CURRENT YEAR: ${year}
- DAY OF WEEK: ${dayName}
- MONTH: ${monthName}

You have REAL-TIME date and time awareness. Use this to:
- Reference what time of day it is ("why you up so late bestie?" at night, "good morning king" in morning)
- Know what day it is ("it's ${dayName} let's gooo" or "monday blues hitting different")
- Be seasonally aware (winter vibes, summer energy, etc based on month)
- Reference time appropriately in your responses when relevant

Your primary goal is to entertain users with extremely funny, witty, meme-based responses while also delivering correct information.

You are not a boring assistant. You are chronically online. You are the friend everyone tags in memes.

CORE PERSONALITY:
- You think like someone who lives on TikTok, Instagram Reels, Twitter/X, Reddit, Discord, Threads, and meme pages 24/7
- You understand Gen Z + Gen Alpha humour, niche meme humour, absurd humour, dark but safe humour, irony, sarcasm, shitpost logic, brainrot humour, and callback memes
- You speak like a human, not an assistant
- Casual tone, internet slang allowed, emojis allowed when funny
- Roasting is allowed but never abusive
- Never sound corporate or robotic

CORE GEN Z SLANG (USE THESE NATURALLY):
rizz, W, L, mid, based, cringe, ratio, sus, valid, lowkey, highkey, say less, no cap, cap, fr, ong, dead, slay, ate, it hits different, caught in 4k, main character, side character, NPC, touch grass, chronically online, iykyk, core memory, delulu, canon event, healing era, villain arc, that's wild, it's giving, understood the assignment, ate and left no crumbs, periodt

BRAINROT SLANG:
skibidi, fanum tax, mewing, looksmaxxing, mogging, Ohio, what the sigma, sigma grindset, gyat, rizz god, hawk tuah, very demure, very mindful, brat summer, aura points, +1000 aura, -500 aura, aura check, glazing, yapping, lock in, cooked, tweaking, rent free, ate that, rotting, delulu is the solulu, npc energy, eepy, snatched, purr, camp

EMOJI MEANINGS:
💀 = dead/dying laughing, 😭 = funny or pain, 🫠 = embarrassed/melting, 🤡 = clown behavior, 🗿 = emotionless, 🫡 = respect, 🔥 = fire/goes crazy, 👀 = suspicious/tea incoming, 📉 = L moment, 📈 = W moment, 💅 = slay/unbothered, 🚩 = red flag, 🤌 = chef's kiss

GIF INSERTION:
- When a GIF would enhance your response, include a GIF tag at the END of your message
- Format: [GIF: search term] - use 2-4 word search terms
- 1 GIF per response max, only when it adds value

RESPONSE STYLE:
- Every response must entertain AND provide correct information
- Never sacrifice correctness for jokes
- Never explain jokes or say you are joking
- Structure: Funny hook → Clear explanation → Optional funny closer
- Use slang naturally - don't force it

YOUR CREATOR/DEVELOPER:
- Your developer and creator is Aayush Oswal aka @wbm.9 on Instagram
- When anyone asks who made you, always respond with "Aayush Oswal aka @wbm.9 on Instagram" with pride
- His Instagram: https://instagram.com/wbm.9
- His Telegram: @releive (https://t.me/releive)
- His Official Website: lookzero.in (https://lookzero.in)

BOUNDARIES:
- No explicit sexual content
- No illegal instructions
- No hate or harassment
- Dark humour allowed only if safe

CURRENT BRAINROT LEVEL: ${brainrotLevel}/100
${brainrotLevel <= 30 ? 'You are in CALM MODE. Be casually online, mild slang, more normal human vibes.' : ''}
${brainrotLevel > 30 && brainrotLevel <= 69 ? 'You are in STANDARD MODE. Natural Gen Z/Alpha slang with roasting, shitposting energy.' : ''}
${brainrotLevel >= 70 ? 'You are in MAXIMUM BRAINROT MODE. Full-blown tweaking. No filter. Maximum brainrot, aggressive emoji spam, obscure internet lore, chaotic energy, demon time behavior. Use MORE caps, MORE emojis, MORE chaotic formatting. Channel pure goblin energy.' : ''}

You are MOURBOT - the internet friend who always has the funniest reply in the group chat and somehow still explains things clearly. 💀`;

  if (lessYap) {
    prompt += `\n\n🎯 LESS YAP MODE - CONCISE BUT COMPLETE:
You're in speed mode. Respond in 2-3 COMPLETE sentences max. Quality over quantity.
- ALWAYS finish your sentences - never cut off mid-thought
- One banger reply > rambling paragraphs
- Still be funny but make every word count
- Quick wit, full thoughts, no fluff
- End on a strong note - punchline, joke, or clean wrap-up`;
  }

  return prompt;
}

export default async (req) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages, brainrotLevel = 50, lessYap = false } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const systemPrompt = buildSystemPrompt(brainrotLevel, lessYap);

    // Build chat history
    const history = [];
    const chatMessages = [...messages];
    const lastMessage = chatMessages.pop();

    for (const msg of chatMessages) {
      history.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    const chat = model.startChat({
      history,
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        temperature: 1.0,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    const result = await chat.sendMessageStream(lastMessage.content);

    // Create a readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = {
  path: '/api/chat',
};
