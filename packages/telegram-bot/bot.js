const TelegramBot = require('node-telegram-bot-api');
const https = require('https');
const http = require('http');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SITE_URL = 'https://persiantoolbox.ir';

if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is required');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

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

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from?.first_name || 'کاربر';

  bot.sendMessage(
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

🌐 *وب‌سایت:* [persiantoolbox.ir](${SITE_URL})
  `,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🌐 بازدید از سایت', url: SITE_URL }],
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
});

bot.onText(/\/tools/, (msg) => {
  const chatId = msg.chat.id;

  let text = '🧰 *لیست ابزارها:*\n\n';
  CATEGORIES.forEach((cat) => {
    text += `${cat.icon} *${cat.name}*\n`;
    const tools = TOOLS.filter((t) => t.path.startsWith(cat.path));
    tools.forEach((t) => {
      text += `  /${t.cmd} - ${t.name}\n`;
    });
    text += '\n';
  });

  bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
});

bot.onText(/\/salary/, (msg) => {
  sendToolLink(msg.chat.id, 'salary');
});

bot.onText(/\/tax/, (msg) => {
  sendToolLink(msg.chat.id, 'tax');
});

bot.onText(/\/loan/, (msg) => {
  sendToolLink(msg.chat.id, 'loan');
});

bot.onText(/\/interest/, (msg) => {
  sendToolLink(msg.chat.id, 'interest');
});

bot.onText(/\/currency/, (msg) => {
  sendToolLink(msg.chat.id, 'currency');
});

bot.onText(/\/pdf/, (msg) => {
  sendToolLink(msg.chat.id, 'pdf');
});

bot.onText(/\/image/, (msg) => {
  sendToolLink(msg.chat.id, 'image');
});

bot.onText(/\/text/, (msg) => {
  sendToolLink(msg.chat.id, 'text');
});

bot.onText(/\/date/, (msg) => {
  sendToolLink(msg.chat.id, 'date');
});

bot.onText(/\/calendar/, (msg) => {
  sendToolLink(msg.chat.id, 'calendar');
});

bot.onText(/\/qrcode/, (msg) => {
  sendToolLink(msg.chat.id, 'qrcode');
});

bot.onText(/\/hash/, (msg) => {
  sendToolLink(msg.chat.id, 'hash');
});

bot.onText(/\/json/, (msg) => {
  sendToolLink(msg.chat.id, 'json');
});

bot.onText(/\/base64/, (msg) => {
  sendToolLink(msg.chat.id, 'base64');
});

bot.onText(/\/bgremove/, (msg) => {
  sendToolLink(msg.chat.id, 'bgremove');
});

bot.onText(/\/password/, (msg) => {
  sendToolLink(msg.chat.id, 'password');
});

bot.on('callback_query', (query) => {
  const data = query.data;
  const chatId = query.message?.chat.id;

  if (!chatId) return;

  if (data.startsWith('tool:')) {
    const toolCmd = data.replace('tool:', '');
    sendToolLink(chatId, toolCmd);
  } else if (data.startsWith('cat:')) {
    const catPath = data.replace('cat:', '');
    const cat = CATEGORIES.find((c) => c.path.includes(catPath));
    if (cat) {
      bot.sendMessage(
        chatId,
        `${cat.icon} *${cat.name}*\n\n🌐 [بازدید از صفحه](${SITE_URL}${cat.path})`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: '🌐 بازدید', url: `${SITE_URL}${cat.path}` }]],
          },
        },
      );
    }
  }

  bot.answerCallbackQuery(query.id);
});

function sendToolLink(chatId, toolCmd) {
  const tool = TOOLS.find((t) => t.cmd === toolCmd);
  if (!tool) {
    bot.sendMessage(chatId, 'ابزار یافت نشد.');
    return;
  }

  bot.sendMessage(
    chatId,
    `${tool.icon} *${tool.name}*\n\n🌐 [استفاده از ابزار](${SITE_URL}${tool.path})`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: `🌐 ${tool.name}`, url: `${SITE_URL}${tool.path}` }]],
      },
    },
  );
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

async function fetchCurrencyRates() {
  try {
    const data = await fetchUrl(`${SITE_URL}/api/market`);
    return JSON.parse(data);
  } catch {
    return null;
  }
}

bot.onText(/\/rates/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '⏳ در حال دریافت نرخ ارز...');

  const rates = await fetchCurrencyRates();
  if (!rates) {
    bot.sendMessage(chatId, 'خطا در دریافت نرخ ارز.');
    return;
  }

  let text = '💱 *نرخ ارز:*\n\n';
  if (rates.currency) {
    Object.entries(rates.currency).forEach(([key, val]) => {
      if (val && val.buy) {
        text += `*${key}*: خرید ${val.buy} | فروش ${val.sell}\n`;
      }
    });
  }

  bot.sendMessage(chatId, text || 'اطلاعات نرخ ارز موجود نیست.', { parse_mode: 'Markdown' });
});

console.log('🧰 PersianToolbox Telegram Bot started');
console.log(`🌐 Site: ${SITE_URL}`);
