
import '@/app/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Loja',
  description: 'E-commerce demo',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className="antialiased min-h-screen flex flex-col">
        {/* Topo completo com oferta + navegação + busca */}
        <Header />

        {/* Conteúdo principal */}
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
          {children}
        </main>

        {/* Rodapé com newsletter e trust badges */}
        <Footer />
      </body>
    </html>
  );
}
