/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];

function slugify(str) {
  return String(str)
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function main() {
  // ─────────────────────────────────────────────────────────────
  // Utilizadores demo
  // ─────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────
  // Categorias (idempotente)
  // ─────────────────────────────────────────────────────────────
  const baseCats = [
    { name: 'Novidades', slug: 'novidades' },
    { name: 'Homem', slug: 'homem' },
    { name: 'Mulher', slug: 'mulher' },
    { name: 'Acessórios', slug: 'acessorios' },
    { name: 'Promoções', slug: 'promocoes' },
  ];
  await prisma.category.createMany({ data: baseCats, skipDuplicates: true });
  const cats = await prisma.category.findMany();
  const bySlug = Object.fromEntries(cats.map(c => [c.slug, c]));

  // ─────────────────────────────────────────────────────────────
  // Catálogo realista (mix roupa | calçado | acessórios)
  // ─────────────────────────────────────────────────────────────
  const catalog = [
    { name: 'Camiseta Básica Algodão', categorySlug: 'homem' },
    { name: 'Camiseta Oversized', categorySlug: 'homem' },
    { name: 'Calças Chino Slim', categorySlug: 'homem' },
    { name: 'Jeans Regular Fit', categorySlug: 'homem' },
    { name: 'Sweatshirt Minimal', categorySlug: 'homem' },
    { name: 'Casaco Corta-Vento', categorySlug: 'homem' },

    { name: 'Top Cropped Algodão', categorySlug: 'mulher' },
    { name: 'Saia Midi Plissada', categorySlug: 'mulher' },
    { name: 'Calças Wide Leg', categorySlug: 'mulher' },
    { name: 'Camisola Tricot', categorySlug: 'mulher' },

    { name: 'Ténis Casual Branco', categorySlug: 'novidades' },
    { name: 'Ténis Retro', categorySlug: 'novidades' },
    { name: 'Botas Chelsea Couro', categorySlug: 'novidades' },

    { name: 'Boné Trucker', categorySlug: 'acessorios' },
    { name: 'Mochila Urban', categorySlug: 'acessorios' },
    { name: 'Cinto Couro', categorySlug: 'acessorios' },
    { name: 'Meias Conforto (3 pares)', categorySlug: 'acessorios' },
  ];

  // Helpers de guia de tamanhos
  const sizeGuideApparel = {
    system: 'alpha',
    table: [
      { size: 'XS', chest: '84-88cm', waist: '68-72cm' },
      { size: 'S',  chest: '88-92cm', waist: '72-76cm' },
      { size: 'M',  chest: '92-100cm', waist: '76-84cm' },
      { size: 'L',  chest: '100-108cm', waist: '84-92cm' },
      { size: 'XL', chest: '108-116cm', waist: '92-100cm' },
    ],
  };
  const sizeGuideShoes = {
    system: 'EU',
    table: [
      { EU: 36, US: '5.5', UK: '3.5' },
      { EU: 38, US: '7',   UK: '5'   },
      { EU: 40, US: '8',   UK: '7'   },
      { EU: 42, US: '9',   UK: '8'   },
      { EU: 44, US: '10',  UK: '9'   },
    ],
  };

  const colorsApparel = ['Preto','Branco','Azul Marinho','Verde','Vermelho','Bege'];
  const sizesAlpha     = ['XS','S','M','L','XL'];

  const colorsShoes = ['Preto','Branco','Azul','Vermelho'];
  const sizesMenEU  = [40,41,42,43,44];
  const sizesWomenEU= [36,37,38,39,40];

  // Regex para inferir tipo
  const isShoeName      = (n) => /t[eé]nis|tenis|bota/i.test(n);
  const isAccessoryName = (n) => /bon[eé]|mochila|cinto|meias/i.test(n);

  let created = 0;

  for (const item of catalog) {
    const slug = slugify(item.name);
    // idempotente: se já existe, salta (não duplica)
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (exists) continue;

    const cat = bySlug[item.categorySlug] || pick(cats);

    // cria produto base com 1 imagem geral
    const p = await prisma.product.create({
      data: {
        name: item.name,
        slug,
        description: 'Peça versátil para o dia a dia. Corte confortável e tecido respirável.',
        categoryId: cat.id,
        images: { create: [{ url: `https://picsum.photos/seed/${slug}/800/800`, alt: item.name, sort: 0 }] },
        tags: { create: [{ tag: 'novo' }] }
      }
    });

    // define kind/target/sizeGuide
    let kind = 'apparel';
    if (isShoeName(item.name)) kind = 'shoes';
    if (isAccessoryName(item.name)) kind = 'accessory';

    const target = pick(['men','women','unisex']); // podes ajustar se quiseres amarrar por categoria

    await prisma.product.update({
      where: { id: p.id },
      data: {
        kind,
        target,
        sizeGuide: kind === 'apparel' ? sizeGuideApparel : (kind === 'shoes' ? sizeGuideShoes : null),
      }
    });

    // criar variantes + imagens por variante
    if (kind === 'apparel') {
      // escolhe 2-3 cores e 3-5 tamanhos
      const useColors = [...colorsApparel].sort(() => 0.5 - Math.random()).slice(0, rand(2,3));
      const useSizes  = [...sizesAlpha].sort(() => 0.5 - Math.random()).slice(0, rand(3,5));

      for (const c of useColors) {
        for (const s of useSizes) {
          const v = await prisma.productVariant.create({
            data: {
              productId: p.id,
              sku: `SKU-A-${slug}-${c}-${s}`.toUpperCase(),
              priceCents: rand(1500, 9900),
              stock: rand(0, 40),
              color: c,
              size: s,
              sizeSystem: 'alpha',
              attrs: {}
            }
          });
          // imagem por variante (ex.: cor)
          await prisma.variantImage.create({
            data: {
              variantId: v.id,
              url: `https://picsum.photos/seed/${slug}-${slugify(c)}/800/800`,
              alt: `${item.name} - ${c} ${s}`,
              sort: 0
            }
          });
        }
      }
    } else if (kind === 'shoes') {
      const isMen = target === 'men';
      const baseSizes = isMen ? sizesMenEU : sizesWomenEU;
      const useColors = [...colorsShoes].sort(() => 0.5 - Math.random()).slice(0, rand(2,3));
      const useSizes  = [...baseSizes].sort(() => 0.5 - Math.random()).slice(0, rand(3,5));

      for (const c of useColors) {
        for (const s of useSizes) {
          const v = await prisma.productVariant.create({
            data: {
              productId: p.id,
              sku: `SKU-S-${slug}-${c}-${s}`.toUpperCase(),
              priceCents: rand(3500, 15900),
              stock: rand(0, 30),
              color: c,
              size: String(s),
              sizeSystem: 'EU',
              attrs: {}
            }
          });
          await prisma.variantImage.create({
            data: {
              variantId: v.id,
              url: `https://picsum.photos/seed/${slug}-${slugify(c)}-${s}/800/800`,
              alt: `${item.name} - ${c} ${s} EU`,
              sort: 0
            }
          });
        }
      }
    } else {
      // acessórios: uma variante (sem tamanho) — podes variar cor se quiseres
      const v = await prisma.productVariant.create({
        data: {
          productId: p.id,
          sku: `SKU-ACC-${slug}`.toUpperCase(),
          priceCents: rand(900, 7900),
          stock: rand(2, 80),
          color: null,
          size: null,
          sizeSystem: null,
          attrs: {}
        }
      });
      await prisma.variantImage.create({
        data: {
          variantId: v.id,
          url: `https://picsum.photos/seed/${slug}-acc/800/800`,
          alt: `${item.name}`,
          sort: 0
        }
      });
    }

    created++;
  }

  // ─────────────────────────────────────────────────────────────
  // Cupões (idempotente)
  // ─────────────────────────────────────────────────────────────
  await prisma.coupon.createMany({
    data: [
      { code: 'BEMVINDO10', type: 'percent', value: 10 },
      { code: 'FRETEGRATIS', type: 'fixed', value: 500 },
      { code: 'PROMO5', type: 'fixed', value: 500 },
    ],
    skipDuplicates: true
  });

  console.log(` Seed concluído — produtos criados: ${created}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
