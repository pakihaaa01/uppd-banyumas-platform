import { prisma } from './prisma';

export async function expireAnnouncements(now = new Date()) {
  return prisma.announcement.updateMany({
    where: { status: 'PUBLISHED', notificationExpiresAt: { lte: now } },
    data: { status: 'DRAFT', publishedAt: null }
  });
}

export function startAnnouncementExpiry() {
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try { await expireAnnouncements(); }
    catch (error) { console.error('Announcement expiry failed:', error); }
    finally { running = false; }
  };
  void run();
  const timer = setInterval(() => { void run(); }, 15_000);
  timer.unref();
  return timer;
}
