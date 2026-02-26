export type AsdevUtmContent = 'footer' | 'asdev_page';

export const ASDEV_SIGNATURE_TEXT = 'ASDEV | Alireza Safaei — علیرضا صفایی';
export const ASDEV_PORTFOLIO_LABEL = 'پورتفولیو و ارتباط: alirezasafaeisystems.ir';
export const ASDEV_PORTFOLIO_URL = 'https://alirezasafaeisystems.ir/';
export const ASDEV_TELEGRAM_LABEL = 'تلگرام: @asdevsystems';
export const ASDEV_TELEGRAM_URL = 'https://t.me/asdevsystems';
export const ASDEV_SUPPORT_CHAT_LABEL = 'گروه پشتیبانی تلگرام';
export const ASDEV_SUPPORT_CHAT_URL = 'https://t.me/asdevsystems_chat';
export const ASDEV_GITHUB_LABEL = 'GitHub: @parsairaniiidev';
export const ASDEV_GITHUB_URL = 'https://github.com/parsairaniiidev';

const NETWORK_LINKS = [
  {
    key: 'portfolio',
    label: 'پورتفولیو و راه‌های ارتباطی',
    baseUrl: ASDEV_PORTFOLIO_URL,
  },
  {
    key: 'toolbox',
    label: 'جعبه ابزار فارسی (PersianToolbox) — لوکال و امن',
    baseUrl: 'https://persiantoolbox.ir/',
  },
  {
    key: 'audit',
    label: 'Audit IR — بررسی فنی و امنیتی',
    baseUrl: 'https://audit.alirezasafaeisystems.ir/',
  },
] as const;

export function buildAsdevNetworkLinks(utmSource: string, utmContent: AsdevUtmContent) {
  return NETWORK_LINKS.map((item) => {
    const url = new URL(item.baseUrl);
    url.searchParams.set('utm_source', utmSource);
    url.searchParams.set('utm_medium', 'cross_site');
    url.searchParams.set('utm_campaign', 'asdev_network');
    url.searchParams.set('utm_content', utmContent);
    return {
      ...item,
      href: url.toString(),
    };
  });
}
