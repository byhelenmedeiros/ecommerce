'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCategories } from '@/lib/api';

export default function Nav() {
  const [cats, setCats] = useState([]);
  useEffect(() => { getCategories().then(setCats).catch(console.error); }, []);
  return (
    <nav className="border-b">
      <div className="mx-auto max-w-5xl px-4 py-3 flex gap-4 flex-wrap">
        <Link href="/" className="font-semibold">Loja</Link>
        {cats.map(c => (
          <Link key={c.id} href={`/c/${c.slug}`} className="text-sm text-gray-600 hover:text-black">
            {c.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
