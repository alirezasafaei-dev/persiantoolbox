const BASE_URL = 'https://persiantoolbox.ir';

const TOOLS = [
  // PDF Tools
  {
    id: 'pdf-to-text',
    name: 'تبدیل PDF به متن',
    desc: 'استخراج متن از PDF',
    icon: '📝',
    path: '/pdf-tools/convert/pdf-to-text',
    category: 'pdf',
  },
  {
    id: 'pdf-to-word',
    name: 'تبدیل PDF به Word',
    desc: 'تبدیل PDF به سند Word',
    icon: '📄',
    path: '/pdf-tools/convert/pdf-to-word',
    category: 'pdf',
  },
  {
    id: 'word-to-pdf',
    name: 'تبدیل Word به PDF',
    desc: 'تبدیل سند Word به PDF',
    icon: '📄',
    path: '/pdf-tools/convert/word-to-pdf',
    category: 'pdf',
  },
  {
    id: 'image-to-pdf',
    name: 'تبدیل عکس به PDF',
    desc: 'تبدیل تصاویر به PDF',
    icon: '🖼️',
    path: '/pdf-tools/convert/image-to-pdf',
    category: 'pdf',
  },
  {
    id: 'pdf-to-image',
    name: 'تبدیل PDF به عکس',
    desc: 'تبدیل صفحات PDF به تصویر',
    icon: '📷',
    path: '/pdf-tools/convert/pdf-to-image',
    category: 'pdf',
  },
  {
    id: 'compress-pdf',
    name: 'فشرده‌سازی PDF',
    desc: 'کاهش حجم فایل PDF',
    icon: '🗜️',
    path: '/pdf-tools/compress/compress-pdf',
    category: 'pdf',
  },
  {
    id: 'merge-pdf',
    name: 'ادغام PDF',
    desc: 'ادغام چند فایل PDF',
    icon: '➕',
    path: '/pdf-tools/merge/merge-pdf',
    category: 'pdf',
  },
  {
    id: 'split-pdf',
    name: 'تقسیم PDF',
    desc: 'تقسیم PDF به صفحات جداگانه',
    icon: '✂️',
    path: '/pdf-tools/split/split-pdf',
    category: 'pdf',
  },
  {
    id: 'delete-pages',
    name: 'حذف صفحات PDF',
    desc: 'حذف صفحات انتخابی',
    icon: '🧹',
    path: '/pdf-tools/edit/delete-pages',
    category: 'pdf',
  },
  {
    id: 'rotate-pages',
    name: 'چرخش صفحات PDF',
    desc: 'چرخاندن صفحات',
    icon: '🔄',
    path: '/pdf-tools/edit/rotate-pages',
    category: 'pdf',
  },
  {
    id: 'reorder-pages',
    name: 'جابجایی صفحات',
    desc: 'تغییر ترتیب صفحات',
    icon: '↔️',
    path: '/pdf-tools/edit/reorder-pages',
    category: 'pdf',
  },
  {
    id: 'decrypt-pdf',
    name: 'حذف رمز PDF',
    desc: 'حذف رمز عبور PDF',
    icon: '🔓',
    path: '/pdf-tools/security/decrypt-pdf',
    category: 'pdf',
  },
  {
    id: 'encrypt-pdf',
    name: 'رمزگذاری PDF',
    desc: 'افزودن رمز به PDF',
    icon: '🔒',
    path: '/pdf-tools/security/encrypt-pdf',
    category: 'pdf',
  },
  {
    id: 'add-watermark',
    name: 'افزودن واترمارک',
    desc: 'افزودن متن به PDF',
    icon: '🖋️',
    path: '/pdf-tools/watermark/add-watermark',
    category: 'pdf',
  },
  {
    id: 'add-page-numbers',
    name: 'شماره صفحه',
    desc: 'افزودن شماره صفحه',
    icon: '🔢',
    path: '/pdf-tools/paginate/add-page-numbers',
    category: 'pdf',
  },
  {
    id: 'extract-pages',
    name: 'استخراج صفحات',
    desc: 'استخراج صفحات خاص',
    icon: '📑',
    path: '/pdf-tools/extract/extract-pages',
    category: 'pdf',
  },
  {
    id: 'extract-text',
    name: 'استخراج متن',
    desc: 'استخراج متن کامل',
    icon: '📋',
    path: '/pdf-tools/extract/extract-text',
    category: 'pdf',
  },

  // Image Tools
  {
    id: 'bg-remover',
    name: 'حذف پس‌زمینه',
    desc: 'حذف خودکار پس‌زمینه',
    icon: '🖼️',
    path: '/image-tools/image-background-remover',
    category: 'image',
  },
  {
    id: 'resize-image',
    name: 'تغییر اندازه',
    desc: 'تغییر ابعاد تصویر',
    icon: '📐',
    path: '/image-tools/resize-image',
    category: 'image',
  },
  {
    id: 'rotate-image',
    name: 'چرخش تصویر',
    desc: 'چرخاندن تصویر',
    icon: '🔄',
    path: '/image-tools/rotate-image',
    category: 'image',
  },
  {
    id: 'format-converter',
    name: 'تبدیل فرمت',
    desc: 'تبدیل فرمت تصویر',
    icon: '🔄',
    path: '/image-tools/image-format-converter',
    category: 'image',
  },
  {
    id: 'text-on-image',
    name: 'متن روی تصویر',
    desc: 'افزودن متن به تصویر',
    icon: '✏️',
    path: '/image-tools/text-on-image',
    category: 'image',
  },

  // Finance Tools
  {
    id: 'salary',
    name: 'محاسبه حقوق',
    desc: 'محاسبه حقوق و دستمزد',
    icon: '💰',
    path: '/salary',
    category: 'finance',
  },
  {
    id: 'tax',
    name: 'محاسبه مالیات',
    desc: 'محاسبه مالیات بر درآمد',
    icon: '🧾',
    path: '/tools/tax-calculator',
    category: 'finance',
  },
  {
    id: 'loan',
    name: 'محاسبه وام',
    desc: 'محاسبه اقساط وام',
    icon: '🏦',
    path: '/loan',
    category: 'finance',
  },
  {
    id: 'interest',
    name: 'سود بانکی',
    desc: 'محاسبه سود سپرده',
    icon: '📈',
    path: '/interest',
    category: 'finance',
  },
  {
    id: 'currency',
    name: 'مبدل ارز',
    desc: 'تبدیل ارزهای مختلف',
    icon: '💱',
    path: '/tools/currency-converter',
    category: 'finance',
  },
  {
    id: 'inflation',
    name: 'تورم',
    desc: 'محاسبه تورم',
    icon: '📊',
    path: '/tools/inflation-calculator',
    category: 'finance',
  },
  {
    id: 'investment',
    name: 'سرمایه‌گذاری',
    desc: 'محاسبه سرمایه‌گذاری',
    icon: '💎',
    path: '/tools/investment-calculator',
    category: 'finance',
  },
  {
    id: 'insurance',
    name: 'بیمه',
    desc: 'محاسبه حق بیمه',
    icon: '🏥',
    path: '/tools/insurance-calculator',
    category: 'finance',
  },
  {
    id: 'bonus',
    name: 'عیدی',
    desc: 'محاسبه عیدی و پاداش',
    icon: '🎁',
    path: '/tools/bonus-calculator',
    category: 'finance',
  },
  {
    id: 'severance',
    name: 'سنوات',
    desc: 'محاسبه سنوات خدمت',
    icon: '📋',
    path: '/tools/severance-calculator',
    category: 'finance',
  },
  {
    id: 'leave',
    name: 'مرخصی',
    desc: 'محاسبه مرخصی',
    icon: '🏖️',
    path: '/tools/leave-calculator',
    category: 'finance',
  },
  {
    id: 'overtime',
    name: 'اضافه کاری',
    desc: 'محاسبه اضافه کاری',
    icon: '⏰',
    path: '/tools/overtime-calculator',
    category: 'finance',
  },
  {
    id: 'retirement',
    name: 'بازنشستگی',
    desc: 'محاسبه بازنشستگی',
    icon: '👴',
    path: '/tools/retirement-calculator',
    category: 'finance',
  },

  // Text Tools
  {
    id: 'json-formatter',
    name: 'فرمت JSON',
    desc: 'فرمت‌دهی کد JSON',
    icon: '📋',
    path: '/tools/json-formatter',
    category: 'text',
  },
  {
    id: 'base64',
    name: 'Base64',
    desc: 'تبدیل به/از Base64',
    icon: '🔐',
    path: '/tools/base64-tool',
    category: 'text',
  },
  {
    id: 'hash',
    name: 'هش',
    desc: 'تولید هش MD5/SHA',
    icon: '🔐',
    path: '/tools/hash-generator',
    category: 'text',
  },
  {
    id: 'word-counter',
    name: 'شمارش کلمات',
    desc: 'شمارش کلمات و کاراکتر',
    icon: '🔢',
    path: '/tools/word-counter',
    category: 'text',
  },
  {
    id: 'case-converter',
    name: 'تبدیل حروف',
    desc: 'تبدیل بزرگ/کوچک',
    icon: '🔤',
    path: '/tools/case-converter',
    category: 'text',
  },
  {
    id: 'remove-spaces',
    name: 'حذف فاصله',
    desc: 'حذف فاصله‌های اضافی',
    icon: '✂️',
    path: '/tools/remove-spaces',
    category: 'text',
  },
  {
    id: 'number-converter',
    name: 'تبدیل اعداد',
    desc: 'تبدیل اعداد فارسی/انگلیسی',
    icon: '🔢',
    path: '/tools/number-converter',
    category: 'text',
  },
  {
    id: 'resume',
    name: 'رزومه‌ساز',
    desc: 'ساخت رزومه آنلاین',
    icon: '📝',
    path: '/text-tools/resume-builder',
    category: 'text',
  },
  {
    id: 'signature',
    name: 'امضای دیجیتال',
    desc: 'ساخت امضا آنلاین',
    icon: '✍️',
    path: '/text-tools/signature',
    category: 'text',
  },

  // Date Tools
  {
    id: 'persian-calendar',
    name: 'تقویم شمسی',
    desc: 'تقویم شمسی آنلاین',
    icon: '📅',
    path: '/date-tools/persian-calendar',
    category: 'date',
  },
  {
    id: 'date-diff',
    name: 'تفاوت تاریخ',
    desc: 'محاسبه تفاوت دو تاریخ',
    icon: '📆',
    path: '/date-tools/date-difference',
    category: 'date',
  },
  {
    id: 'shamsi-gregorian',
    name: 'تبدیل تاریخ',
    desc: 'تبدیل شمسی به میلادی',
    icon: '🔄',
    path: '/date-tools/shamsi-gregorian',
    category: 'date',
  },

  // Validation
  {
    id: 'image-to-qr',
    name: 'تصویر به QR',
    desc: 'تبدیل تصویر به QR Code',
    icon: '📱',
    path: '/validation-tools/image-to-qr',
    category: 'validation',
  },
  {
    id: 'password',
    name: 'رمز عبور',
    desc: 'تولید رمز عبور قوی',
    icon: '🔐',
    path: '/validation-tools/persian-password',
    category: 'validation',
  },
];

const POPULAR_IDS = [
  'salary',
  'tax',
  'pdf-to-text',
  'currency',
  'bg-remover',
  'json-formatter',
  'loan',
  'interest',
  'persian-calendar',
  'hash',
];

const CATEGORY_LABELS = {
  pdf: 'PDF',
  image: 'تصویر',
  finance: 'مالی',
  text: 'متنی',
  date: 'تاریخ',
  validation: 'اعتبارسنجی',
};

function getRecentTools() {
  return new Promise((resolve) => {
    chrome.storage?.local?.get('recentTools', (data) => {
      resolve(data.recentTools || []);
    }) || resolve([]);
  });
}

function addRecentTool(toolId) {
  getRecentTools().then((recent) => {
    const updated = [toolId, ...recent.filter((id) => id !== toolId)].slice(0, 8);
    chrome.storage?.local?.set({ recentTools: updated });
  });
}

function createToolItem(tool) {
  const a = document.createElement('a');
  a.className = 'tool-item';
  a.href = `${BASE_URL}${tool.path}`;
  a.target = '_blank';
  a.dataset.id = tool.id;
  a.dataset.name = tool.name;
  a.dataset.desc = tool.desc;

  a.innerHTML = `
    <div class="icon">${tool.icon}</div>
    <div class="info">
      <div class="name">
        <span class="category-badge category-${tool.category}">${CATEGORY_LABELS[tool.category]}</span>
        ${tool.name}
      </div>
      <div class="desc">${tool.desc}</div>
    </div>
  `;

  a.addEventListener('click', () => addRecentTool(tool.id));
  return a;
}

function renderTools(container, tools) {
  container.innerHTML = '';
  if (tools.length === 0) {
    container.innerHTML = '<div class="no-results">ابزاری یافت نشد</div>';
    return;
  }
  tools.forEach((tool) => container.appendChild(createToolItem(tool)));
}

function filterTools(query) {
  if (!query) return TOOLS;
  const q = query.toLowerCase();
  return TOOLS.filter(
    (t) =>
      t.name.includes(q) ||
      t.desc.includes(q) ||
      t.id.includes(q) ||
      CATEGORY_LABELS[t.category].includes(q),
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search');
  const recentSection = document.getElementById('recent');
  const recentList = document.getElementById('recent-list');
  const popularList = document.getElementById('popular-list');
  const toolList = document.getElementById('tool-list');

  const popularTools = POPULAR_IDS.map((id) => TOOLS.find((t) => t.id === id)).filter(Boolean);
  renderTools(popularList, popularTools);
  renderTools(toolList, TOOLS);

  getRecentTools().then((recentIds) => {
    if (recentIds.length > 0) {
      const recentTools = recentIds.map((id) => TOOLS.find((t) => t.id === id)).filter(Boolean);
      renderTools(recentList, recentTools);
      recentSection.style.display = 'block';
    }
  });

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    const filtered = filterTools(query);
    renderTools(toolList, filtered);

    if (query) {
      recentSection.style.display = 'none';
    } else {
      getRecentTools().then((recentIds) => {
        if (recentIds.length > 0) recentSection.style.display = 'block';
      });
    }
  });

  searchInput.focus();
});
