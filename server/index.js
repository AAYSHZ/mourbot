import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';
import { searchGif } from './lib/giphy.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/chat', chatRouter);

// GIF search endpoint
app.get('/api/gif', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'query parameter q is required' });
  
  const url = await searchGif(q);
  res.json({ url });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'MOURBOT server is alive 💀', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`💀 MOURBOT server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});
