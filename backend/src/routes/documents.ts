import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAdministrator } from '../middleware/auth';
import type { PublicDocumentCategory } from '../../generated/prisma/enums';

export const documentsRouter = Router();

documentsRouter.use(requireAdministrator);

const categories = new Set([
  'sop', 'wbk', 'sipp', 'pad', 'evaluasi'
]);

const textLimits = {
  title: 200,
  fileType: 30,
  fileSize: 50
} as const;

type DocumentData = {
  title?: string;
  category?: PublicDocumentCategory;
  fileType?: string;
  fileSize?: string;
  downloadUrl?: string;
  updateDate?: Date;
  description?: string | null;
};

type ValidationResult =
  | { valid: true; data: DocumentData }
  | { valid: false; message: string };

function validateDocument(
  input: unknown,
  partial: boolean
): ValidationResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, message: 'Input tidak valid' };
  }

  const values = input as Record<string, unknown>;
  const allowed = [
    ...Object.keys(textLimits),
    'category',
    'downloadUrl',
    'updateDate',
    'description'
  ];

  const keys = Object.keys(values);

  if (
    keys.length === 0 ||
    keys.some(key => !allowed.includes(key))
  ) {
    return {
      valid: false,
      message: 'Input kosong atau mengandung field yang tidak diizinkan'
    };
  }

  const data: DocumentData = {};

  for (
    const field of Object.keys(textLimits) as
      Array<keyof typeof textLimits>
  ) {
    if (partial && !Object.hasOwn(values, field)) continue;

    const value = values[field];

    if (
      typeof value !== 'string' ||
      value.trim().length === 0 ||
      value.trim().length > textLimits[field]
    ) {
      return {
        valid: false,
        message: `${field} wajib diisi, maksimal ${textLimits[field]} karakter`
      };
    }

    data[field] = value.trim();
  }

  if (!partial || Object.hasOwn(values, 'category')) {
    const value = values.category;

    if (typeof value !== 'string' || !categories.has(value)) {
      return {
        valid: false,
        message: 'Kategori harus sop, wbk, sipp, pad, atau evaluasi'
      };
    }

    data.category = value as PublicDocumentCategory;
  }

  if (!partial || Object.hasOwn(values, 'downloadUrl')) {
    const value = values.downloadUrl;
    if (typeof value !== 'string' || value.trim().length > 2048) {
      return { valid: false, message: 'downloadUrl maksimal 2048 karakter' };
    }
    const trimmed = value.trim();
    if (!trimmed) {
      data.downloadUrl = '';
    } else {
      let url: URL;
      try { url = new URL(trimmed); }
      catch { return { valid: false, message: 'URL dokumen harus HTTP/HTTPS lengkap' }; }
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
        return { valid: false, message: 'URL dokumen harus HTTP/HTTPS tanpa kredensial' };
      }
      data.downloadUrl = url.href;
    }
  }

  if (!partial || Object.hasOwn(values, 'updateDate')) {
    const value = values.updateDate;

    if (
      typeof value !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
      return {
        valid: false,
        message: 'updateDate harus menggunakan format YYYY-MM-DD'
      };
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      return { valid: false, message: 'Tanggal tidak valid' };
    }

    data.updateDate = date;
  }

  if (Object.hasOwn(values, 'description')) {
    const value = values.description;

    if (value === null) {
      data.description = null;
    } else if (
      typeof value === 'string' &&
      value.trim().length <= 5000
    ) {
      data.description = value.trim();
    } else {
      return {
        valid: false,
        message: 'description maksimal 5000 karakter atau null'
      };
    }
  }

  return { valid: true, data };
}

// GET /api/v1/documents
documentsRouter.get('/', async (_req, res) => {
  try {
    const documents = await prisma.publicDocument.findMany({
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      take: 100
    });

    res.json({ documents });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// POST /api/v1/documents
documentsRouter.post('/', async (req, res) => {
  try {
    const validation = validateDocument(req.body, false);

    if (!validation.valid) {
      res.status(400).json({ message: validation.message });
      return;
    }

    const data = validation.data;

    if (
      data.title === undefined ||
      data.category === undefined ||
      data.fileType === undefined ||
      data.fileSize === undefined ||
      data.downloadUrl === undefined ||
      data.updateDate === undefined
    ) {
      res.status(400).json({ message: 'Data dokumen belum lengkap' });
      return;
    }

    const document = await prisma.publicDocument.create({
      data: {
        title: data.title,
        category: data.category,
        fileType: data.fileType,
        fileSize: data.fileSize,
        downloadUrl: data.downloadUrl,
        updateDate: data.updateDate,
        description: data.description,
        isPublished: false
      }
    });

    res.status(201).json({
      message: 'Dokumen berhasil dibuat',
      document
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// PATCH /api/v1/documents/:id
documentsRouter.patch('/:id', async (req, res) => {
  try {
    const validation = validateDocument(req.body, true);

    if (!validation.valid) {
      res.status(400).json({ message: validation.message });
      return;
    }

    const result = await prisma.publicDocument.updateMany({
      where: {
        id: req.params.id,
        isPublished: false
      },
      data: validation.data
    });

    if (result.count === 0) {
      res.status(404).json({
        message: 'Dokumen belum terbit tidak ditemukan'
      });
      return;
    }

    res.json({ message: 'Dokumen berhasil diperbarui' });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// DELETE /api/v1/documents/:id
// Menghapus catatan database, bukan berkas pada tautan.
documentsRouter.delete('/:id', async (req, res) => {
  try {
    const result = await prisma.publicDocument.deleteMany({
      where: {
        id: req.params.id,
        isPublished: false
      }
    });

    if (result.count === 0) {
      res.status(404).json({
        message: 'Dokumen belum terbit tidak ditemukan'
      });
      return;
    }

    res.json({ message: 'Dokumen berhasil dihapus' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});
documentsRouter.post('/:id/publish', async (req, res) => {
  try {
    const updated = await prisma.publicDocument.updateMany({
      where: {
        id: req.params.id,
        isPublished: false,
        downloadUrl: { startsWith: 'http' }
      },
      data: { isPublished: true }
    });
    if (!updated.count) {
      res.status(404).json({ message: 'Dokumen tidak ditemukan, sudah terbit, atau belum memiliki tautan HTTP/HTTPS' });
      return;
    }
    res.json({ message: 'Dokumen diterbitkan' });
  } catch (error) {
    console.error('Publish document error:', error);
    res.status(500).json({ message: 'Gagal menerbitkan dokumen' });
  }
});

documentsRouter.post('/:id/unpublish', async (req, res) => {
  try {
    const updated = await prisma.publicDocument.updateMany({
      where: { id: req.params.id, isPublished: true },
      data: { isPublished: false }
    });
    if (!updated.count) {
      res.status(404).json({ message: 'Dokumen terbit tidak ditemukan atau sudah ditarik' });
      return;
    }
    res.json({ message: 'Publikasi dokumen ditarik' });
  } catch (error) {
    console.error('Unpublish document error:', error);
    res.status(500).json({ message: 'Gagal menarik dokumen' });
  }
});
