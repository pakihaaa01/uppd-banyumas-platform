import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAdministrator } from '../middleware/auth';

export const archivesRouter = Router();

archivesRouter.use(requireAdministrator);

type ArchiveData = {
  title?: string;
  description?: string;
  image?: string;
};

type ValidationResult =
  | { valid: true; data: ArchiveData }
  | { valid: false; message: string };

// Menerima URL HTTP/HTTPS atau path aset lokal /images/...
function isValidImage(value: string): boolean {
  if (value.startsWith('/images/')) {
    return /^\/images\/[a-zA-Z0-9/_-]+\.(png|jpe?g|webp|gif)$/i.test(value);
  }

  try {
    const url = new URL(value);

    return (
      ['https:', 'http:'].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function validateArchive(
  input: unknown,
  partial: boolean
): ValidationResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, message: 'Input tidak valid' };
  }

  const values = input as Record<string, unknown>;
  const allowed = ['title', 'description', 'image'];
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

  const data: ArchiveData = {};

  const limits = {
    title: 200,
    description: 5000
  } as const;

  for (
    const field of Object.keys(limits) as Array<keyof typeof limits>
  ) {
    if (partial && !Object.hasOwn(values, field)) continue;

    const value = values[field];

    if (
      typeof value !== 'string' ||
      value.trim().length === 0 ||
      value.trim().length > limits[field]
    ) {
      return {
        valid: false,
        message: `${field} wajib diisi, maksimal ${limits[field]} karakter`
      };
    }

    data[field] = value.trim();
  }

  if (!partial || Object.hasOwn(values, 'image')) {
    const value = values.image;

    if (
      typeof value !== 'string' ||
      value.trim().length > 2048 ||
      !isValidImage(value.trim())
    ) {
      return {
        valid: false,
        message:
          'image harus berupa URL HTTP/HTTPS tanpa kredensial atau path /images/ dengan ekstensi png, jpg, jpeg, webp, atau gif'
      };
    }

    data.image = value.trim();
  }

  return { valid: true, data };
}

// GET /api/v1/archives
archivesRouter.get('/', async (_req, res) => {
  try {
    const archives = await prisma.visualArchive.findMany({
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      take: 100
    });

    res.json({ archives });
  } catch (error) {
    console.error('List archives error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// POST /api/v1/archives
archivesRouter.post('/', async (req, res) => {
  try {
    const validation = validateArchive(req.body, false);

    if (!validation.valid) {
      res.status(400).json({ message: validation.message });
      return;
    }

    const data = validation.data;

    if (
      data.title === undefined ||
      data.description === undefined ||
      data.image === undefined
    ) {
      res.status(400).json({ message: 'Data arsip belum lengkap' });
      return;
    }

    const archive = await prisma.visualArchive.create({
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        isPublished: false
      }
    });

    res.status(201).json({
      message: 'Arsip visual berhasil dibuat',
      archive
    });
  } catch (error) {
    console.error('Create archive error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// PATCH /api/v1/archives/:id
archivesRouter.patch('/:id', async (req, res) => {
  try {
    const validation = validateArchive(req.body, true);

    if (!validation.valid) {
      res.status(400).json({ message: validation.message });
      return;
    }

    const result = await prisma.visualArchive.updateMany({
      where: {
        id: req.params.id,
        isPublished: false
      },
      data: validation.data
    });

    if (result.count === 0) {
      res.status(404).json({
        message: 'Arsip belum terbit tidak ditemukan'
      });
      return;
    }

    res.json({ message: 'Arsip visual berhasil diperbarui' });
  } catch (error) {
    console.error('Update archive error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// DELETE /api/v1/archives/:id
// Hanya menghapus catatan database, bukan berkas gambar.
archivesRouter.delete('/:id', async (req, res) => {
  try {
    const result = await prisma.visualArchive.deleteMany({
      where: {
        id: req.params.id,
        isPublished: false
      }
    });

    if (result.count === 0) {
      res.status(404).json({
        message: 'Arsip belum terbit tidak ditemukan'
      });
      return;
    }

    res.json({ message: 'Arsip visual berhasil dihapus' });
  } catch (error) {
    console.error('Delete archive error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});