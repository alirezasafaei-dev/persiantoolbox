import { Card, ButtonLink } from '@/components/ui';
import { getFeatureHref, getFeatureInfo, type FeatureId } from '@/lib/features/availability';
import { IconShield, IconZap } from '@/shared/ui/icons';

type Props = {
  feature: FeatureId;
};

export default function FeatureDisabledPage({ feature }: Props) {
  const info = getFeatureInfo(feature);
  const supportHref = getFeatureHref('support');

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6">
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
            <p className="text-sm font-semibold text-[var(--text-muted)]">
              قابلیت غیرفعال: {info.title}
            </p>
            <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)]">
              {info.title} در این نسخه غیرفعال است
            </h1>
            <p className="text-[var(--text-secondary)] leading-7">
              برای حفظ قرارداد آفلاین و جلوگیری از مسیرهای ناقص، این بخش فعلا فعال نشده است. اگر به
              این قابلیت نیاز دارید، از طریق پشتیبانی به ما خبر دهید.
            </p>
            <div className="space-y-1 text-xs text-[var(--text-muted)]">
              <p>متغیر محیطی مرتبط: {info.envKey} (۱ برای فعال‌سازی محلی)</p>
              <p className="font-mono text-[11px] text-[var(--text-muted)]/90">
                شناسه قابلیت: {info.id}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <ButtonLink href={supportHref} variant="primary">
            تماس با پشتیبانی
          </ButtonLink>
          <ButtonLink href="/" variant="secondary">
            بازگشت به صفحه اصلی
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
