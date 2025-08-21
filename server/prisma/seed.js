/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  // Admin + clientes demo
  const pwd = '$2b$10$D4G5f18o7aMMfwasBlah0e';
  await prisma.user.upsert({
    where: { email: 'admin@loja.dev' },
    update: {},
    create: { email: 'admin@loja.dev', password: 'admin', role: 'admin', name: 'Admin' }
  });
  for (let i = 1; i <= 5; i++) {
    await prisma.user.upsert({
      where: { email: `cliente${i}@loja.dev` },
      update: {},
      create: { email: `cliente${i}@loja.dev`, password: 'password123', role: 'customer', name: `Cliente ${i}` }
    });
  }

  // Categorias
  const baseCats = [
    { name: 'Novidades', slug: 'novidades' },
    { name: 'Homem', slug: 'homem' },
    { name: 'Mulher', slug: 'mulher' },
    { name: 'Acessórios', slug: 'acessorios' },
    { name: 'Promoções', slug: 'promocoes' }
  ];
  await prisma.category.createMany({ data: baseCats });

  const cats = await prisma.category.findMany();

  // Produtos + variantes + imagens
  for (let i = 1; i <= 30; i++) {
    const cat = cats[rand(0, cats.length - 1)];
    const product = await prisma.product.create({
      data: {
        name: `Produto ${i}`,
        slug: `produto-${i}`,
        description: 'Descrição breve do produto.',
        categoryId: cat.id,
        images: { create: [{ url: `https://picsum.photos/seed/${i}/800/800`, alt: `Produto ${i}`, sort: 0 }] },
        tags: { create: [{ tag: 'destaque' }] }
      }
    });

    const colors = ['Preto', 'Branco', 'Azul', 'Vermelho'];
    const sizes = ['S', 'M', 'L', 'XL'];
    const vCount = rand(2, 4);

    for (let v = 0; v < vCount; v++) {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: `SKU-${i}-${v}`,
          priceCents: rand(1500, 12500),
          stock: rand(0, 50),
          attrs: { color: colors[rand(0, colors.length - 1)], size: sizes[rand(0, sizes.length - 1)] }
        }
      });
    }
  }

  // Cupões
  await prisma.coupon.createMany({
    data: [
      { code: 'BEMVINDO10', type: 'percent', value: 10 },
      { code: 'FRETEGRATIS', type: 'fixed', value: 500 },
      { code: 'PROMO5', type: 'fixed', value: 500 }
    ],
    skipDuplicates: true
  });

  console.log('Seed concluído');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
