import { Router } from 'express';
import { streamChat } from '../lib/gemini.js';
import { buildSystemPrompt } from '../lib/systemPrompt.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { messages, brainrotLevel = 50, lessYap = false } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const systemPrompt = buildSystemPrompt(brainrotLevel, lessYap);

    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    // Stream the response
    for await (const chunk of streamChat(systemPrompt, messages)) {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Chat error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
});

export default router;
