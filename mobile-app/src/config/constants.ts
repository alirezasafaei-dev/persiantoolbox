import {Platform} from 'react-native';

export const API_CONFIG = {
  baseUrl: Platform.select({
    ios: 'http://localhost:3000',
    android: 'http://10.0.2.2:3000',
    default: 'https://persiantoolbox.ir',
  }),
  timeout: 10000,
};

export const STORAGE_KEYS = {
  FAVORITES: '@favorites',
  HISTORY: '@history',
  SETTINGS: '@settings',
  CACHE: '@cache',
};

export const TOOL_CATEGORIES = [
  {id: 'finance', name: 'مالی', icon: '💰'},
  {id: 'pdf', name: 'PDF', icon: '📄'},
  {id: 'image', name: 'تصویر', icon: '🖼️'},
  {id: 'date', name: 'تاریخ', icon: '📅'},
  {id: 'text', name: 'متنی', icon: '📝'},
];

export const CURRENCIES = [
  {code: 'USD', name: 'دلار آمریکا', rate: 1},
  {code: 'EUR', name: 'یورو', rate: 0.92},
  {code: 'GBP', name: 'پوند انگلیس', rate: 0.79},
  {code: 'AED', name: 'درهم امارات', rate: 3.67},
  {code: 'TRY', name: 'لیر ترکیه', rate: 32.5},
  {code: 'IRR', name: 'تومان ایران', rate: 42000},
];
