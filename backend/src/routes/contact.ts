import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { prisma } from '../lib/prisma';
import { requireAdministrator } from '../middleware/auth';
import type { ContactMessageStatus } from '../../generated/prisma/enums';

export const contactRouter = Router();
export const messagesRouter = Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Terlalu banyak pengiriman pesan. Coba lagi nanti.'
  }
});

const statusMap = {
  New: 'NEW',
  'In Progress': 'IN_PROGRESS',
  Completed: 'COMPLETED'
} as const;

function serializeMessage<
  T extends { status: ContactMessageStatus }
>(item: T) {
  const labels = {
    NEW: 'New',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed'
  } as const;

  return {
    ...item,
    status: labels[item.status]
  };
}

// POST /api/v1/contact — boleh tanpa login.
contactRouter.post('/', contactLimiter, async (req, res) => {
  try {
    const input = req.body;

    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      res.status(400).json({ message: 'Input tidak valid' });
      return;
    }

    const values = input as Record<string, unknown>;
    const allowed = ['name', 'email', 'message'];

    if (Object.keys(values).some(key => !allowed.includes(key))) {
      res.status(400).json({
        message: 'Ada field yang tidak diizinkan'
      });
      return;
    }

    const limits = {
      name: 100,
      message: 10000
    } as const;

    const data = {
      name: '',
      message: ''
    };

    for (
      const field of Object.keys(limits) as Array<keyof typeof limits>
    ) {
      const value = values[field];

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

    if (
      typeof values.email !== 'string' ||
      values.email.trim().length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
    ) {
      res.status(400).json({ message: 'Email tidak valid' });
      return;
    }

    await prisma.contactMessage.create({
      data: {
        ...data,
        // Internal email heading; citizens no longer provide a subject.
        subject: 'Pesan masyarakat',
        email: values.email.trim(),
        status: 'NEW'
      }
    });

    // Tidak mengembalikan isi pesan atau identitas pengirim.
    res.status(201).json({
      message: 'Pesan berhasil disimpan'
    });
  } catch (error) {
    console.error('Create contact message error:', error);
    res.status(500).json({ message: 'Gagal menyimpan pesan' });
  }
});

// Seluruh pengelolaan pesan sementara khusus Administrator.
messagesRouter.use(requireAdministrator);

// GET /api/v1/messages
messagesRouter.get('/', async (_req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      take: 100
    });

    res.json({
      messages: messages.map(serializeMessage)
    });
  } catch (error) {
    console.error('List messages error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// PATCH /api/v1/messages/:id
messagesRouter.patch('/:id', async (req, res) => {
  try {
    const input = req.body;

    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      res.status(400).json({ message: 'Input tidak valid' });
      return;
    }

    const values = input as Record<string, unknown>;
    const keys = Object.keys(values);
    const status = values.status;

    if (
      keys.length !== 1 ||
      keys[0] !== 'status' ||
      typeof status !== 'string' ||
      !Object.hasOwn(statusMap, status)
    ) {
      res.status(400).json({
        message: 'Kirim status: New, In Progress, atau Completed'
      });
      return;
    }

    const message = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: {
        status: statusMap[status as keyof typeof statusMap]
      }
    });

    res.json({
      message: 'Status pesan berhasil diperbarui',
      contactMessage: serializeMessage(message)
    });
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      res.status(404).json({ message: 'Pesan tidak ditemukan' });
      return;
    }

    console.error('Update message error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// DELETE /api/v1/messages/:id
messagesRouter.delete('/:id', async (req, res) => {
  try {
    const result = await prisma.contactMessage.deleteMany({
      where: { id: req.params.id }
    });

    if (result.count === 0) {
      res.status(404).json({ message: 'Pesan tidak ditemukan' });
      return;
    }

    res.json({ message: 'Pesan berhasil dihapus' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});
