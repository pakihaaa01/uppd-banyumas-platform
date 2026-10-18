import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAdministrator } from '../middleware/auth';

export const chatbotRouter = Router();

chatbotRouter.use(requireAdministrator);

const textLimits = {
  question: 500,
  answer: 20000,
  category: 100
} as const;

type ChatbotData = {
  question?: string;
  answer?: string;
  category?: string;
  keywords?: string[];
};

type ValidationResult =
  | { valid: true; data: ChatbotData }
  | { valid: false; message: string };

function validateChatbot(
  input: unknown,
  partial: boolean
): ValidationResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, message: 'Input tidak valid' };
  }

  const values = input as Record<string, unknown>;
  const allowed = [...Object.keys(textLimits), 'keywords'];
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

  const data: ChatbotData = {};

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

  if (!partial || Object.hasOwn(values, 'keywords')) {
    const keywords = values.keywords;

    if (
      !Array.isArray(keywords) ||
      keywords.length === 0 ||
      keywords.length > 20
    ) {
      return {
        valid: false,
        message: 'keywords harus berupa array berisi 1–20 kata kunci'
      };
    }

    const normalized: string[] = [];

    for (const keyword of keywords) {
      if (
        typeof keyword !== 'string' ||
        keyword.trim().length === 0 ||
        keyword.trim().length > 100
      ) {
        return {
          valid: false,
          message: 'Setiap kata kunci wajib berupa teks 1–100 karakter'
        };
      }

      normalized.push(keyword.trim().toLowerCase());
    }

    data.keywords = [...new Set(normalized)];
  }

  return { valid: true, data };
}

// GET /api/v1/chatbot
chatbotRouter.get('/', async (_req, res) => {
  try {
    const chatbot = await prisma.chatbotFAQ.findMany({
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      take: 100
    });

    res.json({ chatbot });
  } catch (error) {
    console.error('List chatbot FAQs error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// POST /api/v1/chatbot
chatbotRouter.post('/', async (req, res) => {
  try {
    const validation = validateChatbot(req.body, false);

    if (!validation.valid) {
      res.status(400).json({ message: validation.message });
      return;
    }

    const data = validation.data;

    if (
      data.question === undefined ||
      data.answer === undefined ||
      data.category === undefined ||
      data.keywords === undefined
    ) {
      res.status(400).json({
        message: 'Data jawaban chatbot belum lengkap'
      });
      return;
    }

    const chatbotFAQ = await prisma.chatbotFAQ.create({
      data: {
        question: data.question,
        answer: data.answer,
        category: data.category,
        keywords: data.keywords,
        isEnabled: false,
        clickCount: 0
      }
    });

    res.status(201).json({
      message: 'Jawaban chatbot berhasil dibuat',
      chatbotFAQ
    });
  } catch (error) {
    console.error('Create chatbot FAQ error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// PATCH /api/v1/chatbot/:id
chatbotRouter.patch('/:id', async (req, res) => {
  try {
    const validation = validateChatbot(req.body, true);

    if (!validation.valid) {
      res.status(400).json({ message: validation.message });
      return;
    }

    const result = await prisma.chatbotFAQ.updateMany({
      where: {
        id: req.params.id,
        isEnabled: false
      },
      data: validation.data
    });

    if (result.count === 0) {
      res.status(404).json({
        message: 'Jawaban chatbot nonaktif tidak ditemukan'
      });
      return;
    }

    res.json({
      message: 'Jawaban chatbot berhasil diperbarui'
    });
  } catch (error) {
    console.error('Update chatbot FAQ error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// DELETE /api/v1/chatbot/:id
chatbotRouter.delete('/:id', async (req, res) => {
  try {
    const result = await prisma.chatbotFAQ.deleteMany({
      where: {
        id: req.params.id,
        isEnabled: false
      }
    });

    if (result.count === 0) {
      res.status(404).json({
        message: 'Jawaban chatbot nonaktif tidak ditemukan'
      });
      return;
    }

    res.json({
      message: 'Jawaban chatbot berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete chatbot FAQ error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});