'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCategories, getProducts, getCart } from '@/lib/api';
import { getSessionId } from '@/lib/session';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faXmark, faMagnifyingGlass, faUser, faHeart, faBagShopping, faTruck, faRotateLeft, faTag } from '@fortawesome/free-solid-svg-icons';


export default function Header() {
  const router = useRouter();

  // Top nav data
  const [cats, setCats] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const data = await getCategories();
        // pega algumas categorias de 1º nível
        const roots = data.filter((c) => !c.parentId).slice(0, 6);
        setCats(roots);
      } catch {
        setCats([
          { slug: 'novidades', name: 'Novidades' },
          { slug: 'homem', name: 'Homem' },
          { slug: 'mulher', name: 'Mulher' },
          { slug: 'acessorios', name: 'Acessórios' },
          { slug: 'promocoes', name: 'Promoções' },
        ]);
      }
    })();
  }, []);

  // Cart badge
  const [count, setCount] = useState(0);
  useEffect(() => {
    (async () => {
      try {
        const sid = getSessionId();
        const cart = await getCart(sid);
        setCount(cart.itemCount || 0);
      } catch {}
    })();
    const handler = (e) => setCount(e.detail || 0);
    window.addEventListener('cart:count', handler);
    return () => window.removeEventListener('cart:count', handler);
  }, []);

  // Mobile menu
  const [openMenu, setOpenMenu] = useState(false);

  // Search overlay
  const [openSearch, setOpenSearch] = useState(false);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggests, setSuggests] = useState([]);

  // debounce simples
  useEffect(() => {
    if (!openSearch) return;
    const id = setTimeout(async () => {
      if (!q.trim()) { setSuggests([]); return; }
      setLoading(true);
      try {
        const res = await getProducts({ q, take: 6 });
        setSuggests(res.items || []);
      } catch {
        setSuggests([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [q, openSearch]);

  function submitSearch(e) {
    e?.preventDefault();
    const term = q.trim();
    if (!term) return;
    setOpenSearch(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  // TOP BAR — ticker animado
const [showTop, setShowTop] = useState(true);
useEffect(() => {
  try { if (localStorage.getItem('hideTopBar') === '1') setShowTop(false); } catch {}
}, []);

function TopPill({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 px-1 py-1 rounded-full bg-white/5 text-gray-100">
      <FontAwesomeIcon icon={icon} className="text-red-400" />
      <span className="text-[12px] sm:text-xs">{children}</span>
    </span>
  );
}

  return (
    <header className="border-b">
      {/* Top bar (trust + incentivo) */}
 {showTop && (
  <div className="bg-black text-xs text-gray-200 relative">
    <div className="mx-auto max-w-6xl px-2 py-2 flex items-center gap-3">
      {/* “Live dot” + rótulo à esquerda (desktop) */}
      <div className="hidden md:flex items-center gap-2 pr-2">
        <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden />
        <span className="uppercase tracking-wider text-[11px] text-gray-300">Campanha</span>
      </div>

      {/* Ticker central */}
      <div className="flex-1 topbar-ticker">
        <div className="topbar-track">
          <div className="inline-flex items-center gap-6 pr-6">
            <TopPill icon={faTag}><b className="text-red-400">10% OFF</b> na 1ª compra (code <b>BEMVINDO10</b>)</TopPill>
            <TopPill icon={faTruck}>Entrega rápida PT/UE</TopPill>
            <TopPill icon={faRotateLeft}>Devoluções 30 dias</TopPill>
            <TopPill icon={faHeart}>Favorita produtos e cria listas</TopPill>
          </div>
          {/* Duplicado para loop contínuo */}
          <div className="inline-flex items-center gap-6 pr-12">
            <TopPill icon={faTag}><b className="text-red-400">10% OFF</b> na 1ª compra (code <b>BEMVINDO10</b>)</TopPill>
            <TopPill icon={faTruck}>Entrega rápida PT/UE</TopPill>
            <TopPill icon={faRotateLeft}>Devoluções 30 dias</TopPill>
            <TopPill icon={faHeart}>Favorita produtos e cria listas</TopPill>
          </div>
        </div>
      </div>

      {/* Fechar */}
      <button
        className="ml-2 p-2 rounded hover:bg-white/10"
        aria-label="Fechar barra"
        onClick={() => { setShowTop(false); try { localStorage.setItem('hideTopBar','1'); } catch {} }}
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>

    {/* Hairline com acento vermelho */}
    <div className="h-[2px] bg-gradient-to-r from-red-600 via-transparent to-red-600 opacity-60" />
  </div>
)}

      {/* Main */}
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        {/* Left: burger mobile */}
        <button
          className="md:hidden p-2 rounded hover:bg-gray-100"
          aria-label="Abrir menu"
          onClick={() => setOpenMenu(true)}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>

        {/* Logo */}
        <Link href="/" className="text-xl font-semibold tracking-tight">
          LOJA<span className="text-red-600">X</span>
        </Link>

        {/* Nav (desktop) */}
        <nav className="hidden md:flex items-center gap-5">
          {cats.map((c) => (
            <Link
              key={c.slug}
              href={`/c/${c.slug}`}
              className="text-sm text-gray-700 hover:text-black"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Pesquisar"
            onClick={() => setOpenSearch(true)}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
          <Link href="/wishlist" className="p-2 rounded hover:bg-gray-100" aria-label="Favoritos">
            <FontAwesomeIcon icon={faHeart} />
          </Link>
          <Link href="/account" className="p-2 rounded hover:bg-gray-100" aria-label="Minha conta">
            <FontAwesomeIcon icon={faUser} />
          </Link>
          <Link href="/cart" className="relative p-2 rounded hover:bg-gray-100" aria-label="Carrinho">
            <FontAwesomeIcon icon={faBagShopping} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] leading-4 px-1 rounded-full min-w-[16px] text-center">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile drawer */}
      {openMenu && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenMenu(false)} />
          <aside className="absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold">Menu</span>
              <button className="p-2 rounded hover:bg-gray-100" onClick={() => setOpenMenu(false)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="pb-3">
              <form onSubmit={(e) => { e.preventDefault(); setOpenMenu(false); setOpenSearch(true); }}>
                <input
                  className="w-full border rounded p-2"
                  placeholder="Pesquisar produtos"
                  readOnly
                />
              </form>
            </div>
            <nav className="flex-1 space-y-1">
              {cats.map((c) => (
                <Link
                  key={c.slug}
                  href={`/c/${c.slug}`}
                  className="block px-2 py-2 rounded hover:bg-gray-50 text-gray-800"
                  onClick={() => setOpenMenu(false)}
                >
                  {c.name}
                </Link>
              ))}
            </nav>
            <div className="pt-3 border-t text-sm text-gray-600">
              <Link href="/account" onClick={() => setOpenMenu(false)} className="block py-2">Minha conta</Link>
              <Link href="/wishlist" onClick={() => setOpenMenu(false)} className="block py-2">Favoritos</Link>
              <Link href="/cart" onClick={() => setOpenMenu(false)} className="block py-2">Carrinho</Link>
            </div>
          </aside>
        </div>
      )}

      {/* Search overlay */}
      {openSearch && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpenSearch(false)} />
          <div className="absolute left-1/2 -translate-x-1/2 top-10 w-[92%] max-w-2xl bg-white rounded-xl shadow-xl border">
            <div className="flex items-center gap-2 p-3 border-b">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-500" />
              <form onSubmit={submitSearch} className="flex-1">
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full outline-none p-2"
                  placeholder="Pesquisar por produto, cor, tamanho…"
                />
              </form>
              <button className="p-2 rounded hover:bg-gray-100" onClick={() => setOpenSearch(false)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="p-3">
              {loading && <div className="text-sm text-gray-500">A procurar…</div>}
              {!loading && q && suggests.length === 0 && (
                <div className="text-sm text-gray-500">Sem resultados. Prima Enter para ver todos.</div>
              )}
              <ul className="divide-y">
                {suggests.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/p/${p.slug}`}
                      className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded px-1"
                      onClick={() => setOpenSearch(false)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.images?.[0]?.url || 'https://via.placeholder.com/64'}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded border"
                      />
                      <div className="flex-1">
                        <div className="text-sm">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.category?.name}</div>
                      </div>
                      <div className="text-sm font-medium">
                        {formatEUR(p.minPromoPriceCents ?? p.minPriceCents ?? 0)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {q && (
                <button
                  onClick={submitSearch}
                  className="mt-3 w-full text-center border rounded py-2 hover:bg-gray-50"
                >
                  Ver mais resultados
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// util local — evita import repetido
function formatEUR(cents) {
  return ((cents || 0) / 100).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
}
