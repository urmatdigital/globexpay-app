import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface User {
  id: string;
  telegram_id: number;
  username: string;
}

export async function getUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
      return null;
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

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      telegram_id: user.telegram_id,
      username: user.username
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}
