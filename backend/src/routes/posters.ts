import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAdministrator } from '../middleware/auth.js';

export const postersRouter = Router();

postersRouter.use(requireAdministrator);

type PosterData = {
  title?: string;
  village?: string;
  district?: string;
  imageUrl?: string;
  dateAdded?: Date;
};

type ValidationResult =
  | { valid: true; data: PosterData }
  | { valid: false; message: string };

const textLimits = {
  title: 200,
  village: 100,
  district: 100
} as const;

function isValidImage(value: string): boolean {
  if (value.startsWith('/images/')) {
    return /^\/images\/[a-zA-Z0-9/_-]+\.(png|jpe?g|webp|gif)$/i.test(value);
  }

  try {
    const url = new URL(value);

    return (
      ['http:', 'https:'].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function validatePoster(
  input: unknown,
  partial: boolean
): ValidationResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, message: 'Input tidak valid' };
  }

  const values = input as Record<string, unknown>;
  const allowed = [
    ...Object.keys(textLimits),
    'imageUrl',
    'dateAdded'
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

  const data: PosterData = {};

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

  if (!partial || Object.hasOwn(values, 'imageUrl')) {
    const value = values.imageUrl;

    if (
      typeof value !== 'string' ||
      value.trim().length > 2048 ||
      !isValidImage(value.trim())
    ) {
      return {
        valid: false,
        message:
          'imageUrl harus berupa URL HTTP/HTTPS tanpa kredensial atau path gambar /images/ yang valid'
      };
    }

    data.imageUrl = value.trim();
  }

  if (!partial || Object.hasOwn(values, 'dateAdded')) {
    const value = values.dateAdded;

    if (
      typeof value !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
      return {
        valid: false,
        message: 'dateAdded harus menggunakan format YYYY-MM-DD'
      };
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      return { valid: false, message: 'Tanggal tidak valid' };
    }

    data.dateAdded = date;
  }

  return { valid: true, data };
}

// GET /api/v1/posters
postersRouter.get('/', async (_req, res) => {
  try {
    const posters = await prisma.bUMDesPoster.findMany({
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      take: 100
    });

    res.json({ posters });
  } catch (error) {
    console.error('List posters error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// POST /api/v1/posters
postersRouter.post('/', async (req, res) => {
  try {
    const validation = validatePoster(req.body, false);

    if (!validation.valid) {
      res.status(400).json({ message: validation.message });
      return;
    }

    const data = validation.data;

    if (
      data.title === undefined ||
      data.village === undefined ||
      data.district === undefined ||
      data.imageUrl === undefined ||
      data.dateAdded === undefined
    ) {
      res.status(400).json({ message: 'Data poster belum lengkap' });
      return;
    }

    const poster = await prisma.bUMDesPoster.create({
      data: {
        title: data.title,
        village: data.village,
        district: data.district,
        imageUrl: data.imageUrl,
        dateAdded: data.dateAdded,
        downloads: 0,
        isPublished: false
      }
    });

    res.status(201).json({
      message: 'Poster berhasil dibuat',
      poster
    });
  } catch (error) {
    console.error('Create poster error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// PATCH /api/v1/posters/:id
postersRouter.patch('/:id', async (req, res) => {
  try {
    const validation = validatePoster(req.body, true);

    if (!validation.valid) {
      res.status(400).json({ message: validation.message });
      return;
    }

    const result = await prisma.bUMDesPoster.updateMany({
      where: {
        id: req.params.id,
        isPublished: false
      },
      data: validation.data
    });

    if (result.count === 0) {
      res.status(404).json({
        message: 'Poster belum terbit tidak ditemukan'
      });
      return;
    }

    res.json({ message: 'Poster berhasil diperbarui' });
  } catch (error) {
    console.error('Update poster error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// DELETE /api/v1/posters/:id
// Menghapus catatan poster, bukan berkas gambarnya.
postersRouter.delete('/:id', async (req, res) => {
  try {
    const result = await prisma.bUMDesPoster.deleteMany({
      where: {
        id: req.params.id,
        isPublished: false
      }
    });

    if (result.count === 0) {
      res.status(404).json({
        message: 'Poster belum terbit tidak ditemukan'
      });
      return;
    }

    res.json({ message: 'Poster berhasil dihapus' });
  } catch (error) {
    console.error('Delete poster error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});