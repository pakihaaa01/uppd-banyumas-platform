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

// Semua pegawai hanya melihat draf miliknya sendiri.
announcementsRouter.get('/', async (_req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        createdById: res.locals.currentUser.id,
        status: 'DRAFT'
      },
      select: announcementFields,
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json({ announcements });
  } catch (error) {
    console.error('List announcements error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// Membuat draf. Status dan pembuat ditentukan server.
announcementsRouter.post('/', async (req, res) => {
  try {
    const input = req.body;

    if (
      !input ||
      typeof input !== 'object' ||
      Array.isArray(input)
    ) {
      res.status(400).json({ message: 'Input tidak valid' });
      return;
    }

    const allowed = [
      'title', 'date', 'category', 'shortDescription',
      'content', 'isNew', 'isImportant'
    ];

    if (Object.keys(input).some(key => !allowed.includes(key))) {
      res.status(400).json({
        message: 'Ada field yang tidak diizinkan'
      });
      return;
    }

    const limits = {
      title: 200,
      category: 100,
      shortDescription: 500,
      content: 50000
    } as const;

    for (const [field, max] of Object.entries(limits)) {
      const value = input[field];

      if (
        typeof value !== 'string' ||
        value.trim().length === 0 ||
        value.trim().length > max
      ) {
        res.status(400).json({
          message: `${field} wajib diisi, maksimal ${max} karakter`
        });
        return;
      }
    }

    if (
      typeof input.date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(input.date)
    ) {
      res.status(400).json({
        message: 'Tanggal harus menggunakan format YYYY-MM-DD'
      });
      return;
    }

    const date = new Date(`${input.date}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== input.date
    ) {
      res.status(400).json({ message: 'Tanggal tidak valid' });
      return;
    }

    if (
      ('isNew' in input && typeof input.isNew !== 'boolean') ||
      ('isImportant' in input &&
        typeof input.isImportant !== 'boolean')
    ) {
      res.status(400).json({
        message: 'isNew dan isImportant harus berupa boolean'
      });
      return;
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: input.title.trim(),
        date,
        category: input.category.trim(),
        shortDescription: input.shortDescription.trim(),
        content: input.content.trim(),
        isNew: input.isNew ?? true,
        isImportant: input.isImportant ?? false,
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

// Mengubah isi draf milik sendiri.
announcementsRouter.patch('/:id', async (req, res) => {
  try {
    const input = req.body;

    if (
      !input ||
      typeof input !== 'object' ||
      Array.isArray(input)
    ) {
      res.status(400).json({ message: 'Input tidak valid' });
      return;
    }

    const limits = {
      title: 200,
      category: 100,
      shortDescription: 500,
      content: 50000
    } as const;

    const keys = Object.keys(input);

    if (
      keys.length === 0 ||
      keys.some(key => !Object.hasOwn(limits, key))
    ) {
      res.status(400).json({
        message:
          'Hanya title, category, shortDescription, dan content yang dapat diubah melalui endpoint ini'
      });
      return;
    }

    const data: {
      title?: string;
      category?: string;
      shortDescription?: string;
      content?: string;
    } = {};

    for (const field of Object.keys(limits) as Array<keyof typeof limits>) {
      if (!Object.hasOwn(input, field)) continue;

      const value = input[field];

      if (
        typeof value !== 'string' ||
        value.trim().length === 0 ||
        value.trim().length > limits[field]
      ) {
        res.status(400).json({
          message: `${field} wajib diisi, maksimal ${limits[field]} karakter`
        });
        return;
      }

      data[field] = value.trim();
    }

    // Kepemilikan dan status diperiksa saat pembaruan dilakukan.
    const result = await prisma.announcement.updateMany({
      where: {
        id: req.params.id,
        createdById: res.locals.currentUser.id,
        status: 'DRAFT'
      },
      data
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