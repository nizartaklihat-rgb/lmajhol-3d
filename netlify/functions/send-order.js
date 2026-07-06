// Netlify Function: Send order to Telegram Bot
// Environment variables needed in Netlify dashboard:
// TELEGRAM_BOT_TOKEN - Your Telegram bot token from @BotFather
// TELEGRAM_CHAT_ID - Your chat/group ID

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { message, token, chatId } = JSON.parse(event.body);

    // Use provided token/chatId or environment variables
    const botToken = token || process.env.TELEGRAM_BOT_TOKEN;
    const chat_id = chatId || process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chat_id) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Telegram configuration missing' }),
      };
    }

    // Send to Telegram
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Telegram API error', details: data }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
