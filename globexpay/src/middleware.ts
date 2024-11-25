import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function middleware(req: NextRequest) {
  // Пропускаем API маршруты и статические файлы
  if (req.nextUrl.pathname.startsWith('/api') || 
      req.nextUrl.pathname.startsWith('/_next') ||
      req.nextUrl.pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  // Проверяем авторизацию
  const token = req.cookies.get('auth_token');
  let isAuthenticated = false;

  if (token) {
    try {
      jwt.verify(token.value, process.env.JWT_SECRET!);
      isAuthenticated = true;
    } catch (error) {
      console.error('JWT verification error:', error);
    }
  }

  // Защищенные маршруты
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard');
  
  // Если пользователь не авторизован и пытается получить доступ к защищенным маршрутам
  if (!isAuthenticated && isProtectedRoute) {
    const redirectUrl = new URL('/auth/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Если пользователь авторизован и пытается получить доступ к страницам авторизации
  if (isAuthenticated && (
    req.nextUrl.pathname.startsWith('/auth/login') || 
    req.nextUrl.pathname.startsWith('/auth/register')
  )) {
    const redirectUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
