import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { requireAdministrator } from '../middleware/auth';

export const usersRouter = Router();

// Seluruh endpoint hanya dapat diakses Administrator.
usersRouter.use(requireAdministrator);

// Password hash tidak dikirim ke frontend.
const publicFields = {
  id: true,
  username: true,
  displayName: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
} as const;

// GET /api/v1/users — daftar pegawai.
usersRouter.get('/', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'ADMINISTRATOR' },
      select: publicFields,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ users });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// POST /api/v1/users — tambah akun pegawai.
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
        role === 'ADMINISTRATOR'
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

// PATCH /api/v1/users/:id — ubah nama atau status aktif.
usersRouter.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const input = req.body;

    if (
      !input ||
      typeof input !== 'object' ||
      Array.isArray(input)
    ) {
      res.status(400).json({ message: 'Input tidak valid' });
      return;
    }

    const keys = Object.keys(input);

    if (
      keys.length === 0 ||
      keys.some(key => !['displayName', 'isActive'].includes(key))
    ) {
      res.status(400).json({
        message: 'Hanya displayName dan isActive yang dapat diubah'
      });
      return;
    }

    const data: {
      displayName?: string;
      isActive?: boolean;
    } = {};

    if ('displayName' in input) {
      if (
        typeof input.displayName !== 'string' ||
        input.displayName.trim().length < 2 ||
        input.displayName.trim().length > 100
      ) {
        res.status(400).json({
          message: 'Nama harus berisi 2–100 karakter'
        });
        return;
      }

      data.displayName = input.displayName.trim();
    }

    if ('isActive' in input) {
      if (typeof input.isActive !== 'boolean') {
        res.status(400).json({
          message: 'isActive harus berupa boolean'
        });
        return;
      }

      data.isActive = input.isActive;
    }

    // Administrator tidak dapat menonaktifkan dirinya sendiri.
    if (
      id === res.locals.currentUser.id &&
      data.isActive === false
    ) {
      res.status(400).json({
        message: 'Tidak dapat menonaktifkan akun sendiri'
      });
      return;
    }

    // Perubahan akun dan pencabutan sesi dilakukan bersama.
    const user = await prisma.$transaction(async tx => {
      const updated = await tx.user.update({
        where: { id, role: 'ADMINISTRATOR' },
        data,
        select: publicFields
      });

      if (data.isActive === false) {
        await tx.session.deleteMany({
          where: { userId: id }
        });
      }

      return updated;
    });

    res.json({
      message: 'Data pegawai berhasil diperbarui',
      user
    });
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      res.status(404).json({
        message: 'Pegawai tidak ditemukan'
      });
      return;
    }

    console.error('Update user error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});
