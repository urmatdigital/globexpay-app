import { createHash, createHmac } from 'crypto'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export const validateTelegramAuth = (data: TelegramUser): boolean => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN is not defined')

  const secretKey = createHash('sha256')
    .update(botToken)
    .digest()

  const dataToCheck = Object.entries(data)
    .filter(([key]) => key !== 'hash')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const hash = createHmac('sha256', secretKey)
    .update(dataToCheck)
    .digest('hex')

  return data.hash === hash
}

export const processTelegramAuth = async (data: TelegramUser) => {
  if (!validateTelegramAuth(data)) {
    throw new Error('Invalid telegram authentication')
  }

  const { id: telegramId, username, first_name, last_name, photo_url } = data
  
  return {
    telegram_id: telegramId.toString(),
    username: username || `user_${telegramId}`,
    first_name,
    last_name: last_name || '',
    avatar_url: photo_url || '',
    auth_provider: 'telegram' as const
  }
}
