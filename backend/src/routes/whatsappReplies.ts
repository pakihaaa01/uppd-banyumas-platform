import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAdministrator } from '../middleware/auth';

export const whatsappRepliesRouter = Router();
whatsappRepliesRouter.use(requireAdministrator);

// This endpoint records the administrator's confirmation, NOT WhatsApp delivery confirmation.
whatsappRepliesRouter.post('/:id/confirm-sent', async (req, res) => {
  try {
    const message = await prisma.contactMessage.findUnique({ where: { id: req.params.id } });
    if (!message) { res.status(404).json({ message: 'Pesan tidak ditemukan.' }); return; }
    if (!message.phone || !message.whatsappOptIn) {
      res.status(403).json({ message: 'Nomor dan persetujuan WhatsApp diperlukan.' }); return;
    }
    if (message.whatsappSentAt) {
      res.status(409).json({ message: 'Balasan WhatsApp sudah dicatat sebagai terkirim.' }); return;
    }
    await prisma.contactMessage.update({
      where: { id: message.id },
      data: {
        status: 'COMPLETED',
        whatsappSentAt: new Date(),
        whatsappMessageId: null,
        whatsappLastError: null
      }
    });
    res.json({ message: 'Pengiriman WhatsApp ditandai selesai secara manual oleh petugas (bukan verifikasi dari WhatsApp).' });
  } catch (error) {
    console.error('Confirm WhatsApp send error:', error);
    res.status(500).json({ message: 'Gagal mencatat konfirmasi WhatsApp.' });
  }
});
