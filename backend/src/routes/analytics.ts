import { Router } from 'express';
import { createSign } from 'node:crypto';
import { requireAdministrator } from '../middleware/auth';

export const analyticsRouter = Router();

analyticsRouter.use(requireAdministrator);

type AccessToken = {
  value: string;
  until: number;
};

type Report = {
  rows?: {
    dimensionValues?: { value?: string }[];
    metricValues?: { value?: string }[];
  }[];
};

type GoogleErrorDetail = {
  '@type'?: string;
  reason?: string;
  metadata?: {
    service?: string;
    consumer?: string;
  };
};

type GoogleErrorResponse = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
    details?: GoogleErrorDetail[];
  };
};

let token: AccessToken | null = null;

const cache = new Map<
  string,
  { until: number; value: unknown }
>();

const pending = new Map<string, Promise<unknown>>();

function configuration() {
  return {
    property: process.env.GA_PROPERTY_ID ?? '',
    email: process.env.GA_CLIENT_EMAIL ?? '',
    key: (process.env.GA_PRIVATE_KEY ?? '').replace(/\\n/g, '\n')
  };
}

// Mengambil OAuth access token menggunakan service account.
async function accessToken(): Promise<string> {
  if (token && token.until > Date.now()) {
    return token.value;
  }

  const config = configuration();
  const now = Math.floor(Date.now() / 1000);

  const encode = (value: object): string =>
    Buffer.from(JSON.stringify(value)).toString('base64url');

  const header = encode({
    alg: 'RS256',
    typ: 'JWT'
  });

  const payload = encode({
    iss: config.email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  });

  const unsigned = `${header}.${payload}`;

  const signature = createSign('RSA-SHA256')
    .update(unsigned)
    .sign(config.key, 'base64url');

  const response = await fetch(
    'https://oauth2.googleapis.com/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: `${unsigned}.${signature}`
      }),
      signal: AbortSignal.timeout(15000)
    }
  );

  const data = await response.json() as {
    access_token?: string;
    expires_in?: number;
  };

  if (!response.ok || !data.access_token) {
    console.error('[GA4 OAUTH ERROR]', {
      httpStatus: response.status,
      message: 'Permintaan token OAuth ditolak'
    });

    throw new Error(
      'Autentikasi statistik belum berhasil. Hubungi pengelola website.'
    );
  }

  token = {
    value: data.access_token,
    until:
      Date.now() +
      Math.max(
        0,
        Math.min(data.expires_in ?? 3600, 3600) - 60
      ) * 1000
  };

  return token.value;
}

// Mengirim permintaan ke Google Analytics Data API.
async function report(
  method: string,
  body: object
): Promise<Report> {
  const property = configuration().property;

  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${property}:${method}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await accessToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000)
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      token = null;
    }

    const raw = await response.text();

    let googleMessage = 'Tidak ada detail dari Google';
    let googleStatus = 'UNKNOWN';
    let googleReason = 'UNKNOWN';
    let googleService = 'UNKNOWN';
    let googleConsumer = 'UNKNOWN';

    try {
      const data = JSON.parse(raw) as GoogleErrorResponse;
      const error = data.error;

      googleMessage = error?.message ?? googleMessage;
      googleStatus = error?.status ?? googleStatus;

      const details = error?.details ?? [];

      const info = details.find(
        (item) =>
          item['@type'] ===
          'type.googleapis.com/google.rpc.ErrorInfo'
      );

      googleReason = info?.reason ?? 'UNKNOWN';
      googleService = info?.metadata?.service ?? 'UNKNOWN';
      googleConsumer = info?.metadata?.consumer ?? 'UNKNOWN';
    } catch {
      googleMessage = 'Respons error Google tidak berbentuk JSON';
    }

    // Diagnostik hanya di server, tanpa mencetak token atau private key.
    console.error('[GA4 DATA API ERROR]', {
      method,
      httpStatus: response.status,
      googleStatus,
      googleReason,
      googleService,
      googleConsumer,
      googleMessage
    });

    if (response.status === 403) {
      throw new Error(
        'Akses statistik belum diberikan. Hubungi pengelola website.'
      );
    }

    if (response.status === 429) {
      throw new Error(
        'Batas pembaruan statistik tercapai. Silakan coba lagi nanti.'
      );
    }

    throw new Error(
      'Statistik belum dapat diperbarui. Silakan coba lagi.'
    );
  }

  return await response.json() as Report;
}

// Mengambil nilai metrik pada baris pertama laporan.
const metrics = (reportData: Report): number[] =>
  reportData.rows?.[0]?.metricValues?.map(
    (value) => Number(value.value ?? 0)
  ) ?? [];

// Format untuk daftar halaman dan interaksi layanan.
const rows = (reportData: Report) =>
  reportData.rows?.map((row) => ({
    label: row.dimensionValues?.[0]?.value ?? '',
    value: Number(row.metricValues?.[0]?.value ?? 0)
  })) ?? [];

// Mengumpulkan statistik berdasarkan periode.
async function collect(days: number) {
  const period = {
    dateRanges: [
      {
        startDate: `${days - 1}daysAgo`,
        endDate: 'today'
      }
    ]
  };

  const [total, daily, pages, events, realtime] =
    await Promise.all([
      // Ringkasan seluruh periode.
      report('runReport', {
        ...period,
        metrics: [
          { name: 'totalUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' }
        ]
      }),

      // Tiga metrik harian untuk pilihan grafik area.
      report('runReport', {
        ...period,
        dimensions: [
          { name: 'date' }
        ],
        metrics: [
          { name: 'totalUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' }
        ],
        orderBys: [
          {
            dimension: {
              dimensionName: 'date'
            }
          }
        ]
      }),

      // Sepuluh halaman paling sering dilihat.
      report('runReport', {
        ...period,
        dimensions: [
          { name: 'pageTitle' }
        ],
        metrics: [
          { name: 'screenPageViews' }
        ],
        orderBys: [
          {
            metric: {
              metricName: 'screenPageViews'
            },
            desc: true
          }
        ],
        limit: 10
      }),

      // Interaksi layanan yang dikirim website publik.
      report('runReport', {
        ...period,
        dimensions: [
          { name: 'eventName' }
        ],
        metrics: [
          { name: 'eventCount' }
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            inListFilter: {
              values: [
                'open_chatbot',
                'open_maps',
                'open_document',
                'open_digital_service'
              ]
            }
          }
        }
      }),

      // Aktivitas realtime.
      report('runRealtimeReport', {
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' }
        ]
      })
    ]);

  const totals = metrics(total);
  const rt = metrics(realtime);

  return {
    configured: true,
    testing: process.env.GA_ENVIRONMENT !== 'production',
    updatedAt: new Date().toISOString(),
    days,
    totals: {
      users: totals[0] ?? 0,
      sessions: totals[1] ?? 0,
      views: totals[2] ?? 0
    },
    realtime: {
      users: rt[0] ?? 0,
      views: rt[1] ?? 0
    },
    daily: (daily.rows ?? []).map((row) => ({
      label: row.dimensionValues?.[0]?.value ?? '',
      users: Number(row.metricValues?.[0]?.value ?? 0),
      sessions: Number(row.metricValues?.[1]?.value ?? 0),
      views: Number(row.metricValues?.[2]?.value ?? 0)
    })),
    pages: rows(pages),
    events: rows(events)
  };
}

// Endpoint statistik khusus Administrator.
analyticsRouter.get('/', async (req, res) => {
  const days = Number(req.query.days ?? 7);

  if (![1, 7, 30].includes(days)) {
    res.status(400).json({
      message: 'Pilih periode 1, 7, atau 30 hari.'
    });
    return;
  }

  const config = configuration();

  if (
    !/^\d+$/.test(config.property) ||
    !config.email ||
    !config.key
  ) {
    res.json({
      configured: false,
      message:
        'Statistik belum terhubung. Pengelola website perlu menyelesaikan pemasangan Google Analytics.'
    });
    return;
  }

  const key = String(days);
  const cached = cache.get(key);

  if (cached && cached.until > Date.now()) {
    res.json(cached.value);
    return;
  }

  try {
    let task = pending.get(key);

    if (!task) {
      task = collect(days);
      pending.set(key, task);
    }

    const data = await task;

    cache.set(key, {
      value: data,
      until: Date.now() + 60000
    });

    res.json(data);
  } catch (error) {
    console.error('[GA4 ROUTE ERROR]', {
      message:
        error instanceof Error
          ? error.message
          : 'Kesalahan statistik tidak diketahui'
    });

    res.status(502).json({
      message:
        error instanceof Error
          ? error.message
          : 'Statistik gagal dimuat.'
    });
  } finally {
    pending.delete(key);
  }
});