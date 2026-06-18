# PersianToolbox Mobile App

اپلیکیشن موبایل جعبه ابزار فارسی

## ویژگی‌ها

- **ابزارهای مالی**: محاسبه وام، حقوق، سود بانکی، مبدل ارز
- **ابزارهای PDF**: ادغام، تقسیم، فشرده‌سازی، تبدیل فرمت
- **ابزارهای تصویر**: فشرده‌سازی، تبدیل فرمت، حذف پس‌زمینه
- **ابزارهای تاریخ**: تبدیل تاریخ شمسی، میلادی، قمری
- **پشتیبانی آفلاین**: بیشتر ابزارها بدون اینترنت کار می‌کنند
- **ذخیره علاقه‌مندی‌ها**: ابزارهای مورد علاقه را ذخیره کنید

## نصب و راه‌اندازی

### پیش‌نیازها

- Node.js 18+
- React Native CLI
- Android Studio یا Xcode

### نصب وابستگی‌ها

```bash
cd mobile-app
npm install
```

### اجرای اپلیکیشن

```bash
# Android
npm run android

# iOS
npm run ios
```

## ساختار پروژه

```
mobile-app/
├── src/
│   ├── screens/          # صفحات اپلیکیشن
│   │   ├── HomeScreen.tsx
│   │   ├── ToolsScreen.tsx
│   │   ├── FavoritesScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── ToolDetailScreen.tsx
│   ├── services/         # سرویس‌ها
│   │   ├── storage.ts
│   │   └── notifications.ts
│   ├── hooks/            # هوک‌های سفارشی
│   │   └── useAsyncStorage.ts
│   ├── utils/            # ابزارهای کمکی
│   │   └── format.ts
│   ├── config/           # تنظیمات
│   │   ├── theme.tsx
│   │   └── constants.ts
│   └── App.tsx           # فایل اصلی
├── __tests__/            # تست‌ها
├── android/              # پروژه Android
├── ios/                  # پروژه iOS
└── package.json
```

## فناوری‌ها

- **React Native 0.73**: فریمورک اصلی
- **React Navigation 6**: ناوبری
- **Async Storage**: ذخیره‌سازی محلی
- **Notifee**: اعلان‌ها
- **Reanimated**: انیمیشن‌ها
- **Gesture Handler**: مدیریت لمس

## تست‌ها

```bash
npm test
```

## ساخت APK

```bash
cd android
./gradlew assembleRelease
```

## ساخت IPA

```bash
cd ios
xcodebuild -workspace PersianToolbox.xcworkspace -scheme PersianToolbox -configuration Release
```
