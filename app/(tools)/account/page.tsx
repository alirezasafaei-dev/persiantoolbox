'use client';

import {useState} from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';

export default function AccountPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (isRegister) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(true);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6 text-center">
            {isRegister ? 'ایجاد اکانت' : 'ورود به اکانت'}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <Input
                label="نام"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="نام خود را وارد کنید"
              />
            )}
            <Input
              label="ایمیل"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
            />
            <Input
              label="رمز عبور"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور"
            />
            <Button fullWidth type="submit">
              {isRegister ? 'ایجاد اکانت' : 'ورود'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-[var(--color-primary)] hover:underline">
              {isRegister ? 'حساب دارید؟ وارد شوید' : 'حساب ندارید؟ ثبت نام کنید'}
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-8">
        حساب کاربری
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            اطلاعات شخصی
          </h2>
          <div className="space-y-4">
            <Input label="نام" value="کاربر نمونه" readOnly />
            <Input label="ایمیل" value="user@example.com" readOnly />
            <Button variant="secondary" fullWidth>
              ویرایش اطلاعات
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            تنظیمات امنیتی
          </h2>
          <div className="space-y-4">
            <Button variant="secondary" fullWidth>
              تغییر رمز عبور
            </Button>
            <Button variant="secondary" fullWidth>
              فعال‌سازی احراز هویت دو مرحله‌ای
            </Button>
            <Button variant="danger" fullWidth>
              حذف اکانت
            </Button>
          </div>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button variant="secondary" onClick={() => setIsLoggedIn(false)}>
          خروج از حساب
        </Button>
      </div>
    </div>
  );
}
