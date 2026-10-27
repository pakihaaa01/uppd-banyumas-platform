import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAdministrator } from '../middleware/auth';

export const dashboardRouter = Router();
dashboardRouter.use(requireAdministrator);
dashboardRouter.get('/', async (_req, res) => {
  try {
    // Counts include all records, not just the first page returned by list routes.
    const [announcements, locations, documents, archive, faqs, chatbot, newMessages] = await prisma.$transaction([
      prisma.announcement.count(), prisma.serviceLocation.count(), prisma.publicDocument.count(),
      prisma.visualArchive.count(), prisma.fAQ.count(), prisma.chatbotFAQ.count(),
      prisma.contactMessage.count({ where: { status: 'NEW' } }),
    ]);
    res.json({ summary: { announcements, locations, documents, archive, faqs, chatbot, newMessages } });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: 'Gagal memuat ringkasan pengelolaan' });
  }
});
