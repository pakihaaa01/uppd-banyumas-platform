import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const publicRouter = Router();

// Pengumuman yang sudah diterbitkan.
publicRouter.get('/announcements', async (_req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() }
      },
      select: {
        id: true,
        title: true,
        date: true,
        category: true,
        shortDescription: true,
        content: true,
        isNew: true,
        isImportant: true,
        showInNotifications: true,
        notificationExpiresAt: true,
        updatedAt: true
      },
      orderBy: [
        { date: 'desc' },
        { id: 'desc' }
      ],
      take: 100
    });

    res.json({
      announcements: announcements.map(item => ({
        ...item,
        date: item.date.toISOString().slice(0, 10)
      }))
    });
  } catch (error) {
    console.error('Public announcements error:', error);
    res.status(500).json({
      message: 'Gagal mengambil pengumuman'
    });
  }
});

// Lokasi layanan yang sudah diterbitkan.
publicRouter.get('/locations', async (_req, res) => {
  try {
    const locations = await prisma.serviceLocation.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        name: true,
        address: true,
        operatingHours: true,
        phone: true,
        whatsapp: true, email: true, serviceSchedule: true,
        mapsUrl: true,
        mapsEmbedUrl: true,
        isMain: true,
        isDriveThru: true,
        type: true,
        description: true
      },
      orderBy: [
        { isMain: 'desc' },
        { name: 'asc' },
        { id: 'asc' }
      ],
      take: 100
    });

    res.json({
      locations: locations.map(item => ({
        ...item,
        type: item.type === 'drive_thru'
          ? 'drive-thru'
          : item.type,
        mapsEmbedUrl: item.mapsEmbedUrl ?? undefined,
        description: item.description ?? undefined
      }))
    });
  } catch (error) {
    console.error('Public locations error:', error);
    res.status(500).json({
      message: 'Gagal mengambil lokasi layanan'
    });
  }
});

// FAQ yang sudah diaktifkan.
publicRouter.get('/faqs', async (_req, res) => {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { isEnabled: true },
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
        viewCount: true,
        isPopular: true,
        isEnabled: true
      },
      orderBy: [
        { isPopular: 'desc' },
        { question: 'asc' },
        { id: 'asc' }
      ],
      take: 100
    });

    res.json({ faqs });
  } catch (error) {
    console.error('Public FAQs error:', error);
    res.status(500).json({
      message: 'Gagal mengambil FAQ'
    });
  }
});

// Jawaban chatbot yang sudah diaktifkan.
publicRouter.get('/chatbot', async (_req, res) => {
  try {
    const chatbot = await prisma.chatbotFAQ.findMany({
      where: { isEnabled: true },
      select: {
        id: true,
        question: true,
        answer: true,
        keywords: true,
        category: true,
        isEnabled: true,
        clickCount: true
      },
      orderBy: [
        { question: 'asc' },
        { id: 'asc' }
      ],
      take: 100
    });

    res.json({ chatbot });
  } catch (error) {
    console.error('Public chatbot error:', error);
    res.status(500).json({
      message: 'Gagal mengambil jawaban chatbot'
    });
  }
});
publicRouter.get('/archive', async (_req, res) => {
  try {
    const archive = await prisma.visualArchive.findMany({
      where: { isPublished: true },
      select: { id: true, title: true, description: true, image: true },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ archive });
  } catch (error) {
    console.error('Public archive error:', error);
    res.status(500).json({ message: 'Gagal memuat dokumentasi publik' });
  }
});

