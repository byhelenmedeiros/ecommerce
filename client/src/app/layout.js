
export const metadata = {
  title: 'Loja',
  description: 'E-commerce demo',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <nav style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
          <a href="/" style={{ fontWeight: 600 }}>Loja</a>
        </nav>
        <main style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
