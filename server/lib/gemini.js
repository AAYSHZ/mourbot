import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

export function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function* streamChat(systemPrompt, messages) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Build chat history (all messages except the last user message)
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

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}
