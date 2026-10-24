import { Router } from 'express';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
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
publicDocumentsRouter.get('/:id/file', async (req, res) => {
  try {
    const item = await prisma.publicDocument.findFirst({
      where: { id: req.params.id, isPublished: true },
      select: { id: true, downloadUrl: true }
    });
    if (!item || item.downloadUrl !== `/api/v1/public/documents/${item.id}/file`) {
      res.status(404).json({ message: 'Berkas tidak tersedia' }); return;
    }
    const directory = join(process.cwd(), 'storage', 'documents');
    const ref = (await readFile(join(directory, item.id + '.ref'), 'utf8')).trim();
    if (!/^[0-9a-f-]{36}$/.test(ref)) {
      res.status(404).json({ message: 'Berkas tidak tersedia' }); return;
    }
    const contents = await readFile(join(directory, ref + '.pdf'));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="dokumen.pdf"');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(contents);
  } catch {
    res.status(404).json({ message: 'Berkas tidak tersedia' });
  }
});
