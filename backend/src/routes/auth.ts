
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'node:crypto';
import { rateLimit } from 'express-rate-limit';
import { prisma } from '../lib/prisma';

export const authRouter = Router();

const COOKIE_NAME = 'uppd_session';
const SESSION_DURATION = 8 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: false, // Hanya untuk localhost HTTP
  sameSite: 'lax' as const,
  path: '/'
};

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Terlalu banyak percobaan login' }
});

// Login pegawai
authRouter.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body ?? {};

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      username.length > 100 ||
      password.length > 256
    ) {
      res.status(400).json({ message: 'Input tidak valid' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    const valid = user?.isActive
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!user || !valid) {
      res.status(401).json({
        message: 'Username atau password salah'
      });
      return;
    }

    const token = randomBytes(32).toString('hex');

    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + SESSION_DURATION)
      }
    });

    res.cookie(COOKIE_NAME, token, {
      ...cookieOptions,
      maxAge: SESSION_DURATION
    });

    res.json({
      message: 'Login berhasil',
      user: {
        username: user.username,
        displayName: user.displayName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// Periksa sesi pegawai
authRouter.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (typeof token !== 'string') {
      res.status(401).json({ message: 'Belum login' });
      return;
    }

    const session = await prisma.session.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true }
    });

    if (
      !session ||
      session.expiresAt <= new Date() ||
      !session.user.isActive
    ) {
      res.status(401).json({ message: 'Sesi tidak valid' });
      return;
    }

    res.json({
      user: {
        id: session.user.id,
        username: session.user.username,
        displayName: session.user.displayName,
        role: session.user.role
      }
    });
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// Logout pegawai
authRouter.post('/logout', async (req, res) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (typeof token === 'string') {
      await prisma.session.deleteMany({
        where: { tokenHash: hashToken(token) }
      });
    }

    res.clearCookie(COOKIE_NAME, cookieOptions);
    res.json({ message: 'Logout berhasil' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});
