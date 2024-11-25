import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { sendTelegramMessage, formatLogoutMessage } from '@/lib/telegram/notifications'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Получаем текущего пользователя перед выходом
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Получаем данные пользователя из нашей таблицы
      const { data: userData } = await supabase
        .from('users')
        .select('telegram_id, username')
        .eq('id', user.id)
        .single()

      if (userData?.telegram_id) {
        // Отправляем уведомление в Telegram
        await sendTelegramMessage({
          chat_id: userData.telegram_id,
          text: formatLogoutMessage(userData.username),
        })
      }
    }

    // Выход из системы
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Error during logout' },
      { status: 500 }
    )
  }
}
