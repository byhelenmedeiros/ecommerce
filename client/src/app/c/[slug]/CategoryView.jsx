'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

export default function CategoryView({ slug, initial, filters }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // estado local dos filtros
  const [local, setLocal] = useState(filters);

  // sempre que mudar pela navegação, sincroniza o estado local
  useEffect(() => {
    setLocal(filters);
  }, [filters.color, filters.size, filters.target, filters.kind, filters.page]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((initial?.total || 0) / (initial?.take || 12))),
    [initial?.total, initial?.take]
  );

  function update(next) {
    const sp = new URLSearchParams(searchParams.toString());
    const merged = { ...local, ...next };

    for (const [k, v] of Object.entries(merged)) {
      if (v === '' || v == null) sp.delete(k);
      else sp.set(k, String(v));
    }
    // reset da página se mexer em filtros
    if ('color' in next || 'size' in next || 'target' in next || 'kind' in next) {
      sp.set('page', '1');
    }
    router.push(`/c/${slug}?${sp.toString()}`);
  }

  function goPage(p) {
    const np = Math.min(Math.max(1, p), totalPages);
    update({ page: np });
  }

  return (
    <>
      <h1 className="text-xl font-semibold mb-3">Categoria: {slug}</h1>

      {/* Filtros simples */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-5 gap-2">
        <input
          placeholder="Cor (ex.: Preto)"
          value={local.color}
          onChange={(e) => setLocal({ ...local, color: e.target.value })}
          className="border rounded p-2"
        />
        <input
          placeholder="Tamanho (ex.: M ou 42)"
          value={local.size}
          onChange={(e) => setLocal({ ...local, size: e.target.value })}
          className="border rounded p-2"
        />
        <select
          value={local.target}
          onChange={(e) => setLocal({ ...local, target: e.target.value })}
          className="border rounded p-2"
        >
          <option value="">Público</option>
          <option value="men">Homem</option>
          <option value="women">Mulher</option>
          <option value="unisex">Unissex</option>
        </select>
        <select
          value={local.kind}
          onChange={(e) => setLocal({ ...local, kind: e.target.value })}
          className="border rounded p-2"
        >
          <option value="">Tipo</option>
          <option value="apparel">Roupa</option>
          <option value="shoes">Calçado</option>
          <option value="accessory">Acessório</option>
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => update({})}
            className="px-3 py-2 bg-black text-white rounded"
          >
            Filtrar
          </button>
          <button
            onClick={() => {
              setLocal({ color: '', size: '', target: '', kind: '', page: 1 });
              router.push(`/c/${slug}`);
            }}
            className="px-3 py-2 border rounded"
          >
            Limpar
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        {initial.total} resultado{initial.total === 1 ? '' : 's'}
        {local.color ? ` • cor: ${local.color}` : ''}
        {local.size ? ` • tamanho: ${local.size}` : ''}
        {local.target ? ` • público: ${local.target}` : ''}
        {local.kind ? ` • tipo: ${local.kind}` : ''}
      </p>

      {/* Lista */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {initial.items.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => goPage((filters.page || 1) - 1)}
            className="px-3 py-2 border rounded disabled:opacity-40"
            disabled={(filters.page || 1) <= 1}
          >
            ‹ Anterior
          </button>
          <span className="text-sm">
            Página {filters.page || 1} de {totalPages}
          </span>
          <button
            onClick={() => goPage((filters.page || 1) + 1)}
            className="px-3 py-2 border rounded disabled:opacity-40"
            disabled={(filters.page || 1) >= totalPages}
          >
            Próxima ›
          </button>
        </div>
      )}
    </>
  );
}
