const TOOLS = [
  { cmd: 'salary', name: 'محاسبه حقوق', icon: '💰', path: '/salary' },
  { cmd: 'tax', name: 'محاسبه مالیات', icon: '🧾', path: '/tools/tax-calculator' },
  { cmd: 'loan', name: 'محاسبه وام', icon: '🏦', path: '/loan' },
  { cmd: 'interest', name: 'سود بانکی', icon: '📈', path: '/interest' },
  { cmd: 'currency', name: 'مبدل ارز', icon: '💱', path: '/tools/currency-converter' },
  { cmd: 'pdf', name: 'ابزارهای PDF', icon: '📄', path: '/pdf-tools' },
  { cmd: 'image', name: 'ابزارهای تصویر', icon: '🖼️', path: '/image-tools' },
  { cmd: 'text', name: 'ابزارهای متنی', icon: '📝', path: '/text-tools' },
  { cmd: 'date', name: 'ابزارهای تاریخ', icon: '📅', path: '/date-tools' },
  { cmd: 'calendar', name: 'تقویم شمسی', icon: '📅', path: '/date-tools/persian-calendar' },
  { cmd: 'qrcode', name: 'تولید QR Code', icon: '📱', path: '/validation-tools/image-to-qr' },
  { cmd: 'hash', name: 'تولید هش', icon: '🔐', path: '/tools/hash-generator' },
  { cmd: 'json', name: 'فرمت JSON', icon: '📋', path: '/tools/json-formatter' },
  { cmd: 'base64', name: 'تبدیل Base64', icon: '🔐', path: '/tools/base64-tool' },
  {
    cmd: 'bgremove',
    name: 'حذف پس‌زمینه',
    icon: '🖼️',
    path: '/image-tools/image-background-remover',
  },
  {
    cmd: 'password',
    name: 'تولید رمز عبور',
    icon: '🔑',
    path: '/validation-tools/persian-password',
  },
];

const CATEGORIES = [
  { name: 'ابزارهای PDF', icon: '📄', path: '/pdf-tools' },
  { name: 'ابزارهای تصویر', icon: '🖼️', path: '/image-tools' },
  { name: 'ابزارهای مالی', icon: '💰', path: '/salary' },
  { name: 'ابزارهای متنی', icon: '📝', path: '/text-tools' },
  { name: 'ابزارهای تاریخ', icon: '📅', path: '/date-tools' },
  { name: 'ابزارهای اعتبارسنجی', icon: '✅', path: '/validation-tools' },
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (path === '/webhook' && method === 'POST') {
      return handleWebhook(request, env);
    }

    if (path === '/health' || path === '/') {
      return new Response(JSON.stringify({ status: 'ok', bot: 'persiantoolbox' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (path === '/setup-webhook' && method === 'GET') {
      return setupWebhook(request, env);
    }

    return new Response('Not found', { status: 404 });
  },
};

async function handleWebhook(request, env) {
  try {
    const update = await request.json();
    await processUpdate(update, env);
    return new Response('ok');
  } catch (err) {
    console.error('webhook error:', err);
    return new Response('ok');
  }
}

async function processUpdate(update, env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  const siteUrl = env.SITE_URL ?? 'https://persiantoolbox.ir';

  const msg = update.message;
  const callbackQuery = update.callback_query;

  if (msg?.text) {
    await handleCommand(msg, token, siteUrl);
  }

  if (callbackQuery) {
    await handleCallback(callbackQuery, token, siteUrl);
  }
}

async function handleCommand(msg, token, siteUrl) {
  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const name = msg.from?.first_name || 'کاربر';

  if (text === '/start') {
    await sendMessage(
      token,
      chatId,
      `
🧰 *سلام ${name}!* به جعبه ابزار فارسی خوش آمدید.

بیش از ۵۵ ابزار رایگان برای کار و زندگی.

📌 *دستورات سریع:*
 /tools - لیست همه ابزارها
 /salary - محاسبه حقوق
 /tax - محاسبه مالیات
 /loan - محاسبه وام
 /currency - مبدل ارز
 /pdf - ابزارهای PDF

🌐 *وب‌سایت:* [persiantoolbox.ir](${siteUrl})
    `,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🌐 بازدید از سایت', url: siteUrl }],
            [
              { text: '💰 محاسبه حقوق', callback_data: 'tool:salary' },
              { text: '🧾 محاسبه مالیات', callback_data: 'tool:tax' },
            ],
            [
              { text: '🏦 محاسبه وام', callback_data: 'tool:loan' },
              { text: '💱 مبدل ارز', callback_data: 'tool:currency' },
            ],
            [
              { text: '📄 ابزارهای PDF', callback_data: 'cat:pdf' },
              { text: '🖼️ ابزارهای تصویر', callback_data: 'cat:image' },
            ],
          ],
        },
      },
    );
    return;
  }

  if (text === '/tools') {
    let reply = '🧰 *لیست ابزارها:*\n\n';
    for (const cat of CATEGORIES) {
      reply += `${cat.icon} *${cat.name}*\n`;
      for (const tool of TOOLS.filter((t) => t.path.startsWith(cat.path))) {
        reply += `  /${tool.cmd} - ${tool.name}\n`;
      }
      reply += '\n';
    }
    await sendMessage(token, chatId, reply, { parse_mode: 'Markdown' });
    return;
  }

  if (text === '/rates') {
    await sendMessage(token, chatId, '⏳ در حال دریافت نرخ ارز...');
    const rates = await fetchCurrencyRates(siteUrl);
    if (!rates) {
      await sendMessage(token, chatId, 'خطا در دریافت نرخ ارز.');
      return;
    }
    let reply = '💱 *نرخ ارز:*\n\n';
    if (rates.currency) {
      for (const [key, val] of Object.entries(rates.currency)) {
        if (val?.buy) {
          reply += `*${key}*: خرید ${val.buy} | فروش ${val.sell}\n`;
        }
      }
    }
    await sendMessage(token, chatId, reply || 'اطلاعات نرخ ارز موجود نیست.', {
      parse_mode: 'Markdown',
    });
    return;
  }

  const toolCmd = text.replace('/', '');
  const tool = TOOLS.find((t) => t.cmd === toolCmd);
  if (tool) {
    await sendToolLink(token, chatId, tool, siteUrl);
    return;
  }
}

async function handleCallback(query, token, siteUrl) {
  const chatId = query.message?.chat.id;
  if (!chatId) return;

  const data = query.data;

  if (data.startsWith('tool:')) {
    const toolCmd = data.replace('tool:', '');
    const tool = TOOLS.find((t) => t.cmd === toolCmd);
    if (tool) {
      await sendToolLink(token, chatId, tool, siteUrl);
    }
  } else if (data.startsWith('cat:')) {
    const catPath = data.replace('cat:', '');
    const cat = CATEGORIES.find((c) => c.path.includes(catPath));
    if (cat) {
      await sendMessage(
        token,
        chatId,
        `${cat.icon} *${cat.name}*\n\n🌐 [بازدید از صفحه](${siteUrl}${cat.path})`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: '🌐 بازدید', url: `${siteUrl}${cat.path}` }]],
          },
        },
      );
    }
  }

  await answerCallbackQuery(token, query.id);
}

async function sendToolLink(token, chatId, tool, siteUrl) {
  await sendMessage(
    token,
    chatId,
    `${tool.icon} *${tool.name}*\n\n🌐 [استفاده از ابزار](${siteUrl}${tool.path})`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: `🌐 ${tool.name}`, url: `${siteUrl}${tool.path}` }]],
      },
    },
  );
}

async function fetchCurrencyRates(siteUrl) {
  try {
    const res = await fetch(`${siteUrl}/api/market`);
    return await res.json();
  } catch {
    return null;
  }
}

async function sendMessage(token, chatId, text, extra = {}) {
  const payload = { chat_id: chatId, text, ...extra };
  await telegramApi(token, 'sendMessage', payload);
}

async function answerCallbackQuery(token, callbackQueryId) {
  await telegramApi(token, 'answerCallbackQuery', { callback_query_id: callbackQueryId });
}

async function telegramApi(token, method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`telegram API ${method} failed:`, body);
  }
  return res;
}

async function setupWebhook(request, env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  const secret = env.TELEGRAM_SECRET_TOKEN;
  const workerUrl = env.WORKER_URL ?? `https://${request.headers.get('host')}`;
  const webhookUrl = `${workerUrl}/webhook`;

  const body = { url: webhookUrl };
  if (secret) {
    body.secret_token = secret;
  }

  const res = await telegramApi(token, 'setWebhook', body);
  const result = await res.json();

  return new Response(JSON.stringify(result, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}
