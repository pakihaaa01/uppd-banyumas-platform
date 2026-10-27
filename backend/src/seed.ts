
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma';

const accounts = [{ username: 'admin.demo', displayName: 'Administrator Demo', role: 'ADMINISTRATOR' }] as const;

async function main() {
  const password = process.env.DEMO_PASSWORD;

  if (!password || password.length < 12) {
    throw new Error('Password demo minimal 12 karakter');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  for (const account of accounts) {
    await prisma.user.upsert({
      where: {
        username: account.username
      },
      update: {
        displayName: account.displayName,
        role: account.role,
        isActive: true,
        passwordHash: passwordHash
      },
      create: {
        username: account.username,
        displayName: account.displayName,
        role: account.role,
        isActive: true,
        passwordHash: passwordHash
      }
    });

    console.log(`Akun siap: ${account.username}`);
  }

  const total = await prisma.user.count();
  console.log(`Total akun dalam database: ${total}`);
}

main()
  .catch((error) => {
    console.error('Seed gagal:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

