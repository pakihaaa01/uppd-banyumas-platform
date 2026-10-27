import type { Request, Response, NextFunction } from 'express';
import { createHash } from 'node:crypto';
import { prisma } from '../lib/prisma';

// Memeriksa sesi untuk seluruh peran pegawai.
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies?.uppd_session;

    if (typeof token !== 'string') {
      res.status(401).json({ message: 'Belum login' });
      return;
    }

    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');

    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (
      !session ||
      session.expiresAt <= new Date() ||
      !session.user.isActive || session.user.role !== 'ADMINISTRATOR'
    ) {
      res.status(401).json({ message: 'Sesi tidak valid' });
      return;
    }

    res.locals.currentUser = {
      id: session.user.id,
      username: session.user.username,
      role: session.user.role
    };

    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
}

// Tetap digunakan oleh router manajemen pegawai.
export function requireAdministrator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  return requireAuth(req, res, () => {
    if (res.locals.currentUser.role !== 'ADMINISTRATOR') {
      res.status(403).json({
        message: 'Akses khusus Administrator'
      });
      return;
    }

    next();
  });
}
