'use client';

export default function Footer() {
  return (
    <footer className="mt-16 border-t">
      {/* Newsletter */}
      <section className="mx-auto max-w-6xl px-4 py-10">
       
      </section>

      {/* Links */}
      <section className="mx-auto max-w-6xl px-4 pb-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="font-semibold mb-3">Ajuda</div>
          <ul className="space-y-2 text-gray-600">
            <li><a className="hover:underline" href="/help/shipping">Envios & prazos</a></li>
            <li><a className="hover:underline" href="/help/returns">Devoluções</a></li>
            <li><a className="hover:underline" href="/help/size-guide">Guia de tamanhos</a></li>
            <li><a className="hover:underline" href="/contact">Contactos</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Sobre nós</div>
          <ul className="space-y-2 text-gray-600">
            <li><a className="hover:underline" href="/about">A marca</a></li>
            <li><a className="hover:underline" href="/sustainability">Sustentabilidade</a></li>
            <li><a className="hover:underline" href="/stores">Lojas</a></li>
            <li><a className="hover:underline" href="/careers">Carreiras</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Legal</div>
          <ul className="space-y-2 text-gray-600">
            <li><a className="hover:underline" href="/terms">Termos de uso</a></li>
            <li><a className="hover:underline" href="/privacy">Privacidade</a></li>
            <li><a className="hover:underline" href="/cookies">Cookies</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Pagamentos</div>
          <div className="text-gray-600">
            <div className="flex gap-2 items-center">
              <span className="inline-block w-10 h-6 bg-gray-200 rounded" title="Visa" />
              <span className="inline-block w-10 h-6 bg-gray-200 rounded" title="Mastercard" />
              <span className="inline-block w-10 h-6 bg-gray-200 rounded" title="MBWay" />
              <span className="inline-block w-10 h-6 bg-gray-200 rounded" title="PayPal" />
            </div>
            <p className="text-xs mt-2">Pagamentos 100% seguros.</p>
          </div>
        </div>
      </section>

      {/* Bottom */}
      <div className="bg-gray-50 border-t">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>© {new Date().getFullYear()} LOJA<span className="text-red-600">X</span>. Todos os direitos reservados.</div>
          <div className="flex items-center gap-3">
            <a href="#" className="hover:underline">PT</a>
            <span className="text-gray-400">•</span>
            <a href="/sitemap" className="hover:underline">Mapa do site</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
