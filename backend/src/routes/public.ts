import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const publicRouter = Router();

// Hanya pengumuman terbit yang boleh dibaca masyarakat.
publicRouter.get('/announcements', async (_req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() }
      },
      select: {
        id: true,
        title: true,
        date: true,
        category: true,
        shortDescription: true,
        content: true,
        isNew: true,
        isImportant: true
      },
      orderBy: [
        { date: 'desc' },
        { id: 'desc' }
      ],
      take: 100
    });

    res.json({
      announcements: announcements.map(item => ({
        ...item,
        date: item.date.toISOString().slice(0, 10)
      }))
    });
  } catch (error) {
    console.error('Public announcements error:', error);
    res.status(500).json({
      message: 'Gagal mengambil pengumuman'
    });
  }
});