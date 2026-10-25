import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAdministrator } from '../middleware/auth';

export const whatsappRepliesRouter = Router();
whatsappRepliesRouter.use(requireAdministrator);

function normalizePhone(input: string): string | null {
  const s = input.replace(/[\s().-]/g, '');
  const digits = s.startsWith('+') ? s.slice(1) : s.startsWith('0') ? '62' + s.slice(1) : s;
  if (!/^62\d{8,13}$/.test(digits)) return null;
  return digits;
}

// Only Meta-approved templates can initiate contact from a website form.
// Form submission is not an inbound WhatsApp message; it does not open a 24h service window.
whatsappRepliesRouter.post('/:id/send', async (req, res) => {
  try {
    const message = await prisma.contactMessage.findUnique({ where: { id: req.params.id } });
    if (!message) { res.status(404).json({ message: 'Pesan tidak ditemukan' }); return; }
    if (!message.whatsappOptIn) { res.status(403).json({ message: 'Pengirim belum memberikan persetujuan menerima balasan WhatsApp.' }); return; }
    if (message.whatsappSentAt) { res.status(409).json({ message: 'Balasan WhatsApp sudah dikirim sebelumnya.' }); return; }
    const to = message.phone ? normalizePhone(message.phone) : null;
    if (!to) { res.status(400).json({ message: 'Nomor telepon tidak valid. Gunakan nomor Indonesia, misalnya 08xxxxxxxxxx.' }); return; }

    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const template = process.env.WHATSAPP_TEMPLATE_NAME;
    const language = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'id';
    const version = process.env.WHATSAPP_GRAPH_VERSION || 'v23.0';
    if (!token || !phoneNumberId || !template) {
      res.status(503).json({ message: 'WhatsApp Cloud API belum dikonfigurasi di .env backend.' }); return;
    }
    if (!/^v\d+\.\d+$/.test(version) || !/^\d+$/.test(phoneNumberId) || !/^[a-z0-9_]+$/.test(template) || !/^[a-z]{2}(?:_[A-Z]{2})?$/.test(language)) {
      res.status(500).json({ message: 'Format konfigurasi WhatsApp Cloud API tidak valid.' }); return;
    }
    // Template must be approved in Meta and have no required parameters.
    const response = await fetch('https://graph.facebook.com/' + version + '/' + phoneNumberId + '/messages', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: { name: template, language: { code: language } }
      }),
      signal: AbortSignal.timeout(20000)
    });
    const result = await response.json().catch(() => ({})) as {
      messages?: Array<{ id?: string }>;
      error?: { code?: number; error_subcode?: number; message?: string };
    };
    const sentId = result.messages?.[0]?.id;
    if (!response.ok || !sentId) {
      const reason = 'Meta WhatsApp menolak permintaan (HTTP ' + response.status +
        (result.error?.code ? ', kode ' + result.error.code : '') + ').';
      await prisma.contactMessage.update({ where: { id: message.id }, data: { whatsappLastError: reason } });
      res.status(502).json({ message: reason }); return;
    }
    await prisma.contactMessage.update({
      where: { id: message.id },
      data: {
        status: 'COMPLETED',
        whatsappSentAt: new Date(),
        whatsappMessageId: sentId,
        whatsappLastError: null
      }
    });
    res.json({ message: 'Template diterima WhatsApp Cloud API; pengiriman ke penerima belum terkonfirmasi.', whatsappMessageId: sentId });
  } catch (error) {
    console.error('WhatsApp send error:', error instanceof Error ? error.message : 'unknown');
    res.status(502).json({ message: 'Pengiriman WhatsApp gagal. Periksa log backend.' });
  }
});
