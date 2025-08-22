'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, migrateWishlist } from '@/lib/api';

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function LoginPage() {
  const [email, setEmail] = useState('cliente1@loja.dev');
  const [password, setPassword] = useState('password123');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [keep, setKeep] = useState(true); // informativo (cookie 7d)
  const [caps, setCaps] = useState(false);

  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const sp = useSearchParams();

  // Prefill do email lembrado
  useEffect(() => {
    try {
      const saved = localStorage.getItem('remember_email');
      if (saved) setEmail(saved);
    } catch {}
  }, []);

  const valid = useMemo(() => emailOk(email) && password.length >= 1, [email, password]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    if (!valid) return;

    setLoading(true);
    try {
      // 1) login
      await auth.login(email, password);

      // 2) lembrar email se marcado
      try {
        if (remember) localStorage.setItem('remember_email', email);
        else localStorage.removeItem('remember_email');
      } catch {}

      // 3) migrar wishlist do visitante
      const guest = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (guest.length) {
        try { await migrateWishlist(guest); localStorage.removeItem('wishlist'); } catch {}
      }

      // 4) redirecionar
      const next = sp.get('next') || '/account';
      router.replace(next);
    } catch (e) {
      setErr('Credenciais inválidas. Verifica o email e a password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Entrar</h1>
      <p className="text-sm text-gray-600 mb-6">
        Bem-vindo de volta! <span className="hidden sm:inline">Aproveita ofertas exclusivas para membros.</span>
      </p>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            className="w-full border rounded p-2 mt-1"
            type="email"
            placeholder="voce@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {email && !emailOk(email) && (
            <div className="text-xs text-red-600 mt-1">Email inválido.</div>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="text-sm text-gray-600">Password</label>
          <div className="flex mt-1">
            <input
              className="w-full border rounded-l p-2"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={(e) => setCaps(e.getModifierState && e.getModifierState('CapsLock'))}
            />
            <button
              type="button"
              className="border rounded-r px-3 text-sm"
              onClick={() => setShowPw((v) => !v)}
            >
              {showPw ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {caps && <div className="text-xs text-amber-600 mt-1">Caps Lock ligado.</div>}
        </div>

        {/* Opções */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={remember} onChange={(e)=>setRemember(e.target.checked)} />
            Lembrar email
          </label>
          <label className="flex items-center gap-2 text-gray-600">
            <input type="checkbox" checked={keep} onChange={(e)=>setKeep(e.target.checked)} />
            Manter-me ligado
          </label>
        </div>

        {/* Erro */}
        {err && <div className="text-red-600 text-sm">{err}</div>}

        {/* CTA */}
        <button
          disabled={!valid || loading}
          className="w-full bg-black text-white py-3 rounded hover:bg-gray-900 disabled:opacity-50"
        >
          {loading ? 'A entrar…' : 'Entrar'}
        </button>

        {/* Links auxiliares */}
        <div className="flex items-center justify-between text-sm">
          <a href="/forgot" className="underline">Esqueci a password</a>
          <span className="text-gray-600">
            Novo por aqui? <a href="/register" className="underline">Criar conta</a>
          </span>
        </div>
      </form>

   
   
      {/* Provas sociais */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="border rounded p-3">✓ Devoluções fáceis em 30 dias</div>
        <div className="border rounded p-3">✓ Pagamentos 100% seguros</div>
        <div className="border rounded p-3">✓ Entrega rápida em PT/UE</div>
      </div>
    </div>
  );
}
