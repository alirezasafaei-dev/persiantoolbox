'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card } from '@/components/ui';

export default function CheckoutPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const confirmPayment = async () => {
    setStatus('loading');
    const response = await fetch('/api/subscription/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkoutId: params.id }),
    });
    if (!response.ok) {
      setStatus('error');
      return;
    }
    setStatus('done');
    setTimeout(() => router.push('/account'), 800);
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <Card className="p-6 max-w-md w-full space-y-4">
        <div className="text-xl font-black text-[var(--text-primary)]">پرداخت آزمایشی</div>
        <p className="text-sm text-[var(--text-muted)]">
          این صفحه شبیه‌ساز پرداخت است و برای تست MVP استفاده می‌شود. پس از اتصال به درگاه واقعی،
          این بخش جایگزین خواهد شد.
        </p>
        <Button type="button" onClick={confirmPayment} isLoading={status === 'loading'}>
          تایید پرداخت
        </Button>
        {status === 'done' && (
          <div className="text-sm text-[var(--color-success)]">پرداخت با موفقیت ثبت شد.</div>
        )}
        {status === 'error' && (
          <div className="text-sm text-[var(--color-danger)]">خطا در تایید پرداخت.</div>
        )}
      </Card>
    </div>
  );
}
