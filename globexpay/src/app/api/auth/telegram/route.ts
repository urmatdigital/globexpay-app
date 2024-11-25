import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { processTelegramAuth } from '@/lib/telegram/auth'
import { db } from '@/lib/supabase/config'

export async function POST(request: Request) {
  try {
    const telegramData = await request.json()
    const userData = await processTelegramAuth(telegramData)
    
    // Инициализация Supabase клиента
    const supabase = createRouteHandlerClient({ cookies })
    
    // Проверяем существует ли пользователь
    let user = await db.users.getByTelegramId(userData.telegram_id)
    
    if (!user) {
      // Создаем нового пользователя в Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: `${userData.telegram_id}@telegram.user`,
        password: crypto.randomUUID(), // Генерируем случайный пароль
        options: {
          data: {
            telegram_id: userData.telegram_id,
            provider: 'telegram'
          }
        }
      })

      if (authError) throw authError

      // Создаем запись в таблице users
      const { data: newUser, error: dbError } = await supabase
        .from('users')
        .insert({
          id: authUser.user?.id,
          telegram_id: userData.telegram_id,
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          avatar_url: userData.avatar_url,
          auth_provider: 'telegram'
        })
        .select()
        .single()

      if (dbError) throw dbError
      user = newUser
    }

    // Создаем сессию
    const { data: { session }, error: signInError } = await supabase.auth.signInWithOtp({
      email: `${userData.telegram_id}@telegram.user`,
    })

    if (signInError) throw signInError

    return NextResponse.json({
      user,
      session
    })
  } catch (error) {
    console.error('Telegram auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}
