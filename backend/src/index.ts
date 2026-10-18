import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { prisma } from './lib/prisma.js';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { announcementsRouter } from './routes/announcements.js';
import { publicRouter } from './routes/public.js';
import { locationsRouter } from './routes/locations.js';
import { faqsRouter } from './routes/faqs.js';
import { contactRouter, messagesRouter } from './routes/contact.js';
import { chatbotRouter } from './routes/chatbot.js';
import { documentsRouter } from './routes/documents.js';
import { publicDocumentsRouter } from './routes/publicDocuments.js';
import { archivesRouter } from './routes/archives.js';
import { publicArchivesRouter } from './routes/publicArchives.js';
import { postersRouter } from './routes/posters.js';
import { publicPostersRouter } from './routes/publicPosters.js';

const app = express();
const PORT = 4000;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Pemeriksaan server.
app.get('/api/v1/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'UPPD Banyumas API',
    message: 'Backend berjalan dengan baik'
  });
});

// Pemeriksaan koneksi database.
app.get('/api/v1/health/db', async (_req, res) => {
  try {
    const totalUsers = await prisma.user.count();

    res.json({
      status: 'ok',
      database: 'connected',
      totalUsers
    });
  } catch (error) {
    console.error('Database error:', error);

    res.status(503).json({
      status: 'error',
      database: 'disconnected'
    });
  }
});

// Autentikasi dan pengelolaan pegawai.
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);

// Pengelolaan konten.
// Pemeriksaan hak akses dilakukan di masing-masing router.
app.use('/api/v1/announcements', announcementsRouter);
app.use('/api/v1/locations', locationsRouter);
app.use('/api/v1/faqs', faqsRouter);
app.use('/api/v1/chatbot', chatbotRouter);
app.use('/api/v1/documents', documentsRouter);
app.use('/api/v1/archives', archivesRouter);
app.use('/api/v1/posters', postersRouter);

// Pengiriman dan pengelolaan pesan.
app.use('/api/v1/contact', contactRouter);
app.use('/api/v1/messages', messagesRouter);

// Konten publik tanpa login.
app.use('/api/v1/public/documents', publicDocumentsRouter);
app.use('/api/v1/public/archives', publicArchivesRouter);
app.use('/api/v1/public', publicRouter);
app.use('/api/v1/public/posters', publicPostersRouter);

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Backend berjalan di http://localhost:${PORT}`);
});