/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt'

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];

function slugify(str) {
  return String(str)
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function main() {

  const hashAdmin   = await bcrypt.hash('admin', 10);
  const hashCliente = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@loja.dev' },
    update: { password: hashAdmin, role: 'admin', name: 'Admin' },
    create: { email: 'admin@loja.dev', password: hashAdmin, role: 'admin', name: 'Admin' },
  });

  for (let i = 1; i <= 5; i++) {
    await prisma.user.upsert({
      where: { email: `cliente${i}@loja.dev` },
      update: { password: hashCliente, role: 'customer', name: `Cliente ${i}` },
      create: { email: `cliente${i}@loja.dev`, password: hashCliente, role: 'customer', name: `Cliente ${i}` },
    });
  
      console.log('Seed users OK (bcrypt).');

  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
