import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const publicArchivesRouter = Router();

// GET /api/v1/public/archives
publicArchivesRouter.get('/', async (_req, res) => {
  try {
    const archives = await prisma.visualArchive.findMany({
      where: {
        isPublished: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true
      },
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      take: 100
    });

    res.json({ archives });
  } catch (error) {
    console.error('Public archives error:', error);
    res.status(500).json({
      message: 'Gagal mengambil arsip visual'
    });
  }
});