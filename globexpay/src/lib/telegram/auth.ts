import { Bot } from 'grammy';
import { supabase } from '../supabase/config';
import jwt from 'jsonwebtoken';

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error('Missing env.TELEGRAM_BOT_TOKEN');
}

export const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

export async function generateAuthToken(telegramId: number, username: string) {
  try {
    const { data: user, error } = await supabase
      .from('telegram_users')
      .upsert({
        telegram_id: telegramId,
        username: username,
        last_interaction: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('Missing env.JWT_SECRET');
    }

    return jwt.sign(
      {
        id: user.id,
        telegram_id: telegramId,
        username: username
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
  } catch (error) {
    console.error('Error generating auth token:', error);
    throw error;
  }
}

export async function verifyTelegramUser(telegramId: number) {
  try {
    const { data: user, error } = await supabase
      .from('telegram_users')
      .select()
      .eq('telegram_id', telegramId)
      .single();

    if (error) {
      throw error;
    }

    return user;
  } catch (error) {
    console.error('Error verifying telegram user:', error);
    throw error;
  }
}
