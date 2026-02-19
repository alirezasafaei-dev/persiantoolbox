import { Card, ButtonLink, Container } from '@/components/ui';
import { getFeatureHref, getFeatureInfo, type FeatureId } from '@/lib/features/availability';
import { IconShield, IconZap } from '@/shared/ui/icons';

type Props = {
  feature: FeatureId;
};

export default function FeatureDisabledPage({ feature }: Props) {
  const info = getFeatureInfo(feature);
  const supportHref = getFeatureHref('support');

  return (
    <div className="min-h-dvh bg-[var(--surface-0)]">
      <Container className="py-16">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
            <IconShield className="h-3.5 w-3.5 text-[var(--color-primary)]" />
            تجربه آفلاین + حریم خصوصی
          </div>
          <Card className="p-6 md:p-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-[rgb(var(--color-warning-rgb)/0.15)] p-2 text-[var(--color-warning)]">
                <IconZap className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[var(--text-muted)]">Feature: {info.id}</p>
                <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)]">
                  {info.title} در این نسخه غیرفعال است
                </h1>
                <p className="text-[var(--text-secondary)] leading-7">
                  برای حفظ قرارداد آفلاین و جلوگیری از مسیرهای ناقص، این بخش فعلا فعال نشده است. اگر
                  به این قابلیت نیاز دارید، از طریق پشتیبانی به ما خبر دهید.
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  متغیر محیطی مرتبط: {info.envKey} (۱ برای فعال‌سازی محلی)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/" variant="secondary">
                بازگشت به صفحه اصلی
              </ButtonLink>
              <ButtonLink href={supportHref} variant="primary">
                تماس با پشتیبانی
              </ButtonLink>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
