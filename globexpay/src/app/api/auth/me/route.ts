import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabase/config';

export async function GET() {
  try {
    const token = cookies().get('auth-token');

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as {
      id: string;
      telegram_id: number;
      username: string;
    };

    const { data: user, error } = await supabase
      .from('telegram_users')
      .select()
      .eq('telegram_id', decoded.telegram_id)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
