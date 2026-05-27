const token = '8722528839:AAHF0GP0czrF9VoO8AMmiCylJALg9gEjJSI';
const chatId = '6765979309';

const message = `
🎉 *Tabriklaymiz!*
━━━━━━━━━━━━━━━
Bot muvaffaqiyatli ulandi! Endi barcha yangi arizalar shu yerga keladi.
`;

async function test() {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });
    const data = await res.json();
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
