import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { requireAdministrator } from '../middleware/auth';

export const usersRouter = Router();

// Semua endpoint dalam router ini khusus Administrator.
usersRouter.use(requireAdministrator);

// Hanya field aman yang dikirim ke frontend.
const publicFields = {
  id: true,
  username: true,
  displayName: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
} as const;

// Daftar pegawai.
usersRouter.get('/', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: publicFields,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ users });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// Tambah akun pegawai.
usersRouter.post('/', async (req, res) => {
  try {
    const { username, displayName, password, role } = req.body ?? {};

    if (
      typeof username !== 'string' ||
      !/^[a-z0-9._-]{3,100}$/.test(username) ||
      typeof displayName !== 'string' ||
      displayName.trim().length < 2 ||
      displayName.trim().length > 100 ||
      typeof password !== 'string' ||
      password.length < 12 ||
      password.length > 256 ||
      Buffer.byteLength(password, 'utf8') > 72 ||
      !(
        role === 'ADMINISTRATOR' ||
        role === 'OPERATOR' ||
        role === 'PENANGGUNG_JAWAB'
      )
    ) {
      res.status(400).json({
        message:
          'Input tidak valid. Username 3–100 karakter huruf kecil, angka, titik, garis bawah, atau tanda hubung. Nama 2–100 karakter. Password minimal 12 karakter dan maksimal 72 byte. Peran harus sesuai pilihan.'
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        displayName: displayName.trim(),
        passwordHash,
        role
      },
      select: publicFields
    });

    res.status(201).json({
      message: 'Akun pegawai berhasil dibuat',
      user
    });
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      res.status(409).json({
        message: 'Username sudah digunakan'
      });
      return;
    }

    console.error('Create user error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});