import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const publicDocumentsRouter = Router();

// GET /api/v1/public/documents
// Hanya catatan dokumen terbit yang tersedia untuk masyarakat.
publicDocumentsRouter.get('/', async (_req, res) => {
  try {
    const documents = await prisma.publicDocument.findMany({
      where: {
        isPublished: true
      },
      select: {
        id: true,
        title: true,
        category: true,
        fileType: true,
        fileSize: true,
        downloadUrl: true,
        updateDate: true,
        description: true
      },
      orderBy: [
        { updateDate: 'desc' },
        { id: 'desc' }
      ],
      take: 100
    });

    res.json({
      documents: documents.map(document => ({
        ...document,
        updateDate: document.updateDate.toISOString().slice(0, 10),
        description: document.description ?? undefined
      }))
    });
  } catch (error) {
    console.error('Public documents error:', error);
    res.status(500).json({
      message: 'Gagal mengambil dokumen publik'
    });
  }
});