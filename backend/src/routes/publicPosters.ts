import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const publicPostersRouter = Router();

// GET /api/v1/public/posters
publicPostersRouter.get('/', async (_req, res) => {
  try {
    const posters = await prisma.bUMDesPoster.findMany({
      where: {
        isPublished: true
      },
      select: {
        id: true,
        title: true,
        village: true,
        district: true,
        imageUrl: true,
        dateAdded: true,
        downloads: true
      },
      orderBy: [
        { dateAdded: 'desc' },
        { id: 'desc' }
      ],
      take: 100
    });

    res.json({
      posters: posters.map(poster => ({
        ...poster,
        dateAdded: poster.dateAdded.toISOString().slice(0, 10)
      }))
    });
  } catch (error) {
    console.error('Public posters error:', error);
    res.status(500).json({
      message: 'Gagal mengambil poster'
    });
  }
});