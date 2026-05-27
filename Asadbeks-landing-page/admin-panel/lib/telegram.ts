export async function sendTelegramNotification(enrollment: {
  full_name: string
  phone: string
  course_name: string
  created_at: string
  source_page: string
  id: string
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId || token === 'your_bot_token_here') {
    console.log('Telegram bot not configured')
    return
  }

  const message = `
✅ <b>ARIZA TASDIQLANDI!</b> ✅
━━━━━━━━━━━━━━━━━━━━

👤 <b>Ism-familiya:</b> ${enrollment.full_name}
📞 <b>Telefon raqam:</b> ${enrollment.phone}
📚 <b>Kurs:</b> ${enrollment.course_name}
⏰ <b>Tasdiqlangan vaqt:</b> ${new Date().toLocaleString('uz-UZ')}

📌 <i>Ushbu o'quvchi admin paneldan muvaffaqiyatli tasdiqlandi.</i> 🚀
`.trim()

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })
  } catch (error) {
    console.error('Telegram xabari yuborishda xato:', error)
  }
}
