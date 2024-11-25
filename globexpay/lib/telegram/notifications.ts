interface SendMessageParams {
  chat_id: string | number
  text: string
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2'
}

export async function sendTelegramMessage({ chat_id, text, parse_mode = 'HTML' }: SendMessageParams) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is not defined')
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id,
        text,
        parse_mode,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Telegram API Error: ${JSON.stringify(error)}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending Telegram message:', error)
    throw error
  }
}

export function formatLogoutMessage(username: string): string {
  const timestamp = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })
  
  return `
🔐 <b>Выход из системы</b>

👤 Пользователь: <code>${username}</code>
🕒 Время: <code>${timestamp}</code>

ℹ️ Если это были не вы, немедленно свяжитесь с поддержкой!
  `.trim()
}
