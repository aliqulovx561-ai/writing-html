// Telegram bot API handler for Vercel serverless function

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const testData = req.body;
    
    // Get Telegram bot token and chat ID from environment variables
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
      console.error('Telegram bot token or chat ID not configured');
      return res.status(500).json({ error: 'Telegram configuration missing' });
    }

    // Format message for Telegram
    const message = formatTelegramMessage(testData);
    
    // Send message to Telegram
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const result = await telegramResponse.json();
    
    if (!telegramResponse.ok) {
      console.error('Telegram API error:', result);
      return res.status(500).json({ error: 'Failed to send message to Telegram' });
    }

    res.status(200).json({ success: true, message: 'Answers sent to Telegram' });
  } catch (error) {
    console.error('Error in Telegram handler:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function formatTelegramMessage(testData) {
  const timestamp = new Date(testData.timestamp).toLocaleString();
  
  let message = `<b>📝 IELTS Writing Test Submitted</b>\n\n`;
  message += `⏰ <b>Timestamp:</b> ${timestamp}\n`;
  message += `⏱️ <b>Duration:</b> ${testData.duration}\n\n`;
  
  message += `<b>📋 TASK 1</b>\n`;
  message += `<b>Question:</b>\n${testData.task1.question || 'Not provided'}\n\n`;
  message += `<b>Answer:</b>\n${testData.task1.answer || 'No answer provided'}\n\n`;
  message += `<b>Word Count:</b> ${testData.task1.wordCount}\n\n`;
  
  message += `<b>📝 TASK 2</b>\n`;
  message += `<b>Question:</b>\n${testData.task2.question || 'Not provided'}\n\n`;
  message += `<b>Answer:</b>\n${testData.task2.answer || 'No answer provided'}\n\n`;
  message += `<b>Word Count:</b> ${testData.task2.wordCount}\n\n`;
  
  message += `---\n<i>Test completed and submitted automatically</i>`;
  
  return message;
}
