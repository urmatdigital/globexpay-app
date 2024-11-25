import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/auth/error?message=no_token', request.url));
    }

    // Проверяем JWT токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      telegram_id: number;
      username: string;
    };

    // Получаем данные пользователя из Supabase
    const { data: user, error } = await supabase
      .from('telegram_users')
      .select()
      .eq('telegram_id', decoded.telegram_id)
      .single();

    if (error || !user) {
      return NextResponse.redirect(new URL('/auth/error?message=user_not_found', request.url));
    }

    // Создаем сессионный токен
    const sessionToken = jwt.sign(
      {
        id: user.id,
        telegram_id: user.telegram_id,
        username: user.username
      },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    // Устанавливаем cookie
    cookies().set('auth_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    // Перенаправляем на главную страницу
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/auth/error?message=invalid_token', request.url));
  }
}
