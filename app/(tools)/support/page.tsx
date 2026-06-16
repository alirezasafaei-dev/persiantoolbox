'use client';

import {useState} from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';

const faqs = [
  {q: 'چطور اکانت بسازم؟', a: 'از بخش حساب کاربری روی "ثبت نام" کلیک کنید.'},
  {q: 'چطور اشتراک بخرم؟', a: 'از بخش اشتراک طرح مورد نظر را انتخاب کنید.'},
  {q: 'آیا ابزارها رایگان هستند؟', a: 'بله، ابزارهای پایه رایگان هستند.'},
  {q: 'چطور پرداخت را لغو کنم؟', a: 'از بخش مدیریت اشتراک لغو کنید.'},
  {q: 'داده‌های من امن هستند؟', a: 'بله، تمام پردازش‌ها در مرورگر انجام می‌شود.'},
];

export default function SupportPage() {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitted(true);
    setTicketSubject('');
    setTicketMessage('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-8">
        پشتیبانی
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              ارسال تیکت
            </h2>
            {ticketSubmitted ? (
              <div className="text-center py-4">
                <p className="text-green-600 font-medium mb-2">
                  تیکت شما با موفقیت ارسال شد
                </p>
                <p className="text-[var(--text-secondary)] text-sm">
                  در اسرع وقت پاسخ خواهیم داد
                </p>
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => setTicketSubmitted(false)}>
                  ارسال تیکت جدید
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <Input
                  label="موضوع"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="موضوع تیکت"
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--text-primary)]">
                    پیام
                  </label>
                  <textarea
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="پیام خود را بنویسید..."
                    className="w-full px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-[var(--radius-md)] text-[var(--text-primary)] min-h-[120px]"
                  />
                </div>
                <Button fullWidth type="submit">
                  ارسال تیکت
                </Button>
              </form>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              تماس با ما
            </h2>
            <div className="space-y-3 text-[var(--text-primary)]">
              <p>📧 ایمیل: support@persiantoolbox.ir</p>
              <p>📞 تلفن: ۰۲۱-XXXXXXXX</p>
              <p>💬 تلگرام: @persiantoolbox</p>
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              سوالات متداول
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="pb-4 border-b border-[var(--border-light)] last:border-0">
                  <h3 className="font-medium text-[var(--text-primary)] mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">{faq.a}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
