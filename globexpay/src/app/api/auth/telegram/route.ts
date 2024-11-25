import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHash, createHmac } from 'crypto'
import { supabase } from '@/lib/supabase/config'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

function checkTelegramAuthorization(data: any) {
  const { hash, ...userData } = data
  const dataCheckString = Object.keys(userData)
    .sort()
    .map(key => `${key}=${userData[key]}`)
    .join('\n')
  
  const secretKey = createHash('sha256')
    .update(TELEGRAM_BOT_TOKEN)
    .digest()
  
  const hmac = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')
  
  return hmac === hash
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Проверяем данные от Telegram
    if (!checkTelegramAuthorization(data)) {
      return NextResponse.json(
        { error: 'Invalid authorization' },
        { status: 401 }
      )
    }

    const { id: telegram_id, username, first_name, last_name } = data

    // Проверяем существование пользователя в базе
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select()
      .eq('telegram_id', telegram_id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    let userId = existingUser?.id

    // Если пользователя нет, создаем нового
    if (!existingUser) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          telegram_id,
          username,
          first_name,
          last_name,
        })
        .select()
        .single()

      if (insertError) throw insertError
      userId = newUser.id
    }

    // Генерируем JWT токен
    const token = jwt.sign(
      { 
        userId,
        telegram_id,
        username 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    )

    // Устанавливаем куки
    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
