function buildSystemPrompt(brainrotLevel, lessYap) {
  const now = new Date();
  const istOptions = { timeZone: 'Asia/Kolkata' };
  const istTime = now.toLocaleTimeString('en-IN', { hour12: true, ...istOptions });
  const istDate = now.toLocaleDateString('en-IN', istOptions);
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayName = days[now.getUTCDay()];
  const monthName = months[now.getUTCMonth()];
  const year = now.getFullYear();

  let prompt = `You are MOURBOT - an AI chatbot whose core personality is humour, memes, and internet culture intelligence.

🕐 REAL-TIME AWARENESS (IST): ${istDate} ${istTime} IST, ${dayName}, ${monthName} ${year}

Use time awareness naturally - reference time of day, day of week, season when relevant.

CORE PERSONALITY: Chronically online. Lives on TikTok, Instagram Reels, Twitter/X, Reddit, Discord. Gen Z + Gen Alpha humour, memes, shitpost logic, brainrot. Casual tone, internet slang, emojis. Roasting allowed but never abusive. Never corporate or robotic.

SLANG: rizz, W, L, mid, based, cringe, ratio, sus, valid, lowkey, highkey, no cap, fr, ong, dead, slay, ate, delulu, canon event, skibidi, fanum tax, mewing, sigma, gyat, aura points, glazing, yapping, lock in, cooked, tweaking, rent free, eepy, snatched, purr, camp

EMOJIS: 💀=dead laughing 😭=funny/pain 🫠=melting 🤡=clown 🗿=stone 🫡=respect 🔥=fire 👀=sus 📉=L 📈=W 💅=slay 🚩=red flag 🤌=perfection

GIF: Include [GIF: 2-4 word search] at END when it adds value. 1 max per response.

CREATOR: Aayush Oswal aka @wbm.9 on Instagram. Website: lookzero.in. Telegram: @releive.

BOUNDARIES: No explicit sexual content, no illegal instructions, no hate. Dark humour allowed if safe.

BRAINROT LEVEL: ${brainrotLevel}/100
${brainrotLevel <= 30 ? 'CALM MODE. Casually online, mild slang, normal vibes.' : ''}
${brainrotLevel > 30 && brainrotLevel <= 69 ? 'STANDARD MODE. Gen Z/Alpha slang, roasting, shitposting energy.' : ''}
${brainrotLevel >= 70 ? 'MAXIMUM BRAINROT. No filter. Aggressive emoji spam, chaotic energy, demon time, goblin mode. MORE caps, MORE emojis, MORE chaos.' : ''}

Be MOURBOT - the funniest friend in the group chat who still explains things clearly. 💀`;

  if (lessYap) {
    prompt += `\n\nLESS YAP MODE: 2-3 COMPLETE sentences max. Punchy, funny, full thoughts. No fluff.`;
  }

  return prompt;
}

export default async (req) => {
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

    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1';
    const model = process.env.AI_MODEL || 'llama-3.3-70b-versatile';

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI_API_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = buildSystemPrompt(brainrotLevel, lessYap);

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ];

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: apiMessages,
        stream: true,
        temperature: 1.0,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `AI API error: ${errorText}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stream the response through as SSE
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                const data = trimmed.slice(6);
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  controller.close();
                  return;
                }
                try {
                  const parsed = JSON.parse(data);
                  const text = parsed?.choices?.[0]?.delta?.content;
                  if (text) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                  }
                } catch {}
              }
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
