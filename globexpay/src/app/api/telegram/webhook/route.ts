import { NextResponse } from 'next/server';
import { Bot, webhookCallback } from 'grammy';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

// Обработка команды /start
bot.command('start', async (ctx) => {
  const chatId = ctx.from?.id;
  const username = ctx.from?.username;

  if (!chatId || !username) {
    await ctx.reply('Ошибка: не удалось получить данные пользователя');
    return;
  }

  try {
    // Создаем или обновляем пользователя в Supabase
    const { data: user, error: userError } = await supabase
      .from('telegram_users')
      .upsert({
        telegram_id: chatId,
        username: username,
        last_interaction: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.error('Error saving user:', userError);
      await ctx.reply('Произошла ошибка при регистрации. Попробуйте позже.');
      return;
    }

    // Создаем JWT токен
    const token = jwt.sign(
      { telegram_id: chatId, username },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/telegram-callback?token=${token}`;

    await ctx.reply('Добро пожаловать в GlobExPay! Нажмите на кнопку ниже, чтобы войти:', {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🔐 Войти в GlobExPay',
            url: loginUrl
          }
        ]]
      }
    });
  } catch (error) {
    console.error('Bot error:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
});

// Создаем обработчик для webhook
const handler = webhookCallback(bot, 'next-js');

export async function POST(request: Request) {
  try {
    return await handler(request);
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
