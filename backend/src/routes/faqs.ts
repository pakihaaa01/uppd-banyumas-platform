import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAdministrator } from '../middleware/auth';

export const faqsRouter = Router();

faqsRouter.use(requireAdministrator);

const textLimits = {
  question: 500,
  answer: 20000,
  category: 100
} as const;

type FAQData = {
  question?: string;
  answer?: string;
  category?: string;
  isPopular?: boolean;
};

type ValidationResult =
  | { valid: true; data: FAQData }
  | { valid: false; message: string };

function validateFAQ(
  input: unknown,
  partial: boolean
): ValidationResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, message: 'Input tidak valid' };
  }

  const values = input as Record<string, unknown>;
  const allowed = [...Object.keys(textLimits), 'isPopular'];
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

  const data: FAQData = {};

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

  if (Object.hasOwn(values, 'isPopular')) {
    if (typeof values.isPopular !== 'boolean') {
      return {
        valid: false,
        message: 'isPopular harus berupa boolean'
      };
    }

    data.isPopular = values.isPopular;
  }

  return { valid: true, data };
}

// GET /api/v1/faqs
faqsRouter.get('/', async (_req, res) => {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      take: 100
    });

    res.json({ faqs });
  } catch (error) {
    console.error('List FAQs error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// POST /api/v1/faqs
faqsRouter.post('/', async (req, res) => {
  try {
    const validation = validateFAQ(req.body, false);

    if (!validation.valid) {
      res.status(400).json({ message: validation.message });
      return;
    }

    const data = validation.data;

    if (
      data.question === undefined ||
      data.answer === undefined ||
      data.category === undefined
    ) {
      res.status(400).json({ message: 'Data FAQ belum lengkap' });
      return;
    }

    const faq = await prisma.fAQ.create({
      data: {
        question: data.question,
        answer: data.answer,
        category: data.category,
        isPopular: data.isPopular ?? false,
        isEnabled: false,
        viewCount: 0
      }
    });

    res.status(201).json({
      message: 'FAQ berhasil dibuat',
      faq
    });
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// PATCH /api/v1/faqs/:id
// FAQ aktif belum dapat diedit melalui endpoint ini.
faqsRouter.patch('/:id', async (req, res) => {
  try {
    const validation = validateFAQ(req.body, true);

    if (!validation.valid) {
      res.status(400).json({ message: validation.message });
      return;
    }

    const result = await prisma.fAQ.updateMany({
      where: {
        id: req.params.id,
        isEnabled: false
      },
      data: validation.data
    });

    if (result.count === 0) {
      res.status(404).json({
        message: 'FAQ nonaktif tidak ditemukan'
      });
      return;
    }

    res.json({ message: 'FAQ berhasil diperbarui' });
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// DELETE /api/v1/faqs/:id
faqsRouter.delete('/:id', async (req, res) => {
  try {
    const result = await prisma.fAQ.deleteMany({
      where: {
        id: req.params.id,
        isEnabled: false
      }
    });

    if (result.count === 0) {
      res.status(404).json({
        message: 'FAQ nonaktif tidak ditemukan'
      });
      return;
    }

    res.json({ message: 'FAQ berhasil dihapus' });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

faqsRouter.post('/:id/enable', async (req, res) => {
  try {
    const result = await prisma.fAQ.updateMany({
      where: { id: req.params.id, isEnabled: false },
      data: { isEnabled: true }
    });
    if (!result.count) { res.status(404).json({message:'FAQ nonaktif tidak ditemukan'}); return; }
    res.json({message:'FAQ ditampilkan di website publik'});
  } catch(error) {console.error(error);res.status(500).json({message:'Gagal menampilkan FAQ'});}
});
faqsRouter.post('/:id/disable', async (req, res) => {
  try {
    const result = await prisma.fAQ.updateMany({
      where: { id: req.params.id, isEnabled: true },
      data: { isEnabled: false }
    });
    if (!result.count) { res.status(404).json({message:'FAQ aktif tidak ditemukan'}); return; }
    res.json({message:'FAQ disembunyikan dari website publik'});
  } catch(error) {console.error(error);res.status(500).json({message:'Gagal menyembunyikan FAQ'});}
});

