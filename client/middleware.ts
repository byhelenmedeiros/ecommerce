import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/account/:path*', '/admin/:path*'],
};

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const role = req.cookies.get('role')?.value;

   
  if (!token) {
    const url = new URL('/login', req.url);
    url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // /admin requer admin ou manager
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (role !== 'admin' && role !== 'manager') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}
