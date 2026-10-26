import { prisma } from './lib/prisma';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { announcementsRouter } from './routes/announcements';
import { publicRouter } from './routes/public';
import { locationsRouter } from './routes/locations';
import { faqsRouter } from './routes/faqs';
import { contactRouter, messagesRouter } from './routes/contact';
import { chatbotRouter } from './routes/chatbot';
import { documentsRouter } from './routes/documents';
import { publicDocumentsRouter } from './routes/publicDocuments';
import { archiveRouter } from './routes/archive';
import { messageRepliesRouter } from './routes/messageReplies';

const app = express();
const PORT = 4000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use('/api/v1/documents/:id/upload', express.raw({ type: 'application/pdf', limit: '10mb' }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/v1/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'UPPD Banyumas API',
    chatbotToggle: true,
    chatbotApiVersion: '2026-10-26',
    message: 'Backend berjalan dengan baik'
  });
});


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

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/announcements', announcementsRouter);
app.use('/api/v1/public', publicRouter);
app.use('/api/v1/locations', locationsRouter);
app.use('/api/v1/faqs', faqsRouter);
app.use('/api/v1/contact', contactRouter);
app.use('/api/v1/messages', messagesRouter);
app.use('/api/v1/message-replies', messageRepliesRouter);
app.use('/api/v1/chatbot', chatbotRouter);
app.use('/api/v1/documents', documentsRouter);
app.use('/api/v1/archive', archiveRouter);
app.use('/api/v1/public/documents', publicDocumentsRouter);

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Backend berjalan di http://localhost:${PORT}`);
});
