import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAdministrator } from '../middleware/auth';
import type { ServiceLocationType } from '../../generated/prisma/enums';

export const locationsRouter = Router();

locationsRouter.use(requireAdministrator);

const typeMap = {
  induk: 'induk',
  pembantu: 'pembantu',
  cepat: 'cepat',
  'drive-thru': 'drive_thru',
  keliling: 'keliling',
  mpp: 'mpp',
  gerai: 'gerai',
  paten: 'paten'
} as const;

type LocationData = {
  name?: string;
  address?: string;
  operatingHours?: string;
  phone?: string;
  mapsUrl?: string;
  mapsEmbedUrl?: string | null;
  isMain?: boolean;
  isDriveThru?: boolean;
  type?: ServiceLocationType;
  description?: string | null;
};

type ValidationResult =
  | { valid: true; data: LocationData }
  | { valid: false; message: string };

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function validateLocation(
  input: unknown,
  partial: boolean
): ValidationResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, message: 'Input tidak valid' };
  }

  const values = input as Record<string, unknown>;

  const requiredLimits = {
    name: 200,
    address: 1000,
    operatingHours: 500,
    phone: 100
  } as const;

  const allowed = [
    ...Object.keys(requiredLimits),
    'mapsUrl',
    'mapsEmbedUrl',
    'isMain',
    'isDriveThru',
    'type',
    'description'
  ];

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

  const data: LocationData = {};

  for (
    const field of Object.keys(requiredLimits) as
      Array<keyof typeof requiredLimits>
  ) {
    if (partial && !Object.hasOwn(values, field)) continue;

    const value = values[field];

    if (
      typeof value !== 'string' ||
      value.trim().length === 0 ||
      value.trim().length > requiredLimits[field]
    ) {
      return {
        valid: false,
        message: `${field} wajib diisi, maksimal ${requiredLimits[field]} karakter`
      };
    }

    data[field] = value.trim();
  }

  if (!partial || Object.hasOwn(values, 'mapsUrl')) {
    const value = values.mapsUrl;

    if (
      typeof value !== 'string' ||
      value.trim().length > 2048 ||
      !isHttpUrl(value.trim())
    ) {
      return {
        valid: false,
        message: 'mapsUrl wajib berupa URL HTTP/HTTPS, maksimal 2048 karakter'
      };
    }

    data.mapsUrl = value.trim();
  }

  if (Object.hasOwn(values, 'mapsEmbedUrl')) {
    const value = values.mapsEmbedUrl;

    if (value === null || value === '') {
      data.mapsEmbedUrl = null;
    } else if (
      typeof value === 'string' &&
      value.trim().length <= 2048 &&
      isHttpUrl(value.trim())
    ) {
      data.mapsEmbedUrl = value.trim();
    } else {
      return {
        valid: false,
        message: 'mapsEmbedUrl harus berupa URL HTTP/HTTPS atau null'
      };
    }
  }

  if (Object.hasOwn(values, 'description')) {
    const value = values.description;

    if (value === null) {
      data.description = null;
    } else if (
      typeof value === 'string' &&
      value.trim().length <= 5000
    ) {
      data.description = value.trim();
    } else {
      return {
        valid: false,
        message: 'description maksimal 5000 karakter atau null'
      };
    }
  }

  for (const field of ['isMain', 'isDriveThru'] as const) {
    if (!Object.hasOwn(values, field)) continue;

    const value = values[field];

    if (typeof value !== 'boolean') {
      return {
        valid: false,
        message: `${field} harus berupa boolean`
      };
    }

    data[field] = value;
  }

  if (!partial || Object.hasOwn(values, 'type')) {
    const value = values.type;

    if (
      typeof value !== 'string' ||
      !Object.hasOwn(typeMap, value)
    ) {
      return {
        valid: false,
        message: 'Tipe lokasi tidak valid'
      };
    }

    data.type = typeMap[value as keyof typeof typeMap];
  }

  return { valid: true, data };
}

function serializeLocation<
  T extends { type: ServiceLocationType }
>(location: T) {
  return {
    ...location,
    type: location.type === 'drive_thru'
      ? 'drive-thru'
      : location.type
  };
}

// GET /api/v1/locations
locationsRouter.get('/', async (_req, res) => {
  try {
    const locations = await prisma.serviceLocation.findMany({
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      take: 100
    });

    res.json({
      locations: locations.map(serializeLocation)
    });
  } catch (error) {
    console.error('List locations error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// POST /api/v1/locations
locationsRouter.post('/', async (req, res) => {
  try {
    const validation = validateLocation(req.body, false);

    if (!validation.valid) {
      res.status(400).json({ message: validation.message });
      return;
    }

    const data = validation.data;

    if (
      data.name === undefined ||
      data.address === undefined ||
      data.operatingHours === undefined ||
      data.phone === undefined ||
      data.mapsUrl === undefined ||
      data.type === undefined
    ) {
      res.status(400).json({ message: 'Data lokasi belum lengkap' });
      return;
    }

    const location = await prisma.serviceLocation.create({
      data: {
        name: data.name,
        address: data.address,
        operatingHours: data.operatingHours,
        phone: data.phone,
        mapsUrl: data.mapsUrl,
        type: data.type,
        mapsEmbedUrl: data.mapsEmbedUrl ?? null,
        description: data.description ?? null,
        isMain: data.isMain ?? false,
        isDriveThru: data.isDriveThru ?? false,
        isPublished: false
      }
    });

    res.status(201).json({
      message: 'Lokasi layanan berhasil dibuat',
      location: serializeLocation(location)
    });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// PATCH /api/v1/locations/:id
// Hanya lokasi belum terbit yang dapat diubah pada tahap ini.
locationsRouter.patch('/:id', async (req, res) => {
  try {
    const validation = validateLocation(req.body, true);

    if (!validation.valid) {
      res.status(400).json({ message: validation.message });
      return;
    }

    const previous = await prisma.serviceLocation.findUnique({where:{id:String(req.params.id)}});
    const result = await prisma.serviceLocation.updateMany({
      where: {
        id: req.params.id,
        isPublished: false
      },
      data: {...validation.data, ...(validation.data.operatingHours !== undefined && previous?.operatingHours !== validation.data.operatingHours ? {serviceSchedule: []} : {})}
    });

    if (result.count === 0) {
      res.status(404).json({
        message: 'Lokasi belum terbit tidak ditemukan'
      });
      return;
    }

    res.json({ message: 'Lokasi layanan berhasil diperbarui' });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});

// DELETE /api/v1/locations/:id
locationsRouter.delete('/:id', async (req, res) => {
  try {
    const result = await prisma.serviceLocation.deleteMany({
      where: {
        id: req.params.id,
        isPublished: false
      }
    });

    if (result.count === 0) {
      res.status(404).json({
        message: 'Lokasi belum terbit tidak ditemukan'
      });
      return;
    }

    res.json({ message: 'Lokasi layanan berhasil dihapus' });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ message: 'Kesalahan server' });
  }
});
// Administrator dapat menerbitkan lokasi yang masih berstatus Draft.
locationsRouter.post('/:id/publish', async (req, res) => {
  try {
    const result = await prisma.serviceLocation.updateMany({
      where: { id: req.params.id, isPublished: false },
      data: { isPublished: true }
    });
    if (!result.count) {
      res.status(404).json({ message: 'Lokasi Draft tidak ditemukan atau sudah diterbitkan' });
      return;
    }
    res.json({ message: 'Titik layanan berhasil dipublikasikan' });
  } catch (error) {
    console.error('Publish location error:', error);
    res.status(500).json({ message: 'Gagal menerbitkan lokasi' });
  }
});

// Penarikan publikasi tidak menghapus data lokasi dari PostgreSQL.
locationsRouter.post('/:id/unpublish', async (req, res) => {
  try {
    const result = await prisma.serviceLocation.updateMany({
      where: { id: req.params.id, isPublished: true },
      data: { isPublished: false }
    });
    if (!result.count) {
      res.status(404).json({ message: 'Lokasi terbit tidak ditemukan atau sudah ditarik' });
      return;
    }
    res.json({ message: 'Publikasi titik layanan berhasil ditarik' });
  } catch (error) {
    console.error('Unpublish location error:', error);
    res.status(500).json({ message: 'Gagal menarik publikasi lokasi' });
  }
});

