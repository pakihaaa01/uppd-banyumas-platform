import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

export const announcementsRouter = Router();

announcementsRouter.use(requireAuth);

const announcementFields = {
  id: true,
  title: true,
  date: true,
  category: true,
  shortDescription: true,
  content: true,
  isNew: true,
  isImportant: true,
  status: true,
  createdById: true,
  createdAt: true,
  updatedAt: true
} as const;

const textLimits = {
  title: 200,
  category: 100,
  shortDescription: 500,
  content: 50000
} as const;

type DraftData = {
  title?: string;
  category?: string;
  shortDescription?: string;
  content?: string;
  date?: Date;
  isNew?: boolean;
  isImportant?: boolean;
};

type ValidationResult =
  | { valid: true; data: DraftData }
  | { valid: false; message: string };

// Validasi bersama untuk pembuatan dan perubahan draf.
function validateDraft(
  input: unknown,
  partial: boolean
): ValidationResult {
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input)
  ) {
    return { valid: false, message: 'Input tidak valid' };
  }

  const values = input as Record<string, unknown>;
  const keys = Object.keys(values);
  const allowed = [
    ...Object.keys(textLimits),
    'date',
    'isNew',
    'isImportant'
  ];

  if (
    keys.length === 0 ||
    keys.some(key => !allowed.includes(key))
  ) {
    return {
      valid: false,
      message: 'Input kosong atau mengandung field yang tidak diizinkan'
    };
  }

  const data: DraftData = {};

  for (
    const field of Object.keys(textLimits) as Array<keyof typeof textLimits>
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

  if (!partial || Object.hasOwn(values, 'date')) {
    const value = values.date;

    if (
      typeof value !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
      return {
        valid: false,
        message: 'Tanggal harus menggunakan format YYYY-MM-DD'
      };
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      return { valid: false, message: 'Tanggal tidak valid' };
    }

    data.date = date;
  }

  for (const field of ['isNew', 'isImportant'] as const) {
    if (!Object.hasOwn(values, field)) continue;

    const value = values[field];

    if (typeof value !== 'boolean') {
      return {
        valid: false,
        message: `${field} harus berupa boolean`
      };
    }

    data[field] = value;
  }

  return { valid: true, data };
}

// GET /api/v1/announcements
// Membaca maksimal 100 draf milik sendiri.
announcementsRouter.get('/', async (_req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        createdById: res.locals.currentUser.id,
        status: 'DRAFT'
      },
      select: announcementFields,
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      take: 100
    });

    res.json({ announcements });
  } catch (error) {
    console.error('List announcements error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// POST /api/v1/announcements
// Membuat draf dengan pembuat dan status dari server.
announcementsRouter.post('/', async (req, res) => {
  try {
    const result = validateDraft(req.body, false);

    if (!result.valid) {
      res.status(400).json({ message: result.message });
      return;
    }

    const data = result.data;

    // Semua field ini wajib pada pembuatan draf.
    if (
      data.title === undefined ||
      data.date === undefined ||
      data.category === undefined ||
      data.shortDescription === undefined ||
      data.content === undefined
    ) {
      res.status(400).json({
        message: 'Data pengumuman belum lengkap'
      });
      return;
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        date: data.date,
        category: data.category,
        shortDescription: data.shortDescription,
        content: data.content,
        isNew: data.isNew ?? true,
        isImportant: data.isImportant ?? false,
        status: 'DRAFT',
        createdById: res.locals.currentUser.id
      },
      select: announcementFields
    });

    res.status(201).json({
      message: 'Draf pengumuman berhasil dibuat',
      announcement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// PATCH /api/v1/announcements/:id
// Mengubah draf milik sendiri, termasuk tanggal dan penanda.
announcementsRouter.patch('/:id', async (req, res) => {
  try {
    const validation = validateDraft(req.body, true);

    if (!validation.valid) {
      res.status(400).json({ message: validation.message });
      return;
    }

    const result = await prisma.announcement.updateMany({
      where: {
        id: req.params.id,
        createdById: res.locals.currentUser.id,
        status: 'DRAFT'
      },
      data: validation.data
    });

    if (result.count === 0) {
      res.status(404).json({
        message: 'Draf milik Anda tidak ditemukan'
      });
      return;
    }

    res.json({ message: 'Draf berhasil diperbarui' });
  } catch (error) {
    console.error('Update draft error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// DELETE /api/v1/announcements/:id
// Menghapus draf milik sendiri.
announcementsRouter.delete('/:id', async (req, res) => {
  try {
    const result = await prisma.announcement.deleteMany({
      where: {
        id: req.params.id,
        createdById: res.locals.currentUser.id,
        status: 'DRAFT'
      }
    });

    if (result.count === 0) {
      res.status(404).json({
        message: 'Draf milik Anda tidak ditemukan'
      });
      return;
    }

    res.json({ message: 'Draf berhasil dihapus' });
  } catch (error) {
    console.error('Delete draft error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});