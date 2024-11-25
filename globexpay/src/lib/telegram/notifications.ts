import { bot } from './auth';

export async function sendNotification(telegramId: number, message: string) {
  try {
    await bot.api.sendMessage(telegramId, message);
  } catch (error) {
    console.error('Error sending telegram notification:', error);
    throw error;
  }
}

export async function sendLogoutNotification(telegramId: number) {
  const message = 'Вы успешно вышли из системы. До свидания!';
  await sendNotification(telegramId, message);
}
