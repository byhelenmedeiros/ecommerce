'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, migrateWishlist } from '@/lib/api';

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const phoneOk = (v) => !v || /^\+?[0-9\s()-]{8,}$/.test(v);

// força da password simples (sem libs)
function pwScore(pw = '') {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(4, s);
}
const pwLabel = ['Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte'];

export default function RegisterPage() {
  const router = useRouter();

  // obrigatórios
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accept, setAccept] = useState(false);

  // opcionais de marketing
  const [phone, setPhone] = useState('');
  const [newsletter, setNewsletter] = useState(true); // pré-marcado (com texto claro)
  const [sms, setSms] = useState(false);
  const [prefs, setPrefs] = useState({ men: false, women: false, unisex: true });

  // UX
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const score = pwScore(password);
  const valid = useMemo(() => {
    if (!name || !emailOk(email) || password.length < 8 || password !== confirm || !accept) return false;
    if (sms && !phoneOk(phone)) return false; // se optou por SMS, precisa de telefone válido
    return true;
  }, [name, email, password, confirm, accept, sms, phone]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    if (!valid) return;

    setLoading(true);
    try {
      // 1) registar (o backend já coloca cookie/jwt)
      await auth.register(email, password, name);

      // 2) migrar wishlist do visitante (se existir)
      const guest = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (guest.length) {
        try { await migrateWishlist(guest); localStorage.removeItem('wishlist'); } catch {}
      }

      // 3) guardar preferências localmente (até ter endpoint de perfil)
      try {
        localStorage.setItem('marketing_prefs', JSON.stringify({
          newsletter, sms, phone: phone || null, prefs
        }));
      } catch {}

      // 4) redirecionar
      router.replace('/account');
    } catch (e) {
      setErr('Não foi possível registar (email já existe?)');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Criar conta</h1>
      <p className="text-sm text-gray-600 mb-6">
        Cria a tua conta e recebe <strong>10% na 1ª compra</strong> com o cupão <code>BEMVINDO10</code>.
      </p>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Nome e Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600">Nome*</label>
            <input
              className="w-full border rounded p-2"
              placeholder="Ex.: Maria Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Email*</label>
            <input
              className="w-full border rounded p-2"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {email && !emailOk(email) && (
              <div className="text-xs text-red-600 mt-1">Email inválido.</div>
            )}
          </div>
        </div>

        {/* Password + força */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600">Password* (8+ caracteres)</label>
            <div className="flex">
              <input
                className="w-full border rounded-l p-2"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="border rounded-r px-3 text-sm"
                onClick={() => setShowPw((v) => !v)}
              >
                {showPw ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {password && (
              <div className="mt-2">
                <div className="h-2 rounded bg-gray-200 overflow-hidden">
                  <div
                    className={`h-2 ${['bg-red-500','bg-orange-500','bg-yellow-500','bg-green-500','bg-green-600'][score]}`}
                    style={{ width: `${(score / 4) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1">{pwLabel[score]}</div>
              </div>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-600">Confirmar password*</label>
            <div className="flex">
              <input
                className="w-full border rounded-l p-2"
                type={showPw2 ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <button
                type="button"
                className="border rounded-r px-3 text-sm"
                onClick={() => setShowPw2((v) => !v)}
              >
                {showPw2 ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {confirm && confirm !== password && (
              <div className="text-xs text-red-600 mt-1">As passwords não coincidem.</div>
            )}
          </div>
        </div>

       

        {/* Termos */}
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={accept} onChange={(e)=>setAccept(e.target.checked)} />
          <span>
            Li e aceito os <a href="/terms" className="underline">Termos de Uso</a> e a{' '}
            <a href="/privacy" className="underline">Política de Privacidade</a>.
          </span>
        </label>

        {err && <div className="text-red-600 text-sm">{err}</div>}

        <button
          disabled={!valid || loading}
          className="w-full bg-black text-white py-3 rounded hover:bg-gray-900 disabled:opacity-50"
        >
          {loading ? 'A criar conta…' : 'Criar conta'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Já tens conta? <a href="/login" className="underline">Entrar</a>
        </p>
      </form>

      {/* “Provas sociais” para conversão */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="border rounded p-3">✓ Devoluções fáceis em 30 dias</div>
        <div className="border rounded p-3">✓ Pagamentos 100% seguros</div>
        <div className="border rounded p-3">✓ Entrega rápida em PT/UE</div>
      </div>
    </div>
  );
}
