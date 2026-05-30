import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Enkripsi password agar aman dan sinkron dengan API Login
  const hashedPassword = await bcrypt.hash("passwordAdmin123", 10);

  // 2. Insert data admin ke database (Disesuaikan dengan schema.prisma kamu tanpa field role)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      nama: 'Rappizr Admin',
      password: hashedPassword,
    },
  });

  console.log(`✅ Sukses membuat user admin: ${admin.email}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });